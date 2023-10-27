import { NextApiRequest, NextApiResponse } from "next";

export default await function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.status(200).json({ message: "hello" });
};
