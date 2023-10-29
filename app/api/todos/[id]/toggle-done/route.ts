import { todoController } from "@server/controller/todo";

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  return await todoController.toggleDone(id);
}
