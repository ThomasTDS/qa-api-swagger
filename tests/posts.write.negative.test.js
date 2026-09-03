const { createApiClient } = require("../src/apiClient");

const describeIfToken = process.env.GOREST_TOKEN ? describe : describe.skip;

describeIfToken("Posts - escrita (autenticado) - cenários negativos", () => {
  let api;
  let userId;

  beforeAll(async () => {
    api = createApiClient({ withAuth: true });

    const publicApi = createApiClient();
    const users = await publicApi.get("/users?page=1");
    userId = users.data[0].id;
  });

  test("POST /posts sem o campo obrigatório 'title' retorna 422", async () => {
    const res = await api.post("/posts", {
      user_id: userId,
      body: "Corpo sem título",
    });

    expect(res.status).toBe(422);
    expect(res.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "title" })])
    );
  });

  test("POST /posts com user_id inexistente retorna 422", async () => {
    const res = await api.post("/posts", {
      user_id: 1,
      title: "Post com autor inexistente",
      body: "Corpo do post",
    });

    expect(res.status).toBe(422);
    expect(res.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "user", message: "must exist" }),
      ])
    );
  });

  test("PUT /posts/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.put("/posts/1", { title: "Não deveria funcionar" });

    expect(res.status).toBe(404);
  });

  test("DELETE /posts/{id} em um ID inexistente retorna 404", async () => {
    const res = await api.delete("/posts/1");

    expect(res.status).toBe(404);
  });
});
