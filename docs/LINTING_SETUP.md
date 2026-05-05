# ESLint, Prettier, and Husky Setup Guide

This project uses a comprehensive linting and formatting setup to maintain code quality and consistency.

---

## Overview

- **ESLint**: Code quality and best practices linter
- **Prettier**: Code formatter for consistent styling
- **Husky**: Git hooks manager
- **lint-staged**: Runs linters on staged files only

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.eslintrc.js` | ESLint rules and configuration |
| `.prettierrc` | Prettier formatting options |
| `.eslintignore` | Files to exclude from ESLint |
| `.prettierignore` | Files to exclude from Prettier |
| `.editorconfig` | Editor settings for consistency |
| `.husky/pre-commit` | Pre-commit hook script |
| `.vscode/settings.json` | VS Code workspace settings |

---

## Available Scripts

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

### Git Hooks

```bash
# Initialize Husky (already done)
npm run prepare
```

---

## Pre-Commit Hook

Every time you commit code, the pre-commit hook automatically:

1. **Runs ESLint** on staged `.ts`, `.tsx`, `.js`, `.jsx` files
2. **Runs Prettier** on staged files
3. **Auto-fixes** formatting issues
4. **Blocks commit** if there are unfixable ESLint errors

### What Gets Checked

- TypeScript/JavaScript files: ESLint + Prettier
- JSON/Markdown files: Prettier
- YAML files: Prettier

---

## ESLint Rules

### Key Rules Enforced

1. **Arrow Functions**: All components and functions must use arrow syntax
2. **No `var`**: Always use `const` or `let`
3. **Template Literals**: Prefer template strings over concatenation
4. **Async/Await**: Proper async function usage
5. **Import Extensions**: No explicit extensions (Metro handles this)
6. **React Hooks**: Proper hooks usage
7. **TypeScript**: Strict TypeScript checks

### Special Overrides

- **Test files**: Console.log allowed
- **Config files**: CommonJS `require()` allowed

---

## Prettier Configuration

```json
{
  "semi": false,              // No semicolons
  "trailingComma": "none",    // No trailing commas
  "singleQuote": true,        // Single quotes for strings
  "printWidth": 100,          // Max line width 100 chars
  "tabWidth": 2,              // 2-space indentation
  "bracketSpacing": true,     // Spaces in object literals
  "jsxSingleQuote": false,    // Double quotes in JSX
  "arrowParens": "always"     // Always parenthesize arrow params
}
```

---

## VS Code Integration

### Required Extensions

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)

### Automatic Actions

- **Format on Save**: Automatically formats when you save
- **Fix ESLint on Save**: Auto-fixes linting errors
- **Organize Imports**: Sorts imports automatically

---

## Workflow

### Normal Development

1. Write code
2. Save file → auto-format + auto-fix
3. Commit → pre-commit hook runs
4. If errors → fix and commit again

### Manual Check

```bash
# Check everything before pushing
npm run lint
npm run format:check
```

---

## Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit hook (NOT RECOMMENDED)
git commit --no-verify
```

⚠️ **Warning**: Only use `--no-verify` in emergencies. This skips quality checks.

---

## Common Issues

### 1. ESLint Error: "Insert newline"

**Fix**: Run `npm run format` or save the file in VS Code.

### 2. ESLint Error: "Unexpected console statement"

**Fix**: Use `console.warn` or `console.error` instead, or remove it.

### 3. Import order issues

**Fix**: Save file in VS Code (auto-organizes imports) or run `npm run lint:fix`.

### 4. Pre-commit hook fails

**Fix**: 
1. Check error message
2. Run `npm run lint:fix`
3. Commit again

---

## Adding New Rules

### ESLint

Edit `.eslintrc.js`:

```javascript
rules: {
  'new-rule-name': ['error', 'options']
}
```

### Prettier

Edit `.prettierrc`:

```json
{
  "new-option": value
}
```

---

## Testing the Setup

```bash
# Test linting
npm run lint

# Test formatting
npm run format:check

# Test pre-commit hook
git add .
git commit -m "test commit"
```

---

## Best Practices

1. **Save frequently**: VS Code auto-fixes on save
2. **Check before push**: Run `npm run lint` manually
3. **Don't bypass hooks**: Let the checks run
4. **Fix errors immediately**: Don't accumulate lint debt
5. **Use recommended extensions**: Install ESLint and Prettier in VS Code

---

## Resources

- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)