import sqlite3


DATABASE_NAME = "todo.db"


def get_connection():
    connection = sqlite3.connect("todo.db")
    connection.row_factory = sqlite3.Row
    return connection


def create_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        )
        """
    )

    connection.commit()
    connection.close()