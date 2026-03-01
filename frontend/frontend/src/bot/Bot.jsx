import React, { useState, useRef, useEffect } from "react";

export default function Bot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL || "http://3.110.74.87:8000/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );

      const data = await response.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Error connecting to server." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      className={`flex flex-col h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center px-6 py-4 shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h1 className="text-lg md:text-xl font-semibold">
          Smart Curriculum AI 🤖
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] md:max-w-xl px-4 py-3 rounded-2xl shadow-md text-sm md:text-base transition-all duration-300 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : darkMode
                  ? "bg-gray-800 text-gray-200 rounded-bl-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Loader */}
        {loading && (
          <div className="flex justify-start">
            <div
              className={`px-4 py-3 rounded-2xl shadow-md flex space-x-1 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className={`p-4 border-t flex gap-3 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
        }`}
      >
        <input
          type="text"
          className={`flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
            darkMode
              ? "bg-gray-700 text-white placeholder-gray-400"
              : "bg-gray-100 text-gray-900"
          }`}
          placeholder="Ask something amazing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
