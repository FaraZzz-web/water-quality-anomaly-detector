import { useState } from "react";

function Upload() {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // This function runs when you select a file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadStatus("Parsing CSV file...");

    // HTML5 FileReader reads the text inside the file
    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target.result;
      const lines = csvText.split("\n"); // Split by new line

      const jsonData = [];

      // Loop through every line (skipping the first line, which is usually headers)
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty rows at the bottom

        const values = lines[i].split(","); // Split by comma

        // Package it into the exact format Spring Boot is expecting
        jsonData.push({
          location: values[0].trim(),
          ph: parseFloat(values[1]),
          turbidity: parseFloat(values[2]),
          temperature: parseFloat(values[3]),
          dissolvedOxygen: parseFloat(values[4]),
        });
      }

      setUploadStatus(
        `Sending ${jsonData.length} rows to the Spring Boot brain...`,
      );

      // Shoot the massive array to your new /bulk endpoint!
      fetch("http://localhost:8080/api/readings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Upload failed");
          return response.json();
        })
        .then(() => {
          setUploadStatus(
            `✅ Success! ${jsonData.length} readings were analyzed and saved to PostgreSQL.`,
          );
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setUploadStatus(
            "❌ Error uploading data. Make sure the CSV format is correct.",
          );
          setIsLoading(false);
        });
    };

    // Trigger the file reading
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">
        Bulk Data Upload
      </h1>
      <p className="text-gray-600 mb-8">
        Upload a CSV file from your remote water sensors to instantly process
        and flag anomalies.
      </p>

      <div className="bg-white rounded-lg shadow-md p-8 border-2 border-dashed border-blue-300 text-center">
        <svg
          className="mx-auto h-12 w-12 text-blue-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded shadow transition duration-200 inline-block">
          Select CSV File
          {/* This input is hidden, the label acts as the button! */}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <p className="mt-4 text-sm text-gray-500">
          Format required: Location, pH, Turbidity, Temp, Oxygen
        </p>

        {/* Status Message Area */}
        {uploadStatus && (
          <div
            className={`mt-6 p-4 rounded font-medium ${uploadStatus.includes("❌") ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-800"}`}
          >
            {isLoading ? <span className="animate-pulse">⏳ </span> : null}
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
