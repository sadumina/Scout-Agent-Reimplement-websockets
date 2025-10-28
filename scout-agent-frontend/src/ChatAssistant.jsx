import React, { useState, useRef, useEffect } from "react";
import "./ChatAssistant.css";

function ChatAssistant({ selectedProduct }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `👋 Hi there! I'm your Haycarb AI Assistant. Ask me anything about **${selectedProduct}**, market trends, or global insights.`,
      timestamp: new Date(),
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
          timestamp: new Date(),
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

  // Basic markdown formatting
  const formatMessage = (content) => {
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
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

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const aiMessage = {
        role: "assistant",
        content:
          data.response ||
          "🤖 Sorry, I couldn't find relevant information for that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Sorry, I couldn't process your request. Please make sure the backend is running.",
          timestamp: new Date(),
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

  const toggleChat = () => setOpen(!open);

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* 💬 Floating Toggle Button */}
      <button
        className="chat-toggle-btn"
        onClick={toggleChat}
        title={open ? "Close Chat Assistant" : "Open AI Assistant"}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* 🪄 Floating Chat Window */}
      {open && (
        <div
          className="floating-chat-window"
          role="dialog"
          aria-label="Chat Assistant"
        >
          <div className="chat-header">
            <div className="header-content">
              <img
                src="C:\Users\Sadumina.Rathnayaka\Desktop\scout agent frontend\scout-agent-frontend\src\assets\images.png"
                alt="Haycarb AI"
                className="chat-avatar"
              />
              <div>
                <div className="chat-title">Haycarb AI Assistant</div>
                <div className="subtext">
                  Discuss <strong>{selectedProduct}</strong> insights
                </div>
              </div>
            </div>
          </div>

          <div className="chat-body" role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                {formatMessage(msg.content)}
                <div className="meta">
                  {msg.role === "user" ? "You" : "AI"} · {formatTime(msg.timestamp)}
                </div>
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
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <i className="fa fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatAssistant;
