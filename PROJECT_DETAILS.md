# Project Overview: ExamGuard

**ExamGuard** is a production-grade, secure online examination platform designed to provide a robust environment for high-stakes testing. It features a triple-module architecture catering to Students, Teachers, and Administrators.

## 🚀 Key Features

### 1. Secure Examination Mode
*   **Fullscreen Enforcement**: Exams require fullscreen activation. Attempting to exit results in warnings or automatic blocking.
*   **Anti-Cheating Monitoring**: Real-time detection of window switching, copy-pasting, and print-screen attempts.
*   **Persistent Blocking**: Users who violate security rules are flagged and prohibited from continuing the session.

### 2. Multi-Role Portals
*   **Student Portal**: Interactive exam interface, dashboard for tracking upcoming tests, and result analytics.
*   **Teacher Portal**: Exam creation engine, live monitoring of candidate progress, and automated grading.
*   **Admin Portal**: User management, system performance metrics, and global security audit logs.

### 3. Modern Tech Stack
*   **Frontend**: React 19, TypeScript, Vite.
*   **Styling**: Tailwind CSS v4, Motion (animations), Geist Font.
*   **Backend**: Node.js, Express, JWT Authentication.
*   **Database**: MongoDB (Mongoose) with a smart fallback to "Mock Mode" for development.

## 🛠 Project Structure

*   `/server`: Express backend logic.
    *   `/routes`: API endpoints for auth, exams, and results.
    *   `/models`: Mongoose schemas for Users, Exams, and Results.
    *   `/db.ts`: Secure connection logic with error handling.
*   `/src`: React frontend logic.
    *   `/pages`: Main views (Login, Dashboard, ExamInterface, etc.).
    *   `/lib`: Core utilities (Auth contexts, formatting).
    *   `/components/ui`: Highly polished, reusable UI components built with Radix principles.

## 🔑 Default Mock Credentials
If the database is not connected, the platform operates in **Mock Mode** using these credentials:
*   **Teacher**: `teacher@example.com` / `password`
*   **Student**: `student@example.com` / `password`

---

# Technical Project Prompt (for AI/Documentation)

"Build a full-stack secure examination platform named **ExamGuard**. 

**Requirements**:
1. **Frontend**: Use React (TypeScript) with Tailwind CSS v4. Implement a clean, professional 'Swiss-Modern' design using Geist fonts and Lucide icons.
2. **Backend**: Express.js server with MongoDB/Mongoose. Use JWT for session management.
3. **Core Logic**: 
    - Implement a `ProtectedRoute` for role-based access.
    - Create an `ExamInterface` that enforces fullscreen mode and tracks browser violations (visibility change, resize, etc.).
    - Use a fallback mechanism in the Auth Provider to allow local/mock login if the MongoDB connection is unavailable.
4. **Security**: Validate all inputs using Zod. Log violations to the console and handle the specific Atlas 'multiple service names' error by suggesting the correct protocol.
5. **UI Components**: Build a custom `StatCard`, `ExamSummaryCard`, and `SecurityMonitor` to display real-time data effectively."
