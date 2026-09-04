import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", "outputs/**", ".npm-cache/**"]),
])
