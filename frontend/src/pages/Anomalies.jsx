import { useState, useEffect } from "react";

function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch data, but FILTER for Anomalies only!
  const fetchAnomalies = () => {
    fetch("http://localhost:8080/api/readings")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        // Only keep the rows where status is "ANOMALY"
        const toxicData = data.filter((item) => item.status === "ANOMALY");

        // Format the timestamps just like the dashboard
        const formattedData = toxicData.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp).toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          }),
        }));

        setAnomalies(formattedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  // 2. The DELETE Request! (Talking to your Spring Boot @DeleteMapping)
  const handleDelete = (id) => {
    // Add a quick browser confirmation box so you don't delete by accident
    if (
      window.confirm(
        "Are you sure you want to delete this toxic reading from the database?",
      )
    ) {
      fetch(`http://localhost:8080/api/readings/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            // If the backend says "deleted!", refresh the list on the screen
            fetchAnomalies();
          } else {
            alert("Failed to delete. Check console.");
          }
        })
        .catch((error) => console.error("Error deleting:", error));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-red-900 font-bold">
        Scanning database for toxic anomalies...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <svg
          className="w-8 h-8 text-red-600 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-red-900">
          Critical Anomalies Detected
        </h1>
      </div>

      <p className="text-gray-600 mb-8">
        The following water readings have failed the safety checks (pH outside
        6.5-8.5 or Turbidity &gt; 5.0). Immediate action required.
      </p>

      {/* The Red Alert Table */}
      <div className="bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-red-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">pH Alert</th>
              <th className="px-4 py-3 text-left">Turbidity Alert</th>
              <th className="px-4 py-3 text-left">Temp (°C)</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-12 text-center text-green-600 font-semibold text-lg"
                >
                  ✅ All clear! No toxic anomalies found in the database.
                </td>
              </tr>
            ) : (
              anomalies.map((reading, index) => {
                // Let's highlight EXACTLY what is wrong with the water
                const isPhBad = reading.ph < 6.5 || reading.ph > 8.5;
                const isTurbidityBad = reading.turbidity > 5.0;

                return (
                  <tr
                    key={reading.id}
                    className={index % 2 === 0 ? "bg-red-50" : "bg-white"}
                  >
                    <td className="px-4 py-4 font-bold text-gray-800">
                      {reading.location}
                    </td>

                    <td className="px-4 py-4">
                      {isPhBad ? (
                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded font-bold">
                          {reading.ph} ⚠️
                        </span>
                      ) : (
                        <span className="text-gray-500">{reading.ph}</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {isTurbidityBad ? (
                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded font-bold">
                          {reading.turbidity} ⚠️
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {reading.turbidity}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {reading.temperature}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {reading.timestamp}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDelete(reading.id)}
                        className="bg-red-600 hover:bg-red-800 text-white font-semibold py-1 px-3 rounded shadow transition duration-200"
                      >
                        Delete Record
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Anomalies;
