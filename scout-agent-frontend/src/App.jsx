import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import "./App.css";
import ChatAssistant from "./ChatAssistant.jsx";
import WorldBackground from "./WorldBackground.jsx";
import { motion } from "framer-motion";

// ================================
// ✅ Product List
// ================================
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

// ================================
// ✅ Auto switch: local or deployed backend
// ================================
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://scout-agent-new-3.onrender.com";

// ✅ WebSocket URL auto-select (ws / wss)
const WS_URL =
  window.location.hostname === "localhost"
    ? "ws://127.0.0.1:8000/ws/updates"
    : "wss://scout-agent-new-3.onrender.com/ws/updates";

function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("PFAS");
  const [loading, setLoading] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);

  const { ref, inView } = useInView();

  // ========================================================
  // ✅ Fetch News with Pagination
  // ========================================================
  const fetchData = async (product = selectedProduct, period = filterType, skip = 0) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/opportunities?product=${encodeURIComponent(
          product
        )}&period=${period}&skip=${skip}&limit=8&order=asc`,
        { withCredentials: false }
      );

      const newData = Array.isArray(res.data) ? res.data : [res.data];

      if (skip === 0) {
        setOpportunities(newData);
        setFiltered(newData);
      } else {
        setOpportunities((prev) => [...prev, ...newData]);
        setFiltered((prev) => [...prev, ...newData]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error("Failed to load updates.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // ✅ WebSocket: Live Updates from backend
  // ========================================================
  useEffect(() => {
    fetchData(selectedProduct, filterType, 0);

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setLiveConnected(true);
      toast.success("Live updates connected 🟢");
    };

    ws.onerror = () => {
      toast.error("WebSocket connection error ⚠️");
      setLiveConnected(false);
    };

    ws.onclose = () => {
      toast.error("Live updates disconnected 🔴");
      setLiveConnected(false);
    };

    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);

      toast.success(`🆕 ${newData.title}`);

      setOpportunities((prev) => [newData, ...prev]);
      setFiltered((prev) => [newData, ...prev]);
    };

    return () => ws.close();
  }, [selectedProduct, filterType]);

  // ========================================================
  // ✅ Infinite Scroll Pagination
  // ========================================================
  useEffect(() => {
    if (inView && !loading) {
      fetchData(selectedProduct, filterType, filtered.length);
    }
  }, [inView]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US") : "N/A";

  const getFilterDisplayText = () =>
    filterType === "day"
      ? "Today"
      : filterType === "month"
      ? "This Month"
      : filterType === "year"
      ? "This Year"
      : "All Time";

  // ========================================================
  // ✅ Render updates
  // ========================================================
  const renderContent = () => (
    <>
      <motion.div className="results-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <strong>{filtered.length}</strong> updates for <strong>{selectedProduct}</strong> (
        {getFilterDisplayText()})
      </motion.div>

      <div className="card-grid">
        {filtered.map((opp, idx) => (
          <motion.div
            key={idx}
            className="card"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2>{opp.title}</h2>
            <div className="meta">
              <strong>Source:</strong> {opp.source || "Unknown"} <br />
              <strong>Date:</strong> {formatDate(opp.date)}
            </div>
            <p className="summary">{opp.summary || "No description"}</p>

            {opp.link && (
              <a href={opp.link} target="_blank" rel="noopener noreferrer" className="read-more">
                🔗 Read Full Article
              </a>
            )}
          </motion.div>
        ))}

        <div ref={ref} className="loading-more">
          {loading ? "⏳ Loading..." : ""}
        </div>
      </div>
    </>
  );

  return (
    <>
      <WorldBackground />

      <motion.div className="app-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.header className="header" initial={{ y: -40 }} animate={{ y: 0 }}>
          <h1>HAYCARB Market Scout</h1>
          <p>Real-time environmental & market intelligence</p>

          <div className={`live-status ${liveConnected ? "connected" : "disconnected"}`}>
            {liveConnected ? "🟢 Live Connected" : "🔴 Disconnected"}
          </div>

          {/* ✅ Fixed dropdown */}
          <div className="product-filter">
            <label className="dropdown-label">Select Product:</label>

            <select
              className="dropdown"
              value={selectedProduct}
              onChange={(e) => {
                const newProduct = e.target.value;
                setSelectedProduct(newProduct);
                fetchData(newProduct, filterType, 0);
              }}
            >
              {PRODUCTS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            {["all", "day", "month", "year"].map((type) => (
              <button
                key={type}
                className={filterType === type ? "active" : ""}
                onClick={() => {
                  setFilterType(type);
                  fetchData(selectedProduct, type, 0);
                }}
              >
                {type === "all"
                  ? "🌎 All"
                  : type === "day"
                  ? "📅 Today"
                  : type === "month"
                  ? "🗓️ This Month"
                  : "📆 This Year"}
              </button>
            ))}
          </div>
        </motion.header>

        <main className="main-content">{renderContent()}</main>

        <ChatAssistant selectedProduct={selectedProduct} />
      </motion.div>
    </>
  );
}

export default App;
