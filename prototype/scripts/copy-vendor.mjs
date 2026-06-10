#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free');
const dest = path.join(root, 'vendor', 'fontawesome');

if (!fs.existsSync(src)) {
  console.warn('fontawesome-free not installed, skip vendor copy');
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(path.join(src, 'css'), path.join(dest, 'css'), { recursive: true });
fs.cpSync(path.join(src, 'webfonts'), path.join(dest, 'webfonts'), { recursive: true });
console.log('copied fontawesome to vendor/fontawesome');
