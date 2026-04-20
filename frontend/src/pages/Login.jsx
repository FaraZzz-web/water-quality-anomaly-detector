import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Ye ab asli API call karega Spring Boot ko
  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // 1. Spring Boot ke API par request bhej rahe hain
      const response = await fetch(
        "https://water-quality-backend-0z6s.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      // 2. Agar Spring Boot ne 'OK' bola (Password sahi hai)
      if (response.ok) {
        const data = await response.json();

        // 3. Jo JWT Token server ne bheja, usko browser mein save kar lo
        localStorage.setItem("token", data.token);
        console.log("Secure Token Received: ", data.token); // Browser console mein check karne ke liye

        // 4. Admin ko main dashboard par bhej do
        navigate("/");
      } else {
        // Agar password galat hai toh error dikhao
        setError("Invalid Admin Credentials or Access Denied.");
      }
    } catch (err) {
      setError("Backend server is offline. Please start Spring Boot.");
    }
  }

  return (
    /* Full-screen dark teal background to match your Navbar */
    <div className="min-h-screen bg-[#005461] flex items-center justify-center p-4 relative z-10">
      {/* Background aesthetic circles (optional, just makes it look premium) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00B7B5] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#003840] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-t-8 border-[#00B7B5] relative z-20">
        <div className="flex flex-col items-center justify-center mb-8">
          {/* Uses the exact same logo from your Navbar */}
          <img
            src="/logo.png"
            alt="Luqora Logo"
            className="h-12 w-auto mb-3 drop-shadow-sm"
          />
          <h1 className="text-3xl font-extrabold text-[#005461] tracking-wide">
            Luqora
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-bold tracking-widest uppercase">
            Admin Command Center
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded mb-6 font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-extrabold text-[#005461] tracking-wide uppercase">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@water.com"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mt-1 text-sm focus:outline-none focus:border-[#00B7B5] focus:ring-1 focus:ring-[#00B7B5] transition bg-gray-50 text-gray-800 font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-extrabold text-[#005461] tracking-wide uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mt-1 text-sm focus:outline-none focus:border-[#00B7B5] focus:ring-1 focus:ring-[#00B7B5] transition bg-gray-50 text-gray-800 font-medium"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-[#00B7B5] text-white py-3.5 rounded-lg font-extrabold text-lg tracking-wide hover:bg-[#009d9b] shadow-lg shadow-[#00B7B5]/40 transition-all mt-4 transform hover:-translate-y-0.5"
          >
            SECURE LOGIN
          </button>

          {/* --- YAHAN HAI TERA NAYA BACK BUTTON --- */}
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-2 text-sm font-bold text-gray-400 hover:text-[#005461] transition-colors flex justify-center items-center gap-2 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to Public Portal
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
