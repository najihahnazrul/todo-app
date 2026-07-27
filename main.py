from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import create_table, get_connection


app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)


class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

@app.on_event("startup")
def startup():
    create_table()


@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )


@app.get("/api/tasks")
def get_tasks():
    connection = get_connection()

    tasks = connection.execute(
        """
        SELECT id, title, completed
        FROM tasks
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()

    return [
        {
            "id": task["id"],
            "title": task["title"],
            "completed": bool(task["completed"]),
        }
        for task in tasks
    ]


@app.post("/api/tasks")
def create_task(task: TaskCreate):
    title = task.title.strip()

    if not title:
        return {
            "error": "Task cannot be empty."
        }

    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO tasks (title)
        VALUES (?)
        """,
        (title,),
    )

    connection.commit()

    task_id = cursor.lastrowid

    connection.close()

    return {
        "id": task_id,
        "title": title,
        "completed": False,
    }

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    connection = get_connection()

    cursor = connection.execute(
        """
        DELETE FROM tasks
        WHERE id = ?
        """,
        (task_id,),
    )

    connection.commit()
    connection.close()

    if cursor.rowcount == 0:
        return {
            "error": "Task not found."
        }

    return {
        "message": "Task deleted successfully."
    }

@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    connection = get_connection()

    existing_task = connection.execute(
        """
        SELECT id, title, completed
        FROM tasks
        WHERE id = ?
        """,
        (task_id,),
    ).fetchone()

    if existing_task is None:
        connection.close()
        return {"error": "Task not found."}

    new_title = (
        task.title.strip()
        if task.title is not None
        else existing_task["title"]
    )

    new_completed = (
        task.completed
        if task.completed is not None
        else existing_task["completed"]
    )

    if new_title == "":
        connection.close()
        return {"error": "Task title cannot be empty."}

    connection.execute(
        """
        UPDATE tasks
        SET title = ?, completed = ?
        WHERE id = ?
        """,
        (new_title, new_completed, task_id),
    )

    connection.commit()
    connection.close()

    return {
        "id": task_id,
        "title": new_title,
        "completed": bool(new_completed),
    }