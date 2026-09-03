require("dotenv").config();
const path = require("path");
const newman = require("newman");

const READ_ONLY_FOLDERS = [
  "Users - Leitura (sem autenticação)",
  "Posts - Leitura (sem autenticação)",
  "Comments - Leitura (sem autenticação)",
  "Todos - Leitura (sem autenticação)",
];

const readOnly = process.argv.includes("--read-only");
const hasToken = Boolean(process.env.GOREST_TOKEN);
const runOnlyReadFolders = readOnly || !hasToken;

if (!hasToken && !readOnly) {
  console.log(
    "GOREST_TOKEN não definido - rodando apenas as pastas de leitura (sem autenticação)."
  );
}

const options = {
  collection: path.join(__dirname, "..", "postman", "gorest.postman_collection.json"),
  environment: path.join(__dirname, "..", "postman", "gorest.postman_environment.json"),
  envVar: [{ key: "bearerToken", value: process.env.GOREST_TOKEN || "" }],
  reporters: ["cli", "htmlextra"],
  reporter: {
    htmlextra: {
      export: path.join(__dirname, "..", "reports", "newman", "index.html"),
      title: "Relatório de testes - qa-api-swagger (Postman/Newman)",
      showEnvironmentData: false,
      skipHeaders: "Authorization",
    },
  },
};

if (runOnlyReadFolders) {
  options.folder = READ_ONLY_FOLDERS;
}

newman.run(options, (err, summary) => {
  if (err) {
    console.error(err);
    process.exitCode = 1;
    return;
  }
  if (summary.run.failures.length > 0) {
    process.exitCode = 1;
  }
});
