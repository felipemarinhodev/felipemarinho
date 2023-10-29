import { todoController } from "@server/controller/todo";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  return await todoController.deleteById(id);
}
