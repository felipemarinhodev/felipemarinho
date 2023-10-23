import { Todo, TodoSchema } from "@ui/schema/todo";
import { z as schema } from "zod";

interface TodoRepositoryGetParams {
  page: number;
  limit: number;
}
interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}
function get({
  page,
  limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
  return fetch(`/api/todos?page=${page}&limit=${limit}`).then(
    async (response) => {
      const todosString = await response.text();
      const { todos, total, pages } = parseTodosFromServer(
        JSON.parse(todosString)
      );

      return { todos, total, pages };
    }
  );
}

async function createByContent(content: string): Promise<Todo> {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });

  if (response.ok) {
    const serverResponse = await response.json();
    const ServerResponseSchema = schema.object({
      todo: TodoSchema,
    });
    const serverResponseParsed = ServerResponseSchema.safeParse(serverResponse);
    if (!serverResponseParsed.success) {
      throw new Error("Failed to create TODO");
    }
    const todo = serverResponseParsed.data.todo;
    return todo;
  }
  throw new Error("Failed to create TODO");
}

export const todoRepository = {
  get,
  createByContent,
};

function parseTodosFromServer(responseBody: unknown): {
  todos: Array<Todo>;
  total: number;
  pages: number;
} {
  if (
    responseBody !== null &&
    typeof responseBody === "object" &&
    "todos" in responseBody &&
    "total" in responseBody &&
    "pages" in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
      total: Number(responseBody.total),
      pages: Number(responseBody.pages),
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo === null && typeof todo !== "object") {
          throw new Error("Invalid todo from API");
        }
        const { id, content, date, done } = todo as {
          id: string;
          content: string;
          date: string;
          done: string;
        };
        return {
          id,
          content,
          date: date,
          done: String(done).toLocaleLowerCase() === "true",
        };
      }),
    };
  }
  return {
    todos: [],
    total: 0,
    pages: 1,
  };
}
