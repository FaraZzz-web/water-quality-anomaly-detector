import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockReadings = [
  {
    id: 1,
    location: "Delhi-Sector4",
    ph: 7.2,
    turbidity: 2.1,
    temperature: 24,
    dissolvedOxygen: 8.1,
    timestamp: "2024-01-15 08:00",
    status: "NORMAL",
  },
  {
    id: 2,
    location: "Delhi-Sector7",
    ph: 9.4,
    turbidity: 8.3,
    temperature: 26,
    dissolvedOxygen: 5.2,
    timestamp: "2024-01-15 09:00",
    status: "ANOMALY",
  },
  {
    id: 3,
    location: "Noida-Block A",
    ph: 6.8,
    turbidity: 1.9,
    temperature: 23,
    dissolvedOxygen: 9.0,
    timestamp: "2024-01-15 10:00",
    status: "NORMAL",
  },
  {
    id: 4,
    location: "Gurgaon-Zone2",
    ph: 8.9,
    turbidity: 6.7,
    temperature: 27,
    dissolvedOxygen: 4.8,
    timestamp: "2024-01-15 11:00",
    status: "ANOMALY",
  },
  {
    id: 5,
    location: "Delhi-Sector4",
    ph: 7.1,
    turbidity: 2.3,
    temperature: 24,
    dissolvedOxygen: 8.4,
    timestamp: "2024-01-15 12:00",
    status: "NORMAL",
  },
];

function Dashboard() {
  const [readings] = useState(mockReadings);

  const totalReadings = readings.length;
  const anomalyCount = readings.filter((r) => r.status === "ANOMALY").length;
  const normalCount = readings.filter((r) => r.status === "NORMAL").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
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
          <p className="text-sm text-gray-500">Normal Readings</p>
          <p className="text-3xl font-bold text-green-600">{normalCount}</p>
        </div>
      </div>

      {/* pH Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">pH Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={readings}>
            <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 14]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="ph"
              stroke="#1e40af"
              strokeWidth={2}
              dot={{ fill: "#1e40af" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Readings Table */}
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
            </tr>
          </thead>
          <tbody>
            {readings.map((reading, index) => (
              <tr
                key={reading.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3">{reading.location}</td>
                <td className="px-4 py-3">{reading.ph}</td>
                <td className="px-4 py-3">{reading.turbidity}</td>
                <td className="px-4 py-3">{reading.temperature}</td>
                <td className="px-4 py-3">{reading.dissolvedOxygen}</td>
                <td className="px-4 py-3">{reading.timestamp}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      reading.status === "ANOMALY"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {reading.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
