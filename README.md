# Internal Evaluation Management System (FSD-35)

## 📌 Project Overview
This project is an **Internal Evaluation Management System** designed to streamline the process of assessing student submissions. It allows **Administrators** to assign evaluation tasks and **Evaluators** to score them.

The system enforces strict **data persistence** and **score finality**, meaning that once an evaluation is submitted, it is locked and cannot be modified. This ensures the integrity of the evaluation process.

---

## 🚀 Live Deployment Links

**Frontend Deployment + Backend Deployment:** https://fsd-35-frontend.onrender.com

---

## 🛠 Tech Stack

### Frontend
* **HTML5:** Semantic structure for the dashboard and auth pages.
* **CSS3:** Modern UI with responsive design, glassmorphism effects, and gradient typography.
* **JavaScript (Vanilla):** DOM manipulation and `fetch` API for backend communication.

### Backend
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens)
* **Security:** Bcrypt.js for hashing, CORS protection, Environment Variables.

---

## 👥 User Roles & Permissions
The system implements Role-Based Access Control (RBAC) with two distinct roles:

### 1. ADMIN
* **Register/Login:** Secure access to the dashboard.
* **Manage Assignments:** Can create new submission records and assign them to specific Evaluators.
* **View All:** Access to view all evaluation records and their current status.

### 2. EVALUATOR
* **Register/Login:** Secure access to their personal dashboard.
* **View Assigned Tasks:** Can only see submissions specifically assigned to them.
* **Submit Evaluation:** Can enter a score and remarks for a student.
* **Finality Rule:** Once a score is submitted, the record is marked `isFinal: true` and cannot be edited again.

---

## 🗄 Database Schema

### Users Collection (`users`)
Stores credential and role information.
* `username`: String (Unique)
* `password`: String (Hashed)
* `role`: String (Enum: 'ADMIN', 'EVALUATOR')

### Submissions Collection (`submissions`)
Stores the evaluation data.
* `studentName`: String
* `subject`: String
* `assignedTo`: ObjectId (Reference to User)
* `score`: Number (Default: null)
* `remarks`: String
* `isFinal`: Boolean (Default: false) - **Critical for enforcing immutability**

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (Admin/Evaluator) | Public |
| `POST` | `/api/auth/login` | Login and receive JWT token | Public |

### Evaluation Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/evaluation/assign` | Create a new task & assign to evaluator | **Admin Only** |
| `GET` | `/api/evaluation/all` | View all evaluation records | **Admin Only** |
| `GET` | `/api/evaluation/assigned` | View tasks assigned to the logged-in user | **Evaluator Only** |
| `PUT` | `/api/evaluation/evaluate/:id` | Submit score & remarks (One-time only) | **Evaluator Only** |

---

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd fsd-35-backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

4.  **Run the Server:**
    ```bash
    # Development mode
    npm run dev

    # Production mode
    npm start
    ```
