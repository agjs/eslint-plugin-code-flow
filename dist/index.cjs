"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  configs: () => configs,
  default: () => src_default,
  preferEarlyReturnRule: () => preferEarlyReturnRule,
  rules: () => rules
});
module.exports = __toCommonJS(src_exports);

// src/configs/recommended.ts
var recommendedRules = {
  "code-flow/prefer-early-return": "error"
};

// src/utils/createRule.ts
var import_utils = require("@typescript-eslint/utils");
var createRule = import_utils.ESLintUtils.RuleCreator(
  (ruleName) => `https://github.com/agjs/eslint-plugin-code-flow/blob/main/docs/rules/${ruleName}.md`
);

// src/utils/preferEarlyReturn.ts
var import_utils2 = require("@typescript-eslint/utils");
var FLIPPABLE_OPERATORS = /* @__PURE__ */ new Map([
  ["===", "!=="],
  ["!==", "==="],
  ["==", "!="],
  ["!=", "=="],
  ["<", ">="],
  [">", "<="],
  ["<=", ">"],
  [">=", "<"]
]);
var MIN_CONSEQUENT_STATEMENTS = 2;
function getFunctionBlockBody(node) {
  if (node.body.type !== import_utils2.AST_NODE_TYPES.BlockStatement) {
    return null;
  }
  return node.body;
}
function findWrappedHappyPathIf(body) {
  if (body.body.length === 0) {
    return null;
  }
  const lastStatement = body.body[body.body.length - 1];
  if (lastStatement === void 0 || lastStatement.type !== import_utils2.AST_NODE_TYPES.IfStatement) {
    return null;
  }
  if (lastStatement.alternate !== null) {
    return null;
  }
  if (lastStatement.consequent.type !== import_utils2.AST_NODE_TYPES.BlockStatement) {
    return null;
  }
  if (lastStatement.consequent.body.length < MIN_CONSEQUENT_STATEMENTS) {
    return null;
  }
  return lastStatement;
}
function negateTestExpression(sourceCode, test) {
  if (test.type === import_utils2.AST_NODE_TYPES.UnaryExpression && test.operator === "!") {
    return sourceCode.getText(test.argument);
  }
  if (test.type === import_utils2.AST_NODE_TYPES.Identifier || test.type === import_utils2.AST_NODE_TYPES.MemberExpression || test.type === "ChainExpression") {
    return `!${sourceCode.getText(test)}`;
  }
  if (test.type === import_utils2.AST_NODE_TYPES.BinaryExpression) {
    const flipped = FLIPPABLE_OPERATORS.get(test.operator);
    if (flipped !== void 0) {
      return `${sourceCode.getText(test.left)} ${flipped} ${sourceCode.getText(test.right)}`;
    }
  }
  if (test.type === import_utils2.AST_NODE_TYPES.LogicalExpression) {
    if (test.operator === "&&") {
      return `${negateOperand(sourceCode, test.left)} || ${negateOperand(sourceCode, test.right)}`;
    }
    if (test.operator === "||") {
      return `${negateOperand(sourceCode, test.left)} && ${negateOperand(sourceCode, test.right)}`;
    }
  }
  return `!(${sourceCode.getText(test)})`;
}
function negateOperand(sourceCode, node) {
  const negated = negateTestExpression(sourceCode, node);
  if (needsParentheses(node)) {
    return `(${negated})`;
  }
  return negated;
}
function needsParentheses(node) {
  return node.type === import_utils2.AST_NODE_TYPES.BinaryExpression || node.type === import_utils2.AST_NODE_TYPES.LogicalExpression || node.type === import_utils2.AST_NODE_TYPES.ConditionalExpression || node.type === import_utils2.AST_NODE_TYPES.AssignmentExpression;
}
function buildGuardClauseReplacement(sourceCode, ifStatement) {
  if (ifStatement.consequent.type !== import_utils2.AST_NODE_TYPES.BlockStatement) {
    return null;
  }
  const invertedTest = negateTestExpression(sourceCode, ifStatement.test);
  const guardClause = `if (${invertedTest}) {
  return;
}
`;
  const hoistedBody = ifStatement.consequent.body.map((statement) => sourceCode.getText(statement)).join("\n");
  return `${guardClause}
${hoistedBody}`;
}

// src/rules/preferEarlyReturn.ts
var RULE_NAME = "prefer-early-return";
var preferEarlyReturnRule = createRule({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Prefer guard clauses (early return) over wrapping the function body in a multi-statement `if` without an `else`.",
      recommended: true
    },
    schema: [],
    messages: {
      preferEarlyReturn: "Use a guard clause (early return) instead of wrapping the function body in an `if`. Invert the condition and return early so the happy path stays at the top level."
    },
    hasSuggestions: true
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    function reportWrappedHappyPath(ifStatement) {
      const replacement = buildGuardClauseReplacement(sourceCode, ifStatement);
      const suggest = replacement === null ? [] : [
        {
          messageId: "preferEarlyReturn",
          fix(fixer) {
            return fixer.replaceText(ifStatement, replacement);
          }
        }
      ];
      context.report({
        node: ifStatement,
        messageId: "preferEarlyReturn",
        suggest
      });
    }
    function checkFunctionBody(node) {
      const body = getFunctionBlockBody(node);
      if (body === null) {
        return;
      }
      const wrappedIf = findWrappedHappyPathIf(body);
      if (wrappedIf !== null) {
        reportWrappedHappyPath(wrappedIf);
      }
    }
    return {
      FunctionDeclaration: checkFunctionBody,
      FunctionExpression: checkFunctionBody,
      ArrowFunctionExpression: checkFunctionBody
    };
  }
});

// src/rules/index.ts
var rules = {
  "prefer-early-return": preferEarlyReturnRule
};

// src/index.ts
var plugin = {
  meta: {
    name: "eslint-plugin-code-flow",
    version: "0.1.0"
  },
  rules,
  configs: {}
};
plugin.configs.recommended = {
  plugins: {
    "code-flow": plugin
  },
  rules: recommendedRules
};
var configs = plugin.configs;
var src_default = plugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configs,
  preferEarlyReturnRule,
  rules
});
