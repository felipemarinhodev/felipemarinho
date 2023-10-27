import { supabase } from "@server/infra/db/supabase";
import { Todo, TodoSchema } from "@server/schema/todo";

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

async function getTodoById(id: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error("Failed to get todo by id");
  const parsedData = TodoSchema.safeParse(data);
  if (!parsedData.success) throw new Error("Failed to get todo by id");
  return parsedData.data;
}

async function toggleDone(id: string): Promise<Todo> {
  const todo = await getTodoById(id);
  const { data, error } = await supabase
    .from("todos")
    .update({
      done: !todo.done,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update todo by id`);
  const parsedData = TodoSchema.parse(data);
  return parsedData;
}

async function deleteById(id: string) {
  const { error } = await supabase.from("todos").delete().match({
    id,
  });
  if (error) throw new Error(`Todo with id: "${id}" not found.`);
}

export const todoRepository = {
  get,
  createByContent,
  deleteById,
  toggleDone,
};
