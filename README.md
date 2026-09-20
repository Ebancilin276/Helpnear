# HelpNear – Local Help & Service Platform

HelpNear is a neighbourhood assistance platform designed for people who are new to an area and need reliable local services such as electricians, plumbers, mechanics, elderly assistance, daily help, and emergency support.

---

## Day 1 Status & Goal

> [!NOTE]
> This is **Day 1** of a multi-day full-stack project.
> Day 1 establishes the clean backend foundation connected to a local MySQL database.
> Features such as authentication, maps, service requests, notifications, and dashboards are intentionally deferred to subsequent days.

---

## Day 1 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended, v22 installed)
- [MySQL Server](https://dev.mysql.com/) (running locally on port 3306)

### 1. Database Setup
1. Ensure your local MySQL Server is running.
2. Confirm the `helpnear_db` database exists.
3. Confirm the `users` table already exists with columns:
   - `id INT AUTO_INCREMENT PRIMARY KEY`
   - `name VARCHAR(100) NOT NULL`
   - `email VARCHAR(150) UNIQUE NOT NULL`
   - `password VARCHAR(255) NOT NULL`
   - `role VARCHAR(30) DEFAULT 'customer'`
   - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
   *(Reference schema is provided in `database/schema.sql`)*

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Open `backend/.env` in your text editor.
3. Enter your local MySQL root password at `DB_PASSWORD=`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password_here
   DB_NAME=helpnear_db
   DB_PORT=3306
   ```
   *(Note: Never commit `backend/.env` to version control!)*

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   Or for standard production run:
   ```bash
   npm start
   ```

6. Terminal output on successful start:
   ```text
   HelpNear backend running on port 5000
   MySQL database connected
   ```

### 3. Verify Health API
Open your browser or run curl:
- **Health API URL**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

Expected response:
```json
{
  "success": true,
  "message": "HelpNear backend is running"
}
```

---

## What Is Deferred to Subsequent Days
- ❌ User Login & Registration
- ❌ JWT & Password Hashing
- ❌ Service Provider Profiles & Verification
- ❌ Maps, GPS & Live Location
- ❌ Service Requests & Booking
- ❌ Emergency & Guardian Modules
- ❌ Socket.IO & Real-time Notifications
- ❌ Ratings, Reviews & Admin Panel
