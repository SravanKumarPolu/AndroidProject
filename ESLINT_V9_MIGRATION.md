# ESLint v9 Migration Guide

## Current Status

- **Current ESLint Version**: 8.57.0
- **Target Version**: 9.x
- **Status**: ⚠️ **Deferred** - Requires migration to flat config format

## Why Not Upgraded Yet?

ESLint v9 introduced a breaking change: it uses a new **flat config** format (`eslint.config.js`) instead of the traditional `.eslintrc.js` format. This requires:

1. **Migrating configuration** from `.eslintrc.js` to `eslint.config.js` (flat config format)
2. **Checking compatibility** of `eslint-config-expo` with ESLint v9
3. **Updating all plugins** to versions compatible with ESLint v9

## Migration Steps (When Ready)

### 1. Check Compatibility

```bash
# Check if eslint-config-expo supports ESLint v9
npm view eslint-config-expo peerDependencies

# Check TypeScript ESLint plugin compatibility
npm view @typescript-eslint/eslint-plugin peerDependencies
```

### 2. Install ESLint v9

```bash
npm install --save-dev eslint@^9.0.0
```

### 3. Migrate to Flat Config

Rename `.eslintrc.js` to `eslint.config.js` and convert to flat config format:

```javascript
// eslint.config.js (flat config format)
import expo from 'eslint-config-expo';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  ...expo,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'build/',
      '*.config.js',
      'coverage/',
    ],
  },
];
```

### 4. Update Package Scripts

No changes needed - `npm run lint` will automatically use the new config.

### 5. Test

```bash
npm run lint
```

## Current Workaround

The current ESLint v8 setup is fully functional and provides all necessary linting. The upgrade to v9 can be deferred until:

- `eslint-config-expo` officially supports ESLint v9
- All required plugins are compatible
- Team has time to test the migration

## Resources

- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [Flat Config Format](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Expo ESLint Config](https://docs.expo.dev/guides/using-eslint/)

## Notes

- ESLint v8.57.0 is still supported and receives security updates
- The flat config format is more flexible and easier to maintain
- Consider upgrading when `eslint-config-expo` v8+ is released with ESLint v9 support

