import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
            Dubai Premium Properties
          </h1>
          <p className="text-2xl text-zinc-400">
            Find Your Dream Property in Dubai
          </p>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Explore luxury apartments, villas, and penthouses across Dubai's most prestigious locations.
            Our AI-powered assistant helps you find the perfect property that matches your preferences.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-zinc-900 border-2 border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Properties</h3>
              <p className="text-zinc-400">Curated collection of luxury properties in prime locations</p>
            </div>

            <div className="bg-zinc-900 border-2 border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Search</h3>
              <p className="text-zinc-400">Smart recommendations based on your exact preferences</p>
            </div>

            <div className="bg-zinc-900 border-2 border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Results</h3>
              <p className="text-zinc-400">Get matched with properties in seconds</p>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border-2 border-yellow-600/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Start Your Property Search
            </h2>
            <p className="text-zinc-300 mb-4">
              Click the chat icon in the bottom-right corner to begin your personalized property search with our AI assistant.
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <span className="text-lg">👉</span>
              <span className="text-lg font-semibold">Chat widget is ready below</span>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}

export default App;
