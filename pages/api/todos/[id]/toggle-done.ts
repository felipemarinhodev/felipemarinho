import { todoController } from "@server/controller/todo";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  switch (request.method) {
    case "PUT":
      todoController.toggleDone(request, response);
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
