import { HttpNotFoundError } from "@server/infra/errors";
import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";

async function get(request: NextApiRequest, response: NextApiResponse) {
  const { query } = request;
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    response.status(400).json({
      error: {
        message: "`page` must be a number",
      },
    });
    return;
  }

  if (query.limit && isNaN(limit)) {
    response.status(400).json({
      error: {
        message: "`limit` must be a number",
      },
    });
    return;
  }

  const output = todoRepository.get({ page, limit });
  const { total, pages, todos } = output;
  response.status(200).json({ total, pages, todos });
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});

async function create(request: NextApiRequest, response: NextApiResponse) {
  const body = TodoCreateBodySchema.safeParse(request.body);
  if (!body.success) {
    response.status(400).json({
      error: {
        message: "You need to provide a content to create a TODO",
        description: body.error.issues,
      },
    });
    return;
  }
  const createTodo = await todoRepository.createByContent(body.data.content);
  response.status(201).json({
    todo: createTodo,
  });
}

async function toggleDone(request: NextApiRequest, response: NextApiResponse) {
  const todoId = schema.string().uuid().safeParse(request.query.id);
  if (!todoId.success) {
    response.status(400).json({
      error: {
        message: "You must to provide a string ID",
      },
    });
    return;
  }
  try {
    const updatedTodo = await todoRepository.toggleDone(todoId.data);

    response.status(200).json({
      todo: updatedTodo,
    });
  } catch (error) {
    if (error instanceof Error) {
      response.status(404).json({
        error: {
          message: error.message,
        },
      });
    }
  }
}

async function deleteById(request: NextApiRequest, response: NextApiResponse) {
  const todoId = schema.string().uuid().min(36).safeParse(request.query.id);
  if (!todoId.success) {
    response.status(400).json({
      error: {
        message: "You must to provide a valid ID",
      },
    });
    return;
  }
  try {
    await todoRepository.deleteById(todoId.data);
    response.status(204).end();
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      response.status(error.status).json({
        error: {
          message: error.message,
        },
      });
    }
    if (error instanceof Error) {
      response.status(500).json({
        error: {
          message: `Internal server error`,
        },
      });
    }
  }
}

export const todoController = {
  get,
  create,
  deleteById,
  toggleDone,
};
