let allTasks = [];
const searchInput = document.getElementById("searchInput");
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const addTab = document.getElementById("addTab");
const searchTab = document.getElementById("searchTab");
const addPanel = document.getElementById("addPanel");
const searchPanel = document.getElementById("searchPanel");
const panelStage = document.getElementById("panelStage");
const panelFlipper = document.getElementById("panelFlipper");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.querySelector(".theme-icon");



function displayTask(task) {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";

    const leftSection = document.createElement("div");
    leftSection.className = "task-left";

    const taskName = document.createElement("span");
    taskName.textContent = task.title;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "task-checkbox";

    if (task.completed) {
        taskName.classList.add("completed");
    }

    checkbox.addEventListener("change", async function () {
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                completed: checkbox.checked,
            }),
        });

        const result = await response.json();

        if (result.error) {
            alert(result.error);
            checkbox.checked = !checkbox.checked;
            return;
        }

        taskName.classList.toggle("completed", checkbox.checked);
        task.completed = checkbox.checked;
    });
    
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️";
    deleteButton.className = "icon-button";
    deleteButton.title = "Delete task";

    const editButton = document.createElement("button");
    editButton.textContent = "✏️";
    editButton.classList.add("icon-button");
    editButton.title = "Edit task";
    editButton.addEventListener("click", () => {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = task.title;
    editInput.classList.add("edit-input");

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("save-button");

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("cancel-button");

    leftSection.replaceChild(editInput, taskName);

    taskActions.innerHTML = "";
    taskActions.appendChild(saveButton);
    taskActions.appendChild(cancelButton);

    editInput.focus();
    editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        saveButton.click();
    }

    if (event.key === "Escape") {
        cancelButton.click();
    }
});

    saveButton.addEventListener("click", async () => {
        const newTitle = editInput.value.trim();

        if (newTitle === "") {
            alert("Task title cannot be empty.");
            return;
        }

        const response = await fetch(`/api/tasks/${task.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: newTitle
            })
        });

        const result = await response.json();

        if (result.error) {
            alert(result.error);
            return;
        }

        loadTasks();
    });

    cancelButton.addEventListener("click", () => {
        loadTasks();
    });
});

    deleteButton.addEventListener("click", async function () {
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: "DELETE",
        });

        const result = await response.json();

        if (result.error) {
            alert(result.error);
            return;
        }

        allTasks = allTasks.filter((item) => item.id !== task.id);
        renderTasks(allTasks);
    });

    leftSection.appendChild(checkbox);
    leftSection.appendChild(taskName);

    const taskActions = document.createElement("div");
    taskActions.classList.add("task-actions");

    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);

    taskItem.appendChild(leftSection);
    taskItem.appendChild(taskActions);

    taskList.appendChild(taskItem);
}


async function loadTasks() {
    const response = await fetch("/api/tasks");

    const tasks = await response.json();

    allTasks = tasks;

    renderTasks(allTasks);
}


async function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const response = await fetch("/api/tasks", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            title: taskText,
        }),
    });

    const newTask = await response.json();

    if (newTask.error) {
        alert(newTask.error);
        return;
    }

    allTasks.push(newTask);
    renderTasks(allTasks);

    taskInput.value = "";
    taskInput.focus();
}


addButton.addEventListener("click", addTask);


taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

let currentPanel = null;

function activateTab(selectedTab) {
    addTab.classList.remove("active");
    searchTab.classList.remove("active");

    selectedTab.classList.add("active");
}

addTab.addEventListener("click", () => {
    activateTab(addTab);

    panelStage.classList.add("open");
    panelStage.classList.remove("show-search");

    currentPanel = "add";

    setTimeout(() => {
        taskInput.focus();
    }, 350);
});

searchTab.addEventListener("click", () => {
    activateTab(searchTab);

    panelStage.classList.add("open");
    panelStage.classList.add("show-search");

    currentPanel = "search";

    setTimeout(() => {
        searchInput.focus();
    }, 350);
});
loadTasks();

searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filteredTasks = allTasks.filter((task) =>
        task.title.toLowerCase().includes(keyword)
    );

    renderTasks(filteredTasks);
});

function renderTasks(tasks) {
    taskList.innerHTML = "";

    tasks.forEach(function(task) {
        displayTask(task);
    });
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeIcon.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeIcon.textContent = "☀️";
        localStorage.setItem("theme", "dark");
    } else {
        themeIcon.textContent = "🌙";
        localStorage.setItem("theme", "light");
    }
});