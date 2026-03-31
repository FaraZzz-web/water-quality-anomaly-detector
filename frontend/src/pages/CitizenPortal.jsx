import { useState, useEffect } from "react";

function CitizenPortal() {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("");

  // Fetch the exact same data from your backend
  useEffect(() => {
    fetch("http://localhost:8080/api/readings")
      .then((response) => response.json())
      .then((data) => {
        // Sort by ID to ensure we always get chronological order
        const sortedData = data.sort((a, b) => a.id - b.id);
        setReadings(sortedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  // Extract unique locations for the dropdown
  const uniqueLocations = [...new Set(readings.map((r) => r.location))];

  // Get the most recent reading for the chosen location
  const locationReadings = readings.filter(
    (r) => r.location === selectedLocation,
  );
  const currentStatus =
    locationReadings.length > 0
      ? locationReadings[locationReadings.length - 1]
      : null;

  const isDanger =
    currentStatus &&
    (currentStatus.status === "CRITICAL" || currentStatus.status === "ANOMALY");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-[#005461] font-black text-xl animate-pulse">
          Connecting to Public Grid...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center py-12 px-4 sm:px-6">
      {/* 1. Header Section */}
      <div className="text-center max-w-2xl w-full mb-10">
        <div className="inline-flex items-center gap-2 bg-[#00B7B5]/10 px-4 py-2 rounded-full text-[#018790] font-bold text-xs tracking-widest uppercase mb-4 border border-[#00B7B5]/20">
          <span className="w-2 h-2 rounded-full bg-[#00B7B5] animate-pulse"></span>
          Live Public Data
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          City Water Quality Portal
        </h1>
        <p className="text-slate-500 text-lg">
          Check the real-time drinking water safety status for your specific
          neighborhood.
        </p>
      </div>

      {/* 2. Search / Selection Area */}
      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 relative z-20">
        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
          Select Your Neighborhood
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-lg font-bold rounded-xl focus:ring-[#00B7B5] focus:border-[#00B7B5] p-4 outline-none cursor-pointer transition-colors"
        >
          <option value="" disabled>
            -- Select a Location --
          </option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Dynamic Status Card */}
      {selectedLocation && currentStatus && (
        <div className="w-full max-w-md animate-fade-in relative z-10">
          {/* Main Threat Indicator */}
          <div
            className={`overflow-hidden rounded-3xl shadow-2xl ${isDanger ? "bg-red-600 shadow-red-500/30" : "bg-[#10B981] shadow-green-500/30"}`}
          >
            <div className="p-8 text-center text-white">
              <div className="text-7xl mb-4">{isDanger ? "⚠️" : "✅"}</div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">
                {isDanger ? "DO NOT CONSUME" : "SAFE TO DRINK"}
              </h2>
              <p className="text-white/80 font-medium text-sm">
                {isDanger
                  ? "A critical contamination threshold has been breached. The municipal supply valve has been autonomously locked."
                  : "Water parameters are within normal biological and chemical limits. Flow is active."}
              </p>
            </div>

            {/* Detailed Metrics Panel */}
            <div className="bg-white p-6 rounded-t-3xl mt-[-10px] flex flex-col gap-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500 font-bold text-sm uppercase tracking-wide">
                  Current pH Level
                </span>
                <span
                  className={`text-xl font-black ${isDanger && (currentStatus.ph < 6.5 || currentStatus.ph > 8.5) ? "text-red-500" : "text-slate-800"}`}
                >
                  {currentStatus.ph}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500 font-bold text-sm uppercase tracking-wide">
                  Turbidity (NTU)
                </span>
                <span
                  className={`text-xl font-black ${isDanger && currentStatus.turbidity > 5.0 ? "text-red-500" : "text-slate-800"}`}
                >
                  {currentStatus.turbidity}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500 font-bold text-sm uppercase tracking-wide">
                  Last Updated
                </span>
                <span className="text-sm font-bold text-slate-400">
                  {new Date(currentStatus.timestamp).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Callout for Citizens */}
          {isDanger && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4 items-start">
              <div className="text-2xl mt-1">🚨</div>
              <div>
                <h4 className="text-red-800 font-black text-sm uppercase tracking-wide mb-1">
                  Boil Water Advisory
                </h4>
                <p className="text-red-600 text-xs font-medium leading-relaxed">
                  Authorities have been dispatched. Do not drink tap water
                  without boiling it vigorously for at least 3 minutes.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedLocation && (
        <div className="mt-8 text-center text-slate-400 flex flex-col items-center">
          <span className="text-4xl mb-3 opacity-50">📍</span>
          <p className="font-bold text-sm uppercase tracking-widest">
            Select a location above to view live status.
          </p>
        </div>
      )}
    </div>
  );
}

export default CitizenPortal;
