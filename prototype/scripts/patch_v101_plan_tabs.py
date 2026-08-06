# -*- coding: utf-8 -*-
"""计划记录 Tab：未领用 / 已领用 / 可转让 / 已转让 / 待接受 / 已接受"""
from pathlib import Path

PAGES = Path(__file__).resolve().parents[1] / "versions" / "v1.0.1" / "pages"
LAYOUT = Path(__file__).resolve().parents[1] / "versions" / "v1.0.1" / "js" / "layout.js"


def badge(text, kind="slate"):
    colors = {
        "slate": "bg-slate-100 text-slate-700 ring-slate-600/10",
        "emerald": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        "amber": "bg-amber-50 text-amber-800 ring-amber-600/20",
        "sky": "bg-sky-50 text-sky-700 ring-sky-600/20",
        "violet": "bg-violet-50 text-violet-700 ring-violet-600/20",
    }
    cls = colors.get(kind, colors["slate"])
    return (
        f'<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium '
        f'ring-1 ring-inset {cls}">{text}</span>'
    )


def cell(html):
    return f'<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap">{html}</td>'


def th(label, right=False):
    align = "text-right" if right else "text-left"
    extra = "wms-col-actions " if right else ""
    return (
        f'<th class="{extra}px-3 py-3 {align} text-xs font-semibold uppercase tracking-wide '
        f'text-slate-500 whitespace-nowrap">{label}</th>'
    )


def unused_cell(n):
    if n > 0:
        return f'<span class="font-semibold text-amber-700" title="尚未领用，存在浪费风险">{n}</span>'
    return f'<span class="text-slate-500">{n}</span>'


# kind: hold | pending | accepted | transferred
ROWS = [
    {
        "kind": "hold",
        "status": "可转让",
        "status_kind": "emerald",
        "plan_no": "JJJH202606090001",
        "plan_name": "行政办公补库",
        "plan_type": "一般计划",
        "code": "HC-00089",
        "name": "打印纸 A4",
        "spec": "A4/80g/500张",
        "major": "耗材-办公耗材",
        "minor": "办公用纸",
        "unit": "盒",
        "plan_qty": 100,
        "received": 50,
        "locked": 0,
        "transferable": 50,
        "transferred": 0,
        "source": "原计划",
        "approve_time": "2026-06-09 09:10",
        "actions": "transfer",
    },
    {
        "kind": "hold",
        "status": "可转让",
        "status_kind": "emerald",
        "plan_no": "JJJH202606050001",
        "plan_name": "维保耗材采购",
        "plan_type": "一般计划",
        "code": "XF-00105",
        "name": "抽水泵",
        "spec": "QZ10-15",
        "major": "资产-类资产",
        "minor": "防汛设备",
        "unit": "台",
        "plan_qty": 5,
        "received": 1,
        "locked": 0,
        "transferable": 4,
        "transferred": 0,
        "source": "原计划",
        "approve_time": "2026-06-05 15:20",
        "actions": "transfer",
    },
    {
        "kind": "hold",
        "status": "已转让",
        "status_kind": "slate",
        "plan_no": "JJJH202510002",
        "plan_name": "设备配件补库",
        "plan_type": "一般计划",
        "code": "GD001001-002",
        "name": "料斗",
        "spec": "4m³",
        "major": "资产-固定资产",
        "minor": "设备-配件",
        "unit": "个",
        "plan_qty": 10,
        "received": 2,
        "locked": 0,
        "transferable": 0,
        "transferred": 5,
        "source": "原计划",
        "approve_time": "2026-05-10 11:05",
        "actions": "view",
        "transfer_no": "JHZR20260510001",
        "assignee": "王五",
    },
    {
        "kind": "hold",
        "status": "已接受",
        "status_kind": "sky",
        "plan_no": "JJJH202510001",
        "plan_name": "设备配件补库",
        "plan_type": "一般计划",
        "code": "GD001001-001",
        "name": "抓斗",
        "spec": "4m³-Q345B",
        "major": "资产-固定资产",
        "minor": "设备-配件",
        "unit": "个",
        "plan_qty": 10,
        "received": 0,
        "locked": 0,
        "transferable": 6,
        "transferred": 0,
        "source": "转入 · 王五（已接受）",
        "approve_time": "2026-05-08 09:30",
        "actions": "transfer",
    },
    {
        "kind": "hold",
        "status": "已领用",
        "status_kind": "slate",
        "plan_no": "JJJH202504010001",
        "plan_name": "办公耗材计划",
        "plan_type": "一般计划",
        "code": "HC-00128",
        "name": "安全帽",
        "spec": "标准型",
        "major": "耗材-劳保耗材",
        "minor": "安全防护",
        "unit": "顶",
        "plan_qty": 20,
        "received": 20,
        "locked": 0,
        "transferable": 0,
        "transferred": 0,
        "source": "原计划",
        "approve_time": "2026-04-01 10:00",
        "actions": "view",
    },
    {
        "kind": "pending",
        "status": "待接受",
        "status_kind": "amber",
        "plan_no": "JJJH202606080001",
        "plan_name": "防汛应急补库",
        "plan_type": "急件",
        "code": "XF-00102",
        "name": "防汛沙袋",
        "spec": "50×80cm",
        "major": "耗材-生产耗材",
        "minor": "防汛物资",
        "unit": "条",
        "plan_qty": 500,
        "received": 0,
        "locked": 200,
        "transferable": 0,
        "transferred": 0,
        "source": "待接受 · 赵六",
        "approve_time": "2026-06-08 16:40",
        "actions": "confirm",
        "transfer_no": "JHZR20260608002",
        "transfer_qty": 200,
    },
]


