const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Users - escrita (autenticado) - cenários positivos", () => {
  let api;

  beforeAll(() => {
    api = createApiClient({ withAuth: true });
  });

  function uniqueEmail(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
  }

  test("POST /users cria um usuário com sucesso", async () => {
    const payload = {
      name: "QA Portfolio Teste",
      email: uniqueEmail("create"),
      gender: "male",
      status: "active",
    };

    const res = await api.post("/users", payload);

    expect(res.status).toBe(201);
    expect(res.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: payload.name,
        email: payload.email,
        gender: payload.gender,
        status: payload.status,
      })
    );
    expect(res).toSatisfyApiSpec();

    await api.delete(`/users/${res.data.id}`);
  });

  test("PUT /users/{id} atualiza um usuário existente", async () => {
    const created = await api.post("/users", {
      name: "QA Portfolio Antes Update",
      email: uniqueEmail("update"),
      gender: "female",
      status: "active",
    });
    const userId = created.data.id;

    const res = await api.put(`/users/${userId}`, { status: "inactive" });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(userId);
    expect(res.data.status).toBe("inactive");
    expect(res).toSatisfyApiSpec();

    await api.delete(`/users/${userId}`);
  });

  test("DELETE /users/{id} remove um usuário existente", async () => {
    const created = await api.post("/users", {
      name: "QA Portfolio Para Deletar",
      email: uniqueEmail("delete"),
      gender: "male",
      status: "active",
    });
    const userId = created.data.id;

    const deleteRes = await api.delete(`/users/${userId}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await api.get(`/users/${userId}`);
    expect(getRes.status).toBe(404);
  });
});
