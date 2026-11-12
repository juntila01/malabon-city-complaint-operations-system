# An AI-Assisted Online Complaint and Operations Management System for the Malabon City Action Team

An AI-assisted web-based complaint and operations management system developed to help the Malabon City Action Team (MCAT) receive, analyze, monitor, and manage citizen complaints. The system integrates artificial intelligence to assist in complaint categorization, urgency assessment, and complaint analysis while providing administrative tools for complaint verification, dispatch management, notifications, and operational analytics.

---

## Group Members & Roles

- **Palada, Joshua A.** – Project Leader / Documentation / System Tester
- **Batiancila, Gene Auria** – Documentation
- **Cabubas, Kenny O.** – Documentation
- **Hemar, Justine B.** – Documentation
- **Juntila, Romeo Jr R.** – Project Manager / Database Administrator / Lead Programmer
- **Masallo, Archie J.** – Documentation / System Tester

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Tailwind CSS
- **Backend:** PHP
- **Database:** MySQL
- **Database Connectivity:** PHP Data Objects (PDO)
- **Artificial Intelligence:** Google Gemini API
- **Authentication:** Google OAuth and Email/Password Authentication
- **Email Services:** PHPMailer
- **Mapping Services:** Google Maps API (if configured)
- **Development Environment:** XAMPP
- **Code Editor:** Visual Studio Code

---

## System Requirements & Prerequisites

Before installing the system, make sure you have the following:

- Windows operating system (or another OS supported by XAMPP)
- XAMPP with Apache and MySQL
- Compatible PHP version
- MySQL or MariaDB
- Visual Studio Code or another code editor
- Google Chrome or another modern web browser
- Internet connection for AI analysis, Google authentication, and external services

---

## Installation & Setup Instructions

### 1. Clone the Repository

Open your terminal or command prompt and execute:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

Navigate to the project directory:

```bash
cd YOUR-REPOSITORY
```

Alternatively, download the repository as a ZIP file and extract it.

### 2. Move the Project to XAMPP

Move or copy the project folder into your XAMPP `htdocs` directory.

Example:

```text
C:\xampp\htdocs\Complaint\
```

### 3. Start XAMPP Services

1. Open the XAMPP Control Panel.
2. Start Apache.
3. Start MySQL.
4. Make sure both services are running.

### 4. Configure the Database

1. Open your browser and navigate to:

   http://localhost/phpmyadmin

2. Create a new database named:

```sql
complaintdb
```

3. Locate the database backup inside the repository:

```text
database/complaintdb.sql
```

4. Select the newly created `complaintdb` database.
5. Open the Import tab.
6. Select the SQL backup file and click Import.

**Note:** The imported database contains the tables and relationships required by the application.

### 5. Configure Environment Variables

The application uses external services that require API keys and credentials.

For security purposes, actual API keys and passwords are not included in this public repository.

1. Locate the `.env.example` file in the project root.
2. Create a copy of the file.
3. Rename the copied file to `.env`.
4. Obtain your own API keys and credentials.
5. Replace the placeholder values with your own credentials.

Example configuration:

```env
# AI Configuration
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google Authentication
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Google Maps
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

# Database Configuration
DB_HOST=localhost
DB_NAME=complaintdb
DB_USER=root
DB_PASS=

# Email Configuration
SMTP_HOST=YOUR_SMTP_HOST
SMTP_USERNAME=YOUR_EMAIL
SMTP_PASSWORD=YOUR_EMAIL_PASSWORD
```

**Important:**
- Never upload your actual `.env` file to GitHub.
- The `.env` file is excluded using `.gitignore`.
- Use your own credentials for external services.
- Make sure the PHP application is configured to read these environment variables.

---

## Running the Application

After completing the installation and configuration:

1. Make sure Apache and MySQL are running in XAMPP.
2. Open your web browser.
3. Navigate to the Citizen Portal:

```text
http://localhost/Complaint/citizen.php
```

4. For the Administrative Dashboard, navigate to:

```text
http://localhost/Complaint/admindashboard.php
```

5. Log in using an authorized account.

---

## System Features

### Citizen Portal

- Citizen registration and authentication
- Google account authentication
- Online complaint submission
- AI-assisted complaint categorization
- Complaint urgency assessment
- GPS location submission
- Complaint status tracking
- In-app notifications
- Email notifications
- Dispatch team tracking

### Administrative Dashboard

- Complaint verification and management
- Complaint assignment and dispatch
- Emergency complaint monitoring
- Real-time notifications
- Dispatch team monitoring
- User and role management
- Citizen feedback management
- Operational reports and analytics
- Barangay-based complaint analysis
- AI-assisted complaint insights

### Dispatch Management

- View assigned complaints
- Monitor assigned operations
- Update complaint progress and status
- View complaint locations
- Coordinate complaint response activities

---

## Default Login Credentials

For security purposes, actual administrator and citizen passwords are not published in this repository.

Use the designated demonstration accounts provided by the project developers or register a new citizen account through the application.

---

## Security and Privacy

The project follows security practices intended to protect system data and user information.

- PDO prepared statements for database queries.
- Session-based authentication.
- Role-based access control.
- Server-side input validation.
- Secure API credential management.
- Restricted access to administrative functions.

Actual API keys, passwords, and sensitive credentials are excluded from the public repository.

---

## Project Information

- **Project Title:** An AI-Assisted Online Complaint and Operations Management System for the Malabon City Action Team
- **Institution:** Global Reciprocal Colleges
- **College:** College of Computer Studies
- **Project Adviser:** Romark G. Cacho
- **Project Type:** Capstone Project

