const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Users - escrita (autenticado) - cenários negativos", () => {
  let api;

  beforeAll(() => {
    api = createApiClient({ withAuth: true });
  });

  function uniqueEmail(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
  }

  test("POST /users sem o campo obrigatório 'name' retorna 422", async () => {
    const res = await api.post("/users", {
      email: uniqueEmail("no-name"),
      gender: "male",
      status: "active",
    });

    expect(res.status).toBe(422);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "name" })])
    );
  });

  test("POST /users com email em formato inválido retorna 422", async () => {
    const res = await api.post("/users", {
      name: "QA Portfolio Email Invalido",
      email: "isso-nao-e-um-email",
      gender: "male",
      status: "active",
    });

    expect(res.status).toBe(422);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "email" })])
    );
  });

  test("POST /users com email já cadastrado retorna 422", async () => {
    const email = uniqueEmail("duplicado");
    const first = await api.post("/users", {
      name: "QA Portfolio Original",
      email,
      gender: "female",
      status: "active",
    });
    expect(first.status).toBe(201);

    const duplicate = await api.post("/users", {
      name: "QA Portfolio Duplicado",
      email,
      gender: "female",
      status: "active",
    });

    expect(duplicate.status).toBe(422);
    expect(duplicate.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email", message: expect.stringContaining("taken") }),
      ])
    );

    await api.delete(`/users/${first.data.id}`);
  });

  test("PUT /users/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.put("/users/1", { status: "inactive" });

    expect(res.status).toBe(404);
  });

  test("DELETE /users/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.delete("/users/1");

    expect(res.status).toBe(404);
  });
});
