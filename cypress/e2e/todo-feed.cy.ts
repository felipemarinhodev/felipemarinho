const BASE_URL = "http://localhost:3000";
describe("/ - Todos feed", () => {
  it("when load, renders the page", () => {
    cy.visit(BASE_URL);
  });

  it("When create a new todo, it must appears in the screens", () => {
    // Intercept
    cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          todo: {
            id: "f478cf94-9df9-4d56-acfb-0dd00246a85d",
            date: "2023-10-25T05:40:23.702Z",
            content: "Test todo",
            done: false,
          },
        },
      });
    }).as("Create todo");
    // abri a pagina
    cy.visit(BASE_URL);
    // selecinar o input de criar nova todo
    const $inputAddTodo = cy.get("input[name='add-todo']");
    // digitar no input de criar nova todo
    $inputAddTodo.type("Test todo");
    // clicar no botão
    const $btnAddTodo = cy.get("[aria-label='Adicionar novo item']");
    $btnAddTodo.click();
    // checar na pagina se surgiu o novo element
    cy.get("table > tbody").contains("Test todo");
  });
});
