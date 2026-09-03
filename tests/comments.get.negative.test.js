const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /comments/{id} - cenários negativos", () => {
  test("retorna 404 para um ID inexistente", async () => {
    const res = await api.get("/comments/1");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
    expect(res).toSatisfyApiSpec();
  });

  test("retorna 404 para um ID em formato inválido (ex.: 'abc')", async () => {
    const res = await api.get("/comments/abc");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
  });
});

describe("POST /comments - cenário negativo", () => {
  test("retorna 401 ao tentar criar um comment sem token de autenticação", async () => {
    const res = await api.post("/comments", {
      post_id: 1,
      name: "Sem Token",
      email: "sem-token@example.test",
      body: "Comentário sem token",
    });

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ message: "Authentication failed" });
  });
});
