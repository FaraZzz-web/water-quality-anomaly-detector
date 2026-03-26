import { useState } from "react";

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setStatus("");
  }

  function handleUpload() {
    if (!file) {
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Upload CSV</h1>

      <div className="bg-white rounded-lg shadow p-8 max-w-lg">
        <p className="text-gray-500 text-sm mb-6">
          Upload a CSV file containing water quality readings. Required columns:
          location, ph, turbidity, temperature, dissolved_oxygen, timestamp
        </p>

        {/* File Input */}
        <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center mb-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csvInput"
          />
          <label htmlFor="csvInput" className="cursor-pointer">
            <p className="text-4xl mb-2">📂</p>
            <p className="text-blue-600 font-medium">
              Click to select CSV file
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Only .csv files accepted
            </p>
          </label>
        </div>

        {/* Selected File Name */}
        {file && (
          <div className="bg-blue-50 rounded px-4 py-2 mb-4 text-sm text-blue-800">
            Selected: <span className="font-semibold">{file.name}</span>
          </div>
        )}

        {/* Status Messages */}
        {status === "success" && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">
            ✅ File uploaded successfully!
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            ❌ Please select a file first.
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="w-full bg-blue-800 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Upload & Analyse
        </button>
      </div>
    </div>
  );
}

export default Upload;
