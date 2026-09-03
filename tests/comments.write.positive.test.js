const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Comments - escrita (autenticado) - cenários positivos", () => {
  let api;
  let postId;

  beforeAll(async () => {
    api = createApiClient({ withAuth: true });

    const publicApi = createApiClient();
    const posts = await publicApi.get("/posts?page=1");
    postId = posts.data[0].id;
  });

  test("POST /comments cria um comment com sucesso", async () => {
    const payload = {
      post_id: postId,
      name: "QA Portfolio",
      email: `qa-portfolio-${Date.now()}@example.test`,
      body: "Comentário criado pelos testes automatizados.",
    };

    const res = await api.post("/comments", payload);

    expect(res.status).toBe(201);
    expect(res.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        post_id: postId,
        name: payload.name,
        email: payload.email,
        body: payload.body,
      })
    );
    expect(res).toSatisfyApiSpec();

    await api.delete(`/comments/${res.data.id}`);
  });

  test("PUT /comments/{id} atualiza um comment existente", async () => {
    const created = await api.post("/comments", {
      post_id: postId,
      name: "QA Portfolio - Antes do update",
      email: `qa-portfolio-${Date.now()}@example.test`,
      body: "Corpo original.",
    });
    const commentId = created.data.id;

    const res = await api.put(`/comments/${commentId}`, { body: "Corpo atualizado." });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(commentId);
    expect(res.data.body).toBe("Corpo atualizado.");
    expect(res).toSatisfyApiSpec();

    await api.delete(`/comments/${commentId}`);
  });

  test("DELETE /comments/{id} remove um comment existente", async () => {
    const created = await api.post("/comments", {
      post_id: postId,
      name: "QA Portfolio - Para deletar",
      email: `qa-portfolio-${Date.now()}@example.test`,
      body: "Corpo do comment.",
    });
    const commentId = created.data.id;

    const deleteRes = await api.delete(`/comments/${commentId}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await api.get(`/comments/${commentId}`);
    expect(getRes.status).toBe(404);
  });
});
