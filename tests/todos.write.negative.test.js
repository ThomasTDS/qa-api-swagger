const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Todos - escrita (autenticado) - cenários negativos", () => {
  let api;
  let userId;

  beforeAll(async () => {
    api = createApiClient({ withAuth: true });

    const publicApi = createApiClient();
    const users = await publicApi.get("/users?page=1");
    userId = users.data[0].id;
  });

  test("POST /todos sem o campo obrigatório 'title' retorna 422", async () => {
    const res = await api.post("/todos", {
      user_id: userId,
      due_on: "2026-12-31T00:00:00.000+05:30",
      status: "pending",
    });

    expect(res.status).toBe(422);
    expect(res.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "title" })])
    );
  });

  test("POST /todos com status fora do enum retorna 422", async () => {
    const res = await api.post("/todos", {
      user_id: userId,
      title: "Status inválido",
      due_on: "2026-12-31T00:00:00.000+05:30",
      status: "invalido",
    });

    expect(res.status).toBe(422);
    expect(res.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "status" })])
    );
  });

  test("POST /todos com user_id inexistente retorna 422", async () => {
    const res = await api.post("/todos", {
      user_id: 1,
      title: "Todo com autor inexistente",
      due_on: "2026-12-31T00:00:00.000+05:30",
      status: "pending",
    });

    expect(res.status).toBe(422);
    expect(res.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "user", message: "must exist" }),
      ])
    );
  });

  test("PUT /todos/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.put("/todos/1", { status: "completed" });

    expect(res.status).toBe(404);
  });

  test("DELETE /todos/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.delete("/todos/1");

    expect(res.status).toBe(404);
  });
});
