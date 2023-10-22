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
  return fetch("/api/todos").then(async (response) => {
    const todosString = await response.text();
    const ALL_TODOS = parseTodosFromServer(JSON.parse(todosString)).todos;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTodos = ALL_TODOS.slice(startIndex, endIndex);
    const totalPages = Math.ceil(ALL_TODOS.length / limit);

    return {
      todos: paginatedTodos,
      total: ALL_TODOS.length,
      pages: totalPages,
    };
  });
}

export const todoRespository = {
  get,
};

// Model/Schema
interface Todo {
  id: string;
  content: string;
  date: Date;
  done: boolean;
}

function parseTodosFromServer(responseBody: unknown): { todos: Array<Todo> } {
  if (
    responseBody !== null &&
    typeof responseBody === "object" &&
    "todos" in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
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
          date: new Date(date),
          done: String(done).toLocaleLowerCase() === "true",
        };
      }),
    };
  }
  return {
    todos: [],
  };
}
