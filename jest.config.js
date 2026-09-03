module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./reports/jest",
        filename: "index.html",
        pageTitle: "Relatório de testes - qa-api-swagger",
        expand: true,
      },
    ],
  ],
};
