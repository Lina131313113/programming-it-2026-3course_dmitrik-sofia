// === 1. Инициализация и получение элементов ===
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-title");
const list = document.querySelector("#task-list");
const filterButtons = document.querySelectorAll(".filter-btn");

// Массив для хранения задач
let tasks = [];
// Текущий фильтр (по умолчанию 'all')
let currentFilter = 'all';

// === 2. Работа с localStorage ===

// Загрузка задач при старте
function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            console.error("Ошибка чтения данных из localStorage", e);
            tasks = [];
        }
    }
}

// Сохранение задач
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// === 3. Функция добавления задачи (Разминка) ===
function addTask(title) {
    const trimmedTitle = title.trim();
    // Запрет пустой задачи (включая строки из пробелов)
    if (!trimmedTitle) return false;

    const newTask = {
        id: Date.now(), // Уникальный ID на основе времени
        title: trimmedTitle,
        completed: false // По умолчанию задача не выполнена
    };

    tasks.push(newTask);
    saveTasks();
    return true;
}

// === 4. Отрисовка (Рендеринг) списка ===
function renderTasks() {
    // Очищаем список
    list.innerHTML = "";

    // Фильтруем задачи в зависимости от выбранного фильтра
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // 'all'
    });

    // Создаем элементы для каждой задачи
    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        // Добавляем data-атрибут для идентификации при делегировании
        li.dataset.id = task.id; 

        // Текст задачи
        const span = document.createElement("span");
        span.textContent = task.title;
        span.classList.add("task-text");
        if (task.completed) {
            span.classList.add("completed");
        }

        // Кнопка удаления
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Удалить";
        deleteBtn.classList.add("delete-btn");
        // data-action нужен для делегирования
        deleteBtn.dataset.action = "delete"; 

        // Собираем элемент
        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

// === 5. Обработчик формы (Добавление) ===
form.addEventListener("submit", (event) => {
    // 1. Останавливаем стандартную отправку формы
    event.preventDefault();

    // 2. Пытаемся добавить задачу
    const isAdded = addTask(input.value);

    // 3. Если задача добавилась, очищаем поле и перерисовываем список
    if (isAdded) {
        input.value = "";
        renderTasks();
    } else {
        alert("Задача не может быть пустой!");
    }
});

// === 6. Делегирование событий (Удаление и выполнение) ===
// Один обработчик на весь список ul
list.addEventListener("click", (event) => {
    const target = event.target;
    // Находим родительский li, чтобы получить ID задачи
    const li = target.closest("li");
    if (!li) return;

    const taskId = Number(li.dataset.id);
    // Находим индекс задачи в массиве
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Если нажата кнопка удаления
    if (target.dataset.action === "delete") {
        tasks.splice(taskIndex, 1); // Удаляем из массива
        saveTasks();
        renderTasks();
    } 
    // Если нажат текст задачи (для отметки выполнения)
    else if (target.classList.contains("task-text")) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed; // Инвертируем статус
        saveTasks();
        renderTasks();
    }
});

// === 7. Фильтрация задач ===
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Убираем класс active у всех кнопок
        filterButtons.forEach(b => b.classList.remove("active"));
        // Добавляем класс active нажатой кнопке
        btn.classList.add("active");

        // Устанавливаем текущий фильтр
        currentFilter = btn.dataset.filter;
        // Перерисовываем список
        renderTasks();
    });
});

// === 8. Запуск приложения ===
// Загружаем данные из localStorage и отрисовываем список при первой загрузке
loadTasks();
renderTasks();