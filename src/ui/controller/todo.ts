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

export const todoController = {
  get,
};
