import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatMessage from './ChatMessage';
import PropertyCard from './PropertyCard';
import { ChatMessage as ChatMessageType, Property, UserPreferences } from '../types';
import { conversationFlow } from '../utils/conversationFlow';
import { transcribeAudio } from '../services/openai';
import { searchEmbeddings } from '../services/embeddingSearch';
import { generateMockProperties, ENABLE_MOCK_DATA } from '../config/mockData';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [currentStep, setCurrentStep] = useState('greeting');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(conversationFlow.greeting);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, searchResults]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (step: any) => {
    setIsTyping(true);
    setTimeout(() => {
      const message: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: step.message,
        buttons: step.buttons,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    }, 500);
  };

  const handleButtonClick = async (value: string, isMultiSelect?: boolean) => {
    if (isMultiSelect) {
      handleMultiSelectToggle(value);
      return;
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: value,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const nextStep = conversationFlow.processResponse(currentStep, value, preferences);
    setPreferences(nextStep.preferences);
    setCurrentStep(nextStep.step);

    if (nextStep.step === 'search') {
      await performSearch(nextStep.preferences);
    } else if (nextStep.step === 'summary') {
      addBotMessage({
        message: nextStep.summary,
        buttons: [
          { label: '🔍 Search Properties', value: 'search' },
          { label: '✏️ Edit Preferences', value: 'restart' },
        ],
      });
      setCurrentStep('summary_choice');
    } else {
      addBotMessage(conversationFlow[nextStep.step as keyof typeof conversationFlow]);
    }
  };

  const handleMultiSelectToggle = (value: string) => {
    const currentValues = preferences[currentStep as keyof UserPreferences] as string[] || [];
    const updated = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setPreferences({ ...preferences, [currentStep]: updated });
  };

  const handleNext = async () => {
    const currentValues = preferences[currentStep as keyof UserPreferences];
    const label = Array.isArray(currentValues) ? currentValues.join(', ') : 'Next';

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: label,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const nextStep = conversationFlow.getNextStep(currentStep);
    setCurrentStep(nextStep.step);

    if (nextStep.step === 'search') {
      await performSearch(preferences);
    } else if (nextStep.step === 'summary') {
      addBotMessage({
        message: nextStep.summary(preferences),
        buttons: [
          { label: '🔍 Search Properties', value: 'search' },
          { label: '✏️ Edit Preferences', value: 'restart' },
        ],
      });
      setCurrentStep('summary_choice');
    } else {
      addBotMessage(conversationFlow[nextStep.step as keyof typeof conversationFlow]);
    }
  };

  const performSearch = async (prefs: UserPreferences) => {
    setIsTyping(true);
    try {
      let results: Property[] = [];

      if (ENABLE_MOCK_DATA) {
        results = generateMockProperties(prefs);
      } else {
        results = await searchEmbeddings(prefs);
      }

      setSearchResults(results);

      const message: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: results.length > 0
          ? `Found ${results.length} matching properties:`
          : 'No exact matches found. Try relaxing some filters:',
        buttons: results.length === 0 ? [
          { label: 'Remove Amenities Filter', value: 'remove_amenities' },
          { label: 'Widen Budget', value: 'widen_budget' },
          { label: 'Change Location', value: 'change_location' },
          { label: 'Start Over', value: 'restart' },
        ] : undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const transcription = await transcribeAudio(audioBlob);
          setInput(transcription);
        } catch (error) {
          console.error('Transcription error:', error);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setPreferences({});
    setCurrentStep('greeting');
    setSearchResults([]);
    addBotMessage(conversationFlow.greeting);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[700px] bg-black border-2 border-yellow-600 rounded-2xl shadow-2xl flex flex-col z-50">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Dubai Property Assistant</h3>
              <p className="text-xs text-yellow-100">Powered by AI</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onButtonClick={handleButtonClick}
                onNext={handleNext}
                preferences={preferences}
                currentStep={currentStep}
              />
            ))}

            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="bg-zinc-900 border border-yellow-600/30 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => resultsRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
                  aria-label="Previous results"
                >
                  <ChevronLeft size={18} />
                </button>
                <div ref={resultsRef} className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
                  {searchResults.map((property) => (
                    <div key={property.id} className="snap-center w-[320px] flex-shrink-0">
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => resultsRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                  aria-label="Next results"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-yellow-600/30 bg-black">
            <div className="flex items-center space-x-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${
                  isRecording ? 'bg-red-600' : 'bg-zinc-900 border border-yellow-600/50 text-yellow-600'
                } p-2 rounded-lg hover:bg-yellow-600 hover:text-white transition`}
                title="Voice input"
              >
                <Mic size={20} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-900 border border-yellow-600/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
              />

              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-2 rounded-lg hover:scale-105 transition"
              >
                <Send size={20} />
              </button>
            </div>

            <button
              onClick={handleRestart}
              className="w-full mt-2 text-yellow-600 text-sm hover:text-yellow-500 transition"
            >
              Restart Conversation
            </button>
          </div>
        </div>
      )}
    </>
  );
}
