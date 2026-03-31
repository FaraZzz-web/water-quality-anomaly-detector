import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Anomalies from "./pages/Anomalies";
import Login from "./pages/Login";
import CitizenPortal from "./pages/CitizenPortal"; // Make sure the file is in the 'pages' folder!

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F4F4F4]">
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/login" element={<Login />} />

          {/* Changed from /public to /portal to avoid Vite folder conflicts! */}
          <Route path="/portal" element={<CitizenPortal />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
