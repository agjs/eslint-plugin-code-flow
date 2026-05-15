import { TSESLint } from '@typescript-eslint/utils';
import * as _typescript_eslint_utils_ts_eslint from '@typescript-eslint/utils/ts-eslint';

interface CodeFlowRuleDocs {
    readonly description: string;
    readonly recommended?: boolean;
}

declare const rules: {
    "prefer-early-return": _typescript_eslint_utils_ts_eslint.RuleModule<"preferEarlyReturn", [], CodeFlowRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
};

declare const preferEarlyReturnRule: _typescript_eslint_utils_ts_eslint.RuleModule<"preferEarlyReturn", [], CodeFlowRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;

type CodeFlowPlugin = TSESLint.FlatConfig.Plugin & {
    configs: Record<string, TSESLint.FlatConfig.Config>;
};
declare const plugin: CodeFlowPlugin;

declare const configs: TSESLint.FlatConfig.SharedConfigs & Record<string, TSESLint.FlatConfig.Config>;

export { configs, plugin as default, preferEarlyReturnRule, rules };
