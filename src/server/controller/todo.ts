import { HttpNotFoundError } from "@server/infra/errors";
import { todoRepository } from "@server/repository/todo";
import { z as schema } from "zod";

enum ResponseTypes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

async function get(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = {
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  };
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    const response = {
      error: {
        message: "`page` must be a number",
      },
    };
    return handleResponse(response, ResponseTypes.BAD_REQUEST);
  }

  if (query.limit && isNaN(limit)) {
    const response = {
      error: {
        message: "`limit` must be a number",
      },
    };
    return handleResponse(response, ResponseTypes.BAD_REQUEST);
  }

  try {
    const output = await todoRepository.get({ page, limit });
    const { total, pages, todos } = output;
    const response = { total, pages, todos };
    return handleResponse(response, ResponseTypes.OK);
  } catch (error) {
    const response = {
        error: {
          message: "Failed to fetch TODOs",
        },
      };
    return handleResponse(response, ResponseTypes.BAD_REQUEST);
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});

async function create(request: Request) {
  const body = TodoCreateBodySchema.safeParse(await request.json());
  if (!body.success) {
    const response = {
      error: {
        message: "You need to provide a content to create a TODO",
        description: body.error.issues,
      },
    };
    return handleResponse(response, ResponseTypes.BAD_REQUEST);
  }
  try {
    const createTodo = await todoRepository.createByContent(body.data.content);
    const response = { todo: createTodo };
    return handleResponse(response, ResponseTypes.CREATED);
  } catch (error) {
    const response = {
      error: { message: "Failed to create todo" },
    };
    return handleResponse(response, ResponseTypes.BAD_REQUEST);
  }
}

async function toggleDone(id: string) {
  const todoId = schema.string().uuid().safeParse(id);
  if (!todoId.success) {
    const response = {
      error: {
        message: "You must to provide a string ID",
        description: todoId.error,
      },
    };
    return handleResponse(response, ResponseTypes.BAD_REQUEST);
  }

  try {
    const updatedTodo = await todoRepository.toggleDone(todoId.data);
    const response = { todo: updatedTodo };
    return handleResponse(response, 200);
  } catch (error) {
    if (error instanceof Error) {
      const response = { error: { message: error.message } };
      return handleResponse(response, ResponseTypes.NOT_FOUND);
    }
  }
}

async function deleteById(id: string) {
  const todoId = schema.string().uuid().min(36).safeParse(id);
  if (!todoId.success) {
    const response = {
      error: { message: "You must to provide a valid ID" },
    };
    return handleResponse(response, ResponseTypes.BAD_REQUEST);
  }
  try {
    await todoRepository.deleteById(todoId.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return handleResponse(
        { error: { message: error.message } },
        error.status
      );
    }
    if (error instanceof Error) {
      const response = { error: { message: `Internal server error` } };
      return handleResponse(response, 500);
    }
  }
}

function handleResponse(response: unknown, status: number) {
  return new Response(JSON.stringify(response), { status });
}

export const todoController = {
  get,
  create,
  deleteById,
  toggleDone,
};
