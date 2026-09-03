const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /posts/{id} - cenários negativos", () => {
  test("retorna 404 para um ID inexistente", async () => {
    const res = await api.get("/posts/1");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
    expect(res).toSatisfyApiSpec();
  });

  test("retorna 404 para um ID em formato inválido (ex.: 'abc')", async () => {
    const res = await api.get("/posts/abc");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
  });
});

describe("POST /posts - cenário negativo", () => {
  test("retorna 401 ao tentar criar um post sem token de autenticação", async () => {
    const res = await api.post("/posts", {
      user_id: 1,
      title: "Post sem token",
      body: "Corpo do post",
    });

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ message: "Authentication failed" });
  });
});
