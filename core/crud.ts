import fs from "fs";
import { v4 as uuid } from "uuid";

const DB_FILE_PATH = "./core/db";

type UUID = string;

interface Todo {
  id: string;
  date: string;
  content: string;
  done: boolean;
}

export function create(content: string): Todo {
  const todo: Todo = {
    id: uuid(),
    date: new Date().toISOString(),
    content,
    done: false,
  };

  const todos: Array<Todo> = [...read(), todo];

  // salvar o content no sistema
  saveInDB(todos);
  return todo;
}

function saveInDB(todos: Todo[]) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify({ todos }, null, 2));
}

export function read(): Array<Todo> {
  const dbString = fs.readFileSync(DB_FILE_PATH, "utf-8");
  const db = JSON.parse(dbString || "{}");
  if (!db.todos) {
    return [];
  }
  return db.todos;
}

function update(id: UUID, partialTodo: Partial<Todo>) {
  let updatedTodo;
  const todos = read();
  todos.forEach((currentTodo) => {
    const isToUpdate = currentTodo.id === id;
    if (isToUpdate) {
      updatedTodo = Object.assign(currentTodo, partialTodo);
    }
  });

  saveInDB(todos);
  if (!updatedTodo) {
    throw new Error("Please, provide another ID!");
  }
  return updatedTodo;
}

export function updateContentById(id: UUID, content: string) {
  return update(id, { content });
}
export function updateDoneById(id: UUID, done: boolean) {
  return update(id, { done });
}

export function deleteById(id: UUID) {
  const todos = read();
  const todosWithoutOne = todos.filter((todo) => todo.id !== id);
  saveInDB(todosWithoutOne);
}

export function CLEAR_DB() {
  fs.writeFileSync(DB_FILE_PATH, "");
}
