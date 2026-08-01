const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const searchInput = document.getElementById("searchInput");
const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("themeToggle");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

// Modal elements
const editModal = document.getElementById("editModal");
const editTaskText = document.getElementById("editTaskText");
const editPriority = document.getElementById("editPriority");
const editDueDate = document.getElementById("editDueDate");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let tasks = [];
try {
    const saved = localStorage.getItem("tasks");
    if (saved) {
        tasks = JSON.parse(saved);
        if (!Array.isArray(tasks)) tasks = [];
    }
} catch (e) {
    tasks = [];
}
let currentEditId = null;

// Theme
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
});

// Load
renderTasks();

// Add Task
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.focus();
        return;
    }

    const task = {
        id: Date.now(),
        text,
        completed: false,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || null
    };

    tasks.push(task);
    saveTasks();
    renderTasks(getCurrentFilter());
    taskInput.value = "";
    dueDateInput.value = "";
    prioritySelect.value = "medium";
    taskInput.focus();
}

// Search
searchInput.addEventListener("input", () => {
    renderTasks(getCurrentFilter());
});

// Render
function renderTasks(filter = "all") {
    const searchTerm = searchInput.value.toLowerCase();

    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    let visiblePending = 0;
    let visibleCompleted = 0;

    tasks.forEach(task => {
        const taskText = task.text || "";
        
        // Search filter
        if (searchTerm && !taskText.toLowerCase().includes(searchTerm)) return;

        // Status filter
        if (filter === "pending" && task.completed) return;
        if (filter === "completed" && !task.completed) return;

        const li = createTaskElement(task);

        if (task.completed) {
            completedList.appendChild(li);
            visibleCompleted++;
        } else {
            pendingList.appendChild(li);
            visiblePending++;
        }
    });

    // Counts (total, not filtered)
    pendingCount.textContent = tasks.filter(t => !t.completed).length;
    completedCount.textContent = tasks.filter(t => t.completed).length;

    // Empty messages
    pendingEmpty.style.display = pendingList.children.length === 0 ? "block" : "none";
    completedEmpty.style.display = completedList.children.length === 0 ? "block" : "none";

    updateProgress();
}

function createTaskElement(task) {
    const li = document.createElement("li");
    const priority = task.priority || "medium";
    const taskText = task.text || "";

    li.className = `priority-${priority}`;
    li.dataset.id = task.id;

    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);

    li.innerHTML = `
        <div class="task-main">
            <span class="task-text ${task.completed ? 'completed' : ''}">${taskText}</span>
            <div class="actions">
                ${task.completed
            ? `<button class="undo-btn">Undo</button>`
            : `<button class="complete-btn">Complete</button>`
        }
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        </div>
        <div class="task-meta">
            <span class="badge ${priority}">${priority.toUpperCase()}</span>
            ${task.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">Due: ${formatDate(task.dueDate)}</span>` : ''}
        </div>
    `;

    // Events
    const completeBtn = li.querySelector(".complete-btn");
    const undoBtn = li.querySelector(".undo-btn");
    const editBtn = li.querySelector(".edit-btn");
    const deleteBtn = li.querySelector(".delete-btn");

    if (completeBtn) completeBtn.onclick = () => toggleComplete(task.id);
    if (undoBtn) undoBtn.onclick = () => toggleComplete(task.id);
    editBtn.onclick = () => openEditModal(task.id);
    deleteBtn.onclick = () => deleteTask(task.id);

    return li;
}

function formatDate(dateStr) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
}

function toggleComplete(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks(getCurrentFilter());
}

function deleteTask(id) {
    if (confirm("Delete this task?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks(getCurrentFilter());
    }
}

// Edit Modal
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    currentEditId = id;
    editTaskText.value = task.text;
    editPriority.value = task.priority;
    editDueDate.value = task.dueDate || "";
    editModal.classList.add("show");
}

saveEditBtn.addEventListener("click", () => {
    const text = editTaskText.value.trim();
    if (!text) return;

    tasks = tasks.map(t => {
        if (t.id === currentEditId) {
            return {
                ...t,
                text,
                priority: editPriority.value,
                dueDate: editDueDate.value || null
            };
        }
        return t;
    });

    saveTasks();
    renderTasks(getCurrentFilter());
    closeModal();
});

cancelEditBtn.addEventListener("click", closeModal);
editModal.addEventListener("click", e => {
    if (e.target === editModal) closeModal();
});

function closeModal() {
    editModal.classList.remove("show");
    currentEditId = null;
}

// Clear Completed
clearCompletedBtn.addEventListener("click", () => {
    if (tasks.some(t => t.completed) && confirm("Clear all completed tasks?")) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks(getCurrentFilter());
    }
});

// Filters
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTasks(btn.dataset.filter);
    });
});

function getCurrentFilter() {
    return document.querySelector(".filter-btn.active")?.dataset.filter || "all";
}

// Progress
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressFill.style.width = percent + "%";
    progressText.textContent = percent + "%";
}

// Save
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}