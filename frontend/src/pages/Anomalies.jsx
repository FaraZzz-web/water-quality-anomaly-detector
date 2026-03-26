const mockAnomalies = [
  {
    id: 1,
    location: "Delhi-Sector7",
    ph: 9.4,
    turbidity: 8.3,
    riskLevel: "HIGH",
    anomalyScore: 0.87,
    timestamp: "2024-01-15 09:00",
  },
  {
    id: 2,
    location: "Gurgaon-Zone2",
    ph: 8.9,
    turbidity: 6.7,
    riskLevel: "MEDIUM",
    anomalyScore: 0.63,
    timestamp: "2024-01-15 11:00",
  },
  {
    id: 3,
    location: "Noida-Block C",
    ph: 10.1,
    turbidity: 9.2,
    riskLevel: "CRITICAL",
    anomalyScore: 0.95,
    timestamp: "2024-01-15 14:00",
  },
];

function getRiskStyle(risk) {
  if (risk === "CRITICAL")
    return "bg-red-100 text-red-800 border border-red-300";
  if (risk === "HIGH")
    return "bg-orange-100 text-orange-800 border border-orange-300";
  if (risk === "MEDIUM")
    return "bg-yellow-100 text-yellow-800 border border-yellow-300";
  return "bg-green-100 text-green-800 border border-green-300";
}

function Anomalies() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Anomaly Alerts</h1>

      <div className="flex flex-col gap-4">
        {mockAnomalies.map((anomaly) => (
          <div key={anomaly.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-blue-900">
                {anomaly.location}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskStyle(anomaly.riskLevel)}`}
              >
                {anomaly.riskLevel}
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <span>
                pH: <strong>{anomaly.ph}</strong>
              </span>
              <span>
                Turbidity: <strong>{anomaly.turbidity}</strong>
              </span>
              <span>
                Anomaly Score: <strong>{anomaly.anomalyScore}</strong>
              </span>
              <span>
                Time: <strong>{anomaly.timestamp}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Anomalies;
