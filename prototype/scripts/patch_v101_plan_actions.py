# -*- coding: utf-8 -*-
"""计划记录：按页签调整操作项 + 新增转让记录页（转出/转入，审核通过才写入）"""
from pathlib import Path
import re

PAGES = Path(__file__).resolve().parents[1] / "versions" / "v1.0.1" / "pages"
LAYOUT = Path(__file__).resolve().parents[1] / "versions" / "v1.0.1" / "js" / "layout.js"
MAP = PAGES / "prototype_map.html"

# —— patch list rows: data-plan-no + placeholder actions ——
list_path = PAGES / "mine_plan_material.html"
html = list_path.read_text(encoding="utf-8")

# Add data-plan-no from plan cell pattern on each row
def add_plan_no(m):
    block = m.group(0)
    if "data-plan-no=" in block:
        return block
    pm = re.search(r'data-approve-time="[^"]*"><td[^>]*>\d+</td><td[^>]*>(JJJH[^<]+)</td>', block)
    if not pm:
        return block
    plan_no = pm.group(1)
    block = block.replace(" data-approve-time=", f' data-plan-no="{plan_no}" data-approve-time=', 1)
    # replace actions cell content with placeholder
    block = re.sub(
        r'<td class="wms-col-actions[^"]*"[^>]*>.*?</td></tr>',
        '<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap" data-wms-plan-actions></td></tr>',
        block,
        count=1,
        flags=re.S,
    )
    return block

html = re.sub(r'<tr class="border-t[^"]*" data-wms-list-row[\s\S]*?</tr>', add_plan_no, html)
list_path.write_text(html, encoding="utf-8")
print("patched list actions placeholders")

# —— transfer record page ——
def badge(text, kind="slate"):
    colors = {
        "slate": "bg-slate-100 text-slate-700 ring-slate-600/10",
        "emerald": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        "sky": "bg-sky-50 text-sky-700 ring-sky-600/20",
    }
    cls = colors.get(kind, colors["slate"])
    return (
        f'<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium '
        f'ring-1 ring-inset {cls}">{text}</span>'
    )


def cell(h):
    return f'<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap">{h}</td>'


def th(label, right=False):
    align = "text-right" if right else "text-left"
    extra = "wms-col-actions " if right else ""
    return (
        f'<th class="{extra}px-3 py-3 {align} text-xs font-semibold uppercase tracking-wide '
        f'text-slate-500 whitespace-nowrap">{label}</th>'
    )


# 审核通过才写入：仅已通过记录
RECORDS = [
    {
        "no": "JHZR20260510001",
        "dir": "我转出",
        "plan_no": "JJJH202510002",
        "code": "GD001001-002",
        "name": "料斗",
        "qty": "5",
        "unit": "个",
        "counterparty": "王五 · 维保部",
        "audit_time": "2026-05-12 14:20",
        "reason": "本部门用量下调",
    },
    {
        "no": "JHZR20260508003",
        "dir": "我转入",
        "plan_no": "JJJH202510001",
        "code": "GD001001-001",
        "name": "抓斗",
        "qty": "6",
        "unit": "个",
        "counterparty": "王五 · 维保部",
        "audit_time": "2026-05-09 10:05",
        "reason": "支援设备部领用",
    },
    {
        "no": "JHZR20260601008",
        "dir": "我转出",
        "plan_no": "JJJH202606090001",
        "code": "HC-00089",
        "name": "打印纸 A4",
        "qty": "20",
        "unit": "盒",
        "counterparty": "张三 · 行政部",
        "audit_time": "2026-06-02 11:30",
        "reason": "超额申请，转让闲置额度",
    },
]

rows_html = []
for i, r in enumerate(RECORDS, 1):
    dir_badge = badge(r["dir"], "sky" if r["dir"] == "我转入" else "slate")
    search = " ".join([r["no"], r["plan_no"], r["code"], r["name"], r["dir"], r["counterparty"]]).lower()
    rows_html.append(
        f'<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row '
        f'data-list-tab="{r["dir"]}" data-list-search="{search}" data-plan-no="{r["plan_no"]}">'
        f'{cell(str(i))}'
        f'{cell(r["no"])}'
        f'{cell(dir_badge)}'
        f'{cell(r["plan_no"])}'
        f'{cell(r["code"])}'
        f'{cell(r["name"])}'
        f'{cell(r["qty"] + r["unit"])}'
        f'{cell(r["counterparty"])}'
        f'{cell(badge("审核通过", "emerald"))}'
        f'{cell(r["audit_time"])}'
        f'{cell(r["reason"])}'
        f'<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap">'
        f'<a href="mine_plan_material.html" class="hover:underline">返回计划记录</a></td>'
        f"</tr>"
    )

