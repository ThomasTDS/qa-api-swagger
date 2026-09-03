const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Todos - escrita (autenticado) - cenários positivos", () => {
  let api;
  let userId;

  beforeAll(async () => {
    api = createApiClient({ withAuth: true });

    const publicApi = createApiClient();
    const users = await publicApi.get("/users?page=1");
    userId = users.data[0].id;
  });

  test("POST /todos cria um todo com sucesso", async () => {
    const payload = {
      user_id: userId,
      title: "QA Portfolio - Todo de teste",
      due_on: "2026-12-31T00:00:00.000+05:30",
      status: "pending",
    };

    const res = await api.post("/todos", payload);

    expect(res.status).toBe(201);
    expect(res.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        user_id: userId,
        title: payload.title,
        status: payload.status,
      })
    );
    expect(res).toSatisfyApiSpec();

    await api.delete(`/todos/${res.data.id}`);
  });

  test("PUT /todos/{id} atualiza um todo existente", async () => {
    const created = await api.post("/todos", {
      user_id: userId,
      title: "QA Portfolio - Antes do update",
      due_on: "2026-12-31T00:00:00.000+05:30",
      status: "pending",
    });
    const todoId = created.data.id;

    const res = await api.put(`/todos/${todoId}`, { status: "completed" });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(todoId);
    expect(res.data.status).toBe("completed");
    expect(res).toSatisfyApiSpec();

    await api.delete(`/todos/${todoId}`);
  });

  test("DELETE /todos/{id} remove um todo existente", async () => {
    const created = await api.post("/todos", {
      user_id: userId,
      title: "QA Portfolio - Para deletar",
      due_on: "2026-12-31T00:00:00.000+05:30",
      status: "pending",
    });
    const todoId = created.data.id;

    const deleteRes = await api.delete(`/todos/${todoId}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await api.get(`/todos/${todoId}`);
    expect(getRes.status).toBe(404);
  });
});
