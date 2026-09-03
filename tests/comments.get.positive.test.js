const { createApiClient } = require("../src/apiClient");

const api = createApiClient();

describe("GET /comments - cenários positivos", () => {
  test("retorna 200 e uma lista de comments na primeira página", async () => {
    const res = await api.get("/comments?page=1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res).toSatisfyApiSpec();
  });

  test("cada comment da lista possui os campos obrigatórios", async () => {
    const res = await api.get("/comments?page=1");

    for (const comment of res.data) {
      expect(comment).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          post_id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          body: expect.any(String),
        })
      );
    }
  });
});

describe("GET /comments/{id} - cenários positivos", () => {
  test("retorna 200 e os dados corretos para um comment existente", async () => {
    const list = await api.get("/comments?page=1");
    const knownComment = list.data[0];

    const res = await api.get(`/comments/${knownComment.id}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(knownComment.id);
    expect(res.data.post_id).toBe(knownComment.post_id);
    expect(res).toSatisfyApiSpec();
  });
});

describe("GET /posts/{id}/comments - cenários positivos", () => {
  test("retorna 200 e apenas comments do post informado", async () => {
    const list = await api.get("/comments?page=1");
    const postId = list.data[0].post_id;

    const res = await api.get(`/posts/${postId}/comments`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((comment) => comment.post_id === postId)).toBe(true);
    expect(res).toSatisfyApiSpec();
  });
});
