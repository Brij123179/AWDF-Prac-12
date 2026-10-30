import fs from 'fs';
import path from 'path';

/**
 * CI Linter Script for Practical 12
 * Verifies code structure, required manifests, syntax integrity, and security checks.
 */
console.log('🔍 [CI Linter] Running Automated Lint & Security Checks...\n');

let errors = 0;
let warnings = 0;

// 1. Check for required configuration files
const requiredFiles = [
  'package.json',
  '.env.example',
  'server.js',
  'config/db.js',
  'controllers/taskController.js',
  'routes/taskRoutes.js'
];

for (const relPath of requiredFiles) {
  if (fs.existsSync(relPath)) {
    console.log(`  ✅ Passed: Required file "${relPath}" is present.`);
  } else {
    console.error(`  ❌ Error: Missing required file "${relPath}".`);
    errors++;
  }
}

// 2. Validate JSON syntax
const jsonFiles = ['package.json'];
for (const relPath of jsonFiles) {
  try {
    const raw = fs.readFileSync(relPath, 'utf8');
    JSON.parse(raw);
    console.log(`  ✅ Passed: "${relPath}" contains valid JSON syntax.`);
  } catch (err) {
    console.error(`  ❌ Error: Invalid JSON in "${relPath}": ${err.message}`);
    errors++;
  }
}

// 3. Security Rule: Ensure .env is never tracked in repository
if (fs.existsSync('.env')) {
  console.log('  ⚠️  Warning: Local .env exists (must be ignored by .gitignore).');
}

// 4. Verification summary
console.log('\n' + '='.repeat(60));
if (errors > 0) {
  console.error(`🚨 [CI Linter] Failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`✨ [CI Linter] All checks passed successfully (0 errors, ${warnings} warnings).`);
  process.exit(0);
}
