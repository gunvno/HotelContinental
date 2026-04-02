/** @type {import("prettier").Config} */
const config = {
  arrowParens: "always",
  singleQuote: false,
  trailingComma: "all",
  printWidth: 90,
  tabWidth: 2,
  semi: true,
  bracketSpacing: true,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
