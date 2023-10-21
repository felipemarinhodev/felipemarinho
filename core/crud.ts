import fs from "fs";
import { v4 as uuid} from "uuid";

const DB_FILE_PATH = "./core/db";

interface Todo {
  id: string;
  date: string;
  content: string;
  done: boolean;
}

function create(content: string): Todo {
  const todo: Todo = {
    id: uuid(),
    date: new Date().toISOString(),
    content,
    done: false
  };

  const todos: Array<Todo> = [
    ...read(),
    todo
  ]

  // salvar o content no sistema
  saveOnDB(todos);
  return todo;
}

function saveOnDB(todos: Todo[]) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify({ todos }, null, 2));
}

function read(): Array<Todo> {
  const dbString = fs.readFileSync(DB_FILE_PATH, "utf-8");
  const db = JSON.parse(dbString || "{}");
  if (!db.todos) {
    return []
  }
  return db.todos;
}

function update(id:string, partialTodo: Partial<Todo>) {
  let updatedTodo;
  const todos = read();
  todos.forEach((currentTodo) => {
    const isToUpdate = currentTodo.id === id;
    if (isToUpdate) {
      updatedTodo = Object.assign(currentTodo, partialTodo)
    }
  });
  saveOnDB(todos);
  if (!updatedTodo) {
    throw new Error("Please, provide another ID!");
  }
  return updatedTodo
}

function updateContentById(id:string, content: string) {
  return update(id, {content})
}
function updateDoneById(id:string, done: boolean) {
  return update(id, {done})
}

function CLEAR_DB() {
  fs.writeFileSync(DB_FILE_PATH, "");
}

// [SIMULATIONS]
CLEAR_DB();
create("Primeira TODO");
create("Segunda TODO");
const terceiraTodo = create("Segunda TODO");
updateContentById(terceiraTodo.id, "Terceira Todo");
updateDoneById(terceiraTodo.id, true);
