# Internal Evaluation Management System (FSD-35)

## 📌 Project Overview
This project is a comprehensive **Full-Stack Internal Evaluation Management System** designed to streamline and automate the process of assessing student submissions. 

Built with scalability, user experience, and enterprise security in mind, the system supports a 3-tier Role-Based Access Control (RBAC) architecture. It enables **Administrators** to seamlessly assign tasks via dynamic UI components, **Evaluators** to grade submissions using detailed rubrics, and **Students** to view their finalized results. The system enforces strict **data persistence**, **deadline management**, **score finality**, and **advanced API security** to ensure the complete integrity of the evaluation process.

---

## 🚀 Live Deployment

* **🌐 Live Frontend:** [https://fsd-35-frontend.onrender.com](https://fsd-35-frontend.onrender.com)
* **⚙️ Live Backend API:** `https://fsd-35-backend.onrender.com`

---

## ✨ Key Features
* **Enterprise-Grade Security:** Fortified against Brute Force attacks (Rate Limiting), Cross-Site Scripting (Helmet CORS), and NoSQL Injection (Express Mongo Sanitize w/ Express 5 compatibility).
* **Enhanced Admin UX:** Dynamic database-driven `<select>` dropdowns for assigning Users and Evaluators, replacing manual ObjectId entry.
* **UI/UX & Accessibility:** Integrated Dark Mode theming and PDF Generation for downloading evaluation reports.
* **Advanced Analytics Dashboard:** Visualizes evaluation progress and calculates average scores per subject using MongoDB Aggregation Pipelines and Chart.js.
* **Role-Based Access Control (RBAC):** Secure routing and tailored dashboards for Admins, Evaluators, and Students.
* **Deadline Enforcement:** Automated system locking prevents evaluations from being submitted past the assigned due date.
* **Detailed Grading Rubrics:** Replaces single-number scores with granular breakdowns (Logic, Quality, Viva, Total).
* **Search & Filtering:** Dynamic, real-time table filtering by student name, subject, or completion status.

---

## 🛠 Tech Stack


### Frontend
* **HTML5 / CSS3:** Modern, responsive UI with glassmorphism effects, gradient typography, and Dark Mode support.
* **JavaScript (Vanilla):** Client-side routing, DOM manipulation, dynamic dropdown population, and secure `fetch` API integration.
* **Libraries:** Chart.js (Data visualization), PDF Generation utilities.

### Backend
* **Runtime Environment:** Node.js
* **Framework:** Express.js (v5)
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens)
* **Security Middleware:** * `bcryptjs` (Password hashing)
  * `helmet` (Secure HTTP headers & CORS policy)
  * `express-rate-limit` (Brute-force protection via Render proxy trust)
  * `express-mongo-sanitize` (NoSQL injection defense)

---

## 👥 User Roles & Permissions


### 1. ADMIN (System Administrators)
* **Analytics Dashboard:** View high-level metrics (Total, Pending, Completed) and average score bar charts.
* **Manage Assignments:** Create submissions, assign them via dynamic user dropdowns, and set strict **Due Dates**.
* **System Override:** Can unlock finalized submissions for re-evaluation if required.
* **Data Management:** View all records, search/filter, export data to CSV, and generate PDFs.

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
* `studentId`: ObjectId (Reference to User)
* `subject`: String
* `assignedTo`: ObjectId (Reference to User)
* `dueDate`: Date
* `score`: Object (`logic`, `quality`, `viva`, `total`)
* `remarks`: String
* `isFinal`: Boolean (Default: false)

---

## 🔌 API Endpoints

### Authentication & Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate and receive JWT (Rate Limited) | Public |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `GET` | `/api/auth/users/:role` | Fetch Users by specific role for UI dropdowns | **Admin** |

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