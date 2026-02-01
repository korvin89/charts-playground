import baseConfig from '@gravity-ui/eslint-config';
import prettierConfig from '@gravity-ui/eslint-config/prettier';
import globals from 'globals';

export default [
    {ignores: ['dist']},
    ...baseConfig,
    ...prettierConfig,
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
];
