module.exports = {
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".jsx"],
    transform: {
      "^.+\\.jsx$": "<rootDir>/jest-transformer.cjs",
    },
    testMatch: ["**/*.test.js"],
  };