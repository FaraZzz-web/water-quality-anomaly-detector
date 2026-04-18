# 🌊 Luqora - Smart Water Monitoring System

Welcome to **Luqora**, a comprehensive full-stack application designed to monitor water quality, detect anomalies, and spread awareness through a secure Admin Command Center and a public Citizen Portal.

## 🚀 Project Overview
Luqora bridges the gap between environmental monitoring and public awareness. It provides administrators with a secure dashboard to upload data and track water quality anomalies, while offering everyday citizens a portal to view the safety of their local water sources.

## 💻 Tech Stack
This project is built using a modern, scalable full-stack architecture:

**Frontend:**
* React.js (Vite)
* Tailwind CSS (For premium, responsive UI)
* React Router v6 (For secure routing & navigation)

**Backend:**
* Java Spring Boot
* Spring Security (For robust API protection)
* JSON Web Tokens (JWT) (For stateless, secure authentication)

**Database:**
* PostgreSQL

## ✨ Key Features
* **🔒 Secure Admin Command Center:** Industry-standard JWT authentication for admin login.
* **🛡️ Protected Routes:** Frontend "Bouncer" implementation preventing unauthorized access to the dashboard.
* **📊 Dashboard & Anomaly Tracking:** Interface for admins to monitor water quality data.
* **📁 CSV Uploads:** Seamless data ingestion for water readings.
* **🌐 Public Citizen Portal:** An open-access page for the general public to view water safety status without requiring login.
* **🚪 Secure Logout:** Complete token lifecycle management.

## 🛠️ How to Run the Project Locally

### 1. Database Setup
* Ensure PostgreSQL is running on your machine.
* Create a database named `waterquality`.
* The Spring Boot application will automatically generate the required tables (`users`, etc.) on the first run.
* *Note: Insert an admin user manually into the database to access the dashboard.*

### 2. Backend Setup (Spring Boot)
1. Navigate to the backend directory.
2. Ensure your `application.properties` has the correct PostgreSQL credentials.
3. Run the Spring Boot application (Server starts on Port 8080).

### 3. Frontend Setup (React)
1. Open a new terminal and navigate to the frontend folder.
2. Install dependencies:
   ```bash
   npm install
