const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Segurança - mass assignment e tratamento de entrada (autenticado)", () => {
  let api;

  beforeAll(() => {
    api = createApiClient({ withAuth: true });
  });

  function uniqueEmail(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
  }

  test("POST /users ignora o campo 'id' enviado pelo cliente", async () => {
    const res = await api.post("/users", {
      id: 1,
      name: "QA Portfolio - Mass Assignment",
      email: uniqueEmail("mass-assign-post"),
      gender: "male",
      status: "active",
    });

    expect(res.status).toBe(201);
    expect(res.data.id).not.toBe(1);
    expect(res.data.id).toBeGreaterThan(1);

    await api.delete(`/users/${res.data.id}`);
  });

  test("PUT /users/{id} ignora tentativa de alterar o 'id'", async () => {
    const created = await api.post("/users", {
      name: "QA Portfolio - Mass Assignment PUT",
      email: uniqueEmail("mass-assign-put"),
      gender: "male",
      status: "active",
    });
    const originalId = created.data.id;

    const res = await api.put(`/users/${originalId}`, { id: 1 });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(originalId);

    await api.delete(`/users/${originalId}`);
  });

  test("POST /users com caracteres especiais/script no nome é armazenado e devolvido sem corromper a resposta", async () => {
    const payload = {
      name: "<script>alert(1)</script> O'Brien --",
      email: uniqueEmail("injection"),
      gender: "male",
      status: "active",
    };

    const res = await api.post("/users", payload);

    expect(res.status).toBe(201);
    expect(res.data.name).toBe(payload.name);

    await api.delete(`/users/${res.data.id}`);
  });
});