def hold_row(i, r):
    unused = r["plan_qty"] - r["received"]
    search = " ".join(
        map(
            str,
            [
                r["plan_no"],
                r["plan_name"],
                r["code"],
                r["name"],
                r["status"],
                r["minor"],
                r["source"],
                r.get("transfer_no", ""),
            ],
        )
    ).lower()
    q = (
        f"planNo={r['plan_no']}&code={r['code']}&name={r['name']}"
        f"&qty={r['transferable']}&unit={r['unit']}&spec={r['spec']}"
    )
    if r["actions"] == "transfer":
        ops = (
            f'<a href="apply_plan_form.html?mode=view&planNo={r["plan_no"]}" class="mr-2 hover:underline">查看计划</a>'
            f'<a href="mine_plan_material_transfer.html?{q}" class="font-medium text-slate-900 hover:underline">转让</a>'
        )
    elif r["actions"] == "confirm":
        ops = (
            f'<a href="apply_plan_form.html?mode=view&planNo={r["plan_no"]}" class="mr-2 hover:underline">查看计划</a>'
            f'<a href="mine_plan_material_confirm.html?transferNo={r["transfer_no"]}" class="font-medium text-slate-900 hover:underline">确认接受</a>'
        )
    else:
        ops = f'<a href="apply_plan_form.html?mode=view&planNo={r["plan_no"]}" class="hover:underline">查看计划</a>'
        if r.get("transfer_no") and r["status"] == "已转让":
            ops = (
                f'<a href="apply_plan_form.html?mode=view&planNo={r["plan_no"]}" class="mr-2 hover:underline">查看计划</a>'
                f'<span class="text-slate-500">已转让 {r["transferred"]}{r["unit"]} → {r.get("assignee", "")}</span>'
            )

    return (
        f'<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row '
        f'data-list-tab="{r["status"]}" data-list-search="{search}" '
        f'data-unused="{unused}" data-received="{r["received"]}" '
        f'data-transferable="{r["transferable"]}" data-transferred="{r["transferred"]}" '
        f'data-approve-time="{r["approve_time"]}">'
        f'{cell(str(i))}'
        f'{cell(r["plan_no"])}'
        f'{cell(r["plan_name"])}'
        f'{cell(badge(r["plan_type"]))}'
        f'{cell(r["approve_time"])}'
        f'{cell(r["code"])}'
        f'{cell(r["name"])}'
        f'{cell(r["spec"])}'
        f'{cell(r["major"])}'
        f'{cell(r["minor"])}'
        f'{cell(r["unit"])}'
        f'{cell(str(r["plan_qty"]))}'
        f'{cell(str(r["received"]))}'
        f'{cell(unused_cell(unused))}'
        f'{cell(str(r["locked"]))}'
        f'{cell("<strong>" + str(r["transferable"]) + "</strong>")}'
        f'{cell(str(r["transferred"]))}'
        f'{cell(badge(r["status"], r["status_kind"]))}'
        f'{cell(r["source"])}'
        f'<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap">{ops}</td>'
        f"</tr>"
    )


