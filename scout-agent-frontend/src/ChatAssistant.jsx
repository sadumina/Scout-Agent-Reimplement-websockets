import React, { useState, useRef, useEffect } from "react";
import "./ChatAssistant.css";

function ChatAssistant({ selectedProduct }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `👋 Hi there! I'm your Haycarb AI Assistant. Ask me anything about **${selectedProduct}**, market trends, or global insights.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update welcome message when product changes
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          role: "assistant",
          content: `👋 Hi there! I'm your Haycarb AI Assistant. Ask me anything about **${selectedProduct}**, market trends, or global insights.`,
        },
      ]);
    }
  }, [selectedProduct]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  // Format message content (basic markdown support)
  const formatMessage = (content) => {
    // Bold text
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          product: selectedProduct,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const aiMessage = {
        role: "assistant",
        content: data.response || "🤖 Sorry, I couldn't find relevant information.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Sorry, I couldn't process your request. Please ensure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* 🟢 Floating Toggle Button */}
      <button
        className="chat-toggle-btn"
        onClick={toggleChat}
        title={open ? "Close Chat Assistant" : "Open AI Assistant"}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* 💬 Floating Chat Window */}
      {open && (
        <div className="floating-chat-window" role="dialog" aria-label="Chat Assistant">
          <div className="chat-header">
            <div>🤖 Haycarb AI Assistant</div>
            <div className="subtext">
              Ask about <strong>{selectedProduct}</strong> insights
            </div>
          </div>

          <div className="chat-body" role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.role}`}
                role={msg.role === "user" ? "article" : "article"}
              >
                {formatMessage(msg.content)}
              </div>
            ))}

            {loading && (
              <div className="typing" role="status" aria-label="AI is typing">
                <span>🤖 Thinking</span>
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Ask about ${selectedProduct}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              🚀 Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatAssistant;