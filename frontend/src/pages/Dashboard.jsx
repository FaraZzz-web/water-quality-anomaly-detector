import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
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

  // NEW: State to show a loading spinner when the AI is thinking
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

  // ------------------------------------------------------------------
  // 🧠 NEW: THE AI BRIDGE FUNCTION
  // ------------------------------------------------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAILoading(true);

    // Package the image securely
    const imagePayload = new FormData();
    imagePayload.append("file", file);

    // Shoot it to Spring Boot!
    fetch("http://localhost:8080/api/readings/analyze", {
      method: "POST",
      body: imagePayload, // Notice we don't need 'Content-Type', the browser handles it for files!
    })
      .then((response) => response.json())
      .then((aiData) => {
        setIsAILoading(false);
        // Alert the user of the AI's findings
        alert(
          `🧠 AI Analysis Complete!\n\nDiagnosis: ${aiData.status}\nConfidence: ${aiData.confidence * 100}%\nMessage: ${aiData.message}`,
        );

        // Auto-fill the form with dummy data to simulate the AI's estimation!
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
      <div className="p-8 text-blue-900 font-bold">
        Loading secure data from PostgreSQL...
      </div>
    );

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Live Dashboard</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200"
        >
          + Add Reading
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <p className="text-sm text-gray-500">Total Readings</p>
          <p className="text-3xl font-bold text-blue-800">{totalReadings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <p className="text-sm text-gray-500">Anomalies Detected</p>
          <p className="text-3xl font-bold text-red-600">{anomalyCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <p className="text-sm text-gray-500">Normal / Pending</p>
          <p className="text-3xl font-bold text-green-600">{normalCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">
          Live pH Trend
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={readings}>
            <XAxis dataKey="displayTime" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 14]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="ph"
              stroke="#1e40af"
              strokeWidth={2}
              dot={{ fill: "#1e40af", r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">pH</th>
              <th className="px-4 py-3 text-left">Turbidity</th>
              <th className="px-4 py-3 text-left">Temp (°C)</th>
              <th className="px-4 py-3 text-left">Dissolved O₂</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading, index) => (
              <tr
                key={reading.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-medium">{reading.location}</td>
                <td className="px-4 py-3">{reading.ph}</td>
                <td className="px-4 py-3">{reading.turbidity}</td>
                <td className="px-4 py-3">{reading.temperature}</td>
                <td className="px-4 py-3">{reading.dissolvedOxygen}</td>
                <td className="px-4 py-3 text-gray-500">
                  {reading.displayTime}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${reading.status === "ANOMALY" ? "bg-red-100 text-red-700" : reading.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700"}`}
                  >
                    {reading.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEditClick(reading)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    ✎ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-w-full mx-4">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              {editingId ? "Edit Water Reading" : "Add New Water Reading"}
            </h2>

            {/* 🧠 NEW: THE AI UPLOAD BOX */}
            {!editingId && (
              <div className="mb-6 p-4 border-2 border-dashed border-purple-400 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-purple-800 font-semibold mb-2">
                  🤖 AI Vision Pre-Check
                </p>
                <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded shadow transition duration-200 inline-block">
                  {isAILoading
                    ? "Analyzing Pixels..."
                    : "Upload Water Sample Image"}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2.5 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded hover:bg-blue-700 transition-colors shadow-md"
                >
                  {editingId ? "Update Data" : "Save Data"}
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
