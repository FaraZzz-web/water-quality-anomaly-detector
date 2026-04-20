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

  // --- Terminal State & Typewriter Logic ---
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
    }, 30);
    return () => clearInterval(typingInterval);
  }, [showTerminal]);

  // --- API: Fetch Data from Java Backend ---
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

  // --- API: Save/Update Data to Java Backend ---
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // FIXED: Using backticks for template literals
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

  // --- API: Forecast from Python ML Backend ---
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

  // --- Logic Helpers ---
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

  let chartData = filteredReadings;
  if (filteredReadings.length === 1) {
    chartData = [
      { ...filteredReadings[0], displayTime: "Baseline" },
      filteredReadings[0],
      { ...filteredReadings[0], displayTime: "Current" },
    ];
  }

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
    const signals = ["Excellent", "Fair", "Weak"];
    const isCritical =
      readings.filter((r) => r.location === locName).slice(-1)[0]?.status ===
      "ANOMALY";

    return {
      battery: battery < 10 ? battery + 15 : battery,
      signal: signals[Math.abs(hash % 3)],
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
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Readings (
              {selectedLocation === "All Locations" ? "Total" : "Filtered"})
            </p>
            <p className="text-4xl font-extrabold text-[#005461]">
              {totalReadings}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Critical Events
            </p>
            <p className="text-4xl font-extrabold text-red-500">
              {anomalyCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Normal / Safe
            </p>
            <p className="text-4xl font-extrabold text-[#00B7B5]">
              {normalCount}
            </p>
          </div>
        </div>

        {/* --- SYSTEM BLUEPRINT --- */}
        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden mb-8 border-4 border-slate-800 p-6 sm:p-10 relative flex flex-col items-center justify-center min-h-[220px]">
          <style>{`
            @keyframes flowRight { 0% { left: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
            .data-packet-x { position: absolute; top: 50%; width: 6px; height: 6px; background-color: #00B7B5; border-radius: 50%; box-shadow: 0 0 10px #00B7B5; animation: flowRight 1.5s infinite linear; }
          `}</style>
          <div className="absolute top-4 left-6 flex items-center gap-2 z-20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <h3 className="text-white/50 text-xs font-black tracking-widest uppercase">
              System Architecture Status: Online
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl z-10">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#00B7B5] bg-slate-800 flex items-center justify-center">
                📡
              </div>
              <p className="text-[#00B7B5] text-[10px] font-bold mt-3 uppercase">
                IoT Sensors
              </p>
            </div>
            <div className="hidden sm:block flex-grow h-0.5 bg-slate-700 relative mx-4">
              <div className="data-packet-x"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-blue-400 bg-slate-800 flex items-center justify-center">
                💾
              </div>
              <p className="text-blue-400 text-[10px] font-bold mt-3 uppercase">
                Data Vault
              </p>
            </div>
            <div className="hidden sm:block flex-grow h-0.5 bg-slate-700 relative mx-4">
              <div className="data-packet-x"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-purple-500 bg-slate-800 flex items-center justify-center">
                🧠
              </div>
              <p className="text-purple-400 text-[10px] font-bold mt-3 uppercase">
                AI Engine
              </p>
            </div>
            <div className="hidden sm:block flex-grow h-0.5 bg-slate-700 relative mx-4">
              <div className="data-packet-x"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-red-500 bg-slate-800 flex items-center justify-center">
                ⚙️
              </div>
              <p className="text-red-400 text-[10px] font-bold mt-3 uppercase">
                Smart Valve
              </p>
            </div>
          </div>
        </div>

        {/* 3. TABS */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex gap-2 overflow-x-auto">
          {["telemetry", "map", "hardware"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab ? "bg-[#005461] text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Data
            </button>
          ))}
        </div>

        {/* 4. TAB CONTENT */}
        {activeTab === "telemetry" && (
          <div className="animate-fade-in" ref={reportRef}>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#005461]">
                  Live pH Telemetry
                </h2>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-[#005461] text-sm font-bold rounded-xl p-2.5 outline-none"
                >
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
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
                      boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ph"
                    stroke="#00B7B5"
                    strokeWidth={3}
                    fill="url(#colorPh)"
                    dot={{ r: 5, fill: "#00B7B5", stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#005461]">
                  Intelligence Log & Hardware Status
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F4F4F4]/50 text-[#018790] font-semibold">
                    <tr>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">pH</th>
                      <th className="px-6 py-4">Turbidity</th>
                      <th className="px-6 py-4">Temp (°C)</th>
                      <th className="px-6 py-4">AI Status</th>
                      <th className="px-6 py-4 text-center">IoT Valve</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredReadings.map((reading) => (
                      <tr
                        key={reading.id}
                        className="hover:bg-[#F4F4F4]/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-800">
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
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${reading.status === "ANOMALY" ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#00B7B5]/10 text-[#018790] border border-[#00B7B5]/20"}`}
                          >
                            {reading.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs ${reading.valveClosed ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700"}`}
                          >
                            {reading.valveClosed ? "CLOSED" : "OPEN"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditClick(reading)}
                            className="text-[#00B7B5] font-bold"
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
          </div>
        )}

        {/* Map and Hardware tabs remain filtered by uniqueLocations logic similarly... */}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#005461]/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
            {forecastReport ? (
              <div className="animate-fade-in">
                <div ref={reportRef} className="bg-white p-4">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-black text-gray-800">
                      AI Threat Assessment
                    </h2>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold ${forecastReport.status.includes("CRITICAL") ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
                    >
                      {forecastReport.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border mb-6 flex gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Projected 12h pH
                      </p>
                      <p className="text-3xl font-black text-[#005461]">
                        {forecastReport.future_ph}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Projected 12h Turbidity
                      </p>
                      <p className="text-3xl font-black text-[#005461]">
                        {forecastReport.future_turbidity}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                    {forecastReport.message}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleSubmit()}
                    className="w-full bg-[#005461] text-white font-bold py-3.5 rounded-xl"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => setForecastReport(null)}
                    className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl"
                  >
                    Back to Form
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="w-full bg-gray-800 text-white font-bold py-3.5 rounded-xl"
                  >
                    {isGeneratingPDF ? "Generating PDF..." : "Download Report"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-[#005461] mb-6">
                  {editingId ? "Update Existing Reading" : "New Sensor Data"}
                </h2>
                <div className="mb-8 p-6 border-2 border-dashed border-[#00B7B5]/50 bg-[#00B7B5]/5 rounded-2xl text-center">
                  <p className="text-[#018790] font-bold mb-3">
                    🔮 AI Verification Required
                  </p>
                  <button
                    type="button"
                    onClick={handleAIForecast}
                    disabled={isAILoading}
                    className="bg-[#00B7B5] text-white font-bold py-2.5 px-6 rounded-full"
                  >
                    {isAILoading ? "Verifying Data..." : "Run AI Verification"}
                  </button>
                </div>
                <form className="flex flex-col gap-5">
                  <input
                    type="text"
                    placeholder="Location Name"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="border-2 p-3 rounded-xl"
                  />
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="pH"
                      value={formData.ph}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ph: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 border-2 p-3 rounded-xl"
                    />
                    <input
                      type="number"
                      placeholder="Turbidity"
                      value={formData.turbidity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          turbidity: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 border-2 p-3 rounded-xl"
                    />
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Temp"
                      value={formData.temperature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 border-2 p-3 rounded-xl"
                    />
                    <input
                      type="number"
                      placeholder="Oxygen"
                      value={formData.dissolvedOxygen}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dissolvedOxygen: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 border-2 p-3 rounded-xl"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-100 py-3 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled
                      className="flex-1 bg-gray-300 text-white py-3 rounded-xl cursor-not-allowed"
                    >
                      Save (Verify First)
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
