# 🌊 Luqora - Smart Water Monitoring System

Welcome to **Luqora**, a next-gen full-stack solution designed for real-time water quality monitoring and anomaly detection. 

## 🚀 Project Overview
Luqora is built to handle environmental data with precision. It features a high-performance **Admin Command Center** for data management and a **Public Citizen Portal** for transparency, ensuring that water quality information is both secure and accessible.

## 💻 Tech Stack & Frontend Excellence

### **Frontend Architecture**
* **React.js (Vite):** Blazing fast development and optimized build tool.
* **Tailwind CSS:** Premium styling with a focus on dark-teal aesthetics and glassmorphism.
* **React Router v6:** Implemented **Private Routes** (Bouncer) to secure the admin dashboard.
* **State Management:** Managed via React Hooks (`useState`, `useEffect`) for seamless data flow.
* **Asynchronous Operations:** Used `Fetch API` with `Async/Await` for clean, non-blocking backend communication.

### **Backend & Security**
* **Java Spring Boot:** Robust enterprise-level backend logic.
* **Spring Security & JWT:** Stateless authentication ensuring zero unauthorized access.
* **PostgreSQL:** Relational database for structured data storage.

---

## ✨ Key Features

### 🛡️ Admin Security (The Powerhouse)
* **JWT Implementation:** Secure tokens issued on login, stored in `localStorage`.
* **Route Protection:** Custom `ProtectedRoute` component ensures that the `/dashboard`, `/upload`, and `/anomalies` pages are invisible to unauthorized users.
* **Session Management:** Integrated Logout functionality that clears tokens and redirects users instantly.
### Login Details
In order to see the dashboard,
* Username: admin@water.com
* password: password123

### 📊 Frontend Dashboard
* **Dynamic UI:** Responsive design that adapts to all screen sizes.
* **Anomaly Alerts:** Real-time visual indicators for water quality deviations.
* **Modern Aesthetics:** Use of animated blobs, custom gradients, and SVG iconography for a premium feel.

### 🌐 Citizen Transparency
* **Public Access:** A dedicated portal for citizens to view safety reports without needing an account.

---
## 📂 Project Structure (Frontend & Backend)
```text
src/
 ├── components/       # Reusable UI (Navbar, ProtectedRoute)
 ├── pages/            # Core Pages (Dashboard, Login, Upload, Portal)
 ├── assets/           # Project branding and logos
 ├── App.jsx           # Main Routing Hub & Security Logic
 └── main.jsx          # Entry point

waterquality/                     # Spring Boot Backend Root
│
├── src/main/java/.../waterquality/
│   ├── controller/              # REST API Endpoints (AuthController, WaterReadingController)
│   ├── models/                  # Database Entities (User, WaterReading, AnomalyAlert)
│   ├── service/                 # Core Business Logic (DataAnalyzer)
│   ├── util/                    # Helper Classes (JwtUtil, CsvReader)
│   ├── SecurityConfig.java      # Spring Security & JWT Configuration
│   ├── UserRepository.java      # JPA Data Access
│   ├── WaterReadingRepository.java
│   └── WaterqualityApplication.java  # Main Spring Boot Application Class
│
├── src/main/resources/
│   └── application.properties   # Database credentials and JWT secrets
│
└── pom.xml                      # Maven Dependencies & Build Config
