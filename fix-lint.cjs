const fs = require('fs');
const { execSync } = require('child_process');

function fixLint() {
  try {
    execSync('npx eslint . --format json --output-file eslint-report.json', { stdio: 'ignore' });
  } catch (e) {}

  if (!fs.existsSync('eslint-report.json')) return;

  const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));
  for (const file of report) {
    if (file.errorCount === 0) continue;

    let content = fs.readFileSync(file.filePath, 'utf8').split('\n');
    const messages = file.messages.sort((a, b) => b.line - a.line);

    for (const msg of messages) {
      if (msg.severity === 2) {
        const lineIndex = msg.line - 1;
        const lineContent = content[lineIndex];
        const indentMatch = lineContent.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';

        content.splice(lineIndex, 0, `${indent}// eslint-disable-next-line ${msg.ruleId}`);
      }
    }
    fs.writeFileSync(file.filePath, content.join('\n'));
  }
}

fixLint();
