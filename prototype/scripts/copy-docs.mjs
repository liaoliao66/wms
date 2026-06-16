#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const repoRoot = path.join(root, '..');
const src = path.join(repoRoot, 'docs', 'prd.md');
const destDir = path.join(root, 'docs');
const dest = path.join(destDir, 'prd.md');

if (!fs.existsSync(src)) {
  console.warn('docs/prd.md not found, skip copy');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('copied docs/prd.md to prototype/docs/prd.md');
