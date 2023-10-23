import { todoRespository } from "@ui/repository/todo";

interface TodoControllerGetParams {
  page: number;
}

async function get({ page }: TodoControllerGetParams) {
  return todoRespository.get({
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
  onSuccess: (todo: any) => void;
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

  const todo = {
    id: "xpto",
    content,
    date: new Date(),
    done: false,
  };
  onSuccess(todo);
}

export const todoController = {
  get,
  filterTodosByContent,
  create,
};
