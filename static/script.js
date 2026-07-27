const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");


function displayTask(task) {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";

    const leftSection = document.createElement("div");
    leftSection.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    const taskName = document.createElement("span");
    taskName.textContent = task.title;

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

        taskItem.remove();
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

    taskList.innerHTML = "";

    tasks.forEach(function (task) {
        displayTask(task);
    });
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

    displayTask(newTask);

    taskInput.value = "";
    taskInput.focus();
}


addButton.addEventListener("click", addTask);


taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});


loadTasks();