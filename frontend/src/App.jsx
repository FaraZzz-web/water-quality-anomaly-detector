import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Anomalies from "./pages/Anomalies";
import Login from "./pages/Login";
import CitizenPortal from "./pages/CitizenPortal";

// 🛡️ THE BOUNCER (Protected Route Component)
// Ye function har secure page se pehle chalega
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Jeb check kar raha hai

  if (!token) {
    // Agar pass nahi mila, toh chup-chaap login page par phenk do
    return <Navigate to="/login" replace />;
  }

  // Agar pass mil gaya, toh andar aane do
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F4F4F4]">
        <Navbar />

        <Routes>
          {/* 🟢 PUBLIC ROUTES (Bina token ke koi bhi ja sakta hai) */}
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<CitizenPortal />} />

          {/* 🔴 SECURE ROUTES (Bouncer ke peeche) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/anomalies"
            element={
              <ProtectedRoute>
                <Anomalies />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
