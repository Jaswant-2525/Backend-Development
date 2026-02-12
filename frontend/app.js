const API_URL = "https://fsd-35-backend.onrender.com/api";

// --- AUTHENTICATION ---

function toggleAuth() {
    document.getElementById('login-section').classList.toggle('hidden');
    document.getElementById('register-section').classList.toggle('hidden');
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        const data = await res.json(); // Get the backend response

        if (res.ok) {
            alert("Registration successful! Please login.");
            toggleAuth();
        } else {
            // This will show you exactly what went wrong (e.g., "User already exists")
            alert("Registration Failed: " + (data.error || data.message));
        }
    } catch (error) {
        console.error(error);
        alert("Network Error: Is the backend running?");
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', username);
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('auth-error').innerText = data.message;
    }
}

function logout() {
    localStorage.clear();
    // Change 'index.html' to '/' to reliably find the home page on Render
    window.location.href = '/';
}

// --- DASHBOARD LOGIC ---

function initDashboard() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-display').innerText = `${username} (${role})`;

    // Show appropriate view based on role
    if (role === 'ADMIN') {
        document.getElementById('admin-view').classList.remove('hidden');
        loadAdminData();
    } else if (role === 'EVALUATOR') {
        document.getElementById('evaluator-view').classList.remove('hidden');
        loadEvaluatorData();
    }
}

// --- ADMIN FUNCTIONS ---

async function loadAdminData() {
    const res = await fetch(`${API_URL}/evaluation/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const evaluations = await res.json();
    
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    evaluations.forEach(ev => {
        const row = `<tr>
            <td>${ev.studentName}</td>
            <td>${ev.subject}</td>
            <td>${ev.assignedTo ? ev.assignedTo.username : 'Unknown'}</td>
            <td>${ev.isFinal ? ev.score : '-'}</td>
            <td class="${ev.isFinal ? 'status-final' : 'status-pending'}">
                ${ev.isFinal ? 'Completed' : 'Pending'}
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

async function assignTask() {
    const studentName = document.getElementById('task-student').value;
    const subject = document.getElementById('task-subject').value;
    const assignedTo = document.getElementById('task-evaluator-id').value;

    const res = await fetch(`${API_URL}/evaluation/assign`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentName, subject, assignedTo })
    });

    if (res.ok) {
        alert("Task assigned successfully!");
        loadAdminData(); // Refresh list
    } else {
        alert("Failed to assign task. Check Evaluator ID.");
    }
}

// --- EVALUATOR FUNCTIONS ---

async function loadEvaluatorData() {
    const res = await fetch(`${API_URL}/evaluation/assigned`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const tasks = await res.json();

    const container = document.getElementById('evaluator-cards');
    container.innerHTML = '';

    tasks.forEach(task => {
        // If final, disable button. If not, enable it.
        const btnState = task.isFinal ? 'disabled style="background:grey"' : `onclick="openModal('${task._id}')"`;
        const btnText = task.isFinal ? 'Completed' : 'Evaluate';

        const card = `
        <div class="card">
            <h4>${task.studentName}</h4>
            <p>Subject: ${task.subject}</p>
            <p>Status: <span class="${task.isFinal ? 'status-final' : 'status-pending'}">${task.isFinal ? 'Finalized' : 'Pending'}</span></p>
            <p>Score: ${task.score !== null ? task.score : '-'}</p>
            <button ${btnState}>${btnText}</button>
        </div>`;
        container.innerHTML += card;
    });
}

// --- MODAL & SUBMISSION ---

function openModal(id) {
    document.getElementById('modal-submission-id').value = id;
    document.getElementById('eval-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('eval-modal').classList.add('hidden');
}

async function submitEvaluation() {
    const id = document.getElementById('modal-submission-id').value;
    const score = document.getElementById('eval-score').value;
    const remarks = document.getElementById('eval-remarks').value;

    const res = await fetch(`${API_URL}/evaluation/evaluate/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score, remarks })
    });

    if (res.ok) {
        alert("Evaluation submitted successfully!");
        closeModal();
        loadEvaluatorData(); // Refresh UI to lock the button
    } else {
        const err = await res.json();
        alert("Error: " + err.message); // Should show "Evaluation is final" if they try to hack it
    }
}