headers = [
    "序号",
    "转让单号",
    "方向",
    "计划单号",
    "物资编码",
    "物资名称",
    "转让数量",
    "对方",
    "状态",
    "审核通过时间",
    "原因说明",
]
thead = (
    '<thead class="bg-slate-50/80"><tr>'
    + "".join(th(h) for h in headers)
    + th("操作", right=True)
    + "</tr></thead>"
)

record_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>转让记录 · 物资管理系统</title>
  <link rel="stylesheet" href="../css/tailwind.css" />
  <link rel="stylesheet" href="../css/custom.css" />
  <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css" />
</head>
<body data-page="mine_plan_material" data-title="转让记录" data-breadcrumb="我的物资 / 计划记录 / 转让记录">
  <div id="main-content">
    <div data-wms-list-page data-wms-plan-transfer-record>
      <div class="mb-4 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
        转让记录包含<strong>我转出</strong>与<strong>我转入（接收转让）</strong>；仅<strong>审核通过</strong>后写入本列表。未通过/待接受不落库。
      </div>
      <div class="mb-4 flex flex-wrap gap-2" data-wms-list-tabs>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white" data-wms-list-tab="全部">全部</button>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="我转出">我转出</button>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="我转入">我转入</button>
      </div>
      <div class="mb-4 flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto" data-wms-list-toolbar>
        <div class="relative shrink-0 w-[300px]">
          <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
          <input type="search" data-wms-list-search placeholder="转让单号、计划单号、物资编码、物资名称" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
          <button type="button" data-wms-list-search-clear class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" title="清空"><i class="fa-solid fa-xmark text-xs"></i></button>
        </div>
        <button type="button" class="hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" data-wms-list-reset><i class="fa-solid fa-rotate-left text-xs"></i>重置</button>
        <a href="mine_plan_material.html" class="shrink-0 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">返回计划记录</a>
      </div>
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-list-card>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap>
          <table class="min-w-full text-sm wms-data-table">{thead}<tbody data-wms-list-tbody>{"".join(rows_html)}</tbody></table>
        </div>
        <div class="hidden py-16 text-center" data-wms-list-empty>
          <i class="fa-solid fa-inbox mb-3 text-3xl text-slate-300"></i>
          <p class="text-sm text-slate-500">暂无审核通过的转让记录</p>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span data-wms-list-count>共 {len(RECORDS)} 条</span>
          <span class="text-slate-400">10 条/页</span>
        </div>
      </div>
    </div>
  </div>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>
