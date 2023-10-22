import { NextApiRequest, NextApiResponse } from "next";
import { todoController } from "@server/controller/todo";

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  switch (request.method) {
    case "GET":
      todoController.get(request, response);
      break;

    default:
      response.status(405).json({
        message: "Method not allowed",
      });
      break;
  }
}
