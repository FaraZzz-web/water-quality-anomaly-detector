import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Upload CSV", path: "/upload" },
  { label: "Anomalies", path: "/anomalies" },
];

function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 min-h-screen bg-blue-900 text-white flex flex-col p-6">
      <h2 className="text-xl font-bold mb-8">💧 Water Quality</h2>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
