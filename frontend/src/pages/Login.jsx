import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogin() {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    // Mocked login — in Step 05 this will call Spring Boot API
    if (email === "admin@water.com" && password === "admin123") {
      localStorage.setItem("token", "mock-jwt-token");
      navigate("/");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-blue-900 mb-2 text-center">
          💧 Water Quality
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          Sign in to your account
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@water.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-800 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-2"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
