import { useState } from "react";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    // Apna JWT Token localStorage se nikalo (Make sure naam match kare jo tune login ke time save kiya tha, jaise 'token' ya 'jwt')
    const token = localStorage.getItem("token");

    try {
      // Axios ke zariye request bhejo, Content-Type auto set ho jayega boundary ke sath
      const response = await axios.post(
        "http://localhost:8080/api/readings/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Agar response successful (2xx status code) hai toh:
      if (response.status === 200 || response.status === 201) {
        setUploadStatus("success");
      } else {
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Upload error details:", error.response || error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
      setFile(null); // Clear the file input field
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-16 px-6 sm:px-8">
      {/* Header Area */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-[#005461] mb-4 tracking-tight">
          Bulk Data Upload
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Upload a CSV file from your remote water sensors to instantly process,
          store, and flag anomalies across your entire network.
        </p>
      </div>

      {/* The Upload Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center border border-gray-100">
        {/* The Drag & Drop Zone */}
        <div className="border-2 border-dashed border-[#00B7B5]/50 bg-[#00B7B5]/5 rounded-2xl p-12 mb-8 transition-all hover:bg-[#00B7B5]/10 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-full shadow-md mb-4 text-[#018790]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <label className="cursor-pointer bg-[#00B7B5] hover:bg-[#018790] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 inline-block mb-4">
            {file ? file.name : "Select CSV File"}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-400 font-medium">
            Format required: Location, pH, Turbidity, Temp, Oxygen
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full md:w-auto px-12 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-200 ${
            !file || isUploading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#005461] hover:bg-[#018790] text-white hover:shadow-xl hover:-translate-y-0.5"
          }`}
        >
          {isUploading ? "Processing Data..." : "Process & Save to Database"}
        </button>

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="mt-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex items-center justify-center gap-2">
            <span>✅</span> CSV Processed successfully! All records saved.
          </div>
        )}
        {uploadStatus === "error" && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-2">
            <span>⚠️</span> Error uploading file. Please check console for
            details.
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
