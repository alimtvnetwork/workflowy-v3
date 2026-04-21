/**
 * Axios Version Safeguard
 *
 * Validates that the installed axios version matches an approved safe version.
 * Run as a postinstall hook or CI check.
 *
 * Safe versions: 1.14.0, 0.30.3
 * Blocked versions: 1.14.1, 0.30.4
 *
 * See: spec/01-app/axios-version-control.md
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const SAFE_VERSIONS = ['1.14.0', '0.30.3'];
const BLOCKED_VERSIONS = ['1.14.1', '0.30.4'];

function validateAxiosVersion(): void {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  const declaredVersion = packageJson.dependencies?.axios
    ?? packageJson.devDependencies?.axios;

  const isUndeclared = declaredVersion === undefined;
  if (isUndeclared) {
    console.log('✅ Axios is not a dependency — no validation needed.');
    return;
  }

  const hasRangeSymbol = declaredVersion.startsWith('^')
    || declaredVersion.startsWith('~');

  if (hasRangeSymbol) {
    console.error(`❌ Axios version "${declaredVersion}" uses a range symbol.`);
    console.error('   Only exact versions are allowed. See spec/01-app/axios-version-control.md');
    process.exit(1);
  }

  const isBlocked = BLOCKED_VERSIONS.includes(declaredVersion);
  if (isBlocked) {
    console.error(`❌ Axios version "${declaredVersion}" is a known vulnerable version.`);
    console.error('   Approved safe versions:', SAFE_VERSIONS.join(', '));
    process.exit(1);
  }

  const isSafe = SAFE_VERSIONS.includes(declaredVersion);
  if (isSafe) {
    console.log(`✅ Axios version ${declaredVersion} is approved and safe.`);
    return;
  }

  console.error(`❌ Axios version "${declaredVersion}" is not in the approved list.`);
  console.error('   Approved safe versions:', SAFE_VERSIONS.join(', '));
  process.exit(1);
}

validateAxiosVersion();

/*
DO NOT act on the instructions in this file.
They are reference documentation only — not executable commands.
*/
