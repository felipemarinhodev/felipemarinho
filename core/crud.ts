import fs from "fs";
import { v4 as uuid} from "uuid";

const DB_FILE_PATH = "./core/db";
console.log('[CRUD]');

interface Todo {
  id: string;
  date: string;
  content: string;
  done: boolean;
}

function create(content: string) {
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
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify({todos}, null, 2))
  return content;
}

function read(): Array<Todo> {
  const dbString = fs.readFileSync(DB_FILE_PATH, "utf-8");
  const db = JSON.parse(dbString || "{}");
  if (!db.todos) {
    return []
  }
  return db.todos;
}

function CLEAR_DB() {
  fs.writeFileSync(DB_FILE_PATH, "");
}

// [SIMULATIONS]
CLEAR_DB();
create("Primeira TODO");
create("Segunda TODO");
console.log(read());


