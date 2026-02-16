import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.join(__dirname, 'index.ts');

const indexContent = fs.readFileSync(indexPath, 'utf-8');

// Check for the vulnerable pattern: innerHTML being assigned user input
const vulnerablePattern = /statusDiv\.innerHTML\s*=\s*/;
const safePattern = /statusDiv\.textContent\s*=\s*/;

try {
    if (vulnerablePattern.test(indexContent)) {
        throw new Error('FAIL: Vulnerability detected: innerHTML usage still found in server/index.ts');
    } else {
        console.log('PASS: innerHTML usage NOT found in server/index.ts');
    }

    if (!safePattern.test(indexContent)) {
        throw new Error('FAIL: Fix not detected: expected textContent usage not found in server/index.ts');
    } else {
        console.log('PASS: textContent usage found in server/index.ts');
    }

    console.log('SUCCESS: Vulnerability fixed and safe pattern used.');

} catch (error) {
    console.error(error);
    throw error;
}
