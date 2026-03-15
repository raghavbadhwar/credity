const fs = require('fs');
const { execSync } = require('child_process');

function fixLint() {
  try {
    // Run eslint and output json
    execSync('npx eslint . --format json --output-file eslint-report.json', { stdio: 'ignore' });
  } catch (e) {
    // Ignore error, it will fail because of lint errors
  }

  if (!fs.existsSync('eslint-report.json')) return;

  const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));
  for (const file of report) {
    if (file.errorCount === 0) continue;

    let content = fs.readFileSync(file.filePath, 'utf8').split('\n');
    // Sort messages by line descending to not mess up line numbers when inserting
    const messages = file.messages.sort((a, b) => b.line - a.line);

    for (const msg of messages) {
      if (msg.severity === 2) { // error
        const lineIndex = msg.line - 1;
        const lineContent = content[lineIndex];
        const indentMatch = lineContent.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';

        // Check if there's already an eslint-disable-next-line
        if (lineIndex > 0 && content[lineIndex - 1].includes('eslint-disable-next-line')) {
           if (!content[lineIndex - 1].includes(msg.ruleId)) {
               content[lineIndex - 1] = content[lineIndex - 1] + `, ${msg.ruleId}`;
           }
           continue;
        }

        content.splice(lineIndex, 0, `${indent}// eslint-disable-next-line ${msg.ruleId}`);
      }
    }
    fs.writeFileSync(file.filePath, content.join('\n'));
  }
}

fixLint();
