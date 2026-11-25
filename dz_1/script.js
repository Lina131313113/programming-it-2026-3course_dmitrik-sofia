// === 1. Конфигурация API (занятие 3) ===
const API_URL = "https://6ac64b73bea0e72cf5c8d494.mockapi.io/api/v1/tasks";
const STUDENT_ID = "ivanov-ivan"; // Ваша учебная метка

// === 2. Элементы DOM ===
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-title");
const list = document.querySelector("#task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const statusEl = document.querySelector("#status");

// === 3. Состояние ===
let tasks = [];              // задачи текущего студента
let currentFilter = "all";   // текущий фильтр

// === 4. Утилиты ===
function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.classList.remove("hidden");
    statusEl.classList.toggle("error", isError);
}
function hideStatus() {
    statusEl.classList.add("hidden");
}

// === 5. API: GET — загрузка задач ===
async function loadTasks() {
    showStatus("Загрузка...");
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Не удалось загрузить задачи");
        }
        const data = await response.json();
        // Оставляем только задачи этого студента
        tasks = data.filter(task => task.studentId === STUDENT_ID);
        hideStatus();
    } catch (error) {
        console.error(error);
        showStatus("Ошибка загрузки задач. Попробуйте позже.", true);
        tasks = [];
    }
}

// === 6. API: POST — создание задачи ===
async function createTask(title) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            completed: false,
            studentId: STUDENT_ID
        })
    });
    if (!response.ok) {
        throw new Error("Не удалось создать задачу");
    }
    return response.json(); // сервер возвращает задачу с id
}

// === 7. API: DELETE — удаление задачи ===
async function deleteTask(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        throw new Error("Не удалось удалить задачу");
    }
}

// === 8. Рендеринг списка ===
function renderTasks() {
    list.innerHTML = "";

    const filtered = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    if (filtered.length === 0) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = "Нет задач";
        list.appendChild(li);
        return;
    }

    filtered.forEach(task => renderTask(task));
}

function renderTask(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id;

    const span = document.createElement("span");
    span.textContent = task.title;
    span.classList.add("task-text");
    if (task.completed) span.classList.add("completed");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.dataset.action = "delete";

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
}

// === 9. Обработчик формы (POST) ===
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) {
        alert("Задача не может быть пустой!");
        return;
    }
    try {
        const created = await createTask(title);
        tasks.push(created); // id пришёл с сервера
        input.value = "";
        renderTasks();
    } catch (error) {
        console.error(error);
        showStatus("Не удалось создать задачу", true);
    }
});

// === 10. Делегирование: удаление и переключение статуса ===
list.addEventListener("click", async (event) => {
    const target = event.target;
    const li = target.closest("li");
    if (!li || li.classList.contains("empty")) return;

    const taskId = li.dataset.id;
    const index = tasks.findIndex(t => String(t.id) === String(taskId));
    if (index === -1) return;

    // Удаление (DELETE)
    if (target.dataset.action === "delete") {
        try {
            await deleteTask(taskId);
            tasks.splice(index, 1);
            renderTasks();
        } catch (error) {
            console.error(error);
            showStatus("Не удалось удалить задачу", true);
        }
        return;
    }

    // Переключение статуса (локально, так как PUT/PATCH нет в задании)
    if (target.classList.contains("task-text")) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    }
});

// === 11. Фильтры ===
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// === 12. Старт ===
(async function init() {
    await loadTasks();
    renderTasks();
})();