const path = require("path");
const jestOpenAPI = require("jest-openapi").default;

jestOpenAPI(path.join(__dirname, "..", "..", "openapi", "gorest-openapi.yaml"));
