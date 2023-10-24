import {
  create,
  read,
  updateDoneById,
  deleteById as dbDeleteById,
} from "@db-crud-todo";

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

// Model/Schema
interface Todo {
  id: string;
  content: string;
  date: string;
  done: boolean;
}

function get({
  page = 1,
  limit = 2,
}: TodoRepositoryGetParams = {}): TodoRepositoryGetOutput {
  const ALL_TODOS = read().reverse();

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTodos = ALL_TODOS.slice(startIndex, endIndex);
  const totalPages = Math.ceil(ALL_TODOS.length / limit);

  return { todos: paginatedTodos, total: ALL_TODOS.length, pages: totalPages };
}

async function createByContent(content: string): Promise<Todo> {
  const newTodo = create(content);
  return newTodo;
}

async function toggleDone(id: string): Promise<Todo> {
  const ALL_TODOS = read();
  const todo = ALL_TODOS.find((todo) => todo.id === id);
  if (!todo) {
    throw new Error(`Todo with id: "${id}" not found.`);
  }
  const updatedTodo = updateDoneById(todo.id, !todo.done);
  return updatedTodo;
}

async function deleteById(id: string) {
  const ALL_TODOS = read();
  const todo = ALL_TODOS.find((todo) => todo.id === id);
  if (!todo) {
    throw new Error(`Todo with id: "${id}" not found.`);
  }
  await dbDeleteById(id);
}

export const todoRepository = {
  get,
  createByContent,
  deleteById,
  toggleDone,
};
