import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  // Hide the navbar if the user is on the login page
  if (location.pathname === "/login") return null;

  // Helper function to highlight the active menu item
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#005461] text-white py-4 px-8 flex justify-between items-center shadow-md relative z-20">
      <Link
        to="/"
        className="text-xl font-extrabold tracking-wide flex items-center gap-2"
      >
        <span className="text-[#00B7B5] text-2xl">≈</span> AquaAI
      </Link>

      <div className="hidden md:flex gap-8 text-sm font-bold text-white/70 items-center">
        <Link
          to="/"
          className={
            isActive("/")
              ? "text-white border-b-2 border-[#00B7B5] pb-1"
              : "hover:text-white transition"
          }
        >
          Dashboard
        </Link>

        <Link
          to="/upload"
          className={
            isActive("/upload")
              ? "text-white border-b-2 border-[#00B7B5] pb-1"
              : "hover:text-white transition"
          }
        >
          Upload CSV
        </Link>

        <Link
          to="/anomalies"
          className={
            isActive("/anomalies")
              ? "text-white border-b-2 border-[#00B7B5] pb-1"
              : "hover:text-white transition"
          }
        >
          Anomaly Alerts
        </Link>

        {/* Login/Logout Button styled with your cyan accent */}
        <Link
          to="/login"
          className="ml-4 bg-[#00B7B5]/20 hover:bg-[#00B7B5]/40 text-[#00B7B5] px-5 py-2 rounded-full transition"
        >
          Logout
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
