const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /todos - cenários positivos", () => {
  test("retorna 200 e uma lista de todos na primeira página", async () => {
    const res = await api.get("/todos?page=1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res).toSatisfyApiSpec();
  });

  test("cada todo da lista possui os campos obrigatórios", async () => {
    const res = await api.get("/todos?page=1");

    for (const todo of res.data) {
      expect(todo).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          user_id: expect.any(Number),
          title: expect.any(String),
          due_on: expect.any(String),
          status: expect.stringMatching(/^(pending|completed)$/),
        })
      );
    }
  });
});

describe("GET /todos/{id} - cenários positivos", () => {
  test("retorna 200 e os dados corretos para um todo existente", async () => {
    const list = await api.get("/todos?page=1");
    const knownTodo = list.data[0];

    const res = await api.get(`/todos/${knownTodo.id}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(knownTodo.id);
    expect(res.data.user_id).toBe(knownTodo.user_id);
    expect(res).toSatisfyApiSpec();
  });
});

describe("GET /users/{id}/todos - cenários positivos", () => {
  test("retorna 200 e apenas todos do usuário informado", async () => {
    const list = await api.get("/todos?page=1");
    const userId = list.data[0].user_id;

    const res = await api.get(`/users/${userId}/todos`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((todo) => todo.user_id === userId)).toBe(true);
    expect(res).toSatisfyApiSpec();
  });
});
