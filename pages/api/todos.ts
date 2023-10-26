import { NextApiRequest, NextApiResponse } from "next";
import { todoController } from "@server/controller/todo";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  switch (request.method) {
    case "GET":
      await todoController.get(request, response);
      break;
    case "POST":
      await todoController.create(request, response);
      break;

    default:
      response.status(405).json({
        error: {
          message: "Method not allowed",
        },
      });
      break;
  }
}
