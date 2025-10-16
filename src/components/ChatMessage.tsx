import { ChatMessage as ChatMessageType, UserPreferences } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onButtonClick: (value: string, isMultiSelect?: boolean) => void;
  onNext: () => void;
  preferences: UserPreferences;
  currentStep: string;
}

export default function ChatMessage({
  message,
  onButtonClick,
  onNext,
  preferences,
  currentStep,
}: ChatMessageProps) {
  const isBot = message.role === 'assistant';
  const hasMultiSelect = message.buttons?.some((b) => b.multiSelect);
  const selectedValues = preferences[currentStep as keyof UserPreferences] as string[] || [];

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] ${isBot ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-zinc-900 border border-yellow-600/30 text-white'
              : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white'
          }`}
        >
          <p className="whitespace-pre-line">{message.content}</p>
        </div>

        {message.buttons && message.buttons.length > 0 && (
          <div className="mt-3 space-y-2 w-full">
            <div className="grid grid-cols-1 gap-2">
              {message.buttons.map((button, index) => {
                const isSelected = hasMultiSelect && selectedValues.includes(button.value);
                return (
                  <button
                    key={index}
                    onClick={() => onButtonClick(button.value, button.multiSelect)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all transform hover:scale-[1.02] ${
                      isSelected
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-2 border-yellow-600'
                        : 'bg-black border-2 border-yellow-600 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {button.icon && <span className="mr-2">{button.icon}</span>}
                    {button.label}
                  </button>
                );
              })}
            </div>

            {hasMultiSelect && selectedValues.length > 0 && (
              <button
                onClick={onNext}
                className="w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:scale-[1.02] transition-transform"
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
