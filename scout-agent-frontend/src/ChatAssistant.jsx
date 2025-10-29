// ChatAssistant.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react";
import "./ChatAssistant.css";

const API_BASE = "http://127.0.0.1:8000";

export default function ChatAssistant({ selectedProduct }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi there! I'm your Haycarb AI Assistant. Ask me anything about ${selectedProduct}, trends, or global insights.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Update welcome message when product changes
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hi there! I'm your Haycarb AI Assistant. Ask me anything about ${selectedProduct}, trends, or global insights.`,
      },
    ]);
  }, [selectedProduct]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        message: userInput,
        product: selectedProduct,
      });

      const botReply = {
        role: "assistant",
        content: res.data.response || "No response from AI.",
      };

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong. Please try again." },
      ]);
      setIsTyping(false);
    }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-assistant-wrapper">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? "open" : "closed"}`}>
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header-pro">
            <div className="header-left">
              <div className="bot-avatar">
                <Bot className="bot-icon" />
              </div>
              <div className="header-info">
                <h3>Haycarb AI</h3>
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={() => setIsOpen(false)} className="header-btn">
                <Minimize2 size={20} />
              </button>
              <button onClick={() => setIsOpen(false)} className="header-btn">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={chatRef} className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === "user" ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>
                <div className="message-content-wrapper">
                  <div className={`message-bubble ${msg.role}`}>
                    <p>{msg.content}</p>
                  </div>
                  <span className="message-time">{formatTime()}</span>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="message-wrapper assistant typing-indicator">
                <div className="message-avatar assistant">
                  <Bot size={16} />
                </div>
                <div className="message-bubble assistant">
                  <div className="typing-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-container">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Ask about ${selectedProduct}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="chat-input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="powered-by">Powered by Haycarb AI • Always here to help</p>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-button ${isOpen ? "hidden" : ""}`}
      >
        <div className="fab-glow"></div>
        <div className="fab-content">
          <MessageCircle size={28} />
          <div className="notification-badge"></div>
        </div>
      </button>
    </div>
  );
}