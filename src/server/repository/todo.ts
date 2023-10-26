import {
  create,
  read,
  updateDoneById,
  deleteById as dbDeleteById,
} from "@db-crud-todo";
import { Todo, TodoSchema } from "@server/schema/todo";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

async function get({
  page = 1,
  limit = 2,
}: TodoRepositoryGetParams = {}): Promise<TodoRepositoryGetOutput> {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit - 1;
  const { data, error, count } = await supabase
    .from("todos")
    .select("*", { count: "exact" })
    .range(startIndex, endIndex)
    .order("date", { ascending: false });
  if (error) throw new Error("Failed to fetch data");

  const parsedData = TodoSchema.array().safeParse(data);
  if (!parsedData.success) {
    throw new Error("Failed to parse TODO from database");
  }

  const todos = parsedData.data;
  const total = count || todos.length;
  const totalPages = Math.ceil(total / limit);
  return {
    todos,
    total,
    pages: totalPages,
  };
}

async function createByContent(content: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert([
      {
        content,
      },
    ])
    .select()
    .single();

  if (error) throw new Error("Failed to create todo");

  const parsedData = TodoSchema.parse(data);
  return parsedData;
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
