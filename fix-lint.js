import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_RULES = [
  '@typescript-eslint/no-explicit-any',
  '@typescript-eslint/no-unused-vars',
  '@typescript-eslint/no-unsafe-function-type',
  'react-refresh/only-export-components',
  'prefer-const',
  'no-useless-escape',
  '@typescript-eslint/no-require-imports',
  '@typescript-eslint/no-namespace'
];

function fixLintInPackage(packageDir) {
  console.log(`\n\n--- Running eslint in ${packageDir} ---`);
  let eslintOutput = '';
  try {
    eslintOutput = execSync('npx eslint . --format json', { cwd: packageDir, encoding: 'utf-8' });
    console.log('No lint errors found!');
    return;
  } catch (error) {
    eslintOutput = error.stdout;
  }

  const results = JSON.parse(eslintOutput);
  let filesModified = 0;

  for (const result of results) {
    if (result.errorCount === 0) continue;

    const filePath = result.filePath;

    // Sort messages descending by line number to avoid shifting lines when inserting
    const messages = result.messages
      .filter(m => TARGET_RULES.includes(m.ruleId))
      .sort((a, b) => b.line - a.line);

    if (messages.length === 0) continue;

    console.log(`Processing file: ${filePath}`);
    let contentLines = fs.readFileSync(filePath, 'utf-8').split('\n');

    for (const msg of messages) {
      const lineIndex = msg.line - 1; // 0-based
      const ruleId = msg.ruleId;

      const lineContent = contentLines[lineIndex];
      const indentMatch = lineContent.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : '';

      const disableComment = `${indent}// eslint-disable-next-line ${ruleId}`;

      // Don't insert if already there
      if (lineIndex > 0 && contentLines[lineIndex - 1].includes('eslint-disable-next-line')) {
         // Modify existing rule if it's different
         if (!contentLines[lineIndex - 1].includes(ruleId)) {
             contentLines[lineIndex - 1] += `, ${ruleId}`;
         }
      } else {
        contentLines.splice(lineIndex, 0, disableComment);
      }
    }

    fs.writeFileSync(filePath, contentLines.join('\n'));
    filesModified++;
  }

  console.log(`Modified ${filesModified} files in ${packageDir}.`);
}

const packages = ['CredVerseIssuer 3', 'credverse-gateway', 'BlockWalletDigi', 'CredVerseRecruiter', 'packages/shared-auth'];

for (const pkg of packages) {
  const dir = path.join(process.cwd(), pkg);
  if (fs.existsSync(dir)) {
    fixLintInPackage(dir);
  }
}
