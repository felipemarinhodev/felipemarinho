import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";

function get(request: NextApiRequest, response: NextApiResponse) {
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

export const todoController = {
  get,
};
