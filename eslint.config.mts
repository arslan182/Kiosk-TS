// Copyright (C) 2023 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

// @ts-check
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import noSecrets from 'eslint-plugin-no-secrets';
import { configs as packageJson } from 'eslint-plugin-package-json';
import { configs as regexp } from 'eslint-plugin-regexp';
import { configs as security } from 'eslint-plugin-security';
import { configs as sonarjs } from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { configs as tseslint } from 'typescript-eslint';

// https://eslint.org/docs/latest/use/getting-started#manual-set-up
// https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-prettier
// "jiti" ist erforderlich fuer TypeScript als Sprache fuer die Konfigurationsdatei
export default defineConfig(
    {
        files: ['src/*.mts'],

        extends: [
            // https://eslint.org/docs/latest/rules
            // https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js
            eslint.configs.recommended,
            // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/strict-type-checked.ts
            ...tseslint.strictTypeChecked,
            ...tseslint.stylistic,
            // https://github.com/sindresorhus/eslint-plugin-unicorn/tree/main?tab=readme-ov-file#rules
            unicorn.configs.recommended,
            // https://github.com/SonarSource/eslint-plugin-sonarjs
            // https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/src/index.ts
            sonarjs.recommended,
            // https://github.com/eslint-community/eslint-plugin-security?tab=readme-ov-file#flat-config-requires-eslint--v8230
            security.recommended,
            // https://github.com/eslint-community/eslint-plugin-eslint-comments/blob/main/lib/configs/recommended.js
            comments.recommended,
            // https://github.com/ota-meshi/eslint-plugin-regexp/blob/master/lib/configs/rules/recommended.ts
            regexp.recommended,
            // https://github.com/eslint-community/eslint-plugin-promise#rules
            stylistic.configs.recommended,
        ],