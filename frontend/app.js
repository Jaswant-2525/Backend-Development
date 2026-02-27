const API_URL = "https://fsd-35-backend.onrender.com/api";

// --- THEME / DARK MODE ---

function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerText = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerText = isDark ? '☀️' : '🌙';
}

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

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful! Please login.");
            toggleAuth();
        } else {
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
    window.location.href = 'index.html';
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

    // Apply saved theme
    applyTheme();

    document.getElementById('user-display').innerText = `${username} (${role})`;

    if (role === 'ADMIN') {
        document.getElementById('admin-view').classList.remove('hidden');
        loadAdminData();
        loadAnalytics();
        populateUserDropdowns();
    } else if (role === 'EVALUATOR') {
        document.getElementById('evaluator-view').classList.remove('hidden');
        loadEvaluatorData();
    } else if (role === 'STUDENT') {
        document.getElementById('student-view').classList.remove('hidden');
        loadStudentData();
    }
}

// --- ADMIN FUNCTIONS ---

// Store current data for CSV export
let currentAdminData = [];

// Chart instances for cleanup
let pieChartInstance = null;
let barChartInstance = null;

async function loadAnalytics() {
    try {
        const res = await fetch(`${API_URL}/evaluation/stats`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stats = await res.json();

        // Update stat cards
        document.getElementById('stat-total').innerText = stats.totalTasks;
        document.getElementById('stat-pending').innerText = stats.pendingTasks;
        document.getElementById('stat-completed').innerText = stats.completedTasks;

        // Pie Chart - Pending vs Completed
        if (pieChartInstance) pieChartInstance.destroy();
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        pieChartInstance = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Pending', 'Completed'],
                datasets: [{
                    data: [stats.pendingTasks, stats.completedTasks],
                    backgroundColor: ['rgba(225, 112, 85, 0.8)', 'rgba(0, 184, 148, 0.8)'],
                    borderColor: ['#e17055', '#00b894'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 13 }, padding: 20 } }
                }
            }
        });

        // Bar Chart - Average score by subject
        if (barChartInstance) barChartInstance.destroy();
        const barCtx = document.getElementById('barChart').getContext('2d');
        const subjects = stats.avgBySubject.map(s => s._id);
        const averages = stats.avgBySubject.map(s => Math.round(s.avgScore * 10) / 10);
        barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Avg Total Score',
                    data: averages,
                    backgroundColor: 'rgba(108, 92, 231, 0.7)',
                    borderColor: '#6c5ce7',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { font: { family: 'Poppins' } } },
                    x: { ticks: { font: { family: 'Poppins' } } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } catch (err) {
        console.error('Analytics load error:', err);
    }
}

