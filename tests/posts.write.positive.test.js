const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Posts - escrita (autenticado) - cenários positivos", () => {
  let api;
  let userId;

  beforeAll(async () => {
    api = createApiClient({ withAuth: true });

    const publicApi = createApiClient();
    const users = await publicApi.get("/users?page=1");
    userId = users.data[0].id;
  });

  test("POST /posts cria um post com sucesso", async () => {
    const payload = {
      user_id: userId,
      title: "QA Portfolio - Post de teste",
      body: "Corpo do post criado pelos testes automatizados.",
    };

    const res = await api.post("/posts", payload);

    expect(res.status).toBe(201);
    expect(res.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        user_id: userId,
        title: payload.title,
        body: payload.body,
      })
    );
    expect(res).toSatisfyApiSpec();

    await api.delete(`/posts/${res.data.id}`);
  });

  test("PUT /posts/{id} atualiza um post existente", async () => {
    const created = await api.post("/posts", {
      user_id: userId,
      title: "QA Portfolio - Antes do update",
      body: "Corpo original.",
    });
    const postId = created.data.id;

    const res = await api.put(`/posts/${postId}`, { title: "QA Portfolio - Depois do update" });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(postId);
    expect(res.data.title).toBe("QA Portfolio - Depois do update");
    expect(res).toSatisfyApiSpec();

    await api.delete(`/posts/${postId}`);
  });

  test("DELETE /posts/{id} remove um post existente", async () => {
    const created = await api.post("/posts", {
      user_id: userId,
      title: "QA Portfolio - Para deletar",
      body: "Corpo do post.",
    });
    const postId = created.data.id;

    const deleteRes = await api.delete(`/posts/${postId}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await api.get(`/posts/${postId}`);
    expect(getRes.status).toBe(404);
  });
});
