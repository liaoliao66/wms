import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const targets = [
  'prototype/index.html',
  'prototype/versions/v1.0.0/index.html',
  'prototype/versions/v1.0.0/pages/pc_home.html',
  'prototype/versions/v1.0.0/pages/prototype_map.html',
  'prototype/versions/v1.0.0/pages/prd.html',
  'prototype/versions/v1.0.0/pages/purchase_supply_list.html',
  'prototype/versions/v1.0.0/pages/warehouse_acceptance_detail.html',
  'prototype/versions/v1.0.0/pages/app/app_count_home.html',
];

function normRef(raw) {
  if (!raw) return null;
  let v = String(raw).trim();
  // 跳过 JS 模板字符串 / 拼接占位（避免误报）
  if (v.includes('${') || v.includes("' + ") || v.includes('" + ') || v.includes(' + item.')) return null;
  if (!v || v === '#' || v.startsWith('javascript:')) return null;
  const hash = v.indexOf('#');
  if (hash >= 0) v = v.slice(0, hash);
  const q = v.indexOf('?');
  if (q >= 0) v = v.slice(0, q);
  if (!v) return null;
  if (/^(https?:)?\/\//i.test(v) || v.startsWith('mailto:') || v.startsWith('tel:')) return null;
  return v;
}

function collectRefs(html) {
  const refs = [];
  const re = /\b(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const v = normRef(m[1]);
    if (v) refs.push(v);
  }
  return refs;
}

function existsLoose(absPath) {
  return fs.existsSync(absPath)
    || fs.existsSync(`${absPath}.html`)
    || fs.existsSync(path.join(absPath, 'index.html'));
}

const missing = [];

for (const rel of targets) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    missing.push({ from: '<target-list>', ref: rel, resolved: abs });
    continue;
  }
  const base = path.dirname(abs);
  const html = fs.readFileSync(abs, 'utf8');
  for (const ref of collectRefs(html)) {
    if (ref.startsWith('/')) continue; // site-root paths: skip existence check
    const resolved = path.normalize(path.join(base, ref));
    if (!existsLoose(resolved)) missing.push({ from: rel, ref, resolved });
  }
}

if (!missing.length) {
  console.log('OK: 静态链接自检通过（入口/关键页未发现缺失资源或页面引用）');
  process.exit(0);
}

console.log(`FAIL: 发现缺失引用 ${missing.length} 处（仅展示前 120 条）`);
missing.slice(0, 120).forEach(x => {
  console.log(`- ${x.from} => ${x.ref} (resolve) ${x.resolved}`);
});
process.exit(1);

