import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-tests.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^.+\\.(css|sass|scss|less)$": "identity-obj-proxy",
  },
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
};

export default createJestConfig(config);
