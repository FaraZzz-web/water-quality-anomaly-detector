import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // IMPORT THE NEW NAVBAR
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Anomalies from "./pages/Anomalies";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F4F4F4]">
        {/* The Navbar will now sit at the very top of the app globally */}
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
