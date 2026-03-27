import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    ph: "",
    turbidity: "",
    temperature: "",
    dissolvedOxygen: "",
  });

  const fetchReadings = () => {
    fetch("http://localhost:8080/api/readings")
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
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:8080/api/readings/${editingId}`
      : "http://localhost:8080/api/readings";
    const method = editingId ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(() => {
        closeModal();
        fetchReadings();
      })
      .catch((error) => console.error("Error saving data:", error));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAILoading(true);
    const imagePayload = new FormData();
    imagePayload.append("file", file);

    fetch("http://localhost:8080/api/readings/analyze", {
      method: "POST",
      body: imagePayload,
    })
      .then((response) => response.json())
      .then((aiData) => {
        setIsAILoading(false);
        alert(
          `🧠 AI Analysis Complete!\n\nDiagnosis: ${aiData.status}\nConfidence: ${aiData.confidence * 100}%\nMessage: ${aiData.message}`,
        );

        if (aiData.status === "ANOMALY") {
          setFormData({
            location: "AI-Scanned-Sample",
            ph: 9.5,
            turbidity: 12.0,
            temperature: 28.0,
            dissolvedOxygen: 2.1,
          });
        }
      })
      .catch((error) => {
        console.error("AI Error:", error);
        alert("Failed to reach the AI brain. Is the Python server running?");
        setIsAILoading(false);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      location: "",
      ph: "",
      turbidity: "",
      temperature: "",
      dissolvedOxygen: "",
    });
  };

  const totalReadings = readings.length;
  const anomalyCount = readings.filter((r) => r.status === "ANOMALY").length;
  const normalCount = readings.filter((r) => r.status !== "ANOMALY").length;

  if (isLoading)
    return (
      <div className="p-8 text-[#005461] font-bold text-center mt-20">
        Loading secure data from PostgreSQL...
      </div>
    );

  return (
    // MAIN BACKGROUND using your off-white #F4F4F4
    // NOTE: We removed the nested <nav> from here. It is now handled globally in App.jsx!
    <div className="min-h-screen bg-[#F4F4F4] font-sans pb-12">
      {/* 1. THE HERO SECTION (Gradient from Deep Teal to Mid Teal) */}
      <div className="bg-gradient-to-r from-[#005461] to-[#018790] pt-12 pb-28 px-8 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Water Quality Intelligence
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
          AI-powered anomaly detection and environmental telemetry forecasting.
        </p>
        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-[#00B7B5] hover:bg-[#009b99] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          + Add New Reading
        </button>
      </div>

      {/* 2. MAIN DASHBOARD CONTENT (Pulled up with -mt-16 to float over the hero) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total Readings
            </p>
            <p className="text-4xl font-extrabold text-[#005461]">
              {totalReadings}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Anomalies Detected
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

        {/* pH Trend Area Chart (Upgraded to AreaChart!) */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 mb-8">
          <h2 className="text-xl font-bold text-[#005461] mb-6">
            Live pH Telemetry
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={readings}>
              <defs>
                {/* This creates the beautiful fade effect under the line */}
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Readings Table */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#005461]">
              Recent Data Logs
            </h2>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F4F4F4]/50 text-[#018790] font-semibold">
              <tr>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">pH</th>
                <th className="px-6 py-4">Turbidity</th>
                <th className="px-6 py-4">Temp (°C)</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {readings.map((reading) => (
                <tr
                  key={reading.id}
                  className="hover:bg-[#F4F4F4]/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {reading.location}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{reading.ph}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {reading.turbidity}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {reading.temperature}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {reading.displayTime}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        reading.status === "ANOMALY"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-[#00B7B5]/10 text-[#018790] border border-[#00B7B5]/20"
                      }`}
                    >
                      {reading.status}
                    </span>
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

      {/* 3. THE MODAL (Clean, White, and Rounded) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#005461]/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[550px] max-w-full">
            <h2 className="text-2xl font-bold text-[#005461] mb-6">
              {editingId ? "Update Reading" : "New Sensor Data"}
            </h2>

            {/* AI UPLOAD BOX (Themed with your colors) */}
            {!editingId && (
              <div className="mb-8 p-6 border-2 border-dashed border-[#00B7B5]/50 bg-[#00B7B5]/5 rounded-2xl text-center transition-all hover:bg-[#00B7B5]/10">
                <p className="text-[#018790] font-bold mb-3 flex items-center justify-center gap-2">
                  <span className="text-xl">🤖</span> AI Vision Scanner
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a water sample image for instant PyTorch analysis.
                </p>
                <label className="cursor-pointer bg-[#00B7B5] hover:bg-[#018790] text-white text-sm font-bold py-2.5 px-6 rounded-full shadow-md transition duration-200 inline-block">
                  {isAILoading ? "Running Neural Network..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isAILoading}
                  />
                </label>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#00B7B5] transition-colors"
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
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#00B7B5] transition-colors"
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
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#00B7B5] transition-colors"
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
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#00B7B5] transition-colors"
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
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-[#00B7B5] transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#005461] hover:bg-[#018790] text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                >
                  {editingId ? "Update Data" : "Save Reading"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
