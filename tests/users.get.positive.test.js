const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /users - cenários positivos", () => {
  test("retorna 200 e uma lista de usuários na primeira página", async () => {
    const res = await api.get("/users?page=1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res).toSatisfyApiSpec();
  });

  test("cada usuário da lista possui os campos obrigatórios", async () => {
    const res = await api.get("/users?page=1");

    for (const user of res.data) {
      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          gender: expect.stringMatching(/^(male|female)$/),
          status: expect.stringMatching(/^(active|inactive)$/),
        })
      );
    }
  });

  test("filtra corretamente por gender=female", async () => {
    const res = await api.get("/users?gender=female&page=1");

    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((user) => user.gender === "female")).toBe(true);
  });
});

describe("GET /users/{id} - cenários positivos", () => {
  test("retorna 200 e os dados corretos para um usuário existente", async () => {
    const list = await api.get("/users?page=1");
    const knownUser = list.data[0];

    const res = await api.get(`/users/${knownUser.id}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(knownUser.id);
    expect(res.data.email).toBe(knownUser.email);
    expect(res).toSatisfyApiSpec();
  });
});
