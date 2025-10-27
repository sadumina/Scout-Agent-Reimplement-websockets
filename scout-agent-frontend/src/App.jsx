import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import "./App.css";
import ChatAssistant from "./ChatAssistant.jsx";

const PRODUCTS = [
  { name: "PFAS" },
  { name: "Soil Remediation" },
  { name: "Mining" },
  { name: "Gold Recovery" },
  { name: "Drinking Water" },
  { name: "Wastewater Treatment" },
  { name: "Air & Gas Purification" },
  { name: "Mercury Removal" },
  { name: "Food & Beverage" },
  { name: "Energy Storage" },
  { name: "Catalyst Support" },
  { name: "Automotive Filters" },
  { name: "Medical & Pharma" },
  { name: "Nuclear Applications" },
  { name: "EDLC" },
  { name: "Silicon Anodes" },
  { name: "Lithium Iron Batteries" },
  { name: "Carbon Block Filters" },
  { name: "Activated Carbon for Gold Recovery" },
  { name: "Activated Carbon for EDLC" },
  { name: "Activated Carbon for Silicon Anodes" },
  { name: "Jacobi Updates" },
  { name: "Jacobi Profile" },
  { name: "Haycarb Updates" },
];

const API_BASE = "http://127.0.0.1:8000"; // 👈 FastAPI backend

function App() {
  const [, setOpportunities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("PFAS");
  const [loading, setLoading] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);

  // Infinite scroll states
  const [visibleCount, setVisibleCount] = useState(8);
  const { ref, inView } = useInView();

  // ✅ Fetch data (connected to backend period filter)
  const fetchData = async (product = selectedProduct, period = filterType) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/opportunities?product=${encodeURIComponent(product)}&period=${period}`
      );
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setOpportunities(data);
      setFiltered(data);
      setVisibleCount(8);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
      toast.error("Failed to fetch data ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ WebSocket Setup (live updates)
  useEffect(() => {
    fetchData(selectedProduct, filterType);

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/updates");

    ws.onopen = () => {
      console.log("🟢 WebSocket connected");
      setLiveConnected(true);
      toast.success("Live connection established 🟢");
    };

    ws.onclose = () => {
      console.log("🔴 WebSocket disconnected");
      setLiveConnected(false);
      toast.error("Connection lost 🔴");
    };

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket error", err);
      setLiveConnected(false);
      toast.error("WebSocket connection error ⚠️");
    };

    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      if (
        newData.topic === selectedProduct ||
        newData.topic?.toLowerCase().includes(selectedProduct.toLowerCase())
      ) {
        toast.success(`🆕 ${newData.title}`, {
          duration: 4000,
          style: {
            border: "1px solid #2E7D32",
            background: "#f0fff4",
            color: "#2E7D32",
            fontWeight: 600,
            padding: "8px 12px",
          },
          icon: "🌍",
        });

        // Insert new update at top
        setOpportunities((prev) => [newData, ...prev]);
        setFiltered((prev) => [newData, ...prev]);
      }
    };

    return () => ws.close();
  }, [selectedProduct, filterType]);

  // ✅ Infinite Scroll logic
  useEffect(() => {
    if (inView && !loading && visibleCount < filtered.length) {
      const timer = setTimeout(() => setVisibleCount((prev) => prev + 6), 500);
      return () => clearTimeout(timer);
    }
  }, [inView, loading, filtered.length]);

  // ✅ Format date nicely
  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFilterDisplayText = () =>
    filterType === "day"
      ? "Today"
      : filterType === "month"
      ? "This Month"
      : filterType === "year"
      ? "This Year"
      : "All Time";

  // ✅ Render content with infinite scroll
  const renderContent = () => (
    <>
      <div className="results-summary">
        <strong>{filtered.length}</strong> opportunities for{" "}
        <strong>{selectedProduct}</strong> ({getFilterDisplayText()})
      </div>

      <div className="card-grid">
        {filtered.slice(0, visibleCount).map((opp, idx) => (
          <div key={idx} className="card">
            <h2>{opp.title}</h2>
            <div className="meta">
              <strong>Source:</strong> {opp.source || "Unknown"} <br />
              <strong>Date:</strong> {formatDate(opp.date)}
            </div>
            <p className="summary">{opp.summary || "No description"}</p>
            {opp.link && (
              <a
                href={opp.link}
                target="_blank"
                rel="noreferrer"
                className="read-more"
              >
                🔗 Read Full Article
              </a>
            )}
          </div>
        ))}

        {visibleCount < filtered.length && (
          <div ref={ref} className="loading-more">
            ⏳ Loading more...
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="app-container">
      <header className="header">
        <h1>HAYCARB Market Scout</h1>
        <p>Stay ahead with real-time environmental & market intelligence</p>

        <div
          className={`live-status ${liveConnected ? "connected" : "disconnected"}`}
        >
          {liveConnected ? "🟢 Live Connected" : "🔴 Disconnected"}
        </div>

        {/* Product Selector */}
        <div className="product-filter">
          <label htmlFor="product" className="dropdown-label">
            Select Product:
          </label>
          <select
            id="product"
            className="dropdown"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            {PRODUCTS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Filters */}
        <div className="filter-buttons">
          <button
            className={filterType === "all" ? "active" : ""}
            onClick={() => {
              setFilterType("all");
              fetchData(selectedProduct, "all");
            }}
          >
            🌎 All
          </button>
          <button
            className={filterType === "day" ? "active" : ""}
            onClick={() => {
              setFilterType("day");
              fetchData(selectedProduct, "day");
            }}
          >
            📅 Today
          </button>
          <button
            className={filterType === "month" ? "active" : ""}
            onClick={() => {
              setFilterType("month");
              fetchData(selectedProduct, "month");
            }}
          >
            🗓️ This Month
          </button>
          <button
            className={filterType === "year" ? "active" : ""}
            onClick={() => {
              setFilterType("year");
              fetchData(selectedProduct, "year");
            }}
          >
            📆 This Year
          </button>
        </div>

        {/* Refresh Button */}
        <button
          className="refresh-btn"
          onClick={() => fetchData(selectedProduct, filterType)}
          disabled={loading}
        >
          🔄 {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <main className="main-content">
        {loading ? (
          <div className="loading">⏳ Loading {selectedProduct} updates...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h3>No updates found</h3>
            <p>
              No updates for <strong>{selectedProduct}</strong> (
              {getFilterDisplayText()}).
            </p>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* Smart AI Chat Assistant */}
      <ChatAssistant selectedProduct={selectedProduct} />
    </div>
  );
}

export default App;
