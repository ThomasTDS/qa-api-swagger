module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
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
