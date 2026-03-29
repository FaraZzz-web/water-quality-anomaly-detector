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

  // AI States
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
    setForecastReport(null);
    setIsDispatched(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const url = editingId
      ? `http://localhost:8080/api/readings/${editingId}`
      : "http://localhost:8080/api/readings";
    const method = editingId ? "PUT" : "POST";

    const isCritical = forecastReport
      ? forecastReport.status.includes("CRITICAL")
      : false;

    // THE KEY FIX: Added 'id: editingId' and 'timestamp' refresh
    const finalPayload = {
      ...formData,
      id: editingId, // Essential for Java to correctly overwrite the record
      timestamp: new Date().toISOString(), // This forces the time to update to 'Now'
      status: forecastReport
        ? isCritical
          ? "CRITICAL"
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
        fetchReadings(); // Refreshes the table with fresh data from Postgres
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

    fetch("http://localhost:5000/predict", {
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

  const totalReadings = readings.length;
  // Updated filter to count both old "ANOMALY" and new "CRITICAL" labels
  const anomalyCount = readings.filter(
    (r) => r.status === "CRITICAL" || r.status === "ANOMALY",
  ).length;
  const normalCount = totalReadings - anomalyCount;

  if (isLoading)
    return (
      <div className="p-8 text-[#005461] font-bold text-center mt-20">
        Loading Database...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-sans pb-12">
      <div className="bg-gradient-to-r from-[#005461] to-[#018790] pt-12 pb-28 px-8 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Water Quality Intelligence
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
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

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 mb-8">
          <h2 className="text-xl font-bold text-[#005461] mb-6">
            Live pH Telemetry
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={readings}>
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#005461]">
              Intelligence Log & Hardware Status
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
                <th className="px-6 py-4">AI Status</th>
                <th className="px-6 py-4 text-center">IoT Valve</th>
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
                        reading.status === "CRITICAL" ||
                        reading.status === "ANOMALY"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-[#00B7B5]/10 text-[#018790] border border-[#00B7B5]/20"
                      }`}
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
                      className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-500 ${
                        forecastReport.status.includes("CRITICAL")
                          ? "bg-red-50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                          : "bg-green-50 border-green-400"
                      }`}
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
                          ? "✅ Manual Protocol Dispatched"
                          : "Dispatch Emergency Protocol"}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      handleSubmit();
                      handleDownloadPDF();
                    }}
                    disabled={isGeneratingPDF}
                    className="w-full bg-[#005461] hover:bg-[#018790] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
                  >
                    {isGeneratingPDF
                      ? "Saving & Generating..."
                      : "💾 Update Entry & Download PDF"}
                  </button>
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
                    // In a production app, we would enable the button,
                    // but for this flow, we force the AI verification button above.
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