headers = [
    "序号",
    "计划单号",
    "计划名称",
    "计划类型",
    "计划审核通过时间",
    "物资编码",
    "物资名称",
    "规格型号",
    "物资大类",
    "物资子类",
    "计量单位",
    "计划申请数量",
    "已领用数量",
    "未领用数量",
    "锁定中",
    "可转让余量",
    "已转让数量",
    "行状态",
    "额度来源",
]

thead = (
    '<thead class="bg-slate-50/80"><tr>'
    + "".join(th(h) for h in headers)
    + th("操作", right=True)
    + "</tr></thead>"
)
tbody = "".join(hold_row(i + 1, r) for i, r in enumerate(ROWS))

tabs = ["未领用", "已领用", "可转让", "已转让", "待接受", "已接受"]
tab_btns = []
for i, t in enumerate(tabs):
    if i == 0:
        cls = "wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white"
    else:
        cls = "wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
    tab_btns.append(f'<button type="button" class="{cls}" data-wms-list-tab="{t}">{t}</button>')

html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>计划记录 · 物资管理系统</title>
  <link rel="stylesheet" href="../css/tailwind.css" />
  <link rel="stylesheet" href="../css/custom.css" />
  <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css" />
</head>
<body data-page="mine_plan_material" data-title="计划记录" data-breadcrumb="我的物资 / 计划记录">
  <div id="main-content">
    <div data-wms-list-page data-wms-plan-material-list>
      <div class="mb-4 space-y-2 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
        <p><strong>防浪费：</strong>对照<strong>计划申请数量</strong>与<strong>已领用数量</strong>；<strong>未领用数量</strong>越大，闲置浪费风险越高。可将未领用额度<strong>转让</strong>给他人。</p>
        <p class="text-slate-600">转让仅转移<strong>计划领用额度</strong>，不涉及实物调拨，也不变更待采/采购数量。提交后数量<strong>锁定</strong>，对方在「待接受」确认后划转。</p>
      </div>
      <div class="mb-4 flex flex-wrap gap-2" data-wms-list-tabs>
        {"".join(tab_btns)}
      </div>
      <div class="mb-4 flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto" data-wms-list-toolbar>
        <div class="relative shrink-0 w-[300px]">
          <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
          <input type="search" data-wms-list-search placeholder="计划单号、物资编码、物资名称、转让单号" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
          <button type="button" data-wms-list-search-clear class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" title="清空"><i class="fa-solid fa-xmark text-xs"></i></button>
        </div>
        <button type="button" class="hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" data-wms-list-reset><i class="fa-solid fa-rotate-left text-xs"></i>重置</button>
      </div>

      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-list-card data-wms-plan-hold-card>
        <div class="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">我的计划记录 · 申请与领用对照（按计划审核通过时间降序）</div>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap>
          <table class="min-w-full text-sm wms-data-table">{thead}<tbody data-wms-list-tbody data-wms-plan-hold-tbody>{tbody}</tbody></table>
        </div>
      </div>

      <div class="hidden py-16 text-center" data-wms-list-empty>
        <i class="fa-solid fa-inbox mb-3 text-3xl text-slate-300"></i>
        <p class="text-sm text-slate-500">无匹配数据，请调整筛选条件</p>
      </div>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm text-slate-500">
        <span data-wms-list-count>共 {len(ROWS)} 条</span>
        <span class="text-slate-400">10 条/页</span>
      </div>
    </div>
  </div>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>
"""

(PAGES / "mine_plan_material.html").write_text(html, encoding="utf-8")
print("wrote list")

# Replace initPlanMaterialList apply/filter section
old_fn_start = "function initPlanMaterialList(root) {"
# Find and replace the whole function until initPlanMaterialTransfer
text = LAYOUT.read_text(encoding="utf-8")
start = text.find("function initPlanMaterialList(root) {")
end = text.find("function initPlanMaterialTransfer(root) {")
if start < 0 or end < 0:
    raise SystemExit("cannot find initPlanMaterialList")

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

  page.querySelectorAll('[data-wms-plan-transfer-revoke]').forEach(btn => {
    btn.addEventListener('click', () => {
      showSupplyCompleteToast(`已撤销转让 ${btn.dataset.transferNo || ''}，锁定数量已释放`);
    });
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

'''

text = text[:start] + new_fn + text[end:]
# update redirects
text = text.replace(
    "mine_plan_material.html?tab=转让中",
    "mine_plan_material.html?tab=已转让",
)
text = text.replace(
    "mine_plan_material.html?tab=可转让",
    "mine_plan_material.html?tab=已接受",
)
LAYOUT.write_text(text, encoding="utf-8")
print("patched layout")
