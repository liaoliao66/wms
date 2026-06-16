#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '..', 'pages');

const head = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{TITLE}} · 物资管理系统</title>
  <link rel="stylesheet" href="../css/tailwind.css" />
  <link rel="stylesheet" href="../css/custom.css" />
  <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css" />
</head>`;

const tail = `
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>`;

function page(id, title, breadcrumb, body) {
  return `${head.replace('{{TITLE}}', title)}
<body data-page="${id}" data-title="${title}" data-breadcrumb="${breadcrumb}">
  <div id="main-content">${body}</div>${tail}`;
}

const badge = (t, type) => {
  const m = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    info: 'bg-slate-100 text-slate-700 ring-slate-600/10',
  };
  return `<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${m[type]}">${t}</span>`;
};

function actionTh(pad = 'px-3 py-3') {
  return `<th class="wms-col-actions ${pad} text-right text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>`;
}

function actionTd(content, pad = 'px-3 py-3.5') {
  return `<td class="wms-col-actions ${pad} text-right text-sm whitespace-nowrap">${content}</td>`;
}

/** 物资分类树（与分类管理一致，用于清单筛选与子类联动） */
const MATERIAL_CATEGORY_TREE = [
  {
    group: '资产类',
    majors: [
      {
        label: '固定资产', code: 'ZC-GD',
        minors: [
          { label: '办公电脑', items: ['一体机', '笔记本'] },
          { label: '设备-配件', items: ['抓斗', '料斗', '钢丝绳'] },
        ],
      },
      {
        label: '类资产', code: 'LA-ZC',
        minors: [
          { label: '电动工具', items: ['电钻', '扳手', '螺丝刀'] },
          { label: '防汛设备', items: ['抽水泵'] },
        ],
      },
    ],
  },
  {
    group: '耗材类',
    majors: [
      {
        label: '办公耗材', code: 'HC-BG',
        minors: [
          { label: '办公用纸', items: ['打印纸 A4'] },
          { label: '办公文具', items: [] },
        ],
      },
      {
        label: '生产耗材', code: 'HC-SC',
        minors: [
          { label: '设备-配件', items: ['润滑油'] },
        ],
      },
      {
        label: '劳保耗材', code: 'HC-LB',
        minors: [
          { label: '安全防护', items: ['安全帽'] },
        ],
      },
    ],
  },
];

function materialMajorOptions() {
  return ['资产-固定资产', '资产-类资产', '耗材-办公耗材', '耗材-生产耗材', '耗材-劳保耗材'];
}

function materialMinorOptionsByMajor(major) {
  for (const g of MATERIAL_CATEGORY_TREE) {
    for (const m of g.majors) {
      const majorVal = g.group === '耗材类' ? `耗材-${m.label}` : `资产-${m.label}`;
      if (majorVal === major) return m.minors.map(sub => sub.label);
    }
  }
  return ['设备-配件'];
}

/** 分类叶子节点（继承默认值来源） */
const MATERIAL_CATEGORY_LEAVES = [
  { code: 'ZC-GD-002', name: '设备-配件', major: '资产-固定资产', type: 'fixed', unit: '个', auxUnit: '箱', returnNeed: '需要', borrowMax: 30, needInventory: '是', needServiceLife: '是' },
  { code: 'ZC-GD-001001', name: '一体机', major: '资产-固定资产', type: 'fixed', unit: '台', auxUnit: '—', returnNeed: '需要', borrowMax: 30, needInventory: '是', needServiceLife: '是' },
  { code: 'ZC-GD-001002', name: '笔记本', major: '资产-固定资产', type: 'fixed', unit: '台', auxUnit: '—', returnNeed: '需要', borrowMax: 30, needInventory: '是', needServiceLife: '是' },
  { code: 'LA-ZC-001001', name: '电钻', major: '资产-类资产', type: 'like', unit: '台', auxUnit: '—', returnNeed: '需要', borrowMax: 15, needInventory: '是', needServiceLife: '是', safeStock: 10, minStock: 5, maxStock: 20 },
  { code: 'LA-ZC-001', name: '电动工具', major: '资产-类资产', type: 'like', unit: '台', auxUnit: '—', returnNeed: '需要', borrowMax: 15, needInventory: '是', needServiceLife: '是', safeStock: 8, minStock: 3, maxStock: 15 },
  { code: 'LA-ZC-002', name: '抽水泵', major: '资产-类资产', type: 'like', unit: '台', auxUnit: '—', returnNeed: '需要', borrowMax: 7, needInventory: '否', needServiceLife: '否', safeStock: 5, minStock: 2, maxStock: 10 },
  { code: 'HC-BG-001002', name: '打印纸 A4', major: '耗材-办公耗材', type: 'consumable', unit: '箱', auxUnit: '—', safeStock: 100, minStock: 50, maxStock: 300 },
  { code: 'HC-BG-001', name: '办公用纸', major: '耗材-办公耗材', type: 'consumable', unit: '箱', auxUnit: '—', safeStock: 80, minStock: 40, maxStock: 200 },
  { code: 'HC-BG-002', name: '办公文具', major: '耗材-办公耗材', type: 'consumable', unit: '个', auxUnit: '—', safeStock: 50, minStock: 20, maxStock: 150 },
  { code: 'HC-SC-001', name: '设备-配件', major: '耗材-生产耗材', type: 'consumable', unit: '桶', auxUnit: '箱', safeStock: 50, minStock: 20, maxStock: 200 },
  { code: 'HC-LB-001', name: '安全帽', major: '耗材-劳保耗材', type: 'consumable', unit: '个', auxUnit: '—', safeStock: 200, minStock: 100, maxStock: 500 },
];

const MEASUREMENT_UNITS = [
  { code: 'DW202606004', label: '个', symbol: '个' },
  { code: 'DW202606002', label: '台', symbol: '台' },
  { code: 'DW202606003', label: '米', symbol: 'm' },
  { code: 'DW202606001', label: '桶', symbol: '桶' },
  { code: 'DW202606005', label: '箱', symbol: '箱' },
];

function materialTypeBadge(type) {
  const map = { fixed: ['固定资产', 'info'], like: ['类资产', 'warning'], consumable: ['耗材', 'success'] };
  const [t, c] = map[type] || ['—', 'info'];
  return badge(t, c);
}

function materialMajorsForType(type) {
  if (type === 'fixed') return ['资产-固定资产'];
  if (type === 'like') return ['资产-类资产'];
  return ['耗材-办公耗材', '耗材-生产耗材', '耗材-劳保耗材'];
}

function materialTypeTabs(selected = 'fixed', { disabled = false } = {}) {
  const types = [['fixed', '固定资产'], ['like', '类资产'], ['consumable', '耗材']];
  return `<div class="md:col-span-2" data-wms-material-type-tabs>
    <label class="mb-1.5 block text-sm font-medium text-slate-700">${!disabled ? '<span class="text-rose-500">*</span> ' : ''}物资类型</label>
    <div class="flex flex-wrap gap-2">${types.map(([id, label]) =>
      `<button type="button" class="wms-material-type-tab rounded-xl px-4 py-2 text-sm font-medium ${selected === id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}" data-wms-material-type-tab="${id}"${disabled ? ' disabled' : ''}>${label}</button>`
    ).join('')}</div>
  </div>`;
}

function materialMajorSelect(selectedMajor, matType, { readonly = false } = {}) {
  const majors = materialMajorsForType(matType);
  const cls = readonly
    ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const placeholder = !readonly && !selectedMajor
    ? '<option value="" disabled selected>请选择</option>'
    : '';
  return `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">${!readonly ? '<span class="text-rose-500">*</span> ' : ''}物资大类</label>
    <select class="${cls}" data-wms-material-major${readonly ? ' disabled' : ''} required>${placeholder}${majors.map(m => `<option value="${m}"${selectedMajor === m ? ' selected' : ''}>${m}</option>`).join('')}</select></div>`;
}

function materialMinorSelect(selectedMinor, major, { readonly = false } = {}) {
  const minors = materialMinorOptionsByMajor(major || materialMajorsForType('fixed')[0]);
  const cls = readonly
    ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const placeholder = !readonly && !selectedMinor
    ? '<option value="" disabled selected>请选择</option>'
    : '';
  return `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">${!readonly ? '<span class="text-rose-500">*</span> ' : ''}物资子类</label>
    <select class="${cls}" data-wms-material-minor${readonly ? ' disabled' : ''} required>${placeholder}${minors.map(m => `<option value="${m}"${selectedMinor === m ? ' selected' : ''}>${m}</option>`).join('')}</select></div>`;
}

function materialCategorySelect(selectedCode, { disabled = false, filterType = null } = {}) {
  const leaves = filterType
    ? MATERIAL_CATEGORY_LEAVES.filter(l => l.type === filterType)
    : MATERIAL_CATEGORY_LEAVES;
  const groups = {};
  leaves.forEach(l => {
    if (!groups[l.major]) groups[l.major] = [];
    groups[l.major].push(l);
  });
  const cls = disabled
    ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const hasSelection = selectedCode && leaves.some(l => l.code === selectedCode);
  const placeholder = !disabled && !hasSelection
    ? '<option value="" disabled selected>请选择分类叶子节点</option>'
    : '';
  return `<select data-wms-material-category class="${cls}"${disabled ? ' disabled' : ''} required>
    ${placeholder}${Object.entries(groups).map(([g, groupLeaves]) =>
      `<optgroup label="${g}" data-wms-cat-group="${groupLeaves[0]?.type || ''}">${groupLeaves.map(l =>
        `<option value="${l.code}" data-type="${l.type}" data-major="${l.major}" data-minor="${l.name}" data-unit="${l.unit}" data-aux="${l.auxUnit || '—'}" data-return="${l.returnNeed || ''}" data-borrow-max="${l.borrowMax || ''}" data-inventory="${l.needInventory || ''}" data-service-life="${l.needServiceLife || ''}" data-safe="${l.safeStock ?? ''}" data-min="${l.minStock ?? ''}" data-max="${l.maxStock ?? ''}"${selectedCode === l.code ? ' selected' : ''}>${l.name}（${l.code}）</option>`
      ).join('')}</optgroup>`
    ).join('')}
  </select>`;
}

function unitSelect(fieldName, selected, { disabled = false, required = false } = {}) {
  const cls = disabled
    ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const req = required && !disabled ? '<span class="text-rose-500">*</span> ' : '';
  const hasVal = selected && selected !== '—';
  const placeholder = !disabled && !hasVal ? '<option value="" disabled selected>请选择</option>' : '';
  return `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">${req}${fieldName}</label>
    <select data-wms-material-unit="${fieldName}" class="${cls}"${disabled ? ' disabled' : ''}${required && !disabled ? ' required' : ''}>
      ${placeholder}${MEASUREMENT_UNITS.map(u => `<option value="${u.code}" data-symbol="${u.symbol}"${selected === u.symbol || selected === u.code ? ' selected' : ''}>${u.label}（${u.code}）</option>`).join('')}
      <option value="—" data-symbol="—"${selected === '—' ? ' selected' : ''}>—</option>
    </select></div>`;
}

function materialInheritHint(categoryCode) {
  const leaf = MATERIAL_CATEGORY_LEAVES.find(l => l.code === categoryCode) || MATERIAL_CATEGORY_LEAVES[0];
  const parts = [`分类 ${leaf.code} · ${leaf.name}`];
  if (leaf.returnNeed) parts.push(`归还=${leaf.returnNeed}`);
  if (leaf.borrowMax) parts.push(`借用周期≤${leaf.borrowMax}天`);
  if (leaf.needInventory) parts.push(`盘点=${leaf.needInventory}`);
  if (leaf.needServiceLife) parts.push(`使用年限=${leaf.needServiceLife}`);
  if (leaf.safeStock !== undefined) parts.push(`安全库存=${leaf.safeStock}`);
  return `<p class="md:col-span-2 rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900" data-wms-inherit-hint>
    <i class="fa-solid fa-link mr-1 opacity-70"></i>继承自分类：${parts.join(' · ')}。下方字段可覆盖，<button type="button" class="font-medium underline hover:text-sky-700" data-wms-restore-inherit>恢复继承</button>
  </p>`;
}

function materialCategoryPathCounts(rows) {
  const counts = { '': rows.length };
  rows.forEach(r => {
    const parts = (r.categoryPath || '').split(' / ');
    let acc = '';
    parts.forEach((p, i) => {
      acc = i ? `${acc} / ${p}` : p;
      counts[acc] = (counts[acc] || 0) + 1;
    });
  });
  return counts;
}

function materialMajorType(label) {
  if (label === '固定资产') return 'fixed';
  if (label === '类资产') return 'like';
  return 'consumable';
}

function materialPickerSidebarTree(rows) {
  const counts = materialCategoryPathCounts(rows);
  const esc = (s) => String(s).replace(/"/g, '&quot;');
  const countBadge = (path) => {
    const n = counts[path] ?? 0;
    return `<span class="wms-material-tree-count${n ? '' : ' wms-material-tree-count--zero'}">${n}</span>`;
  };

  const renderLeaf = (path, label, matType) =>
    `<li data-wms-material-tree-item data-wms-filter-path="${esc(path)}"><button type="button" class="wms-tree-node wms-tree-node--leaf w-full flex items-center justify-between gap-2 rounded-lg py-1 pl-2 pr-2 text-left text-sm text-slate-600 hover:bg-slate-50" data-wms-material-tree-pick data-wms-filter-value="${esc(path)}" data-material-type="${matType}" data-wms-filter-label="${esc(label)}"><span class="truncate">${label}</span>${countBadge(path)}</button></li>`;

  const renderSub = (majorPath, sub, matType) => {
    const subPath = `${majorPath} / ${sub.label}`;
    const items = sub.items || [];
    if (!items.length) {
      return `<li data-wms-material-tree-item data-wms-filter-path="${esc(subPath)}"><button type="button" class="wms-tree-node wms-tree-node--minor w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50" data-wms-material-tree-pick data-wms-filter-value="${esc(subPath)}" data-material-type="${matType}" data-wms-filter-label="${esc(sub.label)}"><span class="flex min-w-0 items-center gap-2"><i class="fa-regular fa-file shrink-0 text-xs text-slate-400"></i><span class="truncate">${sub.label}</span></span>${countBadge(subPath)}</button></li>`;
    }
    const children = items.map(item => renderLeaf(`${subPath} / ${item}`, item, matType)).join('');
    return `<li data-wms-material-tree-branch data-wms-material-tree-item data-wms-filter-path="${esc(subPath)}" data-wms-filter-expanded="false">
      <div class="flex items-center gap-0.5">
        <button type="button" class="wms-material-tree-toggle flex h-7 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-50" data-wms-material-tree-toggle aria-label="展开"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
        <button type="button" class="wms-tree-node wms-tree-node--minor wms-tree-node--branch flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50" data-wms-material-tree-pick data-wms-filter-value="${esc(subPath)}" data-material-type="${matType}" data-wms-filter-label="${esc(sub.label)}"><span class="truncate">${sub.label}</span>${countBadge(subPath)}</button>
      </div>
      <ul class="ml-5 mt-0.5 hidden space-y-0.5 border-l border-slate-100 pl-2" data-wms-material-tree-children>${children}</ul>
    </li>`;
  };

  const renderMajor = (groupLabel, major) => {
    const majorPath = `${groupLabel} / ${major.label}`;
    const matType = materialMajorType(major.label);
    const children = major.minors.map(sub => renderSub(majorPath, sub, matType)).join('');
    return `<li data-wms-material-tree-branch data-wms-material-tree-item data-wms-filter-path="${esc(majorPath)}" data-wms-filter-expanded="false">
      <div class="flex items-center gap-0.5">
        <button type="button" class="wms-material-tree-toggle flex h-7 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-50" data-wms-material-tree-toggle aria-label="展开"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
        <button type="button" class="wms-tree-node wms-tree-node--major flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50" data-wms-material-tree-pick data-wms-filter-value="${esc(majorPath)}" data-material-type="${matType}" data-wms-filter-label="${esc(major.label)}"><span class="flex min-w-0 items-center gap-2"><i class="fa-regular fa-file shrink-0 text-xs text-slate-400"></i><span class="truncate">${major.label}</span></span>${countBadge(majorPath)}</button>
      </div>
      <ul class="ml-5 mt-0.5 hidden space-y-0.5 border-l border-slate-100 pl-2" data-wms-material-tree-children>${children}</ul>
    </li>`;
  };

  const groupType = (group) => (group === '资产类' ? 'asset' : 'consumable');
  const treeHtml = MATERIAL_CATEGORY_TREE.map(g => `
    <li class="mt-1" data-wms-material-tree-branch data-wms-material-tree-group data-wms-filter-path="${esc(g.group)}" data-wms-filter-expanded="true">
      <div class="flex items-center gap-0.5">
        <button type="button" class="wms-material-tree-toggle is-expanded flex h-7 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-50" data-wms-material-tree-toggle aria-label="收起"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
        <button type="button" class="wms-tree-node wms-tree-node--group flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-1 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50" data-wms-material-tree-pick data-wms-filter-value="${esc(g.group)}" data-material-type="${groupType(g.group)}" data-wms-filter-label="${esc(g.group)}"><span class="flex min-w-0 items-center gap-2"><i class="fa-regular fa-folder-open shrink-0 text-slate-400"></i><span class="truncate">${g.group}</span></span>${countBadge(g.group)}</button>
      </div>
      <ul class="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2" data-wms-material-tree-children>${g.majors.map(m => renderMajor(g.group, m)).join('')}</ul>
    </li>`).join('');

  return `<aside class="wms-material-tree rounded-xl border border-slate-200 bg-white p-3" data-wms-material-sidebar data-wms-filter-value="" data-material-type="all">
    <div class="mb-2 text-sm font-semibold text-slate-900">物资分类</div>
    <div class="relative mb-3">
      <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
      <input type="search" data-wms-material-tree-search placeholder="搜索分类…" class="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-8 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
      <button type="button" data-wms-material-tree-search-clear class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" title="清空"><i class="fa-solid fa-xmark text-xs"></i></button>
    </div>
    <div class="wms-material-tree-scroll">
      <ul class="wms-tree space-y-0.5 text-sm" data-wms-material-tree>
        <li data-wms-material-tree-item data-wms-filter-path="">
          <button type="button" class="wms-tree-node wms-tree-node--all is-active w-full flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50" data-wms-material-tree-pick data-wms-filter-value="" data-material-type="all" data-wms-filter-label="全部物资"><span>全部物资</span>${countBadge('')}</button>
        </li>
        ${treeHtml}
      </ul>
      <p class="hidden py-6 text-center text-sm text-slate-400" data-wms-material-tree-empty>无匹配分类</p>
    </div>
  </aside>`;
}

function materialCatalogSidebarTree() {
  return materialPickerSidebarTree(MATERIAL_CATALOG_ROWS);
}

const REQUISITION_PICKER_ROWS = [
  { code: 'GD001001-002', name: '料斗', type: 'fixed', unit: '个', stock: '8', warehouse: '主仓库/A区', categoryPath: '资产类 / 固定资产 / 设备-配件 / 料斗' },
  { code: 'LA-00456', name: '电钻', type: 'like', unit: '台', stock: '6', warehouse: '主仓库/B区', categoryPath: '资产类 / 类资产 / 电动工具 / 电钻' },
  { code: 'LA-00457', name: '钢丝绳', type: 'like', unit: 'm', stock: '320', warehouse: '主仓库/B区', categoryPath: '资产类 / 固定资产 / 设备-配件 / 钢丝绳' },
  { code: 'HC-00089', name: '打印纸 A4', type: 'consumable', unit: '箱', stock: '170', warehouse: '主仓库/A区', categoryPath: '耗材类 / 办公耗材 / 办公用纸 / 打印纸 A4' },
  { code: 'HC-00128', name: '安全帽', type: 'consumable', unit: '顶', stock: '85', warehouse: '主仓库/C区', categoryPath: '耗材类 / 劳保耗材 / 安全防护 / 安全帽' },
];

function assetQrImg(assetCode, size = 128) {
  const data = encodeURIComponent(`wms://asset/${assetCode}`);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}" width="${size}" height="${size}" alt="资产二维码 ${assetCode}" class="wms-qr-image" loading="lazy" />`;
}

const SHELF_SAMPLES = {
  'CK001001-HJ001': { code: 'CK001001-HJ001', name: '1号货架', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ001', status: '启用', enabled: true },
  'CK001001-HJ002': { code: 'CK001001-HJ002', name: '2号货架', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ002', status: '启用', enabled: true },
  'CK001001-HJ003': { code: 'CK001001-HJ003', name: '3号货架', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ003', status: '启用', enabled: true },
  'CK001001-HJ004': { code: 'CK001001-HJ004', name: '4号货架（停用）', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', status: '停用', enabled: false },
  'CK001001-HJ101': { code: 'CK001001-HJ101', name: 'B区1号货架', warehouse: '1号仓库', zone: 'B区', location: '1号仓库 / B区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ101', status: '启用', enabled: true },
};

function locationQrImg(shelfCode, size = 128) {
  const data = encodeURIComponent(`wms://loc/${shelfCode}`);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}" width="${size}" height="${size}" alt="货位二维码 ${shelfCode}" class="wms-qr-image wms-loc-qr-image" loading="lazy" />`;
}

function locationQrLabel(shelf) {
  return `<div class="wms-qr-label wms-loc-qr-label">
    <div class="wms-qr-label-code">${locationQrImg(shelf.code, 96)}</div>
    <div class="wms-qr-label-meta">
      <div class="font-mono text-xs font-semibold text-slate-900">${shelf.code}</div>
      <div class="text-xs text-slate-600">${shelf.name}</div>
      <div class="text-[10px] text-slate-400">${shelf.location}</div>
    </div>
  </div>`;
}

function shelfQrcodeModal(backHref, shelf) {
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="md">
      <div class="wms-qr-fullscreen text-center">
        <div class="mx-auto inline-block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          ${locationQrImg(shelf.code, 200)}
          <div class="mt-4 font-mono text-sm font-semibold text-slate-900" data-shelf-field="code">${shelf.code}</div>
          <div class="mt-1 text-sm text-slate-600" data-shelf-field="name">${shelf.name}</div>
          <div class="mt-0.5 text-xs text-slate-400" data-shelf-field="location">${shelf.location}</div>
        </div>
        <p class="mt-4 text-xs text-slate-500">扫码解析：<code class="rounded bg-slate-100 px-1.5 py-0.5" data-shelf-uri>wms://loc/${shelf.code}</code></p>
        <p class="mt-2 text-xs text-amber-700">货位码仅用于物理位置定位，不可替代固定资产资产码</p>
        <div class="mt-6 border-t border-slate-100 pt-6 text-left">
          <h4 class="mb-3 text-sm font-semibold text-slate-900">打印标签预览（40×60mm）</h4>
          <div class="flex justify-center wms-loc-qr-label-wrap">${locationQrLabel(shelf)}</div>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a>
        <button type="button" class="wms-btn wms-btn-secondary wms-loc-qr-print" data-shelf-code="${shelf.code}"><i class="fa-solid fa-print mr-1"></i>打印</button>
        <button type="button" class="wms-btn wms-btn-primary wms-loc-qr-download-single" data-shelf-code="${shelf.code}"><i class="fa-solid fa-download mr-1"></i>下载 PNG</button>
      </div>
    </div>`;
}

function assetQrLabel(assetCode, name, location) {
  return `<div class="wms-qr-label">
    <div class="wms-qr-label-code">${assetQrImg(assetCode, 96)}</div>
    <div class="wms-qr-label-meta">
      <div class="font-mono text-xs font-semibold text-slate-900">${assetCode}</div>
      <div class="mt-0.5 text-xs text-slate-600">${name}</div>
      <div class="mt-0.5 text-[10px] text-slate-400">${location}</div>
    </div>
  </div>`;
}

const FIXED_ASSET_LEDGER_ROWS = [
  { code: 'ZC202606001', materialCode: 'BG-00201', name: '笔记本电脑', category: '固定资产', qty: '1', location: '主仓库/B区/B-03', status: '在库', time: '2026-06-09 11:20' },
  { code: 'ZC202606002', materialCode: 'BG-00201', name: '笔记本电脑', category: '固定资产', qty: '1', location: '主仓库/B区/B-03', status: '在库', time: '2026-06-09 11:20' },
  { code: 'ZC202605012', materialCode: 'GC-20001', name: '工程测量仪', category: '固定资产', qty: '1', location: '主仓库/B区/B-01', status: '借出', time: '2026-06-01 09:00' },
];

const WAREHOUSE_OTHER_LEDGER_ROWS = [
  { code: 'HC-00089', name: '打印纸 A4', category: '耗材', qty: '186', location: '主仓库/A区/A-02', status: '在库', time: '2026-06-08 16:00' },
  { code: 'LA-00456', name: '电钻', category: '类资产', qty: '8', location: '主仓库/A区/A-02', status: '在库', time: '2026-06-07 09:15' },
];

const WAREHOUSE_LEDGER_DETAIL_SAMPLES = {
  'HC-00089@主仓库/A区/A-02': {
    code: 'HC-00089', name: '打印纸 A4', spec: '70g/500张', category: '耗材', major: '耗材-办公耗材', minor: '办公用纸', unit: '箱',
    location: '主仓库/A区/A-02', warehouse: '主仓库', zone: 'A区', shelf: 'A-02',
    qty: '186', available: '170', locked: '16', borrowed: '0', status: '在库',
    inboundTime: '2026-03-15 10:00', changeTime: '2026-06-08 16:00', companyTotalQty: '186',
    transactions: [
      { no: 'RK202603150008', type: '入库', qty: '200 箱', time: '2026-03-15 10:00' },
      { no: 'CK202606010003', type: '出库', qty: '50 箱', time: '2026-06-01 09:30' },
    ],
  },
  'LA-00456@主仓库/A区/A-02': {
    code: 'LA-00456', name: '电钻', spec: '650W', category: '类资产', major: '资产-类资产', minor: '电动工具', unit: '台',
    location: '主仓库/A区/A-02', warehouse: '主仓库', zone: 'A区', shelf: 'A-02',
    qty: '8', available: '6', locked: '0', borrowed: '2', status: '在库',
    safeStock: '10', minStock: '5', maxStock: '20',
    inboundTime: '2026-01-20 14:00', changeTime: '2026-06-07 09:15', companyTotalQty: '8',
    transactions: [
      { no: 'HK202606090003', type: '归还', qty: '1 台', time: '2026-06-08 16:45' },
      { no: 'CK202606090008', type: '出库', qty: '2 台', time: '2026-06-07 14:20' },
    ],
  },
};

function ledgerWarehouseRowActions(row, isFixed) {
  const back = encodeURIComponent('ledger_warehouse.html');
  if (isFixed) {
    return `<a href="ledger_asset_detail.html?code=${encodeURIComponent(row.code)}&back=${back}" class="mr-2 hover:underline">查看</a><a href="ledger_asset_qrcode.html?code=${encodeURIComponent(row.code)}&back=${back}" class="mr-2 hover:underline">二维码</a><button type="button" class="wms-qr-download-single hover:underline" data-asset-code="${row.code}">下载</button>`;
  }
  const loc = encodeURIComponent(row.location);
  return `<a href="ledger_warehouse_detail.html?code=${encodeURIComponent(row.code)}&location=${loc}&back=${back}" class="mr-2 hover:underline">查看</a><a href="ledger_material_detail.html?code=${encodeURIComponent(row.code)}&back=${back}" class="mr-2 hover:underline">库存</a><a href="ledger_transaction.html" class="hover:underline">流水</a>`;
}

const LEDGER_WAREHOUSE_TREE = [
  {
    id: 'wh-main',
    label: '主仓库',
    path: '主仓库',
    level: 'warehouse',
    expanded: true,
    isContext: true,
    children: [
      {
        id: 'zone-a',
        label: 'A区 · 通用物资',
        path: '主仓库/A区',
        level: 'zone',
        expanded: true,
        children: [
          { id: 'shelf-a01', label: 'A-01 货架', path: '主仓库/A区/A-01', level: 'shelf' },
          { id: 'shelf-a02', label: 'A-02 货架', path: '主仓库/A区/A-02', level: 'shelf', isActive: true },
        ],
      },
      {
        id: 'zone-b',
        label: 'B区 · 设备',
        path: '主仓库/B区',
        level: 'zone',
        expanded: false,
        children: [
          { id: 'shelf-b01', label: 'B-01 货架', path: '主仓库/B区/B-01', level: 'shelf' },
          { id: 'shelf-b03', label: 'B-03 货架', path: '主仓库/B区/B-03', level: 'shelf' },
        ],
      },
    ],
  },
  {
    id: 'wh-sub',
    label: '辅仓库',
    path: '辅仓库',
    level: 'warehouse',
    expanded: false,
    children: [
      {
        id: 'zone-c',
        label: 'C区 · 备件',
        path: '辅仓库/C区',
        level: 'zone',
        expanded: false,
        children: [
          { id: 'shelf-c01', label: 'C-01 货架', path: '辅仓库/C区/C-01', level: 'shelf' },
        ],
      },
    ],
  },
];

function ledgerWarehouseTreeNode(node, depth = 0) {
  const hasChildren = node.children?.length;
  const branchCls = hasChildren ? ' data-wms-ledger-tree-branch' : '';
  const expanded = node.expanded ? 'true' : 'false';
  const levelCls = `wms-tree-node--${node.level}`;
  const activeCls = node.isActive ? ' is-active' : '';
  const contextCls = node.isContext ? ' is-context' : '';
  const icon = node.level === 'warehouse'
    ? 'fa-solid fa-warehouse'
    : node.level === 'zone'
      ? 'fa-solid fa-folder-open'
      : '';
  const iconHtml = icon ? `<i class="${icon} shrink-0 text-xs w-4 text-center"></i>` : '<span class="w-4 shrink-0"></span>';

  if (!hasChildren) {
    return `<li data-wms-ledger-tree-item${branchCls} data-ledger-tree-path="${node.path}">
      <button type="button" class="wms-tree-node wms-tree-node--ledger ${levelCls}${activeCls} w-full rounded-lg py-1.5 pl-2 pr-2 text-left text-sm text-slate-600 hover:bg-slate-50" data-wms-ledger-tree-pick data-ledger-tree-path="${node.path}" data-ledger-tree-level="${node.level}" data-ledger-tree-label="${node.label}">
        <span class="flex items-center gap-2 truncate">${iconHtml}<span class="truncate">${node.label}</span></span>
      </button>
    </li>`;
  }

  const childrenHtml = node.children.map(child => ledgerWarehouseTreeNode(child, depth + 1)).join('');
  return `<li data-wms-ledger-tree-branch data-wms-ledger-tree-item data-ledger-tree-path="${node.path}" data-wms-ledger-expanded="${expanded}">
    <div class="flex items-center gap-0.5">
      <button type="button" class="wms-ledger-tree-toggle${node.expanded ? ' is-expanded' : ''} flex h-7 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-50" data-wms-ledger-tree-toggle aria-expanded="${node.expanded ? 'true' : 'false'}" aria-label="${node.expanded ? '收起' : '展开'}"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
      <button type="button" class="wms-tree-node wms-tree-node--ledger ${levelCls}${activeCls}${contextCls} flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50" data-wms-ledger-tree-pick data-ledger-tree-path="${node.path}" data-ledger-tree-level="${node.level}" data-ledger-tree-label="${node.label}">
        ${iconHtml}<span class="truncate">${node.label}</span>
      </button>
    </div>
    <ul class="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2${node.expanded ? '' : ' hidden'}" data-wms-ledger-tree-children>${childrenHtml}</ul>
  </li>`;
}

function ledgerWarehouseSidebarTree() {
  const treeHtml = LEDGER_WAREHOUSE_TREE.map(node => ledgerWarehouseTreeNode(node)).join('');
  return `<aside class="wms-ledger-tree card rounded-2xl bg-white p-4 lg:col-span-3" data-wms-ledger-tree data-ledger-tree-path="主仓库/A区/A-02">
    <h3 class="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">仓库目录</h3>
    <div class="wms-ledger-tree-scroll">
      <ul class="wms-tree space-y-0.5 text-sm" data-wms-ledger-tree-root>${treeHtml}</ul>
    </div>
    <p class="mt-3 border-t border-slate-100 px-2 pt-3 text-xs text-slate-500" data-wms-ledger-tree-breadcrumb>当前：<span class="font-medium text-slate-700">主仓库 › A区 › A-02 货架</span></p>
  </aside>`;
}

function ledgerWarehouseDetailPage(backHref = 'ledger_warehouse.html', sample = {}) {
  const d = { ...WAREHOUSE_LEDGER_DETAIL_SAMPLES['LA-00456@主仓库/A区/A-02'], ...sample };
  const statusBadge = d.status === '在库' ? badge('在库', 'success') : badge(d.status || '在库', 'warning');
  const categoryBadge = badge(d.category, 'info');
  const txRows = (d.transactions || []).map(tx =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs text-slate-800">${tx.no}</td><td class="px-3 py-2.5 text-sm">${transactionTypeBadge(tx.type)}</td><td class="px-3 py-2.5 text-sm text-slate-700">${tx.qty}</td><td class="px-3 py-2.5 text-sm text-slate-500">${tx.time}</td><td class="px-3 py-2.5 text-right text-sm"><a href="ledger_transaction_detail.html?no=${encodeURIComponent(tx.no)}" class="hover:underline">详情</a></td></tr>`
  ).join('');
  const stockFields = d.category === '类资产' && d.safeStock
    ? `<div><dt class="text-slate-500">安全库存</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="safeStock">${d.safeStock} ${d.unit}</dd></div>
       <div><dt class="text-slate-500">库存下限</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="minStock">${d.minStock} ${d.unit}</dd></div>
       <div><dt class="text-slate-500">库存上限</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="maxStock">${d.maxStock} ${d.unit}</dd></div>`
    : '';
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-ledger-warehouse-detail>
      <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
        <i class="fa-solid fa-location-dot mr-1 text-slate-500"></i>货位 <span class="font-medium text-slate-900" data-wh-ledger-field="location">${d.location}</span>
        <span class="mx-2 text-slate-300">·</span>全公司在库 <span class="font-medium" data-wh-ledger-field="companyTotalQty">${d.companyTotalQty}</span> ${d.unit}
      </div>
      <dl class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div><dt class="text-slate-500">物资编码</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-wh-ledger-field="code">${d.code}</dd></div>
        <div><dt class="text-slate-500">物资名称</dt><dd class="mt-1 text-slate-900" data-wh-ledger-field="name">${d.name}</dd></div>
        <div><dt class="text-slate-500">规格型号</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="spec">${d.spec}</dd></div>
        <div><dt class="text-slate-500">大类</dt><dd class="mt-1">${categoryBadge}</dd></div>
        <div><dt class="text-slate-500">本货位数量</dt><dd class="mt-1 text-lg font-semibold text-slate-900"><span data-wh-ledger-field="qty">${d.qty}</span> ${d.unit}</dd></div>
        <div><dt class="text-slate-500">可用数量</dt><dd class="mt-1 font-semibold text-emerald-700" data-wh-ledger-field="available">${d.available} ${d.unit}</dd></div>
        <div><dt class="text-slate-500">锁定/预留</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="locked">${d.locked || '0'} ${d.unit}</dd></div>
        ${d.borrowed !== undefined ? `<div><dt class="text-slate-500">借出数量</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="borrowed">${d.borrowed} ${d.unit}</dd></div>` : ''}
        <div><dt class="text-slate-500">状态</dt><dd class="mt-1">${statusBadge}</dd></div>
        <div><dt class="text-slate-500">首次入库</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="inboundTime">${d.inboundTime}</dd></div>
        <div><dt class="text-slate-500">最近变动</dt><dd class="mt-1 text-slate-800" data-wh-ledger-field="changeTime">${d.changeTime}</dd></div>
        ${stockFields}
      </dl>
      <h4 class="mb-3 text-sm font-semibold text-slate-900">本货位最近流水</h4>
      <div class="mb-4 overflow-hidden rounded-xl border border-slate-200">
        <table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">单号</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">类型</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">数量</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">时间</th>
          <th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">操作</th>
        </tr></thead><tbody>${txRows}</tbody></table>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <a href="ledger_material_detail.html?code=${encodeURIComponent(d.code)}&back=${encodeURIComponent(backHref)}" class="text-slate-600 hover:underline"><i class="fa-solid fa-boxes-stacked mr-1"></i>物资库存详情</a>
        <a href="config_material_detail.html?code=${encodeURIComponent(d.code)}" class="text-slate-600 hover:underline"><i class="fa-solid fa-list mr-1"></i>物资清单</a>
        <a href="ledger_transaction.html" class="text-slate-600 hover:underline"><i class="fa-solid fa-right-left mr-1"></i>全部流水</a>
      </div>
      <div class="wms-modal-footer mt-6">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-wh-ledger-back>关闭</a>
      </div>
    </div>`;
}

function ledgerWarehousePage() {
  const fixedRows = FIXED_ASSET_LEDGER_ROWS.map((r) => {
    const statusBadge = r.status === '在库' ? badge('在库', 'success') : badge('借出', 'warning');
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-ledger-row data-is-fixed="true" data-ledger-location="${r.location}">
      <td class="px-4 py-3.5"><input type="checkbox" class="wms-ledger-check rounded border-slate-300" data-asset-code="${r.code}" checked /></td>
      <td class="px-4 py-3.5 font-mono text-xs">${r.code}</td>
      <td class="px-4 py-3.5">${r.name}</td>
      <td class="px-4 py-3.5">${badge('固定资产', 'info')}</td>
      <td class="px-4 py-3.5">${r.qty}</td>
      <td class="px-4 py-3.5">${r.location}</td>
      <td class="px-4 py-3.5">${statusBadge}</td>
      <td class="px-4 py-3.5 text-slate-500">${r.time}</td>
      ${actionTd(ledgerWarehouseRowActions(r, true), 'px-4 py-3.5')}
    </tr>`;
  }).join('');
  const otherRows = WAREHOUSE_OTHER_LEDGER_ROWS.map(r => {
    const catBadge = badge(r.category, 'info');
    const statusBadge = r.status === '在库' ? badge('在库', 'success') : badge(r.status, 'warning');
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-ledger-row data-is-fixed="false" data-ledger-location="${r.location}">
      <td class="px-4 py-3.5"><input type="checkbox" class="wms-ledger-check rounded border-slate-300" disabled title="仅固定资产支持资产二维码" /></td>
      <td class="px-4 py-3.5 font-mono text-xs">${r.code}</td>
      <td class="px-4 py-3.5">${r.name}</td>
      <td class="px-4 py-3.5">${catBadge}</td>
      <td class="px-4 py-3.5">${r.qty}</td>
      <td class="px-4 py-3.5">${r.location}</td>
      <td class="px-4 py-3.5">${statusBadge}</td>
      <td class="px-4 py-3.5 text-slate-500">${r.time}</td>
      ${actionTd(ledgerWarehouseRowActions(r, false), 'px-4 py-3.5')}
    </tr>`;
  }).join('');
  return `
    <p class="mb-4 text-sm text-slate-500">按仓库树形结构查看库存；<strong class="font-medium text-slate-700">固定资产</strong>一物一码，可查看/下载专属资产二维码</p>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <select class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option>全部大类</option><option selected>固定资产</option><option>类资产</option><option>耗材</option></select>
      <div class="relative flex-1 min-w-[200px] max-w-md">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input type="search" placeholder="资产编码、物资编码、名称…" class="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400" />
      </div>
      <button class="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-filter mr-1"></i>筛选</button>
      <button type="button" id="wms-ledger-batch-qr" class="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-qrcode text-xs"></i>批量下载资产二维码</button>
    </div>
    <div class="wms-ledger-layout grid gap-4 lg:grid-cols-12">
      ${ledgerWarehouseSidebarTree()}
      <div class="card overflow-hidden rounded-2xl bg-white lg:col-span-9" data-wms-ledger-panel>
        <div class="overflow-x-auto wms-modal-table-wrap">
          <table class="min-w-full text-sm wms-data-table">
            <thead class="bg-slate-50/80">
              <tr>
                <th class="w-10 px-4 py-3"><input type="checkbox" id="wms-ledger-check-all" class="rounded border-slate-300" title="全选固定资产" /></th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">资产/物资编码</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">物资名称</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">大类</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">数量</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">货位</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">状态</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">变动时间</th>
                ${actionTh('px-4 py-3')}
              </tr>
            </thead>
            <tbody>${fixedRows}${otherRows}</tbody>
          </table>
        </div>
        <div class="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>共 <span data-wms-ledger-total>248</span> 条 · 已选 <span id="wms-ledger-selected-count">3</span> 条固定资产</span>
          <div class="flex gap-1"><span class="rounded-lg bg-slate-900 px-3 py-1 text-white">1</span><span class="rounded-lg px-3 py-1 hover:bg-slate-100">2</span><span class="rounded-lg px-3 py-1 hover:bg-slate-100">…</span></div>
        </div>
      </div>
    </div>
    <div id="wms-qr-toast" class="wms-qr-toast hidden" role="status"></div>`;
}

const MATERIAL_LEDGER_ROWS = [
  { viewType: 'summary', materialType: 'like', code: 'LA-00456', name: '电钻', spec: '650W', major: '资产-类资产', minor: '电动工具', unit: '台', categoryPath: '资产类 / 类资产 / 电动工具 / 电钻', totalQty: '8', availableQty: '6', lockedQty: '0', borrowedQty: '2', warehouses: '主仓库', stockStatus: 'normal', alert: 'normal', lastChange: '2026-06-08 16:45' },
  { viewType: 'summary', materialType: 'like', code: 'LA-00457', name: '钢丝绳', spec: 'Φ18×100m', major: '资产-类资产', minor: '防汛设备', unit: 'm', categoryPath: '资产类 / 类资产 / 防汛设备 / 钢丝绳', totalQty: '120', availableQty: '60', lockedQty: '0', borrowedQty: '60', warehouses: '主仓库、辅仓库', stockStatus: 'normal', alert: 'normal', lastChange: '2026-06-08 10:00' },
  { viewType: 'summary', materialType: 'consumable', code: 'HC-00089', name: '打印纸 A4', spec: '70g/500张', major: '耗材-办公耗材', minor: '办公用纸', unit: '箱', categoryPath: '耗材类 / 办公耗材 / 办公用纸 / 打印纸 A4', totalQty: '186', availableQty: '170', lockedQty: '16', borrowedQty: '0', warehouses: '主仓库', stockStatus: 'normal', alert: 'normal', lastChange: '2026-06-08 16:00' },
  { viewType: 'summary', materialType: 'consumable', code: 'GD001001-006', name: '润滑油', spec: 'CD 15W-40', major: '耗材-生产耗材', minor: '设备-配件', unit: '桶', categoryPath: '耗材类 / 生产耗材 / 设备-配件 / 润滑油', totalQty: '18', availableQty: '15', lockedQty: '0', borrowedQty: '0', warehouses: '主仓库', stockStatus: 'warning', alert: 'warning', lastChange: '2026-06-07 09:00' },
  { viewType: 'fixed', materialType: 'fixed', assetCode: 'ZC202606001', code: 'BG-00201', name: '笔记本电脑', spec: 'ThinkPad T14', major: '资产-固定资产', minor: '办公设备', unit: '台', categoryPath: '资产类 / 固定资产 / 办公设备 / 笔记本电脑', totalQty: '1', availableQty: '1', lockedQty: '0', borrowedQty: '0', location: '主仓库/B区/B-03', assetStatus: '在库', stockStatus: 'normal', alert: 'normal', lastChange: '2026-06-09 11:20' },
  { viewType: 'fixed', materialType: 'fixed', assetCode: 'ZC202606002', code: 'BG-00201', name: '笔记本电脑', spec: 'ThinkPad T14', major: '资产-固定资产', minor: '办公设备', unit: '台', categoryPath: '资产类 / 固定资产 / 办公设备 / 笔记本电脑', totalQty: '1', availableQty: '1', lockedQty: '0', borrowedQty: '0', location: '主仓库/B区/B-03', assetStatus: '在库', stockStatus: 'normal', alert: 'normal', lastChange: '2026-06-09 11:20' },
  { viewType: 'fixed', materialType: 'fixed', assetCode: 'ZC202605012', code: 'GC-20001', name: '工程测量仪', spec: '全站仪 TS06', major: '资产-固定资产', minor: '办公设备', unit: '台', categoryPath: '资产类 / 固定资产 / 办公设备 / 工程测量仪', totalQty: '1', availableQty: '0', lockedQty: '0', borrowedQty: '1', location: '武穴大桥施工点', assetStatus: '借出', stockStatus: 'normal', alert: 'normal', borrower: '王工', lastChange: '2026-06-01 09:00' },
];

const MATERIAL_LEDGER_DETAIL_SAMPLES = {
  'LA-00456': {
    code: 'LA-00456', name: '电钻', spec: '650W', major: '资产-类资产', minor: '电动工具', unit: '台',
    safeStock: '10', minStock: '5', maxStock: '20',
    totalQty: '8', availableQty: '6', lockedQty: '0', borrowedQty: '2', pendingScrapQty: '0',
    stockStatus: 'normal',
    warehouses: [
      { warehouse: '主仓库', zone: 'A区', shelf: 'A-02', qty: '8', available: '6', status: '在库' },
    ],
    transactions: [
      { no: 'HK202606090003', type: '归还', qty: '1 台', time: '2026-06-08 16:45' },
      { no: 'CK202606090008', type: '出库', qty: '2 台', time: '2026-06-07 14:20' },
    ],
  },
  'HC-00089': {
    code: 'HC-00089', name: '打印纸 A4', spec: '70g/500张', major: '耗材-办公耗材', minor: '办公用纸', unit: '箱',
    safeStock: '100', minStock: '50', maxStock: '300',
    totalQty: '186', availableQty: '170', lockedQty: '16', borrowedQty: '0', pendingScrapQty: '12',
    stockStatus: 'normal',
    warehouses: [
      { warehouse: '主仓库', zone: 'A区', shelf: 'A-02', qty: '174', available: '158', status: '在库' },
      { warehouse: '主仓库', zone: '待报废区', shelf: '—', qty: '12', available: '12', status: '待报废' },
    ],
    transactions: [
      { no: 'CK202606010003', type: '出库', qty: '50 箱', time: '2026-06-01 09:30' },
    ],
  },
  'GD001001-006': {
    code: 'GD001001-006', name: '润滑油', spec: 'CD 15W-40', major: '耗材-生产耗材', minor: '设备-配件', unit: '桶',
    safeStock: '50', minStock: '20', maxStock: '200',
    totalQty: '18', availableQty: '15', lockedQty: '0', borrowedQty: '0', pendingScrapQty: '0',
    stockStatus: 'warning',
    warehouses: [
      { warehouse: '主仓库', zone: 'A区', shelf: 'A-01', qty: '18', available: '15', status: '在库' },
    ],
    transactions: [
      { no: 'RK202606090012', type: '入库', qty: '20 桶', time: '2026-05-28 11:00' },
    ],
  },
  'ZC202605012': {
    code: 'GC-20001', assetCode: 'ZC202605012', name: '工程测量仪', spec: '全站仪 TS06', major: '资产-固定资产', minor: '办公设备', unit: '台',
    totalQty: '1', availableQty: '0', lockedQty: '0', borrowedQty: '1', pendingScrapQty: '0',
    stockStatus: 'normal', assetStatus: '借出', borrower: '王工', location: '武穴大桥施工点',
    warehouses: [
      { warehouse: '场外', zone: '武穴大桥施工点', shelf: '—', qty: '1', available: '0', status: '借出' },
    ],
    transactions: [
      { no: 'CK202606090008', type: '出库', qty: '1 台', time: '2026-06-01 09:00' },
    ],
  },
};

function materialLedgerStockBadge(status) {
  const map = { normal: ['正常', 'success'], warning: ['预警', 'warning'], danger: ['缺货', 'danger'] };
  const [label, tone] = map[status] || map.normal;
  return badge(label, tone);
}

function materialLedgerAssetStatusBadge(status) {
  const map = { '在库': 'success', '借出': 'warning', '维修中': 'info', '待报废': 'danger', '已作废': 'danger' };
  return badge(status, map[status] || 'info');
}

function materialLedgerListTab(row) {
  if (row.alert === 'warning' || row.alert === 'danger' || row.stockStatus === 'warning') return '库存预警';
  if (row.materialType === 'fixed') return '固定资产';
  if (row.materialType === 'like') return '类资产';
  return '耗材';
}

function materialLedgerRowActions(row) {
  if (row.viewType === 'fixed') {
    return `<a href="ledger_material_detail.html?code=${encodeURIComponent(row.code)}&assetCode=${encodeURIComponent(row.assetCode)}&back=ledger_material.html" class="mr-2 hover:underline">查看</a><a href="ledger_asset_detail.html?code=${encodeURIComponent(row.assetCode)}" class="hover:underline">资产</a>`;
  }
  return `<a href="ledger_material_detail.html?code=${encodeURIComponent(row.code)}&back=ledger_material.html" class="hover:underline">查看</a>`;
}

function materialLedgerSidebarTree() {
  return materialPickerSidebarTree(MATERIAL_LEDGER_ROWS);
}

function ledgerMaterialListPage() {
  const tr = MATERIAL_LEDGER_ROWS.map(row => {
    const tab = materialLedgerListTab(row);
    const codeCell = row.viewType === 'fixed'
      ? `<span class="font-mono text-xs">${row.assetCode}</span><div class="text-[10px] text-slate-400">${row.code}</div>`
      : `<span class="font-mono text-xs">${row.code}</span>`;
    const locCell = row.viewType === 'fixed'
      ? `${row.location}${row.borrower ? `<div class="text-[10px] text-slate-400">借用人：${row.borrower}</div>` : ''}`
      : row.warehouses;
    const statusCell = row.viewType === 'fixed'
      ? materialLedgerAssetStatusBadge(row.assetStatus)
      : materialLedgerStockBadge(row.stockStatus);
    const searchText = [row.code, row.assetCode, row.name, row.spec, row.major, row.minor, row.warehouses, row.location].filter(Boolean).join(' ').toLowerCase();
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-ledger-material-row data-material-type="${row.materialType}" data-material-category-path="${row.categoryPath || ''}" data-list-tab="${tab}" data-list-search="${searchText.replace(/"/g, '')}">
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${codeCell}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${row.name}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${row.spec}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${materialTypeBadge(row.materialType)}</td>
      <td class="px-4 py-3.5 text-sm font-medium text-slate-900 whitespace-nowrap">${row.totalQty} ${row.unit}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${row.availableQty}</td>
      <td class="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">${row.lockedQty}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${row.borrowedQty}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${locCell}</td>
      <td class="px-4 py-3.5 whitespace-nowrap">${statusCell}</td>
      <td class="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">${row.lastChange}</td>
      ${actionTd(materialLedgerRowActions(row), 'px-4 py-3.5')}
    </tr>`;
  }).join('');

  const statCards = `
    <div class="wms-ledger-stat-row mb-6">
      <button type="button" class="wms-ledger-stat-card card rounded-2xl bg-white text-left hover:ring-1 hover:ring-amber-200 transition" data-ledger-stat-tab="库存预警">
        <div class="text-xs text-slate-500">库存预警</div>
        <div class="mt-1 text-xl font-semibold text-amber-600">1</div>
        <div class="mt-0.5 text-[11px] text-amber-600">低于安全库存</div>
      </button>
      <button type="button" class="wms-ledger-stat-card card rounded-2xl bg-white text-left hover:ring-1 hover:ring-slate-200 transition" data-ledger-stat-tab="固定资产">
        <div class="text-xs text-slate-500">借出中</div>
        <div class="mt-1 text-xl font-semibold text-slate-900">63</div>
        <div class="mt-0.5 text-[11px] text-slate-400">类资产+固资件数</div>
      </button>
      <a href="warehouse_scrap_pending_pool.html" class="wms-ledger-stat-card card rounded-2xl bg-white text-left hover:ring-1 hover:ring-rose-200 transition">
        <div class="text-xs text-slate-500">待报废</div>
        <div class="mt-1 text-xl font-semibold text-rose-600">3</div>
        <div class="mt-0.5 text-[11px] text-rose-600">待发起作废</div>
      </a>
    </div>`;

  return `
    <div data-wms-material-ledger>
      <p class="mb-4 text-sm text-slate-500">全公司<strong class="font-medium text-slate-700">物资维度</strong>库存总览，按编码汇总在库、可用、借出与预警；需要定位货位请使用<a href="ledger_warehouse.html" class="font-medium text-slate-800 hover:underline">仓库台账</a>。</p>
      ${statCards}
      <div class="wms-material-layout">
        ${materialLedgerSidebarTree()}
        <div class="wms-material-main card min-w-0 rounded-2xl bg-white p-4 shadow-sm">
          <p class="mb-3 text-xs text-slate-500" data-wms-material-breadcrumb>当前分类：<span class="font-medium text-slate-800">全部物资</span></p>
          <div data-wms-list-page>
            <div class="mb-4 flex flex-wrap gap-2" data-wms-list-tabs>
              <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white" data-wms-list-tab="全部">全部</button>
              <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="固定资产">固定资产</button>
              <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="类资产">类资产</button>
              <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="耗材">耗材</button>
              <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="库存预警">库存预警</button>
            </div>
            ${listPageActions({
              searchPlaceholder: '物资编码、资产编码、名称、规格…',
              secondary: ['<a href="ledger_warehouse.html" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-warehouse text-xs text-slate-400"></i>仓库台账</a>'],
            })}
            <div class="card overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100" data-wms-list-card>
              <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap>
                <table class="min-w-full wms-data-table">
                  <thead class="bg-slate-50/80"><tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">编码</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">物资名称</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">规格型号</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">类型</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">在库总量</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">可用</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">锁定</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">借出</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">分布/位置</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">状态</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">最近变动</th>
                    ${actionTh('px-4 py-3')}
                  </tr></thead>
                  <tbody data-wms-list-tbody>${tr}</tbody>
                </table>
              </div>
              ${listEmptyState()}
              ${listTableFooter(MATERIAL_LEDGER_ROWS.length)}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function ledgerMaterialDetailPage(backHref = 'ledger_material.html', sample = {}) {
  const d = { ...MATERIAL_LEDGER_DETAIL_SAMPLES['LA-00456'], ...sample };
  const whRows = (d.warehouses || []).map((w, i) =>
    `<tr class="border-t border-slate-100">
      <td class="px-3 py-2.5 text-sm">${i + 1}</td>
      <td class="px-3 py-2.5 text-sm text-slate-800">${w.warehouse}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700">${w.zone}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700">${w.shelf}</td>
      <td class="px-3 py-2.5 text-sm font-medium text-slate-900">${w.qty}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700">${w.available}</td>
      <td class="px-3 py-2.5 text-sm">${w.status === '待报废' ? badge('待报废', 'warning') : w.status === '借出' ? badge('借出', 'warning') : badge('在库', 'success')}</td>
      <td class="px-3 py-2.5 text-right text-sm"><a href="ledger_warehouse.html" class="text-slate-700 hover:underline">货位台账</a></td>
    </tr>`
  ).join('');
  const txRows = (d.transactions || []).map(tx =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs text-slate-800">${tx.no}</td><td class="px-3 py-2.5 text-sm">${transactionTypeBadge(tx.type)}</td><td class="px-3 py-2.5 text-sm text-slate-700">${tx.qty}</td><td class="px-3 py-2.5 text-sm text-slate-500">${tx.time}</td><td class="px-3 py-2.5 text-right text-sm"><a href="ledger_transaction.html?no=${encodeURIComponent(tx.no)}" class="hover:underline">流水</a></td></tr>`
  ).join('');
  const assetBanner = d.assetCode ? `<div class="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700"><i class="fa-solid fa-barcode mr-1 text-slate-500"></i>固定资产资产编码 <span class="font-mono font-semibold">${d.assetCode}</span> · 状态 ${materialLedgerAssetStatusBadge(d.assetStatus || '在库')}${d.borrower ? ` · 借用人 ${d.borrower}` : ''}</div>` : '';
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-ledger-material-detail data-material-code="${d.code}">
      ${assetBanner}
      <dl class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div><dt class="text-slate-500">物资编码</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-ledger-mat-field="code">${d.code}</dd></div>
        <div><dt class="text-slate-500">物资名称</dt><dd class="mt-1 text-slate-900" data-ledger-mat-field="name">${d.name}</dd></div>
        <div><dt class="text-slate-500">规格型号</dt><dd class="mt-1 text-slate-800" data-ledger-mat-field="spec">${d.spec}</dd></div>
        <div><dt class="text-slate-500">库存状态</dt><dd class="mt-1">${materialLedgerStockBadge(d.stockStatus || 'normal')}</dd></div>
        <div><dt class="text-slate-500">在库总量</dt><dd class="mt-1 font-semibold text-slate-900">${d.totalQty} ${d.unit}</dd></div>
        <div><dt class="text-slate-500">可用数量</dt><dd class="mt-1 font-semibold text-emerald-700">${d.availableQty}</dd></div>
        <div><dt class="text-slate-500">锁定/预留</dt><dd class="mt-1 text-slate-800">${d.lockedQty || '0'}</dd></div>
        <div><dt class="text-slate-500">借出数量</dt><dd class="mt-1 text-slate-800">${d.borrowedQty || '0'}</dd></div>
        ${d.safeStock ? `<div><dt class="text-slate-500">安全库存</dt><dd class="mt-1 text-slate-800">${d.safeStock}</dd></div>` : ''}
        ${d.minStock ? `<div><dt class="text-slate-500">库存下限</dt><dd class="mt-1 text-slate-800">${d.minStock}</dd></div>` : ''}
        ${d.pendingScrapQty ? `<div><dt class="text-slate-500">待报废</dt><dd class="mt-1 text-rose-700">${d.pendingScrapQty} ${d.unit}</dd></div>` : ''}
      </dl>
      <h4 class="mb-3 text-sm font-semibold text-slate-900">分仓明细</h4>
      <div class="mb-6 overflow-hidden rounded-xl border border-slate-200">
        <table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">序号</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">仓库</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">分区</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">货架</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">数量</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">可用</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">状态</th>
          <th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">操作</th>
        </tr></thead><tbody>${whRows}</tbody></table>
      </div>
      <h4 class="mb-3 text-sm font-semibold text-slate-900">最近流水</h4>
      <div class="mb-4 overflow-hidden rounded-xl border border-slate-200">
        <table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">单号</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">类型</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">数量</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">时间</th>
          <th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">操作</th>
        </tr></thead><tbody>${txRows}</tbody></table>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <a href="config_material_detail.html?code=${encodeURIComponent(d.code)}" class="text-slate-600 hover:underline"><i class="fa-solid fa-list mr-1"></i>物资清单</a>
        <a href="ledger_transaction.html" class="text-slate-600 hover:underline"><i class="fa-solid fa-right-left mr-1"></i>全部流水</a>
        ${d.pendingScrapQty ? `<a href="warehouse_scrap_pending_pool.html" class="text-rose-600 hover:underline"><i class="fa-solid fa-dumpster mr-1"></i>待报废池</a>` : ''}
      </div>
      <div class="wms-modal-footer mt-6">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-ledger-mat-back>关闭</a>
      </div>
    </div>`;
}

function assetDetailModal(backHref, asset) {
  const statusBadge = asset.status === '在库' ? badge('在库', 'success') : badge('借出', 'warning');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
      <div class="wms-asset-detail">
        <dl class="grid gap-4 sm:grid-cols-2 text-sm mb-6">
          <div><dt class="text-slate-500">资产编码</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-asset-field="code">${asset.code}</dd></div>
          <div><dt class="text-slate-500">物资编码</dt><dd class="mt-1 font-mono text-slate-800" data-asset-field="materialCode">${asset.materialCode}</dd></div>
          <div><dt class="text-slate-500">物资名称</dt><dd class="mt-1 text-slate-900" data-asset-field="name">${asset.name}</dd></div>
          <div><dt class="text-slate-500">大类</dt><dd class="mt-1">${badge('固定资产', 'info')}</dd></div>
          <div><dt class="text-slate-500">货位</dt><dd class="mt-1 text-slate-800" data-asset-field="location">${asset.location}</dd></div>
          <div><dt class="text-slate-500">状态</dt><dd class="mt-1">${statusBadge}</dd></div>
          <div><dt class="text-slate-500">入库时间</dt><dd class="mt-1 text-slate-800">${asset.time}</dd></div>
          <div><dt class="text-slate-500">二维码内容</dt><dd class="mt-1 font-mono text-xs text-slate-500">wms://asset/${asset.code}</dd></div>
        </dl>
        <div class="wms-qr-preview-card">
          <h4 class="mb-4 text-sm font-semibold text-slate-900">专属资产二维码</h4>
          <div class="flex flex-wrap items-start gap-8">
            <div class="rounded-xl border border-slate-200 bg-white p-4">${assetQrImg(asset.code, 160)}</div>
            <div class="flex-1 min-w-[200px] space-y-3">
              ${assetQrLabel(asset.code, asset.name, asset.location)}
              <p class="text-xs text-slate-500">贴码后可通过出库、归还等现场作业扫码识别；码内容不随状态变化，扫码后展示当前在库/借出状态。</p>
              <div class="flex flex-wrap gap-2 pt-1">
                <button type="button" class="wms-btn wms-btn-primary wms-qr-download-single" data-asset-code="${asset.code}"><i class="fa-solid fa-download mr-1"></i>下载 PNG</button>
                <button type="button" class="wms-btn wms-btn-secondary"><i class="fa-solid fa-print mr-1"></i>打印标签</button>
                <a href="ledger_asset_qrcode.html?code=${asset.code}" class="wms-btn wms-btn-secondary">全屏查看</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a>
      </div>
    </div>`;
}

const TRANSACTION_SAMPLES = {
  RK202606090012: {
    no: 'RK202606090012', type: '入库', typeKey: 'inbound', materialCode: 'HC-00128', materialName: '安全帽',
    category: '耗材', qty: '200', unit: '顶', warehouse: '主仓库/A区', location: 'A-01',
    time: '2026-06-09 14:32', operator: '张仓管', relatedNo: 'YS202606090018', relatedLabel: '验收单号',
    sourceHref: 'warehouse_inbound_form.html', remark: '批量入库',
  },
  CK202606090008: {
    no: 'CK202606090008', type: '出库', typeKey: 'outbound', materialCode: 'ZC202606001', materialName: '笔记本电脑',
    category: '固定资产', qty: '1', unit: '台', warehouse: '主仓库/B区', location: 'B-03',
    time: '2026-06-09 11:20', operator: '李仓管', relatedNo: 'LY202606070002', relatedLabel: '领用单号',
    recipient: '王工', assetCode: 'ZC202606001', sourceHref: 'warehouse_outbound_fixed_form.html', remark: '—',
  },
  HK202606090003: {
    no: 'HK202606090003', type: '归还', typeKey: 'return', materialCode: 'LA-00456', materialName: '电钻',
    category: '类资产', qty: '1', unit: '台', warehouse: '主仓库/A区', location: 'A-02',
    time: '2026-06-08 16:45', operator: '王工', relatedNo: 'LY202605200008', relatedLabel: '领用单号',
    returnStatus: '完好', sourceHref: 'warehouse_return_like_form.html', remark: '按时归还',
  },
  TH202606030001: {
    no: 'TH202606030001', type: '退货', typeKey: 'refund', materialCode: 'DL-00234', materialName: '电缆 YJV-3×2.5',
    category: '类资产', qty: '100', unit: 'm', warehouse: '主仓库/A区', location: 'A-01',
    time: '2026-06-03 10:15', operator: '张仓管', relatedNo: 'GH202605280002', relatedLabel: '供货单号',
    supplier: '华建物资有限公司', refundReason: '质量问题', sourceHref: 'warehouse_refund_like_form.html?refundKey=TH202606030001&mode=view', remark: '规格不符退供应商',
  },
};

function transactionTypeBadge(type) {
  const map = { 入库: 'success', 出库: 'warning', 归还: 'info', 退货: 'danger' };
  return badge(type, map[type] || 'info');
}

function transactionDetailModal(backHref, tx) {
  const sourceHrefMap = { inbound: 'warehouse_inbound_form.html', outbound: 'warehouse_outbound_fixed_form.html', return: 'warehouse_return_fixed_form.html', refund: 'warehouse_refund_pre_form.html' };
  const sourceHref = tx.sourceHref || sourceHrefMap[tx.typeKey] || '#';
  const sourceLabelMap = { inbound: '查看入库单', outbound: '查看出库单', return: '查看归还单', refund: '查看退货单' };
  const typeIconMap = { inbound: 'fa-arrow-down-to-bracket', outbound: 'fa-arrow-up-from-bracket', return: 'fa-rotate-left', refund: 'fa-box-open' };
  const typeIcon = typeIconMap[tx.typeKey] || 'fa-right-left';
  const locationPath = [tx.warehouse, tx.location].filter(Boolean).join('/');
  const extraRows = [
    { key: 'supplier', label: '供应商' },
    { key: 'recipient', label: '领用人' },
    { key: 'assetCode', label: '资产编码', mono: true },
    { key: 'returnStatus', label: '归还状态', badge: true },
    { key: 'refundReason', label: '退货原因' },
    { key: 'remark', label: '备注', span: true },
  ].map(row => {
    const val = tx[row.key];
    const display = row.badge && val ? badge(val, 'success') : (val || '—');
    const cellCls = row.mono ? 'font-mono text-slate-800' : 'text-slate-800';
    return `<tr class="border-t border-slate-100${val && val !== '—' ? '' : ' hidden'}" data-tx-row="${row.key}">
      <td class="w-36 shrink-0 bg-slate-50/50 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">${row.label}</td>
      <td class="px-3 py-2.5 text-sm ${cellCls}" data-tx-field="${row.key}">${display}</td>
    </tr>`;
  }).join('');
  const matDetailHref = tx.assetCode
    ? `ledger_asset_detail.html?code=${encodeURIComponent(tx.assetCode)}&back=${encodeURIComponent(backHref)}`
    : `ledger_material_detail.html?code=${encodeURIComponent(tx.materialCode)}&back=${encodeURIComponent(backHref)}`;
  const matDetailLabel = tx.assetCode ? '资产详情' : '物资库存详情';
  const matDetailIcon = tx.assetCode ? 'fa-barcode' : 'fa-boxes-stacked';
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-transaction-detail>
      <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
        <i class="fa-solid ${typeIcon} mr-1 text-slate-500" data-tx-banner="icon"></i>流水 <span class="font-mono font-medium text-slate-900" data-tx-banner="no">${tx.no}</span>
        <span class="mx-2 text-slate-300">·</span><span data-tx-banner="type">${transactionTypeBadge(tx.type)}</span>
        <span class="mx-2 text-slate-300">·</span>货位 <span class="font-medium text-slate-900" data-tx-banner="location">${locationPath || '—'}</span>
      </div>
      <dl class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div><dt class="text-slate-500">物资编码</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-tx-field="materialCode">${tx.materialCode}</dd></div>
        <div><dt class="text-slate-500">物资名称</dt><dd class="mt-1 text-slate-900" data-tx-field="materialName">${tx.materialName}</dd></div>
        <div><dt class="text-slate-500">物资大类</dt><dd class="mt-1" data-tx-field="category">${badge(tx.category, 'info')}</dd></div>
        <div><dt class="text-slate-500">操作人</dt><dd class="mt-1 text-slate-800" data-tx-field="operator">${tx.operator}</dd></div>
        <div><dt class="text-slate-500">变动数量</dt><dd class="mt-1 text-lg font-semibold text-slate-900" data-tx-field="qty">${tx.qty} ${tx.unit || ''}</dd></div>
        <div><dt class="text-slate-500">仓库</dt><dd class="mt-1 text-slate-800" data-tx-field="warehouse">${tx.warehouse}</dd></div>
        <div><dt class="text-slate-500">货架货位</dt><dd class="mt-1 text-slate-800" data-tx-field="location">${tx.location || '—'}</dd></div>
        <div><dt class="text-slate-500">操作时间</dt><dd class="mt-1 text-slate-800" data-tx-field="time">${tx.time}</dd></div>
        <div><dt class="text-slate-500" data-tx-label="related">${tx.relatedLabel || '关联单号'}</dt><dd class="mt-1 font-mono text-slate-800" data-tx-field="relatedNo">${tx.relatedNo || '—'}</dd></div>
      </dl>
      <h4 class="mb-3 text-sm font-semibold text-slate-900">附加信息</h4>
      <div class="mb-4 overflow-hidden rounded-xl border border-slate-200" data-tx-extra-wrap>
        <table class="min-w-full text-sm"><tbody>${extraRows}</tbody></table>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <a href="${sourceHref}" class="text-slate-600 hover:underline" data-tx-source-link><i class="fa-solid fa-file-lines mr-1"></i>${sourceLabelMap[tx.typeKey] || '查看源单据'}</a>
        <a href="${matDetailHref}" class="text-slate-600 hover:underline" data-tx-material-link><i class="fa-solid ${matDetailIcon} mr-1"></i>${matDetailLabel}</a>
        <a href="ledger_warehouse.html" class="text-slate-600 hover:underline"><i class="fa-solid fa-warehouse mr-1"></i>仓库台账</a>
        <a href="ledger_transaction.html" class="text-slate-600 hover:underline"><i class="fa-solid fa-right-left mr-1"></i>全部流水</a>
      </div>
      <div class="wms-modal-footer mt-6">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-tx-back>关闭</a>
      </div>
    </div>`;
}

function ledgerTransactionPage() {
  const rows = [
    { no: 'RK202606090012', cells: ['RK202606090012', badge('入库', 'success'), 'HC-00128', '安全帽', '200', '主仓库/A区', '2026-06-09 14:32', '张仓管'] },
    { no: 'CK202606090008', cells: ['CK202606090008', badge('出库', 'warning'), 'ZC202606001', '笔记本电脑', '1', '主仓库/B区', '2026-06-09 11:20', '李仓管'] },
    { no: 'HK202606090003', cells: ['HK202606090003', badge('归还', 'info'), 'LA-00456', '电钻', '1', '主仓库/A区', '2026-06-08 16:45', '王工'] },
    { no: 'TH202606030001', cells: ['TH202606030001', badge('退货', 'danger'), 'DL-00234', '电缆 YJV-3×2.5', '100', '主仓库/A区', '2026-06-03 10:15', '张仓管'] },
  ];
  const th = ['单号', '类型', '物资编码', '物资名称', '数量', '仓库', '操作时间', '操作人'].map(c =>
    `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">${c}</th>`
  ).join('') + actionTh('px-4 py-3');
  const trFiltered = rows.map(r => {
    const type = stripCellText(r.cells[1]);
    const search = r.cells.map(stripCellText).join(' ').toLowerCase();
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-search="${search}" data-list-tab="${type}">${r.cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}${actionTd(`<a href="ledger_transaction_detail.html?no=${r.no}" class="hover:underline">查看</a>`, 'px-4 py-3.5 text-slate-900')}</tr>`;
  }).join('');
  return `
    <div data-wms-list-page>
      <p class="mb-4 text-sm text-slate-500">物资出入库操作流水，按操作时间降序</p>
      ${pageTabs(['全部', '入库', '出库', '归还', '退货'])}
      ${pageToolbar({
    searchPlaceholder: '单号、物资编码、物资名称',
    secondary: [{ label: '导出 Excel', icon: 'fa-solid fa-file-export' }],
    filters: [{ label: '操作时间', key: 'time', options: ['全部', '近7天', '近30天'] }],
  })}
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-list-card>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap><table class="min-w-full wms-data-table"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody data-wms-list-tbody>${trFiltered}</tbody></table></div>
        ${listEmptyState()}
        ${listTableFooter(rows.length)}
      </div>
    </div>`;
}

function assetQrcodeModal(backHref, asset) {
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="md">
      <div class="wms-qr-fullscreen text-center">
        <div class="mx-auto inline-block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          ${assetQrImg(asset.code, 200)}
          <div class="mt-4 font-mono text-sm font-semibold text-slate-900" data-asset-field="code">${asset.code}</div>
          <div class="mt-1 text-sm text-slate-600" data-asset-field="name">${asset.name}</div>
          <div class="mt-0.5 text-xs text-slate-400" data-asset-field="location">${asset.location}</div>
        </div>
        <p class="mt-4 text-xs text-slate-500">扫码解析：<code class="rounded bg-slate-100 px-1.5 py-0.5">wms://asset/${asset.code}</code></p>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a>
        <button type="button" class="wms-btn wms-btn-secondary"><i class="fa-solid fa-print mr-1"></i>打印</button>
        <button type="button" class="wms-btn wms-btn-primary wms-qr-download-single" data-asset-code="${asset.code}"><i class="fa-solid fa-download mr-1"></i>下载 PNG</button>
      </div>
    </div>`;
}

function inboundSuccessPage() {
  const codes = ['ZC202606090001', 'ZC202606090002', 'ZC202606090003'];
  return `
    <div class="mx-auto max-w-3xl" data-wms-inbound-success>
      <div class="card rounded-2xl bg-white p-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><i class="fa-solid fa-check text-2xl"></i></div>
        <h2 class="text-xl font-semibold text-slate-900" data-inbound-success-title>入库成功 · 已生成 3 个资产编码</h2>
        <p class="mt-2 text-sm text-slate-500" data-inbound-success-desc>入库单号 RK202606090018 · 验收单 GH2025001-YS01 · 货位 主仓库</p>
        <div class="mt-8 grid gap-4 sm:grid-cols-3" data-inbound-success-qr-grid>${codes.map(c => `<div class="rounded-xl border border-slate-200 p-4">${assetQrLabel(c, '抓斗', '主仓库')}</div>`).join('')}</div>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" id="wms-inbound-batch-qr" class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800" data-codes="${codes.join(',')}"><i class="fa-solid fa-file-zipper"></i> 下载本批标签 ZIP</button>
          <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-print"></i> 打印标签</button>
          <a href="ledger_warehouse.html" class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-warehouse"></i> 前往仓库台账</a>
          <a href="warehouse_inbound_list.html" class="text-sm text-slate-500 hover:text-slate-900">返回入库列表</a>
        </div>
      </div>
    </div>
    <div id="wms-qr-toast" class="wms-qr-toast hidden" role="status"></div>`;
}

const USAGE_LOCATION_REGIONS = [
  { id: 'work', label: '作业区' },
  { id: 'office', label: '办公区' },
];

const USAGE_LOCATION_TREE = [
  { code: '001', name: '1号楼', region: 'work', serial: '1', enabled: true, creator: 'Admin', createdAt: '2026-06-01 09:00', remark: '', children: [] },
  { code: '002', name: '2号楼', region: 'work', serial: '2', enabled: true, creator: 'Admin', createdAt: '2026-06-02 10:15', remark: '', children: [] },
  {
    code: '003', name: '3号楼', region: 'work', serial: '3', enabled: true, creator: 'Admin', createdAt: '2026-06-03 11:20', expanded: true, remark: '', children: [
      { code: '003001', name: '1层', region: 'work', serial: '3.1', parentCode: '003', parentName: '3号楼', enabled: true, creator: '—', createdAt: '—', remark: '' },
    ],
  },
  {
    code: '101', name: '行政楼', region: 'office', serial: '1', enabled: true, creator: 'Admin', createdAt: '2026-06-05 09:00', remark: '', children: [
      { code: '101001', name: '2层', region: 'office', serial: '1.1', parentCode: '101', parentName: '行政楼', enabled: true, creator: '—', createdAt: '—', remark: '' },
    ],
  },
  { code: '102', name: '会议室楼', region: 'office', serial: '2', enabled: false, creator: 'Admin', createdAt: '2026-06-06 14:00', remark: '', children: [] },
];

function locationRegionLabel(id) {
  return USAGE_LOCATION_REGIONS.find(r => r.id === id)?.label || id;
}

function locationToggleInput(enabled = true, code = '') {
  return `<label class="wms-toggle"><input type="checkbox" data-wms-location-enabled data-location-code="${code}"${enabled ? ' checked' : ''} /><span class="wms-toggle-track"></span></label>`;
}

function locationRowActions(node, isChild = false) {
  const view = `<a href="config_location_form.html?code=${node.code}&mode=view" class="hover:underline">查看</a>`;
  const edit = `<a href="config_location_form.html?code=${node.code}&mode=edit" class="hover:underline">编辑</a>`;
  const del = `<button type="button" class="text-rose-600 hover:underline" data-wms-location-delete data-location-code="${node.code}">删除</button>`;
  if (isChild) return `${view}&nbsp;&nbsp;${edit}&nbsp;&nbsp;${del}`;
  const addChild = `<a href="config_location_form.html?mode=child&parent=${node.code}&parentName=${encodeURIComponent(node.name)}&region=${node.region}" class="hover:underline">添加子类</a>`;
  return `${addChild}&nbsp;&nbsp;${view}&nbsp;&nbsp;${edit}&nbsp;&nbsp;${del}`;
}

function locationTreeRow(node, { isChild = false, parentExpanded = true } = {}) {
  const hasChildren = !isChild && node.children?.length > 0;
  const expanded = node.expanded !== false;
  const toggle = hasChildren
    ? `<button type="button" class="wms-location-tree-toggle${expanded ? ' is-expanded' : ''} mr-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100" data-wms-location-tree-toggle data-location-code="${node.code}" aria-label="${expanded ? '收起' : '展开'}"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>`
    : `<span class="mr-1 inline-block w-5"></span>`;
  const serialCell = `<span class="inline-flex items-center gap-0.5 font-mono text-xs text-slate-500">${toggle}${node.serial}</span>`;
  const childHidden = isChild && !parentExpanded ? ' hidden' : '';
  const childAttr = isChild ? ` data-wms-location-child data-location-parent="${node.parentCode}"` : ` data-wms-location-parent-row data-location-has-children="${hasChildren ? '1' : '0'}"`;
  const statusCell = isChild && !node.enabled ? locationToggleInput(false, node.code) : locationToggleInput(node.enabled !== false, node.code);
  const enabledLabel = node.enabled !== false ? '启用' : '停用';
  const searchText = `${node.code} ${node.name}`.toLowerCase();
  return `<tr class="border-t border-slate-100 hover:bg-slate-50/80${childHidden}" data-wms-list-row data-wms-location-row data-location-code="${node.code}" data-location-region="${node.region}" data-location-name="${node.name}" data-location-enabled="${node.enabled !== false ? '1' : '0'}" data-list-search="${searchText}" data-list-filter-enabled="${enabledLabel}"${childAttr}>
    <td class="px-4 py-3.5 text-sm whitespace-nowrap">${serialCell}</td>
    <td class="px-4 py-3.5 text-sm text-slate-700 font-mono text-xs whitespace-nowrap">${isChild ? `<span class="pl-6">${node.code}</span>` : node.code}</td>
    <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${isChild ? `<span class="pl-6">${node.name}</span>` : node.name}</td>
    <td class="px-4 py-3.5 text-sm whitespace-nowrap">${statusCell}</td>
    <td class="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">${node.creator || '—'}</td>
    <td class="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">${node.createdAt || '—'}</td>
    ${actionTd(locationRowActions(node, isChild))}
  </tr>`;
}

function locationListPage() {
  const regionTabs = `<div class="mb-4 flex flex-wrap gap-2" data-wms-list-region-tabs>${USAGE_LOCATION_REGIONS.map((r, i) =>
    `<button type="button" class="wms-list-region-tab rounded-xl px-4 py-2 text-sm font-medium ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}" data-wms-list-region="${r.id}">${r.label}</button>`
  ).join('')}</div>`;
  const rows = USAGE_LOCATION_TREE.flatMap(node => {
    const parentRows = [locationTreeRow(node)];
    const childRows = (node.children || []).map(child => locationTreeRow(child, { isChild: true, parentExpanded: node.expanded !== false }));
    return [...parentRows, ...childRows];
  }).join('');
  const total = USAGE_LOCATION_TREE.reduce((n, node) => n + 1 + (node.children?.length || 0), 0);
  return `
    <div data-wms-list-page data-wms-location-page>
      ${regionTabs}
      ${listPageActions({
    searchPlaceholder: '地点名称',
    filters: [{ label: '状态', key: 'enabled', options: ['全部', '启用', '停用'] }],
    addBtn: true,
    addHref: 'config_location_form.html?mode=major&region=work',
    addAttrs: 'data-wms-location-add',
  })}
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-list-card>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap>
          <table class="min-w-full wms-data-table">
            <thead class="bg-slate-50/80"><tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">序号</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">地点编码</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">地点名称</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">创建人</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">创建时间</th>
              ${actionTh()}
            </tr></thead>
            <tbody data-wms-list-tbody data-wms-location-tbody>${rows}</tbody>
          </table>
        </div>
        ${listEmptyState()}
        ${listTableFooter(total)}
      </div>
    </div>
    <div id="wms-location-toast" class="wms-qr-toast hidden" role="status"></div>`;
}

function locationFormPage(options = {}) {
  const { backHref = 'config_location_list.html', mode = 'major', sample = null } = options;
  const s = sample || { code: '系统自动生成', name: '', region: '作业区', parentName: '', remark: '', enabled: true };
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isChild = mode === 'child' || Boolean(s.parentCode || s.parentName);
  const ro = isView;
  const inputCls = ro
    ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const title = isView ? '查看使用地点' : isEdit ? '编辑使用地点' : isChild ? '添加子级地点' : '新增使用地点';
  const regionOpts = USAGE_LOCATION_REGIONS.map(r => ({
    label: r.label,
    selected: (s.region === r.label || s.region === r.id),
  }));
  const fields = [];
  if (isChild) {
    fields.push(`<div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 所属父级</label><input type="text" readonly class="${inputCls}" value="${s.parentName || ''}" data-wms-location-parent-name /></div>`);
  } else {
    const regionReadonly = isEdit || isView;
    if (regionReadonly) {
      fields.push(`<div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 所属区域</label><input type="text" readonly class="${inputCls}" value="${typeof s.region === 'string' && !s.region.includes('区') ? locationRegionLabel(s.region) : s.region}" /></div>`);
    } else {
      fields.push(`<div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 所属区域</label><select class="${inputCls}" data-wms-location-region required>${regionOpts.map(o => `<option${o.selected ? ' selected' : ''}>${o.label}</option>`).join('')}</select></div>`);
    }
  }
  fields.push(`<div><label class="mb-1.5 block text-sm font-medium text-slate-700">地点编码</label><input type="text" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" value="${s.code || '系统自动生成'}" /></div>`);
  fields.push(`<div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 地点名称</label><input type="text"${ro ? ' readonly' : ' placeholder="请输入"'} class="${ro ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600' : inputCls}" value="${s.name || ''}" data-wms-location-name${ro ? '' : ' required'} /></div>`);
  fields.push(`<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">备注</label><textarea rows="3" placeholder="0/500"${ro ? ' readonly' : ''} class="${ro ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600' : inputCls}" data-wms-location-remark>${s.remark || ''}</textarea></div>`);
  if (!isView) {
    fields.push(`<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">启用</label><label class="wms-toggle"><input type="checkbox" data-wms-location-form-enabled${s.enabled !== false ? ' checked' : ''} /><span class="wms-toggle-track"></span></label></div>`);
  } else {
    fields.push(`<div><label class="mb-1.5 block text-sm font-medium text-slate-700">启用</label><span class="text-sm text-slate-800">${s.enabled !== false ? '是' : '否'}</span></div>`);
  }
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="md">
      <div class="wms-modal-form" data-wms-location-form data-location-mode="${mode}" data-location-child="${isChild ? '1' : '0'}">
        ${fields.join('')}
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">${isView ? '关闭' : '取消'}</a>
        ${isView ? '' : '<button type="button" class="wms-btn wms-btn-primary" data-wms-location-save>确定</button>'}
      </div>
    </div>`;
}

function stripCellText(html) {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function filterSelect(label, key, options = ['全部'], { selected = '全部' } = {}) {
  return `<label class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
    <span class="text-slate-500 shrink-0">${label}</span>
    <select class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0" data-wms-list-filter="${key}">
      ${options.map(o => `<option value="${o}"${o === selected ? ' selected' : ''}>${o}</option>`).join('')}
    </select>
  </label>`;
}

function primaryAddBtn(href = '#', attrs = '') {
  return `<a href="${href}" class="inline-flex shrink-0 items-center justify-center gap-2 min-w-[96px] rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition whitespace-nowrap"${attrs ? ` ${attrs}` : ''}><i class="fa-solid fa-plus text-xs"></i>新增</a>`;
}

function secondaryBtn(label, { icon = '', attrs = '' } = {}) {
  return `<button type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"${attrs ? ` ${attrs}` : ''}>${icon ? `<i class="${icon} text-xs text-slate-400"></i>` : ''}${label}</button>`;
}

function pageTabs(tabs, { attr = 'data-wms-list-tab' } = {}) {
  if (!tabs?.length) return '';
  return `<div class="mb-4 flex flex-wrap gap-2" data-wms-list-tabs>${tabs.map((t, i) =>
    `<button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}" ${attr}="${t}">${t}</button>`
  ).join('')}</div>`;
}

function listSearchInput(placeholder = '请输入关键字') {
  return `<div class="relative shrink-0 w-[280px]">
    <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
    <input type="search" data-wms-list-search placeholder="${placeholder}" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
    <button type="button" data-wms-list-search-clear class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" title="清空"><i class="fa-solid fa-xmark text-xs"></i></button>
  </div>`;
}

function listAddRow(cfg = {}) {
  if (!cfg.addBtn && !cfg.addHref) return '';
  return `<div class="mb-4" data-wms-list-add-row>${primaryAddBtn(cfg.addHref || '#', cfg.addAttrs || '')}</div>`;
}

function pageToolbar(cfg = {}) {
  const filterList = (cfg.filters || []).map(f => filterSelect(f.label, f.key, f.options)).join('');
  const secondary = (cfg.secondary || []).map(s => typeof s === 'string' ? s : secondaryBtn(s.label, s)).join('');
  const reset = '<button type="button" class="hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" data-wms-list-reset><i class="fa-solid fa-rotate-left text-xs"></i>重置</button>';
  const search = cfg.search !== false ? listSearchInput(cfg.searchPlaceholder || '请输入关键字') : '';
  const hasToolbar = search || filterList || secondary;
  if (!hasToolbar) return '';
  const mb = cfg.addBtn || cfg.addHref ? 'mb-3' : 'mb-4';
  return `<div class="${mb} flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto" data-wms-list-toolbar>${filterList}${search}${reset}${secondary}</div>`;
}

function listPageActions(cfg = {}) {
  return `${pageToolbar(cfg)}${listAddRow(cfg)}`;
}

function listEmptyState() {
  return `<div class="hidden py-16 text-center" data-wms-list-empty>
    <i class="fa-solid fa-inbox mb-3 text-3xl text-slate-300"></i>
    <p class="text-sm text-slate-500">无匹配数据，请调整筛选条件</p>
  </div>`;
}

function listTableFooter(total) {
  return `<div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
    <span data-wms-list-count>共 ${total} 条</span>
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex gap-1"><span class="rounded-lg bg-slate-900 px-3 py-1 text-white">1</span></div>
      <span class="text-slate-400">10 条/页</span>
    </div>
  </div>`;
}

function listPage(cfg) {
  const tabs = pageTabs(cfg.tabs);
  const actions = listPageActions({
    searchPlaceholder: cfg.searchPlaceholder,
    search: cfg.search,
    filters: cfg.filters,
    addBtn: cfg.addBtn,
    addHref: cfg.addHref,
    addAttrs: cfg.addAttrs,
    secondary: cfg.secondary,
  });
  const th = cfg.columns.map(c => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('') + (cfg.hideActions ? '' : actionTh('px-4 py-3'));
  const tr = cfg.rows.map((r) => {
    const cells = Array.isArray(r) ? r : (r.cells || r);
    const rawTab = cfg.tabColumn !== undefined ? stripCellText(cells[cfg.tabColumn]) : '';
    const tabVal = cfg.tabColumn !== undefined
      ? (cfg.tabMap?.[rawTab] || rawTab)
      : (Array.isArray(r) ? '' : (r.tab || ''));
    const filterAttrs = (cfg.filters || []).map(f => {
      const raw = f.column !== undefined ? stripCellText(cells[f.column]) : '';
      const val = f.map?.[raw] || raw || '全部';
      return ` data-list-filter-${f.key}="${val}"`;
    }).join('');
    const searchText = cells.map(stripCellText).join(' ').toLowerCase().replace(/"/g, '');
    const rowActions = Array.isArray(r) ? null : r.actions;
    const actCell = cfg.hideActions ? '' : actionTd(rowActions || cfg.actions || '<a href="#" class="hover:underline">查看</a>', 'px-4 py-3.5 text-slate-900');
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-search="${searchText}" data-list-tab="${tabVal}"${filterAttrs}>${cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}${actCell}</tr>`;
  }).join('');
  const header = cfg.desc ? `<p class="mb-4 text-sm text-slate-500">${cfg.desc}</p>` : '';
  return `
    <div data-wms-list-page>
      ${header}
      ${tabs}
      ${actions}
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-list-card>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap><table class="min-w-full wms-data-table"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody data-wms-list-tbody>${tr}</tbody></table></div>
        ${listEmptyState()}
        ${listTableFooter(cfg.rows.length)}
      </div>
    </div>`;
}

function selectPicker(id, title, breadcrumb, backHref, cfg) {
  const confirmHref = cfg.confirmHref || backHref;
  const th = `<th class="w-10 px-4 py-3"><input type="checkbox" class="rounded border-slate-300" /></th>` +
    cfg.columns.map(c => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('');
  const tr = cfg.rows.map((cells, i) =>
    `<tr class="border-t border-slate-100 hover:bg-slate-50/80">
      <td class="px-4 py-3"><input type="checkbox" class="rounded border-slate-300"${i < (cfg.checkedCount ?? 2) ? ' checked' : ''} /></td>
      ${cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}
    </tr>`
  ).join('');
  return page(id, title, breadcrumb, `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="${cfg.modalSize || 'lg'}">
      <div class="wms-modal-toolbar">
        <p class="text-sm text-slate-500">${cfg.heading || title}</p>
        ${listSearchInput(cfg.searchPlaceholder || '搜索物资编码、名称…')}
      </div>
      <div class="wms-modal-table-wrap"><table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <a href="${confirmHref}" class="wms-btn wms-btn-primary">${cfg.confirmLabel || '确认选择'}</a>
      </div>
    </div>`);
}

function selectPickerWithTree(id, title, breadcrumb, backHref, cfg) {
  const confirmHref = cfg.confirmHref || backHref;
  const pickerRows = cfg.pickerRows || [];
  const th = `<th class="w-10 px-4 py-3"><input type="checkbox" class="rounded border-slate-300" /></th>` +
    cfg.columns.map(c => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('');
  const tr = pickerRows.map((row, i) => {
    const cells = cfg.renderCells(row);
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-picker-row data-material-type="${row.type}" data-material-category-path="${row.categoryPath || ''}">
      <td class="px-4 py-3"><input type="checkbox" class="rounded border-slate-300"${i < (cfg.checkedCount ?? 0) ? ' checked' : ''} /></td>
      ${cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}
    </tr>`;
  }).join('');
  const search = listSearchInput(cfg.searchPlaceholder || '搜索物资编码、名称…').replace(/data-wms-list-search/g, 'data-wms-picker-search').replace(/data-wms-list-search-clear/g, 'data-wms-picker-search-clear');
  return page(id, title, breadcrumb, `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="${cfg.modalSize || 'xl'}" data-wms-material-picker>
      <div class="wms-modal-toolbar">
        <p class="text-sm text-slate-500">${cfg.heading || title}</p>
        ${search}
      </div>
      <div class="wms-material-layout wms-picker-layout">
        ${materialPickerSidebarTree(pickerRows)}
        <div class="min-w-0">
          <div class="wms-modal-table-wrap max-h-[420px] overflow-auto"><table class="min-w-full text-sm"><thead class="bg-slate-50/80 sticky top-0"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>
          <p class="mt-2 text-xs text-slate-500" data-wms-picker-count>共 ${pickerRows.length} 条可选物资</p>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <a href="${confirmHref}" class="wms-btn wms-btn-primary">${cfg.confirmLabel || '确认选择'}</a>
      </div>
    </div>`);
}

function listToolbar(cfg = {}) {
  return `<div class="mb-4 flex flex-wrap items-center gap-3">
    <div class="relative flex-1 min-w-[200px] max-w-sm">
      <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
      <input type="search" placeholder="${cfg.placeholder || '请输入关键字'}" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
    </div>
    ${cfg.filter ? `<button class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">${cfg.filter} <i class="fa-solid fa-chevron-down text-xs text-slate-400"></i></button>` : ''}
    ${cfg.extra || ''}
  </div>`;
}

function warehouseShelfToolbar() {
  return `<div class="mb-3 flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto" data-wms-shelf-filters>
      <label class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
      <span class="text-slate-500 shrink-0">状态</span>
      <select class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0" data-wms-filter="status">
        <option value="all" selected>全部</option>
        <option value="enabled">启用</option>
        <option value="disabled">停用</option>
      </select>
    </label>
    <label class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
      <span class="text-slate-500 shrink-0">负责人</span>
      <select class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0" data-wms-filter="owner">
        <option value="all" selected>全部</option>
        <option value="李四">李四</option>
        <option value="王五">王五</option>
        <option value="张飞">张飞</option>
      </select>
    </label>
    <label class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
      <span class="text-slate-500 shrink-0">层数</span>
      <select class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0" data-wms-filter="layers">
        <option value="all" selected>全部</option>
        <option value="6-8">6–8 层</option>
        <option value="9-10">9–10 层</option>
      </select>
    </label>
    <button type="button" class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-filter-reset><i class="fa-solid fa-rotate-left text-xs"></i> 重置</button>
    <div class="relative shrink-0 w-[280px]">
      <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
      <input type="search" placeholder="货架编码、货架名称…" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
    </div>
  </div>`;
}

function purchasePendingApplyHref(planNo, code, name, qty) {
  const p = new URLSearchParams({ planNo, code, name, qty: String(qty) });
  return `purchase_pending_apply.html?${p.toString()}`;
}

function purchasePendingPlanViewHref(planNo) {
  const p = new URLSearchParams({ planNo, back: 'purchase_pending_list.html' });
  return `purchase_pending_plan_detail.html?${p.toString()}`;
}

const APPLY_PLAN_SAMPLES = {
  JJJH202606080001: {
    no: 'JJJH202606080001', name: '防汛应急采购', planType: '急件计划', status: '审核通过',
    reporter: '李四', department: '设备部', applyDate: '2026-06-08', needDate: '2026-06-12',
    remark: '汛期临近，需尽快补齐防汛物资库存。',
    lines: [
      { code: 'XF-00102', name: '防汛沙袋', spec: '50×80cm', major: '耗材-防汛物资', minor: '防汛物资', unit: '条', qty: '500' },
    ],
  },
  JJJH202510001: {
    no: 'JJJH202510001', name: '设备配件补库', planType: '急件计划', status: '审核通过',
    reporter: '李四', department: '设备部', applyDate: '2026-05-04', needDate: '2026-06-15',
    remark: '抓斗备件库存不足，申请补库。',
    lines: [
      { code: 'GD001001-001', name: '抓斗', spec: '4m³-Q345B', major: '资产-固定资产', minor: '设备-配件', unit: '个', qty: '10' },
    ],
  },
  JJJH202510002: {
    no: 'JJJH202510002', name: '设备配件补库', planType: '急件计划', status: '审核通过',
    reporter: '李四', department: '设备部', applyDate: '2026-05-04', needDate: '2026-06-15',
    remark: '料斗备件补库。',
    lines: [
      { code: 'GD001001-002', name: '料斗', spec: '4m³', major: '资产-固定资产', minor: '设备-配件', unit: '个', qty: '10' },
    ],
  },
  JJJH202606050001: {
    no: 'JJJH202606050001', name: '维保耗材采购', planType: '急件计划', status: '审核通过',
    reporter: '王五', department: '维保部', applyDate: '2026-06-05', needDate: '2026-06-18',
    remark: '维保季度集中采购。',
    lines: [
      { code: 'XF-00105', name: '抽水泵', spec: 'QZ10-15', major: '资产-类资产', minor: '防汛设备', unit: '台', qty: '5' },
    ],
  },
};

function applyPlanDetailModal(backHref, plan) {
  const p = plan;
  const typeBadge = p.planType === '急件计划' ? badge('急件计划', 'warning') : badge(p.planType || '一般计划', 'info');
  const statusBadge = badge(p.status || '审核通过', 'success');
  const lineRows = (p.lines || []).map((line, i) =>
    `<tr class="border-t border-slate-100">
      <td class="px-3 py-2.5 text-sm text-slate-700">${i + 1}</td>
      <td class="px-3 py-2.5 font-mono text-xs text-slate-800">${line.code}</td>
      <td class="px-3 py-2.5 text-sm text-slate-800">${line.name}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700">${line.spec}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700">${line.major}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700">${line.minor}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700">${line.unit}</td>
      <td class="px-3 py-2.5 text-sm font-medium text-slate-900">${line.qty}</td>
    </tr>`
  ).join('');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-apply-plan-detail>
      <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
        <i class="fa-solid fa-clipboard-list mr-1 text-slate-500" data-apply-plan-banner="icon"></i>计划 <span class="font-mono font-medium text-slate-900" data-apply-plan-field="no">${p.no}</span>
        <span class="mx-2 text-slate-300">·</span><span data-apply-plan-banner="planType">${typeBadge}</span>
        <span class="mx-2 text-slate-300">·</span><span data-apply-plan-banner="status">${statusBadge}</span>
      </div>
      <dl class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div><dt class="text-slate-500">计划名称</dt><dd class="mt-1 font-semibold text-slate-900" data-apply-plan-field="name">${p.name}</dd></div>
        <div><dt class="text-slate-500">填报人</dt><dd class="mt-1 text-slate-800" data-apply-plan-field="reporter">${p.reporter}</dd></div>
        <div><dt class="text-slate-500">填报部门</dt><dd class="mt-1 text-slate-800" data-apply-plan-field="department">${p.department}</dd></div>
        <div><dt class="text-slate-500">申请日期</dt><dd class="mt-1 text-slate-800" data-apply-plan-field="applyDate">${p.applyDate}</dd></div>
        <div><dt class="text-slate-500">最早需求日</dt><dd class="mt-1 text-slate-800" data-apply-plan-field="needDate">${p.needDate}</dd></div>
        <div class="sm:col-span-2 lg:col-span-3"><dt class="text-slate-500">需求说明</dt><dd class="mt-1 text-slate-700" data-apply-plan-field="remark">${p.remark || '—'}</dd></div>
      </dl>
      <h4 class="mb-3 text-sm font-semibold text-slate-900">计划明细</h4>
      <div class="mb-4 overflow-hidden rounded-xl border border-slate-200">
        <table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">序号</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">物资编码</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">物资名称</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">规格型号</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">物资大类</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">物资子类</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">单位</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">需求数量</th>
        </tr></thead><tbody data-apply-plan-lines>${lineRows}</tbody></table>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <a href="apply_plan_list.html" class="text-slate-600 hover:underline"><i class="fa-solid fa-list mr-1"></i>物资计划列表</a>
        <a href="purchase_pending_list.html" class="text-slate-600 hover:underline"><i class="fa-solid fa-cart-shopping mr-1"></i>待采物资</a>
      </div>
      <div class="wms-modal-footer mt-6">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-apply-plan-back>关闭</a>
      </div>
    </div>`;
}

function purchasePendingListPage() {
  const cols = ['序号', '计划单号', '计划名称', '计划类型', '物资编码', '物资名称', '状态', '规格型号', '物资大类', '物资子类', '填报人', '填报部门', '申请日期', '计量单位', '计划需求数量', '申请数量', '采购申请单号', '采购数量', '采购方式', '采购日期'];
  const th = cols.map(c => `<th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('') +
    actionTh();
  const dash = '<span class="text-slate-400">—</span>';
  const rows = [
    ['1', 'JJJH202606080001', '防汛应急采购', badge('急件计划', 'warning'), 'XF-00102', '防汛沙袋', badge('待申请', 'info'), '50×80cm', '耗材-防汛物资', '防汛物资', '李四', '设备部', '2026-06-08', '条', '500', dash, dash, dash, dash, dash,
      `<a href="${purchasePendingPlanViewHref('JJJH202606080001')}" class="mr-2 hover:underline">查看计划</a><a href="${purchasePendingApplyHref('JJJH202606080001', 'XF-00102', '防汛沙袋', 500)}" class="font-medium text-slate-900 hover:underline">申请</a>`],
    ['2', 'JJJH202510001', '设备配件补库', badge('急件计划', 'warning'), 'GD001001-001', '抓斗', badge('待申请', 'info'), '4m³-Q345B', '资产-固定资产', '设备-配件', '李四', '设备部', '2026-05-04', '个', '10', dash, dash, dash, dash, dash,
      `<a href="${purchasePendingPlanViewHref('JJJH202510001')}" class="mr-2 hover:underline">查看计划</a><a href="${purchasePendingApplyHref('JJJH202510001', 'GD001001-001', '抓斗', 10)}" class="font-medium text-slate-900 hover:underline">申请</a>`],
    ['3', 'JJJH202510002', '设备配件补库', badge('急件计划', 'warning'), 'GD001001-002', '料斗', badge('待申请', 'info'), '4m³', '资产-固定资产', '设备-配件', '李四', '设备部', '2026-05-04', '个', '10', dash, dash, dash, dash, dash,
      `<a href="${purchasePendingPlanViewHref('JJJH202510002')}" class="mr-2 hover:underline">查看计划</a><a href="${purchasePendingApplyHref('JJJH202510002', 'GD001001-002', '料斗', 10)}" class="font-medium text-slate-900 hover:underline">申请</a>`],
    ['4', 'JJJH202606050001', '维保耗材采购', badge('急件计划', 'warning'), 'XF-00105', '抽水泵', badge('已申请', 'success'), 'QZ10-15', '资产-类资产', '防汛设备', '王五', '维保部', '2026-06-05', '台', '5', '5', '<a href="purchase_request_list.html" class="font-mono text-xs hover:underline">JJSQ202606050001</a>', dash, dash, dash,
      '<a href="purchase_request_form.html?mode=view&amp;requestNo=JJSQ202606050001" class="hover:underline">查看申请</a>'],
  ];
  const tr = rows.map(r => {
    const actions = r.pop();
    const status = stripCellText(r[6]);
    const planType = stripCellText(r[3]);
    const search = r.map(stripCellText).join(' ').toLowerCase();
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-tab="${status}" data-list-search="${search}" data-list-filter-planType="${planType}">${r.map(c => `<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}${actionTd(actions)}</tr>`;
  }).join('');
  return `
    <div data-wms-list-page>
      <p class="mb-4 text-sm text-slate-500">急件计划审核通过后自动生成待采记录；<strong>待申请</strong>可发起采购申请，<strong>已申请</strong>不可重复申请</p>
      ${pageTabs(['全部', '待申请', '已申请'])}
      ${pageToolbar({
    searchPlaceholder: '计划单号、物资编码、物资名称',
    filters: [{ label: '计划类型', key: 'planType', options: ['全部', '一般计划', '急件计划'] }],
  })}
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-list-card>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap><table class="min-w-full text-sm wms-data-table"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody data-wms-list-tbody>${tr}</tbody></table></div>
        ${listEmptyState()}
        ${listTableFooter(rows.length)}
      </div>
    </div>`;
}

const purchaseMaterialRows = {
  pending: [
    ['1', 'XF-00102', '防汛沙袋', '50×80cm', '耗材', '防汛物资', '条', '12.00', '500', '500', ''],
    ['2', 'XF-00105', '抽水泵', 'QZ10-15', '类资产', '防汛设备', '台', '2800.00', '5', '5', ''],
  ],
  default: [
    ['1', 'GD001001-001', '抓斗', '455', '资产-固定资产', '设备-配件', '个', '1000.00', '10', '10', ''],
    ['2', 'GD001001-002', '料斗', '455', '资产-固定资产', '设备-配件', '个', '1000.00', '20', '20', ''],
  ],
};

function purchaseExecuteHref(method, mode) {
  const map = {
    直采: 'purchase_execute_direct.html',
    直接: 'purchase_execute_direct.html',
    询价: 'purchase_execute_inquiry.html',
    招标: 'purchase_execute_bid.html',
  };
  const base = map[method] || map['直采'];
  return mode ? `${base}?mode=${encodeURIComponent(mode)}` : base;
}

function purchaseExecuteRowActions(method, scenario) {
  if (scenario === 'pending') {
    return `<a href="${purchaseExecuteHref(method, 'view')}" class="mr-2 hover:underline">查看</a><a href="${purchaseExecuteHref(method)}" class="mr-2 hover:underline">采购</a><button type="button" class="hover:underline" data-wms-purchase-execute-submit-audit>发起审核</button>`;
  }
  if (scenario === 'auditing') {
    return `<a href="${purchaseExecuteHref(method, 'view')}" class="mr-2 hover:underline">查看</a><a href="${purchaseExecuteHref(method, 'audit')}" class="hover:underline">审核</a>`;
  }
  return `<a href="${purchaseExecuteHref(method, 'view')}" class="hover:underline">查看</a>`;
}

const EXECUTE_MATERIAL_ROWS = [
  { seq: 1, expanded: true, code: 'GD001001-001', name: '抓斗', spec: '455', major: '资产-固定资产', minor: '设备-配件', unit: '个', refPrice: '1000.00', qty: '10', total: '1000.00' },
  { seq: 2, expanded: false, code: 'GD001001-002', name: '料斗', spec: '455', major: '资产-固定资产', minor: '设备-配件', unit: '个', refPrice: '1000.00', qty: '20', total: '2000.00' },
];

function purchaseExecuteInput(placeholder = '请输入', width = 'w-full') {
  return `<input type="text" placeholder="${placeholder}" class="${width} min-w-[72px] rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200" />`;
}

function purchaseExecuteSelect(placeholder = '请选择') {
  return `<select class="min-w-[120px] rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"><option value="" disabled selected>${placeholder}</option><option>华建物资有限公司</option><option>鄂东办公用品</option></select>`;
}

function purchaseExecuteUpload(hint) {
  return `<div class="wms-upload-zone">
    <i class="fa-solid fa-cloud-arrow-up text-lg text-slate-400"></i>
    <p class="mt-2 text-sm text-slate-600">上传文件</p>
    <p class="mt-1 text-xs text-slate-400">${hint}</p>
  </div>`;
}

function purchaseExecuteApplyInfo(method) {
  return `<div class="md:col-span-2 wms-execute-apply-info overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm">
      <tbody>
        <tr>
          <td class="w-32 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">申请单号</td>
          <td class="px-4 py-2.5 text-slate-800">CG202510001</td>
          <td class="w-32 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">采购方式</td>
          <td class="px-4 py-2.5 text-slate-800">${method}</td>
        </tr>
        <tr class="border-t border-slate-200">
          <td class="bg-slate-50 px-4 py-2.5 font-medium text-slate-500">参考总额（元）</td>
          <td class="px-4 py-2.5 text-slate-800" colspan="3">100.00</td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

function purchaseExecuteQuoteNested(mode, colSpan) {
  const directExtra = mode === 'direct'
    ? `<th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">报价单</th>
       <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">是否中选</th>
       <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">中选说明</th>`
    : '';
  const directCells = mode === 'direct'
    ? `<td class="px-3 py-2 whitespace-nowrap"><button type="button" class="text-sm text-sky-600 hover:underline">上传</button></td>
       <td class="px-3 py-2 whitespace-nowrap">${purchaseExecuteSelect('请选择')}</td>
       <td class="px-3 py-2 whitespace-nowrap">${purchaseExecuteInput('请输入')}</td>`
    : '';
  const rowActions = mode === 'direct'
    ? ''
    : `<td class="px-3 py-2 text-right text-sm whitespace-nowrap"><a href="#" class="mr-2 text-sky-600 hover:underline">编辑</a><button type="button" class="text-rose-600 hover:underline">删除</button></td>`;
  const actionThCell = mode === 'direct' ? '' : actionTh('px-3 py-2');
  const quoteRows = [1, 2].map((n, i) => `<tr class="border-t border-slate-100">
      <td class="px-3 py-2 text-sm text-slate-600 whitespace-nowrap">${n}</td>
      <td class="px-3 py-2 whitespace-nowrap">${purchaseExecuteSelect()}</td>
      <td class="px-3 py-2 whitespace-nowrap">${purchaseExecuteInput()}</td>
      <td class="px-3 py-2 whitespace-nowrap">${purchaseExecuteInput()}</td>
      <td class="px-3 py-2 whitespace-nowrap">${purchaseExecuteInput()}</td>
      <td class="px-3 py-2 text-sm text-slate-700 whitespace-nowrap">100.00</td>
      <td class="px-3 py-2 whitespace-nowrap">${purchaseExecuteInput()}</td>
      ${directCells}
      ${rowActions}
    </tr>`).join('');
  return `<tr class="wms-execute-quote-nested-row bg-slate-50/50">
    <td colspan="${colSpan}" class="p-0">
      <div class="border-t border-slate-200 px-3 py-2">
        <table class="min-w-full text-sm wms-data-table wms-execute-quote-nested rounded-lg border border-slate-200 bg-white">
          <thead class="bg-slate-50/90">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">序号</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">供应商名称</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap"><span class="text-rose-500">*</span> 单价（元）</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">运费（元）</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">采购数量</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">小计金额（元）</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">交货周期（天）</th>
              ${directExtra}
              ${actionThCell}
            </tr>
          </thead>
          <tbody>${quoteRows}</tbody>
        </table>
      </div>
    </td>
  </tr>`;
}

function purchaseExecuteQuoteSection(mode) {
  const isDirect = mode === 'direct';
  const mainCols = isDirect
    ? ['序号', '物资编码', '物资名称', '规格型号', '物资大类', '物资子类', '计量单位', '参考单价（元）', '采购数量', '采购总额（元）']
    : ['序号', '物资编码', '物资名称', '规格型号', '物资大类', '物资子类', '计量单位'];
  const th = mainCols.map(c => `<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('')
    + (isDirect ? '' : actionTh('px-3 py-2.5'));
  const colSpan = mainCols.length + (isDirect ? 0 : 1);
  const tr = EXECUTE_MATERIAL_ROWS.map((r) => {
    const seq = `<span class="text-slate-400">${r.expanded ? '➖' : '➕'}</span> <span class="ml-1 text-slate-600">${r.seq}</span>`;
    const cells = [
      seq,
      `<span class="font-mono text-xs">${r.code}</span>`,
      r.name, r.spec, r.major, r.minor, r.unit,
    ];
    if (isDirect) {
      cells.push(r.refPrice, r.qty, r.total);
    }
    const dataCells = cells.map(c => `<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('');
    const actionCell = isDirect ? '' : actionTd('<a href="#" class="text-sky-600 hover:underline">报价</a>', 'px-3 py-2.5');
    const nested = r.expanded ? purchaseExecuteQuoteNested(mode, colSpan) : '';
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/60">${dataCells}${actionCell}</tr>${nested}`;
  }).join('');
  return `<div class="md:col-span-2 wms-execute-quote-section">
    <div class="wms-modal-table-wrap overflow-x-auto rounded-xl border border-slate-200">
      <table class="min-w-full text-sm wms-data-table"><thead class="bg-slate-50/90 sticky top-0"><tr>${th}</tr></thead><tbody>${tr}</tbody></table>
    </div>
  </div>`;
}

function purchaseExecuteFormPage(cfg) {
  const {
    title,
    method,
    quoteSectionTitle,
    mode,
    otherSectionTitle = '其他',
    backHref = 'purchase_execute_list.html',
  } = cfg;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const sheetLabel = mode === 'bid' ? '招标比价表' : '询价表';
  const sheetHint = '支持 .xls .xlsx，单个文件不能超过 100MB';
  const sheetBlock = mode === 'direct' ? '' : `
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">${sheetLabel}</label>${purchaseExecuteUpload(sheetHint)}</div>`;
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl">
      <div class="wms-modal-form wms-warehouse-form wms-execute-form">
        ${formSection('采购申请信息')}
        ${purchaseExecuteApplyInfo(method)}
        ${formSection(quoteSectionTitle)}
        ${purchaseExecuteQuoteSection(mode)}
        ${formSection('采购信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">采购单号</label><input type="text" value="系统自动生成" readonly class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">采购总价（元）</label><input type="text" class="${inputCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 发起日期</label><input type="date" class="${inputCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 截止日期</label><input type="date" class="${inputCls}" /></div>
        ${formSection(otherSectionTitle)}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">备注</label><textarea rows="4" placeholder="0/500" class="${inputCls}"></textarea></div>
        ${sheetBlock}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">附件</label>${purchaseExecuteUpload('支持 .rar .zip .doc .docx .pdf，单个文件不能超过 500MB')}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 提交人</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>张三</option><option>李四</option><option>王五</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 提交部门</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>采购部</option><option>设备部</option><option>工程部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-primary">确定</button>
      </div>
    </div>`;
}

function pendingReturnRowActions(returnKey, status) {
  const sample = RETURN_PENDING_SAMPLES[returnKey];
  const type = sample?.materialType || 'fixed';
  const formHref = returnFormPage(type);
  const confirmHref = `mine_return_confirm.html?returnKey=${encodeURIComponent(returnKey)}&back=mine_pending_return.html`;
  const q = (extra = {}) => new URLSearchParams({ returnKey, back: 'mine_pending_return.html', ...extra }).toString();
  if (status === '待确认') {
    return `<a href="${formHref}?${q({ mode: 'view' })}" class="mr-2 hover:underline">查看</a><a href="${confirmHref}" class="font-medium text-slate-900 hover:underline">确认</a>`;
  }
  if (status === '已归还' || status === '已作废') {
    return `<a href="${formHref}?${q({ mode: 'view' })}" class="hover:underline">查看</a>`;
  }
  return `<a href="${formHref}?${q({ mode: 'view' })}" class="mr-2 hover:underline">查看</a><a href="${formHref}?${q()}" class="hover:underline">归还</a>`;
}

function pendingReturnRow(cells, tab, returnKey, status = '待归还') {
  return { cells, tab, actions: pendingReturnRowActions(returnKey, status) };
}

const LIST_EMPTY = '<span class="text-slate-400">—</span>';

function pendingPickupRowActions(requisitionNo) {
  const viewQ = new URLSearchParams({ no: requisitionNo, back: 'mine_pending_pickup.html' });
  return `<a href="mine_requisition_record.html?${viewQ}" class="hover:underline">查看</a>`;
}

function pendingPickupRow(cells, tab, requisitionNo) {
  return { cells, tab, actions: pendingPickupRowActions(requisitionNo) };
}

const REQUISITION_RECORD_SAMPLES = {
  LY202510001: {
    no: 'LY202510001', name: '生产部备件领用', reason: '项目用料', plan: 'JH202509001 月度采购',
    status: '审核通过', applicant: '李四', dept: '生产部', applyTime: '2025-08-28',
    outboundNo: '—', outboundDate: '—', outboundQty: '—',
    materials: [
      { code: 'GD001001-001', name: '抓斗', spec: '455', unit: '个', qty: '5' },
      { code: 'GD001001-002', name: '料斗', spec: '455', unit: '个', qty: '10' },
    ],
  },
  LY202510002: {
    no: 'LY202510002', name: '设备部工具领用', reason: '设备维修', plan: '—',
    status: '审核通过', applicant: '李四', dept: '设备部', applyTime: '2025-08-30',
    outboundNo: 'LY202510002-CK001', outboundDate: '2025-09-03', outboundQty: '10',
    materials: [{ code: 'GD001001-003', name: '螺丝刀', spec: '455', unit: '个', qty: '10' }],
  },
  LY202510003: {
    no: 'LY202510003', name: '设备部工具领用', reason: '日常办公', plan: '—',
    status: '审核通过', applicant: '王五', dept: '设备部', applyTime: '2025-08-31',
    outboundNo: 'LY202510003-CK001', outboundDate: '2025-09-03', outboundQty: '5',
    materials: [{ code: 'GD001001-004', name: '扳手', spec: '455', unit: '个', qty: '5' }],
  },
  LY202510004: {
    no: 'LY202510004', name: '维保部钢丝绳领用', reason: '项目用料', plan: 'JH202509002 维保计划',
    status: '审核通过', applicant: '赵六', dept: '维保部', applyTime: '2025-09-01',
    outboundNo: 'LY202510004-CK001', outboundDate: '2025-09-03', outboundQty: '100',
    materials: [{ code: 'GD001001-005', name: '钢丝绳', spec: '455', unit: 'm', qty: '100' }],
  },
  LY202510005: {
    no: 'LY202510005', name: '设备部工具领用', reason: '应急领用', plan: '—',
    status: '审核通过', applicant: '李四', dept: '设备部', applyTime: '2025-07-18',
    outboundNo: 'LY202510005-CK001', outboundDate: '2025-07-20', outboundQty: '5',
    materials: [{ code: 'GD001001-006', name: '扳手', spec: '455', unit: '个', qty: '5' }],
  },
  LY202510006: {
    no: 'LY202510006', name: '设备部工具领用', reason: '日常办公', plan: '—',
    status: '审核通过', applicant: '王五', dept: '设备部', applyTime: '2025-07-12',
    outboundNo: 'LY202510006-CK001', outboundDate: '2025-07-15', outboundQty: '8',
    materials: [{ code: 'GD001001-007', name: '螺丝刀', spec: '455', unit: '个', qty: '8' }],
  },
};

function requisitionRecordModal(backHref, rec) {
  const statusKey = rec.status === '审核通过' ? 'success' : 'info';
  const materialRows = rec.materials.map((m, i) =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm text-slate-700">${i + 1}</td><td class="px-3 py-2.5 font-mono text-sm text-slate-800">${m.code}</td><td class="px-3 py-2.5 text-sm text-slate-800">${m.name}</td><td class="px-3 py-2.5 text-sm text-slate-700">${m.spec}</td><td class="px-3 py-2.5 text-sm text-slate-700">${m.unit}</td><td class="px-3 py-2.5 text-sm text-slate-800">${m.qty}</td></tr>`
  ).join('');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
      <div class="wms-requisition-record">
        <h4 class="mb-3 text-sm font-semibold text-slate-900">基础信息</h4>
        <dl class="grid gap-4 sm:grid-cols-2 text-sm mb-6">
          <div><dt class="text-slate-500">领用单号</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-req-field="no">${rec.no}</dd></div>
          <div><dt class="text-slate-500">审批状态</dt><dd class="mt-1" data-req-field="status">${badge(rec.status, statusKey)}</dd></div>
          <div><dt class="text-slate-500">申请名称</dt><dd class="mt-1 text-slate-900" data-req-field="name">${rec.name}</dd></div>
          <div><dt class="text-slate-500">申请事由</dt><dd class="mt-1 text-slate-800" data-req-field="reason">${rec.reason}</dd></div>
          <div><dt class="text-slate-500">关联计划单号</dt><dd class="mt-1 font-mono text-slate-800" data-req-field="plan">${rec.plan}</dd></div>
          <div><dt class="text-slate-500">申请时间</dt><dd class="mt-1 text-slate-800" data-req-field="applyTime">${rec.applyTime}</dd></div>
          <div><dt class="text-slate-500">申请人</dt><dd class="mt-1 text-slate-800" data-req-field="applicant">${rec.applicant}</dd></div>
          <div><dt class="text-slate-500">申请部门</dt><dd class="mt-1 text-slate-800" data-req-field="dept">${rec.dept}</dd></div>
        </dl>
        <h4 class="mb-3 text-sm font-semibold text-slate-900">领用明细</h4>
        <div class="mb-6 overflow-hidden rounded-xl border border-slate-200">
          <table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">序号</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">物资编码</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">物资名称</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">规格型号</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">计量单位</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">申请数量</th>
          </tr></thead><tbody data-req-materials>${materialRows}</tbody></table>
        </div>
        <h4 class="mb-3 text-sm font-semibold text-slate-900">出库信息</h4>
        <dl class="grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt class="text-slate-500">出库单号</dt><dd class="mt-1 font-mono text-slate-800" data-req-field="outboundNo">${rec.outboundNo}</dd></div>
          <div><dt class="text-slate-500">出库日期</dt><dd class="mt-1 text-slate-800" data-req-field="outboundDate">${rec.outboundDate}</dd></div>
          <div><dt class="text-slate-500">出库数量</dt><dd class="mt-1 text-slate-800" data-req-field="outboundQty">${rec.outboundQty}</dd></div>
        </dl>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a>
      </div>
    </div>`;
}

function purchaseMaterialTable(rows, { editable = true } = {}) {
  const cols = ['序号', '物资编码', '物资名称', '规格型号', '物资大类', '物资子类', '计量单位', '参考单价（元）', '计划数量', '采购数量', '说明', '操作'];
  const th = cols.map(c => c === '操作' ? actionTh('px-3 py-2.5') : `<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('');
  const input = (v, w = 'w-20') => `<input type="text" value="${v}" class="${w} rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200" />`;
  const tr = rows.map(r => {
    const cells = [
      r[0], r[1], r[2], r[3], r[4], r[5], r[6],
      editable ? input(r[7], 'w-24') : r[7],
      r[8],
      editable ? input(r[9], 'w-16') : r[9],
      editable ? input(r[10], 'w-24') : (r[10] || '—'),
      editable ? '<button type="button" class="text-sm text-slate-600 hover:text-rose-600 hover:underline">删除</button>' : '',
    ];
    const dataCells = cells.slice(0, -1).map(c => `<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('');
    const actCell = actionTd(cells[cells.length - 1], 'px-3 py-2.5');
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/60">${dataCells}${actCell}</tr>`;
  }).join('');
  return `<div class="wms-purchase-section md:col-span-2">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span class="text-sm font-semibold text-slate-900">采购明细</span>
      <a href="purchase_pending_select.html" class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-plus text-[10px]"></i> 添加</a>
    </div>
    <div class="wms-purchase-material-table wms-modal-table-wrap rounded-xl border border-slate-200">
      <table class="min-w-full text-sm wms-data-table"><thead class="bg-slate-50/90 sticky top-0"><tr>${th}</tr></thead><tbody>${tr}</tbody></table>
    </div>
  </div>`;
}

const REQUISITION_FORM_SAMPLE_ROWS = [
  { seq: 1, code: 'GD001001-001', name: '抓斗', spec: '4m³-Q345B', major: '资产-固定资产', minor: '设备-配件', unit: '个', available: '10', materialType: 'fixed', qty: '1', plannedDate: '2026-06-15', remark: '施工现场吊装用' },
  { seq: 2, code: 'LA-00456', name: '电钻', spec: '650W', major: '资产-类资产', minor: '电动工具', unit: '台', available: '6', materialType: 'like', qty: '3', plannedDate: '2026-06-12', remark: '设备部维修班组' },
  { seq: 3, code: 'HC-00089', name: '打印纸 A4', spec: 'A4/80g/500张', major: '耗材-办公耗材', minor: '办公用纸', unit: '箱', available: '170', materialType: 'consumable', qty: '50', plannedDate: '2026-06-10', remark: '行政部二季度补充' },
];

function requisitionQtyCell(row) {
  const inputCls = 'w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200';
  const roCls = 'w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-600';
  if (row.materialType === 'fixed') {
    return `<input type="number" value="1" readonly class="${roCls}" title="固定资产按件领用，数量为 1" data-requisition-qty data-material-type="fixed" /><span class="ml-1 text-[10px] text-slate-400">固定</span>`;
  }
  const placeholder = row.materialType === 'like' ? '请输入台数' : '请输入数量';
  return `<input type="number" min="1" max="${row.available}" value="${row.qty || ''}" placeholder="${placeholder}" class="${inputCls}" data-requisition-qty data-material-type="${row.materialType}" data-max-stock="${row.available}" />`;
}

function requisitionMaterialTable(rows = REQUISITION_FORM_SAMPLE_ROWS, { addHref = 'apply_requisition_add_material.html' } = {}) {
  const cols = ['序号', '物资编码', '物资名称', '规格型号', '物资大类', '物资子类', '计量单位', '可用库存数量', '申请领用数量', '计划领用日期', '备注', '操作'];
  const th = cols.map(c => {
    if (c === '操作') return '<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>';
    const req = c === '申请领用数量' ? '<span class="text-rose-500">*</span> ' : '';
    return `<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${req}${c}</th>`;
  }).join('');
  const dateCls = 'w-[132px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200';
  const remarkCls = 'w-[120px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200';
  const tr = rows.map(r => {
    const typeHint = r.materialType === 'fixed'
      ? '<span class="ml-1 text-[10px] text-slate-400">按件</span>'
      : r.materialType === 'like'
        ? '<span class="ml-1 text-[10px] text-amber-600">类资产</span>'
        : '<span class="ml-1 text-[10px] text-emerald-600">耗材</span>';
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/60" data-requisition-row data-material-type="${r.materialType}">
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.seq}</td>
      <td class="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">${r.code}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.name}${typeHint}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.spec}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.major}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.minor}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.unit}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.available}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${requisitionQtyCell(r)}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap"><input type="date" value="${r.plannedDate || ''}" class="${dateCls}" /></td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap"><input type="text" value="${r.remark || ''}" placeholder="备注" class="${remarkCls}" /></td>
      <td class="px-3 py-2.5 text-right text-sm whitespace-nowrap"><button type="button" class="text-sm text-rose-600 hover:underline">删除</button></td>
    </tr>`;
  }).join('');
  return `<div class="wms-requisition-section md:col-span-2">
    <h3 class="wms-form-section-title mb-3">申请物资</h3>
    <div class="rounded-xl border border-slate-200">
      <div class="flex justify-end border-b border-slate-100 bg-white px-3 py-2">
        <a href="${addHref}" class="wms-requisition-add-btn"><i class="fa-solid fa-plus text-[10px]"></i> 添加</a>
      </div>
      <div class="wms-requisition-table-wrap overflow-x-auto wms-modal-table-wrap rounded-none border-0">
        <table class="min-w-[1100px] w-full text-sm wms-requisition-material-table"><thead class="bg-slate-50/90"><tr>${th}</tr></thead><tbody>${tr}</tbody></table>
      </div>
      <p class="border-t border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-500">
        <i class="fa-solid fa-circle-info mr-1 text-sky-500"></i>
        <strong>固定资产</strong>按件领用，数量固定为 1；
        <strong>类资产、耗材</strong>须填写申请领用数量，且不得超过可用库存。
      </p>
    </div>
  </div>`;
}

function requisitionFormPage(backHref = 'apply_requisition_list.html') {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-requisition-form>
      <div class="wms-modal-form wms-warehouse-form wms-requisition-form">
        ${formSection('基础信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 申请单号</label><input type="text" value="系统自动生成" readonly class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 申请事由</label><select class="${inputCls}"><option value="" disabled>请选择</option><option selected>设备维修</option><option>日常办公</option><option>项目用料</option><option>应急领用</option></select></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 申请名称</label><input type="text" value="六月设备维修及办公耗材领用" class="${inputCls}" /></div>
        <div class="md:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">关联计划单号</label>
          <div class="flex flex-wrap gap-2">
            <select class="w-full shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:w-36"><option selected>物资计划</option><option>不关联</option></select>
            <select class="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"><option selected>月度采购（ID: JH202509001）</option><option>JH202606090001 六月办公物资计划</option></select>
          </div>
        </div>
        ${requisitionMaterialTable(REQUISITION_FORM_SAMPLE_ROWS)}
        ${formSection('其他')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">说明</label><textarea rows="4" placeholder="0/500" class="${inputCls}"></textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">凭证</label>${uploadZone()}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 申请人</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>张三</option><option>李四</option><option>王五</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 申请部门</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>设备部</option><option>工程部</option><option>采购部</option><option>行政部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-secondary">保存</button>
        <button type="button" class="wms-btn wms-btn-primary">发起审核</button>
      </div>
    </div>`;
}

const ACCEPTANCE_SUPPLY_SAMPLES = {
  GH2025001: { supplyNo: 'GH2025001', supplier: '科尼', supplierStatus: '正常', code: 'GD001001-001', name: '抓斗', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '10', pending: '0', supplied: '10', qualified: '10', unqualified: '0', accepted: '10' },
  GH2025002: { supplyNo: 'GH2025002', supplier: '上海佩纳', supplierStatus: '正常', code: 'GD001001-002', name: '料斗', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '10', pending: '0', supplied: '10', qualified: '10', unqualified: '0', accepted: '10' },
  GH2025003: { supplyNo: 'GH2025003', supplier: '河南蒲瑞', supplierStatus: '正常', code: 'GD001001-003', name: '钢丝绳', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: 'm', required: '100', pending: '50', supplied: '50', qualified: '50', unqualified: '0', accepted: '50' },
  GH2025004: { supplyNo: 'GH2025004', supplier: '江苏华能电子有限公司', supplierStatus: '正常', code: 'GD001001-004', name: '螺丝刀', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '20', pending: '10', supplied: '10', qualified: '9', unqualified: '1', accepted: '10' },
  GH2025005: { supplyNo: 'GH2025005', supplier: '宁波北仑君威有限公司', supplierStatus: '正常', code: 'GD001001-005', name: '扳手', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '20', pending: '20', supplied: '0', qualified: '0', unqualified: '0', accepted: '0' },
};

const ACCEPTANCE_RECORDS_BY_SUPPLY = {
  GH2025001: [{ no: 'GH2025001-YS01', batchNo: '1', batchQty: '10', qualified: '10', unqualified: '0', date: '2025-11-15', warehouse: '张仓管', planner: '王工', status: '审核通过' }],
  GH2025002: [{ no: 'GH2025002-YS01', batchNo: '1', batchQty: '10', qualified: '10', unqualified: '0', date: '2025-11-16', warehouse: '李仓管', planner: '赵工', status: '审核通过' }],
  GH2025003: [{ no: 'GH2025003-YS01', batchNo: '1', batchQty: '50', qualified: '50', unqualified: '0', date: '2025-11-20', warehouse: '张仓管', planner: '王工', status: '审核中' }],
  GH2025004: [
    { no: 'GH2025004-YS01', batchNo: '1', batchQty: '10', qualified: '9', unqualified: '1', date: '2025-11-22', warehouse: '张仓管', planner: '王工', status: '审核通过', disposition: '换货' },
    { no: 'GH2025004-YS02', batchNo: '2', batchQty: '10', qualified: '9', unqualified: '1', date: '2025-11-25', warehouse: '李仓管', planner: '赵工', status: '审核通过', disposition: '退货', refundKey: 'GH2025004-YS02-TH' },
  ],
  GH2025005: [],
};

function aggregateAcceptanceRecords(records = []) {
  return records.reduce((acc, r) => {
    acc.accepted += Number(r.batchQty) || 0;
    acc.qualified += Number(r.qualified) || 0;
    acc.unqualified += Number(r.unqualified) || 0;
    return acc;
  }, { accepted: 0, qualified: 0, unqualified: 0 });
}

function acceptanceDetailRecordRowHtml(seq, record, supplyNo, detailBack) {
  const statusTone = record.status === '审核通过' ? 'success' : 'warning';
  const recordDetailBack = encodeURIComponent(`warehouse_acceptance_detail.html?no=${supplyNo}&back=${detailBack}`);
  const dispositionHint = record.disposition && record.disposition !== '—'
    ? `<span class="ml-1 text-xs text-slate-400">(${record.disposition})</span>`
    : '';
  return `<tr class="border-t border-slate-100 hover:bg-slate-50/80">
    <td class="px-3 py-2.5 text-sm text-slate-700">${seq}</td>
    <td class="px-3 py-2.5 font-mono text-xs text-slate-800">${record.no}</td>
    <td class="px-3 py-2.5 text-sm text-slate-700">${record.batchNo || seq}</td>
    <td class="px-3 py-2.5 text-sm font-medium text-slate-900">${record.batchQty}</td>
    <td class="px-3 py-2.5 text-sm text-emerald-700">${record.qualified}</td>
    <td class="px-3 py-2.5 text-sm text-slate-700">${record.unqualified}${dispositionHint}</td>
    <td class="px-3 py-2.5 text-sm text-slate-600">${record.date}</td>
    <td class="px-3 py-2.5 text-sm text-slate-700">${record.warehouse}</td>
    <td class="px-3 py-2.5 text-sm text-slate-700">${record.planner}</td>
    <td class="px-3 py-2.5 text-sm">${badge(record.status, statusTone)}</td>
    <td class="px-3 py-2.5 text-right text-sm whitespace-nowrap"><a href="warehouse_acceptance_record_detail.html?no=${record.no}&back=${recordDetailBack}" class="hover:underline">查看</a></td>
  </tr>`;
}

function acceptanceDetailRecordsTable(supplyNo, backHref) {
  const records = ACCEPTANCE_RECORDS_BY_SUPPLY[supplyNo] || [];
  const detailBack = encodeURIComponent(backHref);
  const thCls = 'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap';
  const cols = ['序号', '验收单号', '批次', '本批次数量', '合格', '不合格', '验收日期', '仓库验收', '计划验收', '业务状态', '操作'];
  const th = cols.map(c => `<th class="${thCls}">${c}</th>`).join('');
  const tr = records.length
    ? records.map((r, i) => acceptanceDetailRecordRowHtml(i + 1, r, supplyNo, detailBack)).join('')
    : `<tr><td colspan="${cols.length}" class="px-4 py-10 text-center text-sm text-slate-400">暂无验货记录</td></tr>`;
  return `<div class="md:col-span-2 overflow-hidden rounded-xl border border-slate-200">
    <div class="overflow-x-auto wms-modal-table-wrap"><table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody data-accept-detail-records-tbody>${tr}</tbody></table></div>
  </div>`;
}

function purchaseSupplyInfoGrid(sample = {}) {
  const d = {
    supplyNo: 'GH2025003',
    supplier: '河南蒲瑞',
    code: 'GD001001-003',
    name: '钢丝绳',
    required: '100',
    supplied: '50',
    qualified: '50',
    unqualified: '0',
    returned: '0',
    pending: '50',
    ...sample,
  };
  const pair = (label, key, value) =>
    `<td class="w-[18%] bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">${label}</td><td class="px-4 py-2.5 text-sm text-slate-800" data-supply-field="${key}">${value}</td>`;
  const row = (left, right, border = true) =>
    `<tr${border ? ' class="border-t border-slate-200"' : ''}>${pair(left[0], left[1], left[2])}${pair(right[0], right[1], right[2])}</tr>`;
  return `<div class="md:col-span-2 wms-supply-info-grid overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm"><tbody>
      ${row(['物资供货单号', 'supplyNo', d.supplyNo], ['供应商名称', 'supplier', d.supplier], false)}
      ${row(['物资编码', 'code', d.code], ['物资名称', 'name', d.name])}
      ${row(['需求数量', 'required', d.required], ['已供货数量', 'supplied', d.supplied])}
      ${row(['合格数量', 'qualified', d.qualified], ['不合格数量', 'unqualified', d.unqualified])}
      ${row(['退货数量', 'returned', d.returned], ['待供货数量', 'pending', d.pending])}
    </tbody></table>
  </div>`;
}

function purchaseSupplyCompletePage(backHref = 'purchase_supply_list.html', sample = {}) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const d = { ...ACCEPTANCE_SUPPLY_SAMPLES.GH2025003, returned: '0', ...sample };
  const gridSample = {
    supplyNo: d.supplyNo,
    supplier: d.supplier,
    code: d.code,
    name: d.name,
    required: d.required,
    supplied: d.supplied,
    qualified: d.qualified,
    unqualified: d.unqualified,
    returned: d.returned || '0',
    pending: d.pending,
  };
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg" data-wms-supply-complete>
      <p class="mb-4 hidden rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800" data-supply-from-hint>
        <i class="fa-solid fa-circle-info mr-1.5"></i>从物资验收进入 · 提交后将同步关闭验收待办，并返回物资验收列表
      </p>
      <div class="wms-modal-form wms-warehouse-form wms-supply-complete-form">
        ${formSection('供货信息')}
        ${purchaseSupplyInfoGrid(gridSample)}
        ${formSection('其他信息')}
        <p class="md:col-span-2 text-sm text-slate-500">一些特殊情况，无法完成供货，给予相应的订单终结</p>
        <div class="md:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 完成供货</label>
          <div class="flex flex-wrap gap-4 pt-1">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="supplyComplete" class="border-slate-300 text-slate-900" value="是" /><span>是</span></label>
            <label class="inline-flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="supplyComplete" class="border-slate-300 text-slate-900" value="否" checked /><span>否</span></label>
          </div>
        </div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 说明</label><textarea rows="4" placeholder="0/500" data-supply-complete-remark class="${inputCls}"></textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">附件</label>${uploadZone()}</div>
      </div>
      <p class="mt-4 text-xs text-slate-400" data-supply-complete-hint>提交后将更新供货状态，并引导至物资验收列表</p>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-supply-back-link>取消</a>
        <button type="button" class="wms-btn wms-btn-primary" data-supply-complete-submit>确定</button>
      </div>
    </div>`;
}

function acceptanceStatusBadge(status) {
  const map = { '待验收': 'warning', '验收中': 'info', '已验收': 'success' };
  return badge(status, map[status] || 'info');
}

function acceptanceProgressCell(accepted, required) {
  const a = Number(accepted) || 0;
  const r = Number(required) || 1;
  const pct = Math.min(100, Math.round((a / r) * 100));
  const barCls = pct >= 100 ? 'bg-emerald-500' : 'bg-sky-500';
  return `<div class="min-w-[92px]"><div class="mb-1 flex justify-between text-xs text-slate-500"><span>${a}/${r}</span><span>${pct}%</span></div><div class="h-1.5 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full ${barCls}" style="width:${pct}%"></div></div></div>`;
}

function supplyStatusBadge(status) {
  const map = { '待供货': 'info', '供货中': 'warning', '已供货': 'success' };
  return badge(status, map[status] || 'info');
}

function supplyOverdueBadge(dueDate) {
  const due = new Date(dueDate);
  const now = new Date('2026-06-09');
  if (due >= now) return '';
  return `<span class="ml-1 inline-flex rounded-lg bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">逾期</span>`;
}

function supplyRowActions(supplyNo, status) {
  const q = (extra = {}) => {
    const p = new URLSearchParams({ no: supplyNo, back: 'purchase_supply_list.html', ...extra });
    return p.toString();
  };
  const view = `<a href="#" class="mr-2 hover:underline">查看</a>`;
  if (status === '已供货') return view;
  return `${view}<a href="purchase_supply_complete.html?${q()}" class="hover:underline">完成供货</a>`;
}

function supplyRow(cells, status, supplyNo) {
  return { cells, tab: status, actions: supplyRowActions(supplyNo, status) };
}

function acceptanceRowActions(supplyNo, status) {
  const q = (extra = {}) => {
    const p = new URLSearchParams({ no: supplyNo, back: 'warehouse_acceptance_list.html', ...extra });
    return p.toString();
  };
  const view = `<a href="warehouse_acceptance_detail.html?${q()}" class="mr-2 hover:underline">查看</a>`;
  if (status === '已验收') return view;
  return `${view}<a href="warehouse_acceptance_form.html?${q()}" class="mr-2 hover:underline">验收</a><a href="warehouse_acceptance_record.html?${q()}" class="mr-2 hover:underline">验收记录</a><a href="purchase_supply_complete.html?${q({ from: 'acceptance' })}" class="hover:underline">完成供货</a>`;
}

function acceptanceRow(cells, status, supplyNo) {
  return { cells, tab: status, actions: acceptanceRowActions(supplyNo, status) };
}

function acceptanceSupplyHeaderGrid(sample = {}) {
  const d = { ...ACCEPTANCE_SUPPLY_SAMPLES.GH2025001, ...sample };
  const pair = (label, key, value) =>
    `<td class="w-[18%] bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">${label}</td><td class="px-4 py-2.5 text-sm text-slate-800" data-accept-field="${key}">${value}</td>`;
  const row = (left, right, border = true) =>
    `<tr${border ? ' class="border-t border-slate-200"' : ''}>${pair(left[0], left[1], left[2])}${pair(right[0], right[1], right[2])}</tr>`;
  return `<div class="md:col-span-2 wms-supply-info-grid overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm"><tbody>
      ${row(['物资供货单号', 'supplyNo', d.supplyNo], ['供应商名称', 'supplier', d.supplier], false)}
      ${row(['物资编码', 'code', d.code], ['物资名称', 'name', d.name])}
      ${row(['物资大类', 'major', d.major], ['物资子类', 'minor', d.minor])}
      ${row(['规格型号', 'spec', d.spec], ['计量单位', 'unit', d.unit])}
      ${row(['需求数量', 'required', d.required], ['待供货数量', 'pending', d.pending])}
      ${row(['已供货数量', 'supplied', d.supplied], ['供应商状态', 'supplierStatus', badge(d.supplierStatus, 'success')])}
    </tbody></table>
  </div>`;
}

function acceptanceListCells(seq, supplyNo, supplier, code, name, spec, major, minor, unit, required, accepted, qualified, unqualified, status) {
  return [seq, supplyNo, supplier, code, name, spec, major, minor, unit, required, accepted, qualified, unqualified, acceptanceProgressCell(accepted, required), acceptanceStatusBadge(status)];
}

function acceptanceDetailPage(backHref = 'warehouse_acceptance_list.html', sample = {}) {
  const d = { ...ACCEPTANCE_SUPPLY_SAMPLES.GH2025001, ...sample };
  const records = ACCEPTANCE_RECORDS_BY_SUPPLY[d.supplyNo] || [];
  const agg = aggregateAcceptanceRecords(records);
  const accepted = String(agg.accepted || d.accepted);
  const qualified = String(agg.qualified || d.qualified);
  const unqualified = String(agg.unqualified || d.unqualified);
  const recordListHref = `warehouse_acceptance_record.html?no=${d.supplyNo}&back=${encodeURIComponent(backHref)}`;
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-acceptance-supply data-wms-acceptance-detail data-accept-supply-no="${d.supplyNo}">
      <div class="wms-acceptance-detail">
        ${formSection('供货信息')}
        ${acceptanceSupplyHeaderGrid(d)}
        ${formSection('验收进度')}
        <p class="md:col-span-2 text-xs text-slate-400">由验货记录自动汇总</p>
        <div class="md:col-span-2 mb-2" data-accept-progress-bar>${acceptanceProgressCell(accepted, d.required)}</div>
        <dl class="grid gap-4 sm:grid-cols-2 text-sm md:col-span-2">
          <div><dt class="text-slate-500">需求数量</dt><dd class="mt-1 text-slate-800" data-accept-field="required">${d.required}</dd></div>
          <div><dt class="text-slate-500">已验收数量</dt><dd class="mt-1 text-slate-800" data-accept-field="accepted">${accepted}</dd></div>
          <div><dt class="text-slate-500">合格数量</dt><dd class="mt-1 text-slate-800" data-accept-field="qualified">${qualified}</dd></div>
          <div><dt class="text-slate-500">不合格数量</dt><dd class="mt-1 text-slate-800" data-accept-field="unqualified">${unqualified}</dd></div>
        </dl>
        <div class="wms-form-section md:col-span-2 flex flex-wrap items-center justify-between gap-2">
          <h3 class="wms-form-section-title mb-0">验货记录</h3>
          <a href="${recordListHref}" data-accept-all-records-link class="text-xs font-medium text-slate-600 hover:underline">全部记录 →</a>
        </div>
        <p class="md:col-span-2 text-sm text-slate-500">共 <span data-accept-record-count>${records.length}</span> 条，按验收日期降序</p>
        ${acceptanceDetailRecordsTable(d.supplyNo, backHref)}
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a>
      </div>
    </div>`;
}

function acceptanceFormPage(backHref = 'warehouse_acceptance_list.html', sample = {}) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const d = { ...ACCEPTANCE_SUPPLY_SAMPLES.GH2025001, ...sample };
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-acceptance-supply data-wms-acceptance-form>
      <div class="wms-modal-form wms-warehouse-form wms-acceptance-form">
        ${formSection('供货信息')}
        ${acceptanceSupplyHeaderGrid(d)}
        <div class="md:col-span-2 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
          <div class="mb-2 text-xs font-medium text-sky-800">验收进度（已验 / 需求）</div>
          ${acceptanceProgressCell(d.accepted, d.required)}
        </div>
        ${formSection('验收信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">验收单号</label><input type="text" value="${d.supplyNo}-YS01" readonly data-accept-field="recordNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 批次单号</label><input type="text" value="1" class="${inputCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 本批次供货数量</label><input type="number" placeholder="请输入" class="${inputCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 验收日期</label><input type="date" value="2025-11-29" class="${inputCls}" /></div>
        <div class="md:col-span-2 flex flex-wrap items-end gap-3">
          <div class="min-w-[200px] flex-1"><label class="mb-1.5 block text-sm font-medium text-slate-700">验收标准</label><input type="text" value="设备-配件验收标准" readonly class="${roCls}" /></div>
          <a href="config_acceptance_standard.html" class="mb-0.5 inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">查看</a>
        </div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 仓库验收人员</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>张仓管</option><option>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 计划验收人员</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>王工</option><option>赵工</option></select></div>
        ${formSection('合格物资')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 本批次合格数量</label><input type="number" placeholder="请输入" class="${inputCls}" /></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">附件</label>${uploadZone()}</div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">照片</label>${photoUploadZone()}</div>
        ${formSection('不合格物资')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">本批次不合格数量</label><input type="number" value="0" data-accept-unqualified-qty class="${inputCls}" /></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">不合格说明</label><textarea rows="3" placeholder="0/500" class="${inputCls}"></textarea></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">处理方式</label><select data-accept-disposition class="${inputCls}"><option value="" disabled selected>请选择</option><option value="退货">退货</option><option value="换货">换货</option><option value="让步接收">让步接收</option></select></div>
        <div class="md:col-span-2 hidden rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-sm text-slate-700" data-accept-refund-hint>
          <i class="fa-solid fa-circle-info mr-1 text-orange-500"></i>处理方式为「退货」时，验收记录通过后将自动生成退货待办，可在<a href="warehouse_refund_list.html" class="font-medium text-slate-900 hover:underline">物资退货</a>执行。
        </div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">处理截止日期</label><input type="date" class="${inputCls}" /></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">附件</label>${uploadZone()}</div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">照片</label>${photoUploadZone()}</div>
        ${formSection('其他')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 提交人</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>张仓管</option><option>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 提交部门</label><select class="${inputCls}"><option value="" disabled selected>请选择</option><option>物资管理部</option><option>设备部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-secondary">保存</button>
        <button type="button" class="wms-btn wms-btn-primary">确定</button>
      </div>
    </div>`;
}

function acceptanceRecordRefundLink(recordNo) {
  const refundKey = REFUND_BY_ACCEPT[recordNo];
  if (!refundKey || !REFUND_PENDING_SAMPLES[refundKey]) return '';
  const formHref = refundFormPage(refundKey);
  return `<a href="${formHref}?${new URLSearchParams({ refundKey, back: 'warehouse_refund_list.html' })}" class="ml-2 text-rose-600 hover:underline">发起退货</a>`;
}

function acceptanceRecordRow(cells, actions) {
  return { cells, actions };
}

function acceptanceRecordInboundLink(recordNo) {
  if (!INBOUND_ACCEPT_SAMPLES[recordNo]) return '';
  const sample = INBOUND_ACCEPT_SAMPLES[recordNo];
  if (sample.status === '已入库') return '';
  const formHref = inboundFormPage(sample.materialType);
  const q = new URLSearchParams({ acceptNo: recordNo, back: 'warehouse_inbound_list.html' });
  return `<a href="${formHref}?${q}" class="ml-2 font-medium text-emerald-700 hover:underline">去入库</a>`;
}

function acceptanceRecordPage(backHref = 'warehouse_acceptance_list.html', supplyNo = 'GH2025003') {
  const d = ACCEPTANCE_SUPPLY_SAMPLES[supplyNo] || ACCEPTANCE_SUPPLY_SAMPLES.GH2025003;
  const columns = ['序号', '验收单号', '本批次供货数量', '合格数量', '不合格数量', '物资供货单号', '供应商名称', '验收日期', '仓库验收人员', '计划验收人员', '业务状态'];
  const recordBack = encodeURIComponent(`warehouse_acceptance_record.html?no=${supplyNo}&back=${encodeURIComponent(backHref)}`);
  const row = (seq, no, batch, qual, unqual, date, wh, pl, status, actions) =>
    acceptanceRecordRow([seq, no, batch, qual, unqual, supplyNo, d.supplier, date, wh, pl, badge(status, status === '审核通过' ? 'success' : 'warning')], actions);
  let rows = [];
  if (supplyNo === 'GH2025005') {
    rows = [];
  } else if (supplyNo === 'GH2025004') {
    rows = [
      row('1', 'GH2025004-YS01', '10', '9', '1', '2025-11-22', '张仓管', '王工', '审核通过', `<a href="warehouse_acceptance_record_detail.html?no=GH2025004-YS01&back=${recordBack}" class="hover:underline">查看</a>`),
      row('2', 'GH2025004-YS02', '10', '9', '1', '2025-11-25', '李仓管', '赵工', '审核通过', `<a href="warehouse_acceptance_record_detail.html?no=GH2025004-YS02&back=${recordBack}" class="mr-2 hover:underline">查看</a>${acceptanceRecordRefundLink('GH2025004-YS02')}${acceptanceRecordInboundLink('GH2025004-YS01')}`),
    ];
  } else if (supplyNo === 'GH2025001') {
    rows = [
      row('1', 'GH2025001-YS01', '10', '10', '0', '2025-11-15', '张仓管', '王工', '审核通过', `<a href="warehouse_acceptance_record_detail.html?no=GH2025001-YS01&back=${recordBack}" class="mr-2 hover:underline">查看</a>${acceptanceRecordInboundLink('GH2025001-YS01')}`),
    ];
  } else if (supplyNo === 'GH2025003') {
    rows = [
      row('1', 'GH2025003-YS01', '50', '50', '0', '2025-11-20', '张仓管', '王工', '审核中', `<a href="warehouse_acceptance_record_detail.html?no=GH2025003-YS01&back=${recordBack}" class="hover:underline">查看</a>`),
    ];
  } else {
    rows = [
      row('1', `${supplyNo}-YS01`, '10', '10', '0', '2025-11-20', '张仓管', '王工', '审核中', `<a href="warehouse_acceptance_record_detail.html?no=${supplyNo}-YS01&back=${recordBack}" class="hover:underline">查看</a>`),
    ];
  }
  const th = columns.map(c => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('') + actionTh('px-4 py-3');
  const tr = rows.map(r => {
    const search = r.cells.map(stripCellText).join(' ').toLowerCase();
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-search="${search}">${r.cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}${actionTd(r.actions, 'px-4 py-3.5 text-slate-900')}</tr>`;
  }).join('');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-acceptance-record data-accept-supply-no="${supplyNo}">
      <p class="mb-4 text-sm text-slate-500">供货单 <span class="font-mono font-medium text-slate-800" data-accept-field="supplyNo">${supplyNo}</span> 的验收记录，按添加时间降序</p>
      <div class="card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto wms-modal-table-wrap"><table class="min-w-full wms-data-table"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody data-accept-records-tbody>${tr || `<tr><td colspan="${columns.length + 1}" class="px-4 py-12 text-center text-sm text-slate-400">暂无验收记录</td></tr>`}</tbody></table></div>
      </div>
      <div class="wms-modal-footer mt-4">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a>
        <a href="warehouse_acceptance_form.html?no=${supplyNo}&back=${encodeURIComponent(backHref)}" class="wms-btn wms-btn-primary">新增验收</a>
      </div>
    </div>`;
}

const ACCEPTANCE_RECORD_DETAIL_SAMPLES = {
  'GH2025003-YS01': { no: 'GH2025003-YS01', batchNo: '1', batchQty: '50', qualified: '50', unqualified: '0', date: '2025-11-20', warehouse: '张仓管', planner: '王工', unqualifiedRemark: '—', disposition: '—', status: '审核中', refundKey: '' },
  'GH2025004-YS02': { no: 'GH2025004-YS02', batchNo: '2', batchQty: '10', qualified: '9', unqualified: '1', date: '2025-11-25', warehouse: '李仓管', planner: '赵工', unqualifiedRemark: '刀头断裂，无法使用', disposition: '退货', status: '审核通过', refundKey: 'GH2025004-YS02-TH' },
};

function acceptanceRecordDetailPage(backHref = 'warehouse_acceptance_record.html', recordNo = 'GH2025003-YS01') {
  const d = ACCEPTANCE_RECORD_DETAIL_SAMPLES[recordNo] || ACCEPTANCE_RECORD_DETAIL_SAMPLES['GH2025003-YS01'];
  const inputCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600';
  const refundKey = d.refundKey || REFUND_BY_ACCEPT[recordNo] || '';
  const refundHref = refundKey ? `${refundFormPage(refundKey)}?${new URLSearchParams({ refundKey, back: 'warehouse_refund_list.html' })}` : '';
  const inboundBtn = d.status === '审核通过' && INBOUND_ACCEPT_SAMPLES[recordNo] && INBOUND_ACCEPT_SAMPLES[recordNo].status !== '已入库'
    ? `<a href="${inboundFormPage(INBOUND_ACCEPT_SAMPLES[recordNo].materialType)}?${new URLSearchParams({ acceptNo: recordNo, back: 'warehouse_inbound_list.html' })}" class="wms-btn wms-btn-primary">去入库</a>`
    : '';
  const refundBtn = refundHref ? `<a href="${refundHref}" class="wms-btn wms-btn-secondary">发起退货</a>` : '';
  const dispositionBlock = Number(d.unqualified) > 0 ? `
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">处理方式</label><input type="text" value="${d.disposition || '—'}" readonly class="${inputCls}" data-accept-record-field="disposition" /></div>
        ${d.disposition === '退货' && refundKey ? `<div class="md:col-span-2 rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-xs text-slate-600">审核通过后已生成退货待办 <span class="font-mono font-medium">${refundKey}</span>，可在<a href="warehouse_refund_list.html" class="font-medium text-slate-900 hover:underline">物资退货</a>列表执行。</div>` : ''}` : '';
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg" data-wms-acceptance-record-detail data-accept-record-no="${recordNo}">
      <div class="wms-modal-form wms-acceptance-record-detail">
        ${formSection('验收信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">验收单号</label><input type="text" value="${d.no}" readonly class="${inputCls}" data-accept-record-field="no" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">批次单号</label><input type="text" value="${d.batchNo}" readonly class="${inputCls}" data-accept-record-field="batchNo" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">本批次供货数量</label><input type="text" value="${d.batchQty}" readonly class="${inputCls}" data-accept-record-field="batchQty" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">验收日期</label><input type="text" value="${d.date}" readonly class="${inputCls}" data-accept-record-field="date" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">仓库验收人员</label><input type="text" value="${d.warehouse}" readonly class="${inputCls}" data-accept-record-field="warehouse" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">计划验收人员</label><input type="text" value="${d.planner}" readonly class="${inputCls}" data-accept-record-field="planner" /></div>
        ${formSection('合格物资')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">本批次合格数量</label><input type="text" value="${d.qualified}" readonly class="${inputCls}" data-accept-record-field="qualified" /></div>
        ${formSection('不合格物资')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">本批次不合格数量</label><input type="text" value="${d.unqualified}" readonly class="${inputCls}" data-accept-record-field="unqualified" /></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">不合格说明</label><textarea rows="2" readonly class="${inputCls}" data-accept-record-field="unqualifiedRemark">${d.unqualifiedRemark || '—'}</textarea></div>
        ${dispositionBlock}
      </div>
      ${d.status === '审核通过' && INBOUND_ACCEPT_SAMPLES[recordNo] ? `<div class="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-slate-600">验收记录已通过，合格数量 <strong>${d.qualified}</strong> 可入库。${INBOUND_ACCEPT_SAMPLES[recordNo].status === '已入库' ? '该批次已全部入库。' : '请前往物资入库执行入库操作。'}</div>` : ''}
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a>
        ${refundBtn}
        ${inboundBtn}
      </div>
    </div>`;
}

const INBOUND_ACCEPT_SAMPLES = {
  'GH2025001-YS01': {
    acceptNo: 'GH2025001-YS01', supplyNo: 'GH2025001', acceptDate: '2025-11-15',
    supplier: '科尼', supplierStatus: '正常', contact: '李四', phone: '139 1234 5678',
    code: 'GD001001-001', name: '抓斗', major: '资产-固定资产', minor: '设备-配件',
    spec: '4m³-Q345B', unit: '个', qualified: '10', inboundQty: '0', pendingQty: '10',
    materialType: 'fixed', inboundNo: '', inboundDate: '', status: '待入库',
    operator: '张仓管', department: '物资管理部', remark: '', locations: [],
  },
  'GH2025003-YS01': {
    acceptNo: 'GH2025003-YS01', supplyNo: 'GH2025003', acceptDate: '2025-11-20',
    supplier: '河南蒲瑞', supplierStatus: '正常', contact: '李经理', phone: '138 0000 1234',
    code: 'LA-00456', name: '钢丝绳', major: '资产-类资产', minor: '防汛设备',
    spec: 'Φ18×100m', unit: 'm', qualified: '50', inboundQty: '30', pendingQty: '20',
    materialType: 'like', inboundNo: '', inboundDate: '', status: '部分入库',
    operator: '', department: '', remark: '', locations: [],
  },
  'GH2025004-YS01': {
    acceptNo: 'GH2025004-YS01', supplyNo: 'GH2025004', acceptDate: '2025-11-22',
    supplier: '江苏华能电子有限公司', supplierStatus: '正常', contact: '王工', phone: '139 1111 2233',
    code: 'LA-00456', name: '电钻', major: '资产-类资产', minor: '电动工具',
    spec: '650W', unit: '台', qualified: '9', inboundQty: '0', pendingQty: '9',
    materialType: 'like', inboundNo: '', inboundDate: '', status: '待入库',
    operator: '', department: '', remark: '', locations: [],
  },
  'GH2025006-YS01': {
    acceptNo: 'GH2025006-YS01', supplyNo: 'GH2025006', acceptDate: '2025-11-25',
    supplier: '鄂东办公用品', supplierStatus: '正常', contact: '陈经理', phone: '137 6666 7788',
    code: 'HC-00089', name: '打印纸 A4', major: '耗材-办公耗材', minor: '办公用纸',
    spec: 'A4/80g/500张', unit: '箱', qualified: '200', inboundQty: '0', pendingQty: '200',
    materialType: 'consumable', inboundNo: '', inboundDate: '', status: '待入库',
    operator: '', department: '', remark: '', locations: [],
  },
  'GH2025002-YS01': {
    acceptNo: 'GH2025002-YS01', supplyNo: 'GH2025002', acceptDate: '2025-11-16',
    supplier: '鄂东办公用品', supplierStatus: '正常', contact: '陈经理', phone: '137 6666 7788',
    code: 'HC-00128', name: '安全帽', major: '耗材-劳保耗材', minor: '安全防护',
    spec: '标准型', unit: '顶', qualified: '200', inboundQty: '200', pendingQty: '0',
    materialType: 'consumable', inboundNo: 'RK202509002', inboundDate: '2025-11-18', status: '已入库',
    operator: '李仓管', department: '物资管理部', remark: '首批入库完成',
    locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '200' }],
  },
};

const INBOUND_FORM_PAGES = {
  fixed: 'warehouse_inbound_fixed_form.html',
  like: 'warehouse_inbound_like_form.html',
  consumable: 'warehouse_inbound_consumable_form.html',
};

function inboundFormPage(materialType) {
  return INBOUND_FORM_PAGES[materialType] || 'warehouse_inbound_form.html';
}

function inboundStatusBadge(status) {
  const map = { '待入库': 'warning', '部分入库': 'info', '已入库': 'success' };
  return badge(status, map[status] || 'info');
}

function inboundRefundHref(acceptNo) {
  const refundKey = REFUND_BY_ACCEPT[acceptNo];
  if (!refundKey || !REFUND_PENDING_SAMPLES[refundKey]) return '';
  const formHref = refundFormPage(refundKey);
  return `${formHref}?${new URLSearchParams({ refundKey, back: 'warehouse_inbound_list.html' })}`;
}

function inboundRowActions(acceptNo, status) {
  const sample = INBOUND_ACCEPT_SAMPLES[acceptNo];
  const type = sample?.materialType || 'fixed';
  const formHref = inboundFormPage(type);
  const q = (extra = {}) => {
    const p = new URLSearchParams({ acceptNo, back: 'warehouse_inbound_list.html', ...extra });
    return p.toString();
  };
  if (status === '已入库') {
    const refundHref = inboundRefundHref(acceptNo);
    const refundLink = refundHref ? `<a href="${refundHref}" class="ml-2 text-rose-600 hover:underline">退供应商</a>` : '';
    return `<a href="${formHref}?${q({ mode: 'view' })}" class="hover:underline">查看</a>${refundLink}`;
  }
  return `<a href="${formHref}?${q({ mode: 'view' })}" class="mr-2 hover:underline">查看</a><a href="${formHref}?${q()}" class="hover:underline">入库</a>`;
}

function inboundRow(cells, status, acceptNo) {
  const tab = status === '已入库' ? '已入库' : '待入库';
  return { cells, tab: tab, actions: inboundRowActions(acceptNo, status === '已入库' ? '已入库' : status) };
}

function inboundReadonlyGrid(pairs) {
  const pair = (label, key, value) =>
    `<td class="w-[18%] bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">${label}</td><td class="px-4 py-2.5 text-sm text-slate-800" data-inbound-field="${key}">${value}</td>`;
  const row = (left, right, border = true) =>
    `<tr${border ? ' class="border-t border-slate-200"' : ''}>${pair(left[0], left[1], left[2])}${pair(right[0], right[1], right[2])}</tr>`;
  const rows = pairs.map((p, i) => row(p[0], p[1], i > 0)).join('');
  return `<div class="md:col-span-2 overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm"><tbody>${rows}</tbody></table>
  </div>`;
}

function inboundSupplierGrid(d) {
  return inboundReadonlyGrid([
    [['供应商名称', 'supplier', d.supplier], ['供应商状态', 'supplierStatus', badge(d.supplierStatus, 'success')]],
    [['联系人', 'contact', d.contact], ['联系电话', 'phone', d.phone]],
  ]);
}

function inboundAcceptGrid(d) {
  return inboundReadonlyGrid([
    [['验收单号', 'acceptNo', d.acceptNo], ['验收日期', 'acceptDate', d.acceptDate]],
    [['物资编码', 'code', d.code], ['物资名称', 'name', d.name]],
    [['物资大类', 'major', d.major], ['物资子类', 'minor', d.minor]],
    [['规格型号', 'spec', d.spec], ['计量单位', 'unit', d.unit]],
    [['合格数量', 'qualified', d.qualified], ['待入库数量', 'pendingQty', `<span class="font-semibold text-slate-900">${d.pendingQty}</span>`]],
  ]);
}

function inboundLocationRowHtml(deletable = false) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const delBtn = deletable
    ? `<button type="button" class="mb-0.5 shrink-0 text-sm text-rose-600 hover:underline" data-inbound-loc-remove>删除</button>`
    : '<span class="w-10"></span>';
  return `<div class="inbound-loc-row mb-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_100px_auto] sm:items-end" data-inbound-loc-row>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 仓库</label><select data-inbound-warehouse class="${inputCls}"><option value="" disabled selected>请选择</option><option>主仓库</option><option>辅仓库</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">货架</label><select data-inbound-shelf class="${inputCls}"><option value="" disabled selected>请选择</option><option>CK001001-HJ001</option><option>CK001001-HJ002</option><option>CK001001-HJ003</option><option>CK001001-HJ101</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">架层</label><select data-inbound-level class="${inputCls}"><option value="" disabled selected>请选择</option><option>1层</option><option>2层</option><option>3层</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 数量</label><input type="number" min="1" data-inbound-qty placeholder="请输入" class="${inputCls}" /></div>
    ${delBtn}
  </div>`;
}

function inboundLocationsSection(viewMode = false, locations = []) {
  if (viewMode && locations.length) {
    const tr = locations.map((loc, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 text-sm">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm">${loc.shelf}</td><td class="px-3 py-2.5 text-sm">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium">${loc.qty}</td></tr>`
    ).join('');
    return `<div class="md:col-span-2" data-wms-inbound-locations>
      ${formSection('存放位置')}
      <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">仓库</th><th class="px-3 py-2 text-left text-xs text-slate-500">货架</th><th class="px-3 py-2 text-left text-xs text-slate-500">架层</th><th class="px-3 py-2 text-left text-xs text-slate-500">数量</th></tr></thead><tbody>${tr}</tbody></table></div>
    </div>`;
  }
  return `<div class="md:col-span-2" data-wms-inbound-locations>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-semibold text-slate-800">存放位置</h4>
      <div class="flex gap-3">
        <button type="button" class="text-sm font-medium text-slate-700 hover:underline" data-inbound-loc-add>添加</button>
      </div>
    </div>
    <div data-inbound-loc-list>${inboundLocationRowHtml(false)}</div>
    <p class="mt-2 text-xs text-slate-500">入库的物资可能存放在不同位置；各行数量之和不超过待入库数量 <strong data-inbound-pending-qty-display>—</strong></p>
    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/80 p-3" data-wms-inbound-loc-scan>
      <button type="button" id="wms-inbound-scan-loc" class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-qrcode"></i> 扫描货位码</button>
      <span class="text-xs text-slate-600">扫描 <code class="rounded bg-white/80 px-1">wms://loc/</code> 货位码自动填充首行仓库/货架（演示：CK001001-HJ001）</span>
    </div>
  </div>`;
}

function warehouseInboundFormPage(backHref = 'warehouse_inbound_list.html', sample = {}) {
  const d = { ...INBOUND_ACCEPT_SAMPLES['GH2025001-YS01'], ...sample };
  const viewMode = !!d.viewMode;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const disAttr = viewMode ? ' disabled' : '';
  const roAttr = viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`;
  const isFixed = d.materialType === 'fixed';
  const isLike = d.materialType === 'like';
  const isConsumable = d.materialType === 'consumable';
  const inboundNo = d.inboundNo || `RK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}001`;
  const fixedBanner = isFixed && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-qrcode text-blue-500"></i> 固定资产入库将自动生成资产编码</div>
    <p class="text-xs text-slate-600">每件生成唯一 asset_code（规则 ZC+日期+序号），入库完成后可批量下载标签 ZIP；每行货位数量固定为 1。</p>
  </div>` : '';
  const likeBanner = isLike && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-screwdriver-wrench text-amber-600"></i> 类资产按数量入库</div>
    <p class="text-xs text-slate-600">以物资编码标识库存，同编码同货位可累加数量；需归还的类资产在出库后进入待还物资。</p>
  </div>` : '';
  const consumableBanner = isConsumable && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-boxes-stacked text-emerald-600"></i> 耗材按数量入库</div>
    <p class="text-xs text-slate-600">消耗型物资，同编码同货位库存累加；出库时按 FIFO 原则扣减，一般不强制归还。</p>
  </div>` : '';
  const typeBanner = fixedBanner || likeBanner || consumableBanner;

  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-inbound-form data-inbound-material-type="${d.materialType}">
      <div class="wms-modal-form wms-warehouse-form wms-inbound-form">
        ${formSection('供应商信息')}
        ${inboundSupplierGrid(d)}
        ${formSection('验收信息')}
        ${inboundAcceptGrid(d)}
        ${formSection('入库信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">入库单号</label><input type="text" value="${inboundNo}" readonly data-inbound-field="inboundNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 入库日期</label><input type="date" value="${d.inboundDate || '2025-11-29'}" data-inbound-field="inboundDate"${disAttr} ${viewMode ? roAttr : `class="${inputCls}"`} /></div>
        ${inboundLocationsSection(viewMode, d.locations)}
        ${typeBanner}
        ${formSection('其他信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">入库说明</label><textarea rows="3" placeholder="0/500" data-inbound-field="remark"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`}>${d.remark || ''}</textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">入库照片</label>${viewMode ? '<p class="text-sm text-slate-400">—</p>' : photoUploadZone()}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 入库人员</label><select data-inbound-field="operator"${disAttr} class="${inputCls}"><option value="" disabled${!d.operator ? ' selected' : ''}>请选择</option><option${d.operator === '张仓管' ? ' selected' : ''}>张仓管</option><option${d.operator === '李仓管' ? ' selected' : ''}>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 入库部门</label><select data-inbound-field="department"${disAttr} class="${inputCls}"><option value="" disabled${!d.department ? ' selected' : ''}>请选择</option><option${d.department === '物资管理部' ? ' selected' : ''}>物资管理部</option><option${d.department === '设备部' ? ' selected' : ''}>设备部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-inbound-back-link>${viewMode ? '关闭' : '取消'}</a>
        ${viewMode ? '' : '<button type="button" class="wms-btn wms-btn-primary" data-inbound-submit>确定</button>'}
      </div>
    </div>`;
}

function warehouseInboundListPage() {
  const rows = [
    inboundRow(['GH2025001-YS01', 'GH2025001', '科尼', 'GD001001-001', '抓斗', '4m³-Q345B', '资产-固定资产', '10', '0', '10', badge('审核通过', 'success'), '—', inboundStatusBadge('待入库')], '待入库', 'GH2025001-YS01'),
    inboundRow(['GH2025004-YS01', 'GH2025004', '江苏华能电子有限公司', 'LA-00456', '电钻', '650W', '资产-类资产', '9', '0', '9', badge('审核通过', 'success'), '—', inboundStatusBadge('待入库')], '待入库', 'GH2025004-YS01'),
    inboundRow(['GH2025006-YS01', 'GH2025006', '鄂东办公用品', 'HC-00089', '打印纸 A4', 'A4/80g/500张', '耗材-办公耗材', '200', '0', '200', badge('审核通过', 'success'), '—', inboundStatusBadge('待入库')], '待入库', 'GH2025006-YS01'),
    inboundRow(['GH2025003-YS01', 'GH2025003', '河南蒲瑞', 'LA-00456', '钢丝绳', 'Φ18×100m', '资产-类资产', '50', '30', '20', badge('审核通过', 'success'), '—', inboundStatusBadge('部分入库')], '部分入库', 'GH2025003-YS01'),
    inboundRow(['GH2025002-YS01', 'GH2025002', '鄂东办公用品', 'HC-00128', '安全帽', '标准型', '耗材-劳保耗材', '200', '200', '0', badge('审核通过', 'success'), 'RK202509002', inboundStatusBadge('已入库')], '已入库', 'GH2025002-YS01'),
  ];
  return listPage({
    desc: '仅展示<strong>验收记录已通过</strong>的待入库数据；验收记录审核通过后自动生成入库待办，支持分批入库',
    tabs: ['待入库', '已入库'],
    tabColumn: 12,
    searchPlaceholder: '验收单号、入库单号、物资编码、物资名称',
    filters: [{ label: '入库日期', key: 'inboundDate', column: -1, options: ['全部', '近7天', '近30天'] }],
    columns: ['验收单号', '物资供货单号', '供应商名称', '物资编码', '物资名称', '规格型号', '物资大类', '合格数量', '已入库数量', '待入库数量', '验收记录状态', '入库单号', '入库状态'],
    rows,
  });
}

const OUTBOUND_REQUISITION_SAMPLES = {
  'LY202606070002-L1': {
    lineKey: 'LY202606070002-L1', requisitionNo: 'LY202606070002', lineId: 'L1',
    reason: '施工现场临时用具', plan: '—', applicant: '王工', applicantDept: '工程部', applyTime: '2026-06-07',
    code: 'GD001001-005', name: '工程测量仪', major: '资产-固定资产', minor: '办公设备',
    spec: '全站仪 TS06', unit: '台', applyQty: '1', outboundQty: '0', pendingQty: '1',
    materialType: 'fixed', needReturn: true, outboundNo: '', outboundDate: '', status: '待出库',
    recipient: '王工', recipientDept: '工程部', operator: '', department: '', remark: '',
    assetCodes: [], locations: [],
  },
  'LY202606070003-L1': {
    lineKey: 'LY202606070003-L1', requisitionNo: 'LY202606070003', lineId: 'L1',
    reason: '设备维修', plan: '—', applicant: '李工', applicantDept: '设备部', applyTime: '2026-06-07',
    code: 'LA-00456', name: '电钻', major: '资产-类资产', minor: '电动工具',
    spec: '650W', unit: '台', applyQty: '3', outboundQty: '0', pendingQty: '3',
    materialType: 'like', needReturn: true, outboundNo: '', outboundDate: '', status: '待出库',
    recipient: '李工', recipientDept: '设备部', operator: '', department: '', remark: '',
    assetCodes: [], locations: [],
  },
  'LY202606070004-L1': {
    lineKey: 'LY202606070004-L1', requisitionNo: 'LY202606070004', lineId: 'L1',
    reason: '日常办公', plan: 'JH202606090001', applicant: '张三', applicantDept: '行政部', applyTime: '2026-06-08',
    code: 'HC-00089', name: '打印纸 A4', major: '耗材-办公耗材', minor: '办公用纸',
    spec: 'A4/80g/500张', unit: '箱', applyQty: '50', outboundQty: '0', pendingQty: '50',
    materialType: 'consumable', needReturn: false, outboundNo: '', outboundDate: '', status: '待出库',
    recipient: '张三', recipientDept: '行政部', operator: '', department: '', remark: '',
    assetCodes: [], locations: [],
  },
  'LY202606070005-L1': {
    lineKey: 'LY202606070005-L1', requisitionNo: 'LY202606070005', lineId: 'L1',
    reason: '项目用料', plan: 'JH202509002 维保计划', applicant: '赵六', applicantDept: '维保部', applyTime: '2026-06-06',
    code: 'LA-00457', name: '钢丝绳', major: '资产-类资产', minor: '防汛设备',
    spec: 'Φ18×100m', unit: 'm', applyQty: '100', outboundQty: '60', pendingQty: '40',
    materialType: 'like', needReturn: true, outboundNo: 'LY202606070005-CK001', outboundDate: '2026-06-08', status: '部分出库',
    recipient: '赵六', recipientDept: '维保部', operator: '李仓管', department: '物资管理部', remark: '首批出库',
    assetCodes: [], locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ002', level: '1层', qty: '60' }],
  },
  'LY202606010003-L1': {
    lineKey: 'LY202606010003-L1', requisitionNo: 'LY202606010003', lineId: 'L1',
    reason: '劳保发放', plan: '—', applicant: '张三', applicantDept: '工程部', applyTime: '2026-06-01',
    code: 'HC-00128', name: '安全帽', major: '耗材-劳保耗材', minor: '安全防护',
    spec: '标准型', unit: '顶', applyQty: '50', outboundQty: '50', pendingQty: '0',
    materialType: 'consumable', needReturn: false, outboundNo: 'CK202606010003', outboundDate: '2026-06-01', status: '已出库',
    recipient: '张三', recipientDept: '工程部', operator: '李仓管', department: '物资管理部', remark: '劳保发放完成',
    assetCodes: [], locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '50' }],
  },
};

const OUTBOUND_FORM_PAGES = {
  fixed: 'warehouse_outbound_fixed_form.html',
  like: 'warehouse_outbound_like_form.html',
  consumable: 'warehouse_outbound_consumable_form.html',
};

function outboundFormPage(materialType) {
  return OUTBOUND_FORM_PAGES[materialType] || 'warehouse_outbound_form.html';
}

function outboundStatusBadge(status) {
  const map = { '待出库': 'warning', '部分出库': 'info', '已出库': 'success' };
  return badge(status, map[status] || 'info');
}

function outboundRowActions(lineKey, status) {
  const sample = OUTBOUND_REQUISITION_SAMPLES[lineKey];
  const type = sample?.materialType || 'fixed';
  const formHref = outboundFormPage(type);
  const q = (extra = {}) => {
    const p = new URLSearchParams({ lineKey, back: 'warehouse_outbound_list.html', ...extra });
    return p.toString();
  };
  if (status === '已出库') {
    return `<a href="${formHref}?${q({ mode: 'view' })}" class="hover:underline">查看</a>`;
  }
  return `<a href="${formHref}?${q({ mode: 'view' })}" class="mr-2 hover:underline">查看</a><a href="${formHref}?${q()}" class="hover:underline">出库</a>`;
}

function outboundRow(cells, status, lineKey) {
  const tab = status === '已出库' ? '已出库' : '待出库';
  return { cells, tab, actions: outboundRowActions(lineKey, status) };
}

function outboundReadonlyGrid(pairs) {
  const pair = (label, key, value) =>
    `<td class="w-[18%] bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">${label}</td><td class="px-4 py-2.5 text-sm text-slate-800" data-outbound-field="${key}">${value}</td>`;
  const row = (left, right, border = true) =>
    `<tr${border ? ' class="border-t border-slate-200"' : ''}>${pair(left[0], left[1], left[2])}${pair(right[0], right[1], right[2])}</tr>`;
  const rows = pairs.map((p, i) => row(p[0], p[1], i > 0)).join('');
  return `<div class="md:col-span-2 overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm"><tbody>${rows}</tbody></table>
  </div>`;
}

function outboundRequisitionGrid(d) {
  return outboundReadonlyGrid([
    [['领用单号', 'requisitionNo', d.requisitionNo], ['申请事由', 'reason', d.reason]],
    [['关联计划', 'plan', d.plan || '—'], ['申请时间', 'applyTime', d.applyTime]],
    [['申请人', 'applicant', d.applicant], ['申请部门', 'applicantDept', d.applicantDept]],
  ]);
}

function outboundMaterialGrid(d) {
  const needReturnLabel = d.needReturn ? badge('需归还', 'info') : badge('不需归还', 'success');
  return outboundReadonlyGrid([
    [['物资编码', 'code', d.code], ['物资名称', 'name', d.name]],
    [['物资大类', 'major', d.major], ['物资子类', 'minor', d.minor]],
    [['规格型号', 'spec', d.spec], ['计量单位', 'unit', d.unit]],
    [['申请数量', 'applyQty', d.applyQty], ['已出库数量', 'outboundQty', d.outboundQty]],
    [['待出库数量', 'pendingQty', `<span class="font-semibold text-slate-900">${d.pendingQty}</span>`], ['归还要求', 'needReturn', needReturnLabel]],
  ]);
}

function outboundLocationRowHtml(deletable = false) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const delBtn = deletable
    ? `<button type="button" class="mb-0.5 shrink-0 text-sm text-rose-600 hover:underline" data-outbound-loc-remove>删除</button>`
    : '<span class="w-10"></span>';
  return `<div class="outbound-loc-row mb-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_100px_auto] sm:items-end" data-outbound-loc-row>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 仓库</label><select data-outbound-warehouse class="${inputCls}"><option value="" disabled selected>请选择</option><option>主仓库</option><option>辅仓库</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">货架</label><select data-outbound-shelf class="${inputCls}"><option value="" disabled selected>请选择</option><option>CK001001-HJ001</option><option>CK001001-HJ002</option><option>CK001001-HJ003</option><option>CK001001-HJ101</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">架层</label><select data-outbound-level class="${inputCls}"><option value="" disabled selected>请选择</option><option>1层</option><option>2层</option><option>3层</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 数量</label><input type="number" min="1" data-outbound-qty placeholder="请输入" class="${inputCls}" /></div>
    ${delBtn}
  </div>`;
}

function outboundLocationsSection(viewMode = false, locations = [], showSection = true) {
  if (!showSection) return '';
  if (viewMode && locations.length) {
    const tr = locations.map((loc, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 text-sm">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm">${loc.shelf}</td><td class="px-3 py-2.5 text-sm">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium">${loc.qty}</td></tr>`
    ).join('');
    return `<div class="md:col-span-2" data-wms-outbound-locations>
      <div class="mb-2"><h4 class="text-sm font-semibold text-slate-800">扣减货位</h4></div>
      <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">仓库</th><th class="px-3 py-2 text-left text-xs text-slate-500">货架</th><th class="px-3 py-2 text-left text-xs text-slate-500">架层</th><th class="px-3 py-2 text-left text-xs text-slate-500">数量</th></tr></thead><tbody>${tr}</tbody></table></div>
    </div>`;
  }
  return `<div class="md:col-span-2" data-wms-outbound-locations>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-semibold text-slate-800">扣减货位</h4>
      <button type="button" class="text-sm font-medium text-slate-700 hover:underline" data-outbound-loc-add>添加</button>
    </div>
    <div data-outbound-loc-list>${outboundLocationRowHtml(false)}</div>
    <p class="mt-2 text-xs text-slate-500">从指定货位扣减库存；各行数量之和不超过待出库数量 <strong data-outbound-pending-qty-display>—</strong></p>
  </div>`;
}

function outboundFixedAssetSection(viewMode = false, assetCodes = [], backHref = 'warehouse_outbound_list.html', lineKey = '') {
  if (viewMode && assetCodes.length) {
    const tr = assetCodes.map((c, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 font-mono text-sm">${c}</td><td class="px-3 py-2.5 text-sm">主仓库/B区</td></tr>`
    ).join('');
    return `<div class="md:col-span-2" data-wms-outbound-assets>
      <div class="mb-2"><h4 class="text-sm font-semibold text-slate-800">出库资产编码</h4></div>
      <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">资产编码</th><th class="px-3 py-2 text-left text-xs text-slate-500">所在货位</th></tr></thead><tbody>${tr}</tbody></table></div>
    </div>`;
  }
  const selectHref = `warehouse_outbound_select_asset.html?back=${encodeURIComponent(backHref)}&lineKey=${encodeURIComponent(lineKey)}`;
  return `<div class="md:col-span-2" data-wms-outbound-assets>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-semibold text-slate-800">出库资产 <span class="text-xs font-normal text-slate-500">（须绑定资产编码，一码一物）</span></h4>
      <div class="flex flex-wrap gap-2">
        <button type="button" id="wms-outbound-scan-asset" class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-qrcode"></i> 扫码添加</button>
        <a href="${selectHref}" class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-magnifying-glass"></i> 选择资产</a>
      </div>
    </div>
    <div class="min-h-[3rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3" data-outbound-asset-list>
      <p class="text-sm text-slate-400" data-outbound-asset-empty>尚未选择资产编码</p>
    </div>
    <p class="mt-2 text-xs text-slate-500">已选 <strong data-outbound-asset-count>0</strong> 件，待出库 <strong data-outbound-pending-qty-display>—</strong> 件</p>
  </div>`;
}

function outboundConsumableQtySection(viewMode = false, d = {}) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  if (viewMode) {
    const qty = d.locations?.[0]?.qty || d.outboundQty || '—';
    return `<div class="md:col-span-2" data-wms-outbound-consumable-qty>
      <label class="mb-1.5 block text-sm font-medium text-slate-700">本次出库数量</label>
      <input type="text" value="${qty}" readonly class="${roCls}" data-outbound-field="thisOutboundQty" />
      <p class="mt-2 text-xs text-slate-500">系统已按 FIFO 原则从最早入库批次扣减</p>
    </div>`;
  }
  return `<div class="md:col-span-2" data-wms-outbound-consumable-qty>
    <label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 本次出库数量</label>
    <input type="number" min="1" placeholder="请输入" data-outbound-field="thisOutboundQty" class="${inputCls}" />
    <p class="mt-2 text-xs text-slate-500">系统将按 <strong>FIFO</strong> 原则从最早入库批次自动扣减，无需手工指定货位</p>
  </div>`;
}

function warehouseOutboundFormPage(backHref = 'warehouse_outbound_list.html', sample = {}) {
  const d = { ...OUTBOUND_REQUISITION_SAMPLES['LY202606070002-L1'], ...sample };
  const viewMode = !!d.viewMode;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const disAttr = viewMode ? ' disabled' : '';
  const isFixed = d.materialType === 'fixed';
  const isLike = d.materialType === 'like';
  const isConsumable = d.materialType === 'consumable';
  const outboundNo = d.outboundNo || `CK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}001`;
  const fixedBanner = isFixed && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-qrcode text-blue-500"></i> 固定资产须绑定资产编码出库</div>
    <p class="text-xs text-slate-600">扫码或选择资产编码，每件对应唯一二维码；出库后资产状态变为已领用${d.needReturn ? '，并进入待还物资' : ''}。</p>
  </div>` : '';
  const likeBanner = isLike && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-screwdriver-wrench text-amber-600"></i> 类资产按数量出库</div>
    <p class="text-xs text-slate-600">从指定货位扣减库存；${d.needReturn ? '需归还的类资产出库后进入待还物资。' : '本物资不需归还。'}</p>
  </div>` : '';
  const consumableBanner = isConsumable && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-boxes-stacked text-emerald-600"></i> 耗材按数量出库</div>
    <p class="text-xs text-slate-600">消耗型物资，系统默认按 FIFO 从最早批次扣减；出库后更新库存总量，一般不强制归还。</p>
  </div>` : '';
  const typeBanner = fixedBanner || likeBanner || consumableBanner;
  const typeSpecific = isFixed
    ? outboundFixedAssetSection(viewMode, d.assetCodes, backHref, d.lineKey)
    : isLike
      ? outboundLocationsSection(viewMode, d.locations)
      : outboundConsumableQtySection(viewMode, d);

  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-outbound-form data-outbound-material-type="${d.materialType}">
      <div class="wms-modal-form wms-warehouse-form wms-outbound-form">
        ${formSection('领用信息')}
        ${outboundRequisitionGrid(d)}
        ${formSection('物资信息')}
        ${outboundMaterialGrid(d)}
        ${formSection('出库信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">出库单号</label><input type="text" value="${outboundNo}" readonly data-outbound-field="outboundNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 出库日期</label><input type="date" value="${d.outboundDate || '2026-06-09'}" data-outbound-field="outboundDate"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`} /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 领用人</label><select data-outbound-field="recipient"${disAttr} class="${inputCls}"><option value="" disabled${!d.recipient ? ' selected' : ''}>请选择</option><option${d.recipient === '王工' ? ' selected' : ''}>王工</option><option${d.recipient === '李工' ? ' selected' : ''}>李工</option><option${d.recipient === '张三' ? ' selected' : ''}>张三</option><option${d.recipient === '赵六' ? ' selected' : ''}>赵六</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 领用部门</label><select data-outbound-field="recipientDept"${disAttr} class="${inputCls}"><option value="" disabled${!d.recipientDept ? ' selected' : ''}>请选择</option><option${d.recipientDept === '工程部' ? ' selected' : ''}>工程部</option><option${d.recipientDept === '设备部' ? ' selected' : ''}>设备部</option><option${d.recipientDept === '行政部' ? ' selected' : ''}>行政部</option><option${d.recipientDept === '维保部' ? ' selected' : ''}>维保部</option></select></div>
        ${typeSpecific}
        ${typeBanner}
        ${formSection('其他信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">出库说明</label><textarea rows="3" placeholder="0/500" data-outbound-field="remark"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`}>${d.remark || ''}</textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">出库照片</label>${viewMode ? '<p class="text-sm text-slate-400">—</p>' : photoUploadZone()}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 出库人员</label><select data-outbound-field="operator"${disAttr} class="${inputCls}"><option value="" disabled${!d.operator ? ' selected' : ''}>请选择</option><option${d.operator === '张仓管' ? ' selected' : ''}>张仓管</option><option${d.operator === '李仓管' ? ' selected' : ''}>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 出库部门</label><select data-outbound-field="department"${disAttr} class="${inputCls}"><option value="" disabled${!d.department ? ' selected' : ''}>请选择</option><option${d.department === '物资管理部' ? ' selected' : ''}>物资管理部</option><option${d.department === '设备部' ? ' selected' : ''}>设备部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-outbound-back-link>${viewMode ? '关闭' : '取消'}</a>
        ${viewMode ? '' : '<button type="button" class="wms-btn wms-btn-primary" data-outbound-submit>确定</button>'}
      </div>
    </div>`;
}

function outboundSuccessPage() {
  return `
    <div class="mx-auto max-w-3xl" data-wms-outbound-success>
      <div class="card rounded-2xl bg-white p-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><i class="fa-solid fa-check text-2xl"></i></div>
        <h2 class="text-xl font-semibold text-slate-900" data-outbound-success-title>出库成功 · 资产交接</h2>
        <p class="mt-2 text-sm text-slate-500" data-outbound-success-desc>出库单号 CK202606090001 · 领用单 LY202606070002</p>
        <div class="mt-8 overflow-hidden rounded-xl border border-slate-200 text-left" data-outbound-success-asset-table>
          <table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-4 py-2 text-left text-xs text-slate-500">资产编码</th><th class="px-4 py-2 text-left text-xs text-slate-500">物资名称</th><th class="px-4 py-2 text-left text-xs text-slate-500">领用人</th></tr></thead>
          <tbody><tr class="border-t border-slate-100"><td class="px-4 py-2.5 font-mono">ZC202606001</td><td class="px-4 py-2.5">工程测量仪</td><td class="px-4 py-2.5">王工</td></tr></tbody></table>
        </div>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-print"></i> 打印领用单</button>
          <a href="mine_pending_pickup.html" class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-hand-holding"></i> 领取记录</a>
          <a href="warehouse_outbound_list.html" class="text-sm text-slate-500 hover:text-slate-900">返回出库列表</a>
        </div>
      </div>
    </div>`;
}

function warehouseOutboundListPage() {
  const rows = [
    outboundRow(['LY202606070002', 'GD001001-005', '工程测量仪', '全站仪 TS06', '资产-固定资产', '1', '0', '1', '王工', '工程部', '—', outboundStatusBadge('待出库')], '待出库', 'LY202606070002-L1'),
    outboundRow(['LY202606070003', 'LA-00456', '电钻', '650W', '资产-类资产', '3', '0', '3', '李工', '设备部', '—', outboundStatusBadge('待出库')], '待出库', 'LY202606070003-L1'),
    outboundRow(['LY202606070004', 'HC-00089', '打印纸 A4', 'A4/80g/500张', '耗材-办公耗材', '50', '0', '50', '张三', '行政部', '—', outboundStatusBadge('待出库')], '待出库', 'LY202606070004-L1'),
    outboundRow(['LY202606070005', 'LA-00457', '钢丝绳', 'Φ18×100m', '资产-类资产', '100', '60', '40', '赵六', '维保部', 'LY202606070005-CK001', outboundStatusBadge('部分出库')], '部分出库', 'LY202606070005-L1'),
    outboundRow(['LY202606010003', 'HC-00128', '安全帽', '标准型', '耗材-劳保耗材', '50', '50', '0', '张三', '工程部', 'CK202606010003', outboundStatusBadge('已出库')], '已出库', 'LY202606010003-L1'),
  ];
  return listPage({
    desc: '领用申请审核通过后按物资明细自动生成；支持分批出库，扣减库存后更新台账',
    tabs: ['待出库', '已出库'],
    tabColumn: 11,
    searchPlaceholder: '领用单号、出库单号、物资编码、物资名称、申请人',
    filters: [{ label: '出库日期', key: 'outboundDate', column: -1, options: ['全部', '近7天', '近30天'] }],
    columns: ['领用单号', '物资编码', '物资名称', '规格型号', '物资大类', '申请数量', '已出库数量', '待出库数量', '申请人', '申请部门', '出库单号', '出库状态'],
    rows,
  });
}

const RETURN_PENDING_SAMPLES = {
  'LY202606010003-ZC202605012': {
    returnKey: 'LY202606010003-ZC202605012', requisitionNo: 'LY202606010003', outboundNo: 'CK202606010003',
    assetCode: 'ZC202605012', code: 'GD001001-005', name: '工程测量仪', major: '资产-固定资产', minor: '办公设备',
    spec: '全站仪 TS06', unit: '台', borrower: '张三', borrowerDept: '工程部',
    outboundDate: '2026-06-01', dueDate: '2026-06-15', extendedDueDate: '',
    outboundQty: '1', returnedQty: '0', pendingQty: '1', materialType: 'fixed', status: '待归还',
    returnNo: '', returnDate: '', condition: '', returnPerson: '', operator: '', department: '', remark: '', locations: [],
    requisitionName: '工程部测量仪领用', requisitionReason: '施工现场测量',
  },
  'LY202605200008-LA-00331': {
    returnKey: 'LY202605200008-LA-00331', requisitionNo: 'LY202605200008', outboundNo: 'LY202605200008-CK001',
    assetCode: 'LA-00331', code: 'LA-00330', name: '铝合金梯', major: '资产-类资产', minor: '登高工具',
    spec: '3m', unit: '架', borrower: '王工', borrowerDept: '工程部',
    outboundDate: '2026-05-20', dueDate: '2026-06-05', extendedDueDate: '2026-06-20',
    outboundQty: '1', returnedQty: '0', pendingQty: '1', materialType: 'like', status: '已延期',
    returnNo: '', returnDate: '', condition: '', returnPerson: '', operator: '', department: '', remark: '', locations: [],
    requisitionName: '工程部登高工具领用', requisitionReason: '设备检修',
  },
  'LY202606070003-L1': {
    returnKey: 'LY202606070003-L1', requisitionNo: 'LY202606070003', outboundNo: '—',
    assetCode: '', code: 'LA-00456', name: '电钻', major: '资产-类资产', minor: '电动工具',
    spec: '650W', unit: '台', borrower: '李工', borrowerDept: '设备部',
    outboundDate: '—', dueDate: '2026-07-09', extendedDueDate: '',
    outboundQty: '3', returnedQty: '0', pendingQty: '3', materialType: 'like', status: '待归还',
    returnNo: '', returnDate: '', condition: '', returnPerson: '', operator: '', department: '', remark: '', locations: [],
    requisitionName: '设备部工具领用', requisitionReason: '设备维修',
  },
  'LY202606070005-L1': {
    returnKey: 'LY202606070005-L1', requisitionNo: 'LY202606070005', outboundNo: 'LY202606070005-CK001',
    assetCode: '', code: 'LA-00457', name: '钢丝绳', major: '资产-类资产', minor: '防汛设备',
    spec: 'Φ18×100m', unit: 'm', borrower: '赵六', borrowerDept: '维保部',
    outboundDate: '2026-06-08', dueDate: '2026-08-08', extendedDueDate: '',
    outboundQty: '60', returnedQty: '40', pendingQty: '20', materialType: 'like', status: '部分归还',
    returnNo: 'HK20260608001', returnDate: '2026-06-10', condition: '完好', returnPerson: '赵六', operator: '李仓管', department: '物资管理部',
    remark: '首批归还', locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ002', level: '1层', qty: '40' }],
    requisitionName: '维保部钢丝绳领用', requisitionReason: '项目用料',
  },
  'LY202510006-GD007': {
    returnKey: 'LY202510006-GD007', requisitionNo: 'LY202510006', outboundNo: 'LY202510006-CK001',
    assetCode: 'GD001001-007', code: 'GD001001-007', name: '螺丝刀', major: '资产-类资产', minor: '设备-配件',
    spec: '455', unit: '个', borrower: '王五', borrowerDept: '设备部',
    outboundDate: '2025-07-15', dueDate: '2025-08-05', extendedDueDate: '',
    outboundQty: '8', returnedQty: '8', pendingQty: '0', materialType: 'like', status: '已归还',
    returnNo: 'HK20250715001', returnDate: '2025-08-04', condition: '完好', returnPerson: '王五', operator: '张仓管', department: '物资管理部',
    remark: '按时归还', locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '8' }],
    requisitionName: '设备部工具领用', requisitionReason: '日常办公',
  },
  'LY20260608001-LA-002': {
    returnKey: 'LY20260608001-LA-002', requisitionNo: 'LY20260608001', outboundNo: 'CK20260608001',
    assetCode: 'LA-00501', code: 'LA-00500', name: '手持对讲机', major: '资产-类资产', minor: '通讯设备',
    spec: 'UHF 400-470MHz', unit: '台', borrower: '张三', borrowerDept: '工程部',
    outboundDate: '2026-06-05', dueDate: '2026-06-20', extendedDueDate: '',
    outboundQty: '2', returnedQty: '2', pendingQty: '0', materialType: 'like', status: '待确认',
    returnNo: 'HK20260608002', returnDate: '2026-06-08', condition: '完好', returnPerson: '张三',
    operator: '张仓管', department: '物资管理部', remark: '设备检修完毕归还',
    thisReturnQty: '2',
    locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ002', level: '1层', qty: '2' }],
    requisitionName: '工程部对讲机领用', requisitionReason: '施工现场通讯',
  },
};

const RETURN_FORM_PAGES = {
  fixed: 'warehouse_return_fixed_form.html',
  like: 'warehouse_return_like_form.html',
};

function returnFormPage(materialType) {
  return RETURN_FORM_PAGES[materialType] || 'warehouse_return_fixed_form.html';
}

function returnStatusBadge(status) {
  const map = { '待归还': 'info', '已延期': 'danger', '部分归还': 'warning', '待确认': 'warning', '已归还': 'success', '已作废': 'danger' };
  return badge(status, map[status] || 'info');
}

function returnRowActions(returnKey, status) {
  const sample = RETURN_PENDING_SAMPLES[returnKey];
  const type = sample?.materialType || 'fixed';
  const formHref = returnFormPage(type);
  const scrapHref = `warehouse_return_scrap_form.html?returnKey=${encodeURIComponent(returnKey)}&back=warehouse_return_list.html`;
  const q = (extra = {}) => {
    const p = new URLSearchParams({ returnKey, back: 'warehouse_return_list.html', ...extra });
    return p.toString();
  };
  if (status === '待确认') {
    return `<a href="${formHref}?${q({ mode: 'view' })}" class="hover:underline">查看</a>`;
  }
  if (status === '已归还' || status === '已作废') {
    return `<a href="${formHref}?${q({ mode: 'view' })}" class="hover:underline">查看</a>`;
  }
  return `<a href="${formHref}?${q({ mode: 'view' })}" class="mr-2 hover:underline">查看</a><a href="${formHref}?${q()}" class="mr-2 hover:underline">归还</a><a href="${scrapHref}" class="text-rose-600 hover:underline">作废</a>`;
}

function returnRow(cells, status, returnKey) {
  const tabMap = { '待归还': '待归还', '部分归还': '待归还', '已延期': '已延期', '待确认': '待确认', '已归还': '已归还', '已作废': '已作废' };
  return { cells, tab: tabMap[status] || '待归还', actions: returnRowActions(returnKey, status) };
}

function returnReadonlyGrid(pairs) {
  const pair = (label, key, value) =>
    `<td class="w-[18%] bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">${label}</td><td class="px-4 py-2.5 text-sm text-slate-800" data-return-field="${key}">${value}</td>`;
  const row = (left, right, border = true) =>
    `<tr${border ? ' class="border-t border-slate-200"' : ''}>${pair(left[0], left[1], left[2])}${pair(right[0], right[1], right[2])}</tr>`;
  const rows = pairs.map((p, i) => row(p[0], p[1], i > 0)).join('');
  return `<div class="md:col-span-2 overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm"><tbody>${rows}</tbody></table>
  </div>`;
}

function returnBorrowGrid(d) {
  const dueDisplay = d.status === '已延期' && d.extendedDueDate
    ? `${d.extendedDueDate} <span class="text-xs text-amber-600">（原 ${d.dueDate}）</span>`
    : d.dueDate;
  return returnReadonlyGrid([
    [['领用单号', 'requisitionNo', d.requisitionNo], ['出库单号', 'outboundNo', d.outboundNo || '—']],
    [['借用人', 'borrower', d.borrower], ['借用人部门', 'borrowerDept', d.borrowerDept]],
    [['出库日期', 'outboundDate', d.outboundDate], ['应还日期', 'dueDate', dueDisplay]],
  ]);
}

function returnMaterialGrid(d) {
  return returnReadonlyGrid([
    [['资产编码', 'assetCode', d.assetCode || '—'], ['物资编码', 'code', d.code]],
    [['物资名称', 'name', d.name], ['物资大类', 'major', d.major]],
    [['规格型号', 'spec', d.spec], ['计量单位', 'unit', d.unit]],
    [['出库数量', 'outboundQty', d.outboundQty], ['已还数量', 'returnedQty', d.returnedQty]],
    [['待还数量', 'pendingQty', `<span class="font-semibold text-slate-900">${d.pendingQty}</span>`], ['物资子类', 'minor', d.minor]],
  ]);
}

function returnLocationRowHtml(deletable = false) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const delBtn = deletable
    ? `<button type="button" class="mb-0.5 shrink-0 text-sm text-rose-600 hover:underline" data-return-loc-remove>删除</button>`
    : '<span class="w-10"></span>';
  return `<div class="return-loc-row mb-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_100px_auto] sm:items-end" data-return-loc-row>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 仓库</label><select data-return-warehouse class="${inputCls}"><option value="" disabled selected>请选择</option><option>主仓库</option><option>辅仓库</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">货架</label><select data-return-shelf class="${inputCls}"><option value="" disabled selected>请选择</option><option>CK001001-HJ001</option><option>CK001001-HJ002</option><option>CK001001-HJ003</option><option>CK001001-HJ101</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">架层</label><select data-return-level class="${inputCls}"><option value="" disabled selected>请选择</option><option>1层</option><option>2层</option><option>3层</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 数量</label><input type="number" min="1" data-return-qty placeholder="请输入" class="${inputCls}" /></div>
    ${delBtn}
  </div>`;
}

function returnLocationsSection(viewMode = false, locations = []) {
  if (viewMode && locations.length) {
    const tr = locations.map((loc, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 text-sm">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm">${loc.shelf}</td><td class="px-3 py-2.5 text-sm">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium">${loc.qty}</td></tr>`
    ).join('');
    return `<div class="md:col-span-2" data-wms-return-locations>
      <div class="mb-2"><h4 class="text-sm font-semibold text-slate-800">回库货位</h4></div>
      <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">仓库</th><th class="px-3 py-2 text-left text-xs text-slate-500">货架</th><th class="px-3 py-2 text-left text-xs text-slate-500">架层</th><th class="px-3 py-2 text-left text-xs text-slate-500">数量</th></tr></thead><tbody>${tr}</tbody></table></div>
    </div>`;
  }
  return `<div class="md:col-span-2" data-wms-return-locations>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-semibold text-slate-800">回库货位</h4>
      <button type="button" class="text-sm font-medium text-slate-700 hover:underline" data-return-loc-add>添加</button>
    </div>
    <div data-return-loc-list>${returnLocationRowHtml(false)}</div>
    <p class="mt-2 text-xs text-slate-500">归还物资回库位置；各行数量之和不超过待还数量 <strong data-return-pending-qty-display>—</strong></p>
  </div>`;
}

function returnFixedAssetSection(viewMode = false, d = {}) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 font-mono';
  if (viewMode) {
    return `<div class="md:col-span-2" data-wms-return-fixed-asset>
      <label class="mb-1.5 block text-sm font-medium text-slate-700">资产编码</label>
      <input type="text" value="${d.assetCode || '—'}" readonly class="${roCls}" data-return-field="assetCodeConfirm" />
    </div>
    ${returnLocationsSection(viewMode, d.locations?.length ? d.locations : [{ warehouse: '主仓库', shelf: 'CK001001-HJ101', level: '1层', qty: '1' }])}`;
  }
  return `<div class="md:col-span-2" data-wms-return-fixed-asset>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <label class="mb-0 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 资产编码确认</label>
      <button type="button" id="wms-return-scan-asset" class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-qrcode"></i> 扫码确认</button>
    </div>
    <input type="text" value="${d.assetCode || ''}" placeholder="扫描或输入资产编码" data-return-field="assetCodeConfirm" class="${inputCls} font-mono" />
    <p class="mt-2 text-xs text-slate-500">须与待还资产编码 <strong class="font-mono">${d.assetCode || '—'}</strong> 一致</p>
  </div>
  ${returnLocationsSection(false)}`;
}

function returnLikeQtySection(viewMode = false, d = {}) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const qtyBlock = viewMode
    ? `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">本次归还数量</label><input type="text" readonly value="${d.locations?.[0]?.qty || d.returnedQty || '—'}" class="${roCls}" /></div>`
    : `<div class="md:col-span-2" data-wms-return-like-qty><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 本次归还数量</label><input type="number" min="1" placeholder="请输入" data-return-field="thisReturnQty" class="${inputCls}" /><p class="mt-2 text-xs text-slate-500">可与下方回库货位分行数量一致，或仅填总数由系统按行汇总校验</p></div>`;
  return qtyBlock + returnLocationsSection(viewMode, d.locations);
}

function warehouseReturnFormPage(backHref = 'warehouse_return_list.html', sample = {}) {
  const d = { ...RETURN_PENDING_SAMPLES['LY202606010003-ZC202605012'], ...sample };
  const viewMode = !!d.viewMode;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const disAttr = viewMode ? ' disabled' : '';
  const isFixed = d.materialType === 'fixed';
  const isLike = d.materialType === 'like';
  const returnNo = d.returnNo || `HK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}001`;
  const fixedBanner = isFixed && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-qrcode text-blue-500"></i> 固定资产须扫码确认资产编码</div>
    <p class="text-xs text-slate-600">扫码 <code class="rounded bg-white/80 px-1">wms://asset/</code> 校验编码一致后回库；完好→在库，需维修→维修中，损坏→待报废。</p>
  </div>` : '';
  const likeBanner = isLike && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-screwdriver-wrench text-amber-600"></i> 类资产按数量归还</div>
    <p class="text-xs text-slate-600">支持分批归还；指定回库货位后累加库存，待还数量相应减少。</p>
  </div>` : '';
  const typeBanner = fixedBanner || likeBanner;
  const typeSpecific = isFixed ? returnFixedAssetSection(viewMode, d) : returnLikeQtySection(viewMode, d);

  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-return-form data-return-material-type="${d.materialType}" data-return-expected-asset="${d.assetCode || ''}">
      <div class="wms-modal-form wms-warehouse-form wms-return-form">
        ${formSection('借用信息')}
        ${returnBorrowGrid(d)}
        ${formSection('物资信息')}
        ${returnMaterialGrid(d)}
        ${formSection('归还信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">归还单号</label><input type="text" value="${returnNo}" readonly data-return-field="returnNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 归还日期</label><input type="date" value="${d.returnDate || '2026-06-09'}" data-return-field="returnDate"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`} /></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 实物状态</label><select data-return-field="condition"${disAttr} class="${inputCls}"><option value="" disabled${!d.condition ? ' selected' : ''}>请选择</option><option${d.condition === '完好' ? ' selected' : ''}>完好</option><option${d.condition === '需维修' ? ' selected' : ''}>需维修</option><option${d.condition === '损坏' ? ' selected' : ''}>损坏</option></select></div>
        ${typeSpecific}
        ${typeBanner}
        ${formSection('其他信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">归还说明</label><textarea rows="3" placeholder="0/500" data-return-field="remark"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`}>${d.remark || ''}</textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">归还照片</label>${viewMode ? '<p class="text-sm text-slate-400">—</p>' : photoUploadZone()}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 归还人员</label><select data-return-field="returnPerson"${disAttr} class="${inputCls}"><option value="" disabled${!d.returnPerson && !d.borrower ? ' selected' : ''}>请选择</option><option${(d.returnPerson || d.borrower) === '张三' ? ' selected' : ''}>张三</option><option${(d.returnPerson || d.borrower) === '王工' ? ' selected' : ''}>王工</option><option${(d.returnPerson || d.borrower) === '李工' ? ' selected' : ''}>李工</option><option${(d.returnPerson || d.borrower) === '赵六' ? ' selected' : ''}>赵六</option><option${(d.returnPerson || d.borrower) === '王五' ? ' selected' : ''}>王五</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 验收人员</label><select data-return-field="operator"${disAttr} class="${inputCls}"><option value="" disabled${!d.operator ? ' selected' : ''}>请选择</option><option${d.operator === '张仓管' ? ' selected' : ''}>张仓管</option><option${d.operator === '李仓管' ? ' selected' : ''}>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 验收部门</label><select data-return-field="department"${disAttr} class="${inputCls}"><option value="" disabled${!d.department ? ' selected' : ''}>请选择</option><option${d.department === '物资管理部' ? ' selected' : ''}>物资管理部</option><option${d.department === '设备部' ? ' selected' : ''}>设备部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-return-back-link>${viewMode ? '关闭' : '取消'}</a>
        ${viewMode ? '' : '<button type="button" class="wms-btn wms-btn-primary" data-return-submit>确定</button>'}
      </div>
    </div>`;
}

function warehouseReturnScrapPage(backHref = 'warehouse_return_list.html', sample = {}) {
  const d = { ...RETURN_PENDING_SAMPLES['LY202605200008-LA-00331'], ...sample };
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg" data-wms-return-scrap-form data-return-key="${d.returnKey}">
      <div class="wms-modal-form wms-warehouse-form">
        ${formSection('待还信息')}
        ${returnBorrowGrid(d)}
        ${returnMaterialGrid(d)}
        ${formSection('作废信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 作废原因</label><select data-return-scrap-field="reason" class="${inputCls}"><option value="" disabled selected>请选择</option><option>丢失</option><option>损毁无法修复</option><option>被盗</option><option>其他</option></select></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 说明</label><textarea rows="4" placeholder="请说明作废原因及处理情况" data-return-scrap-field="remark" class="${inputCls}"></textarea></div>
        <div class="md:col-span-2 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-xs text-slate-600">作废后待还记录关闭，资产不再回库；固定资产标记灭失，类资产扣减借出账面。系统将自动生成来源为<strong>归还灭失</strong>的作废单（可在<a href="warehouse_scrap_list.html" class="font-medium text-slate-900 hover:underline">物资作废</a>查看）。</div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-return-back-link>取消</a>
        <button type="button" class="wms-btn wms-btn-primary bg-rose-600 hover:bg-rose-700" data-return-scrap-submit>确认作废</button>
      </div>
    </div>`;
}

function returnConfirmPage(backHref = 'mine_pending_return.html', sample = {}) {
  const d = { ...RETURN_PENDING_SAMPLES['LY20260608001-LA-002'], ...sample };
  const locRows = (d.locations || []).map((loc, i) =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm text-slate-700">${i + 1}</td><td class="px-3 py-2.5 text-sm text-slate-800">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm text-slate-800">${loc.shelf}</td><td class="px-3 py-2.5 text-sm text-slate-800">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium text-slate-900">${loc.qty}</td></tr>`
  ).join('');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg" data-wms-return-confirm data-return-key="${d.returnKey}">
      <div class="wms-return-confirm">
        <div class="mb-5 rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-slate-700">
          <i class="fa-solid fa-circle-info mr-1 text-amber-600"></i>
          仓管员已完成归还入库，请核对下方领用与归还信息无误后确认；确认后状态变为<strong>已归还</strong>。
        </div>
        <h4 class="mb-3 text-sm font-semibold text-slate-900">领用信息</h4>
        <dl class="mb-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt class="text-slate-500">领用单号</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-return-confirm-field="requisitionNo">${d.requisitionNo}</dd></div>
          <div><dt class="text-slate-500">申请名称</dt><dd class="mt-1 text-slate-900" data-return-confirm-field="requisitionName">${d.requisitionName || '—'}</dd></div>
          <div><dt class="text-slate-500">申请事由</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="requisitionReason">${d.requisitionReason || '—'}</dd></div>
          <div><dt class="text-slate-500">借用人</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="borrower">${d.borrower}</dd></div>
          <div><dt class="text-slate-500">借用人部门</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="borrowerDept">${d.borrowerDept}</dd></div>
          <div><dt class="text-slate-500">出库单号</dt><dd class="mt-1 font-mono text-slate-800" data-return-confirm-field="outboundNo">${d.outboundNo}</dd></div>
          <div><dt class="text-slate-500">出库日期</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="outboundDate">${d.outboundDate}</dd></div>
          <div><dt class="text-slate-500">物资名称</dt><dd class="mt-1 text-slate-900" data-return-confirm-field="name">${d.name}</dd></div>
          <div><dt class="text-slate-500">规格型号</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="spec">${d.spec}</dd></div>
          <div><dt class="text-slate-500">物资编码</dt><dd class="mt-1 font-mono text-slate-800" data-return-confirm-field="code">${d.code}</dd></div>
          <div><dt class="text-slate-500">出库数量</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="outboundQty">${d.outboundQty} ${d.unit}</dd></div>
        </dl>
        <h4 class="mb-3 text-sm font-semibold text-slate-900">归还信息</h4>
        <dl class="mb-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt class="text-slate-500">归还单号</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-return-confirm-field="returnNo">${d.returnNo}</dd></div>
          <div><dt class="text-slate-500">归还日期</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="returnDate">${d.returnDate}</dd></div>
          <div><dt class="text-slate-500">归还人员</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="returnPerson">${d.returnPerson}</dd></div>
          <div><dt class="text-slate-500">实物状态</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="condition">${d.condition}</dd></div>
          <div><dt class="text-slate-500">本次归还数量</dt><dd class="mt-1 font-medium text-slate-900" data-return-confirm-field="thisReturnQty">${d.thisReturnQty || d.returnedQty} ${d.unit}</dd></div>
          <div><dt class="text-slate-500">验收人员</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="operator">${d.operator}</dd></div>
          <div><dt class="text-slate-500">验收部门</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="department">${d.department}</dd></div>
          <div class="sm:col-span-2"><dt class="text-slate-500">归还说明</dt><dd class="mt-1 text-slate-800" data-return-confirm-field="remark">${d.remark || '—'}</dd></div>
        </dl>
        <div class="overflow-hidden rounded-xl border border-slate-200">
          <table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">序号</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">仓库</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">货架</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">架层</th>
            <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">数量</th>
          </tr></thead><tbody data-return-confirm-locations>${locRows}</tbody></table>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-return-confirm-back>取消</a>
        <button type="button" class="wms-btn wms-btn-primary" data-return-confirm-submit>确认归还</button>
      </div>
    </div>`;
}

function returnSuccessPage() {
  return `
    <div class="mx-auto max-w-2xl" data-wms-return-success>
      <div class="card rounded-2xl bg-white p-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><i class="fa-solid fa-check text-2xl"></i></div>
        <h2 class="text-xl font-semibold text-slate-900" data-return-success-title>归还成功</h2>
        <p class="mt-2 text-sm text-slate-500" data-return-success-desc>归还单号 HK202606090001 · 领用单 LY202606010003</p>
        <p class="mt-1 text-xs text-amber-700 hidden" data-return-success-hint>已通知借用人确认归还，确认前状态为「待确认」</p>
        <p class="mt-1 text-xs text-rose-700 hidden" data-return-success-pending-scrap>实物状态为损坏，物资已进入<a href="warehouse_scrap_pending_pool.html" class="font-medium underline">待报废池</a>，请发起作废单完成核销。</p>
        <dl class="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left text-sm sm:grid-cols-2">
          <div><dt class="text-slate-500">物资名称</dt><dd class="mt-1 font-medium text-slate-900" data-return-success-name>工程测量仪</dd></div>
          <div><dt class="text-slate-500">实物状态</dt><dd class="mt-1 text-slate-800" data-return-success-condition>完好</dd></div>
          <div><dt class="text-slate-500">回库货位</dt><dd class="mt-1 text-slate-800" data-return-success-location>主仓库 / B区</dd></div>
          <div><dt class="text-slate-500">借用人</dt><dd class="mt-1 text-slate-800" data-return-success-borrower>张三</dd></div>
        </dl>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="ledger_transaction.html" class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-right-left"></i> 出入库记录</a>
          <a href="warehouse_return_list.html" class="text-sm text-slate-500 hover:text-slate-900">返回归还列表</a>
        </div>
      </div>
    </div>`;
}

function warehouseReturnListPage() {
  const rows = [
    returnRow(['LY202606010003', 'CK202606010003', 'ZC202605012', 'GD001001-005', '工程测量仪', '全站仪 TS06', '资产-固定资产', '张三', '工程部', '1', '0', '1', '2026-06-15', returnStatusBadge('待归还')], '待归还', 'LY202606010003-ZC202605012'),
    returnRow(['LY202605200008', 'LY202605200008-CK001', 'LA-00331', 'LA-00330', '铝合金梯', '3m', '资产-类资产', '王工', '工程部', '1', '0', '1', '2026-06-20', returnStatusBadge('已延期')], '已延期', 'LY202605200008-LA-00331'),
    returnRow(['LY202606070003', '—', '—', 'LA-00456', '电钻', '650W', '资产-类资产', '李工', '设备部', '3', '0', '3', '2026-07-09', returnStatusBadge('待归还')], '待归还', 'LY202606070003-L1'),
    returnRow(['LY202606070005', 'LY202606070005-CK001', '—', 'LA-00457', '钢丝绳', 'Φ18×100m', '资产-类资产', '赵六', '维保部', '60', '40', '20', '2026-08-08', returnStatusBadge('部分归还')], '部分归还', 'LY202606070005-L1'),
    returnRow(['LY20260608001', 'CK20260608001', 'LA-00501', 'LA-00500', '手持对讲机', 'UHF 400-470MHz', '资产-类资产', '张三', '工程部', '2', '2', '0', '2026-06-20', returnStatusBadge('待确认')], '待确认', 'LY20260608001-LA-002'),
    returnRow(['LY202510006', 'LY202510006-CK001', 'GD001001-007', 'GD001001-007', '螺丝刀', '455', '资产-类资产', '王五', '设备部', '8', '8', '0', '2025-08-05', returnStatusBadge('已归还')], '已归还', 'LY202510006-GD007'),
  ];
  return listPage({
    desc: '出库时标记需归还的物资自动生成；仓管入库后待借用人确认，支持分批归还、延期与作废',
    tabs: ['全部', '待归还', '已延期', '待确认', '已归还', '已作废'],
    tabColumn: 13,
    searchPlaceholder: '领用单号、出库单号、资产编码、物资名称、借用人',
    filters: [{ label: '应还日期', key: 'dueDate', column: -1, options: ['全部', '近7天', '已超期'] }],
    columns: ['领用单号', '出库单号', '资产编码', '物资编码', '物资名称', '规格型号', '物资大类', '借用人', '借用人部门', '出库数量', '已还数量', '待还数量', '应还日期', '归还状态'],
    rows,
  });
}

const REFUND_BY_ACCEPT = {
  'GH2025004-YS02': 'GH2025004-YS02-TH',
  'GH2025003-YS01': 'GH2025003-YS01-TH',
  'GH2025002-YS01': 'RK202509002-TH01',
};

const REFUND_PENDING_SAMPLES = {
  'GH2025004-YS02-TH': {
    refundKey: 'GH2025004-YS02-TH', scene: 'pre_inbound', refundNo: '', supplyNo: 'GH2025004', acceptNo: 'GH2025004-YS02', inboundNo: '—',
    supplier: '江苏华能电子有限公司', supplierStatus: '正常', contact: '王工', phone: '139 1111 2233', acceptDate: '2025-11-25',
    code: 'GD001001-004', name: '螺丝刀', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个',
    unqualifiedQty: '1', inboundQty: '0', refundedQty: '0', pendingQty: '1', materialType: 'fixed', status: '待退货',
    refundDate: '', refundReason: '', remark: '', operator: '', department: '', assetCodes: [], locations: [], createTime: '2025-11-25',
  },
  'GH2025003-YS01-TH': {
    refundKey: 'GH2025003-YS01-TH', scene: 'pre_inbound', refundNo: 'TH20251121001', supplyNo: 'GH2025003', acceptNo: 'GH2025003-YS01', inboundNo: '—',
    supplier: '河南蒲瑞', supplierStatus: '正常', contact: '李经理', phone: '138 0000 1234', acceptDate: '2025-11-20',
    code: 'GD001001-003', name: '钢丝绳', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: 'm',
    unqualifiedQty: '50', inboundQty: '0', refundedQty: '30', pendingQty: '20', materialType: 'like', status: '部分退货',
    refundDate: '2025-11-21', refundReason: '质量问题', remark: '首批已退 30m', operator: '张仓管', department: '物资管理部', assetCodes: [], locations: [], createTime: '2025-11-20',
  },
  'RK202509002-TH01': {
    refundKey: 'RK202509002-TH01', scene: 'post_inbound', refundNo: '', supplyNo: 'GH2025002', acceptNo: 'GH2025002-YS01', inboundNo: 'RK202509002',
    supplier: '鄂东办公用品', supplierStatus: '正常', contact: '陈经理', phone: '137 6666 7788', acceptDate: '2025-11-16',
    code: 'HC-00128', name: '安全帽', major: '耗材-劳保耗材', minor: '安全防护', spec: '标准型', unit: '顶',
    unqualifiedQty: '0', inboundQty: '200', refundedQty: '0', pendingQty: '50', materialType: 'consumable', status: '待退货',
    refundDate: '', refundReason: '', remark: '', operator: '', department: '', assetCodes: [], locations: [], createTime: '2026-06-01',
  },
  'TH202606030001': {
    refundKey: 'TH202606030001', scene: 'post_inbound', refundNo: 'TH202606030001', supplyNo: 'GH202605280002', acceptNo: '—', inboundNo: 'RK202606020015',
    supplier: '华建物资有限公司', supplierStatus: '正常', contact: '陈经理', phone: '138 8888 8821', acceptDate: '2026-05-28',
    code: 'DL-00234', name: '电缆 YJV-3×2.5', major: '资产-类资产', minor: '电气材料', spec: '3×2.5mm²', unit: 'm',
    unqualifiedQty: '0', inboundQty: '100', refundedQty: '100', pendingQty: '0', materialType: 'like', status: '已退货',
    refundDate: '2026-06-03', refundReason: '质量问题', remark: '规格不符，全量退供应商', operator: '张仓管', department: '物资管理部',
    assetCodes: [], locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '100' }], createTime: '2026-06-03',
  },
};

const REFUND_POST_FORM_PAGES = {
  fixed: 'warehouse_refund_fixed_form.html',
  like: 'warehouse_refund_like_form.html',
  consumable: 'warehouse_refund_consumable_form.html',
};

function refundFormPage(refundKey) {
  const sample = REFUND_PENDING_SAMPLES[refundKey];
  if (!sample) return 'warehouse_refund_form.html';
  if (sample.scene === 'pre_inbound') return 'warehouse_refund_pre_form.html';
  return REFUND_POST_FORM_PAGES[sample.materialType] || 'warehouse_refund_fixed_form.html';
}

function refundStatusBadge(status) {
  const map = { '待退货': 'warning', '部分退货': 'info', '已退货': 'success', '已关闭': 'danger' };
  return badge(status, map[status] || 'info');
}

function refundSceneBadge(scene) {
  return scene === 'pre_inbound' ? badge('验收前', 'warning') : badge('在库', 'info');
}

function refundRowActions(refundKey, status) {
  const formHref = refundFormPage(refundKey);
  const q = (extra = {}) => {
    const p = new URLSearchParams({ refundKey, back: 'warehouse_refund_list.html', ...extra });
    return p.toString();
  };
  if (status === '已退货' || status === '已关闭') {
    return `<a href="${formHref}?${q({ mode: 'view' })}" class="hover:underline">查看</a>`;
  }
  return `<a href="${formHref}?${q({ mode: 'view' })}" class="mr-2 hover:underline">查看</a><a href="${formHref}?${q()}" class="hover:underline">退货</a>`;
}

function refundRow(cells, status, refundKey) {
  const tabMap = { '待退货': '待退货', '部分退货': '部分退货', '已退货': '已退货', '已关闭': '已关闭' };
  return { cells, tab: tabMap[status] || '待退货', actions: refundRowActions(refundKey, status) };
}

function refundReadonlyGrid(pairs) {
  const pair = (label, key, value) =>
    `<td class="w-[18%] bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">${label}</td><td class="px-4 py-2.5 text-sm text-slate-800" data-refund-field="${key}">${value}</td>`;
  const row = (left, right, border = true) =>
    `<tr${border ? ' class="border-t border-slate-200"' : ''}>${pair(left[0], left[1], left[2])}${pair(right[0], right[1], right[2])}</tr>`;
  const rows = pairs.map((p, i) => row(p[0], p[1], i > 0)).join('');
  return `<div class="md:col-span-2 overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm"><tbody>${rows}</tbody></table>
  </div>`;
}

function refundSourceGrid(d) {
  const docRow = d.scene === 'pre_inbound'
    ? [['验收单号', 'acceptNo', d.acceptNo], ['验收日期', 'acceptDate', d.acceptDate]]
    : [['验收单号', 'acceptNo', d.acceptNo || '—'], ['入库单号', 'inboundNo', d.inboundNo || '—']];
  return refundReadonlyGrid([
    [['供货单号', 'supplyNo', d.supplyNo], ['供应商', 'supplier', d.supplier]],
    [['联系人', 'contact', d.contact || '—'], ['联系电话', 'phone', d.phone || '—']],
    docRow,
  ]);
}

function refundMaterialGrid(d) {
  const qtyRow = d.scene === 'pre_inbound'
    ? [['不合格数量', 'unqualifiedQty', d.unqualifiedQty], ['已退数量', 'refundedQty', d.refundedQty]]
    : [['已入库数量', 'inboundQty', d.inboundQty], ['已退数量', 'refundedQty', d.refundedQty]];
  return refundReadonlyGrid([
    [['物资编码', 'code', d.code], ['物资名称', 'name', d.name]],
    [['物资大类', 'major', d.major], ['物资子类', 'minor', d.minor]],
    [['规格型号', 'spec', d.spec], ['计量单位', 'unit', d.unit]],
    qtyRow,
    [['待退数量', 'pendingQty', `<span class="font-semibold text-slate-900">${d.pendingQty}</span>`], ['退货场景', 'sceneLabel', refundSceneBadge(d.scene)]],
  ]);
}

function refundLocationRowHtml(deletable = false) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const delBtn = deletable
    ? `<button type="button" class="mb-0.5 shrink-0 text-sm text-rose-600 hover:underline" data-refund-loc-remove>删除</button>`
    : '<span class="w-10"></span>';
  return `<div class="refund-loc-row mb-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_100px_auto] sm:items-end" data-refund-loc-row>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 仓库</label><select data-refund-warehouse class="${inputCls}"><option value="" disabled selected>请选择</option><option>主仓库</option><option>辅仓库</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">货架</label><select data-refund-shelf class="${inputCls}"><option value="" disabled selected>请选择</option><option>CK001001-HJ001</option><option>CK001001-HJ002</option><option>CK001001-HJ003</option><option>CK001001-HJ101</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600">架层</label><select data-refund-level class="${inputCls}"><option value="" disabled selected>请选择</option><option>1层</option><option>2层</option><option>3层</option></select></div>
    <div><label class="mb-1 block text-xs font-medium text-slate-600"><span class="text-rose-500">*</span> 数量</label><input type="number" min="1" data-refund-qty placeholder="请输入" class="${inputCls}" /></div>
    ${delBtn}
  </div>`;
}

function refundLocationsSection(viewMode = false, locations = []) {
  if (viewMode && locations.length) {
    const tr = locations.map((loc, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 text-sm">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm">${loc.shelf}</td><td class="px-3 py-2.5 text-sm">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium">${loc.qty}</td></tr>`
    ).join('');
    return `<div class="md:col-span-2" data-wms-refund-locations>
      <div class="mb-2"><h4 class="text-sm font-semibold text-slate-800">扣减货位</h4></div>
      <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">仓库</th><th class="px-3 py-2 text-left text-xs text-slate-500">货架</th><th class="px-3 py-2 text-left text-xs text-slate-500">架层</th><th class="px-3 py-2 text-left text-xs text-slate-500">数量</th></tr></thead><tbody>${tr}</tbody></table></div>
    </div>`;
  }
  return `<div class="md:col-span-2" data-wms-refund-locations>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-semibold text-slate-800">扣减货位</h4>
      <button type="button" class="text-sm font-medium text-slate-700 hover:underline" data-refund-loc-add>添加</button>
    </div>
    <div data-refund-loc-list>${refundLocationRowHtml(false)}</div>
    <p class="mt-2 text-xs text-slate-500">从指定货位扣减库存后退至供应商；各行数量之和不超过待退数量 <strong data-refund-pending-qty-display>—</strong></p>
  </div>`;
}

function refundFixedAssetSection(viewMode = false, assetCodes = [], backHref = 'warehouse_refund_list.html', refundKey = '') {
  if (viewMode && assetCodes.length) {
    const tr = assetCodes.map((c, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 font-mono text-sm">${c}</td><td class="px-3 py-2.5 text-sm">主仓库/B区</td></tr>`
    ).join('');
    return `<div class="md:col-span-2" data-wms-refund-assets>
      <div class="mb-2"><h4 class="text-sm font-semibold text-slate-800">退货资产编码</h4></div>
      <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">资产编码</th><th class="px-3 py-2 text-left text-xs text-slate-500">所在货位</th></tr></thead><tbody>${tr}</tbody></table></div>
    </div>`;
  }
  const selectHref = `warehouse_refund_select_asset.html?back=${encodeURIComponent(backHref)}&refundKey=${encodeURIComponent(refundKey)}`;
  return `<div class="md:col-span-2" data-wms-refund-assets>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-semibold text-slate-800">退货资产 <span class="text-xs font-normal text-slate-500">（须绑定在库资产编码）</span></h4>
      <div class="flex flex-wrap gap-2">
        <button type="button" id="wms-refund-scan-asset" class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-qrcode"></i> 扫码添加</button>
        <a href="${selectHref}" class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-magnifying-glass"></i> 选择资产</a>
      </div>
    </div>
    <div class="min-h-[3rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3" data-refund-asset-list>
      <p class="text-sm text-slate-400" data-refund-asset-empty>尚未选择资产编码</p>
    </div>
    <p class="mt-2 text-xs text-slate-500">已选 <strong data-refund-asset-count>0</strong> 件，待退 <strong data-refund-pending-qty-display>—</strong> 件</p>
  </div>`;
}

function refundConsumableQtySection(viewMode = false, d = {}) {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  if (viewMode) {
    const qty = d.locations?.[0]?.qty || d.refundedQty || '—';
    return `<div class="md:col-span-2" data-wms-refund-consumable-qty>
      <label class="mb-1.5 block text-sm font-medium text-slate-700">本次退货数量</label>
      <input type="text" value="${qty}" readonly class="${roCls}" data-refund-field="thisRefundQty" />
      <p class="mt-2 text-xs text-slate-500">系统已按 FIFO 原则从最早入库批次扣减</p>
    </div>`;
  }
  return `<div class="md:col-span-2" data-wms-refund-consumable-qty>
    <label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 本次退货数量</label>
    <input type="number" min="1" placeholder="请输入" data-refund-field="thisRefundQty" class="${inputCls}" />
    <p class="mt-2 text-xs text-slate-500">系统将按 <strong>FIFO</strong> 原则从最早入库批次自动扣减，无需手工指定货位</p>
  </div>`;
}

function refundReasonSelect(d, viewMode, inputCls, disAttr) {
  const reasons = ['质量问题', '多供', '规格不符', '其他'];
  if (viewMode) {
    return `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">退货原因</label><input type="text" readonly value="${d.refundReason || '—'}" data-refund-field="refundReason" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" /></div>`;
  }
  const opts = reasons.map(r => `<option${d.refundReason === r ? ' selected' : ''}>${r}</option>`).join('');
  return `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 退货原因</label><select data-refund-field="refundReason"${disAttr} class="${inputCls}"><option value="" disabled${!d.refundReason ? ' selected' : ''}>请选择</option>${opts}</select></div>`;
}

function warehouseRefundPreFormPage(backHref = 'warehouse_refund_list.html', sample = {}) {
  const d = { ...REFUND_PENDING_SAMPLES['GH2025004-YS02-TH'], ...sample };
  const viewMode = !!d.viewMode;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const disAttr = viewMode ? ' disabled' : '';
  const refundNo = d.refundNo || `TH${new Date().toISOString().slice(0, 10).replace(/-/g, '')}001`;
  const preBanner = !viewMode ? `<div class="md:col-span-2 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-clipboard-check text-orange-500"></i> 验收不合格退货</div>
    <p class="text-xs text-slate-600">物资尚未入库或在途待入账面；确认退货后回写供货单退货数量，合格品可继续入库。</p>
  </div>` : '';

  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-refund-form data-refund-scene="pre_inbound">
      <div class="wms-modal-form wms-warehouse-form wms-refund-form">
        ${formSection('来源信息')}
        ${refundSourceGrid(d)}
        ${formSection('物资信息')}
        ${refundMaterialGrid(d)}
        ${formSection('退货信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">退货单号</label><input type="text" value="${refundNo}" readonly data-refund-field="refundNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 退货日期</label><input type="date" value="${d.refundDate || '2026-06-09'}" data-refund-field="refundDate"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`} /></div>
        ${refundReasonSelect(d, viewMode, inputCls, disAttr)}
        ${viewMode
    ? `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">本次退货数量</label><input type="text" readonly value="${d.locations?.[0]?.qty || d.pendingQty || '—'}" class="${roCls}" /></div>`
    : `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 本次退货数量</label><input type="number" min="1" placeholder="请输入" data-refund-field="thisRefundQty" class="${inputCls}" /><p class="mt-2 text-xs text-slate-500">不超过待退数量 <strong data-refund-pending-qty-display>${d.pendingQty}</strong> ${d.unit}</p></div>`}
        ${preBanner}
        ${formSection('其他信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">退货说明</label><textarea rows="3" placeholder="0/500" data-refund-field="remark"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`}>${d.remark || ''}</textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">退货照片</label>${viewMode ? '<p class="text-sm text-slate-400">—</p>' : photoUploadZone()}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 经办人</label><select data-refund-field="operator"${disAttr} class="${inputCls}"><option value="" disabled${!d.operator ? ' selected' : ''}>请选择</option><option${d.operator === '张仓管' ? ' selected' : ''}>张仓管</option><option${d.operator === '李仓管' ? ' selected' : ''}>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 经办部门</label><select data-refund-field="department"${disAttr} class="${inputCls}"><option value="" disabled${!d.department ? ' selected' : ''}>请选择</option><option${d.department === '物资管理部' ? ' selected' : ''}>物资管理部</option><option${d.department === '设备部' ? ' selected' : ''}>设备部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-refund-back-link>${viewMode ? '关闭' : '取消'}</a>
        ${viewMode ? '' : '<button type="button" class="wms-btn wms-btn-primary" data-refund-submit>确定</button>'}
      </div>
    </div>`;
}

function warehouseRefundPostFormPage(backHref = 'warehouse_refund_list.html', sample = {}) {
  const d = { ...REFUND_PENDING_SAMPLES['RK202509002-TH01'], ...sample };
  const viewMode = !!d.viewMode;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const disAttr = viewMode ? ' disabled' : '';
  const isFixed = d.materialType === 'fixed';
  const isLike = d.materialType === 'like';
  const isConsumable = d.materialType === 'consumable';
  const refundNo = d.refundNo || `TH${new Date().toISOString().slice(0, 10).replace(/-/g, '')}001`;
  const fixedBanner = isFixed && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-qrcode text-blue-500"></i> 在库固定资产须绑定资产编码</div>
    <p class="text-xs text-slate-600">扫码或选择在库资产编码，确认退货后资产状态变为已退供应商，并扣减台账。</p>
  </div>` : '';
  const likeBanner = isLike && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-screwdriver-wrench text-amber-600"></i> 在库类资产按货位扣减</div>
    <p class="text-xs text-slate-600">从指定货位扣减库存后退至供应商；支持分批退货。</p>
  </div>` : '';
  const consumableBanner = isConsumable && !viewMode ? `<div class="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
    <div class="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-boxes-stacked text-emerald-600"></i> 在库耗材按数量退货</div>
    <p class="text-xs text-slate-600">消耗型物资，系统默认按 FIFO 从最早批次扣减后生成 TH 流水。</p>
  </div>` : '';
  const typeBanner = fixedBanner || likeBanner || consumableBanner;
  const typeSpecific = isFixed
    ? refundFixedAssetSection(viewMode, d.assetCodes, backHref, d.refundKey)
    : isLike
      ? refundLocationsSection(viewMode, d.locations)
      : refundConsumableQtySection(viewMode, d);

  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-refund-form data-refund-scene="post_inbound" data-refund-material-type="${d.materialType}">
      <div class="wms-modal-form wms-warehouse-form wms-refund-form">
        ${formSection('来源信息')}
        ${refundSourceGrid(d)}
        ${formSection('物资信息')}
        ${refundMaterialGrid(d)}
        ${formSection('退货信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">退货单号</label><input type="text" value="${refundNo}" readonly data-refund-field="refundNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 退货日期</label><input type="date" value="${d.refundDate || '2026-06-09'}" data-refund-field="refundDate"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`} /></div>
        ${refundReasonSelect(d, viewMode, inputCls, disAttr)}
        ${typeSpecific}
        ${typeBanner}
        ${formSection('其他信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">退货说明</label><textarea rows="3" placeholder="0/500" data-refund-field="remark"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`}>${d.remark || ''}</textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">退货照片</label>${viewMode ? '<p class="text-sm text-slate-400">—</p>' : photoUploadZone()}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 经办人</label><select data-refund-field="operator"${disAttr} class="${inputCls}"><option value="" disabled${!d.operator ? ' selected' : ''}>请选择</option><option${d.operator === '张仓管' ? ' selected' : ''}>张仓管</option><option${d.operator === '李仓管' ? ' selected' : ''}>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 经办部门</label><select data-refund-field="department"${disAttr} class="${inputCls}"><option value="" disabled${!d.department ? ' selected' : ''}>请选择</option><option${d.department === '物资管理部' ? ' selected' : ''}>物资管理部</option><option${d.department === '设备部' ? ' selected' : ''}>设备部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-refund-back-link>${viewMode ? '关闭' : '取消'}</a>
        ${viewMode ? '' : '<button type="button" class="wms-btn wms-btn-primary" data-refund-submit>确定</button>'}
      </div>
    </div>`;
}

function refundSuccessPage() {
  return `
    <div class="mx-auto max-w-2xl" data-wms-refund-success>
      <div class="card rounded-2xl bg-white p-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><i class="fa-solid fa-check text-2xl"></i></div>
        <h2 class="text-xl font-semibold text-slate-900" data-refund-success-title>退货成功</h2>
        <p class="mt-2 text-sm text-slate-500" data-refund-success-desc>退货单号 TH202606090001 · 供货单 GH2025004</p>
        <dl class="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left text-sm sm:grid-cols-2">
          <div><dt class="text-slate-500">物资名称</dt><dd class="mt-1 font-medium text-slate-900" data-refund-success-name>螺丝刀</dd></div>
          <div><dt class="text-slate-500">退货场景</dt><dd class="mt-1 text-slate-800" data-refund-success-scene>验收前</dd></div>
          <div><dt class="text-slate-500">供应商</dt><dd class="mt-1 text-slate-800" data-refund-success-supplier>江苏华能电子有限公司</dd></div>
          <div><dt class="text-slate-500">退货数量</dt><dd class="mt-1 text-slate-800" data-refund-success-qty>1 个</dd></div>
        </dl>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="ledger_transaction.html" class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-right-left"></i> 出入库记录</a>
          <a href="warehouse_refund_list.html" class="text-sm text-slate-500 hover:text-slate-900">返回退货列表</a>
        </div>
      </div>
    </div>`;
}

function warehouseRefundListPage() {
  const rows = [
    refundRow(['—', refundSceneBadge('pre_inbound'), 'GH2025004', 'GH2025004-YS02', '—', '江苏华能电子有限公司', 'GD001001-004', '螺丝刀', '455', '资产-固定资产', '1', '0', refundStatusBadge('待退货'), '2025-11-25'], '待退货', 'GH2025004-YS02-TH'),
    refundRow(['TH20251121001', refundSceneBadge('pre_inbound'), 'GH2025003', 'GH2025003-YS01', '—', '河南蒲瑞', 'GD001001-003', '钢丝绳', '455', '资产-固定资产', '20', '30', refundStatusBadge('部分退货'), '2025-11-20'], '部分退货', 'GH2025003-YS01-TH'),
    refundRow(['—', refundSceneBadge('post_inbound'), 'GH2025002', 'GH2025002-YS01', 'RK202509002', '鄂东办公用品', 'HC-00128', '安全帽', '标准型', '耗材-劳保耗材', '50', '0', refundStatusBadge('待退货'), '2026-06-01'], '待退货', 'RK202509002-TH01'),
    refundRow(['TH202606030001', refundSceneBadge('post_inbound'), 'GH202605280002', '—', 'RK202606020015', '华建物资有限公司', 'DL-00234', '电缆 YJV-3×2.5', '3×2.5mm²', '资产-类资产', '0', '100', refundStatusBadge('已退货'), '2026-06-03'], '已退货', 'TH202606030001'),
  ];
  return listPage({
    desc: '验收不合格或在库发现问题自动生成待退任务；确认后回写供货单并生成 TH 流水',
    addBtn: true, addHref: 'warehouse_refund_form.html',
    tabs: ['待退货', '部分退货', '已退货', '已关闭'],
    tabColumn: 12,
    searchPlaceholder: '退货单号、供货单号、验收单号、入库单号、物资名称、供应商',
    filters: [
      { label: '退货场景', key: 'scene', column: 1, options: ['全部', '验收前', '在库'] },
      { label: '退货日期', key: 'refundDate', column: -1, options: ['全部', '近7天', '近30天'] },
    ],
    columns: ['退货单号', '退货场景', '供货单号', '验收单号', '入库单号', '供应商', '物资编码', '物资名称', '规格型号', '物资大类', '待退数量', '已退数量', '退货状态', '创建时间'],
    rows,
  });
}

const SCRAP_PICKER_ROWS = [
  { type: 'fixed', code: 'ZC202606001', name: '笔记本电脑', categoryPath: '资产类 / 固定资产 / 办公设备', unit: '台', stock: '1', warehouse: '主仓库/B区', assetCode: 'ZC202606001', location: 'B-03', assetStatus: '在库' },
  { type: 'like', code: 'LA-00456', name: '电钻', categoryPath: '资产类 / 类资产 / 电动工具', unit: '台', stock: '6', warehouse: '主仓库/A区', assetCode: '—', location: 'A-02', assetStatus: '在库' },
  { type: 'consumable', code: 'GD001001-006', name: '润滑油', categoryPath: '耗材类 / 生产耗材', unit: '桶', stock: '15', warehouse: '主仓库/A区', assetCode: '—', location: 'A-01', assetStatus: '在库' },
  { type: 'consumable', code: 'HC-00089', name: '打印纸 A4', categoryPath: '耗材类 / 办公耗材', unit: '箱', stock: '170', warehouse: '主仓库/A区', assetCode: '—', location: 'A-02', assetStatus: '在库' },
];

const SCRAP_FORM_SAMPLE_LINES = [
  { seq: 1, materialType: 'like', code: 'LA-00456', assetCode: '—', name: '电钻', spec: '650W', major: '资产-类资产', location: '主仓库/A区/A-02', available: '6', scrapQty: '2', remark: '电机烧毁' },
  { seq: 2, materialType: 'consumable', code: 'GD001001-006', assetCode: '—', name: '润滑油', spec: 'CD 15W-40', major: '耗材-生产耗材', location: '主仓库/A区/A-01', available: '15', scrapQty: '3', remark: '超过保质期' },
];

const PENDING_SCRAP_POOL = {
  'POOL-LA-00502': { poolKey: 'POOL-LA-00502', assetCode: 'LA-00502', code: 'LA-00500', name: '手持对讲机', spec: 'UHF 400-470MHz', major: '资产-类资产', unit: '台', qty: '1', location: '主仓库/待报废区', assetStatus: '待报废', sourceType: '归还损坏', sourceDocNo: 'HK20260608004', inboundDate: '2026-06-09', remark: '归还验收判定损坏，主板烧毁' },
  'POOL-GD008': { poolKey: 'POOL-GD008', assetCode: 'GD001001-008', code: 'GD001001-008', name: '铝合金梯', spec: '3m', major: '资产-固定资产', unit: '架', qty: '1', location: '主仓库/待报废区', assetStatus: '待报废', sourceType: '归还损坏', sourceDocNo: 'HK20260607002', inboundDate: '2026-06-08', remark: '梯框变形无法修复' },
  'POOL-HC089': { poolKey: 'POOL-HC089', assetCode: '—', code: 'HC-00089', name: '打印纸 A4', spec: '70g/500张', major: '耗材-办公耗材', unit: '箱', qty: '12', location: '主仓库/A区/A-02', assetStatus: '待报废', sourceType: '在库过期', sourceDocNo: '—', inboundDate: '2026-06-07', remark: '受潮霉变，无法使用' },
};

const SCRAP_SAMPLES = {
  'ZF202606090001': {
    scrapKey: 'ZF202606090001', scrapNo: 'ZF202606090001', scrapType: 'pending_scrap', sourceType: '待报废转报废',
    sourceDocNo: 'HK20260608004', poolKey: 'POOL-LA-00502', status: '待执行', reason: '损坏无法修复',
    remark: '归还时判定损坏，对讲机主板烧毁，经设备部确认无法维修。',
    applicant: '张仓管', department: '物资管理部', warehouse: '主仓库', applyDate: '2026-06-09', lineCount: '1', totalQty: '1',
    lines: [{ seq: 1, materialType: 'like', code: 'LA-00500', assetCode: 'LA-00502', name: '手持对讲机', spec: 'UHF 400-470MHz', major: '资产-类资产', location: '主仓库/待报废区', available: '1', scrapQty: '1', remark: '归还损坏' }],
  },
  'ZF202606080002': {
    scrapKey: 'ZF202606080002', scrapNo: 'ZF202606080002', scrapType: 'in_stock', sourceType: '在库报废',
    sourceDocNo: '—', status: '已执行', reason: '过期失效',
    remark: '库内润滑油超过保质期，按制度核销。',
    applicant: '李仓管', department: '物资管理部', warehouse: '主仓库', applyDate: '2026-06-08', executedDate: '2026-06-08', lineCount: '1', totalQty: '5',
    lines: [{ seq: 1, materialType: 'consumable', code: 'GD001001-006', assetCode: '—', name: '润滑油', spec: 'CD 15W-40', major: '耗材-生产耗材', location: '主仓库/A区/A-01', available: '15', scrapQty: '5', remark: '过期批次' }],
  },
  'ZF202606070003': {
    scrapKey: 'ZF202606070003', scrapNo: 'ZF202606070003', scrapType: 'in_stock', sourceType: '在库报废',
    sourceDocNo: '—', status: '审核中', reason: '损坏无法修复',
    remark: '电钻多台电机故障，待物资管理部门审批。',
    applicant: '张仓管', department: '物资管理部', warehouse: '主仓库', applyDate: '2026-06-07', lineCount: '2', totalQty: '3',
    lines: SCRAP_FORM_SAMPLE_LINES,
  },
  'ZF202606060004': {
    scrapKey: 'ZF202606060004', scrapNo: 'ZF202606060004', scrapType: 'in_stock', sourceType: '在库报废',
    sourceDocNo: '—', status: '草稿', reason: '淘汰更新',
    remark: '旧型号办公设备计划淘汰，草稿待补充明细。',
    applicant: '张仓管', department: '物资管理部', warehouse: '主仓库', applyDate: '2026-06-06', lineCount: '0', totalQty: '0',
    lines: [],
  },
  'ZF202606050005': {
    scrapKey: 'ZF202606050005', scrapNo: 'ZF202606050005', scrapType: 'return_loss', sourceType: '归还灭失',
    sourceDocNo: 'LY202605200008', returnKey: 'LY202605200008-LA-00331', status: '已执行', reason: '丢失',
    remark: '借用人确认铝合金梯在工地丢失，无法找回。',
    applicant: '张仓管', department: '物资管理部', warehouse: '主仓库', applyDate: '2026-06-05', executedDate: '2026-06-05', lineCount: '1', totalQty: '1',
    lines: [{ seq: 1, materialType: 'like', code: 'LA-00330', assetCode: 'LA-00331', name: '铝合金梯', spec: '3m', major: '资产-类资产', location: '借出中', available: '1', scrapQty: '1', remark: '工地丢失' }],
  },
};

function scrapStatusBadge(status) {
  const map = { '草稿': 'info', '审核中': 'warning', '审核驳回': 'danger', '待执行': 'warning', '已执行': 'success' };
  return badge(status, map[status] || 'info');
}

function scrapSourceBadge(sourceType) {
  const map = { '在库报废': 'info', '归还灭失': 'danger', '待报废转报废': 'warning', '维修报废': 'warning' };
  return badge(sourceType, map[sourceType] || 'info');
}

function scrapRowActions(scrapKey, status) {
  const q = (extra = {}) => {
    const p = new URLSearchParams({ scrapKey, back: 'warehouse_scrap_list.html', ...extra });
    return p.toString();
  };
  if (status === '草稿') {
    return `<a href="warehouse_scrap_form.html?${q()}" class="mr-2 hover:underline">编辑</a><a href="#" class="text-rose-600 hover:underline" data-scrap-delete>删除</a>`;
  }
  if (status === '审核中' || status === '审核驳回') {
    return `<a href="warehouse_scrap_form.html?${q({ mode: 'view' })}" class="hover:underline">查看</a>`;
  }
  if (status === '待执行') {
    return `<a href="warehouse_scrap_form.html?${q({ mode: 'view' })}" class="mr-2 hover:underline">查看</a><a href="warehouse_scrap_execute.html?${q()}" class="font-medium text-rose-700 hover:underline">执行</a>`;
  }
  return `<a href="warehouse_scrap_form.html?${q({ mode: 'view' })}" class="hover:underline">查看</a>`;
}

function scrapRow(cells, status, scrapKey) {
  const tabMap = { '草稿': '草稿', '审核中': '审核中', '审核驳回': '审核中', '待执行': '待执行', '已执行': '已执行' };
  return { cells, tab: tabMap[status] || status, actions: scrapRowActions(scrapKey, status) };
}

function scrapQtyCell(row, viewMode = false) {
  const qtyCls = 'w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200';
  if (row.materialType === 'fixed' || viewMode) {
    return `<span class="font-medium text-slate-900">${row.scrapQty || '1'}</span>`;
  }
  return `<input type="number" min="1" max="${row.available}" value="${row.scrapQty || ''}" data-scrap-qty class="${qtyCls}" />`;
}

function scrapMaterialTable(rows = SCRAP_FORM_SAMPLE_LINES, { addHref = 'warehouse_scrap_add_material.html', viewMode = false } = {}) {
  const cols = ['序号', '物资编码', '资产编码', '物资名称', '规格型号', '物资大类', '货位', '可用库存', '作废数量', '备注', '操作'];
  const th = cols.map(c => {
    if (c === '操作' && viewMode) return '';
    if (c === '操作') return '<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>';
    const req = c === '作废数量' ? '<span class="text-rose-500">*</span> ' : '';
    return `<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${req}${c}</th>`;
  }).join('');
  const remarkCls = 'w-[100px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200';
  const tr = rows.length ? rows.map(r => {
    const typeHint = r.materialType === 'fixed' ? '<span class="ml-1 text-[10px] text-slate-400">固资</span>'
      : r.materialType === 'like' ? '<span class="ml-1 text-[10px] text-amber-600">类资产</span>'
        : '<span class="ml-1 text-[10px] text-emerald-600">耗材</span>';
    const actCell = viewMode ? '' : `<td class="px-3 py-2.5 text-right text-sm whitespace-nowrap"><button type="button" class="text-sm text-rose-600 hover:underline">删除</button></td>`;
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/60" data-scrap-row data-material-type="${r.materialType}">
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.seq}</td>
      <td class="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">${r.code}</td>
      <td class="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">${r.assetCode || '—'}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.name}${typeHint}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.spec}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.major}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.location}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${r.available}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${scrapQtyCell(r, viewMode)}</td>
      <td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">${viewMode ? (r.remark || '—') : `<input type="text" value="${r.remark || ''}" placeholder="备注" class="${remarkCls}" />`}</td>
      ${actCell}
    </tr>`;
  }).join('') : `<tr><td colspan="${viewMode ? 10 : 11}" class="px-3 py-8 text-center text-sm text-slate-400">暂无明细，请添加作废物资</td></tr>`;
  const addBtn = viewMode ? '' : `<div class="flex justify-end border-b border-slate-100 bg-white px-3 py-2">
        <a href="${addHref}" class="wms-requisition-add-btn"><i class="fa-solid fa-plus text-[10px]"></i> 添加物资</a>
      </div>`;
  return `<div class="wms-requisition-section md:col-span-2">
    <h3 class="wms-form-section-title mb-3">作废明细</h3>
    <div class="rounded-xl border border-slate-200">
      ${addBtn}
      <div class="wms-requisition-table-wrap overflow-x-auto wms-modal-table-wrap rounded-none border-0">
        <table class="min-w-[1050px] w-full text-sm wms-requisition-material-table"><thead class="bg-slate-50/90"><tr>${th}</tr></thead><tbody data-scrap-lines>${tr}</tbody></table>
      </div>
      <p class="border-t border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-500">
        <i class="fa-solid fa-circle-info mr-1 text-rose-500"></i>
        <strong>固定资产</strong>按资产编码逐件作废，数量固定为 1；
        <strong>类资产/耗材</strong>须填写作废数量，且不得超过可用库存。执行后将扣减台账并写入 scrap 流水。
      </p>
    </div>
  </div>`;
}

function warehouseScrapListPage() {
  const rows = [
    scrapRow(['ZF202606090001', scrapSourceBadge('待报废转报废'), 'HK20260608004', '手持对讲机', '1', '张仓管', '物资管理部', scrapStatusBadge('待执行'), '2026-06-09'], '待执行', 'ZF202606090001'),
    scrapRow(['ZF202606080002', scrapSourceBadge('在库报废'), '—', '润滑油', '5', '李仓管', '物资管理部', scrapStatusBadge('已执行'), '2026-06-08'], '已执行', 'ZF202606080002'),
    scrapRow(['ZF202606070003', scrapSourceBadge('在库报废'), '—', '电钻等 2 项', '3', '张仓管', '物资管理部', scrapStatusBadge('审核中'), '2026-06-07'], '审核中', 'ZF202606070003'),
    scrapRow(['ZF202606060004', scrapSourceBadge('在库报废'), '—', '—', '0', '张仓管', '物资管理部', scrapStatusBadge('草稿'), '2026-06-06'], '草稿', 'ZF202606060004'),
    scrapRow(['ZF202606050005', scrapSourceBadge('归还灭失'), 'LY202605200008', '铝合金梯', '1', '张仓管', '物资管理部', scrapStatusBadge('已执行'), '2026-06-05'], '已执行', 'ZF202606050005'),
  ];
  return listPage({
    desc: '对在库、待报废、维修中等状态的物资发起报废申请；审批通过后执行核销，扣减台账并写入 scrap 审计。归还灭失类作废由<a href="warehouse_return_list.html" class="font-medium text-slate-800 hover:underline">物资归还</a>入口发起并自动关联。',
    addBtn: true, addHref: 'warehouse_scrap_form.html',
    secondary: ['<a href="warehouse_scrap_pending_pool.html" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"><i class="fa-solid fa-dumpster text-xs"></i>待报废池 <span class="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-semibold">3</span></a>'],
    tabs: ['全部', '草稿', '审核中', '待执行', '已执行'],
    tabColumn: 7,
    searchPlaceholder: '作废单号、关联单号、物资名称、申请人',
    filters: [
      { label: '来源类型', key: 'source', column: 1, options: ['全部', '在库报废', '归还灭失', '待报废转报废', '维修报废'] },
    ],
    columns: ['作废单号', '来源类型', '关联单号', '物资摘要', '合计数量', '申请人', '申请部门', '状态', '申请时间'],
    rows,
  });
}

function warehouseScrapPendingPoolPage() {
  const rows = Object.values(PENDING_SCRAP_POOL).map(p => ({
    cells: [
      badge('待报废', 'warning'),
      scrapSourceBadge(p.sourceType === '归还损坏' ? '待报废转报废' : '在库报废'),
      p.assetCode !== '—' ? p.assetCode : '—',
      p.code,
      p.name,
      p.spec,
      p.major,
      p.location,
      `${p.qty} ${p.unit}`,
      p.sourceDocNo !== '—' ? p.sourceDocNo : '—',
      p.inboundDate,
    ],
    tab: '',
    actions: `<a href="warehouse_scrap_form.html?poolKey=${encodeURIComponent(p.poolKey)}&back=warehouse_scrap_pending_pool.html" class="font-medium text-rose-700 hover:underline">发起作废</a>`,
  }));
  return `
    <div class="mb-4"><a href="warehouse_scrap_list.html" class="text-sm text-slate-500 hover:text-slate-900"><i class="fa-solid fa-arrow-left mr-1"></i>返回作废列表</a></div>
    <div data-wms-list-page>
      <p class="mb-4 text-sm text-slate-500">归还验收判定<strong>损坏</strong>的物资进入待报废池，状态为「待报废」仍占用账面数量；须发起作废单审批执行后才核销库存。与<a href="warehouse_return_list.html" class="font-medium text-slate-800 hover:underline">物资归还</a>、<a href="ledger_warehouse.html" class="font-medium text-slate-800 hover:underline">仓库台账</a>联动。</p>
      <div class="mb-4 rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-slate-700">
        <i class="fa-solid fa-triangle-exclamation mr-1 text-amber-600"></i>
        待报废物资不可出库、不可再次领用；请尽快完成作废审批与执行。
      </div>
      ${listPageActions({ searchPlaceholder: '资产编码、物资编码、名称、来源单号' })}
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm">
        <div class="overflow-x-auto wms-modal-table-wrap"><table class="min-w-full wms-data-table"><thead class="bg-slate-50/80"><tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">资产状态</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">来源</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">资产编码</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">物资编码</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">物资名称</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">规格型号</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">物资大类</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">存放位置</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">数量</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">来源单号</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">入池日期</th>
          ${actionTh('px-4 py-3')}
        </tr></thead><tbody>${rows.map(r => `<tr class="border-t border-slate-100 hover:bg-slate-50/80">${r.cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}${actionTd(r.actions, 'px-4 py-3.5')}</tr>`).join('')}</tbody></table></div>
        ${listTableFooter(rows.length)}
      </div>
    </div>`;
}

function warehouseScrapFormPage(backHref = 'warehouse_scrap_list.html', sample = {}) {
  const d = {
    scrapNo: '系统自动生成', sourceType: '在库报废', sourceDocNo: '—', reason: '', remark: '',
    applicant: '张仓管', department: '物资管理部', warehouse: '主仓库', applyDate: '2026-06-09',
    lines: SCRAP_FORM_SAMPLE_LINES, status: '草稿', ...sample,
  };
  const viewMode = d.viewMode === true;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const disAttr = viewMode ? ' disabled' : '';
  const sourceReadonly = d.sourceType !== '在库报废' || viewMode;
  const reasonOptions = ['损坏无法修复', '过期失效', '淘汰更新', '丢失', '被盗', '事故损毁', '其他'];
  const reasonSelect = reasonOptions.map(o =>
    `<option${d.reason === o ? ' selected' : ''}${!d.reason && o === '损坏无法修复' && d.poolKey ? ' selected' : ''}>${o}</option>`
  ).join('');
  const poolBanner = d.poolKey ? `<div class="md:col-span-2 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-slate-700">
    <i class="fa-solid fa-circle-info mr-1 text-amber-600"></i>从<strong>待报废池</strong>发起，物资明细已预填且不可修改编码；提交后走 <code class="rounded bg-white/80 px-1 text-xs">WF-SCRAP</code> 审批。
  </div>` : '';
  const returnBanner = d.scrapType === 'return_loss' ? `<div class="md:col-span-2 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-xs text-slate-600">本单由归还作废自动生成，来源类型为<strong>归还灭失</strong>；不恢复库存，关闭待还记录。</div>` : '';
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-scrap-form data-scrap-key="${d.scrapKey || ''}">
      <div class="wms-modal-form wms-warehouse-form">
        ${formSection('基本信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">作废单号</label><input type="text" value="${d.scrapNo}" readonly data-scrap-field="scrapNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">来源类型</label><select data-scrap-field="sourceType"${sourceReadonly ? ' disabled' : ''} class="${sourceReadonly ? roCls : inputCls}"><option${d.sourceType === '在库报废' ? ' selected' : ''}>在库报废</option><option${d.sourceType === '待报废转报废' ? ' selected' : ''}>待报废转报废</option><option${d.sourceType === '维修报废' ? ' selected' : ''}>维修报废</option><option${d.sourceType === '归还灭失' ? ' selected' : ''}>归还灭失</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">关联单号</label><input type="text" value="${d.sourceDocNo}" readonly data-scrap-field="sourceDocNo" class="${roCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 所属仓库</label><select data-scrap-field="warehouse"${disAttr} class="${inputCls}"><option${d.warehouse === '主仓库' ? ' selected' : ''}>主仓库</option><option>备件库</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 作废原因</label><select data-scrap-field="reason"${disAttr} class="${inputCls}"><option value="" disabled${!d.reason ? ' selected' : ''}>请选择</option>${reasonSelect}</select></div>
        ${poolBanner}${returnBanner}
        ${scrapMaterialTable(d.lines || [], { addHref: d.poolKey ? '#' : 'warehouse_scrap_add_material.html', viewMode: viewMode || !!d.poolKey })}
        ${formSection('其他信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 说明</label><textarea rows="4" placeholder="请说明作废原因及处理情况（0/500）" data-scrap-field="remark"${disAttr} ${viewMode ? `readonly class="${roCls}"` : `class="${inputCls}"`}>${d.remark || (d.poolKey ? PENDING_SCRAP_POOL[d.poolKey]?.remark : '') || ''}</textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">附件</label>${viewMode ? '<p class="text-sm text-slate-400">—</p>' : uploadZone()}</div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 申请人</label><select data-scrap-field="applicant"${disAttr} class="${inputCls}"><option${d.applicant === '张仓管' ? ' selected' : ''}>张仓管</option><option${d.applicant === '李仓管' ? ' selected' : ''}>李仓管</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 申请部门</label><select data-scrap-field="department"${disAttr} class="${inputCls}"><option${d.department === '物资管理部' ? ' selected' : ''}>物资管理部</option><option>设备部</option></select></div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-scrap-back-link>${viewMode ? '关闭' : '取消'}</a>
        ${viewMode ? '' : `<button type="button" class="wms-btn wms-btn-secondary" data-scrap-save>保存草稿</button>
        <button type="button" class="wms-btn wms-btn-primary" data-scrap-submit>提交审批</button>`}
      </div>
    </div>`;
}

function warehouseScrapExecutePage(backHref = 'warehouse_scrap_list.html', sample = {}) {
  const d = { ...SCRAP_SAMPLES['ZF202606090001'], ...sample };
  const lineRows = (d.lines || []).map((r, i) =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 font-mono text-xs">${r.assetCode !== '—' ? r.assetCode : '—'}</td><td class="px-3 py-2.5 text-sm">${r.name}</td><td class="px-3 py-2.5 text-sm">${r.location}</td><td class="px-3 py-2.5 text-sm font-medium">${r.scrapQty} ${r.materialType === 'consumable' ? '桶' : r.materialType === 'like' ? '台' : '件'}</td></tr>`
  ).join('');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg" data-wms-scrap-execute data-scrap-key="${d.scrapKey}">
      <div class="mb-5 rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-slate-700">
        <i class="fa-solid fa-circle-exclamation mr-1 text-rose-600"></i>
        审批已通过。请现场核对物资后确认执行；执行后将<strong>扣减台账可用库存</strong>，资产状态变为「已作废」，并写入 <code class="rounded bg-white/80 px-1 text-xs">txn_type=scrap</code> 流水。
      </div>
      <dl class="mb-6 grid gap-4 sm:grid-cols-2 text-sm">
        <div><dt class="text-slate-500">作废单号</dt><dd class="mt-1 font-mono font-semibold text-slate-900" data-scrap-exec-field="scrapNo">${d.scrapNo}</dd></div>
        <div><dt class="text-slate-500">来源类型</dt><dd class="mt-1 text-slate-800" data-scrap-exec-field="sourceType">${d.sourceType}</dd></div>
        <div><dt class="text-slate-500">作废原因</dt><dd class="mt-1 text-slate-800" data-scrap-exec-field="reason">${d.reason}</dd></div>
        <div><dt class="text-slate-500">申请人</dt><dd class="mt-1 text-slate-800">${d.applicant} · ${d.department}</dd></div>
        <div class="sm:col-span-2"><dt class="text-slate-500">说明</dt><dd class="mt-1 text-slate-800">${d.remark}</dd></div>
      </dl>
      <h4 class="mb-3 text-sm font-semibold text-slate-900">作废明细</h4>
      <div class="mb-4 overflow-hidden rounded-xl border border-slate-200">
        <table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">序号</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">资产编码</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">物资名称</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">货位</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">作废数量</th>
        </tr></thead><tbody>${lineRows}</tbody></table>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-600">
        <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><i class="fa-solid fa-qrcode text-blue-500"></i> 现场核对（可选）</div>
        固定资产建议扫码确认资产编码；类资产/耗材核对货位与数量无误后执行。
        <button type="button" class="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" data-scrap-scan><i class="fa-solid fa-barcode"></i> 模拟扫码核对</button>
      </div>
      <div class="wms-modal-footer mt-6">
        <a href="${backHref}" class="wms-btn wms-btn-secondary" data-scrap-back-link>取消</a>
        <button type="button" class="wms-btn wms-btn-primary bg-rose-600 hover:bg-rose-700" data-scrap-execute-submit>确认执行作废</button>
      </div>
    </div>`;
}

function scrapSuccessPage() {
  return `
    <div class="mx-auto max-w-2xl" data-wms-scrap-success>
      <div class="card rounded-2xl bg-white p-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600"><i class="fa-solid fa-check text-2xl"></i></div>
        <h2 class="text-xl font-semibold text-slate-900" data-scrap-success-title>作废执行成功</h2>
        <p class="mt-2 text-sm text-slate-500" data-scrap-success-desc>作废单号 ZF202606090001 · 已扣减台账库存</p>
        <dl class="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left text-sm sm:grid-cols-2">
          <div><dt class="text-slate-500">来源类型</dt><dd class="mt-1 text-slate-800" data-scrap-success-source>待报废转报废</dd></div>
          <div><dt class="text-slate-500">作废数量</dt><dd class="mt-1 font-medium text-slate-900" data-scrap-success-qty>1 台</dd></div>
          <div><dt class="text-slate-500">物资摘要</dt><dd class="mt-1 text-slate-800" data-scrap-success-name>手持对讲机</dd></div>
          <div><dt class="text-slate-500">流水类型</dt><dd class="mt-1 font-mono text-xs text-slate-600">txn_type=scrap</dd></div>
        </dl>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="ledger_transaction.html" class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-right-left"></i> 出入库记录</a>
          <a href="warehouse_scrap_list.html" class="text-sm text-slate-500 hover:text-slate-900">返回作废列表</a>
        </div>
      </div>
    </div>`;
}

function formSection(title) {
  return `<div class="wms-form-section md:col-span-2"><h3 class="wms-form-section-title">${title}</h3></div>`;
}

function uploadZone() {
  return `<div class="wms-upload-zone">
    <i class="fa-solid fa-cloud-arrow-up text-lg text-slate-400"></i>
    <p class="mt-2 text-sm text-slate-600">上传文件</p>
    <p class="mt-1 text-xs text-slate-400">支持 .rar .zip .doc .docx .pdf，单个文件不能超过 500MB</p>
  </div>`;
}

function photoUploadZone() {
  return `<div class="wms-photo-upload">
    <button type="button" class="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50">
      <i class="fa-solid fa-plus text-lg"></i>
      <span class="mt-1 text-xs">上传图片</span>
    </button>
    <p class="mt-2 text-xs text-slate-400">支持 .jpg .jpeg .png，单个文件不能超过 100MB</p>
  </div>`;
}

function formRadioGroup(label, options, req = true) {
  const reqMark = req ? '<span class="text-rose-500">*</span> ' : '';
  const radios = options.map((o, i) =>
    `<label class="inline-flex items-center gap-2 text-sm text-slate-700">
      <input type="radio" name="${label}" class="border-slate-300 text-slate-900"${i === 0 ? ' checked' : ''} />
      <span>${o}</span>
    </label>`
  ).join('');
  return `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">${reqMark}${label}</label><div class="flex flex-wrap gap-4 pt-1">${radios}</div></div>`;
}

function unitConversionField(main = '', aux = '') {
  return `<div class="md:col-span-2">
    <label class="mb-1.5 block text-sm font-medium text-slate-700">主辅单位换算</label>
    <div class="flex flex-wrap items-center gap-2 text-sm text-slate-700">
      <span class="text-slate-500">1</span>
      <input type="text" placeholder="请输入主单位" class="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" value="${main}" />
      <span class="text-slate-400">：</span>
      <input type="text" placeholder="请输入辅单位" class="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" value="${aux}" />
    </div>
    <p class="mt-1.5 text-xs text-slate-400">注释：主单位即为 1，填写换算比</p>
  </div>`;
}

const MATERIAL_CATALOG_ROWS = [
  { code: 'GD001001-001', type: 'fixed', enabled: true, categoryCode: 'ZC-GD-002', categoryPath: '资产类 / 固定资产 / 设备-配件 / 抓斗', name: '抓斗', spec: '4m³-Q345B', major: '资产-固定资产', minor: '设备-配件', unit: '个', price: '10000.00', returnNeed: '需要', borrowDays: '30天', needInventory: '是', needServiceLife: '是', serviceLifeYears: '10', currentStock: '—', availableStock: '—', alert: 'normal' },
  { code: 'GD001001-002', type: 'fixed', enabled: true, categoryCode: 'ZC-GD-002', categoryPath: '资产类 / 固定资产 / 设备-配件 / 料斗', name: '料斗', spec: '10m³移动式', major: '资产-固定资产', minor: '设备-配件', unit: '个', price: '10000.00', returnNeed: '需要', borrowDays: '30天', needInventory: '是', needServiceLife: '是', serviceLifeYears: '8', currentStock: '—', availableStock: '—', alert: 'normal' },
  { code: 'GD001001-004', type: 'fixed', enabled: false, categoryCode: 'ZC-GD-002', categoryPath: '资产类 / 固定资产 / 电动工具 / 螺丝刀', name: '螺丝刀', spec: '十字-PH2-300mm', major: '资产-固定资产', minor: '设备-配件', unit: '个', price: '10000.00', returnNeed: '不需要', borrowDays: '—', needInventory: '否', needServiceLife: '否', serviceLifeYears: '—', currentStock: '—', availableStock: '—', alert: 'normal' },
  { code: 'LA-00456', type: 'like', enabled: true, categoryCode: 'LA-ZC-001001', categoryPath: '资产类 / 类资产 / 电动工具 / 电钻', name: '电钻', spec: '工业级', major: '资产-类资产', minor: '电钻', unit: '台', price: '680.00', returnNeed: '需要', borrowDays: '15天', needInventory: '是', needServiceLife: '是', serviceLifeYears: '5', safeStock: '10', minStock: '5', maxStock: '20', currentStock: '8', availableStock: '6', alert: 'normal' },
  { code: 'GD001001-006', type: 'consumable', enabled: true, categoryCode: 'HC-SC-001', categoryPath: '耗材类 / 生产耗材 / 设备-配件 / 润滑油', name: '润滑油', spec: 'CD 15W-40', major: '耗材-生产耗材', minor: '设备-配件', unit: '桶', price: '10000.00', safeStock: '50', minStock: '20', maxStock: '200', currentStock: '18', availableStock: '15', alert: 'warning' },
  { code: 'HC-00089', type: 'consumable', enabled: true, categoryCode: 'HC-BG-001002', categoryPath: '耗材类 / 办公耗材 / 办公用纸 / 打印纸 A4', name: '打印纸 A4', spec: '70g/500张', major: '耗材-办公耗材', minor: '打印纸 A4', unit: '箱', price: '120.00', safeStock: '100', minStock: '50', maxStock: '300', currentStock: '186', availableStock: '170', alert: 'normal' },
];

const MATERIAL_LIST_COLUMNS = [
  { key: 'seq', label: '序号', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'type', label: '物资类型', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'code', label: '物资编码', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'name', label: '物资名称', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'spec', label: '规格型号', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'category', label: '所属分类', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'enabled', label: '状态', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'unit', label: '主计量单位', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'price', label: '参考单价（元）', tabs: ['all', 'fixed', 'like', 'consumable'] },
  { key: 'returnNeed', label: '归还', tabs: ['all', 'fixed', 'like'] },
  { key: 'borrowDays', label: '借用周期', tabs: ['all', 'fixed', 'like'] },
  { key: 'needInventory', label: '是否需要盘点', tabs: ['all', 'fixed', 'like'] },
  { key: 'needServiceLife', label: '是否需要使用年限', tabs: ['all', 'fixed', 'like'] },
  { key: 'serviceLifeYears', label: '使用年限（年）', tabs: ['all', 'fixed', 'like'] },
  { key: 'safeStock', label: '安全库存', tabs: ['all', 'like', 'consumable'] },
  { key: 'minStock', label: '库存下限', tabs: ['all', 'like', 'consumable'] },
  { key: 'maxStock', label: '库存上限', tabs: ['all', 'like', 'consumable'] },
  { key: 'currentStock', label: '当前库存', tabs: ['all', 'like', 'consumable'] },
  { key: 'availableStock', label: '可用库存', tabs: ['all', 'like', 'consumable'] },
  { key: 'alert', label: '预警', tabs: ['all', 'like', 'consumable'] },
];

function materialAlertBadge(alert) {
  if (alert === 'warning') return badge('低于下限', 'warning');
  if (alert === 'danger') return badge('缺货', 'danger');
  return badge('正常', 'success');
}

function materialRowActions(code, enabled = true) {
  const view = `<a href="config_material_detail.html?code=${code}" class="mr-2 hover:underline">查看</a>`;
  const edit = enabled ? `<a href="config_material_form.html?code=${code}&mode=edit" class="mr-2 hover:underline">编辑</a>` : '';
  const disable = enabled
    ? `<button type="button" class="text-amber-600 hover:underline wms-material-disable" data-material-code="${code}">停用</button>`
    : `<span class="text-slate-400 text-xs">已停用</span>`;
  return `${view}${edit}${disable}`;
}

function materialCatalogRowCells(row, index) {
  const enabledBadge = row.enabled ? badge('启用', 'success') : badge('停用', 'danger');
  const map = {
    seq: String(index + 1),
    type: materialTypeBadge(row.type),
    code: `<span class="font-mono text-xs">${row.code}</span>`,
    name: row.name,
    spec: row.spec,
    category: `<span class="text-xs"><span class="font-mono text-slate-500">${row.categoryCode}</span> · ${row.minor}</span>`,
    enabled: enabledBadge,
    unit: row.unit,
    price: row.price,
    returnNeed: row.returnNeed || '—',
    borrowDays: row.borrowDays || '—',
    needInventory: row.needInventory || '—',
    needServiceLife: row.needServiceLife || '—',
    serviceLifeYears: row.serviceLifeYears || '—',
    safeStock: row.safeStock || '—',
    minStock: row.minStock || '—',
    maxStock: row.maxStock || '—',
    currentStock: row.currentStock || '—',
    availableStock: row.availableStock || '—',
    alert: row.type === 'fixed' ? '—' : materialAlertBadge(row.alert || 'normal'),
  };
  return MATERIAL_LIST_COLUMNS.map(c => map[c.key]);
}

function materialCatalogPage() {
  const th = '<th class="w-10 px-3 py-3" data-col-check><input type="checkbox" class="rounded border-slate-300" title="全选" /></th>' +
    MATERIAL_LIST_COLUMNS.map(c =>
      `<th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap" data-material-col="${c.key}" data-show-tabs="${c.tabs.join(',')}">${c.label}</th>`
    ).join('') + actionTh();
  const tr = MATERIAL_CATALOG_ROWS.map((row, i) => {
    const cells = materialCatalogRowCells(row, i);
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-material-row data-material-type="${row.type}" data-material-enabled="${row.enabled}" data-material-alert="${row.alert || 'normal'}" data-material-category-path="${row.categoryPath || ''}">
      <td class="px-3 py-3" data-col-check><input type="checkbox" class="rounded border-slate-300 wms-material-check"${row.enabled && i < 2 ? ' checked' : ''}${row.enabled ? '' : ' disabled'} /></td>
      ${cells.map((cell, ci) => `<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap" data-material-col="${MATERIAL_LIST_COLUMNS[ci].key}" data-show-tabs="${MATERIAL_LIST_COLUMNS[ci].tabs.join(',')}">${cell}</td>`).join('')}
      ${actionTd(materialRowActions(row.code, row.enabled))}
    </tr>`;
  }).join('');
  const materialAddBtn = primaryAddBtn('config_material_form.html', 'data-wms-material-add');
  const materialSecondaryBtns = `
    <button type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-material-batch-disable><i class="fa-solid fa-ban text-xs text-amber-500"></i>批量停用</button>
    <button type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" title="P2"><i class="fa-solid fa-file-import text-xs text-slate-400"></i>导入</button>
    <button type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" title="P2"><i class="fa-solid fa-file-export text-xs text-slate-400"></i>导出</button>`;
  const materialStatusFilter = `<label class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
              <span class="text-slate-500 shrink-0">状态</span>
              <select data-wms-filter-enabled class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0">
                <option value="all" selected>全部</option><option value="true">启用</option><option value="false">停用</option>
              </select>
            </label>`;
  return `
    <p class="mb-4 text-sm text-slate-500">可采购/可领用物资主数据；须绑定分类叶子节点，业务规则默认继承分类并可覆盖。停用后不可被选入新计划/采购。</p>
    <div class="wms-material-layout">
      ${materialCatalogSidebarTree()}
      <div class="wms-material-main card min-w-0 rounded-2xl bg-white p-4 shadow-sm">
        <p class="mb-3 text-sm text-slate-500" data-wms-material-breadcrumb>当前分类：<span class="font-medium text-slate-800">全部物资</span></p>
        <div class="mb-3 flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto" data-wms-list-toolbar>
            ${materialStatusFilter}
            <label class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
              <span class="text-slate-500 shrink-0">库存预警</span>
              <select data-wms-filter-alert class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0">
                <option value="all" selected>全部</option><option value="warning">低于下限</option><option value="danger">缺货</option>
              </select>
            </label>
            <label class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
              <span class="text-slate-500 shrink-0">归还</span>
              <select data-wms-filter-return class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0">
                <option value="all" selected>全部</option><option value="需要">需要</option><option value="不需要">不需要</option>
              </select>
            </label>
            ${listSearchInput('物资编码、名称、规格型号').replace(/data-wms-list-search/g, 'data-wms-material-search').replace(/data-wms-list-search-clear/g, 'data-wms-material-search-clear')}
            <button type="button" class="hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" data-wms-material-filter-reset><i class="fa-solid fa-rotate-left text-xs"></i>重置</button>
            ${materialSecondaryBtns}
        </div>
        <div class="mb-4">${materialAddBtn}</div>
        <div class="overflow-hidden rounded-xl ring-1 ring-slate-100" data-wms-material-catalog>
          <div class="overflow-x-auto wms-modal-table-wrap"><table class="min-w-full text-sm wms-data-table" data-wms-material-table><thead class="bg-slate-50/80 sticky top-0"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span data-wms-material-count>共 ${MATERIAL_CATALOG_ROWS.length} 条 · 启用 ${MATERIAL_CATALOG_ROWS.filter(r => r.enabled).length} 条</span>
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex gap-1"><span class="rounded-lg bg-slate-900 px-3 py-1 text-white">1</span></div>
              <span class="text-slate-400">10 条/页</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="wms-material-toast" class="wms-qr-toast hidden" role="status"></div>`;
}

function materialFormPage(options = {}) {
  const { backHref = 'config_material_catalog.html', readonly = false, sample = null } = options;
  const ro = readonly;
  const inputCls = ro
    ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const field = (label, value, req = false, type = 'text', attrs = '') => {
    const reqMark = req && !ro ? '<span class="text-rose-500">*</span> ' : '';
    if (type === 'textarea') {
      return `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">${label}</label><textarea rows="3" placeholder="0/500" class="${inputCls}"${ro ? ' readonly' : ''}${attrs ? ` ${attrs}` : ''}>${typeof value === 'string' ? value : ''}</textarea></div>`;
    }
    const isRo = ro || (typeof value === 'string' && value.includes('系统'));
    const ph = isRo ? '' : ' placeholder="请输入"';
    return `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">${reqMark}${label}</label><input type="${type}" value="${typeof value === 'string' ? value : ''}" class="${isRo ? 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500' : inputCls}"${isRo ? ' readonly' : ph}${isRo ? ' readonly' : ''}${attrs ? ` ${attrs}` : ''} /></div>`;
  };
  const s = sample || {
    code: '系统自动生成', name: '', type: 'fixed',
    major: '', minor: '', spec: '',
    mainUnit: '', auxUnit: '', price: '',
    returnNeed: '需要', needInventory: '是', needServiceLife: '是', serviceLifeYears: '',
    safeStock: '', minStock: '', maxStock: '',
  };
  const matType = s.type || 'fixed';
  const isFixedForm = matType === 'fixed';
  const isAssetForm = matType === 'fixed' || matType === 'like';
  const isStockForm = matType === 'like' || matType === 'consumable';
  const returnRadios = ['需要', '不需要'].map((o) =>
    `<label class="inline-flex items-center gap-2 text-sm text-slate-700">
      <input type="radio" name="returnNeed" class="border-slate-300 text-slate-900" data-wms-material-return value="${o}"${(s.returnNeed || '需要') === o ? ' checked' : ''} />
      <span>${o}</span>
    </label>`
  ).join('');
  const inventoryRadios = ['是', '否'].map((o) =>
    `<label class="inline-flex items-center gap-2 text-sm text-slate-700">
      <input type="radio" name="needInventory" class="border-slate-300 text-slate-900" data-wms-material-inventory value="${o}"${(s.needInventory || '是') === o ? ' checked' : ''} />
      <span>${o}</span>
    </label>`
  ).join('');
  const serviceLifeRadios = ['是', '否'].map((o) =>
    `<label class="inline-flex items-center gap-2 text-sm text-slate-700">
      <input type="radio" name="needServiceLife" class="border-slate-300 text-slate-900" data-wms-material-service-life value="${o}"${(s.needServiceLife || '是') === o ? ' checked' : ''} />
      <span>${o}</span>
    </label>`
  ).join('');
  const body = `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl">
      <div class="wms-modal-form wms-warehouse-form" data-wms-material-form data-material-type="${matType}">
        ${ro ? '' : materialTypeTabs(matType)}
        ${formSection('基础信息')}
        ${field('物资编码', s.code)}
        ${field('物资名称', s.name || '', !ro)}
        ${field('规格型号', s.spec || '', !ro)}
        ${ro
    ? `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">物资大类</label><input type="text" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" value="${s.major || ''}" /></div>
           <div><label class="mb-1.5 block text-sm font-medium text-slate-700">物资子类</label><input type="text" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" value="${s.minor || ''}" /></div>`
    : `${materialMajorSelect(s.major, matType)}${materialMinorSelect(s.minor, s.major || materialMajorsForType(matType)[0])}`}
        ${formSection('计量核算信息')}
        ${unitSelect('主计量单位', s.mainUnit || '', { disabled: ro, required: !ro })}
        ${unitSelect('辅计量单位', s.auxUnit || '', { disabled: ro })}
        ${ro ? field('主辅单位换算', s.conversion || '—') : unitConversionField()}
        ${field('参考单价（元）', s.price || '', !ro, 'number')}
        <div class="md:col-span-2${isFixedForm ? '' : ' hidden'}" data-wms-material-business-return>
          ${formSection('业务信息')}
          ${ro ? field('归还', s.returnNeed || '—') : `<div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 归还</label><div class="flex flex-wrap gap-4 pt-1">${returnRadios}</div></div>`}
        </div>
        <div class="md:col-span-2${isAssetForm ? '' : ' hidden'}" data-wms-material-business-inventory>
          ${isFixedForm ? '' : formSection('业务信息')}
          <p class="md:col-span-2 rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900 hidden" data-wms-material-inherit-banner>
            <i class="fa-solid fa-link mr-1 opacity-70"></i><span data-wms-material-inherit-text>选择物资子类后，将回显分类默认的盘点与使用年限规则</span>
          </p>
          ${ro ? field('是否需要盘点', s.needInventory || '—') : `<div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 是否需要盘点</label><div class="flex flex-wrap gap-4 pt-1">${inventoryRadios}</div><p class="mt-1.5 text-xs text-slate-400" data-wms-material-inventory-hint>默认继承分类；纳入盘点计划时按此标识筛选，可覆盖</p></div>`}
          ${ro ? field('是否需要使用年限', s.needServiceLife || '—') : `<div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 是否需要使用年限</label><div class="flex flex-wrap gap-4 pt-1">${serviceLifeRadios}</div><p class="mt-1.5 text-xs text-slate-400" data-wms-material-service-life-hint>默认继承分类；选「是」时需填写使用年限（年）</p></div>`}
          ${ro
    ? field('使用年限（年）', s.serviceLifeYears || '—')
    : `<div class="${(s.needServiceLife || '是') === '是' ? '' : 'hidden'}" data-wms-material-service-life-years-wrap>
              <label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 使用年限（年）</label>
              <input type="number" min="1" step="1" value="${s.serviceLifeYears || ''}" placeholder="请输入" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" data-wms-material-service-life-years />
              <p class="mt-1.5 text-xs text-amber-700"><i class="fa-solid fa-circle-info mr-1"></i>到达使用年限后，系统自动生成报废单并入待报废池</p>
            </div>`}
        </div>
        <div class="md:col-span-2${isStockForm ? '' : ' hidden'}" data-wms-material-business-stock>
          ${matType === 'consumable' ? formSection('业务信息') : ''}
          ${field('安全库存', s.safeStock ?? '', true, 'number', 'data-wms-material-safe')}
          ${field('库存下限', s.minStock ?? '', true, 'number', 'data-wms-material-min')}
          ${field('库存上限', s.maxStock ?? '', true, 'number', 'data-wms-material-max')}
        </div>
        ${formSection('其他')}
        ${field('说明', s.remark || '', false, 'textarea')}
        ${ro ? '' : `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">资料</label>${uploadZone()}</div>`}
        ${ro ? '' : `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">照片</label>${photoUploadZone()}</div>`}
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">${ro ? '关闭' : '取消'}</a>
        ${ro ? '' : '<button type="button" class="wms-btn wms-btn-primary">确定</button>'}
      </div>
    </div>`;
  return body;
}

function materialDetailPage() {
  const s = {
    code: 'LA-00456', name: '电钻', categoryCode: 'LA-ZC-001001', type: 'like',
    major: '资产-类资产', minor: '电钻', spec: '工业级', enabled: true,
    mainUnit: '台', auxUnit: '—', conversion: '—', price: '680.00',
    returnNeed: '需要', borrowDays: '15天', needInventory: '是', needServiceLife: '是', serviceLifeYears: '5',
    safeStock: '10', minStock: '5', maxStock: '20',
    currentStock: '8', availableStock: '6', lockedStock: '2',
    inherit: { returnNeed: '需要', borrowDays: '15天', needInventory: '是', needServiceLife: '是', serviceLifeYears: '5', safeStock: '10', minStock: '5', maxStock: '20' },
    refs: [
      { type: '计划', no: 'JH202606070002', name: '六月电动工具补充', qty: '5', date: '2026-06-08' },
      { type: '采购', no: 'CG202606050012', name: '电钻直采', qty: '3', date: '2026-06-05' },
    ],
  };
  const leaf = MATERIAL_CATEGORY_LEAVES.find(l => l.code === s.categoryCode) || MATERIAL_CATEGORY_LEAVES[0];
  const roVal = (v) => `<span class="text-sm text-slate-800">${v || '—'}</span>`;
  const inheritRow = (label, actual, inherited) => {
    const overridden = actual !== inherited && inherited !== undefined;
    return `<div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-2.5 text-sm">
      <span class="text-slate-500">${label}</span>
      <span class="text-right">${roVal(actual)}${overridden ? ` <span class="ml-1 text-xs text-amber-600">（分类默认 ${inherited}）</span>` : ' <span class="ml-1 text-xs text-slate-400">继承</span>'}</span>
    </div>`;
  };
  const refRows = s.refs.map(r =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${badge(r.type, 'info')}</td><td class="px-3 py-2.5 text-sm font-mono text-xs">${r.no}</td><td class="px-3 py-2.5 text-sm">${r.name}</td><td class="px-3 py-2.5 text-sm">${r.qty}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.date}</td></tr>`
  ).join('');
  return `
    <div data-wms-modal data-modal-back="config_material_catalog.html" data-modal-size="xl">
      <div class="space-y-6 p-1">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">${s.name}</h2>
            <p class="mt-0.5 text-sm text-slate-500 font-mono">${s.code} · ${materialTypeBadge(s.type)} ${s.enabled ? badge('启用', 'success') : badge('停用', 'danger')}</p>
          </div>
          <a href="config_material_form.html?code=${s.code}&mode=edit" class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-pen text-xs"></i>编辑</a>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="mb-3 text-sm font-semibold text-slate-800">基础信息</h3>
          <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
            <div><dt class="text-slate-500">所属分类</dt><dd class="mt-0.5 font-mono text-xs text-slate-800">${leaf.code} · ${leaf.name}</dd></div>
            <div><dt class="text-slate-500">物资大类 / 子类</dt><dd class="mt-0.5">${s.major} / ${s.minor}</dd></div>
            <div><dt class="text-slate-500">规格型号</dt><dd class="mt-0.5">${s.spec}</dd></div>
            <div><dt class="text-slate-500">主 / 辅计量单位</dt><dd class="mt-0.5">${s.mainUnit} / ${s.auxUnit}</dd></div>
            <div><dt class="text-slate-500">参考单价</dt><dd class="mt-0.5">¥ ${s.price}</dd></div>
          </dl>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="mb-1 text-sm font-semibold text-slate-800">业务规则 <span class="font-normal text-slate-400">（默认继承分类，可覆盖）</span></h3>
          ${inheritRow('归还', s.returnNeed, s.inherit.returnNeed)}
          ${inheritRow('借用周期', s.borrowDays, s.inherit.borrowDays)}
          ${inheritRow('是否需要盘点', s.needInventory, s.inherit.needInventory)}
          ${inheritRow('是否需要使用年限', s.needServiceLife, s.inherit.needServiceLife)}
          ${s.needServiceLife === '是' ? inheritRow('使用年限（年）', s.serviceLifeYears, s.inherit.serviceLifeYears) : ''}
          ${s.needServiceLife === '是' ? `<p class="mt-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-800"><i class="fa-solid fa-triangle-exclamation mr-1"></i>该物资已启用使用年限管理：自入库/启用日起计 ${s.serviceLifeYears} 年，到期后系统自动生成报废单并入待报废池。</p>` : ''}
          ${inheritRow('安全库存', s.safeStock, s.inherit.safeStock)}
          ${inheritRow('库存下限', s.minStock, s.inherit.minStock)}
          ${inheritRow('库存上限', s.maxStock, s.inherit.maxStock)}
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="mb-3 text-sm font-semibold text-slate-800">库存快照 <span class="font-normal text-slate-400">（只读）</span></h3>
          <div class="grid gap-3 sm:grid-cols-4">
            <div class="rounded-xl bg-slate-50 px-4 py-3"><p class="text-xs text-slate-500">当前库存</p><p class="mt-1 text-xl font-semibold text-slate-900">${s.currentStock}</p></div>
            <div class="rounded-xl bg-slate-50 px-4 py-3"><p class="text-xs text-slate-500">可用库存</p><p class="mt-1 text-xl font-semibold text-emerald-700">${s.availableStock}</p></div>
            <div class="rounded-xl bg-slate-50 px-4 py-3"><p class="text-xs text-slate-500">锁定库存</p><p class="mt-1 text-xl font-semibold text-slate-700">${s.lockedStock}</p></div>
            <div class="rounded-xl bg-amber-50 px-4 py-3"><p class="text-xs text-amber-700">预警状态</p><p class="mt-1 text-sm font-medium text-amber-800">${Number(s.currentStock) < Number(s.minStock) ? '低于库存下限' : '正常'}</p></div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="mb-3 text-sm font-semibold text-slate-800">关联引用</h3>
          <div class="overflow-x-auto rounded-xl ring-1 ring-slate-100"><table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">类型</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">单号</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">名称</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">数量</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">日期</th>
          </tr></thead><tbody>${refRows}</tbody></table></div>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="config_material_catalog.html" class="wms-btn wms-btn-secondary">返回列表</a>
      </div>
    </div>`;
}

function formField(label, type, val, req, options = {}) {
  const { colSpan = 1, readonly = false } = options;
  const span = colSpan === 2 ? ' md:col-span-2' : '';
  const reqMark = req ? '<span class="text-rose-500">*</span> ' : '';
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  if (type === 'select') {
    const opts = (Array.isArray(val) ? val : []).map(o => `<option${o.selected ? ' selected' : ''}>${o.label ?? o}</option>`).join('');
    return `<div class="${span}"><label class="mb-1.5 block text-sm font-medium text-slate-700">${reqMark}${label}</label><select class="${inputCls}">${opts}</select></div>`;
  }
  if (type === 'textarea') {
    return `<div class="${span}"><label class="mb-1.5 block text-sm font-medium text-slate-700">${reqMark}${label}</label><textarea rows="3" placeholder="0/500" class="${inputCls}">${typeof val === 'string' ? val : ''}</textarea></div>`;
  }
  if (type === 'toggle') {
    return `<div class="${span}"><label class="mb-1.5 block text-sm font-medium text-slate-700">${reqMark}${label}</label><label class="wms-toggle"><input type="checkbox" checked /><span class="wms-toggle-track"></span></label></div>`;
  }
  const isRo = readonly || (typeof val === 'string' && val.includes('系统'));
  return `<div class="${span}"><label class="mb-1.5 block text-sm font-medium text-slate-700">${reqMark}${label}</label><input type="${type}" value="${typeof val === 'string' ? val : ''}" ${isRo ? `readonly class="${roCls}"` : `class="${inputCls}"`} /></div>`;
}

const shelfTableColumns = ['序号', '货架编码', '货架名称', '所在仓库', '所在分区', '负责人', '层数', '每层承载量', '总承载量', '尺寸(长X宽X高)', '状态', '创建人', '创建时间'];
const shelfTableRows = [
  { code: 'CK001001-HJ001', zone: 'A区', enabled: true, cells: ['1', 'CK001001-HJ001', '1号货架', '1号仓库', 'A区', '李四', '10', '—', '—', '—', badge('启用', 'success'), '张三', '2026-06-01 10:00'] },
  { code: 'CK001001-HJ002', zone: 'A区', enabled: true, cells: ['2', 'CK001001-HJ002', '2号货架', '1号仓库', 'A区', '李四', '10', '—', '—', '—', badge('启用', 'success'), '张三', '2026-06-02 11:30'] },
  { code: 'CK001001-HJ003', zone: 'A区', enabled: true, cells: ['3', 'CK001001-HJ003', '3号货架', '1号仓库', 'A区', '李四', '8', '—', '—', '—', badge('启用', 'success'), '李四', '2026-06-03 09:15'] },
  { code: 'CK001001-HJ004', zone: 'A区', enabled: false, cells: ['4', 'CK001001-HJ004', '4号货架', '1号仓库', 'A区', '李四', '6', '—', '—', '—', badge('停用', 'danger'), '张三', '2026-05-20 09:00'] },
  { code: 'CK001001-HJ101', zone: 'B区', enabled: true, cells: ['1', 'CK001001-HJ101', 'B区1号货架', '1号仓库', 'B区', '王五', '8', '—', '—', '—', badge('启用', 'success'), '李四', '2026-06-04 14:00'] },
];

function shelfRowActions(code) {
  return `<a href="config_shelf_form.html?code=${code}" class="mr-2 hover:underline">查看</a><a href="config_shelf_qrcode.html?code=${code}" class="mr-2 hover:underline">二维码</a><button type="button" class="wms-loc-qr-download-single mr-2 hover:underline" data-shelf-code="${code}">下载</button><a href="config_shelf_form.html?code=${code}" class="mr-2 hover:underline">编辑</a><a href="#" class="text-rose-600 hover:underline">删除</a>`;
}

function shelfRowActionsDisabled(code) {
  return `<a href="config_shelf_form.html?code=${code}" class="mr-2 hover:underline">查看</a><span class="mr-2 text-slate-400" title="停用货架不可生成货位码">二维码</span><span class="mr-2 text-slate-400">下载</span><a href="config_shelf_form.html?code=${code}" class="mr-2 hover:underline">编辑</a><a href="#" class="text-rose-600 hover:underline">删除</a>`;
}

function warehouseShelfTable() {
  const th = '<th class="w-10 px-3 py-2.5"><input type="checkbox" id="wms-shelf-check-all" class="rounded border-slate-300" title="全选本分区启用货架" /></th>' +
    shelfTableColumns.map(c => `<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('') +
    '<th class="wms-col-actions px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>';
  const tr = shelfTableRows.map(r => {
    const layers = parseInt(r.cells[6], 10) || 0;
    const owner = r.cells[5];
    const checkCell = r.enabled
      ? `<input type="checkbox" class="wms-shelf-check rounded border-slate-300" data-shelf-code="${r.code}" data-shelf-zone="${r.zone}" checked />`
      : `<input type="checkbox" class="rounded border-slate-300" disabled title="停用货架不可下载货位码" />`;
    const actions = r.enabled ? shelfRowActions(r.code) : shelfRowActionsDisabled(r.code);
    const hidden = r.zone !== 'A区' ? ' hidden' : '';
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80${hidden}" data-shelf-row data-shelf-zone="${r.zone}" data-shelf-enabled="${r.enabled}" data-shelf-owner="${owner}" data-shelf-layers="${layers}"><td class="px-3 py-3">${checkCell}</td>${r.cells.map(c => `<td class="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}<td class="wms-col-actions px-3 py-3 text-right text-sm whitespace-nowrap">${actions}</td></tr>`;
  }).join('');
  return `<div class="wms-modal-table-wrap overflow-x-auto wms-shelf-table" data-wms-shelf-panel>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
      <span>当前分区：<strong class="text-slate-800" data-wms-active-zone>A区</strong> · 仅显示本分区货架</span>
      <span class="text-xs text-slate-400">操作列固定右侧，可横向滚动查看全部字段</span>
    </div>
    <table class="wms-shelf-table wms-data-table min-w-full text-sm"><thead class="bg-slate-50/90"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

function warehouseConfigPage() {
  return `<div class="mb-4 flex gap-3 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-950">
      <i class="fa-solid fa-circle-info mt-0.5 text-sky-500"></i>
      <div><strong>货位码</strong>标识货架物理位置，用于入库选位与货位识别；<strong>资产码</strong>（<code class="rounded bg-white/80 px-1 text-xs">wms://asset/</code>）在<a href="ledger_warehouse.html" class="font-medium underline">仓库台账</a>管理，二者不可混用。</div>
    </div>
    <div class="wms-warehouse-layout">
    <aside class="wms-warehouse-tree card rounded-2xl bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm font-semibold text-slate-900">仓库</span>
        <a href="config_warehouse_form.html" class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="新增仓库"><i class="fa-solid fa-plus text-xs"></i></a>
      </div>
      <ul class="wms-tree space-y-0.5 text-sm" data-wms-warehouse-tree>
        <li>
          <button type="button" class="wms-tree-node wms-tree-node--warehouse w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left text-slate-700 hover:bg-slate-50" data-node="warehouse">
            <i class="fa-solid fa-chevron-down w-3 text-[10px] text-slate-400"></i>
            <i class="fa-regular fa-folder-open text-slate-400"></i>
            <span class="flex-1 font-medium">1号仓库</span>
            <a href="config_zone_form.html" class="wms-tree-action text-blue-500 hover:text-blue-700" title="新增分区" onclick="event.stopPropagation()"><i class="fa-solid fa-plus-square text-xs"></i></a>
            <a href="config_warehouse_form.html" class="wms-tree-action text-blue-500 hover:text-blue-700" title="编辑"><i class="fa-regular fa-pen-to-square text-xs"></i></a>
            <button type="button" class="wms-tree-action text-blue-500 hover:text-blue-700" title="删除"><i class="fa-regular fa-trash-can text-xs"></i></button>
          </button>
          <ul class="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2">
            <li>
              <button type="button" class="wms-tree-node wms-tree-node--zone is-active w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-blue-600 bg-blue-50/80" data-node="zone" data-zone-name="A区" data-zone-id="45544">
                <i class="fa-regular fa-folder text-blue-400"></i>
                <span class="flex-1">A区</span>
                <a href="config_zone_form.html" class="wms-tree-action text-blue-500 hover:text-blue-700" title="编辑"><i class="fa-regular fa-pen-to-square text-xs"></i></a>
                <button type="button" class="wms-tree-action text-blue-500 hover:text-blue-700" title="删除"><i class="fa-regular fa-trash-can text-xs"></i></button>
              </button>
            </li>
            <li>
              <button type="button" class="wms-tree-node wms-tree-node--zone w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-slate-600 hover:bg-slate-50" data-node="zone" data-zone-name="B区" data-zone-id="45545">
                <i class="fa-regular fa-folder text-slate-400"></i>
                <span class="flex-1">B区</span>
                <a href="config_zone_form.html" class="wms-tree-action text-blue-500 hover:text-blue-700" title="编辑"><i class="fa-regular fa-pen-to-square text-xs"></i></a>
                <button type="button" class="wms-tree-action text-blue-500 hover:text-blue-700" title="删除"><i class="fa-regular fa-trash-can text-xs"></i></button>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
    <div class="wms-warehouse-main card rounded-2xl bg-white p-5 min-w-0">
      <div class="mb-4 flex flex-wrap items-center justify-end gap-2">
        <span class="text-xs text-slate-500">已选 <strong id="wms-shelf-selected-count" class="text-slate-800">${shelfTableRows.filter(r => r.zone === 'A区' && r.enabled).length}</strong> 个启用货架</span>
        <button type="button" id="wms-warehouse-batch-loc-qr" data-zone-name="A区" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" title="批量下载当前分区已勾选货架的货位码标签（ZIP）"><i class="fa-solid fa-qrcode text-xs text-slate-400"></i> 下载货位二维码</button>
      </div>
      ${warehouseShelfToolbar()}
      ${listAddRow({ addBtn: true, addHref: 'config_shelf_form.html' })}
      <div class="wms-warehouse-detail mb-4 pb-4 border-b border-slate-100" data-wms-zone-detail>
        <h3 class="text-base font-semibold text-slate-900 mb-3">A区（ID：45544）</h3>
        <dl class="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div class="flex gap-2"><dt class="text-slate-500 shrink-0">库区类型：</dt><dd class="text-slate-800">普通区</dd></div>
          <div class="flex gap-2"><dt class="text-slate-500 shrink-0">面积：</dt><dd class="text-slate-800">100平方米</dd></div>
          <div class="flex gap-2"><dt class="text-slate-500 shrink-0">存储容量：</dt><dd class="text-slate-800">1000</dd></div>
          <div class="flex gap-2 items-center"><dt class="text-slate-500 shrink-0">负责人：</dt><dd class="text-slate-800">张飞 <a href="#" class="ml-1 text-blue-600 hover:underline">查看</a></dd></div>
        </dl>
      </div>
      ${warehouseShelfTable()}
      <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
        <span data-wms-shelf-total>共 ${shelfTableRows.filter(r => r.zone === 'A区').length} 条</span>
        <div class="flex gap-1"><span class="rounded-lg bg-slate-900 px-3 py-1 text-white">1</span><span class="rounded-lg px-3 py-1 hover:bg-slate-100">2</span></div>
      </div>
    </div>
  </div>`;
}

function warehouseForm(backHref) {
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
      <div class="wms-modal-form wms-warehouse-form">
        ${formSection('基础信息')}
        ${formField('仓库编码', 'text', '系统自动生成', false, { readonly: true })}
        ${formField('仓库名称', 'text', '', true)}
        ${formField('仓库类型', 'select', ['货品库', '备件库', '其他'], false)}
        ${formField('建筑面积', 'text', '', false)}
        ${formField('存储容量', 'text', '', false)}
        ${formField('负责人', 'select', ['张三', '李四', '张飞'], false)}
        ${formSection('其他信息')}
        ${formField('介绍', 'textarea', '', false, { colSpan: 2 })}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">资料</label>${uploadZone()}</div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-primary">确定</button>
      </div>
    </div>`;
}

function zoneForm(backHref) {
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
      <div class="wms-modal-form wms-warehouse-form">
        ${formSection('基础信息')}
        ${formField('所属仓库', 'select', [{ label: '1号仓库', selected: true }, '2号仓库'], true)}
        ${formField('分区编码', 'text', '系统自动生成', false, { readonly: true })}
        ${formField('分区名称', 'text', 'A区', true)}
        ${formField('库区类型', 'select', ['普通区', '贵重区', '其他'], false)}
        ${formField('面积', 'text', '', false)}
        ${formField('存储容量', 'text', '', false)}
        ${formField('负责人', 'select', ['张三', '李四', '张飞'], false)}
        ${formSection('其他信息')}
        ${formField('说明', 'textarea', '', false, { colSpan: 2 })}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">资料</label>${uploadZone()}</div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-primary">确定</button>
      </div>
    </div>`;
}

function shelfForm(backHref, shelf = SHELF_SAMPLES['CK001001-HJ001']) {
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
      <div class="wms-modal-form wms-warehouse-form">
        ${formSection('基础信息')}
        ${formField('所在仓库', 'select', [{ label: shelf.warehouse, selected: true }], true)}
        ${formField('所在分区', 'select', [{ label: shelf.zone, selected: true }, 'B区'], true)}
        ${formField('货架编码', 'text', shelf.code, false, { readonly: true })}
        ${formField('货架名称', 'text', shelf.name, true)}
        ${formField('负责人', 'select', ['张三', '李四', '张飞'], false)}
        ${formField('启用', 'toggle', '', false)}
        ${formField('层数', 'number', '4', true)}
        ${formSection('货位二维码')}
        <div class="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4" data-shelf-qr-block>
          ${shelf.status === '停用'
            ? '<p class="text-sm text-slate-500">货架已停用，不可生成或下载货位码。启用后可自动生成 <code class="rounded bg-white px-1 text-xs">wms://loc/{货架编码}</code></p>'
            : `<div class="flex flex-wrap items-start gap-4">
                ${locationQrLabel(shelf)}
                <div class="text-sm">
                  <p class="text-slate-600">扫码内容</p>
                  <p class="mt-1 font-mono text-xs text-slate-800" data-shelf-uri>wms://loc/${shelf.code}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <a href="config_shelf_qrcode.html?code=${shelf.code}" class="text-blue-600 hover:underline">全屏查看</a>
                    <button type="button" class="wms-loc-qr-download-single text-blue-600 hover:underline" data-shelf-code="${shelf.code}">下载 PNG</button>
                  </div>
                  <p class="mt-2 text-xs text-slate-400">货架保存后系统自动生成，编码不可修改</p>
                </div>
              </div>`}
        </div>
        ${formSection('其他信息')}
        ${formField('说明', 'textarea', '', false, { colSpan: 2 })}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">资料</label>${uploadZone()}</div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-primary">确定</button>
      </div>
    </div>`;
}

function purchaseRequestForm(backHref, options = {}) {
  const { fromPending = false, total = fromPending ? '20000.00' : '30200.00', modalSize = 'xl', planNo = '', pendingCode = '', showSupplyOrders = false } = options;
  const rows = fromPending ? purchaseMaterialRows.pending : purchaseMaterialRows.default;
  const addHref = fromPending ? 'purchase_pending_select.html' : 'purchase_pending_select.html';
  const materialBlock = purchaseMaterialTable(rows).replace('purchase_pending_select.html', addHref);
  const sourceBlock = fromPending ? `<div class="md:col-span-2 rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-sm" data-wms-purchase-source>
    <dl class="grid gap-3 sm:grid-cols-2">
      <div><dt class="text-slate-500">采购类型</dt><dd class="mt-0.5 font-medium text-slate-900">急件采购</dd></div>
      <div><dt class="text-slate-500">来源计划单号</dt><dd class="mt-0.5 font-mono text-xs text-slate-800" data-purchase-plan-no>${planNo || 'JJJH202606080001'}</dd></div>
      <div><dt class="text-slate-500">来源待采物资</dt><dd class="mt-0.5 text-slate-800" data-purchase-pending-material>${pendingCode ? `${pendingCode} · 从待采带入` : '从待采列表带入'}</dd></div>
    </dl>
  </div>` : '';
  const supplyOrdersBlock = `<div class="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4${showSupplyOrders ? '' : ' hidden'}" data-wms-purchase-supply-orders>
    <div class="mb-2 text-sm font-medium text-slate-900">已生成供货单</div>
    <ul class="space-y-2 text-sm text-slate-700">
      <li class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2"><span><span class="font-mono text-xs">GH2025001</span> · 科尼 · 抓斗 10个</span><a href="purchase_supply_list.html" class="text-xs font-medium hover:underline">查看</a></li>
      <li class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2"><span><span class="font-mono text-xs">GH2025003</span> · 河南蒲瑞 · 钢丝绳 100m</span><a href="purchase_supply_list.html" class="text-xs font-medium hover:underline">查看</a></li>
    </ul>
  </div>`;
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="${modalSize}" data-wms-purchase-request${fromPending ? ' data-from-pending="true"' : ''}>
      <div class="wms-modal-form wms-purchase-form">
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">申请单号</label><input type="text" value="系统自动生成" readonly data-purchase-request-no class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">采购类型</label><input type="text" value="急件采购" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">采购总额（元）</label><input type="text" value="${total}" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" /></div>
        ${sourceBlock}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 提交人</label><select class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"><option>张三</option><option selected>李四</option><option>王五</option></select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 提交部门</label><select class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"><option selected>采购部</option><option>设备部</option><option>工程部</option></select></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">备注</label><textarea rows="2" placeholder="请输入备注" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"></textarea></div>
        <div class="md:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">附件</label>
          <div class="wms-upload-zone">
            <i class="fa-solid fa-cloud-arrow-up text-lg text-slate-400"></i>
            <p class="mt-2 text-sm text-slate-600">点击或拖拽上传附件</p>
            <p class="mt-1 text-xs text-slate-400">支持 .rar .zip .doc .docx .pdf，单个文件不超过 500MB</p>
          </div>
        </div>
        ${materialBlock}
        <div class="md:col-span-2">
          <label class="mb-2 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 推荐供应商</label>
          <div class="flex flex-wrap gap-2 text-sm">
            <span class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">科尼 <span class="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">良好 8.6</span></span>
            <span class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">河南蒲瑞 <span class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">未评价</span></span>
          </div>
        </div>
        ${supplyOrdersBlock}
        <div class="md:col-span-2">
          <label class="mb-2 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 采购方式</label>
          <div class="wms-radio-group">
            <label class="wms-radio-option"><input type="radio" name="purchase-method" /><span>询价</span></label>
            <label class="wms-radio-option"><input type="radio" name="purchase-method" checked /><span>直采</span></label>
            <label class="wms-radio-option"><input type="radio" name="purchase-method" /><span>招标</span></label>
          </div>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-secondary">保存</button>
        <button type="button" class="wms-btn wms-btn-primary">确定</button>
      </div>
    </div>`;
}

function hubPage(id, title, breadcrumb, backHref, cards) {
  const grid = cards.map(([href, icon, label, desc]) => `
    <a href="${href}" class="card flex items-start gap-4 rounded-2xl bg-white p-5 hover:ring-1 hover:ring-slate-200 transition">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><i class="fa-solid ${icon}"></i></div>
      <div><div class="font-semibold text-slate-900">${label}</div><p class="mt-1 text-sm text-slate-500">${desc}</p></div>
      <i class="fa-solid fa-chevron-right ml-auto text-slate-300 text-xs mt-1"></i>
    </a>`).join('');
  return `
    <div class="mb-4"><a href="${backHref}" class="text-sm text-slate-500 hover:text-slate-900"><i class="fa-solid fa-arrow-left mr-1"></i>返回</a></div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${grid}</div>`;
}

function categoryRowActions(isLevel1, type = 'fixed') {
  const viewMap = { fixed: 'config_category_sub_fixed_view.html', like: 'config_category_sub_like_view.html', consumable: 'config_category_sub_consumable_view.html' };
  const editMap = { fixed: 'config_category_sub_fixed.html', like: 'config_category_sub_like.html', consumable: 'config_category_sub_consumable.html' };
  const viewHref = viewMap[type] || viewMap.fixed;
  const editHref = editMap[type] || editMap.fixed;
  const childHref = 'config_category_sub_child_form.html';
  if (isLevel1) {
    return `<a href="${childHref}" class="mr-2 hover:underline">添加子类</a><a href="${viewHref}" class="mr-2 hover:underline">查看</a><a href="${editHref}" class="mr-2 hover:underline">编辑</a><a href="#" class="text-rose-600 hover:underline">删除</a>`;
  }
  return `<a href="${viewHref}" class="mr-2 hover:underline">查看</a><a href="${editHref}" class="mr-2 hover:underline">编辑</a><a href="#" class="text-rose-600 hover:underline">删除</a>`;
}

function categorySubTableAsset(type, rows) {
  const cols = ['序号', '分类编码', '分类名称', '计量单位', '是否需要盘点', '是否需要使用年限', '备注'];
  const th = cols.map(c => `<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('') +
    actionTh('px-3 py-2.5');
  const tr = rows.map(r => {
    const seqCell = r.level === 1
      ? `<span class="text-slate-500">${r.expanded ? '➖' : '➕'}</span> <span class="ml-1">${r.seq}</span>`
      : `<span class="pl-4 text-slate-600">${r.seq}</span>`;
    const rowCls = r.level === 2 ? 'bg-slate-50/60' : '';
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80 ${rowCls}">
      <td class="px-3 py-3 text-sm whitespace-nowrap">${seqCell}</td>
      <td class="px-3 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">${r.code}</td>
      <td class="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">${r.name}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.unit || '—'}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.needInventory || (r.level === 2 ? '是' : '—')}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.needServiceLife || (r.level === 2 ? '是' : '—')}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.remark || '—'}</td>
      ${actionTd(categoryRowActions(r.level === 1, type), 'px-3 py-3')}
    </tr>`;
  }).join('');
  return `<div class="wms-modal-table-wrap overflow-x-auto"><table class="min-w-full text-sm wms-data-table"><thead class="bg-slate-50/90"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

function categorySubTableConsumable(rows) {
  const cols = ['序号', '分类编码', '分类名称', '计量单位', '库存下限', '库存上限', '安全库存', '备注'];
  const th = cols.map(c => `<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('') +
    actionTh('px-3 py-2.5');
  const tr = rows.map(r => {
    const seqCell = r.level === 1
      ? `<span class="text-slate-500">${r.expanded ? '➖' : '➕'}</span> <span class="ml-1">${r.seq}</span>`
      : `<span class="pl-4 text-slate-600">${r.seq}</span>`;
    const rowCls = r.level === 2 ? 'bg-slate-50/60' : '';
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80 ${rowCls}">
      <td class="px-3 py-3 text-sm whitespace-nowrap">${seqCell}</td>
      <td class="px-3 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">${r.code}</td>
      <td class="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">${r.name}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.unit || '—'}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.min || '—'}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.max || '—'}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.safe || '—'}</td>
      <td class="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">${r.remark || '—'}</td>
      ${actionTd(categoryRowActions(r.level === 1, 'consumable'), 'px-3 py-3')}
    </tr>`;
  }).join('');
  return `<div class="wms-modal-table-wrap overflow-x-auto"><table class="min-w-full text-sm wms-data-table"><thead class="bg-slate-50/90"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

function categoryDetailHeader(items) {
  return `<div class="wms-category-detail mb-4 pb-4 border-b border-slate-200">
    <h3 class="text-base font-semibold text-slate-900 mb-3" data-wms-category-title>${items.title}</h3>
    <dl class="flex flex-wrap gap-x-8 gap-y-2 text-sm">${items.fields.map(([k, v]) =>
      `<div class="flex gap-2"><dt class="text-slate-500 shrink-0">${k}：</dt><dd class="text-slate-800">${v}</dd></div>`
    ).join('')}</dl>
  </div>`;
}

const CATEGORY_ASSET_SUB_ROWS = [
  { level: 1, expanded: true, seq: '1', code: 'ZC-GD-001', name: '办公电脑', unit: '', needInventory: '是', needServiceLife: '是', remark: '' },
  { level: 2, seq: '1.1', code: 'ZC-GD-001001', name: '一体机', unit: '台', needInventory: '是', needServiceLife: '是', remark: '' },
  { level: 2, seq: '1.2', code: 'ZC-GD-001002', name: '笔记本', unit: '台', needInventory: '是', needServiceLife: '是', remark: '' },
  { level: 1, expanded: false, seq: '2', code: 'ZC-GD-002', name: '设备配件', unit: '', needInventory: '是', needServiceLife: '是', remark: '' },
];

const CATEGORY_CONSUMABLE_SUB_ROWS = [
  { level: 1, expanded: true, seq: '1', code: 'HC-BG-001', name: '办公电脑', unit: '', min: '', max: '', safe: '', remark: '' },
  { level: 2, seq: '1.1', code: 'HC-BG-001001', name: '一体机', unit: '台', min: '', max: '', safe: '', remark: '' },
  { level: 2, seq: '1.2', code: 'HC-BG-001002', name: '打印纸 A4', unit: '箱', min: '', max: '', safe: '', remark: '' },
  { level: 1, expanded: false, seq: '2', code: 'HC-BG-002', name: '办公文具', unit: '', min: '', max: '', safe: '', remark: '' },
];

function acceptanceStandardPage() {
  const treeNode = (key, label, status, active = false) => {
    const statusCls = status === 'configured' ? 'text-blue-500' : 'text-slate-400';
    const statusText = status === 'configured' ? '已配置' : '待配置';
    const activeCls = active ? 'is-active bg-blue-50/80 text-blue-600' : 'text-slate-600 hover:bg-slate-50';
    return `<li><button type="button" class="wms-tree-node wms-tree-node--major w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left ${activeCls}" data-acceptance-key="${key}">
      <i class="fa-regular fa-file ${active ? 'text-blue-400' : 'text-slate-400'}"></i>
      <span class="flex-1 truncate">${label}<span class="ml-1 text-xs ${statusCls}">（${statusText}）</span></span>
    </button></li>`;
  };
  return `<div class="wms-category-layout" data-wms-acceptance-layout>
    <aside class="wms-category-tree card rounded-2xl bg-white p-4">
      <div class="mb-3 text-sm font-semibold text-slate-900">物资分类</div>
      <ul class="wms-tree space-y-0.5 text-sm" data-wms-acceptance-tree>
        <li>
          <button type="button" class="wms-tree-node wms-tree-node--group w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-slate-700 hover:bg-slate-50">
            <i class="fa-solid fa-chevron-down w-3 text-[10px] text-slate-400"></i>
            <i class="fa-regular fa-folder-open text-slate-400"></i><span>资产类</span>
          </button>
          <ul class="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2">
            ${treeNode('fixed', '固定资产', 'pending', true)}
            ${treeNode('like', '类资产', 'configured')}
          </ul>
        </li>
        <li class="mt-2">
          <button type="button" class="wms-tree-node wms-tree-node--group w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-slate-700 hover:bg-slate-50">
            <i class="fa-solid fa-chevron-down w-3 text-[10px] text-slate-400"></i>
            <i class="fa-regular fa-folder-open text-slate-400"></i><span>耗材类</span>
          </button>
          <ul class="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2">
            ${treeNode('bg', '办公耗材', 'configured')}
            ${treeNode('sc', '生产耗材', 'pending')}
            ${treeNode('lb', '劳保耗材', 'pending')}
          </ul>
        </li>
      </ul>
    </aside>
    <div class="wms-category-main card rounded-2xl bg-white p-5 min-w-0 flex flex-col">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-slate-900">验收标准</h3>
        <div class="flex items-center gap-2">
          <button type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-acceptance-edit><i class="fa-regular fa-pen-to-square text-xs text-slate-400"></i>编辑</button>
          <button type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" data-wms-acceptance-save disabled>保存</button>
        </div>
      </div>
      <textarea
        data-wms-acceptance-editor
        rows="14"
        readonly
        placeholder="请输入验收标准"
        class="wms-acceptance-editor min-h-[360px] flex-1 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none read-only:bg-slate-50 read-only:cursor-default focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      ></textarea>
      <p class="mt-3 text-xs text-slate-400">每一种子类拥有一套验收标准；默认只读，点击「编辑」后可修改并保存（无版本概念，物资验收时展示最新内容）。</p>
    </div>
  </div>`;
}

function categoryConfigPage() {
  const assetTable = categorySubTableAsset('fixed', CATEGORY_ASSET_SUB_ROWS);
  const consumableTable = categorySubTableConsumable(CATEGORY_CONSUMABLE_SUB_ROWS);
  return `<div class="wms-category-layout">
    <aside class="wms-category-tree card rounded-2xl bg-white p-4">
      <div class="mb-3 text-sm font-semibold text-slate-900">物资大类</div>
      <ul class="wms-tree space-y-0.5 text-sm" data-wms-category-tree>
        <li>
          <button type="button" class="wms-tree-node wms-tree-node--group w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-slate-700 hover:bg-slate-50" data-group="asset">
            <i class="fa-solid fa-chevron-down w-3 text-[10px] text-slate-400"></i>
            <i class="fa-regular fa-folder-open text-slate-400"></i><span>资产类</span>
          </button>
          <ul class="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2">
            <li><button type="button" class="wms-tree-node wms-tree-node--major is-active w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-blue-600 bg-blue-50/80" data-major="fixed" data-panel="fixed"><i class="fa-regular fa-file text-blue-400"></i><span>固定资产</span></button></li>
            <li><button type="button" class="wms-tree-node wms-tree-node--major w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-slate-600 hover:bg-slate-50" data-major="like" data-panel="like"><i class="fa-regular fa-file text-slate-400"></i><span>类资产</span></button></li>
          </ul>
        </li>
        <li class="mt-2">
          <button type="button" class="wms-tree-node wms-tree-node--group w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-slate-700 hover:bg-slate-50" data-group="consumable">
            <i class="fa-solid fa-chevron-down w-3 text-[10px] text-slate-400"></i>
            <i class="fa-regular fa-folder-open text-slate-400"></i><span>耗材类</span>
          </button>
          <ul class="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2">
            <li><button type="button" class="wms-tree-node wms-tree-node--major w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-slate-600 hover:bg-slate-50" data-major="bg" data-panel="consumable"><span class="flex items-center gap-2"><i class="fa-regular fa-file text-slate-400"></i><span>办公耗材</span></span><span class="wms-category-tree-actions hidden items-center gap-1"><a href="config_category_major_consumable_form.html" class="text-blue-500 hover:text-blue-700" title="编辑" onclick="event.stopPropagation()"><i class="fa-regular fa-pen-to-square text-xs"></i></a><button type="button" class="text-blue-500 hover:text-blue-700" title="删除" onclick="event.stopPropagation()"><i class="fa-regular fa-trash-can text-xs"></i></button></span></button></li>
            <li><button type="button" class="wms-tree-node wms-tree-node--major w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-slate-600 hover:bg-slate-50" data-major="sc" data-panel="consumable"><i class="fa-regular fa-file text-slate-400"></i><span>生产耗材</span></button></li>
            <li><button type="button" class="wms-tree-node wms-tree-node--major w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-slate-600 hover:bg-slate-50" data-major="lb" data-panel="consumable"><i class="fa-regular fa-file text-slate-400"></i><span>劳保耗材</span></button></li>
          </ul>
        </li>
      </ul>
      <a href="config_category_major_consumable_form.html" class="mt-4 flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600" title="新增耗材大类"><i class="fa-solid fa-plus text-xs"></i></a>
    </aside>
    <div class="wms-category-main card rounded-2xl bg-white p-5 min-w-0">
      <h3 class="mb-3 text-sm font-semibold text-slate-900">物资子类</h3>
      <div class="mb-3 flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto" data-wms-list-toolbar>
        ${listSearchInput('分类编码、分类名称').replace(/data-wms-list-search/g, 'data-wms-category-search')}
      </div>
      <div class="mb-4">${primaryAddBtn('config_category_sub_fixed.html', 'data-wms-category-add')}</div>
      <div data-wms-category-panel="fixed">${categoryDetailHeader({ title: '固定资产（ZC-GD）', fields: [['归还', '需要'], ['是否需要盘点', '是'], ['是否需要使用年限', '是']] })}${assetTable}</div>
      <div class="hidden" data-wms-category-panel="like">${categoryDetailHeader({ title: '类资产（LA-ZC）', fields: [['归还', '需要'], ['是否需要盘点', '是'], ['是否需要使用年限', '是'], ['库存下限', '需要'], ['库存上限', '需要']] })}${categorySubTableAsset('like', [
        { level: 1, expanded: true, seq: '1', code: 'LA-ZC-001', name: '电动工具', unit: '', needInventory: '是', needServiceLife: '是', remark: '' },
        { level: 2, seq: '1.1', code: 'LA-ZC-001001', name: '电钻', unit: '台', needInventory: '是', needServiceLife: '是', remark: '' },
      ])}</div>
      <div class="hidden" data-wms-category-panel="consumable">${categoryDetailHeader({ title: '办公耗材（HC-BG）', fields: [['归还', '需要'], ['库存下限', '需要'], ['库存上限', '需要'], ['安全库存', '需要']] })}${consumableTable}</div>
    </div>
  </div>`;
}

function categoryViewMajorModal(title, backHref, fields) {
  const rows = fields.map(([label, value]) =>
    `<div class="flex gap-3 py-2 border-b border-slate-100 last:border-0"><span class="w-24 shrink-0 text-sm text-slate-500">${label}：</span><span class="text-sm text-slate-900">${value}</span></div>`
  ).join('');
  return `<div data-wms-modal data-modal-back="${backHref}" data-modal-size="md">
    <div class="space-y-1">${rows}</div>
    <div class="wms-modal-footer"><a href="${backHref}" class="wms-btn wms-btn-secondary">关闭</a></div>
  </div>`;
}

function categoryMajorConsumableForm(backHref) {
  return `<div data-wms-modal data-modal-back="${backHref}" data-modal-size="md">
    <div class="wms-modal-form">
      ${formField('分类编码', 'text', '系统生成', false, { readonly: true })}
      ${formField('分类名称', 'text', '', true)}
      ${formField('归还', 'select', ['需要', '不需要'], true)}
      ${formField('库存下限', 'select', ['需要', '不需要'], true)}
      ${formField('库存上限', 'select', ['需要', '不需要'], true)}
      ${formField('安全库存', 'select', ['需要', '不需要'], true)}
      ${formField('损耗标准', 'select', ['需要', '不需要'], false)}
    </div>
    <div class="wms-modal-footer"><a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a><button type="button" class="wms-btn wms-btn-primary">确定</button></div>
  </div>`;
}

function categorySubForm(backHref, { title, level = 1, type = 'fixed' }) {
  const isConsumable = type === 'consumable';
  const section = `<div class="md:col-span-2"><h3 class="wms-form-section-title">${level === 1 ? '子类信息' : '子类信息 · 二级'}</h3></div>`;
  const parentField = level === 2 ? formField('父级分类', 'select', [{ label: '办公电脑 (ZC-GD-001)', selected: true }], true) : '';
  const inheritTable = level === 1 && !isConsumable ? `<div class="md:col-span-2 rounded-lg border border-slate-200 overflow-hidden text-sm"><table class="min-w-full"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">分类编码</th><th class="px-3 py-2 text-left text-xs text-slate-500">分类名称</th><th class="px-3 py-2 text-left text-xs text-slate-500">归还</th><th class="px-3 py-2 text-left text-xs text-slate-500">是否需要盘点</th><th class="px-3 py-2 text-left text-xs text-slate-500">是否需要使用年限</th></tr></thead><tbody><tr class="border-t"><td class="px-3 py-2 font-mono text-xs">ZC-GD</td><td class="px-3 py-2">${title.replace(' · 新增子类', '')}</td><td class="px-3 py-2">需要</td><td class="px-3 py-2">是</td><td class="px-3 py-2">是</td></tr></tbody></table></div>` : '';
  const extraFields = isConsumable
    ? `${formField('库存下限', 'select', ['需要', '不需要'], false)}${formField('库存上限', 'select', ['需要', '不需要'], false)}${formField('安全库存', 'select', ['需要', '不需要'], false)}`
    : `${formField('归还', 'select', ['需要', '不需要'], true)}${formField('是否需要盘点', 'select', ['是', '否'], true)}${formField('是否需要使用年限', 'select', ['是', '否'], true)}${level === 2 ? formField('借用周期（天）', 'number', '90', false) : ''}`;
  return `<div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
    <div class="wms-modal-form wms-warehouse-form">
      ${section}
      ${formField('分类编码', 'text', '系统生成', false, { readonly: true })}
      ${parentField}
      ${formField('分类名称', 'text', '', true)}
      ${formField('计量单位', 'select', ['台', '个', '箱', '套'], true)}
      ${extraFields}
      ${formField('备注', 'textarea', '', false, { colSpan: 2 })}
      ${inheritTable}
    </div>
    <div class="wms-modal-footer"><a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a><button type="button" class="wms-btn wms-btn-primary">确定</button></div>
  </div>`;
}

/** 供应商主数据（档案 + 关联业务回显） */
const SUPPLIER_SAMPLES = {
  GYS001: {
    code: 'GYS001', name: '科尼', shortName: '科尼', status: '正常', type: '设备配件供应商',
    contact: '李四', phone: '13912345678', address: '上海市浦东新区张江路 88 号', createdAt: '2024-03-15',
    latestScore: '8.60', latestGrade: '良好', latestEvalDate: '2025-12-30', latestEvalNo: 'PJ2025001',
    supplies: [
      { no: 'GH2025001', material: '抓斗', qty: '10 / 10 个', status: '已供货', date: '2025-08-01' },
    ],
    acceptances: [
      { no: 'GH2025001-YS01', supplyNo: 'GH2025001', material: '抓斗', qualified: '10', unqualified: '0', date: '2025-08-08', status: '已验收' },
    ],
    refunds: [],
    evalHistory: [
      { evalNo: 'PJ2025001', evalName: '2025年度设备配件类供应商评价', period: '2025年度', score: '8.60', grade: '良好', evalDate: '2025-12-30', status: '审核通过' },
      { evalNo: 'PJ2025002', evalName: '2025年度维修工具类供应商评价', period: '2025年度', score: '8.60', grade: '良好', evalDate: '2025-12-30', status: '审核中' },
    ],
  },
  GYS002: {
    code: 'GYS002', name: '上海佩纳', shortName: '上海佩纳', status: '正常', type: '设备配件供应商',
    contact: '李四', phone: '13912345678', address: '上海市嘉定区工业路 12 号', createdAt: '2024-05-20',
    latestScore: '8.10', latestGrade: '良好', latestEvalDate: '2025-12-30', latestEvalNo: 'PJ2025001',
    supplies: [{ no: 'GH2025002', material: '料斗', qty: '10 / 10 个', status: '已供货', date: '2025-09-01' }],
    acceptances: [{ no: 'GH2025002-YS01', supplyNo: 'GH2025002', material: '料斗', qualified: '10', unqualified: '0', date: '2025-11-16', status: '已验收' }],
    refunds: [],
    evalHistory: [{ evalNo: 'PJ2025001', evalName: '2025年度设备配件类供应商评价', period: '2025年度', score: '8.10', grade: '良好', evalDate: '2025-12-30', status: '审核通过' }],
  },
  GYS003: {
    code: 'GYS003', name: '河南蒲瑞', shortName: '河南蒲瑞', status: '正常', type: '设备配件供应商',
    contact: '李经理', phone: '13800001234', address: '河南省郑州市高新区', createdAt: '2024-06-10',
    latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—',
    supplies: [{ no: 'GH2025003', material: '钢丝绳', qty: '100 / 50 m', status: '供货中', date: '2025-10-15' }],
    acceptances: [{ no: 'GH2025003-YS01', supplyNo: 'GH2025003', material: '钢丝绳', qualified: '50', unqualified: '0', date: '2025-11-20', status: '验收中' }],
    refunds: [{ no: 'TH20251121001', supplyNo: 'GH2025003', material: '钢丝绳', qty: '30 m', reason: '质量问题', date: '2025-11-21', status: '部分退货' }],
    evalHistory: [],
  },
  GYS004: {
    code: 'GYS004', name: '江苏华能电子有限公司', shortName: '江苏华能', status: '正常', type: '耗材供应商',
    contact: '王工', phone: '13911112233', address: '江苏省南京市江宁区', createdAt: '2024-08-01',
    latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—',
    supplies: [{ no: 'GH2025004', material: '螺丝刀', qty: '20 / 10 个', status: '供货中', date: '2025-11-01' }],
    acceptances: [{ no: 'GH2025004-YS01', supplyNo: 'GH2025004', material: '螺丝刀', qualified: '9', unqualified: '1', date: '2025-11-22', status: '验收中' }],
    refunds: [{ no: 'GH2025004-YS02-TH', supplyNo: 'GH2025004', material: '螺丝刀', qty: '1 个', reason: '验收不合格', date: '—', status: '待退货' }],
    evalHistory: [],
  },
  GYS005: {
    code: 'GYS005', name: '宁波北仑君威有限公司', shortName: '宁波北仑君威', status: '暂停', type: '耗材供应商',
    contact: '李四', phone: '13912345678', address: '浙江省宁波市北仑区', createdAt: '2024-09-12',
    latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—',
    supplies: [{ no: 'GH2025005', material: '扳手', qty: '20 / 0 个', status: '待供货', date: '2025-12-01' }],
    acceptances: [],
    refunds: [],
    evalHistory: [],
  },
  GYS006: {
    code: 'GYS006', name: '华建物资有限公司', shortName: '华建物资', status: '正常', type: '电气材料供应商',
    contact: '陈经理', phone: '13888888221', address: '湖北省黄冈市武穴市', createdAt: '2026-01-15',
    latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—',
    supplies: [{ no: 'GH202605280002', material: '电缆 YJV-3×2.5', qty: '100 / 100 m', status: '已供货', date: '2026-05-28' }],
    acceptances: [],
    refunds: [{ no: 'TH202606030001', supplyNo: 'GH202605280002', material: '电缆 YJV-3×2.5', qty: '100 m', reason: '规格不符', date: '2026-06-03', status: '已退货' }],
    evalHistory: [],
  },
  GYS007: {
    code: 'GYS007', name: '鄂东办公用品', shortName: '鄂东办公', status: '正常', type: '办公耗材供应商',
    contact: '刘主管', phone: '13933333002', address: '湖北省黄冈市', createdAt: '2026-02-20',
    latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—',
    supplies: [{ no: 'GH2025002', material: '安全帽', qty: '200 / 200 顶', status: '已供货', date: '2025-11-10' }],
    acceptances: [{ no: 'GH2025002-YS01', supplyNo: 'GH2025002', material: '安全帽', qualified: '200', unqualified: '0', date: '2025-11-16', status: '已验收' }],
    refunds: [{ no: 'RK202509002-TH01', supplyNo: 'GH2025002', material: '安全帽', qty: '50 顶', reason: '在库退货', date: '—', status: '待退货' }],
    evalHistory: [],
  },
};

function evalGradeBadge(grade) {
  const map = { 优秀: 'success', 良好: 'info', 合格: 'warning', 不合格: 'danger' };
  if (!grade || grade === '—') return '—';
  return badge(grade, map[grade] || 'info');
}

function supplierStatusBadge(status) {
  const map = { 正常: 'success', 暂停: 'warning', 黑名单: 'danger' };
  return badge(status, map[status] || 'info');
}

/** 供应商评价：指标权重、等级、样例数据 */
const EVAL_CONFIG_VERSION = 'V2026-001';
const EVAL_CONFIG_EFFECTIVE = '2026-01-01';

const EVAL_INDICATORS = [
  { key: 'quality', name: '产品质量', weight: 0.4 },
  { key: 'delivery', name: '交货及时性', weight: 0.2 },
  { key: 'service', name: '售后服务', weight: 0.2 },
  { key: 'price', name: '价格合理性', weight: 0.2 },
];

const EVAL_GRADES = [
  { name: '优秀', min: 9, max: 10 },
  { name: '良好', min: 7, max: 9 },
  { name: '合格', min: 6, max: 7 },
  { name: '不合格', min: 0, max: 6 },
];

const EVAL_SUPPLIER_MASTER = Object.values(SUPPLIER_SAMPLES).map(s => [
  s.code, s.name, s.shortName, supplierStatusBadge(s.status), s.contact, s.phone, s.type,
]);

const EVAL_FORM_LINES = [
  { code: 'GYS001', name: '科尼', quality: 9, delivery: 8, service: 8, price: 9, bonus: 0, penalty: 0, remark: '' },
  { code: 'GYS002', name: '上海佩纳', quality: 8, delivery: 9, service: 7, price: 8, bonus: 0, penalty: 0, remark: '' },
];

const EVAL_ORDER_SAMPLES = {
  PJ2025001: {
    no: 'PJ2025001', name: '2025年度设备配件类供应商评价', evaluator: '李四', evalDate: '2025-12-30',
    evalPeriod: '年度', periodStart: '2025-01-01', periodEnd: '2025-12-31',
    status: '审核通过', approver: '王经理', node: '采购负责人', approveTime: '2025-12-31 10:20',
    creator: '李四', createdAt: '2025-12-30 09:15', supplierCount: 2, avgScore: '8.35',
    configVersion: EVAL_CONFIG_VERSION, orderRemark: '年度例行评价',
    approvalFlow: [
      { node: '提交', user: '李四', time: '2025-12-30 09:15', result: '提交', opinion: '—' },
      { node: '采购负责人', user: '王经理', time: '2025-12-31 10:20', result: '通过', opinion: '同意' },
    ],
    lines: EVAL_FORM_LINES,
  },
  PJ2025002: {
    no: 'PJ2025002', name: '2025年度维修工具类供应商评价', evaluator: '李四', evalDate: '2025-12-30',
    evalPeriod: '年度', periodStart: '2025-01-01', periodEnd: '2025-12-31',
    status: '审核中', approver: '—', node: '采购负责人', approveTime: '—',
    creator: '李四', createdAt: '2025-12-30 14:00', supplierCount: 1, avgScore: '8.60',
    configVersion: EVAL_CONFIG_VERSION, orderRemark: '',
    approvalFlow: [{ node: '提交', user: '李四', time: '2025-12-30 14:00', result: '提交', opinion: '—' }],
    lines: [EVAL_FORM_LINES[0]],
  },
  PJ2024001: {
    no: 'PJ2024001', name: '2024年度评价', evaluator: '李四', evalDate: '2025-12-28',
    evalPeriod: '年度', periodStart: '2024-01-01', periodEnd: '2024-12-31',
    status: '草稿', approver: '—', node: '—', approveTime: '—',
    creator: '李四', createdAt: '2025-12-28 16:30', supplierCount: 0, avgScore: '—',
    configVersion: EVAL_CONFIG_VERSION, orderRemark: '', lines: [],
  },
  PJ2023001: {
    no: 'PJ2023001', name: '2023年度耗材类供应商评价', evaluator: '张三', evalDate: '2024-01-10',
    evalPeriod: '年度', periodStart: '2023-01-01', periodEnd: '2023-12-31',
    status: '已驳回', approver: '王经理', node: '采购负责人', approveTime: '2024-01-12 11:00',
    creator: '张三', createdAt: '2024-01-08 10:00', supplierCount: 3, avgScore: '—',
    configVersion: 'V2025-002', orderRemark: '', rejectReason: '评价期间数据不完整，请补充供货记录后重提',
    approvalFlow: [
      { node: '提交', user: '张三', time: '2024-01-08 10:00', result: '提交', opinion: '—' },
      { node: '采购负责人', user: '王经理', time: '2024-01-12 11:00', result: '驳回', opinion: '评价期间数据不完整，请补充供货记录后重提' },
    ],
    lines: [],
  },
};

function configEvalTabBar(active) {
  const tabs = [
    ['config_eval_weight.html', '权重设置', active === 'weight'],
    ['config_eval_grade.html', '评价等级设置', active === 'grade'],
  ];
  return `<div class="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
    ${tabs.map(([href, label, on]) =>
    `<a href="${href}" class="rounded-xl px-4 py-2 text-sm font-medium transition ${on ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}">${label}</a>`
  ).join('')}
  </div>`;
}

function configEvalWeightPage() {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const rows = EVAL_INDICATORS.map((ind, i) => `
    <tr class="border-t border-slate-100" data-wms-eval-weight-row>
      <td class="px-4 py-3 text-sm text-slate-500">${i + 1}</td>
      <td class="px-4 py-3"><input type="text" value="${ind.name}" data-eval-indicator-name class="${inputCls}" /></td>
      <td class="px-4 py-3"><input type="number" step="0.01" min="0" max="1" value="${ind.weight}" data-eval-indicator-weight class="${inputCls} w-32" /></td>
      <td class="px-4 py-3 text-right"><button type="button" class="text-sm text-rose-600 hover:underline" data-eval-weight-delete>删除</button></td>
    </tr>`).join('');
  return `
    ${configEvalTabBar('weight')}
    <div class="card rounded-2xl bg-white p-5 shadow-sm" data-wms-eval-weight-page>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-500">维护供应商评价评分指标及权重系数；新建评价单创建时快照当前版本。</p>
        <span class="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">当前版本 <strong class="text-slate-900">${EVAL_CONFIG_VERSION}</strong> · 生效 ${EVAL_CONFIG_EFFECTIVE}</span>
      </div>
      <div class="overflow-x-auto wms-modal-table-wrap mb-4">
        <table class="min-w-full wms-data-table text-sm">
          <thead class="bg-slate-50/80"><tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">序号</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><span class="text-rose-500">*</span> 指标名称</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><span class="text-rose-500">*</span> 权重系数</th>
            <th class="wms-col-actions px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">操作</th>
          </tr></thead>
          <tbody data-wms-eval-weight-tbody>${rows}</tbody>
        </table>
      </div>
      <button type="button" class="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" data-eval-weight-add><i class="fa-solid fa-plus text-xs"></i> 添加</button>
      <div class="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
        <p class="font-semibold text-slate-700 mb-1">计算说明</p>
        <p>综合评分 = Σ(维度得分 × 权重系数) / Σ(权重系数)</p>
        <p class="mt-1">示例：质量 9 分（0.4）、交货 8 分（0.2）、服务 7 分（0.2）→ (9×0.4+8×0.2+7×0.2)/(0.4+0.2+0.2) = 8.25 分</p>
        <p class="mt-2 text-slate-500">权重系数之和建议为 1.0；保存后生成新版本，仅对新建评价单生效，已建单保留创建时快照。</p>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="wms-btn wms-btn-primary" data-eval-weight-save>保存</button>
      </div>
    </div>`;
}

function configEvalGradePage() {
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const rows = EVAL_GRADES.map((g, i) => `
    <tr class="border-t border-slate-100" data-wms-eval-grade-row>
      <td class="px-4 py-3 text-sm text-slate-500">${i + 1}</td>
      <td class="px-4 py-3"><input type="text" value="${g.name}" data-eval-grade-name class="${inputCls}" /></td>
      <td class="px-4 py-3"><input type="number" step="0.1" min="0" max="10" value="${g.min}" data-eval-grade-min class="${inputCls} w-28" /></td>
      <td class="px-4 py-3"><input type="number" step="0.1" min="0" max="10" value="${g.max}" data-eval-grade-max class="${inputCls} w-28" /></td>
      <td class="px-4 py-3 text-right"><button type="button" class="text-sm text-rose-600 hover:underline" data-eval-grade-delete>删除</button></td>
    </tr>`).join('');
  return `
    ${configEvalTabBar('grade')}
    <div class="card rounded-2xl bg-white p-5 shadow-sm" data-wms-eval-grade-page>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-500">将综合评分映射为评价等级；区间须完整覆盖 0～10 分且不重叠。</p>
        <span class="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">当前版本 <strong class="text-slate-900">${EVAL_CONFIG_VERSION}</strong> · 生效 ${EVAL_CONFIG_EFFECTIVE}</span>
      </div>
      <div class="overflow-x-auto wms-modal-table-wrap mb-4">
        <table class="min-w-full wms-data-table text-sm">
          <thead class="bg-slate-50/80"><tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">序号</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><span class="text-rose-500">*</span> 评价等级</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><span class="text-rose-500">*</span> 最低分（含）</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><span class="text-rose-500">*</span> 最高分（不含，10 分含）</th>
            <th class="wms-col-actions px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">操作</th>
          </tr></thead>
          <tbody data-wms-eval-grade-tbody>${rows}</tbody>
        </table>
      </div>
      <button type="button" class="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" data-eval-grade-add><i class="fa-solid fa-plus text-xs"></i> 添加</button>
      <div class="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
        <p class="font-semibold text-slate-700 mb-1">规则</p>
        <p>1. 各等级分数不能重叠，且需覆盖 0～10 分的完整范围</p>
        <p>2. 各等级包含下限、不包含上限；10 分为最高分，包含该分值</p>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="wms-btn wms-btn-primary" data-eval-grade-save>保存</button>
      </div>
    </div>`;
}

function evalScoreHint() {
  return `<div class="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/40 p-4 text-xs text-slate-600 leading-relaxed">
    <p class="font-semibold text-slate-800 mb-1">评分说明</p>
    <p>各维度评分范围 0～10 分（支持一位小数）；表头指标来自 <a href="config_eval_weight.html" class="font-medium text-slate-800 hover:underline">评价设置 → 权重设置</a></p>
    <p>综合评分 = 加权基础分 + 特殊加分 − 特殊扣分（单项加分/扣分上限 2 分，有加减分时备注必填）</p>
    <p>评价等级按评价等级设置自动匹配；配置版本 ${EVAL_CONFIG_VERSION}</p>
  </div>`;
}

function supplierEvalTableHead(viewMode = false) {
  const indCols = EVAL_INDICATORS.map(i =>
    `<th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap"><span class="text-rose-500">*</span> ${i.name}</th>`
  ).join('');
  return `<th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">序号</th>
    <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">供应商编码</th>
    <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">供应商名称</th>
    ${indCols}
    <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">特殊加分</th>
    <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">特殊扣分</th>
    <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">综合评分</th>
    <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">评价等级</th>
    <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">备注</th>
    ${viewMode ? '' : '<th class="wms-col-actions px-3 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">操作</th>'}`;
}

function supplierEvalLineRow(line, viewMode = false) {
  const inputCls = 'w-full min-w-[4rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200';
  const roCls = 'w-full min-w-[4rem] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-600';
  const dis = viewMode ? ' readonly' : '';
  const cls = viewMode ? roCls : inputCls;
  const num = (dim, v) => `<input type="number" step="0.1" min="0" max="10" value="${v ?? ''}" data-eval-dimension="${dim}"${dis} class="${cls}" />`;
  const bonus = (v) => `<input type="number" step="0.1" min="0" max="2" value="${v ?? 0}" data-eval-field="bonus"${dis} class="${cls}" title="上限 2 分" />`;
  const penalty = (v) => `<input type="number" step="0.1" min="0" max="2" value="${v ?? 0}" data-eval-field="penalty"${dis} class="${cls}" title="上限 2 分" />`;
  const remark = (v) => `<input type="text" value="${v || ''}" placeholder="有加减分时必填" data-eval-field="lineRemark"${dis} class="${cls}" />`;
  const indCells = EVAL_INDICATORS.map(i => `<td class="px-3 py-2 whitespace-nowrap">${num(i.key, line[i.key])}</td>`).join('');
  return `<tr class="border-t border-slate-100 hover:bg-slate-50/50" data-wms-eval-line data-supplier-code="${line.code}">
    <td class="px-3 py-2 text-sm text-slate-500 whitespace-nowrap" data-eval-seq>1</td>
    <td class="px-3 py-2 text-sm font-mono text-slate-600 whitespace-nowrap"><a href="supplier_detail.html?code=${line.code}" class="hover:underline">${line.code}</a></td>
    <td class="px-3 py-2 text-sm text-slate-800 whitespace-nowrap">${line.name}</td>
    ${indCells}
    <td class="px-3 py-2 whitespace-nowrap">${bonus(line.bonus)}</td>
    <td class="px-3 py-2 whitespace-nowrap">${penalty(line.penalty)}</td>
    <td class="px-3 py-2 text-sm font-medium text-slate-900 whitespace-nowrap" data-eval-total>—</td>
    <td class="px-3 py-2 whitespace-nowrap" data-eval-grade-cell>—</td>
    <td class="px-3 py-2 whitespace-nowrap">${remark(line.remark)}</td>
    <td class="wms-col-actions px-3 py-2 text-right text-sm whitespace-nowrap">${viewMode ? '' : '<button type="button" class="text-rose-600 hover:underline" data-eval-line-delete>删除</button>'}</td>
  </tr>`;
}

function supplierEvalApprovalBlock(d) {
  if (!d.approvalFlow?.length) return '';
  const rows = d.approvalFlow.map(f => {
    const resultBadge = f.result === '通过' ? badge('通过', 'success')
      : f.result === '驳回' ? badge('驳回', 'danger')
        : badge(f.result, 'info');
    return `<tr class="border-t border-slate-100"><td class="px-3 py-2 text-sm">${f.node}</td><td class="px-3 py-2 text-sm">${f.user}</td><td class="px-3 py-2 text-sm">${resultBadge}</td><td class="px-3 py-2 text-sm text-slate-600">${f.opinion || '—'}</td><td class="px-3 py-2 text-sm text-slate-500">${f.time}</td></tr>`;
  }).join('');
  const reject = d.rejectReason ? `<p class="mt-2 text-xs text-rose-600">驳回原因：${d.rejectReason}</p>` : '';
  return `<div class="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
    <h4 class="mb-3 text-sm font-semibold text-slate-800">审批轨迹</h4>
    <div class="overflow-x-auto rounded-lg ring-1 ring-slate-100"><table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>
      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">节点</th>
      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">处理人</th>
      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">结果</th>
      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">意见</th>
      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">时间</th>
    </tr></thead><tbody>${rows}</tbody></table></div>${reject}
  </div>`;
}

function supplierEvalFormPage(backHref = 'supplier_eval_list.html', sample = {}) {
  const d = {
    no: '',
    name: '',
    evaluator: '李四',
    evalDate: '2026-06-09',
    evalPeriod: '年度',
    periodStart: '2026-01-01',
    periodEnd: '2026-12-31',
    status: '',
    lines: [],
    configVersion: EVAL_CONFIG_VERSION,
    ...sample,
  };
  const viewMode = !!d.viewMode || ['审核通过', '审核中'].includes(d.status);
  const readOnly = viewMode;
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const roCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
  const dis = readOnly ? ' disabled' : '';
  const lines = (d.lines || []).map(l => supplierEvalLineRow(l, readOnly)).join('');
  const statusType = d.status === '审核通过' ? 'success' : d.status === '审核中' ? 'warning' : d.status === '已驳回' ? 'danger' : 'info';
  const statusBadge = d.status ? `<span class="ml-2">${badge(d.status, statusType)}</span>` : '';
  const periodOpts = ['年度', '半年度', '季度', '项目单次'].map(p =>
    `<option${d.evalPeriod === p ? ' selected' : ''}>${p}</option>`
  ).join('');
  const canEdit = !readOnly && (!d.status || d.status === '草稿' || d.status === '已驳回');
  const footerBtns = canEdit
    ? '<button type="button" class="wms-btn wms-btn-secondary" data-eval-save-draft>保存草稿</button><button type="button" class="wms-btn wms-btn-primary" data-eval-submit>提交审批</button>'
    : (d.status === '已驳回' && !viewMode ? '<button type="button" class="wms-btn wms-btn-primary" data-eval-submit>重新提交</button>' : '');

  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl">
      <div class="wms-modal-form wms-warehouse-form" data-wms-supplier-eval-form data-eval-key="${d.no || ''}" data-eval-view="${readOnly ? '1' : '0'}" data-eval-status="${d.status || ''}">
        ${formSection('基础信息')}
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">评价单号</label><input type="text" value="${d.no || '系统自动生成'}" readonly class="${roCls}" data-eval-order-no /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">配置版本</label><input type="text" value="${d.configVersion || EVAL_CONFIG_VERSION}" readonly class="${roCls}" data-eval-config-version /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 评价人</label><input type="text" value="${d.evaluator || '李四'}" readonly class="${roCls}" data-eval-field="evaluator" title="默认为当前登录用户" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 评价名称</label><input type="text" value="${d.name || ''}" placeholder="请输入评价名称" data-eval-field="evalName"${readOnly ? ' readonly' : ''} class="${readOnly ? roCls : inputCls}" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 评价周期</label><select data-eval-field="evalPeriod"${dis} class="${inputCls}">${periodOpts}</select></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 评价期间</label><div class="flex items-center gap-2"><input type="date" value="${d.periodStart || ''}" data-eval-field="periodStart"${dis} class="${readOnly ? roCls : inputCls}" /><span class="text-slate-400">至</span><input type="date" value="${d.periodEnd || ''}" data-eval-field="periodEnd"${dis} class="${readOnly ? roCls : inputCls}" /></div></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 评价日期</label><input type="date" value="${d.evalDate || '2026-06-09'}" data-eval-field="evalDate"${dis} class="${readOnly ? roCls : inputCls}" /></div>
        ${d.status ? `<div class="md:col-span-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">审批状态：${statusBadge}${d.approver && d.approver !== '—' ? `<span>审批人：${d.approver}</span>` : ''}${d.approveTime && d.approveTime !== '—' ? `<span>审批时间：${d.approveTime}</span>` : ''}</div>` : ''}
        ${evalScoreHint()}
        ${formSection('评价记录')}
        <div class="md:col-span-2 flex flex-wrap items-center justify-between gap-3 mb-2">
          <p class="text-xs text-slate-500">一张评价单可评价多家供应商；综合得分与等级自动计算；审批通过后回写供应商档案</p>
          ${canEdit ? `<a href="supplier_eval_select_supplier.html" class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-plus text-[10px]"></i> 选择供应商</a>` : ''}
        </div>
        <div class="md:col-span-2 overflow-x-auto wms-modal-table-wrap -mx-1">
          <table class="min-w-full wms-data-table text-sm" data-wms-eval-lines-table>
            <thead class="bg-slate-50/80"><tr>${supplierEvalTableHead(readOnly)}</tr></thead>
            <tbody data-wms-eval-lines-tbody>${lines || '<tr data-wms-eval-empty><td colspan="20" class="px-4 py-8 text-center text-sm text-slate-400">请点击「选择供应商」添加评价对象</td></tr>'}</tbody>
          </table>
        </div>
        ${readOnly ? supplierEvalApprovalBlock(d) : ''}
        ${formSection('其他信息')}
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">备注</label><textarea rows="3" maxlength="500" placeholder="0/500" data-eval-field="orderRemark"${readOnly ? ' readonly' : ''} class="${readOnly ? roCls : inputCls}">${d.orderRemark || ''}</textarea></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">评价佐证材料</label>${readOnly ? '<p class="text-sm text-slate-400">评价报告.pdf</p>' : uploadZone()}</div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">${readOnly ? '关闭' : '取消'}</a>
        ${footerBtns}
      </div>
    </div>`;
}

function supplierDetailPage(backHref = 'supplier_list.html', code = 'GYS001') {
  const s = SUPPLIER_SAMPLES[code] || SUPPLIER_SAMPLES.GYS001;
  const supplyRows = (s.supplies || []).map(r =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="warehouse_acceptance_detail.html?supplyNo=${r.no}" class="hover:underline">${r.no}</a></td><td class="px-3 py-2.5 text-sm">${r.material}</td><td class="px-3 py-2.5 text-sm">${r.qty}</td><td class="px-3 py-2.5 text-sm">${badge(r.status, r.status === '已供货' ? 'success' : r.status === '供货中' ? 'warning' : 'info')}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.date}</td></tr>`
  ).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-sm text-slate-400">暂无供货记录</td></tr>';
  const acceptRows = (s.acceptances || []).map(r =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="warehouse_acceptance_record_detail.html?no=${r.no}" class="hover:underline">${r.no}</a></td><td class="px-3 py-2.5 text-sm font-mono text-xs">${r.supplyNo}</td><td class="px-3 py-2.5 text-sm">${r.material}</td><td class="px-3 py-2.5 text-sm">${r.qualified}</td><td class="px-3 py-2.5 text-sm">${r.unqualified}</td><td class="px-3 py-2.5 text-sm">${badge(r.status, r.status === '已验收' ? 'success' : 'warning')}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.date}</td></tr>`
  ).join('') || '<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-slate-400">暂无验收记录</td></tr>';
  const refundRows = (s.refunds || []).map(r =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="warehouse_refund_like_form.html?refundKey=${r.no}" class="hover:underline">${r.no}</a></td><td class="px-3 py-2.5 text-sm font-mono text-xs">${r.supplyNo}</td><td class="px-3 py-2.5 text-sm">${r.material}</td><td class="px-3 py-2.5 text-sm">${r.qty}</td><td class="px-3 py-2.5 text-sm">${r.reason}</td><td class="px-3 py-2.5 text-sm">${badge(r.status, r.status === '已退货' ? 'success' : 'warning')}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.date}</td></tr>`
  ).join('') || '<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-slate-400">暂无退货记录</td></tr>';
  const evalApproved = (s.evalHistory || []).filter(r => r.status === '审核通过');
  const evalRows = evalApproved.map(r =>
    `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="supplier_eval_form.html?evalKey=${r.evalNo}&mode=view" class="hover:underline">${r.evalNo}</a></td><td class="px-3 py-2.5 text-sm">${r.evalName}</td><td class="px-3 py-2.5 text-sm">${r.period}</td><td class="px-3 py-2.5 text-sm font-medium">${r.score}</td><td class="px-3 py-2.5 text-sm">${evalGradeBadge(r.grade)}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.evalDate}</td></tr>`
  ).join('') || '<tr><td colspan="6" class="px-4 py-8 text-center text-sm text-slate-400">暂无已通过评价记录</td></tr>';
  const tabs = [
    ['profile', '基础信息', true],
    ['eval', '绩效评价', false],
    ['supply', '供货记录', false],
    ['accept', '验收记录', false],
    ['refund', '退货记录', false],
  ];
  const tabBtns = tabs.map(([id, label, on]) =>
    `<button type="button" class="wms-tab-btn${on ? ' is-active' : ''}" data-supplier-tab="${id}">${label}</button>`
  ).join('');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl-detail">
      <div class="wms-supplier-detail" data-wms-supplier-detail data-supplier-code="${s.code}">
        <div class="wms-supplier-detail__head">
          <div class="wms-supplier-detail__identity">
            <div class="wms-supplier-detail__name" data-supplier-field="name">${s.name}</div>
            <div class="wms-supplier-detail__meta">
              <code data-supplier-field="code">${s.code}</code>
              <span class="text-slate-300">·</span>
              <span data-supplier-field="type">${s.type}</span>
              <span data-supplier-field="status">${supplierStatusBadge(s.status)}</span>
            </div>
          </div>
          <a href="supplier_form.html?code=${s.code}&mode=edit" class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"><i class="fa-solid fa-pen text-[10px]"></i>编辑</a>
        </div>
        <div class="wms-supplier-detail__kpis">
          <div class="wms-supplier-kpi"><p class="wms-supplier-kpi__label">最新综合评分</p><p class="wms-supplier-kpi__value" data-supplier-field="latestScore">${s.latestScore}</p></div>
          <div class="wms-supplier-kpi"><p class="wms-supplier-kpi__label">最新评价等级</p><div class="wms-supplier-kpi__value wms-supplier-kpi__value--sm" data-supplier-field="latestGrade">${evalGradeBadge(s.latestGrade)}</div></div>
          <div class="wms-supplier-kpi"><p class="wms-supplier-kpi__label">最近评价日期</p><p class="wms-supplier-kpi__value wms-supplier-kpi__value--sm" data-supplier-field="latestEvalDate">${s.latestEvalDate}</p></div>
          <div class="wms-supplier-kpi"><p class="wms-supplier-kpi__label">供货单数</p><p class="wms-supplier-kpi__value" data-supplier-field="supplyCount">${(s.supplies || []).length}</p></div>
        </div>
        <div class="wms-supplier-tabs" data-wms-supplier-tabs role="tablist">${tabBtns}</div>
        <div class="wms-supplier-detail__panels">
          <div data-supplier-panel="profile">
            <div class="wms-supplier-panel-card">
              <dl class="grid gap-x-6 sm:grid-cols-2">
                <div><dt>供应商简称</dt><dd data-supplier-field="shortName">${s.shortName}</dd></div>
                <div><dt>联系人 / 电话</dt><dd><span data-supplier-field="contact">${s.contact}</span> / <span data-supplier-field="phone">${s.phone}</span></dd></div>
                <div class="sm:col-span-2"><dt>地址</dt><dd data-supplier-field="address">${s.address}</dd></div>
                <div><dt>添加时间</dt><dd data-supplier-field="createdAt">${s.createdAt}</dd></div>
                <div><dt>最近评价单号</dt><dd class="font-mono text-xs">${s.latestEvalNo !== '—' ? `<a href="supplier_eval_form.html?evalKey=${s.latestEvalNo}&mode=view" class="text-slate-900 hover:underline">${s.latestEvalNo}</a>` : '—'}</dd></div>
              </dl>
            </div>
          </div>
          <div class="hidden" data-supplier-panel="eval">
            <div class="wms-supplier-detail__table-wrap"><table class="min-w-full text-sm" data-supplier-eval-tbody><thead><tr>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">评价单号</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">评价名称</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">评价周期</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">综合评分</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">等级</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">评价日期</th>
            </tr></thead><tbody>${evalRows}</tbody></table></div>
          </div>
          <div class="hidden" data-supplier-panel="supply">
            <div class="wms-supplier-detail__table-wrap"><table class="min-w-full text-sm"><thead><tr>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">供货单号</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">物资名称</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">需求/已供</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">状态</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">日期</th>
            </tr></thead><tbody data-supplier-supply-tbody>${supplyRows}</tbody></table></div>
          </div>
          <div class="hidden" data-supplier-panel="accept">
            <div class="wms-supplier-detail__table-wrap"><table class="min-w-full text-sm"><thead><tr>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">验收单号</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">供货单号</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">物资</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">合格</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">不合格</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">状态</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">日期</th>
            </tr></thead><tbody data-supplier-accept-tbody>${acceptRows}</tbody></table></div>
          </div>
          <div class="hidden" data-supplier-panel="refund">
            <div class="wms-supplier-detail__table-wrap"><table class="min-w-full text-sm"><thead><tr>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">退货单号</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">供货单号</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">物资</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">退货数量</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">原因</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">状态</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">日期</th>
            </tr></thead><tbody data-supplier-refund-tbody>${refundRows}</tbody></table></div>
          </div>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="${backHref}" class="wms-btn wms-btn-secondary">返回列表</a>
      </div>
    </div>`;
}

function supplierEvalSelectSupplierPage() {
  const th = `<th class="w-10 px-4 py-3"><input type="checkbox" class="rounded border-slate-300" data-eval-select-all /></th>` +
    ['供应商编码', '供应商名称', '供应商简称', '供货状态', '联系人', '联系电话', '供应商类型']
      .map(c => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('');
  const tr = EVAL_SUPPLIER_MASTER.map((cells, i) => {
    const disabled = cells[3].includes('暂停') ? ' disabled' : '';
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80${disabled ? ' opacity-50' : ''}" data-supplier-pick-row data-supplier-code="${cells[0]}">
      <td class="px-4 py-3"><input type="checkbox" class="rounded border-slate-300" data-supplier-pick${disabled ? ' disabled' : i < 2 ? ' checked' : ''} /></td>
      ${cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}
    </tr>`;
  }).join('');
  return `
    <div data-wms-modal data-modal-back="supplier_eval_form.html" data-modal-size="xl">
      <div data-wms-supplier-eval-select>
        <div class="wms-modal-toolbar">
          <p class="text-sm text-slate-500">从供应商主数据选择待评价供应商（暂停供货不可选）</p>
          ${listSearchInput('请输入供应商编码或名称')}
        </div>
        <div class="wms-modal-table-wrap"><table class="min-w-full text-sm"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>
      </div>
      <div class="wms-modal-footer">
        <a href="supplier_eval_form.html" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-primary" data-eval-select-confirm>确定</button>
      </div>
    </div>`;
}

/** ── 库场盘点（V2.0）──────────────────────────────────────── */
const COUNT_PLAN_SAMPLES = {
  PD202606090001: { no: 'PD202606090001', name: '2026 年中固定资产盘点', type: '专项盘点', method: '明盘', scope: '主仓库 / A区', venue: '场内', freeze: true, start: '2026-06-10 08:00', end: '2026-06-12 18:00', owner: '张仓管', status: '盘点中', total: 128, done: 86, diff: 3, created: '2026-06-09 10:00' },
  PD202606010002: { no: 'PD202606010002', name: '六月日常类资产抽盘', type: '日常盘点', method: '明盘', scope: '主仓库 / 全部分区', venue: '场内', freeze: false, start: '2026-06-01 09:00', end: '2026-06-01 17:00', owner: '李仓管', status: '待差异处理', total: 45, done: 45, diff: 2, created: '2026-05-30 14:00' },
  PD202605200003: { no: 'PD202605200003', name: '场外资产专项盘点', type: '专项盘点', method: '明盘', scope: '场外 / 全部地点', venue: '场外', freeze: false, start: '2026-05-20 08:00', end: '2026-05-22 18:00', owner: '王工', status: '已完成', total: 18, done: 18, diff: 0, created: '2026-05-18 09:00', finished: '2026-05-22 16:30' },
};

const COUNT_TASK_SAMPLES = {
  RW202606090001: { no: 'RW202606090001', planNo: 'PD202606090001', planName: '2026 年中固定资产盘点', shelf: 'A-01-06', owner: '张仓管', executor: '张仓管', type: '专项盘点', method: '明盘', status: '盘点中', total: 42, done: 28, diff: 1 },
  RW202606090002: { no: 'RW202606090002', planNo: 'PD202606090001', planName: '2026 年中固定资产盘点', shelf: 'A-02-03', owner: '张仓管', executor: '李仓管', type: '专项盘点', method: '明盘', status: '待盘点', total: 36, done: 0, diff: 0 },
  RW202606010003: { no: 'RW202606010003', planNo: 'PD202606010002', planName: '六月日常类资产抽盘', shelf: 'B-01-02', owner: '李仓管', executor: '李仓管', type: '日常盘点', method: '明盘', status: '待差异处理', total: 45, done: 45, diff: 2 },
};

function countPlanStatusBadge(s) {
  const m = { '草稿': 'info', '待盘点': 'warning', '盘点中': 'info', '待差异处理': 'warning', '已完成': 'success', '已取消': 'danger' };
  return badge(s, m[s] || 'info');
}

function countTaskStatusBadge(s) {
  const m = { '待盘点': 'warning', '盘点中': 'info', '已提交': 'info', '待差异处理': 'warning', '已完成': 'success' };
  return badge(s, m[s] || 'info');
}

function countDiffStatusBadge(s) {
  const m = { '待处理': 'warning', '处理中': 'info', '已处理': 'success', '已关闭': 'info' };
  return badge(s, m[s] || 'info');
}

function countDiffTypeBadge(t) {
  const m = { '盘盈': 'success', '盘亏': 'danger', '货位不符': 'warning', '状态异常': 'danger' };
  return badge(t, m[t] || 'info');
}

function countAdjustStatusBadge(s) {
  const m = { '草稿': 'info', '审核中': 'warning', '已通过': 'success', '已驳回': 'danger' };
  return badge(s, m[s] || 'info');
}

function countPlanListPage() {
  const rows = Object.values(COUNT_PLAN_SAMPLES).map(p => ({
    cells: [p.no, p.name, p.type, p.method, p.start, p.end, p.scope, countPlanStatusBadge(p.status), p.owner, p.created],
    tab: p.status,
    actions: `<a href="count_plan_detail.html?no=${p.no}" class="mr-2 hover:underline">查看</a>${p.status === '盘点中' ? `<a href="count_task_list.html?plan=${p.no}" class="mr-2 hover:underline">任务</a>` : ''}${p.status === '待差异处理' ? `<a href="count_diff_list.html?plan=${p.no}" class="text-amber-700 hover:underline">差异</a>` : ''}`,
  }));
  rows.push({
    cells: ['PD202606080004', '固定资产抽盘（草稿）', '日常盘点', '明盘', '—', '—', '主仓库 / B区', countPlanStatusBadge('草稿'), '张仓管', '2026-06-08 11:00'],
    tab: '草稿',
    actions: '<a href="count_plan_form.html?mode=edit" class="mr-2 hover:underline">编辑</a><a href="#" class="text-slate-400">删除</a>',
  });
  return listPage({
    desc: '创建盘点计划并发布任务；仅纳入<strong>是否需要盘点=是</strong>的资产类物资。发布时快照账存，默认冻结范围内出入库。',
    addBtn: true, addHref: 'count_plan_form.html',
    tabs: ['全部', '草稿', '待盘点', '盘点中', '待差异处理', '已完成'],
    tabColumn: 7,
    searchPlaceholder: '盘点编号、名称、负责人',
    filters: [
      { label: '盘点类型', key: 'type', column: 2, options: ['全部', '日常盘点', '专项盘点'] },
      { label: '盘点方法', key: 'method', column: 3, options: ['全部', '明盘', '盲盘'] },
    ],
    columns: ['盘点编号', '盘点名称', '盘点类型', '盘点方法', '开始时间', '结束时间', '盘点范围', '盘点状态', '负责人', '创建时间'],
    rows,
  });
}

function countPlanFormPage(backHref = 'count_plan_list.html') {
  return `<div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
    <div class="wms-modal-form wms-warehouse-form">
      <div class="md:col-span-2"><h3 class="wms-form-section-title">计划信息</h3></div>
      ${formField('盘点编号', 'text', '系统生成', false, { readonly: true })}
      ${formField('盘点名称', 'text', '', true)}
      ${formField('盘点类型', 'select', ['日常盘点', '专项盘点'], true)}
      ${formField('盘点方法', 'select', ['明盘', '盲盘'], true)}
      ${formField('场内外范围', 'select', ['场内', '场外', '全部'], true)}
      ${formField('盘点范围', 'select', ['全库', '指定仓库', '指定分区', '指定货架', '指定物资大类'], true)}
      ${formField('仓库', 'select', ['主仓库'], false)}
      ${formField('分区', 'select', ['A区', 'B区'], false)}
      ${formField('开始时间', 'text', '', true)}
      ${formField('结束时间', 'text', '', true)}
      ${formField('盘点负责人', 'select', ['张仓管', '李仓管'], true)}
      <div class="md:col-span-2 flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-900">
        <input type="checkbox" checked class="rounded border-amber-300" id="count-freeze" />
        <label for="count-freeze">发布时冻结范围内出入库（入库/出库/归还/退货按钮禁用）</label>
      </div>
      ${formField('备注', 'textarea', '', false, { colSpan: 2 })}
      <div class="md:col-span-2 rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900">
        <i class="fa-solid fa-circle-info mr-1"></i>发布后将按「是否需要盘点=是」自动生成盘点明细，并按货架拆分为盘点任务。
      </div>
    </div>
    <div class="wms-modal-footer">
      <a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>
      <button type="button" class="wms-btn wms-btn-secondary">保存草稿</button>
      <button type="button" class="wms-btn wms-btn-primary">发布计划</button>
    </div>
  </div>`;
}

function countPlanDetailPage() {
  const p = COUNT_PLAN_SAMPLES.PD202606090001;
  const progress = Math.round((p.done / p.total) * 100);
  return `<div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">${p.name}</h2>
        <p class="mt-0.5 font-mono text-sm text-slate-500">${p.no} · ${countPlanStatusBadge(p.status)} ${p.freeze ? badge('已冻结', 'warning') : ''}</p>
      </div>
      <div class="flex gap-2">
        <a href="count_task_list.html?plan=${p.no}" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-list-check text-xs"></i>查看任务</a>
        <a href="count_diff_list.html?plan=${p.no}" class="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"><i class="fa-solid fa-scale-unbalanced text-xs"></i>差异处理</a>
      </div>
    </div>
    <div class="grid gap-4 sm:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">应盘项</p><p class="mt-1 text-2xl font-semibold">${p.total}</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">已盘项</p><p class="mt-1 text-2xl font-semibold text-emerald-700">${p.done}</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">差异项</p><p class="mt-1 text-2xl font-semibold text-amber-700">${p.diff}</p></div>
      <div class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">完成率</p><p class="mt-1 text-2xl font-semibold">${progress}%</p></div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 class="mb-3 text-sm font-semibold text-slate-800">计划信息</h3>
      <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
        <div><dt class="text-slate-500">盘点类型</dt><dd class="mt-0.5">${p.type}</dd></div>
        <div><dt class="text-slate-500">盘点方法</dt><dd class="mt-0.5">${p.method}</dd></div>
        <div><dt class="text-slate-500">盘点范围</dt><dd class="mt-0.5">${p.scope} · ${p.venue}</dd></div>
        <div><dt class="text-slate-500">计划时间</dt><dd class="mt-0.5">${p.start} ~ ${p.end}</dd></div>
        <div><dt class="text-slate-500">负责人</dt><dd class="mt-0.5">${p.owner}</dd></div>
        <div><dt class="text-slate-500">创建时间</dt><dd class="mt-0.5">${p.created}</dd></div>
      </dl>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 class="mb-3 text-sm font-semibold text-slate-800">关联任务</h3>
      <div class="overflow-x-auto wms-modal-table-wrap"><table class="min-w-full text-sm wms-data-table"><thead class="bg-slate-50/80"><tr>
        <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">任务编号</th>
        <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">盘点货架</th>
        <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">执行人</th>
        <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">进度</th>
        <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">状态</th>
        <th class="px-3 py-2 text-right text-xs font-semibold text-slate-500">操作</th>
      </tr></thead><tbody>
        <tr class="border-t border-slate-100"><td class="px-3 py-3 font-mono text-xs">RW202606090001</td><td class="px-3 py-3">A-01-06</td><td class="px-3 py-3">张仓管</td><td class="px-3 py-3">28/42</td><td class="px-3 py-3">${countTaskStatusBadge('盘点中')}</td><td class="px-3 py-3 text-right"><a href="count_execute_form.html?task=RW202606090001" class="hover:underline">执行</a></td></tr>
        <tr class="border-t border-slate-100"><td class="px-3 py-3 font-mono text-xs">RW202606090002</td><td class="px-3 py-3">A-02-03</td><td class="px-3 py-3">李仓管</td><td class="px-3 py-3">0/36</td><td class="px-3 py-3">${countTaskStatusBadge('待盘点')}</td><td class="px-3 py-3 text-right"><a href="count_task_detail.html?no=RW202606090002" class="hover:underline">查看</a></td></tr>
      </tbody></table></div>
    </div>
    <div class="flex gap-2"><a href="count_plan_list.html" class="wms-btn wms-btn-secondary">返回列表</a></div>
  </div>`;
}

function countTaskListPage() {
  const rows = Object.values(COUNT_TASK_SAMPLES).map(t => ({
    cells: [t.no, t.planNo, t.planName, t.shelf, t.executor, t.type, t.method, `${t.done}/${t.total}`, countTaskStatusBadge(t.status)],
    tab: t.status,
    actions: `<a href="count_task_detail.html?no=${t.no}" class="mr-2 hover:underline">查看</a><a href="count_execute_form.html?task=${t.no}" class="font-medium hover:underline">执行</a>`,
  }));
  return listPage({
    desc: '由盘点计划自动拆分；执行人仅可见分配给自己的任务。提交后自动生成差异记录。',
    tabs: ['全部', '待盘点', '盘点中', '待差异处理', '已完成'],
    tabColumn: 8,
    searchPlaceholder: '任务编号、计划名称、货架、执行人',
    filters: [{ label: '盘点类型', key: 'type', column: 5, options: ['全部', '日常盘点', '专项盘点'] }],
    columns: ['任务编号', '计划编号', '计划名称', '盘点货架', '执行人', '盘点类型', '盘点方法', '进度', '任务状态'],
    rows,
  });
}

function countTaskDetailPage() {
  const t = COUNT_TASK_SAMPLES.RW202606090001;
  return `<div data-wms-modal data-modal-back="count_task_list.html" data-modal-size="xl">
    <div class="space-y-5">
      <div class="rounded-xl border border-sky-100 bg-sky-50/60 p-4">
        <h3 class="text-sm font-semibold text-sky-900 mb-2"><i class="fa-solid fa-clipboard-list mr-1"></i>盘点计划</h3>
        <dl class="grid gap-2 sm:grid-cols-2 text-sm text-sky-900">
          <div><span class="text-sky-700/80">计划编号：</span><span class="font-mono">${t.planNo}</span></div>
          <div><span class="text-sky-700/80">计划名称：</span>${t.planName}</div>
          <div><span class="text-sky-700/80">盘点类型：</span>${t.type}</div>
          <div><span class="text-sky-700/80">盘点方法：</span>${t.method}</div>
        </dl>
      </div>
      <div class="rounded-xl border border-slate-200 p-4">
        <h3 class="text-sm font-semibold text-slate-800 mb-3"><i class="fa-solid fa-list-check mr-1 text-slate-400"></i>盘点任务</h3>
        <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
          <div><dt class="text-slate-500">任务编号</dt><dd class="mt-0.5 font-mono">${t.no}</dd></div>
          <div><dt class="text-slate-500">盘点货架</dt><dd class="mt-0.5">${t.shelf}</dd></div>
          <div><dt class="text-slate-500">负责人 / 执行人</dt><dd class="mt-0.5">${t.owner} / ${t.executor}</dd></div>
          <div><dt class="text-slate-500">任务状态</dt><dd class="mt-0.5">${countTaskStatusBadge(t.status)}</dd></div>
          <div><dt class="text-slate-500">应盘 / 已盘 / 差异</dt><dd class="mt-0.5">${t.total} / ${t.done} / ${t.diff}</dd></div>
        </dl>
      </div>
    </div>
    <div class="wms-modal-footer mt-4">
      <a href="count_task_list.html" class="wms-btn wms-btn-secondary">关闭</a>
      <a href="count_execute_form.html?task=${t.no}" class="wms-btn wms-btn-primary">进入执行</a>
    </div>
  </div>`;
}

function countExecuteFormPage(backHref = 'count_task_list.html') {
  const t = COUNT_TASK_SAMPLES.RW202606090001;
  const pct = Math.round((t.done / t.total) * 100);
  const fixedRows = [
    { shelf: 'A-01-06', code: 'ZC-GD-001002', name: '笔记本', spec: '14寸', unit: '台', asset: 'ZC202606001', sys: '在库', actual: '在库', result: '正常' },
    { shelf: 'A-01-06', code: 'ZC-GD-001001', name: '一体机', spec: '23.8寸', unit: '台', asset: 'ZC202606002', sys: '在库', actual: '在库', result: '正常' },
    { shelf: 'A-01-06', code: 'GC-20001', name: '工程测量仪', spec: '全站仪', unit: '台', asset: 'ZC202605012', sys: '借出', actual: '', result: '差异', diff: '状态异常' },
  ];
  const likeRows = [
    { shelf: 'A-01-06', code: 'LA-00456', name: '电钻', spec: '650W', unit: '台', sys: '6', actual: '6', result: '正常' },
    { shelf: 'A-01-06', code: 'LA-00457', name: '钢丝绳', spec: 'Φ18', unit: 'm', sys: '100', actual: '98', result: '差异', diff: '盘亏 -2' },
  ];
  const tr = [...fixedRows, ...likeRows].map((r, i) => {
    const isDiff = r.result === '差异';
    const actualCell = r.asset
      ? `<select class="rounded-lg border border-slate-200 px-2 py-1 text-sm"><option>在库</option><option>借出</option><option>未盘到</option></select>`
      : `<input type="number" value="${r.actual}" class="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm" />`;
    return `<tr class="border-t border-slate-100 ${isDiff ? 'bg-amber-50/40' : ''}">
      <td class="px-3 py-3 text-sm">${i + 1}</td>
      <td class="px-3 py-3 text-sm">${r.shelf}</td>
      <td class="px-3 py-3 font-mono text-xs">${r.code}</td>
      <td class="px-3 py-3 text-sm">${r.name}</td>
      <td class="px-3 py-3 text-sm text-slate-500">${r.spec}</td>
      <td class="px-3 py-3 text-sm">${r.unit}</td>
      <td class="px-3 py-3 font-mono text-xs">${r.asset || '—'}</td>
      <td class="px-3 py-3 text-sm">${r.sys}</td>
      <td class="px-3 py-3">${actualCell}</td>
      <td class="px-3 py-3 text-sm">${isDiff ? countDiffTypeBadge(r.diff?.includes('盘亏') ? '盘亏' : '状态异常') : badge('正常', 'success')}</td>
    </tr>`;
  }).join('');
  return `<div data-wms-modal data-modal-back="${backHref}" data-modal-size="xl" data-wms-count-execute>
    <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-900">${t.planName}</p>
          <p class="mt-0.5 text-xs text-slate-500 font-mono">任务 ${t.no} · 货架 ${t.shelf} · ${countTaskStatusBadge(t.status)}</p>
        </div>
        <div class="text-right text-sm">
          <p class="text-slate-500">进度 <span class="font-semibold text-slate-900">${t.done}/${t.total}</span>（${pct}%）</p>
          <div class="mt-1 h-1.5 w-40 rounded-full bg-slate-200 overflow-hidden"><div class="h-full rounded-full bg-emerald-500" style="width:${pct}%"></div></div>
        </div>
      </div>
      <p class="mt-2 text-xs text-slate-500"><i class="fa-solid fa-eye mr-1"></i>明盘模式：显示发布时快照账存。固定资产按资产编码确认，类资产录入实盘数量。</p>
    </div>
    <div class="wms-modal-table-wrap overflow-x-auto max-h-[420px] overflow-y-auto"><table class="min-w-full text-sm wms-data-table sticky top-0"><thead class="bg-slate-50/90"><tr>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">序号</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">货位</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">物资编码</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">物资名称</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">规格</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">单位</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">资产编码</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">系统库存</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">实际库存</th>
      <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">盘点结果</th>
    </tr></thead><tbody>${tr}</tbody></table></div>
    <div class="wms-modal-footer">
      <a href="${backHref}" class="wms-btn wms-btn-secondary">返回</a>
      <button type="button" class="wms-btn wms-btn-secondary">保存进度</button>
      <button type="button" class="wms-btn wms-btn-primary" data-wms-count-submit>提交任务</button>
    </div>
  </div>`;
}

function countDiffListPage() {
  const rows = [
    { cells: ['主仓库', 'A-01-06', 'LA-00457', '钢丝绳', 'Φ18×100m', 'm', '资产-类资产', '防汛设备', '100', '98', '-2', '2%', countDiffTypeBadge('盘亏'), countDiffStatusBadge('待处理'), '—', '—'], tab: '待处理', actions: '<a href="count_adjust_form.html?diff=1" class="mr-2 hover:underline">调整库存</a><a href="count_relocate_form.html" class="hover:underline">调货位</a>' },
    { cells: ['主仓库', 'A-01-06', 'GC-20001', '工程测量仪', '全站仪 TS06', '台', '资产-固定资产', '办公设备', '1', '0', '-1', '100%', countDiffTypeBadge('状态异常'), countDiffStatusBadge('待处理'), '—', '—'], tab: '待处理', actions: '<a href="count_adjust_form.html?diff=2" class="mr-2 hover:underline">调整库存</a><a href="warehouse_scrap_form.html" class="text-rose-600 hover:underline">关联报废</a>' },
    { cells: ['主仓库', 'B-01-02', 'LA-00456', '电钻', '650W', '台', '资产-类资产', '电动工具', '8', '8', '0', '0%', countDiffTypeBadge('货位不符'), countDiffStatusBadge('已处理'), '张仓管', '2026-06-01'], tab: '已处理', actions: '<a href="count_relocate_form.html?mode=view" class="hover:underline">查看</a>' },
  ];
  return `
    <div data-wms-list-page>
      <p class="mb-4 text-sm text-slate-500">盘点执行提交后自动生成差异记录。数量差异走<strong>库存调整</strong>（需审批），货位错误走<strong>调货位</strong>（免审批）。</p>
      <div class="mb-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm"><span class="text-amber-800">差异项数</span><p class="text-2xl font-semibold text-amber-900">3</p></div>
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><span class="text-slate-500">待处理</span><p class="text-2xl font-semibold text-slate-900">2</p></div>
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><span class="text-slate-500">差异率</span><p class="text-2xl font-semibold text-slate-900">2.3%</p></div>
      </div>
      ${listPageActions({ searchPlaceholder: '物资编码、名称、货架', filters: [{ label: '处理状态', key: 'status', column: 13, options: ['全部', '待处理', '已处理'] }, { label: '差异类型', key: 'diff', column: 12, options: ['全部', '盘盈', '盘亏', '货位不符', '状态异常'] }] })}
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm">
        <div class="overflow-x-auto wms-modal-table-wrap"><table class="min-w-full wms-data-table text-sm"><thead class="bg-slate-50/80"><tr>
          ${['库场', '货架', '物资编号', '物资名称', '规格', '单位', '物资大类', '物资小类', '系统库存', '实际库存', '差异数量', '差异率', '差异类型', '处理状态', '处理人', '处理时间'].map(c => `<th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('')}
          ${actionTh('px-3 py-3')}
        </tr></thead><tbody>${rows.map(r => `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-tab="${r.tab}">${r.cells.map(c => `<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('')}${actionTd(r.actions, 'px-3 py-3.5')}</tr>`).join('')}</tbody></table></div>
        ${listTableFooter(3)}
      </div>
    </div>`;
}

function countRelocateFormPage(backHref = 'count_diff_list.html') {
  return `<div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
    <div class="wms-modal-form wms-warehouse-form">
      <div class="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm">
        <p class="font-medium text-slate-800">关联盘点：PD202606010002 · 六月日常类资产抽盘</p>
        <p class="mt-1 text-slate-500">电钻（LA-00456）· 系统库存 8 · 实际库存 8 · 差异类型：货位不符</p>
      </div>
      ${formField('当前货位', 'text', '主仓库 / A区 / A-01-06', false, { readonly: true })}
      ${formField('差异原因', 'select', ['存放错误', '标签错误', '其他'], true)}
      ${formField('目标仓库', 'select', ['主仓库'], true)}
      ${formField('目标分区', 'select', ['A区', 'B区'], true)}
      ${formField('目标货架', 'select', ['A-02-03', 'B-01-02'], true)}
      ${formField('处理方式', 'select', ['调货位'], true)}
      ${formField('补充说明', 'textarea', '', false, { colSpan: 2 })}
      <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">现场照片</label>${uploadZone()}</div>
      <p class="md:col-span-2 text-xs text-slate-400">调货位仅变更存放位置，数量不变；提交后直接生效并写入 relocate 流水。</p>
    </div>
    <div class="wms-modal-footer"><a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a><button type="button" class="wms-btn wms-btn-primary">确定</button></div>
  </div>`;
}

function countAdjustListPage() {
  return listPage({
    desc: '由差异处理生成的库存调整单；审批通过后更新<a href="ledger_warehouse.html" class="font-medium text-slate-800 hover:underline">仓库台账</a>并写入 adjust 流水。',
    tabs: ['全部', '审核中', '已通过', '已驳回'],
    tabColumn: 5,
    searchPlaceholder: '处理编号、盘点编号、差异原因',
    columns: ['处理编号', '差异原因', '盘点编号', '盘点名称', '审核状态', '审批人', '审核时间', '创建人', '创建时间'],
    rows: [
      { cells: ['TZ202606090001', '盘亏', 'PD202606010002', '六月日常类资产抽盘', countAdjustStatusBadge('审核中'), '物资管理部门', '—', '李仓管', '2026-06-01 17:30'], tab: '审核中', actions: '<a href="count_adjust_detail.html?no=TZ202606090001" class="hover:underline">查看</a>' },
      { cells: ['TZ202606080002', '状态异常', 'PD202606090001', '2026 年中固定资产盘点', countAdjustStatusBadge('草稿'), '—', '—', '张仓管', '2026-06-09 15:00'], tab: '草稿', actions: '<a href="count_adjust_form.html?no=TZ202606080002" class="hover:underline">编辑</a>' },
      { cells: ['TZ202605220001', '盘盈', 'PD202605200003', '场外资产专项盘点', countAdjustStatusBadge('已通过'), '物资管理部门', '2026-05-22 16:00', '王工', '2026-05-22 15:00'], tab: '已通过', actions: '<a href="count_adjust_detail.html?no=TZ202605220001" class="hover:underline">查看</a>' },
    ],
  });
}

function countAdjustFormPage(backHref = 'count_diff_list.html') {
  return `<div data-wms-modal data-modal-back="${backHref}" data-modal-size="lg">
    <div class="wms-modal-form wms-warehouse-form">
      <div class="md:col-span-2 rounded-lg border border-amber-100 bg-amber-50/80 p-3 text-sm text-amber-900">
        <i class="fa-solid fa-scale-unbalanced mr-1"></i>差异：盘亏 · 钢丝绳（LA-00457）· 账存 100 → 实盘 98 · 调整 -2 m
      </div>
      ${formField('调整单号', 'text', '系统生成', false, { readonly: true })}
      ${formField('关联盘点', 'text', 'PD202606010002', false, { readonly: true })}
      ${formField('差异原因', 'select', ['破损', '丢失', '计量误差', '其他'], true)}
      ${formField('调整前数量', 'text', '100', false, { readonly: true })}
      ${formField('调整后数量', 'text', '98', true)}
      ${formField('调整说明', 'textarea', '', false, { colSpan: 2 })}
      <p class="md:col-span-2 text-xs text-amber-700"><i class="fa-solid fa-circle-info mr-1"></i>提交后进入基础平台审批；通过后扣减台账并写入 adjust 审计流水。</p>
    </div>
    <div class="wms-modal-footer"><a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a><button type="button" class="wms-btn wms-btn-secondary">保存草稿</button><button type="button" class="wms-btn wms-btn-primary">提交审批</button></div>
  </div>`;
}

function countAdjustDetailPage() {
  return `<div data-wms-modal data-modal-back="count_adjust_list.html" data-modal-size="lg">
    <div class="space-y-4">
      <div class="flex items-center justify-between"><h3 class="text-lg font-semibold">TZ202606090001</h3>${countAdjustStatusBadge('审核中')}</div>
      <dl class="grid gap-3 sm:grid-cols-2 text-sm">
        <div><dt class="text-slate-500">盘点计划</dt><dd>PD202606010002 · 六月日常类资产抽盘</dd></div>
        <div><dt class="text-slate-500">差异原因</dt><dd>盘亏</dd></div>
        <div><dt class="text-slate-500">物资</dt><dd>LA-00457 · 钢丝绳</dd></div>
        <div><dt class="text-slate-500">调整数量</dt><dd class="text-rose-700 font-medium">-2 m</dd></div>
        <div><dt class="text-slate-500">审批节点</dt><dd>申请人 → 仓库管理员 → 物资管理部门</dd></div>
        <div><dt class="text-slate-500">创建人</dt><dd>李仓管 · 2026-06-01 17:30</dd></div>
      </dl>
    </div>
    <div class="wms-modal-footer mt-4"><a href="count_adjust_list.html" class="wms-btn wms-btn-secondary">关闭</a></div>
  </div>`;
}

const appPagesDir = path.join(__dirname, '..', 'pages', 'app');

const appHead = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>{{TITLE}} · WMS 移动盘点</title>
  <link rel="stylesheet" href="../../css/tailwind.css" />
  <link rel="stylesheet" href="../../css/custom.css" />
  <link rel="stylesheet" href="../../vendor/fontawesome/css/all.min.css" />
</head>`;

const APP_HERO_IMG = 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80';

function appStatusBar() {
  return `<div class="wms-ios-status" aria-hidden="true">
    <span class="wms-ios-time">9:41</span>
    <div class="wms-ios-status-right">
      <i class="fa-solid fa-signal"></i>
      <i class="fa-solid fa-wifi"></i>
      <span class="wms-ios-battery" title="电量 85%"><i class="fa-solid fa-battery-three-quarters"></i><span>85%</span></span>
    </div>
  </div>`;
}

function appTabBar(activeTab) {
  const tabs = [
    { id: 'home', href: 'app_count_home.html', icon: 'fa-house', label: '首页' },
    { id: 'scan', href: 'app_count_scan.html', icon: 'fa-qrcode', label: '扫码' },
    { id: 'profile', href: 'app_count_profile.html', icon: 'fa-user', label: '我的' },
  ];
  return `<nav class="wms-app-tabbar">${tabs.map(t =>
    `<a href="${t.href}" class="wms-app-tab wms-app-btn${activeTab === t.id ? ' is-active' : ''}"><i class="fa-solid ${t.icon}"></i><span>${t.label}</span></a>`
  ).join('')}</nav>`;
}

function appPageShell({
  title,
  body,
  backHref = 'app_count_home.html',
  showTab = true,
  activeTab = 'home',
  largeTitle = false,
  subtitle = '',
  footer = '',
  toast = false,
} = {}) {
  const nav = largeTitle ? '' : `<header class="wms-app-nav">
    ${backHref ? `<a href="${backHref}" class="wms-app-back wms-app-btn" aria-label="返回"><i class="fa-solid fa-chevron-left"></i></a>` : '<span class="wms-app-back-spacer"></span>'}
    <h1 class="wms-app-nav-title">${title}</h1>
    <span class="wms-app-back-spacer"></span>
  </header>`;

  const largeTitleBlock = largeTitle ? `<div class="wms-app-large-title">
    <p class="wms-app-large-eyebrow">黄冈武穴 · 现场盘点</p>
    <h1 class="wms-app-large-heading">${title}</h1>
    ${subtitle ? `<p class="wms-app-large-sub">${subtitle}</p>` : ''}
  </div>` : '';

  const toastEl = toast ? `<div id="wms-count-toast" class="hidden" role="status"></div>` : '';

  return `${appHead.replace('{{TITLE}}', title)}
<body class="wms-app-body" data-page="app_count" data-title="${title}">
  <div class="wms-device-stage">
    <div class="wms-iphone16">
      <div class="wms-dynamic-island" aria-hidden="true"></div>
      <div class="wms-app-screen">
        ${appStatusBar()}
        ${nav}
        <main class="wms-app-main">
          ${largeTitleBlock}
          ${body}
        </main>
        ${footer}
        ${showTab ? appTabBar(activeTab) : ''}
        <div class="wms-home-indicator" aria-hidden="true"></div>
        ${toastEl}
      </div>
    </div>
  </div>
  <script src="../../js/layout.js" charset="UTF-8"></script>
</body></html>`;
}

function appQuickAction(href, icon, label, tone) {
  const tones = {
    zinc: 'background:#f4f4f5;color:#3f3f46',
    stone: 'background:#f5f5f4;color:#57534e',
    neutral: 'background:#f5f5f5;color:#525252',
    slate: 'background:#f1f5f9;color:#475569',
  };
  return `<a href="${href}" class="wms-app-quick wms-app-btn">
    <div class="wms-app-quick-icon" style="${tones[tone] || tones.zinc}"><i class="fa-solid ${icon}"></i></div>
    <span class="wms-app-quick-label">${label}</span>
  </a>`;
}

function appCountHomePage() {
  return appPageShell({
    title: '盘点',
    largeTitle: true,
    subtitle: '2026年中盘点 · 主仓库 A区',
    activeTab: 'home',
    backHref: '',
    body: `
    <div class="wms-app-pad wms-app-pad--top">
      <div class="wms-app-stack">
        <div class="wms-app-hero">
          <img src="${APP_HERO_IMG}" alt="仓库" class="wms-app-hero-bg" />
          <div class="wms-app-hero-overlay"></div>
          <div class="wms-app-hero-content">
            <p class="text-xs font-medium text-white/70">当前计划</p>
            <p class="mt-1 text-base font-semibold tracking-tight">进行中 · 明盘模式</p>
            <dl class="wms-app-stat-row">
              <div class="wms-app-stat-chip"><dt>我的任务</dt><dd>2</dd></div>
              <div class="wms-app-stat-chip"><dt>待盘项</dt><dd>14</dd></div>
              <div class="wms-app-stat-chip"><dt>差异</dt><dd style="color:#fbbf24">1</dd></div>
            </dl>
          </div>
        </div>
        <section class="wms-app-card p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="wms-app-section-title">待办任务</h2>
            <a href="app_count_task_list.html" class="text-xs font-medium text-zinc-500">全部 <i class="fa-solid fa-chevron-right text-[10px]"></i></a>
          </div>
          <a href="app_count_execute.html?task=RW202606090001" class="wms-app-task-item wms-app-btn">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-[11px] text-zinc-500">RW202606090001</span>
              ${countTaskStatusBadge('盘点中')}
            </div>
            <p class="mt-1.5 text-sm font-semibold text-zinc-900">货架 A-01-06 · 28/42</p>
            <p class="mt-0.5 text-xs text-zinc-500">2026 年中固定资产盘点</p>
            <div class="wms-app-progress"><span style="width:67%"></span></div>
          </a>
          <a href="app_count_execute.html?task=RW202606090002" class="wms-app-task-item wms-app-btn">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-[11px] text-zinc-500">RW202606090002</span>
              ${countTaskStatusBadge('待盘点')}
            </div>
            <p class="mt-1.5 text-sm font-semibold text-zinc-900">货架 A-02-03 · 0/36</p>
            <div class="wms-app-progress"><span style="width:0%"></span></div>
          </a>
        </section>
      </div>
    </div>`,
  });
}

function appCountTaskListPage() {
  const tasks = Object.values(COUNT_TASK_SAMPLES);
  const cards = tasks.map(t => {
    const pct = Math.round((t.done / t.total) * 100);
    return `<a href="app_count_execute.html?task=${t.no}" class="wms-app-card block p-4 wms-app-btn">
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono text-[11px] text-zinc-500">${t.no}</span>
        ${countTaskStatusBadge(t.status)}
      </div>
      <p class="mt-2 text-base font-semibold text-zinc-900">${t.shelf}</p>
      <p class="mt-0.5 text-xs text-zinc-500">${t.planName}</p>
      <div class="mt-3 flex items-center justify-between text-sm">
        <span class="text-zinc-500">进度 ${t.done}/${t.total}</span>
        <span class="font-semibold text-zinc-800">执行 <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i></span>
      </div>
      <div class="wms-app-progress"><span style="width:${pct}%"></span></div>
    </a>`;
  }).join('');
  return appPageShell({
    title: '我的任务',
    activeTab: '',
    backHref: 'app_count_home.html',
    body: `<div class="wms-app-pad wms-app-pad--top">
      <div class="wms-app-stack">
        <div class="wms-app-card--glass wms-app-card flex items-center gap-3 p-3">
          <i class="fa-solid fa-magnifying-glass text-zinc-400 pl-1"></i>
          <span class="text-sm text-zinc-400">搜索任务单号、货架…</span>
        </div>
        ${cards}
      </div>
    </div>`,
  });
}

function appCountExecutePage() {
  const t = COUNT_TASK_SAMPLES.RW202606090001;
  const items = [
    { name: '笔记本', asset: 'ZC202606001', sys: '在库', done: true },
    { name: '一体机', asset: 'ZC202606002', sys: '在库', done: true },
    { name: '工程测量仪', asset: 'ZC202605012', sys: '借出', done: false, diff: true },
    { name: '电钻', asset: '', sys: '6', done: false, qty: true },
    { name: '钢丝绳', asset: '', sys: '100', done: false, qty: true, diff: true },
  ];
  const itemCards = items.map(it => `<div class="wms-app-card p-4${it.diff ? ' ring-1 ring-amber-200/80' : ''}" data-wms-app-count-item style="${it.diff ? 'background:rgba(255,251,235,0.5)' : ''}">
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="font-semibold text-zinc-900">${it.name}</p>
        ${it.asset ? `<p class="mt-0.5 font-mono text-[11px] text-zinc-500">${it.asset}</p>` : ''}
        <p class="mt-1 text-xs text-zinc-500">账存：${it.sys}</p>
      </div>
      ${it.done ? badge('已盘', 'success') : badge('待盘', 'warning')}
    </div>
    ${it.qty ? `<div class="wms-app-field mt-3"><label>实盘数量</label><input type="number" placeholder="请输入实盘数量" /></div>` : ''}
    ${!it.qty && !it.done ? `<div class="mt-3 flex gap-2">
      <button type="button" class="wms-app-cta flex-1 wms-app-btn" data-wms-app-count-confirm>确认在库</button>
      <button type="button" class="wms-app-cta wms-app-cta--secondary wms-app-btn px-4" style="width:auto;flex:0 0 auto">未盘到</button>
    </div>` : ''}
  </div>`).join('');
  return appPageShell({
    title: '执行盘点',
    activeTab: '',
    showTab: false,
    backHref: 'app_count_task_list.html',
    toast: true,
    body: `<div class="wms-app-pad wms-app-pad--top space-y-4" style="padding-bottom:0.5rem">
      <div class="wms-app-card--glass wms-app-card p-3 text-xs text-zinc-600">
        <p class="font-semibold text-zinc-900">${t.planName}</p>
        <p class="mt-0.5">货架 ${t.shelf} · 明盘 · 已完成 ${t.done}/${t.total}</p>
      </div>
      <div class="wms-app-segment" data-wms-app-count-tabs>
        <button type="button" class="is-active wms-app-btn" data-tab="pending">待盘 3</button>
        <button type="button" class="wms-app-btn" data-tab="done">已盘 2</button>
        <button type="button" class="wms-app-btn" data-tab="diff">差异 1</button>
      </div>
      <div class="space-y-3">${itemCards}</div>
    </div>`,
    footer: `<div class="wms-app-sticky-footer">
      <button type="button" class="wms-app-cta wms-app-btn" data-wms-count-submit>提交任务</button>
    </div>`,
  });
}

function appCountScanPage() {
  return appPageShell({
    title: '扫码盘点',
    activeTab: 'scan',
    backHref: 'app_count_home.html',
    body: `<div class="wms-app-pad wms-app-pad--top space-y-4">
      <div class="wms-app-scan-stage">
        <div class="wms-app-scan-frame"></div>
        <div class="wms-app-scan-corner wms-app-scan-corner--tl"></div>
        <div class="wms-app-scan-corner wms-app-scan-corner--tr"></div>
        <div class="wms-app-scan-corner wms-app-scan-corner--bl"></div>
        <div class="wms-app-scan-corner wms-app-scan-corner--br"></div>
        <div class="wms-app-scan-line"></div>
        <div class="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center">
          <p class="text-sm font-medium text-white/90">对准资产二维码</p>
          <p class="mt-1 text-xs text-white/50">自动识别固定资产编码</p>
          <button type="button" class="wms-app-cta wms-app-btn mt-5 max-w-[200px]" data-wms-app-scan-demo>模拟扫码</button>
        </div>
      </div>
      <div id="wms-app-scan-result" class="hidden wms-app-card p-4 ring-1 ring-zinc-200">
        <p class="text-xs font-semibold text-zinc-700"><i class="fa-solid fa-circle-check mr-1 text-zinc-600"></i>识别成功</p>
        <p class="mt-2 text-base font-semibold text-zinc-900">笔记本</p>
        <p class="font-mono text-[11px] text-zinc-500">ZC202606001 · A-01-06</p>
        <p class="mt-1 text-xs text-zinc-500">账存：在库</p>
        <button type="button" class="wms-app-cta wms-app-btn mt-4">标记已盘</button>
      </div>
      <p class="text-center text-xs text-zinc-400 leading-relaxed">固定资产优先扫码盘点<br/>类资产请前往执行页录入数量</p>
    </div>`,
  });
}

function appCountProfilePage() {
  const PROFILE_IMG = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&h=128&q=80';
  return appPageShell({
    title: '个人中心',
    largeTitle: true,
    subtitle: '仓库管理员 · 主仓库 A 区',
    activeTab: 'profile',
    backHref: '',
    body: `<div class="wms-app-pad wms-app-pad--top">
      <div class="wms-app-stack">
        <div class="wms-app-profile-card">
          <img src="${PROFILE_IMG}" alt="用户头像" class="wms-app-profile-avatar" />
          <div class="min-w-0">
            <p class="text-base font-semibold text-zinc-900">张明</p>
            <p class="mt-0.5 text-xs text-zinc-500">仓库管理员 · 盘点执行人</p>
            <p class="mt-1 text-xs text-zinc-400">工号 WH-1024 · 主仓库 A 区</p>
          </div>
        </div>
        <dl class="wms-app-profile-stats">
          <div class="wms-app-profile-stat"><dt>本月盘点</dt><dd>6</dd></div>
          <div class="wms-app-profile-stat"><dt>已完成</dt><dd>4</dd></div>
          <div class="wms-app-profile-stat"><dt>待处理差异</dt><dd>1</dd></div>
        </dl>
        <nav class="wms-app-menu">
          <a href="app_count_task_list.html" class="wms-app-menu-item wms-app-btn"><i class="fa-solid fa-list-check"></i><span>我的盘点任务</span><i class="fa-solid fa-chevron-right"></i></a>
          <a href="app_count_offbook.html" class="wms-app-menu-item wms-app-btn"><i class="fa-solid fa-circle-plus"></i><span>账外资产登记</span><i class="fa-solid fa-chevron-right"></i></a>
          <a href="../count_diff_list.html" class="wms-app-menu-item wms-app-btn"><i class="fa-solid fa-triangle-exclamation"></i><span>差异处理记录</span><i class="fa-solid fa-chevron-right"></i></a>
          <a href="../count_plan_list.html" class="wms-app-menu-item wms-app-btn"><i class="fa-solid fa-desktop"></i><span>PC 端管理</span><i class="fa-solid fa-chevron-right"></i></a>
        </nav>
        <nav class="wms-app-menu">
          <a href="#" class="wms-app-menu-item wms-app-btn"><i class="fa-solid fa-bell"></i><span>消息通知</span><i class="fa-solid fa-chevron-right"></i></a>
          <a href="#" class="wms-app-menu-item wms-app-btn"><i class="fa-solid fa-gear"></i><span>设置</span><i class="fa-solid fa-chevron-right"></i></a>
          <a href="../../index.html" class="wms-app-menu-item wms-app-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i><span>退出到原型入口</span><i class="fa-solid fa-chevron-right"></i></a>
        </nav>
      </div>
    </div>`,
  });
}

function appCountOffbookPage() {
  return appPageShell({
    title: '账外资产',
    showTab: false,
    backHref: 'app_count_home.html',
    body: `<div class="wms-app-pad wms-app-pad--top">
      <div class="wms-app-stack">
      <div class="wms-app-card p-3 text-xs leading-relaxed text-zinc-700" style="background:rgba(255,251,235,0.65);border-color:#fde68a">
        <i class="fa-solid fa-circle-info mr-1 text-zinc-500"></i>
        现场发现账外资产时登记，提交后生成资产确认单（待审核），审核通过后写入台账。
      </div>
      <div class="wms-app-card p-4 space-y-4">
        <div class="wms-app-field"><label>资产名称 <span class="text-red-500">*</span></label><input type="text" placeholder="请输入资产名称" /></div>
        <div class="wms-app-field"><label>物资大类 <span class="text-red-500">*</span></label><select><option>资产-固定资产</option><option>资产-类资产</option></select></div>
        <div class="wms-app-field"><label>使用地点 <span class="text-red-500">*</span></label><input type="text" placeholder="如：武穴大桥施工点" /></div>
        <div class="wms-app-field"><label>数量</label><input type="number" value="1" /></div>
        <div class="wms-app-field"><label>备注</label><textarea rows="2" placeholder="盘盈说明、现场情况…"></textarea></div>
      </div>
      <button type="button" class="wms-app-cta wms-app-btn">提交确认单</button>
      </div>
    </div>`,
  });
}

const appPages = {
  app_count_home: appCountHomePage(),
  app_count_task_list: appCountTaskListPage(),
  app_count_execute: appCountExecutePage(),
  app_count_scan: appCountScanPage(),
  app_count_offbook: appCountOffbookPage(),
  app_count_profile: appCountProfilePage(),
};

const pages = {
  ledger_material: page('ledger_material', '物资台账', '物资台账 / 库存总览', ledgerMaterialListPage()),

  ledger_warehouse: page('ledger_warehouse', '仓库台账', '物资台账 / 仓库台账', ledgerWarehousePage()),

  ledger_transaction: page('ledger_transaction', '出入库记录', '物资台账 / 出入库记录', ledgerTransactionPage()),

  mine_pending_pickup: page('mine_pending_pickup', '领取记录', '我的物资 / 领取记录', listPage({
    desc: '领用申请审核通过后的物资领取明细',
    tabs: ['全部', '待领取', '已领取'],
    searchPlaceholder: '领用申请单号、物资编码、物资名称、出库单号',
    columns: ['序号', '领用申请单号', '物资编码', '物资名称', '规格型号', '计量单位', '物资大类', '物资子类', '申请数量', '出库单号', '出库数量', '出库日期'],
    rows: [
      pendingPickupRow(['1', 'LY202510001', 'GD001001-001', '抓斗', '455', '个', '资产-固定资产', '设备-配件', '5', LIST_EMPTY, LIST_EMPTY, LIST_EMPTY], '待领取', 'LY202510001'),
      pendingPickupRow(['2', 'LY202510001', 'GD001001-002', '料斗', '455', '个', '资产-固定资产', '设备-配件', '10', LIST_EMPTY, LIST_EMPTY, LIST_EMPTY], '待领取', 'LY202510001'),
      pendingPickupRow(['3', 'LY202510002', 'GD001001-003', '螺丝刀', '455', '个', '资产-固定资产', '设备-配件', '10', 'LY202510002-CK001', '10', '2025-09-03'], '已领取', 'LY202510002'),
      pendingPickupRow(['4', 'LY202510003', 'GD001001-004', '扳手', '455', '个', '资产-固定资产', '设备-配件', '5', 'LY202510003-CK001', '5', '2025-09-03'], '已领取', 'LY202510003'),
      pendingPickupRow(['5', 'LY202510004', 'GD001001-005', '钢丝绳', '455', 'm', '资产-固定资产', '设备-配件', '100', 'LY202510004-CK001', '100', '2025-09-03'], '已领取', 'LY202510004'),
    ],
  })),

  mine_pending_return: page('mine_pending_return', '借还记录', '我的物资 / 借还记录', listPage({
    desc: '需归还且尚未完成归还的物资；仓管入库后进入「待确认」，借用人确认后变为已归还',
    tabs: ['全部', '待归还', '已延期', '待确认', '已归还'],
    tabColumn: 9,
    tabMap: { '部分归还': '待归还' },
    searchPlaceholder: '领用单号、资产编码、物资名称、出库单号',
    columns: ['序号', '领用单号', '资产编码', '物资名称', '规格型号', '计量单位', '物资大类', '借用人', '状态', '出库单号', '出库日期', '出库数量', '应还日期', '待还数量'],
    rows: [
      pendingReturnRow(['1', 'LY202606010003', 'ZC202605012', '工程测量仪', '全站仪 TS06', '台', '资产-固定资产', '张三', returnStatusBadge('待归还'), 'CK202606010003', '2026-06-01', '1', '2026-06-15', '1'], '待归还', 'LY202606010003-ZC202605012', '待归还'),
      pendingReturnRow(['2', 'LY202605200008', 'LA-00331', '铝合金梯', '3m', '架', '资产-类资产', '王工', returnStatusBadge('已延期'), 'LY202605200008-CK001', '2026-05-20', '1', '2026-06-20', '1'], '已延期', 'LY202605200008-LA-00331', '已延期'),
      pendingReturnRow(['3', 'LY202606070003', '—', '电钻', '650W', '台', '资产-类资产', '李工', returnStatusBadge('待归还'), '—', '—', '3', '2026-07-09', '3'], '待归还', 'LY202606070003-L1', '待归还'),
      pendingReturnRow(['4', 'LY202606070005', '—', '钢丝绳', 'Φ18×100m', 'm', '资产-类资产', '赵六', returnStatusBadge('部分归还'), 'LY202606070005-CK001', '2026-06-08', '60', '2026-08-08', '20'], '待归还', 'LY202606070005-L1', '部分归还'),
      pendingReturnRow(['5', 'LY20260608001', 'LA-00501', '手持对讲机', 'UHF 400-470MHz', '台', '资产-类资产', '张三', returnStatusBadge('待确认'), 'CK20260608001', '2026-06-05', '2', '2026-06-20', '0'], '待确认', 'LY20260608001-LA-002', '待确认'),
      pendingReturnRow(['6', 'LY202510006', 'GD001001-007', '螺丝刀', '455', '个', '资产-类资产', '王五', returnStatusBadge('已归还'), 'LY202510006-CK001', '2025-07-15', '8', '2025-08-05', '0'], '已归还', 'LY202510006-GD007', '已归还'),
    ],
  })),

  mine_return_confirm: page('mine_pending_return', '确认归还', '我的物资 / 确认归还', returnConfirmPage('mine_pending_return.html')),

  mine_requisition_record: page('mine_pending_return', '领用记录', '我的物资 / 领用记录', requisitionRecordModal('mine_pending_return.html', REQUISITION_RECORD_SAMPLES.LY202510001)),

  apply_plan_list: page('apply_plan_list', '物资计划', '物资申请 / 物资计划', listPage({
    desc: '编制物资需求计划，支持一般计划与急件计划',
    addBtn: true, addHref: 'apply_plan_form.html',
    tabs: ['全部', '草稿', '审核中', '已通过'],
    tabColumn: 4,
    tabMap: { '审核通过': '已通过' },
    searchPlaceholder: '计划单号、计划名称',
    filters: [{ label: '计划类型', key: 'planType', column: 2, options: ['全部', '一般计划', '急件计划'] }],
    columns: ['计划单号', '计划名称', '计划类型', '最早需求日', '审批状态', '创建时间'],
    rows: [
      ['JH202606090001', '六月办公物资计划', badge('一般计划','info'), '2026-06-20', badge('审核通过','success'), '2026-06-05'],
      ['JH202606080003', '应急防汛物资', badge('急件计划','danger'), '2026-06-10', badge('审核中','warning'), '2026-06-08'],
    ],
    actions: '<a href="apply_plan_form.html" class="mr-3 hover:underline">查看</a><a href="#" class="text-slate-400">审核</a>',
  })),

  apply_requisition_list: page('apply_requisition_list', '领用申请', '物资申请 / 领用申请', listPage({
    desc: '发起物资领用，审核通过后生成出库待办',
    addBtn: true, addHref: 'apply_requisition_form.html',
    tabs: ['全部', '草稿', '审核中', '已通过'],
    tabColumn: 4,
    tabMap: { '审核通过': '已通过' },
    searchPlaceholder: '领用单号、计划单号、申请事由',
    columns: ['领用单号', '计划单号', '申请事由', '申请时间', '审批状态'],
    rows: [
      ['LY202606090005', 'JH202606090001', '项目部日常办公', '2026-06-09', badge('审核中','warning')],
      ['LY202606070002', '—', '施工现场临时用具', '2026-06-07', badge('审核通过','success')],
    ],
    actions: '<a href="apply_requisition_form.html" class="mr-3 hover:underline">查看</a><a href="#" class="hover:underline">审核</a>',
  })),

  purchase_message: page('purchase_message', '消息中心', '采购管理 / 消息中心', `
    <div class="space-y-3">
      ${[
        ['待审批', '采购申请 CG202606090002 待您审批', '10 分钟前', 'fa-file-circle-check'],
        ['待入库', '验收单 YS202606080015 已通过，请安排入库', '1 小时前', 'fa-arrow-down-to-bracket'],
        ['超期提醒', '资产 LA-00331 归还已超期 4 天', '今天 08:00', 'fa-triangle-exclamation'],
      ].map(([tag, msg, time, icon]) => `
        <div class="card flex cursor-pointer items-start gap-4 rounded-2xl bg-white p-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><i class="fa-solid ${icon}"></i></div>
          <div class="flex-1"><div class="mb-1 flex items-center gap-2"><span class="text-xs font-medium text-slate-900">${tag}</span><span class="text-xs text-slate-400">${time}</span></div><p class="text-sm text-slate-600">${msg}</p></div>
          <i class="fa-solid fa-chevron-right text-slate-300 text-xs mt-2"></i>
        </div>`).join('')}
    </div>`),

  purchase_pending_list: page('purchase_pending_list', '待采物资', '采购管理 / 待采物资', purchasePendingListPage()),

  purchase_request_list: page('purchase_request_list', '采购申请', '采购管理 / 采购申请', listPage({
    desc: '急件计划驱动的采购申请；审核通过后按供应商/物资拆分供货单',
    addBtn: true, addHref: 'purchase_request_form.html',
    tabs: ['全部', '待提交', '审核中', '已通过'],
    tabColumn: 7,
    tabMap: { '审核通过': '已通过', '待提交': '待提交', '审核中': '审核中' },
    searchPlaceholder: '申请单号、来源计划、提交人',
    filters: [{ label: '采购类型', key: 'purchaseType', column: 2, options: ['全部', '急件采购'] }],
    columns: ['序号', '申请单号', '采购类型', '来源计划单号', '来源待采', '采购总额（元）', '申请日期', '业务状态', '提交人', '提交部门'],
    rows: [
      { cells: ['1', 'JJSQ202606090002', badge('急件采购', 'warning'), 'JJJH202606080001', 'XF-00102 防汛沙袋', '28,600.00', '2026-06-09', badge('审核中', 'warning'), '李四', '采购部'], actions: '<a href="purchase_request_form.html?mode=view&amp;requestNo=JJSQ202606090002" class="hover:underline">查看</a>' },
      { cells: ['2', 'JJSQ202606050001', badge('急件采购', 'warning'), 'JJJH202606050001', 'XF-00105 抽水泵', '156,000.00', '2026-06-05', badge('审核通过', 'success'), '张三', '采购部'], actions: '<a href="purchase_request_form.html?mode=view&amp;requestNo=JJSQ202606050001&amp;showSupply=1" class="mr-2 hover:underline">查看</a><a href="purchase_supply_list.html" class="hover:underline">供货单</a>' },
      { cells: ['3', 'JJSQ202606030003', badge('急件采购', 'warning'), 'JJJH202510001', 'GD001001-001 抓斗', '2,000.00', '2026-06-03', badge('待提交', 'info'), '李四', '采购部'], actions: '<a href="purchase_request_form.html?mode=view&amp;requestNo=JJSQ202606030003" class="mr-2 hover:underline">查看</a><a href="purchase_request_form.html?mode=edit&amp;requestNo=JJSQ202606030003" class="mr-2 hover:underline">编辑</a><button type="button" class="hover:underline" data-wms-purchase-submit-audit>提交</button>' },
    ],
  })),

  purchase_plan_apply: page('purchase_plan_apply', '计划采购申请', '采购管理 / 计划采购申请', listPage({
    desc: '计划性采购申请，含计划申请与急件申请',
    addBtn: true, addHref: 'purchase_plan_form.html',
    tabs: ['全部', '计划申请', '急件申请'],
    searchPlaceholder: '申请单号、采购方式',
    filters: [{ label: '审批状态', key: 'status', column: 4, options: ['全部', '草稿', '审核中', '审核通过'] }],
    columns: ['申请单号', '采购方式', '参考总额', '申请日期', '审批状态'],
    rows: [
      { cells: ['PC202606070001', '招标', '¥ 890,000.00', '2026-06-07', badge('审核通过','success')], tab: '计划申请' },
      { cells: ['PC202606090003', '询价', '¥ 45,200.00', '2026-06-09', badge('草稿','info')], tab: '急件申请' },
    ],
  })),

  purchase_execute_list: page('purchase_execute_list', '物资采购', '采购管理 / 物资采购', listPage({
    desc: '根据采购申请单自动生成采购记录，按审核通过时间降序',
    tabs: ['全部', '待采购', '已采购'],
    tabColumn: 8,
    tabMap: { '待询价': '待采购', '已询价': '已采购' },
    searchPlaceholder: '申请单号、采购单号',
    filters: [{ label: '采购方式', key: 'method', column: 3, options: ['全部', '招标', '询价', '直采'] }],
    columns: ['序号', '申请单号', '参考总额（元）', '采购方式', '采购单号', '发起日期', '截止日期', '采购总价（元）', '状态', '审批状态', '审批人', '审批节点', '审核时间'],
    rows: [
      {
        cells: ['1', 'JHSQ202510001', '100.00', '直采', 'JHSQ202510001', '2025-10-20', '2025-10-20', '<span class="text-slate-400">—</span>', badge('待询价','warning'), badge('待提交','info'), '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>'],
        actions: purchaseExecuteRowActions('直采', 'pending'),
      },
      {
        cells: ['2', 'JHSQ202510002', '28,600.00', '询价', 'JHSQ202510002', '2025-10-21', '2025-10-28', '<span class="text-slate-400">—</span>', badge('待询价','warning'), badge('待提交','info'), '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>'],
        actions: purchaseExecuteRowActions('询价', 'pending'),
      },
      {
        cells: ['3', 'JHSQ202510003', '890,000.00', '招标', 'JHSQ202510003', '2025-10-22', '2025-11-05', '<span class="text-slate-400">—</span>', badge('待询价','warning'), badge('待提交','info'), '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>'],
        actions: purchaseExecuteRowActions('招标', 'pending'),
      },
      {
        cells: ['4', 'JHSQ202510004', '100.00', '直采', 'JHSQ202510004', '2025-10-20', '2025-10-20', '2,000.00', badge('待询价','warning'), badge('审核中','warning'), '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>'],
        actions: purchaseExecuteRowActions('直采', 'auditing'),
      },
      {
        cells: ['5', 'JHSQ202510005', '45,200.00', '询价', 'JHSQ202510005', '2025-10-18', '2025-10-25', '42,800.00', badge('已询价','success'), badge('已审核','success'), '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>'],
        actions: purchaseExecuteRowActions('询价', 'done'),
      },
      {
        cells: ['6', 'JHSQ202510006', '156,000.00', '招标', 'JHSQ202510006', '2025-10-15', '2025-10-30', '152,000.00', badge('已询价','success'), badge('已审核','success'), '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>', '<span class="text-slate-400">—</span>'],
        actions: purchaseExecuteRowActions('招标', 'done'),
      },
    ],
  })),

  purchase_supply_list: page('purchase_supply_list', '供应商供货单', '采购管理 / 供应商供货单', listPage({
    desc: '采购申请审核通过后按供应商/物资自动拆分；完成供货后进入物资验收',
    tabs: ['全部', '待供货', '供货中', '已供货'],
    tabColumn: 6,
    searchPlaceholder: '供货单号、供应商名称、物资名称、采购申请单号',
    columns: ['供货单号', '采购申请单号', '供应商', '物资名称', '需求/已供', '约定交期', '状态'],
    rows: [
      supplyRow(['GH2025001', 'JJSQ202606050001', '科尼', '抓斗', '10 / 10 个', '2026-06-15', supplyStatusBadge('已供货')], '已供货', 'GH2025001'),
      supplyRow(['GH2025002', 'JJSQ202606050001', '上海佩纳', '料斗', '10 / 10 个', '2026-06-15', supplyStatusBadge('已供货')], '已供货', 'GH2025002'),
      supplyRow(['GH2025003', 'JJSQ202606050001', '河南蒲瑞', '钢丝绳', '100 / 50 m', '2026-06-20', supplyStatusBadge('供货中')], '供货中', 'GH2025003'),
      supplyRow(['GH2025004', 'JJSQ202606090002', '江苏华能电子有限公司', '螺丝刀', '20 / 10 个', '2026-06-18', supplyStatusBadge('供货中')], '供货中', 'GH2025004'),
      supplyRow(['GH2025005', 'JJSQ202606090002', '宁波北仑君威有限公司', '扳手', `20 / 0 个${supplyOverdueBadge('2026-06-05')}`, '2026-06-05', supplyStatusBadge('待供货')], '待供货', 'GH2025005'),
    ],
  })),

  warehouse_pending_check: page('warehouse_pending_check', '待验物资', '物资管理 / 待验物资', listPage({
    desc: '<span class="inline-flex items-center gap-1.5"><i class="fa-solid fa-circle-info text-sky-500"></i>与<a href="warehouse_acceptance_list.html" class="font-medium text-slate-900 hover:underline">物资验收</a>列表中「待验收 + 验收中」数据<strong>完全同源</strong>，本页为验收人员快捷入口</span>',
    searchPlaceholder: '物资供货单号、供应商名称、物资名称',
    filters: [{ label: '验收状态', key: 'status', column: 14, options: ['全部', '待验收', '验收中'] }],
    columns: ['序号', '物资供货单号', '供应商名称', '物资编码', '物资名称', '规格型号', '物资大类', '物资子类', '计量单位', '需求数量', '已验收数量', '合格数量', '不合格数量', '验收进度', '验收状态'],
    rows: [
      acceptanceRow(acceptanceListCells('1', 'GH2025005', '宁波北仑君威有限公司', 'GD001001-005', '扳手', '455', '资产-固定资产', '设备-配件', '个', '20', '0', '0', '0', '待验收'), '待验收', 'GH2025005'),
      acceptanceRow(acceptanceListCells('2', 'GH2025003', '河南蒲瑞', 'GD001001-003', '钢丝绳', '455', '资产-固定资产', '设备-配件', 'm', '100', '50', '50', '0', '验收中'), '验收中', 'GH2025003'),
      acceptanceRow(acceptanceListCells('3', 'GH2025004', '江苏华能电子有限公司', 'GD001001-004', '螺丝刀', '455', '资产-固定资产', '设备-配件', '个', '20', '10', '9', '1', '验收中'), '验收中', 'GH2025004'),
    ],
  })),

  warehouse_acceptance_list: page('warehouse_acceptance_list', '物资验收', '物资管理 / 物资验收', listPage({
    desc: '分批次验收，1 个供货单可对应多个验收记录；验收记录通过后生成入库待办',
    tabs: ['全部', '待验收', '验收中', '已验收'],
    tabColumn: 14,
    searchPlaceholder: '物资供货单号、供应商名称、物资编码、物资名称',
    columns: ['序号', '物资供货单号', '供应商名称', '物资编码', '物资名称', '规格型号', '物资大类', '物资子类', '计量单位', '需求数量', '已验收数量', '合格数量', '不合格数量', '验收进度', '验收状态'],
    rows: [
      acceptanceRow(acceptanceListCells('1', 'GH2025001', '科尼', 'GD001001-001', '抓斗', '455', '资产-固定资产', '设备-配件', '个', '10', '10', '10', '0', '已验收'), '已验收', 'GH2025001'),
      acceptanceRow(acceptanceListCells('2', 'GH2025002', '上海佩纳', 'GD001001-002', '料斗', '455', '资产-固定资产', '设备-配件', '个', '10', '10', '10', '0', '已验收'), '已验收', 'GH2025002'),
      acceptanceRow(acceptanceListCells('3', 'GH2025003', '河南蒲瑞', 'GD001001-003', '钢丝绳', '455', '资产-固定资产', '设备-配件', 'm', '100', '50', '50', '0', '验收中'), '验收中', 'GH2025003'),
      acceptanceRow(acceptanceListCells('4', 'GH2025004', '江苏华能电子有限公司', 'GD001001-004', '螺丝刀', '455', '资产-固定资产', '设备-配件', '个', '20', '10', '9', '1', '验收中'), '验收中', 'GH2025004'),
      acceptanceRow(acceptanceListCells('5', 'GH2025005', '宁波北仑君威有限公司', 'GD001001-005', '扳手', '455', '资产-固定资产', '设备-配件', '个', '20', '0', '0', '0', '待验收'), '待验收', 'GH2025005'),
    ],
  })),

  warehouse_inbound_list: page('warehouse_inbound_list', '物资入库', '物资管理 / 物资入库', warehouseInboundListPage()),

  warehouse_outbound_list: page('warehouse_outbound_list', '物资出库', '物资管理 / 物资出库', warehouseOutboundListPage()),

  warehouse_return_list: page('warehouse_return_list', '物资归还', '物资管理 / 物资归还', warehouseReturnListPage()),

  warehouse_refund_list: page('warehouse_refund_list', '物资退货', '物资管理 / 物资退货', warehouseRefundListPage()),

  warehouse_scrap_list: page('warehouse_scrap_list', '物资作废', '物资管理 / 物资作废', warehouseScrapListPage()),

  warehouse_scrap_pending_pool: page('warehouse_scrap_list', '待报废池', '物资管理 / 待报废池', warehouseScrapPendingPoolPage()),

  count_plan_list: page('count_plan_list', '盘点计划', '库场盘点 / 盘点计划', countPlanListPage()),

  count_plan_detail: page('count_plan_list', '盘点计划详情', '库场盘点 / 计划详情', countPlanDetailPage()),

  count_task_list: page('count_task_list', '盘点任务', '库场盘点 / 盘点任务', countTaskListPage()),

  count_diff_list: page('count_diff_list', '差异处理', '库场盘点 / 差异处理', countDiffListPage()),

  count_adjust_list: page('count_adjust_list', '库存调整', '库场盘点 / 库存调整', countAdjustListPage()),

  supplier_list: page('supplier_list', '供应商列表', '供应商管理 / 供应商列表', listPage({
    desc: '供应商档案与供货状态；审批通过的评价结果自动回写最新等级与评分',
    addBtn: true, addHref: 'supplier_form.html',
    searchPlaceholder: '供应商编码、名称、联系人',
    filters: [{ label: '供货状态', key: 'status', column: 4, options: ['全部', '正常', '暂停', '黑名单'] }],
    columns: ['供应商编码', '供应商名称', '联系人', '联系电话', '供货状态', '最新等级', '最近评价', '添加时间'],
    rows: Object.values(SUPPLIER_SAMPLES).map(s => ({
      cells: [
        s.code, s.name, s.contact, s.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        supplierStatusBadge(s.status), evalGradeBadge(s.latestGrade), s.latestEvalDate, s.createdAt,
      ],
      tab: '',
      actions: `<a href="supplier_detail.html?code=${s.code}" class="mr-3 hover:underline">查看</a><a href="supplier_form.html?code=${s.code}&mode=edit" class="hover:underline">编辑</a>`,
    })),
  })),

  supplier_eval_list: page('supplier_eval_list', '供应商评价', '供应商管理 / 供应商评价', listPage({
    desc: '供应商绩效评价批次记录，按创建时间降序；<a href="config_eval_weight.html" class="font-medium text-slate-800 hover:underline">评价设置</a>',
    addBtn: true, addHref: 'supplier_eval_form.html',
    secondary: ['<a href="config_eval_weight.html" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><i class="fa-solid fa-sliders text-xs text-slate-400"></i>评价设置</a>'],
    tabs: ['全部', '草稿', '审核中', '已通过', '已驳回'],
    tabColumn: 6,
    tabMap: { '审核通过': '已通过' },
    searchPlaceholder: '评价单号、评价名称',
    filters: [{ label: '评价日期', key: 'evalDate', column: 4, options: ['全部', '2025-12-30', '2025-12-28', '2024-01-10'] }],
    columns: ['评价单号', '评价名称', '评价人', '评价日期', '供应商数', '平均综合分', '审批状态', '审批人', '创建时间'],
    rows: [
      { cells: ['PJ2025001', '2025年度设备配件类供应商评价', '李四', '2025-12-30', '2', '8.35', badge('审核通过', 'success'), '王经理', '2025-12-30 09:15'], actions: '<a href="supplier_eval_form.html?evalKey=PJ2025001&mode=view" class="hover:underline">查看</a>' },
      { cells: ['PJ2025002', '2025年度维修工具类供应商评价', '李四', '2025-12-30', '1', '8.60', badge('审核中', 'warning'), '—', '2025-12-30 14:00'], actions: '<a href="supplier_eval_form.html?evalKey=PJ2025002&mode=view" class="hover:underline">查看</a>' },
      { cells: ['PJ2024001', '2024年度评价', '李四', '2025-12-28', '0', '—', badge('草稿', 'info'), '—', '2025-12-28 16:30'], actions: '<a href="supplier_eval_form.html?evalKey=PJ2024001" class="mr-3 hover:underline">编辑</a><a href="#" class="text-rose-600 hover:underline" data-eval-delete>删除</a>' },
      { cells: ['PJ2023001', '2023年度耗材类供应商评价', '张三', '2024-01-10', '3', '—', badge('已驳回', 'danger'), '王经理', '2024-01-08 10:00'], actions: '<a href="supplier_eval_form.html?evalKey=PJ2023001&mode=view" class="mr-3 hover:underline">查看</a><a href="supplier_eval_form.html?evalKey=PJ2023001" class="hover:underline">编辑</a>' },
    ],
  })),

  config_eval_weight: page('config_eval_weight', '权重设置', '基础配置 / 评价设置 / 权重设置', configEvalWeightPage()),

  config_eval_grade: page('config_eval_grade', '评价等级设置', '基础配置 / 评价设置 / 评价等级', configEvalGradePage()),

  config_warehouse: page('config_warehouse', '仓库配置', '基础配置 / 仓库配置', warehouseConfigPage()),

  config_category: page('config_category', '分类管理', '基础配置 / 分类管理', categoryConfigPage()),

  config_material_catalog: page('config_material_catalog', '物资清单', '基础配置 / 物资清单', materialCatalogPage()),

  planning_inside: page('planning_inside', '场内', '规划内容 / 场内', listPage({
    desc: '仓库内物资存放位置与数量',
    searchPlaceholder: '物资编码、物资名称、仓库',
    columns: ['物资编码', '物资名称', '仓库', '分区', '货架', '数量'],
    rows: [
      ['HC-00089', '打印纸 A4', '主仓库', 'A区', 'A-01', '186'],
      ['LA-00456', '电钻', '主仓库', 'B区', 'B-03', '8'],
    ],
  })),

  planning_outside: page('planning_outside', '场外', '规划内容 / 场外', listPage({
    desc: '仓库外资产使用地点与数量（不含耗材）',
    searchPlaceholder: '物资编码、物资名称、使用地点',
    columns: ['物资编码', '物资名称', '使用地点', '数量', '责任人'],
    rows: [
      ['ZC202605012', '工程测量仪', '武穴大桥施工点', '1', '王工'],
      ['LA-00331', '铝合金梯', '城东项目部', '2', '李工'],
    ],
  })),

  config_unit_list: page('config_unit_list', '计量单位', '基础配置 / 计量单位', listPage({
    desc: '物资计量单位主数据',
    addBtn: true, addHref: 'config_unit_form.html',
    searchPlaceholder: '单位编码、单位名称',
    filters: [{ label: '状态', key: 'status', column: 4, options: ['全部', '启用', '停用'] }],
    columns: ['单位编码', '单位名称', '单位符号', '适用类型', '状态'],
    rows: [
      ['DW202606001', '桶', '桶', '耗材', badge('启用', 'success')],
      ['DW202606002', '台', '台', '资产', badge('启用', 'success')],
      ['DW202606003', '米', 'm', '通用', badge('启用', 'success')],
    ],
  })),

  config_location_list: page('config_location_list', '使用地点', '基础配置 / 使用地点', locationListPage()),

  config_acceptance_standard: page('config_acceptance_standard', '验收标准', '基础配置 / 验收标准', acceptanceStandardPage()),

  system_workflow: page('system_workflow', '流程配置', '系统 / 流程配置', listPage({
    desc: '配置各类单据审批流程模板',
    addBtn: true, addHref: 'system_workflow_form.html',
    searchPlaceholder: '流程编码、单据类型',
    filters: [{ label: '状态', key: 'status', column: 3, options: ['全部', '启用', '停用'] }],
    columns: ['流程编码', '单据类型', '审批节点', '状态', '更新时间'],
    rows: [
      ['WF-PLAN', '物资计划', '编制人 → 部门负责人 → 物资管理', badge('启用','success'), '2026-06-01'],
      ['WF-REQUISITION', '领用申请', '申请人 → 部门负责人 → 仓库管理员', badge('启用','success'), '2026-06-01'],
      ['WF-PURCHASE-URGENT', '急件采购申请', '采购员 → 采购负责人 → 分管领导', badge('启用','success'), '2026-06-01'],
      ['WF-SUPPLIER-EVAL', '供应商评价', '评价人 → 采购负责人', badge('启用','success'), '2026-06-09'],
      ['WF-SCRAP', '物资作废', '申请人 → 仓库管理员 → 物资管理部门', badge('启用','success'), '2026-06-09'],
      ['WF-COUNT-ADJUST', '盘点库存调整', '申请人 → 仓库管理员 → 物资管理部门', badge('启用','success'), '2026-06-09'],
    ],
    actions: '<a href="#" class="hover:underline">编辑</a>',
  })),
};

// Form pages
const forms = {
  apply_plan_form: page('apply_plan_list', '新增物资计划', '物资申请 / 新增计划', formBody('物资计划', [
    ['计划名称', 'text', '六月办公物资计划', true],
    ['计划单号', 'text', 'JH202606090001（系统自动）', false],
    ['计划类型', 'select', ['一般计划', '急件计划'], true],
    ['需求说明', 'textarea', '', false],
  ], 'apply_plan_list.html', {
    extraHtml: `<div class="md:col-span-2 rounded-xl bg-slate-50 p-4">
      <div class="mb-3 flex items-center justify-between"><span class="text-sm font-medium text-slate-900">计划明细</span>
        <a href="apply_plan_select_material.html" class="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-plus"></i> 选择物资清单</a></div>
      <table class="min-w-full text-sm"><thead><tr class="text-left text-xs text-slate-500"><th class="pb-2">物资编码</th><th class="pb-2">名称</th><th class="pb-2">数量</th><th class="pb-2">需求日期</th></tr></thead>
      <tbody><tr><td class="pt-2">HC-00089</td><td>打印纸 A4</td><td>200</td><td>2026-06-20</td></tr></tbody></table></div>`,
  })),

  apply_requisition_form: page('apply_requisition_list', '领用申请', '物资申请 / 领用申请', requisitionFormPage('apply_requisition_list.html')),

  warehouse_inbound_success: page('warehouse_inbound_list', '入库成功', '物资管理 / 入库成功', inboundSuccessPage()),

  warehouse_inbound_form: page('warehouse_inbound_list', '物资入库', '物资管理 / 执行入库', warehouseInboundFormPage('warehouse_inbound_list.html')),

  warehouse_inbound_fixed_form: page('warehouse_inbound_list', '固定资产入库', '物资管理 / 固定资产入库', warehouseInboundFormPage('warehouse_inbound_list.html', INBOUND_ACCEPT_SAMPLES['GH2025001-YS01'])),

  warehouse_inbound_like_form: page('warehouse_inbound_list', '类资产入库', '物资管理 / 类资产入库', warehouseInboundFormPage('warehouse_inbound_list.html', INBOUND_ACCEPT_SAMPLES['GH2025004-YS01'])),

  warehouse_inbound_consumable_form: page('warehouse_inbound_list', '耗材入库', '物资管理 / 耗材入库', warehouseInboundFormPage('warehouse_inbound_list.html', INBOUND_ACCEPT_SAMPLES['GH2025006-YS01'])),

  warehouse_outbound_success: page('warehouse_outbound_list', '出库成功', '物资管理 / 出库成功', outboundSuccessPage()),

  warehouse_outbound_fixed_form: page('warehouse_outbound_list', '固定资产出库', '物资管理 / 固定资产出库', warehouseOutboundFormPage('warehouse_outbound_list.html', OUTBOUND_REQUISITION_SAMPLES['LY202606070002-L1'])),

  warehouse_outbound_like_form: page('warehouse_outbound_list', '类资产出库', '物资管理 / 类资产出库', warehouseOutboundFormPage('warehouse_outbound_list.html', OUTBOUND_REQUISITION_SAMPLES['LY202606070003-L1'])),

  warehouse_outbound_consumable_form: page('warehouse_outbound_list', '耗材出库', '物资管理 / 耗材出库', warehouseOutboundFormPage('warehouse_outbound_list.html', OUTBOUND_REQUISITION_SAMPLES['LY202606070004-L1'])),

  warehouse_outbound_form: page('warehouse_outbound_list', '选择出库类型', '物资管理 / 执行出库', hubPage('warehouse_outbound_list', '选择出库类型', '物资管理 / 执行出库', 'warehouse_outbound_list.html', [
    ['warehouse_outbound_fixed_form.html', 'fa-computer', '固定资产出库', '必选资产编码，一码一物'],
    ['warehouse_outbound_like_form.html', 'fa-screwdriver-wrench', '类资产出库', '按数量从货位扣减'],
    ['warehouse_outbound_consumable_form.html', 'fa-boxes-stacked', '耗材出库', '按数量 FIFO 扣减'],
  ])),

  warehouse_return_success: page('warehouse_return_list', '归还成功', '物资管理 / 归还成功', returnSuccessPage()),

  warehouse_return_fixed_form: page('warehouse_return_list', '固定资产归还', '物资管理 / 固定资产归还', warehouseReturnFormPage('warehouse_return_list.html', RETURN_PENDING_SAMPLES['LY202606010003-ZC202605012'])),

  warehouse_return_like_form: page('warehouse_return_list', '类资产归还', '物资管理 / 类资产归还', warehouseReturnFormPage('warehouse_return_list.html', RETURN_PENDING_SAMPLES['LY202606070003-L1'])),

  warehouse_return_scrap_form: page('warehouse_return_list', '归还作废', '物资管理 / 归还作废', warehouseReturnScrapPage('warehouse_return_list.html')),

  warehouse_return_scrap: page('warehouse_return_list', '归还作废', '物资管理 / 归还作废', warehouseReturnScrapPage('warehouse_return_list.html')),

  warehouse_return_form: page('warehouse_return_list', '物资归还', '物资管理 / 执行归还', warehouseReturnFormPage('warehouse_return_list.html', RETURN_PENDING_SAMPLES['LY202606010003-ZC202605012'])),

  purchase_request_form: page('purchase_request_list', '采购申请', '采购管理 / 新建申请', purchaseRequestForm('purchase_request_list.html')),

  warehouse_acceptance_form: page('warehouse_acceptance_list', '物资验收', '物资管理 / 执行验收', acceptanceFormPage('warehouse_acceptance_list.html')),

  warehouse_acceptance_detail: page('warehouse_acceptance_list', '供货详情', '物资管理 / 查看供货', acceptanceDetailPage('warehouse_acceptance_list.html')),

  warehouse_acceptance_record: page('warehouse_acceptance_list', '验收记录', '物资管理 / 验收记录', acceptanceRecordPage('warehouse_acceptance_list.html')),

  warehouse_acceptance_record_detail: page('warehouse_acceptance_list', '验收记录详情', '物资管理 / 验收记录详情', acceptanceRecordDetailPage('warehouse_acceptance_record.html', 'GH2025004-YS02')),

  purchase_plan_form: page('purchase_plan_apply', '新建计划采购', '采购管理 / 新建计划采购', hubPage('purchase_plan_apply', '新建计划采购', '采购管理 / 计划采购申请', 'purchase_plan_apply.html', [
    ['purchase_plan_direct.html', 'fa-bolt', '直采', '指定供应商直接采购'],
    ['purchase_plan_inquiry_bid.html', 'fa-gavel', '询价/招标', '多供应商比价或招标'],
    ['purchase_plan_add_material.html', 'fa-list', '添加物资', '维护采购明细行'],
  ])),

  purchase_execute_form: page('purchase_execute_list', '选择采购方式', '采购管理 / 执行采购', hubPage('purchase_execute_list', '选择采购方式', '采购管理 / 物资采购', 'purchase_execute_list.html', [
    ['purchase_execute_direct.html', 'fa-bolt', '直采-采购', '指定供应商、单价与数量'],
    ['purchase_execute_inquiry.html', 'fa-scale-balanced', '询价-采购', '多家供应商询价对比'],
    ['purchase_execute_bid.html', 'fa-gavel', '招标-采购', '招标比价与定标'],
  ])),

  supplier_detail: page('supplier_list', '供应商详情', '供应商管理 / 供应商详情', supplierDetailPage()),

  supplier_form: page('supplier_list', '新增供应商', '供应商管理 / 新增供应商', formBody('供应商档案', [
    ['供应商名称', 'text', '', true],
    ['联系人', 'text', '', true],
    ['联系电话', 'text', '', true],
    ['供货状态', 'select', ['正常', '暂停', '黑名单'], true],
  ], 'supplier_list.html')),

  supplier_eval_form: page('supplier_eval_list', '新增评价', '供应商管理 / 新增评价', supplierEvalFormPage()),

  warehouse_refund_form: page('warehouse_refund_list', '新增退货', '物资管理 / 新增退货', hubPage('warehouse_refund_list', '新增退货', '物资管理 / 新增退货', 'warehouse_refund_list.html', [
    ['warehouse_refund_list.html', 'fa-list-check', '从待退货任务', '推荐：验收不合格审核通过后自动生成待退任务'],
    ['warehouse_refund_pre_form.html?refundKey=GH2025004-YS02-TH', 'fa-clipboard-check', '验收不合格退货', '示例：螺丝刀验收不合格退供应商'],
    ['warehouse_refund_consumable_form.html?refundKey=RK202509002-TH01', 'fa-boxes-stacked', '在库耗材退货', '示例：安全帽在库退供应商'],
  ])),

  warehouse_refund_pre_form: page('warehouse_refund_list', '验收不合格退货', '物资管理 / 验收不合格退货', warehouseRefundPreFormPage('warehouse_refund_list.html', REFUND_PENDING_SAMPLES['GH2025004-YS02-TH'])),

  warehouse_refund_fixed_form: page('warehouse_refund_list', '固定资产退货', '物资管理 / 固定资产退货', warehouseRefundPostFormPage('warehouse_refund_list.html', { ...REFUND_PENDING_SAMPLES['GH2025004-YS02-TH'], scene: 'post_inbound', inboundNo: 'RK202511220001', inboundQty: '9', pendingQty: '1', unqualifiedQty: '0' })),

  warehouse_refund_like_form: page('warehouse_refund_list', '类资产退货', '物资管理 / 类资产退货', warehouseRefundPostFormPage('warehouse_refund_list.html', REFUND_PENDING_SAMPLES['TH202606030001'])),

  warehouse_refund_consumable_form: page('warehouse_refund_list', '耗材退货', '物资管理 / 耗材退货', warehouseRefundPostFormPage('warehouse_refund_list.html', REFUND_PENDING_SAMPLES['RK202509002-TH01'])),

  warehouse_refund_success: page('warehouse_refund_list', '退货成功', '物资管理 / 退货成功', refundSuccessPage()),

  warehouse_scrap_form: page('warehouse_scrap_list', '新建作废单', '物资管理 / 新建作废单', warehouseScrapFormPage('warehouse_scrap_list.html')),

  warehouse_scrap_execute: page('warehouse_scrap_list', '执行作废', '物资管理 / 执行作废', warehouseScrapExecutePage('warehouse_scrap_list.html')),

  warehouse_scrap_success: page('warehouse_scrap_list', '作废成功', '物资管理 / 作废成功', scrapSuccessPage()),

  warehouse_scrap_add_material: selectPickerWithTree('warehouse_scrap_list', '添加作废物资', '物资管理 / 添加作废物资', 'warehouse_scrap_form.html', {
    heading: '选择在库物资（仅显示在库/待报废状态；固资按编码、类资产/耗材按数量）',
    columns: ['物资编码', '物资名称', '类型', '资产编码', '货位', '可用库存'],
    pickerRows: SCRAP_PICKER_ROWS,
    renderCells: (row) => [row.code, row.name, materialTypeBadge(row.type), row.assetCode, row.location, row.stock],
    checkedCount: 0,
    confirmLabel: '确认添加',
  }),

  config_warehouse_form: page('config_warehouse', '新增仓库', '基础配置 / 新增仓库', warehouseForm('config_warehouse.html')),

  config_material_form: page('config_material_catalog', '新增物资', '基础配置 / 新增物资', materialFormPage()),
  config_material_detail: page('config_material_catalog', '查看物资', '基础配置 / 查看物资', materialDetailPage()),

  // --- 物资申请：选择/添加明细 ---
  apply_plan_select_material: selectPicker('apply_plan_list', '选择物资清单', '物资申请 / 选择物资清单', 'apply_plan_form.html', {
    heading: '从物资清单选择计划明细（仅显示启用物资）',
    columns: ['物资编码', '物资名称', '类型', '所属分类', '计量单位', '参考单价'],
    rows: [
      ['HC-00089', '打印纸 A4', materialTypeBadge('consumable'), '<span class="text-xs font-mono text-slate-500">HC-BG-001002</span>', '箱', '¥ 120'],
      ['LA-00456', '电钻', materialTypeBadge('like'), '<span class="text-xs font-mono text-slate-500">LA-ZC-001001</span>', '台', '¥ 680'],
      ['GD001001-001', '抓斗', materialTypeBadge('fixed'), '<span class="text-xs font-mono text-slate-500">ZC-GD-002</span>', '个', '¥ 10,000'],
    ],
  }),

  apply_requisition_add_material: selectPickerWithTree('apply_requisition_list', '添加物资', '物资申请 / 添加领用物资', 'apply_requisition_form.html', {
    heading: '选择领用物资（仅启用物资，显示可用库存；类资产/耗材需填写领用数量）',
    columns: ['物资编码', '物资名称', '类型', '计量单位', '可用库存', '仓库'],
    pickerRows: REQUISITION_PICKER_ROWS,
    renderCells: (row) => [row.code, row.name, materialTypeBadge(row.type), row.unit, row.stock, row.warehouse],
    checkedCount: 0,
  }),

  // --- 采购：待采/执行/计划 ---
  purchase_pending_select: selectPicker('purchase_pending_list', '选择待采物资', '采购管理 / 选择', 'purchase_pending_list.html', {
    heading: '从待采清单勾选物资，确认后进入采购申请',
    modalSize: 'xl',
    searchPlaceholder: '计划单号、物资编码、名称…',
    confirmHref: 'purchase_pending_apply.html',
    confirmLabel: '确定',
    checkedCount: 2,
    columns: ['计划单号', '计划名称', '计划类型', '物资编码', '物资名称', '规格型号', '物资大类', '物资子类', '计量单位', '计划需求数量', '需求日期'],
    rows: [
      ['JH202606080003', '应急防汛物资', badge('急件计划','danger'), 'XF-00102', '防汛沙袋', '50×80cm', '耗材', '防汛物资', '条', '500', '2026-06-12'],
      ['JH202606080003', '应急防汛物资', badge('急件计划','danger'), 'XF-00105', '抽水泵', 'QZ10-15', '类资产', '防汛设备', '台', '5', '2026-06-12'],
      ['JH202606070001', '六月设备配件', badge('急件计划','danger'), 'GD001001-001', '抓斗', '455', '资产-固定资产', '设备-配件', '个', '10', '2026-06-15'],
    ],
  }),

  purchase_pending_apply: page('purchase_pending_list', '采购申请', '采购管理 / 待采申请', purchaseRequestForm('purchase_pending_list.html', { fromPending: true, total: '28600.00' })),

  purchase_pending_plan_detail: page('purchase_pending_list', '物资计划详情', '采购管理 / 物资计划详情', applyPlanDetailModal('purchase_pending_list.html', APPLY_PLAN_SAMPLES.JJJH202606080001)),

  purchase_execute_direct: page('purchase_execute_list', '直采-采购', '采购管理 / 直采-采购', purchaseExecuteFormPage({
    title: '直采采购', method: '直采', quoteSectionTitle: '直采信息', mode: 'direct',
  })),

  purchase_execute_inquiry: page('purchase_execute_list', '询价-采购', '采购管理 / 询价-采购', purchaseExecuteFormPage({
    title: '询价采购', method: '询价', quoteSectionTitle: '询价信息', mode: 'inquiry',
  })),

  purchase_execute_bid: page('purchase_execute_list', '招标-采购', '采购管理 / 招标-采购', purchaseExecuteFormPage({
    title: '招标采购', method: '招标比价', quoteSectionTitle: '招标比价信息', mode: 'bid', otherSectionTitle: '其他信息',
  })),

  purchase_plan_direct: page('purchase_plan_apply', '直采', '采购管理 / 计划直采', formBody('计划性直采申请', [
    ['申请单号', 'text', '系统自动生成', false],
    ['选定供应商', 'select', ['华建物资有限公司', '鄂东办公用品'], true],
    ['参考总额', 'text', '', true],
  ], 'purchase_plan_apply.html', { buttons: ['cancel', 'save', 'submit'] })),

  purchase_plan_add_material: selectPicker('purchase_plan_apply', '添加物资', '采购管理 / 添加采购明细', 'purchase_plan_form.html', {
    heading: '选择计划采购明细',
    columns: ['物资编码', '物资名称', '计划数量', '参考单价', '计量单位'],
    rows: [
      ['GC-10001', '螺纹钢 Φ12', '100', '¥ 3,800/吨', '吨'],
      ['HC-00089', '打印纸 A4', '200', '¥ 120', '箱'],
    ],
  }),

  purchase_plan_inquiry_bid: page('purchase_plan_apply', '询价/招标', '采购管理 / 计划询价招标', formBody('计划性询价/招标', [
    ['申请单号', 'text', '系统自动生成', false],
    ['采购方式', 'select', ['询价', '招标'], true],
    ['参考总额', 'text', '', false],
    ['截止日期', 'text', '', true],
  ], 'purchase_plan_apply.html', { buttons: ['cancel', 'save', 'submit'] })),

  purchase_supply_complete: page('purchase_supply_list', '完成供货', '采购管理 / 完成供货', purchaseSupplyCompletePage('purchase_supply_list.html')),

  // --- 出库/归还 ---
  warehouse_outbound_select_asset: selectPicker('warehouse_outbound_list', '选择资产', '物资管理 / 选择资产', 'warehouse_outbound_fixed_form.html', {
    heading: '选择可出库资产（在库状态）',
    columns: ['资产编码', '物资名称', '类型', '所在货位', '状态'],
    rows: [
      ['ZC202606001', '工程测量仪', badge('固定资产','info'), '主仓库/B区', badge('在库','success')],
      ['ZC202606002', '工程测量仪', badge('固定资产','info'), '主仓库/B区', badge('在库','success')],
      ['LA-00456', '电钻', badge('类资产','info'), '主仓库/B区/B-03', badge('在库','success')],
    ],
  }),

  ledger_material_detail: page('ledger_material', '物资库存详情', '物资台账 / 物资库存详情', ledgerMaterialDetailPage('ledger_material.html', MATERIAL_LEDGER_DETAIL_SAMPLES['LA-00456'])),

  ledger_asset_detail: page('ledger_warehouse', '资产详情', '物资台账 / 资产详情', assetDetailModal('ledger_warehouse.html', FIXED_ASSET_LEDGER_ROWS[0])),

  ledger_warehouse_detail: page('ledger_warehouse', '货位库存详情', '物资台账 / 货位库存详情', ledgerWarehouseDetailPage('ledger_warehouse.html', WAREHOUSE_LEDGER_DETAIL_SAMPLES['LA-00456@主仓库/A区/A-02'])),

  ledger_asset_qrcode: page('ledger_warehouse', '资产二维码', '物资台账 / 资产二维码', assetQrcodeModal('ledger_warehouse.html', FIXED_ASSET_LEDGER_ROWS[0])),

  ledger_transaction_detail: page('ledger_transaction', '流水详情', '物资台账 / 流水详情', transactionDetailModal('ledger_transaction.html', TRANSACTION_SAMPLES.RK202606090012)),

  warehouse_refund_select_asset: selectPicker('warehouse_refund_list', '选择退货资产', '物资管理 / 选择退货资产', 'warehouse_refund_fixed_form.html', {
    heading: '选择在库资产编码（退货至供应商）',
    columns: ['资产编码', '物资名称', '所在货位', '状态'],
    rows: [
      ['GD001001-004-A', '螺丝刀', '主仓库/B区', badge('在库', 'success')],
      ['GD001001-004-B', '螺丝刀', '主仓库/B区', badge('在库', 'success')],
    ],
  }),

  // --- 基础配置 ---
  config_unit_form: page('config_unit_list', '添加计量单位', '基础配置 / 添加计量单位', formBody('计量单位', [
    ['单位编码', 'text', '系统自动生成', false],
    ['单位名称', 'text', '', true],
    ['单位符号', 'text', '', true],
    ['适用类型', 'select', ['通用', '资产', '耗材'], true],
  ], 'config_unit_list.html', { buttons: ['cancel', 'save'] })),

  config_zone_form: page('config_warehouse', '新增分区', '基础配置 / 新增分区', zoneForm('config_warehouse.html')),

  config_shelf_form: page('config_warehouse', '新增货架', '基础配置 / 新增货架', shelfForm('config_warehouse.html')),

  config_shelf_qrcode: page('config_warehouse', '货位二维码', '基础配置 / 货位二维码', shelfQrcodeModal('config_warehouse.html', SHELF_SAMPLES['CK001001-HJ001'])),

  config_location_form: page('config_location_list', '新增使用地点', '基础配置 / 新增地点', locationFormPage()),

  supplier_eval_select_supplier: page('supplier_eval_list', '选择供应商', '供应商管理 / 选择供应商', supplierEvalSelectSupplierPage()),

  config_category_major_fixed: page('config_category', '固定资产', '基础配置 / 查看大类', categoryViewMajorModal('固定资产', 'config_category.html', [
    ['分类编码', 'ZC-GD'], ['分类名称', '固定资产'], ['归还', '需要'], ['是否需要盘点', '是'], ['是否需要使用年限', '是'],
  ])),

  config_category_major_like: page('config_category', '类资产', '基础配置 / 查看大类', categoryViewMajorModal('类资产', 'config_category.html', [
    ['分类编码', 'LA-ZC'], ['分类名称', '类资产'], ['归还', '需要'], ['是否需要盘点', '是'], ['是否需要使用年限', '是'], ['库存下限', '需要'], ['库存上限', '需要'],
  ])),

  config_category_major_consumable_form: page('config_category', '大类', '基础配置 / 新增耗材大类', categoryMajorConsumableForm('config_category.html')),

  config_category_sub_fixed: page('config_category', '固定资产 · 新增子类', '基础配置 / 新增子类', categorySubForm('config_category.html', { title: '固定资产 · 新增子类', level: 1, type: 'fixed' })),

  config_category_sub_fixed_view: page('config_category', '查看子类', '基础配置 / 查看子类', categoryViewMajorModal('办公电脑', 'config_category.html', [
    ['分类编码', 'ZC-GD-001'], ['分类名称', '办公电脑'], ['计量单位', '—'], ['归还', '需要'], ['是否需要盘点', '是'], ['是否需要使用年限', '是'],
  ])),

  config_category_sub_like: page('config_category', '类资产 · 新增子类', '基础配置 / 新增子类', categorySubForm('config_category.html', { title: '类资产 · 新增子类', level: 1, type: 'like' })),

  config_category_sub_like_view: page('config_category', '查看子类', '基础配置 / 查看子类', categoryViewMajorModal('电动工具', 'config_category.html', [
    ['分类编码', 'LA-ZC-001'], ['分类名称', '电动工具'], ['计量单位', '—'], ['归还', '需要'], ['是否需要盘点', '是'], ['是否需要使用年限', '是'],
  ])),

  config_category_sub_consumable: page('config_category', '耗材 · 新增子类', '基础配置 / 新增子类', categorySubForm('config_category.html', { title: '办公耗材 · 新增子类', level: 1, type: 'consumable' })),

  config_category_sub_consumable_view: page('config_category', '查看子类', '基础配置 / 查看子类', categoryViewMajorModal('办公电脑', 'config_category.html', [
    ['分类编码', 'HC-BG-001'], ['分类名称', '办公电脑'], ['计量单位', '—'], ['库存下限', '需要'], ['库存上限', '需要'],
  ])),

  config_category_sub_child_form: page('config_category', '添加子类', '基础配置 / 添加二级子类', categorySubForm('config_category.html', { title: '添加二级子类', level: 2, type: 'fixed' })),

  system_workflow_form: page('system_workflow', '新增流程', '系统 / 新增流程', formBody('审批流程模板', [
    ['流程编码', 'text', '', true],
    ['单据类型', 'select', ['物资计划', '领用申请', '采购申请'], true],
    ['审批节点', 'textarea', '节点1 → 节点2 → 节点3', true],
  ], 'system_workflow.html', { buttons: ['cancel', 'save'] })),

  config_category_detail: page('config_category', '查看子类', '基础配置 / 查看子类', categoryViewMajorModal('一体机', 'config_category.html', [
    ['分类编码', 'ZC-GD-001001'], ['分类名称', '一体机'], ['计量单位', '台'], ['归还', '需要'], ['是否需要盘点', '是'], ['是否需要使用年限', '是'],
  ])),

  count_plan_form: page('count_plan_list', '新增盘点计划', '库场盘点 / 新增计划', countPlanFormPage('count_plan_list.html')),

  count_task_detail: page('count_task_list', '查看盘点任务', '库场盘点 / 任务详情', countTaskDetailPage()),

  count_execute_form: page('count_task_list', '盘点执行', '库场盘点 / 盘点执行', countExecuteFormPage('count_task_list.html')),

  count_relocate_form: page('count_diff_list', '调货位', '库场盘点 / 调货位', countRelocateFormPage('count_diff_list.html')),

  count_adjust_form: page('count_diff_list', '调整库存', '库场盘点 / 调整库存', countAdjustFormPage('count_diff_list.html')),

  count_adjust_detail: page('count_adjust_list', '调整单详情', '库场盘点 / 调整详情', countAdjustDetailPage()),
};

function formBody(title, fields, backHref, options = {}) {
  const { extraHtml = '', buttons = ['cancel', 'save', 'submit'], modalSize = 'md' } = options;
  const btnMap = {
    cancel: `<a href="${backHref}" class="wms-btn wms-btn-secondary">取消</a>`,
    save: `<button type="button" class="wms-btn wms-btn-primary">保存</button>`,
    submit: `<button type="button" class="wms-btn wms-btn-primary">确定</button>`,
  };
  const fieldsHtml = fields.map(([label, type, val, req]) => {
    if (type === 'select') {
      const opts = (Array.isArray(val) ? val : []).map(o => `<option>${o}</option>`).join('');
      return `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">${req ? '<span class="text-rose-500">*</span> ' : ''}${label}</label><select class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200">${opts}</select></div>`;
    }
    if (type === 'textarea') {
      return `<div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">${req ? '<span class="text-rose-500">*</span> ' : ''}${label}</label><textarea rows="3" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200">${typeof val === 'string' ? val : ''}</textarea></div>`;
    }
    const readonly = !req && typeof val === 'string' && val.includes('系统');
    return `<div><label class="mb-1.5 block text-sm font-medium text-slate-700">${req ? '<span class="text-rose-500">*</span> ' : ''}${label}</label><input type="${type}" value="${typeof val === 'string' ? val : ''}" ${readonly ? 'readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"' : 'class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"'} /></div>`;
  }).join('');
  return `
    <div data-wms-modal data-modal-back="${backHref}" data-modal-size="${modalSize}">
      <div class="wms-modal-form">${fieldsHtml}${extraHtml}</div>
      <div class="wms-modal-footer">
        ${buttons.map(b => btnMap[b] || '').join('')}
      </div>
    </div>`;
}

if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

Object.entries({ ...pages, ...forms }).forEach(([name, html]) => {
  fs.writeFileSync(path.join(pagesDir, `${name}.html`), html, 'utf8');
  console.log('wrote', name);
});

if (!fs.existsSync(appPagesDir)) fs.mkdirSync(appPagesDir, { recursive: true });
Object.entries(appPages).forEach(([name, html]) => {
  fs.writeFileSync(path.join(appPagesDir, `${name}.html`), html, 'utf8');
  console.log('wrote app/', name);
});

console.log('Done:', Object.keys({ ...pages, ...forms }).length, 'PC pages,', Object.keys(appPages).length, 'APP pages');

const mapLabels = {
  '../index.html': ['原型入口', '首页'],
  pc_home: ['PC 工作台', '首页 · PC'],
  ledger_material: ['物资台账', '物资台账'],
  ledger_material_detail: ['物资库存详情', '物资台账 · 表单'],
  ledger_warehouse: ['仓库台账', '物资台账'],
  ledger_warehouse_detail: ['货位库存详情', '物资台账 · 表单'],
  ledger_asset_detail: ['资产详情', '物资台账 · 二维码'],
  ledger_asset_qrcode: ['资产二维码', '物资台账 · 二维码'],
  ledger_transaction: ['出入库记录', '物资台账'],
  ledger_transaction_detail: ['流水详情', '物资台账'],
  mine_pending_pickup: ['领取记录', '我的物资'],
  mine_pending_return: ['借还记录', '我的物资'],
  mine_return_confirm: ['确认归还', '我的物资 · 表单'],
  mine_requisition_record: ['领用记录', '我的物资 · 表单'],
  apply_plan_list: ['物资计划', '物资申请'],
  apply_plan_form: ['新增物资计划', '物资申请 · 表单'],
  apply_plan_select_material: ['选择物资清单', '物资申请 · 表单'],
  apply_requisition_list: ['领用申请', '物资申请'],
  apply_requisition_form: ['领用申请', '物资申请 · 表单'],
  apply_requisition_add_material: ['添加物资', '物资申请 · 表单'],
  purchase_pending_list: ['待采物资', '采购管理'],
  purchase_pending_select: ['选择待采物资', '采购管理 · 表单'],
  purchase_pending_apply: ['待采申请', '采购管理 · 表单'],
  purchase_pending_plan_detail: ['物资计划详情', '采购管理 · 表单'],
  purchase_request_list: ['采购申请', '采购管理'],
  purchase_request_form: ['新建采购申请', '采购管理 · 表单'],
  purchase_plan_apply: ['计划采购申请', '采购管理'],
  purchase_plan_form: ['新建计划采购', '采购管理 · 入口'],
  purchase_plan_direct: ['计划直采', '采购管理 · 表单'],
  purchase_plan_inquiry_bid: ['计划询价/招标', '采购管理 · 表单'],
  purchase_plan_add_material: ['添加采购明细', '采购管理 · 表单'],
  purchase_execute_list: ['物资采购', '采购管理'],
  purchase_execute_form: ['选择采购方式', '采购管理 · 入口'],
  purchase_execute_direct: ['直采-采购', '采购管理 · 表单'],
  purchase_execute_inquiry: ['询价-采购', '采购管理 · 表单'],
  purchase_execute_bid: ['招标-采购', '采购管理 · 表单'],
  purchase_supply_list: ['供应商供货单', '采购管理'],
  purchase_supply_complete: ['完成供货', '采购管理 · 表单 · 验收快捷入口共用'],
  warehouse_pending_check: ['待验物资', '物资管理'],
  warehouse_acceptance_list: ['物资验收', '物资管理'],
  warehouse_acceptance_form: ['执行验收', '物资管理 · 表单'],
  warehouse_acceptance_detail: ['供货详情', '物资管理 · 表单'],
  warehouse_acceptance_record: ['验收记录', '物资管理 · 表单'],
  warehouse_acceptance_record_detail: ['验收记录详情', '物资管理 · 表单'],
  warehouse_inbound_list: ['物资入库', '物资管理'],
  warehouse_inbound_form: ['执行入库', '物资管理 · 表单'],
  warehouse_inbound_fixed_form: ['固定资产入库', '物资管理 · 表单'],
  warehouse_inbound_like_form: ['类资产入库', '物资管理 · 表单'],
  warehouse_inbound_consumable_form: ['耗材入库', '物资管理 · 表单'],
  warehouse_inbound_success: ['入库成功 · 生码', '物资管理 · 二维码'],
  warehouse_outbound_list: ['物资出库', '物资管理'],
  warehouse_outbound_form: ['选择出库类型', '物资管理 · 入口'],
  warehouse_outbound_fixed_form: ['固定资产出库', '物资管理 · 表单'],
  warehouse_outbound_like_form: ['类资产出库', '物资管理 · 表单'],
  warehouse_outbound_consumable_form: ['耗材出库', '物资管理 · 表单'],
  warehouse_outbound_success: ['出库成功 · 交接', '物资管理 · 确认'],
  warehouse_outbound_select_asset: ['选择资产', '物资管理 · 表单'],
  warehouse_return_list: ['物资归还', '物资管理'],
  warehouse_return_fixed_form: ['固定资产归还', '物资管理 · 表单'],
  warehouse_return_like_form: ['类资产归还', '物资管理 · 表单'],
  warehouse_return_success: ['归还成功', '物资管理 · 确认'],
  warehouse_return_form: ['执行归还', '物资管理 · 表单'],
  warehouse_return_scrap_form: ['归还作废', '物资管理 · 表单'],
  warehouse_return_scrap: ['归还作废', '物资管理 · 表单'],
  warehouse_refund_list: ['物资退货', '物资管理'],
  warehouse_scrap_list: ['物资作废', '物资管理'],
  warehouse_scrap_pending_pool: ['待报废池', '物资管理'],
  warehouse_scrap_form: ['新建作废单', '物资管理 · 表单'],
  warehouse_scrap_execute: ['执行作废', '物资管理 · 表单'],
  warehouse_scrap_success: ['作废成功', '物资管理 · 确认'],
  warehouse_scrap_add_material: ['添加作废物资', '物资管理 · 表单'],
  count_plan_list: ['盘点计划', '库场盘点'],
  count_plan_form: ['新增盘点计划', '库场盘点 · 表单'],
  count_plan_detail: ['盘点计划详情', '库场盘点'],
  count_task_list: ['盘点任务', '库场盘点'],
  count_task_detail: ['盘点任务详情', '库场盘点 · 表单'],
  count_execute_form: ['盘点执行', '库场盘点 · 表单'],
  count_diff_list: ['差异处理', '库场盘点'],
  count_relocate_form: ['调货位', '库场盘点 · 表单'],
  count_adjust_list: ['库存调整', '库场盘点'],
  count_adjust_form: ['调整库存', '库场盘点 · 表单'],
  count_adjust_detail: ['调整单详情', '库场盘点 · 表单'],
  app_count_home: ['盘点首页', '移动端 · 库场盘点'],
  app_count_task_list: ['我的盘点任务', '移动端 · 库场盘点'],
  app_count_execute: ['移动盘点执行', '移动端 · 库场盘点'],
  app_count_scan: ['扫码盘点', '移动端 · 库场盘点'],
  app_count_offbook: ['账外资产确认', '移动端 · 库场盘点'],
  app_count_profile: ['个人中心', '移动端 · 库场盘点'],
  warehouse_refund_form: ['新增退货', '物资管理 · 入口'],
  warehouse_refund_pre_form: ['验收不合格退货', '物资管理 · 表单'],
  warehouse_refund_fixed_form: ['固定资产退货', '物资管理 · 表单'],
  warehouse_refund_like_form: ['类资产退货', '物资管理 · 表单'],
  warehouse_refund_consumable_form: ['耗材退货', '物资管理 · 表单'],
  warehouse_refund_success: ['退货成功', '物资管理 · 确认'],
  warehouse_refund_select_asset: ['选择退货资产', '物资管理 · 表单'],
  supplier_list: ['供应商列表', '供应商管理'],
  supplier_detail: ['供应商详情', '供应商管理'],
  supplier_form: ['新增供应商', '供应商管理 · 表单'],
  supplier_eval_list: ['供应商评价', '供应商管理'],
  supplier_eval_form: ['新增评价', '供应商管理 · 表单'],
  supplier_eval_select_supplier: ['选择供应商', '供应商管理 · 表单'],
  config_eval_weight: ['权重设置', '基础配置 · 评价设置'],
  config_eval_grade: ['评价等级设置', '基础配置 · 评价设置'],
  config_warehouse: ['仓库配置', '基础配置'],
  config_warehouse_form: ['新增仓库', '基础配置 · 表单'],
  config_zone_form: ['新增分区', '基础配置 · 表单'],
  config_shelf_form: ['新增货架', '基础配置 · 表单'],
  config_shelf_qrcode: ['货位二维码', '基础配置 · 二维码'],
  config_category: ['分类管理', '基础配置'],
  config_category_major_fixed: ['查看固定资产大类', '基础配置 · 表单'],
  config_category_major_like: ['查看类资产大类', '基础配置 · 表单'],
  config_category_major_consumable_form: ['新增耗材大类', '基础配置 · 表单'],
  config_category_sub_fixed: ['新增固定资产子类', '基础配置 · 表单'],
  config_category_sub_fixed_view: ['查看固定资产子类', '基础配置 · 表单'],
  config_category_sub_like: ['新增类资产子类', '基础配置 · 表单'],
  config_category_sub_like_view: ['查看类资产子类', '基础配置 · 表单'],
  config_category_sub_consumable: ['新增耗材子类', '基础配置 · 表单'],
  config_category_sub_consumable_view: ['查看耗材子类', '基础配置 · 表单'],
  config_category_sub_child_form: ['添加二级子类', '基础配置 · 表单'],
  config_category_detail: ['查看子类', '基础配置 · 表单'],
  config_unit_list: ['计量单位', '基础配置'],
  config_unit_form: ['添加计量单位', '基础配置 · 表单'],
  config_material_catalog: ['物资清单', '基础配置'],
  config_material_form: ['新增物资', '基础配置 · 表单'],
  config_material_detail: ['查看物资', '基础配置 · 表单'],
  config_acceptance_standard: ['验收标准', '基础配置'],
  config_location_list: ['使用地点', '基础配置'],
  config_location_form: ['新增使用地点', '基础配置 · 表单'],
  planning_inside: ['场内', '规划内容'],
  planning_outside: ['场外', '规划内容'],
  system_workflow: ['流程配置', '系统'],
  system_workflow_form: ['新增流程', '系统 · 表单'],
};

const mapEntries = [
  ['../index.html', ...mapLabels['../index.html']],
  ['pc_home.html', ...mapLabels.pc_home],
];
Object.keys({ ...pages, ...forms }).forEach(name => {
  const label = mapLabels[name] || [name, '页面'];
  mapEntries.push([`${name}.html`, ...label]);
});
Object.keys(appPages).forEach(name => {
  const label = mapLabels[name] || [name, '移动端'];
  mapEntries.push([`app/${name}.html`, ...label]);
});
const pcTotal = Object.keys({ ...pages, ...forms }).length;
const appTotal = Object.keys(appPages).length;
const total = mapEntries.length;
const mapHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>原型页面目录 · WMS</title>
  <link rel="stylesheet" href="../css/tailwind.css" />
  <link rel="stylesheet" href="../css/custom.css" />
  <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css" />
</head>
<body data-page="dashboard" data-title="原型目录" data-breadcrumb="系统 / 原型页面目录">
  <div id="main-content">
    <p class="mb-6 text-sm text-slate-500">共 ${pcTotal} 个 PC 端 + ${appTotal} 个 APP 端原型页面（合计 ${total}），点击可在新标签打开。移动端建议用浏览器开发者工具切换手机视口预览。PRD：<code class="rounded bg-slate-100 px-1.5 py-0.5 text-xs">docs/prd.md</code></p>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="page-grid"></div>
  </div>
  <script>
    const pages = ${JSON.stringify(mapEntries)};
    document.getElementById('page-grid').innerHTML = pages.map(([href, title, group]) => \`
      <a href="\${href}" target="_blank" class="card flex items-center gap-3 rounded-2xl bg-white p-4 hover:ring-1 hover:ring-slate-200">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><i class="fa-solid fa-file-lines"></i></div>
        <div class="min-w-0"><div class="truncate font-medium text-slate-900">\${title}</div><div class="truncate text-xs text-slate-500">\${group}</div></div>
        <i class="fa-solid fa-arrow-up-right-from-square ml-auto text-xs text-slate-300"></i>
      </a>\`).join('');
  </script>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body>
</html>`;
fs.writeFileSync(path.join(pagesDir, 'prototype_map.html'), mapHtml, 'utf8');
console.log('wrote prototype_map.html (' + total + ' entries)');
