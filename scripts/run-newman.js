require("dotenv").config();
const path = require("path");
const newman = require("newman");

const readOnly = process.argv.includes("--read-only");
const hasToken = Boolean(process.env.GOREST_TOKEN);
const runOnlyReadFolder = readOnly || !hasToken;

if (!hasToken && !readOnly) {
  console.log(
    "GOREST_TOKEN não definido - rodando apenas a pasta 'Users - Leitura (sem autenticação)'."
  );
}

const options = {
  collection: path.join(__dirname, "..", "postman", "gorest.postman_collection.json"),
  environment: path.join(__dirname, "..", "postman", "gorest.postman_environment.json"),
  envVar: [{ key: "bearerToken", value: process.env.GOREST_TOKEN || "" }],
  reporters: "cli",
};

if (runOnlyReadFolder) {
  options.folder = "Users - Leitura (sem autenticação)";
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
