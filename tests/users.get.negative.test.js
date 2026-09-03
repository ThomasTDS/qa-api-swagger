const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /users/{id} - cenários negativos", () => {
  test("retorna 404 para um ID inexistente", async () => {
    const res = await api.get("/users/1");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
    expect(res).toSatisfyApiSpec();
  });

  test("retorna 404 (em vez de 400) para um ID em formato inválido - ver issue no repositório", async () => {
    const res = await api.get("/users/abc");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
  });
});

describe("GET /users - cenários negativos / de borda", () => {
  test("retorna 200 com lista vazia para uma página muito além do total existente", async () => {
    const res = await api.get("/users?page=999999");

    expect(res.status).toBe(200);
    expect(res.data).toEqual([]);
  });

  test("aceita silenciosamente um valor de gender fora do enum e retorna lista vazia - ver issue no repositório", async () => {
    const res = await api.get("/users?gender=alien");

    expect(res.status).toBe(200);
    expect(res.data).toEqual([]);
  });
});

describe("POST /users - cenário negativo", () => {
  test("retorna 401 ao tentar criar um usuário sem token de autenticação", async () => {
    const res = await api.post("/users", {
      name: "Usuario Sem Token",
      email: `sem-token-${Date.now()}@example.test`,
      gender: "male",
      status: "active",
    });

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ message: "Authentication failed" });
  });
});
