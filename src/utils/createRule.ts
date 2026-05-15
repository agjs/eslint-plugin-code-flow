import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (ruleName) =>
    `https://github.com/agjs/eslint-plugin-code-flow/blob/main/docs/rules/${ruleName}.md`
);
