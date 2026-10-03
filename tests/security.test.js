const { createApiClient } = require("../src/apiClient");

const api = createApiClient();
const invalidAuthHeader = { Authorization: "Bearer token-invalido-garbage-123" };

describe("Segurança - autenticação inválida (não apenas ausente)", () => {
  test("POST com token inválido retorna 401", async () => {
    const res = await api.post(
      "/users",
      { name: "x", email: "x@example.test", gender: "male", status: "active" },
      { headers: invalidAuthHeader }
    );

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ message: "Invalid token" });
  });

  test("PUT com token inválido retorna 401", async () => {
    const res = await api.put("/users/1", { status: "inactive" }, { headers: invalidAuthHeader });

    expect(res.status).toBe(401);
  });

  test("DELETE com token inválido retorna 401", async () => {
    const res = await api.delete("/users/1", { headers: invalidAuthHeader });

    expect(res.status).toBe(401);
  });
});

describe("Segurança - rate limiting (observação de característica)", () => {
  test("uma rajada pequena de GETs não retorna 429 nem expõe headers de rate limit", async () => {
    const burstSize = 15;
    const requests = Array.from({ length: burstSize }, () => api.get("/users?page=1"));
    const responses = await Promise.all(requests);

    expect(responses.every((res) => res.status === 200)).toBe(true);

    const hasRateLimitHeaders = responses.some((res) =>
      Object.keys(res.headers).some((h) => /ratelimit|retry-after/i.test(h))
    );
    expect(hasRateLimitHeaders).toBe(false);
  });
});
