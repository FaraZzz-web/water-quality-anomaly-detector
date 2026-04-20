import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [activeTab, setActiveTab] = useState("telemetry");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  const [isAILoading, setIsAILoading] = useState(false);
  const [forecastReport, setForecastReport] = useState(null);
  const [isDispatched, setIsDispatched] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const reportRef = useRef(null);

  const [formData, setFormData] = useState({
    location: "",
    ph: "",
    turbidity: "",
    temperature: "",
    dissolvedOxygen: "",
  });

  // --- NEW: Terminal State & Typewriter Logic ---
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalText, setTerminalText] = useState("");
  const fullText =
    "> INITIALIZING AQUA-AI VER 2.0...\n> ESTABLISHING CONNECTION TO SECURE POSTGRESQL VAULT... SUCCESS.\n> LOADING RANDOM FOREST PREDICTIVE MODEL... SUCCESS.\n> SYSTEM ONLINE.\n> Welcome to the autonomous water quality monitoring grid.";

  useEffect(() => {
    if (!showTerminal) return;
    let i = 0;
    const typingInterval = setInterval(() => {
      setTerminalText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(typingInterval);
      }
    }, 30); // Speed of the typewriter
    return () => clearInterval(typingInterval);
  }, [showTerminal]);
  // ----------------------------------------------

  const fetchReadings = () => {
    fetch("https://water-quality-backend-0z6s.onrender.com/api/readings")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort((a, b) => a.id - b.id);
        const formattedData = sortedData.map((item) => ({
          ...item,
          displayTime: new Date(item.timestamp).toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          }),
        }));
        setReadings(formattedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleEditClick = (reading) => {
    setEditingId(reading.id);
    setFormData({
      location: reading.location,
      ph: reading.ph,
      turbidity: reading.turbidity,
      temperature: reading.temperature,
      dissolvedOxygen: reading.dissolvedOxygen,
    });
    setForecastReport(null);
    setIsDispatched(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const url = editingId
      ? `https://water-quality-backend-0z6s.onrender.com/api/readings/${editingId}`
      : "https://water-quality-backend-0z6s.onrender.com/api/readings";
    const method = editingId ? "PUT" : "POST";

    const isCritical = forecastReport
      ? forecastReport.status.includes("CRITICAL")
      : false;

    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzoffset)
      .toISOString()
      .slice(0, -1);

    const finalPayload = {
      ...formData,
      id: editingId,
      timestamp: localISOTime,
      status: forecastReport
        ? isCritical
          ? "ANOMALY"
          : "SAFE"
        : "MANUAL_UPDATE",
      valveClosed: isCritical,
    };

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Update failed");
        return response.json();
      })
      .then(() => {
        closeModal();
        fetchReadings();
      })
      .catch((error) => console.error("Error saving data:", error));
  };

  const handleAIForecast = (e) => {
    e.preventDefault();
    if (
      !formData.ph ||
      !formData.turbidity ||
      !formData.temperature ||
      !formData.dissolvedOxygen
    ) {
      alert("⚠️ Please fill in all sensor readings before running the AI!");
      return;
    }

    setIsAILoading(true);
    setForecastReport(null);
    setIsDispatched(false);

    // AI Python Backend (Needs separate deployment later if you want it live)
    fetch("https://ml-service-9uke.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: formData.temperature,
        oxygen: formData.dissolvedOxygen,
        turbidity: formData.turbidity,
        ph: formData.ph,
      }),
    })
      .then((response) => response.json())
      .then((aiData) => {
        setIsAILoading(false);
        if (aiData.error) {
          alert("AI Error: " + aiData.error);
          return;
        }
        setForecastReport(aiData);
      })
      .catch((error) => {
        console.error("AI Error:", error);
        alert("AI Server Unreachable. Check Python backend.");
        setIsAILoading(false);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForecastReport(null);
    setIsDispatched(false);
    setFormData({
      location: "",
      ph: "",
      turbidity: "",
      temperature: "",
      dissolvedOxygen: "",
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const element = reportRef.current;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Assessment_${formData.location || "Report"}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getHealthRisks = (ph, turbidity) => {
    const risks = [];
    if (ph < 6.5)
      risks.push(
        "Corrosion of lead/copper pipes causing heavy metal poisoning.",
      );
    if (ph > 8.5) risks.push("Skin irritation and gastrointestinal issues.");
    if (turbidity > 5.0)
      risks.push("High risk of waterborne pathogens (E. Coli, Cholera).");
    if (risks.length === 0)
      risks.push("No immediate biological or chemical threats detected.");
    return risks;
  };

  // --- FILTER LOGIC & DATA PREP ---
  const uniqueLocations = [
    "All Locations",
    ...new Set(readings.map((r) => r.location)),
  ];

  const filteredReadings =
    selectedLocation === "All Locations"
      ? readings
      : readings.filter((r) => r.location === selectedLocation);

  const totalReadings = filteredReadings.length;
  const anomalyCount = filteredReadings.filter(
    (r) => r.status === "CRITICAL" || r.status === "ANOMALY",
  ).length;
  const normalCount = totalReadings - anomalyCount;

  // Chart Visual Fix
  let chartData = filteredReadings;
  if (filteredReadings.length === 1) {
    chartData = [
      { ...filteredReadings[0], displayTime: "Baseline" },
      filteredReadings[0],
      { ...filteredReadings[0], displayTime: "Current" },
    ];
  }

  // --- Digital Twin Logic ---
  const latestReading =
    filteredReadings.length > 0
      ? filteredReadings[filteredReadings.length - 1]
      : null;
  const isSystemLocked = latestReading
    ? latestReading.valveClosed ||
      latestReading.status === "CRITICAL" ||
      latestReading.status === "ANOMALY"
    : false;

  const getHardwareStats = (locName) => {
    let hash = 0;
    for (let i = 0; i < locName.length; i++)
      hash = locName.charCodeAt(i) + ((hash << 5) - hash);
    const battery = Math.abs(hash % 100);
    const signalIndex = Math.abs(hash % 3);
    const signals = ["Excellent", "Fair", "Weak"];
    const isCritical =
      readings.filter((r) => r.location === locName).slice(-1)[0]?.status ===
      "ANOMALY";

    return {
      battery: battery < 10 ? battery + 15 : battery,
      signal: signals[signalIndex],
      daysSinceCal: Math.abs(hash % 180),
      isCritical: isCritical,
    };
  };

  if (isLoading)
    return (
      <div className="p-8 text-[#005461] font-bold text-center mt-20">
        Loading Secure Database...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-sans pb-12">
      {/* 1. HERO SECTION */}
      <div className="bg-gradient-to-r from-[#005461] to-[#018790] pt-12 pb-32 px-8 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Smart Water Monitoring System
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
          AI-powered anomaly detection, IoT automation, and environmental
          forecasting.
        </p>
        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-[#00B7B5] hover:bg-[#009b99] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          + Add New Reading
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        {/* 2. KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Readings (
              {selectedLocation === "All Locations" ? "Total" : "Filtered"})
            </p>
            <p className="text-4xl font-extrabold text-[#005461]">
              {totalReadings}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Critical Events
            </p>
            <p className="text-4xl font-extrabold text-red-500">
              {anomalyCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Normal / Safe
            </p>
            <p className="text-4xl font-extrabold text-[#00B7B5]">
              {normalCount}
            </p>
          </div>
        </div>

        {/* --- SYSTEM BLUEPRINT DIAGRAM --- */}
        <div className="bg-slate-900 rounded-2xl shadow-xl shadow-gray-300/50 overflow-hidden mb-8 border-4 border-slate-800 p-6 sm:p-10 relative flex flex-col items-center justify-center min-h-[220px]">
          <style>{`
            @keyframes flowRight {
              0% { left: 0%; opacity: 0; transform: translateY(-50%) scale(0.5); }
              10% { opacity: 1; transform: translateY(-50%) scale(1); }
              90% { opacity: 1; transform: translateY(-50%) scale(1); }
              100% { left: 100%; opacity: 0; transform: translateY(-50%) scale(0.5); }
            }
            @keyframes flowDown {
              0% { top: 0%; opacity: 0; transform: translateX(-50%) scale(0.5); }
              10% { opacity: 1; transform: translateX(-50%) scale(1); }
              90% { opacity: 1; transform: translateX(-50%) scale(1); }
              100% { top: 100%; opacity: 0; transform: translateX(-50%) scale(0.5); }
            }
            .data-packet-x {
              position: absolute; top: 50%; width: 6px; height: 6px; background-color: #00B7B5; border-radius: 50%;
              box-shadow: 0 0 10px #00B7B5, 0 0 20px #00B7B5; animation: flowRight 1.5s infinite linear;
            }
            .data-packet-y {
              position: absolute; left: 50%; width: 6px; height: 6px; background-color: #00B7B5; border-radius: 50%;
              box-shadow: 0 0 10px #00B7B5, 0 0 20px #00B7B5; animation: flowDown 1.5s infinite linear;
            }
            .delay-1 { animation-delay: 0.5s; }
            .delay-2 { animation-delay: 1.0s; }
          `}</style>

          {/* Status Overlay */}
          <div className="absolute top-4 left-6 flex items-center gap-2 z-20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <h3 className="text-white/50 text-xs font-black tracking-widest uppercase">
              System Architecture Status: Online
            </h3>
          </div>

          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#00B7B5 1px, transparent 1px), linear-gradient(90deg, #00B7B5 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>

          {/* Flow Diagram Container */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mt-6 sm:mt-4 z-10">
            {/* Node 1: Sensors */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#00B7B5] bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(0,183,181,0.3)]">
                <span className="text-xl sm:text-2xl">📡</span>
              </div>
              <p className="text-[#00B7B5] text-[10px] sm:text-xs font-bold mt-3 uppercase tracking-wide text-center">
                IoT Sensors
              </p>
            </div>

            {/* Track 1 */}
            <div className="hidden sm:block flex-grow h-0.5 bg-slate-700 relative mx-4">
              <div className="data-packet-x"></div>
              <div className="data-packet-x delay-1"></div>
            </div>
            <div className="sm:hidden h-8 w-0.5 bg-slate-700 relative my-2">
              <div className="data-packet-y"></div>
            </div>

            {/* Node 2: Database */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-400 bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.3)] relative">
                <span className="text-xl sm:text-2xl">💾</span>
              </div>
              <p className="text-blue-400 text-[10px] sm:text-xs font-bold mt-3 uppercase tracking-wide text-center">
                Data Vault
              </p>
            </div>

            {/* Track 2 */}
            <div className="hidden sm:block flex-grow h-0.5 bg-slate-700 relative mx-4">
              <div className="data-packet-x"></div>
              <div className="data-packet-x delay-1"></div>
            </div>
            <div className="sm:hidden h-8 w-0.5 bg-slate-700 relative my-2">
              <div className="data-packet-y"></div>
            </div>

            {/* Node 3: AI Engine */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-purple-500 bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <span className="text-xl sm:text-2xl">🧠</span>
              </div>
              <p className="text-purple-400 text-[10px] sm:text-xs font-bold mt-3 uppercase tracking-wide text-center">
                AI Engine
              </p>
            </div>

            {/* Track 3 */}
            <div className="hidden sm:block flex-grow h-0.5 bg-slate-700 relative mx-4">
              <div className="data-packet-x"></div>
              <div className="data-packet-x delay-1"></div>
            </div>
            <div className="sm:hidden h-8 w-0.5 bg-slate-700 relative my-2">
              <div className="data-packet-y"></div>
            </div>

            {/* Node 4: Hardware Actuation */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-red-500 bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <span className="text-xl sm:text-2xl">⚙️</span>
              </div>
              <p className="text-red-400 text-[10px] sm:text-xs font-bold mt-3 uppercase tracking-wide text-center">
                Smart Valve
              </p>
            </div>
          </div>
        </div>
        {/* ------------------------------------------- */}

        {/* 3. SUB-NAVIGATION TABS */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex justify-center sm:justify-start gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "telemetry" ? "bg-[#005461] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Telemetry Data
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "map" ? "bg-[#005461] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Live Network Map
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "hardware" ? "bg-[#005461] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
          >
            IoT Fleet Health
          </button>
        </div>

        {/* 4. TAB CONTENT RENDERER */}

        {/* --- TAB A: TELEMETRY (Your existing Dashboard) --- */}
        {activeTab === "telemetry" && (
          <div className="animate-fade-in" ref={reportRef}>
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-[#005461]">
                  Live pH Telemetry
                </h2>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
                    Filter View:
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-[#005461] text-sm font-bold rounded-xl focus:ring-[#00B7B5] focus:border-[#00B7B5] block p-2.5 outline-none cursor-pointer"
                  >
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B7B5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00B7B5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="displayTime"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 14]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ph"
                    stroke="#00B7B5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPh)"
                    activeDot={{ r: 8, fill: "#018790" }}
                    dot={{
                      r: 5,
                      fill: "#00B7B5",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#005461]">
                  Intelligence Log & Hardware Status
                </h2>
                {selectedLocation !== "All Locations" && (
                  <span className="bg-[#00B7B5]/10 text-[#018790] text-xs font-bold px-3 py-1 rounded-full border border-[#00B7B5]/20">
                    Showing: {selectedLocation}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F4F4F4]/50 text-[#018790] font-semibold whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">pH</th>
                      <th className="px-6 py-4">Turbidity</th>
                      <th className="px-6 py-4">Temp (°C)</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">AI Status</th>
                      <th className="px-6 py-4 text-center">IoT Valve</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReadings.map((reading) => (
                      <tr
                        key={reading.id}
                        className="hover:bg-[#F4F4F4]/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                          {reading.location}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {reading.ph}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {reading.turbidity}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {reading.temperature}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {reading.displayTime}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${reading.status === "CRITICAL" || reading.status === "ANOMALY" ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#00B7B5]/10 text-[#018790] border border-[#00B7B5]/20"}`}
                          >
                            {reading.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {reading.valveClosed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-700 font-bold text-xs border border-red-200">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>{" "}
                              CLOSED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-700 font-bold text-xs border border-green-200">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                              OPEN
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditClick(reading)}
                            className="text-[#00B7B5] hover:text-[#018790] font-bold transition"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- MOVED: DIGITAL TWIN VISUALIZATION --- */}
            <div className="bg-slate-900 rounded-2xl shadow-xl shadow-gray-400/50 overflow-hidden mb-8 border-4 border-slate-800 p-0 relative w-full h-[160px] sm:h-[220px] flex items-center justify-center transition-all">
              <style>{`
                @keyframes waterFlow {
                  0% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                .animate-water {
                  background: linear-gradient(90deg, #00B7B5 0%, #018790 25%, #00B7B5 50%, #018790 75%, #00B7B5 100%);
                  background-size: 200% 100%;
                  animation: waterFlow 2s linear infinite;
                }
                .toxic-water {
                  background: linear-gradient(90deg, #ef4444 0%, #7f1d1d 50%, #ef4444 100%);
                  background-size: 200% 100%;
                  opacity: 0.9;
                }
              `}</style>
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(#00B7B5 1px, transparent 1px), linear-gradient(90deg, #00B7B5 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              ></div>
              <div className="absolute top-4 left-4 sm:left-6 z-30 pointer-events-none">
                <h3 className="text-white font-black text-sm sm:text-xl tracking-widest uppercase opacity-90 drop-shadow-md">
                  Digital Twin:{" "}
                  {selectedLocation === "All Locations"
                    ? "Main Network Grid"
                    : selectedLocation}
                </h3>
                <div className="flex items-center gap-2 mt-1 sm:mt-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 backdrop-blur-md inline-flex shadow-lg">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${isSystemLocked ? "bg-red-500 animate-ping" : "bg-green-500 animate-pulse"}`}
                  ></span>
                  <span
                    className={`text-[10px] sm:text-xs font-bold tracking-wide ${isSystemLocked ? "text-red-400" : "text-green-400"}`}
                  >
                    {isSystemLocked
                      ? "CONTAMINATION DETECTED - VALVE LOCKED"
                      : "SYSTEM OPTIMAL - FLOW ACTIVE"}
                  </span>
                </div>
              </div>
              <div className="absolute w-full h-16 sm:h-24 border-y-[6px] sm:border-y-8 border-slate-700 bg-slate-800/50 flex items-center shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden">
                <div
                  className={`absolute inset-0 transition-all duration-1000 ${isSystemLocked ? "toxic-water" : "animate-water"}`}
                ></div>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-12 sm:w-16 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 border-x-4 border-gray-500 z-20 transition-all duration-[800ms] ease-in-out shadow-[0_0_20px_rgba(0,0,0,0.9)] ${isSystemLocked ? "h-[120%] -top-[10%]" : "h-2 -top-2"}`}
                >
                  <div
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-colors ${isSystemLocked ? "bg-red-500 shadow-[0_0_15px_red]" : "bg-green-500 shadow-[0_0_10px_#10B981]"}`}
                  ></div>
                </div>
              </div>
              <div className="absolute left-0 w-6 sm:w-8 h-20 sm:h-28 bg-slate-700 rounded-r-lg shadow-xl z-20 border-y border-r border-slate-600"></div>
              <div className="absolute right-0 w-6 sm:w-8 h-20 sm:h-28 bg-slate-700 rounded-l-lg shadow-xl z-20 border-y border-l border-slate-600"></div>
            </div>
            {/* --------------------------------------------- */}
          </div>
        )}

        {/* --- TAB B: LIVE NETWORK MAP --- */}
        {activeTab === "map" && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 animate-fade-in border border-gray-100">
            <h2 className="text-2xl font-black text-[#005461] mb-2 flex items-center gap-2">
              <span>📍</span> Live Geospatial Pipeline Map
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Real-time status of all autonomous IoT valves across the physical
              network grid.
            </p>

            <div className="relative w-full h-[500px] bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-inner">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(#00B7B5 1px, transparent 1px), linear-gradient(90deg, #00B7B5 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              ></div>

              {uniqueLocations
                .filter((l) => l !== "All Locations")
                .map((loc, index) => {
                  const stats = getHardwareStats(loc);
                  const top = `${20 + Math.abs(getHardwareStats(loc).battery % 60)}%`;
                  const left = `${10 + Math.abs(getHardwareStats(loc).daysSinceCal % 80)}%`;

                  return (
                    <div
                      key={index}
                      className="absolute flex flex-col items-center group cursor-pointer"
                      style={{ top, left }}
                    >
                      <div className="relative flex justify-center items-center">
                        {stats.isCritical && (
                          <div className="absolute w-12 h-12 bg-red-500/30 rounded-full animate-ping"></div>
                        )}
                        <div
                          className={`w-4 h-4 rounded-full z-10 border-2 border-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${stats.isCritical ? "bg-red-500" : "bg-[#00B7B5]"}`}
                        ></div>
                      </div>
                      <div className="mt-2 px-3 py-1.5 bg-slate-800/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg shadow-xl opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                        {loc}
                        <div
                          className={`mt-0.5 text-[10px] ${stats.isCritical ? "text-red-400" : "text-[#00B7B5]"}`}
                        >
                          {stats.isCritical ? "VALVE LOCKED" : "FLOW NORMAL"}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- TAB C: IOT FLEET HEALTH --- */}
        {activeTab === "hardware" && (
          <div className="animate-fade-in">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-[#005461] mb-1">
                  IoT Hardware Diagnostics
                </h2>
                <p className="text-gray-500 text-sm">
                  Physical sensor maintenance, battery life, and calibration
                  drift.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueLocations
                .filter((l) => l !== "All Locations")
                .map((loc, index) => {
                  const stats = getHardwareStats(loc);
                  return (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:-translate-y-1 transition-transform"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                          {loc}
                        </h3>
                        <span
                          className={`w-3 h-3 rounded-full ${stats.isCritical ? "bg-red-500 animate-pulse" : "bg-green-400"}`}
                        ></span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 uppercase">
                            <span>Battery Power</span>
                            <span
                              className={
                                stats.battery < 20
                                  ? "text-red-500"
                                  : "text-[#00B7B5]"
                              }
                            >
                              {stats.battery}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${stats.battery < 20 ? "bg-red-500" : "bg-[#00B7B5]"}`}
                              style={{ width: `${stats.battery}%` }}
                            ></div>
                          </div>
                          {stats.battery < 20 && (
                            <p className="text-[10px] text-red-500 font-bold mt-1">
                              ⚠️ Maintenance Required Soon
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Telemetry Signal
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${stats.signal === "Weak" ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-blue-700"}`}
                          >
                            📡 {stats.signal}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Calibration Drift
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            {stats.daysSinceCal} days ago
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL CODE REMAINS EXACTLY THE SAME */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#005461]/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
            {forecastReport ? (
              <div className="animate-fade-in">
                <div ref={reportRef} className="bg-white p-4 -m-4 mb-4">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                      AI Threat Assessment
                    </h2>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${forecastReport.status.includes("CRITICAL") ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
                    >
                      {forecastReport.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6 flex gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Projected 12h pH
                      </p>
                      <p
                        className={`text-3xl font-black ${forecastReport.future_ph < 6.5 || forecastReport.future_ph > 8.5 ? "text-red-500" : "text-[#005461]"}`}
                      >
                        {forecastReport.future_ph}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Projected 12h Turbidity
                      </p>
                      <p
                        className={`text-3xl font-black ${forecastReport.future_turbidity > 5.0 ? "text-red-500" : "text-[#005461]"}`}
                      >
                        {forecastReport.future_turbidity}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="text-blue-500">⚙️</span> IoT Hardware
                      Status
                    </h3>
                    <div
                      className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-500 ${forecastReport.status.includes("CRITICAL") ? "bg-red-50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-green-50 border-green-400"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${forecastReport.status.includes("CRITICAL") ? "bg-red-500 text-white animate-pulse" : "bg-green-500 text-white"}`}
                        >
                          {forecastReport.status.includes("CRITICAL")
                            ? "🔒"
                            : "🌊"}
                        </div>
                        <div>
                          <p
                            className={`font-black tracking-wide ${forecastReport.status.includes("CRITICAL") ? "text-red-600" : "text-green-700"}`}
                          >
                            {forecastReport.status.includes("CRITICAL")
                              ? "AUTONOMOUS LOCKDOWN ENGAGED"
                              : "VALVE OPEN - FLOW NORMAL"}
                          </p>
                          <p className="text-xs text-gray-600 font-medium mt-1">
                            {forecastReport.status.includes("CRITICAL")
                              ? "Main supply severed. Contamination isolated."
                              : "Safe water distribution active."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 font-medium mb-6 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    {forecastReport.message}
                  </p>

                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="text-red-500">⚕️</span> Public Health
                      Risks
                    </h3>
                    <ul className="space-y-2">
                      {getHealthRisks(
                        forecastReport.future_ph,
                        forecastReport.future_turbidity,
                      ).map((risk, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-start gap-2 bg-red-50/30 p-2.5 rounded-lg border border-red-50"
                        >
                          <span className="text-red-400 mt-0.5">•</span> {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="text-blue-500">📞</span> Recommended
                      Action Protocol
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-200">
                      <p className="font-bold mb-1">
                        Target Authority:{" "}
                        <span className="text-gray-900 font-medium">
                          Municipal Water Quality Board ({formData.location})
                        </span>
                      </p>
                      <p className="font-bold">
                        Contact Protocol:{" "}
                        <span className="text-gray-900 font-medium">
                          +1 (800) 555-H2O
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setForecastReport(null)}
                      className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Back to Form
                    </button>
                    {forecastReport.status.includes("CRITICAL") && (
                      <button
                        onClick={() => {
                          setIsDispatched(true);
                          fetch("http://localhost:5000/dispatch", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              location: formData.location,
                              ph: forecastReport.future_ph,
                              turbidity: forecastReport.future_turbidity,
                            }),
                          })
                            .then(() => setIsDispatched(true))
                            .catch(() => setIsDispatched(false));
                        }}
                        disabled={isDispatched}
                        className={`flex-1 font-bold py-3.5 rounded-xl shadow-lg transition-all ${isDispatched ? "bg-green-500 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                      >
                        {isDispatched
                          ? "Manual Protocol Dispatched"
                          : "Dispatch Emergency Protocol"}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <button
                      onClick={() => handleSubmit()}
                      className="w-full bg-[#005461] hover:bg-[#018790] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
                    >
                      Save Entry
                    </button>
                    <button
                      onClick={() => handleDownloadPDF()}
                      disabled={isGeneratingPDF}
                      className="w-full bg-gray-800 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
                    >
                      {isGeneratingPDF
                        ? "Generating Document..."
                        : "Download Report"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-[#005461] mb-6">
                  {editingId ? "Update Existing Reading" : "New Sensor Data"}
                </h2>
                <div className="mb-8 p-6 border-2 border-dashed border-[#00B7B5]/50 bg-[#00B7B5]/5 rounded-2xl text-center">
                  <p className="text-[#018790] font-bold mb-3 flex items-center justify-center gap-2">
                    <span className="text-xl">🔮</span> AI Verification Required
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    To update this record and ensure the IoT Valve reacts
                    correctly, you must re-run the AI Forecast for the edited
                    data.
                  </p>
                  <button
                    type="button"
                    onClick={handleAIForecast}
                    disabled={isAILoading}
                    className="bg-[#00B7B5] hover:bg-[#018790] text-white text-sm font-bold py-2.5 px-6 rounded-full shadow-md transition duration-200"
                  >
                    {isAILoading ? "Verifying Data..." : "Run AI Verification"}
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className="block text-sm font-bold text-[#018790] mb-1.5">
                      Location Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#00B7B5]"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-[#018790] mb-1.5">
                        pH Level
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.ph}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ph: parseFloat(e.target.value),
                          })
                        }
                        className="w-full border-2 border-gray-200 p-3 rounded-xl"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-[#018790] mb-1.5">
                        Turbidity
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.turbidity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            turbidity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full border-2 border-gray-200 p-3 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-[#018790] mb-1.5">
                        Temp (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.temperature}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            temperature: parseFloat(e.target.value),
                          })
                        }
                        className="w-full border-2 border-gray-200 p-3 rounded-xl"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-[#018790] mb-1.5">
                        Dissolved O₂
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.dissolvedOxygen}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dissolvedOxygen: parseFloat(e.target.value),
                          })
                        }
                        className="w-full border-2 border-gray-200 p-3 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-xl cursor-not-allowed"
                      disabled
                    >
                      Run AI Verification to Save
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
