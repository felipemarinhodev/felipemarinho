import { todoRepository } from "@ui/repository/todo";
import { Todo } from "@ui/schema/todo";

interface TodoControllerGetParams {
  page: number;
}

async function get({ page }: TodoControllerGetParams) {
  return todoRepository.get({
    page: page || 1,
    limit: 5,
  });
}

function filterTodosByContent<Todo>(
  todos: Array<Todo & { content: string }>,
  search: string
): Todo[] {
  return todos.filter((todo) => {
    const searchNormalized = search.toLocaleLowerCase();
    const contentNormalized = todo.content.toLocaleLowerCase();
    return contentNormalized.includes(searchNormalized);
  });
}

interface TodoControllerCreateParams {
  content?: string;
  onSuccess: (todo: Todo) => void;
  onError: () => void;
}
async function create({
  content,
  onError,
  onSuccess,
}: TodoControllerCreateParams) {
  if (!content) {
    onError();
    return;
  }

  todoRepository
    .createByContent(content)
    .then((newTodo) => {
      onSuccess(newTodo);
    })
    .catch(() => onError());
}

export const todoController = {
  get,
  filterTodosByContent,
  create,
};