"""
(PAGES / "mine_plan_transfer_record.html").write_text(record_html, encoding="utf-8")
print("wrote transfer record page")

# —— layout: sync actions by tab ——
text = LAYOUT.read_text(encoding="utf-8")
start = text.find("function initPlanMaterialList(root) {")
end = text.find("function initPlanMaterialTransfer(root) {")
if start < 0 or end < 0:
    raise SystemExit("initPlanMaterialList not found")

new_fn = r'''function initPlanMaterialList(root) {
  if (root.dataset.page !== 'mine_plan_material') return;
  if (root.dataset.title !== '计划记录') return;
  const page = document.querySelector('[data-wms-plan-material-list]');
  if (!page || page.dataset.wmsPlanMaterialInit) return;
  page.dataset.wmsPlanMaterialInit = '1';

  const holdCard = page.querySelector('[data-wms-plan-hold-card]');
  const holdRows = () => [...page.querySelectorAll('[data-wms-plan-hold-tbody] [data-wms-list-row]')];
  const tabBtns = [...page.querySelectorAll('[data-wms-list-tab]')];
  const searchInput = page.querySelector('[data-wms-list-search]');
  const searchClear = page.querySelector('[data-wms-list-search-clear]');
  const resetBtn = page.querySelector('[data-wms-list-reset]');
  const countEl = page.querySelector('[data-wms-list-count]');
  const emptyEl = page.querySelector('[data-wms-list-empty]');
  let activeTab = tabBtns[0]?.getAttribute('data-wms-list-tab') || '未领用';

  const rowMatchTab = (row, tab) => {
    if (tab === '未领用') return Number(row.dataset.unused || 0) > 0;
    if (tab === '已领用') return Number(row.dataset.received || 0) > 0;
    if (tab === '可转让') return Number(row.dataset.transferable || 0) > 0;
    if (tab === '已转让') return Number(row.dataset.transferred || 0) > 0 || row.dataset.listTab === '已转让';
    if (tab === '待接受') return row.dataset.listTab === '待接受';
    if (tab === '已接受') return row.dataset.listTab === '已接受';
    return (row.dataset.listTab || '') === tab;
  };

  const syncRowActions = () => {
    const withPlan = ['未领用', '已领用', '可转让', '已转让'].includes(activeTab);
    holdRows().forEach(row => {
      const cell = row.querySelector('[data-wms-plan-actions]');
      if (!cell) return;
      const planNo = row.dataset.planNo || '';
      const recordHref = planNo
        ? `mine_plan_transfer_record.html?planNo=${encodeURIComponent(planNo)}`
        : 'mine_plan_transfer_record.html';
      const parts = [];
      if (withPlan && planNo) {
        parts.push(`<a href="apply_plan_form.html?mode=view&planNo=${encodeURIComponent(planNo)}" class="mr-2 hover:underline">查看计划</a>`);
      }
      parts.push(`<a href="${recordHref}" class="font-medium text-slate-900 hover:underline">转让记录</a>`);
      cell.innerHTML = parts.join('');
    });
  };

  const apply = () => {
    const q = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;
    holdRows().forEach(row => {
      let show = rowMatchTab(row, activeTab);
      if (q && !(row.dataset.listSearch || '').includes(q)) show = false;
      row.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });

    holdCard?.classList.toggle('hidden', visible === 0);
    syncRowActions();

    if (countEl) countEl.textContent = `共 ${visible} 条`;
    emptyEl?.classList.toggle('hidden', visible > 0);
    if (searchClear && searchInput) {
      const has = !!searchInput.value.trim();
      searchClear.classList.toggle('hidden', !has);
      searchClear.classList.toggle('inline-flex', has);
    }
    if (resetBtn) {
      const def = tabBtns[0]?.getAttribute('data-wms-list-tab') || '未领用';
      const showReset = !!(q || activeTab !== def);
      resetBtn.classList.toggle('hidden', !showReset);
      resetBtn.classList.toggle('inline-flex', showReset);
    }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-wms-list-tab') || '未领用';
      setListTabStyles(tabBtns, activeTab);
      apply();
    });
  });
  searchInput?.addEventListener('input', apply);
  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    apply();
  });
  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    activeTab = tabBtns[0]?.getAttribute('data-wms-list-tab') || '未领用';
    setListTabStyles(tabBtns, activeTab);
    apply();
  });

  const urlTab = new URLSearchParams(window.location.search).get('tab');
  if (urlTab && tabBtns.some(b => b.getAttribute('data-wms-list-tab') === urlTab)) {
    activeTab = urlTab;
    setListTabStyles(tabBtns, activeTab);
  } else {
    setListTabStyles(tabBtns, activeTab);
  }
  apply();
}

function initPlanTransferRecord(root) {
  if (root.dataset.title !== '转让记录') return;
  const page = document.querySelector('[data-wms-plan-transfer-record]');
  if (!page || page.dataset.wmsPlanTransferRecordInit) return;
  page.dataset.wmsPlanTransferRecordInit = '1';

  const planNo = new URLSearchParams(window.location.search).get('planNo');
  if (planNo) {
    const tip = document.createElement('p');
    tip.className = 'mb-3 text-sm text-slate-600';
    tip.innerHTML = `已按计划单号筛选：<span class="font-mono font-medium text-slate-900">${planNo}</span>`;
    page.querySelector('[data-wms-list-tabs]')?.before(tip);
  }

  // filter by planNo on top of list toolbar
  const tbody = page.querySelector('[data-wms-list-tbody]');
  if (planNo && tbody) {
    [...tbody.querySelectorAll('[data-wms-list-row]')].forEach(row => {
      if ((row.dataset.planNo || '') !== planNo) row.dataset.listSearch = (row.dataset.listSearch || '') + ' __hidden_by_plan__';
      else row.dataset.listPlanMatch = '1';
    });
    // mark non-matching hidden via custom attr used after list toolbar — handle here
    const applyPlan = () => {
      [...tbody.querySelectorAll('[data-wms-list-row]')].forEach(row => {
        if ((row.dataset.planNo || '') !== planNo) row.classList.add('hidden');
      });
    };
    setTimeout(applyPlan, 0);
    page.querySelectorAll('[data-wms-list-tab]').forEach(btn => {
      btn.addEventListener('click', () => setTimeout(applyPlan, 0));
    });
    page.querySelector('[data-wms-list-search]')?.addEventListener('input', () => setTimeout(applyPlan, 0));
    page.querySelector('[data-wms-list-reset]')?.addEventListener('click', () => setTimeout(applyPlan, 0));
  }
}

'''

text = text[:start] + new_fn + text[end:]
if "initPlanTransferRecord(root)" not in text:
    text = text.replace(
        "  initPlanMaterialList(root);",
        "  initPlanMaterialList(root);\n  initPlanTransferRecord(root);",
    )
LAYOUT.write_text(text, encoding="utf-8")
print("patched layout")

# map
map_text = MAP.read_text(encoding="utf-8")
if "mine_plan_transfer_record.html" not in map_text:
    map_text = map_text.replace(
        '["mine_plan_material_transfer.html","计划额度转让","我的物资 · 表单"]',
        '["mine_plan_transfer_record.html","转让记录","我的物资 · 表单"],["mine_plan_material_transfer.html","计划额度转让","我的物资 · 表单"]',
    )
    MAP.write_text(map_text, encoding="utf-8")
    print("patched map")
