import { useState, useEffect } from "react";

function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all readings and filter out only the dangerous ones
    fetch("http://localhost:8080/api/readings")
      .then((response) => response.json())
      .then((data) => {
        // Filter for anomalies and sort so the newest ones are at the top
        const dangerousReadings = data
          .filter((item) => item.status === "ANOMALY")
          .sort((a, b) => b.id - a.id)
          .map((item) => ({
            ...item,
            displayTime: new Date(item.timestamp).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          }));

        setAnomalies(dangerousReadings);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching anomalies:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="pt-20 text-[#005461] font-bold text-center">
        Scanning database for critical alerts...
      </div>
    );
  }

  return (
    // Added pt-12 to push it down from the new Top Navbar
    <div className="max-w-6xl mx-auto pt-16 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Area */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#005461] mb-2 tracking-tight flex items-center gap-3">
            <span className="text-red-500 text-3xl">⚠️</span> Threat Detection
          </h1>
          <p className="text-gray-500 text-lg">
            Review critical water quality violations requiring immediate
            attention.
          </p>
        </div>

        {/* Active Threat Counter */}
        <div className="bg-red-50 border border-red-100 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="relative flex h-4 w-4">
            {anomalies.length > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-4 w-4 ${anomalies.length > 0 ? "bg-red-500" : "bg-green-500"}`}
            ></span>
          </div>
          <span className="font-bold text-[#005461]">
            {anomalies.length} Active{" "}
            {anomalies.length === 1 ? "Alert" : "Alerts"}
          </span>
        </div>
      </div>

      {/* The Anomalies Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        {anomalies.length === 0 ? (
          // SAFE STATE: No Anomalies
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="bg-green-50 p-6 rounded-full mb-6">
              <span className="text-6xl">🌿</span>
            </div>
            <h2 className="text-2xl font-bold text-[#005461] mb-2">
              Ecosystem is Stable
            </h2>
            <p className="text-gray-500">
              All sensors are reporting safe pH and turbidity levels. No toxic
              anomalies found in the database.
            </p>
          </div>
        ) : (
          // DANGER STATE: Table of Anomalies
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-red-50/50 text-red-800 font-semibold border-b border-red-100">
                <tr>
                  <th className="px-6 py-5">Location</th>
                  <th className="px-6 py-5">pH Alert</th>
                  <th className="px-6 py-5">Turbidity Alert</th>
                  <th className="px-6 py-5">Temp (°C)</th>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-6 py-5 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {anomalies.map((reading) => {
                  // Figure out exactly WHY it's an anomaly so we can highlight the specific bad numbers
                  const isPhBad = reading.ph < 6.5 || reading.ph > 8.5;
                  const isTurbidityBad = reading.turbidity > 5.0;

                  return (
                    <tr
                      key={reading.id}
                      className="hover:bg-red-50/30 transition-colors"
                    >
                      <td className="px-6 py-5 font-bold text-gray-900">
                        {reading.location}
                      </td>

                      {/* FIXED TYPO HERE! isPhBad instead of isPhPhBad */}
                      <td
                        className={`px-6 py-5 font-bold ${isPhBad ? "text-red-600 bg-red-50/50" : "text-gray-600"}`}
                      >
                        {reading.ph}
                        {isPhBad && (
                          <span className="text-xs ml-1 block text-red-400">
                            Out of bounds
                          </span>
                        )}
                      </td>

                      {/* Highlight bad Turbidity in red */}
                      <td
                        className={`px-6 py-5 font-bold ${isTurbidityBad ? "text-red-600 bg-red-50/50" : "text-gray-600"}`}
                      >
                        {reading.turbidity}
                        {isTurbidityBad && (
                          <span className="text-xs ml-1 block text-red-400">
                            Too high
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {reading.temperature}
                      </td>
                      <td className="px-6 py-5 text-gray-500 text-xs">
                        {reading.displayTime}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm">
                          CRITICAL
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Anomalies;
