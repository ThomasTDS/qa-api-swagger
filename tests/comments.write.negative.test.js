const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Comments - escrita (autenticado) - cenários negativos", () => {
  let api;
  let postId;

  beforeAll(async () => {
    api = createApiClient({ withAuth: true });

    const publicApi = createApiClient();
    const posts = await publicApi.get("/posts?page=1");
    postId = posts.data[0].id;
  });

  test("POST /comments sem o campo obrigatório 'body' retorna 422", async () => {
    const res = await api.post("/comments", {
      post_id: postId,
      name: "QA Portfolio",
      email: `qa-portfolio-${Date.now()}@example.test`,
    });

    expect(res.status).toBe(422);
    expect(res.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "body" })])
    );
  });

  test("POST /comments com post_id inexistente retorna 422", async () => {
    const res = await api.post("/comments", {
      post_id: 1,
      name: "QA Portfolio",
      email: `qa-portfolio-${Date.now()}@example.test`,
      body: "Comentário em post inexistente",
    });

    expect(res.status).toBe(422);
    expect(res.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "post", message: "must exist" }),
      ])
    );
  });

  test("PUT /comments/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.put("/comments/1", { body: "Não deveria funcionar" });

    expect(res.status).toBe(404);
  });

  test("DELETE /comments/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.delete("/comments/1");

    expect(res.status).toBe(404);
  });
});
