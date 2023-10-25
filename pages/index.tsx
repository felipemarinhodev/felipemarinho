import { todoController } from "@ui/controller/todo";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { useEffect, useRef, useState } from "react";
const bg = "https://mariosouto.com/cursos/crudcomqualidade/bg";

interface HomeTodo {
  id: string;
  content: string;
  done: boolean;
}
function HomePage() {
  const initialLoadComplete = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [todos, setTodos] = useState<HomeTodo[]>([]);
  const [search, setSearch] = useState("");
  const [newTodoContent, setNewTodoContent] = useState("");
  const homeTodos = todoController.filterTodosByContent<HomeTodo>(
    todos,
    search
  );
  const hasMorePages = totalPages > page;
  const hasNoTodos = homeTodos.length === 0 && !isLoading;
  useEffect(() => {
    if (!initialLoadComplete.current) {
      todoController
        .get({ page })
        .then(({ todos, pages }) => {
          setTodos(todos);
          setTotalPages(pages);
        })
        .finally(() => {
          setIsLoading(false);
          initialLoadComplete.current = true;
        });
    }
  }, []);

  return (
    <main>
      <GlobalStyles themeName="coolGrey" />
      <header
        style={{
          backgroundImage: `url('${bg}')`,
        }}
      >
        <div className="typewriter">
          <h1>O que fazer hoje?</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            todoController.create({
              content: newTodoContent,
              onSuccess(todo: HomeTodo) {
                setTodos((oldTodos) => {
                  return [todo, ...oldTodos];
                });
                setNewTodoContent("");
              },
              onError() {
                alert("Você precisa ter um conteúdo para criar uma TODO");
              },
            });
          }}
        >
          <input
            name="add-todo"
            type="text"
            placeholder="Correr, Estudar..."
            onChange={function newTodoHandler(event) {
              setNewTodoContent(event.target.value);
            }}
            value={newTodoContent}
          />
          <button type="submit" aria-label="Adicionar novo item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input
            type="text"
            placeholder="Filtrar lista atual, ex: Dentista"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">Id</th>
              <th align="left">Conteúdo</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {homeTodos.map((todo) => (
              <tr key={todo.id}>
                <td>
                  <input
                    type="checkbox"
                    // defaultChecked={todo.done}
                    checked={todo.done}
                    onChange={function handleToggle() {
                      // Optimistic Update

                      todoController.toggleDone({
                        id: todo.id,
                        onError() {
                          alert("Falha ao atualizar a TODO");
                        },
                        updateTodoOnScreen() {
                          setTodos((currentTodos) => {
                            return currentTodos.map((currentTodo) => {
                              if (currentTodo.id === todo.id) {
                                return {
                                  ...currentTodo,
                                  done: !currentTodo.done,
                                };
                              }
                              return currentTodo;
                            });
                          });
                        },
                      });
                    }}
                  />
                </td>
                <td>{todo.id.substring(0, 4)}</td>
                <td>
                  {!todo.done && todo.content}
                  {todo.done && <s>{todo.content}</s>}
                </td>
                <td align="right">
                  <button
                    data-type="delete"
                    onClick={() => {
                      todoController
                        .deleteById(todo.id)
                        .then(() => {
                          setTodos((oldTodos) =>
                            oldTodos.filter(
                              (currentTodo) => currentTodo.id !== todo.id
                            )
                          );
                        })
                        .catch(() => {
                          console.error("Failed to delete");
                        });
                    }}
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}

            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  Carregando...
                </td>
              </tr>
            )}

            {hasNoTodos && (
              <tr>
                <td colSpan={4} align="center">
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      setIsLoading(true);
                      const nextPage = page + 1;
                      setPage(nextPage);
                      todoController
                        .get({ page: nextPage })
                        .then(({ todos, pages }) => {
                          setTodos((oldTodos) => [...oldTodos, ...todos]);
                          setTotalPages(pages);
                        })
                        .finally(() => {
                          setIsLoading(false);
                        });
                    }}
                  >
                    Página {page} Carregar mais{" "}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "4px",
                        fontSize: "1.2em",
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default HomePage;
