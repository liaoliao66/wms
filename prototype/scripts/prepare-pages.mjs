import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const outDir = path.join(repoRoot, 'dist', 'pages');

const SKIP_DIRS = new Set(['node_modules', '.git', '.github']);

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (SKIP_DIRS.has(name)) continue;
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

rmrf(outDir);
fs.mkdirSync(outDir, { recursive: true });

const rootIndex = path.join(repoRoot, 'index.html');
if (!fs.existsSync(rootIndex)) {
  console.error('Missing root index.html:', rootIndex);
  process.exit(1);
}

fs.copyFileSync(rootIndex, path.join(outDir, 'index.html'));
copyDir(path.join(repoRoot, 'prototype'), path.join(outDir, 'prototype'));
copyDir(path.join(repoRoot, 'docs'), path.join(outDir, 'docs'));

console.log('Pages artifact ready at', outDir);
