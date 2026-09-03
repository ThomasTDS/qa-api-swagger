const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /todos/{id} - cenários negativos", () => {
  test("retorna 404 para um ID inexistente", async () => {
    const res = await api.get("/todos/1");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
    expect(res).toSatisfyApiSpec();
  });

  test("retorna 404 para um ID em formato inválido (ex.: 'abc')", async () => {
    const res = await api.get("/todos/abc");

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Resource not found" });
  });
});

describe("POST /todos - cenário negativo", () => {
  test("retorna 401 ao tentar criar um todo sem token de autenticação", async () => {
    const res = await api.post("/todos", {
      user_id: 1,
      title: "Todo sem token",
      due_on: "2026-12-31T00:00:00.000+05:30",
      status: "pending",
    });

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ message: "Authentication failed" });
  });
});
