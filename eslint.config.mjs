import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */ //leave this for automation!
export default [
  {
    files: ["**/*.js","**/*.mjs"],
    languageOptions: {
      sourceType: "module"
    }
  },
  {
    languageOptions: { 
      globals: {...globals.browser, ...globals.node} 
    }
  },
  pluginJs.configs.recommended //this is the module that shows problems with code
];
