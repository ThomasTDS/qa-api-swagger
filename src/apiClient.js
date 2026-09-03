const axios = require("axios");
require("dotenv").config();

const BASE_URL = "https://gorest.co.in/public/v2";

function createApiClient({ withAuth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (withAuth) {
    if (!process.env.GOREST_TOKEN) {
      throw new Error(
        "GOREST_TOKEN não está definido. Configure-o no .env (local) ou como secret do repositório (CI) para rodar testes autenticados."
      );
    }
    headers.Authorization = `Bearer ${process.env.GOREST_TOKEN}`;
  }

  return axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers,
    validateStatus: () => true,
  });
}

module.exports = { createApiClient, BASE_URL };