async function loadAdminData() {
    const search = document.getElementById('search-input')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';

    let url = `${API_URL}/evaluation/all?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;

    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const evaluations = await res.json();
    currentAdminData = evaluations;

    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    evaluations.forEach(ev => {
        const scoreObj = ev.score;
        const logic = scoreObj ? (scoreObj.logic ?? '-') : '-';
        const quality = scoreObj ? (scoreObj.quality ?? '-') : '-';
        const viva = scoreObj ? (scoreObj.viva ?? '-') : '-';
        const total = scoreObj ? (scoreObj.total ?? '-') : '-';

        const unlockBtn = ev.isFinal
            ? `<button class="unlock-btn" onclick="unlockSubmission('${ev._id}')">🔓 Unlock</button>`
            : '<span class="text-muted">—</span>';

        const dueDateStr = ev.dueDate ? new Date(ev.dueDate).toLocaleDateString() : '-';
        const isOverdue = ev.dueDate && !ev.isFinal && new Date() > new Date(ev.dueDate);

        const row = `<tr>
            <td>${ev.studentName}</td>
            <td>${ev.subject}</td>
            <td>${ev.assignedTo ? ev.assignedTo.username : 'Unknown'}</td>
            <td>${ev.isFinal ? logic : '-'}</td>
            <td>${ev.isFinal ? quality : '-'}</td>
            <td>${ev.isFinal ? viva : '-'}</td>
            <td>${ev.isFinal ? total : '-'}</td>
            <td>${isOverdue ? `<span class="status-overdue">${dueDateStr}</span>` : dueDateStr}</td>
            <td class="${ev.isFinal ? 'status-final' : 'status-pending'}">
                ${ev.isFinal ? 'Completed' : 'Pending'}
            </td>
            <td>${unlockBtn}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

async function populateUserDropdowns() {
    const token = localStorage.getItem('token');
    try {
        const [studentsRes, evaluatorsRes] = await Promise.all([
            fetch(`${API_URL}/auth/users/STUDENT`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/auth/users/EVALUATOR`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const students = await studentsRes.json();
        const evaluators = await evaluatorsRes.json();

        const studentSelect = document.getElementById('task-student-select');
        const evaluatorSelect = document.getElementById('task-evaluator-select');

        students.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s._id;
            opt.textContent = s.username;
            studentSelect.appendChild(opt);
        });

        evaluators.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e._id;
            opt.textContent = e.username;
            evaluatorSelect.appendChild(opt);
        });
    } catch (err) {
        console.error('Failed to load user dropdowns:', err);
    }
}

async function assignTask() {
    const studentSelect = document.getElementById('task-student-select');
    const evaluatorSelect = document.getElementById('task-evaluator-select');
    const studentId = studentSelect.value;
    const studentName = studentSelect.options[studentSelect.selectedIndex]?.text || '';
    const subject = document.getElementById('task-subject').value;
    const assignedTo = evaluatorSelect.value;
    const dueDate = document.getElementById('task-due-date')?.value || '';

    if (!studentId) { alert('Please select a student.'); return; }
    if (!assignedTo) { alert('Please select an evaluator.'); return; }
    if (!subject) { alert('Please enter a subject.'); return; }
    if (!dueDate) { alert('Please select a due date.'); return; }

    const body = { studentName, subject, assignedTo, dueDate, studentId };

    const res = await fetch(`${API_URL}/evaluation/assign`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        alert("Task assigned successfully!");
        loadAdminData();
        loadAnalytics();
    } else {
        alert("Failed to assign task. Check Evaluator ID.");
    }
}

// --- UNLOCK (Re-Evaluation) ---

async function unlockSubmission(id) {
    if (!confirm('Are you sure you want to unlock this submission for re-evaluation?')) return;

    const res = await fetch(`${API_URL}/evaluation/unlock/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (res.ok) {
        alert("Submission unlocked for re-evaluation!");
        loadAdminData();
    } else {
        const err = await res.json();
        alert("Error: " + err.message);
    }
}

// --- CSV EXPORT ---

function downloadCSV() {
    if (!currentAdminData.length) {
        alert("No data to export.");
        return;
    }

    const headers = ['Student', 'Subject', 'Evaluator', 'Logic', 'Quality', 'Viva', 'Total', 'Due Date', 'Remarks', 'Status'];
    const rows = currentAdminData.map(ev => {
        const scoreObj = ev.score;
        return [
            ev.studentName,
            ev.subject,
            ev.assignedTo ? ev.assignedTo.username : 'Unknown',
            scoreObj ? (scoreObj.logic ?? '') : '',
            scoreObj ? (scoreObj.quality ?? '') : '',
            scoreObj ? (scoreObj.viva ?? '') : '',
            scoreObj ? (scoreObj.total ?? '') : '',
            ev.dueDate ? new Date(ev.dueDate).toLocaleDateString() : '',
            `"${(ev.remarks || '').replace(/"/g, '""')}"`,
            ev.isFinal ? 'Completed' : 'Pending'
        ];
    });

    let csv = headers.join(',') + '\n';
    rows.forEach(r => csv += r.join(',') + '\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evaluation_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
        const scoreObj = task.score;
        const totalDisplay = scoreObj ? scoreObj.total : '-';

        const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline';
        const isOverdue = task.dueDate && !task.isFinal && new Date() > new Date(task.dueDate);

        let btnState, btnText;
        if (task.isFinal) {
            btnState = 'disabled style="background:grey"';
            btnText = 'Completed';
        } else if (isOverdue) {
            btnState = 'disabled style="background:#d63031;color:white;cursor:not-allowed"';
            btnText = 'Overdue';
        } else {
            btnState = `onclick="openModal('${task._id}')"`;
            btnText = 'Evaluate';
        }

        const rubricInfo = task.isFinal && scoreObj
            ? `<p>Logic: ${scoreObj.logic} | Quality: ${scoreObj.quality} | Viva: ${scoreObj.viva}</p>`
            : '';

        const overdueBadge = isOverdue ? '<span class="status-overdue">OVERDUE</span>' : '';

        const card = `
        <div class="card">
            <h4>${task.studentName}</h4>
            <p>Subject: ${task.subject}</p>
            <p>Due: ${dueDateStr} ${overdueBadge}</p>
            <p>Status: <span class="${task.isFinal ? 'status-final' : 'status-pending'}">${task.isFinal ? 'Finalized' : 'Pending'}</span></p>
            <p>Total Score: ${task.isFinal ? totalDisplay : '-'}</p>
            ${rubricInfo}
            <button ${btnState}>${btnText}</button>
        </div>`;
        container.innerHTML += card;
    });
}

// --- STUDENT FUNCTIONS ---

async function loadStudentData() {
    const res = await fetch(`${API_URL}/evaluation/my-scores`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const scores = await res.json();

    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';

    scores.forEach(ev => {
        const scoreObj = ev.score;
        const logic = scoreObj ? (scoreObj.logic ?? '-') : '-';
        const quality = scoreObj ? (scoreObj.quality ?? '-') : '-';
        const viva = scoreObj ? (scoreObj.viva ?? '-') : '-';
        const total = scoreObj ? (scoreObj.total ?? '-') : '-';

        const pdfBtn = ev.isFinal
            ? `<button class="pdf-btn" onclick='downloadPDF(${JSON.stringify({
                studentName: ev.studentName || localStorage.getItem("username"),
                subject: ev.subject,
                evaluator: ev.assignedTo ? ev.assignedTo.username : "Unknown",
                logic: scoreObj?.logic ?? 0,
                quality: scoreObj?.quality ?? 0,
                viva: scoreObj?.viva ?? 0,
                total: scoreObj?.total ?? 0,
                remarks: ev.remarks || "-"
            }).replace(/'/g, "&apos;")})'>📄 Download PDF</button>`
            : '';

        const row = `<tr>
            <td>${ev.subject}</td>
            <td>${ev.assignedTo ? ev.assignedTo.username : 'Unknown'}</td>
            <td>${ev.isFinal ? logic : '-'}</td>
            <td>${ev.isFinal ? quality : '-'}</td>
            <td>${ev.isFinal ? viva : '-'}</td>
            <td>${ev.isFinal ? total : '-'}</td>
            <td>${ev.remarks || '-'}</td>
            <td class="${ev.isFinal ? 'status-final' : 'status-pending'}">
                ${ev.isFinal ? 'Completed' : 'Pending'}
            </td>
            <td>${pdfBtn}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// --- EVALUATION MODAL & SUBMISSION (Rubric) ---

function openModal(id) {
    document.getElementById('modal-submission-id').value = id;
    document.getElementById('eval-logic').value = '';
    document.getElementById('eval-quality').value = '';
    document.getElementById('eval-viva').value = '';
    document.getElementById('eval-total').innerText = '0';
    document.getElementById('eval-remarks').value = '';
    document.getElementById('eval-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('eval-modal').classList.add('hidden');
}

function calcTotal() {
    const logic = parseInt(document.getElementById('eval-logic').value) || 0;
    const quality = parseInt(document.getElementById('eval-quality').value) || 0;
    const viva = parseInt(document.getElementById('eval-viva').value) || 0;
    document.getElementById('eval-total').innerText = logic + quality + viva;
}

async function submitEvaluation() {
    const id = document.getElementById('modal-submission-id').value;
    const logic = parseInt(document.getElementById('eval-logic').value) || 0;
    const quality = parseInt(document.getElementById('eval-quality').value) || 0;
    const viva = parseInt(document.getElementById('eval-viva').value) || 0;
    const remarks = document.getElementById('eval-remarks').value;

    const score = {
        logic,
        quality,
        viva,
        total: logic + quality + viva
    };

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
        loadEvaluatorData();
    } else {
        const err = await res.json();
        alert("Error: " + err.message);
    }
}

// --- PROFILE MODAL (Change Password) ---

function openProfileModal() {
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

async function changePassword() {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;

    if (!oldPassword || !newPassword) {
        alert("Please fill in both fields.");
        return;
    }

    const res = await fetch(`${API_URL}/auth/update-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message);
        closeProfileModal();
    } else {
        alert("Error: " + (data.message || data.error));
    }
}

// --- PDF SCORECARD GENERATION ---

async function downloadPDF(data) {
    // Populate the hidden scorecard template
    document.getElementById('sc-student').innerText = data.studentName;
    document.getElementById('sc-subject').innerText = data.subject;
    document.getElementById('sc-evaluator').innerText = data.evaluator;
    document.getElementById('sc-date').innerText = new Date().toLocaleDateString();
    document.getElementById('sc-logic').innerText = data.logic;
    document.getElementById('sc-quality').innerText = data.quality;
    document.getElementById('sc-viva').innerText = data.viva;
    document.getElementById('sc-total').innerText = data.total;
    document.getElementById('sc-remarks').innerText = data.remarks;

    const template = document.querySelector('#scorecard-template .scorecard');

    // Temporarily make visible for rendering (off-screen)
    const container = document.getElementById('scorecard-template');
    container.style.left = '0';
    container.style.position = 'absolute';
    container.style.zIndex = '-1';
    container.style.opacity = '0';

    try {
        const canvas = await html2canvas(template, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save(`${data.studentName}_${data.subject}_Scorecard.pdf`);
    } catch (err) {
        console.error('PDF generation error:', err);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        // Re-hide
        container.style.left = '-9999px';
        container.style.position = 'fixed';
        container.style.opacity = '';
    }
}