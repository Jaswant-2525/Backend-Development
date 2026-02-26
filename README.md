# Internal Evaluation Management System (FSD-35)

## 📌 Project Overview
This project is a comprehensive **Full-Stack Internal Evaluation Management System** designed to streamline and automate the process of assessing student submissions. 

Built with scalability and security in mind, the system supports a 3-tier Role-Based Access Control (RBAC) architecture, enabling **Administrators** to assign and monitor tasks, **Evaluators** to grade submissions using detailed rubrics, and **Students** to view their finalized results. The system enforces strict **data persistence**, **deadline management**, and **score finality** to ensure the integrity of the evaluation process.

---

## 🚀 Live Deployment

* **🌐 Live Application:** [https://fsd-35-frontend.onrender.com](https://fsd-35-frontend.onrender.com)

---

## ✨ Key Features
* **Advanced Analytics Dashboard:** Visualizes evaluation progress and calculates average scores per subject using MongoDB Aggregation Pipelines and Chart.js.
* **Role-Based Access Control (RBAC):** Secure routing and tailored dashboards for Admins, Evaluators, and Students.
* **Deadline Enforcement:** Automated system locking prevents evaluations from being submitted past the assigned due date.
* **Detailed Grading Rubrics:** Replaces single-number scores with granular breakdowns (Logic, Quality, Viva, Total).
* **Data Export:** Built-in capability for Administrators to export evaluation data to CSV files for offline processing.
* **Search & Filtering:** Dynamic, real-time table filtering by student name, subject, or completion status.

---

## 🛠 Tech Stack

### Frontend
* **HTML5 / CSS3:** Modern, responsive UI with glassmorphism effects and gradient typography.
* **JavaScript (Vanilla):** Client-side routing, DOM manipulation, and secure `fetch` API integration.
* **Chart.js:** Data visualization for the Admin analytics dashboard.

### Backend
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens)
* **Security:** Bcrypt.js for secure password hashing, CORS protection, Environment Variables.

---

## 👥 User Roles & Permissions

### 1. ADMIN (System Administrators)
* **Analytics Dashboard:** View high-level metrics (Total, Pending, Completed) and average score bar charts.
* **Manage Assignments:** Create submissions, assign them to Evaluators, and set strict **Due Dates**.
* **System Override:** Can unlock finalized submissions for re-evaluation if required.
* **Data Management:** View all records, search/filter, and export data to CSV.

### 2. EVALUATOR (Staff / Graders)
* **Task Management:** View only tasks specifically assigned to them.
* **Strict Deadlines:** Tasks are automatically locked if the due date has passed.
* **Detailed Evaluation:** Submit scores using a specific rubric (Logic, Quality, Viva).
* **Finality Rule:** Once submitted, the record is locked (`isFinal: true`) and cannot be altered by the Evaluator.

### 3. STUDENT (End Users)
* **Read-Only Dashboard:** Securely log in to view personal, finalized evaluation results and remarks.

---

## 🗄 Database Schema

### Users Collection (`users`)
Stores credential and role information.
* `username`: String (Unique)
* `password`: String (Hashed)
* `role`: String (Enum: `'ADMIN'`, `'EVALUATOR'`, `'STUDENT'`)

### Submissions Collection (`submissions`)
Stores the evaluation data, relational links, and rubric scores.
* `studentName`: String
* `studentId`: ObjectId (Reference to User, default: null)
* `subject`: String
* `assignedTo`: ObjectId (Reference to User)
* `dueDate`: Date
* `score`: Object (`logic`, `quality`, `viva`, `total`)
* `remarks`: String
* `isFinal`: Boolean (Default: false)

---

## 🔌 API Endpoints

### Authentication & Profile
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate and receive JWT | Public |
| `PUT` | `/api/auth/update-password` | Update account password | Authenticated |

### Evaluation Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/evaluation/stats` | Fetch aggregation data for charts | **Admin** |
| `GET` | `/api/evaluation/all` | View all evaluation records (w/ query filters) | **Admin** |
| `POST` | `/api/evaluation/assign` | Create task, set deadline, assign evaluator | **Admin** |
| `PUT` | `/api/evaluation/unlock/:id`| Unlock a finalized submission | **Admin** |
| `GET` | `/api/evaluation/assigned` | View tasks assigned to the logged-in user | **Evaluator** |
| `PUT` | `/api/evaluation/evaluate/:id`| Submit rubric scores (Blocked if overdue) | **Evaluator** |
| `GET` | `/api/evaluation/my-results` | View personal finalized scores | **Student** |

---

## ⚙️ Setup & Installation (Local Development)

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
    # Development mode (Nodemon)
    npm run dev

    # Production mode
    npm start
    ```

5.  **Run the Frontend:**
    Open `frontend/index.html` via Live Server or any local static file server. *(Ensure `API_URL` in `app.js` is pointed to `http://localhost:5000/api` for local testing).*
