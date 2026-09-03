const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /posts - cenários positivos", () => {
  test("retorna 200 e uma lista de posts na primeira página", async () => {
    const res = await api.get("/posts?page=1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res).toSatisfyApiSpec();
  });

  test("cada post da lista possui os campos obrigatórios", async () => {
    const res = await api.get("/posts?page=1");

    for (const post of res.data) {
      expect(post).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          user_id: expect.any(Number),
          title: expect.any(String),
          body: expect.any(String),
        })
      );
    }
  });
});

describe("GET /posts/{id} - cenários positivos", () => {
  test("retorna 200 e os dados corretos para um post existente", async () => {
    const list = await api.get("/posts?page=1");
    const knownPost = list.data[0];

    const res = await api.get(`/posts/${knownPost.id}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(knownPost.id);
    expect(res.data.user_id).toBe(knownPost.user_id);
    expect(res).toSatisfyApiSpec();
  });
});

describe("GET /users/{id}/posts - cenários positivos", () => {
  test("retorna 200 e apenas posts do usuário informado", async () => {
    const list = await api.get("/posts?page=1");
    const userId = list.data[0].user_id;

    const res = await api.get(`/users/${userId}/posts`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((post) => post.user_id === userId)).toBe(true);
    expect(res).toSatisfyApiSpec();
  });
});
