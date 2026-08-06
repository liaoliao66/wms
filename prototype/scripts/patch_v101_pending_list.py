# -*- coding: utf-8 -*-
"""v1.0.1 待采物资列表：审核通过时间 + 默认降序 + 按子类分组开关"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "versions" / "v1.0.1" / "pages" / "purchase_pending_list.html"
LAYOUT = ROOT / "versions" / "v1.0.1" / "js" / "layout.js"

# 按审核通过时间降序；组内同序
ROWS = [
    {
        "key": "JJJH202606050001|XF-00105",
        "status": "已申请",
        "plan_no": "JJJH202606050001",
        "plan_name": "维保耗材采购",
        "plan_type": "一般计划",
        "approve_time": "2026-06-05 15:20",
        "code": "XF-00105",
        "name": "抽水泵",
        "spec": "QZ10-15",
        "major": "资产-类资产",
        "minor": "防汛设备",
        "reporter": "王五",
        "dept": "维保部",
        "apply_date": "2026-06-05",
        "unit": "台",
        "plan_qty": "5",
        "apply_qty": "5",
        "req_no": "JJSQ202606050001",
        "remark": "—",
        "actions": (
            '<a href="purchase_pending_plan_detail.html?planNo=JJJH202606050001&back=purchase_pending_list.html" class="mr-2 hover:underline">查看计划</a>'
            '<a href="purchase_request_form.html?mode=view&amp;requestNo=JJSQ202606050001" class="hover:underline">查看申请</a>'
        ),
    },
    {
        "key": "JJJH202510002|GD001001-002",
        "status": "待申请",
        "plan_no": "JJJH202510002",
        "plan_name": "设备配件补库",
        "plan_type": "一般计划",
        "approve_time": "2026-05-10 11:05",
        "code": "GD001001-002",
        "name": "料斗",
        "spec": "4m³",
        "major": "资产-固定资产",
        "minor": "设备-配件",
        "reporter": "李四",
        "dept": "设备部",
        "apply_date": "2026-05-04",
        "unit": "个",
        "plan_qty": "10",
        "apply_qty": "—",
        "req_no": "—",
        "remark": "—",
        "actions": (
            '<a href="purchase_pending_plan_detail.html?planNo=JJJH202510002&back=purchase_pending_list.html" class="mr-2 hover:underline">查看计划</a>'
            '<a href="purchase_pending_apply.html?planNo=JJJH202510002&code=GD001001-002&name=%E6%96%99%E6%96%97&qty=10" class="font-medium text-slate-900 hover:underline">申请</a>'
        ),
    },
    {
        "key": "JJJH202510001|GD001001-001",
        "status": "待申请",
        "plan_no": "JJJH202510001",
        "plan_name": "设备配件补库",
        "plan_type": "一般计划",
        "approve_time": "2026-05-08 09:30",
        "code": "GD001001-001",
        "name": "抓斗",
        "spec": "4m³-Q345B",
        "major": "资产-固定资产",
        "minor": "设备-配件",
        "reporter": "李四",
        "dept": "设备部",
        "apply_date": "2026-05-04",
        "unit": "个",
        "plan_qty": "10",
        "apply_qty": "—",
        "req_no": "—",
        "remark": "优先到货",
        "actions": (
            '<a href="purchase_pending_plan_detail.html?planNo=JJJH202510001&back=purchase_pending_list.html" class="mr-2 hover:underline">查看计划</a>'
            '<a href="purchase_pending_apply.html?planNo=JJJH202510001&code=GD001001-001&name=%E6%8A%93%E6%96%97&qty=10" class="font-medium text-slate-900 hover:underline">申请</a>'
        ),
    },
]

TH = (
    '<th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide '
    'text-slate-500 whitespace-nowrap">{label}</th>'
)


def badge(text, kind="slate"):
    if kind == "emerald":
        cls = "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
    else:
        cls = "bg-slate-100 text-slate-700 ring-slate-600/10"
    return (
        f'<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium '
        f'ring-1 ring-inset {cls}">{text}</span>'
    )


def cell(html):
    return f'<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap">{html}</td>'


def dash_or(v):
    if v == "—":
        return '<span class="text-slate-400">—</span>'
    return v


def build_row(i, r):
    status_badge = badge(r["status"], "emerald" if r["status"] == "已申请" else "slate")
    search = " ".join(
        [
            r["plan_no"],
            r["plan_name"],
            r["plan_type"],
            r["code"],
            r["name"],
            r["status"],
            r["spec"],
            r["major"],
            r["minor"],
            r["reporter"],
            r["dept"],
            r["approve_time"],
        ]
    ).lower()

    if r["status"] == "待申请":
        check = (
            f'<td class="px-3 py-3" data-pending-col-check>'
            f'<input type="checkbox" class="rounded border-slate-300 wms-pending-check" '
            f'data-pending-key="{r["key"]}" data-plan-no="{r["plan_no"]}" '
            f'data-code="{r["code"]}" data-name="{r["name"]}" data-qty="{r["plan_qty"]}" /></td>'
        )
        req_cell = cell(dash_or(r["req_no"]))
        apply_qty_cell = cell(dash_or(r["apply_qty"]))
    else:
        check = '<td class="px-3 py-3" data-pending-col-check></td>'
        req_cell = cell(
            f'<a href="purchase_request_list.html" class="font-mono text-xs hover:underline">{r["req_no"]}</a>'
        )
        apply_qty_cell = cell(r["apply_qty"])

    remark = r["remark"] if r["remark"] != "—" else '<span class="text-slate-400">—</span>'

    return (
        f'<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row '
        f'data-wms-pending-row data-pending-key="{r["key"]}" data-pending-status="{r["status"]}" '
        f'data-list-tab="{r["status"]}" data-list-search="{search}" '
        f'data-list-filter-planType="{r["plan_type"]}" '
        f'data-approve-time="{r["approve_time"]}" data-minor="{r["minor"]}" '
        f'data-plan-no="{r["plan_no"]}">'
        f"{check}"
        f'{cell(str(i))}'
        f'{cell(r["plan_no"])}'
        f'{cell(r["plan_name"])}'
        f'{cell(badge(r["plan_type"]))}'
        f'{cell(r["approve_time"])}'
        f'{cell(r["code"])}'
        f'{cell(r["name"])}'
        f"{cell(status_badge)}"
        f'{cell(r["spec"])}'
        f'{cell(r["major"])}'
        f'{cell(r["minor"])}'
        f'{cell(r["reporter"])}'
        f'{cell(r["dept"])}'
        f'{cell(r["apply_date"])}'
        f'{cell(r["unit"])}'
        f'{cell(r["plan_qty"])}'
        f"{apply_qty_cell}"
        f"{req_cell}"
        f'{cell(dash_or("—"))}'
        f'{cell(dash_or("—"))}'
        f'{cell(dash_or("—"))}'
        f"{cell(remark)}"
        f'<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap">{r["actions"]}</td>'
        f"</tr>"
    )


HEADERS = [
    "序号",
    "计划单号",
    "计划名称",
    "计划类型",
    "计划审核通过时间",
    "物资编码",
    "物资名称",
    "状态",
    "规格型号",
    "物资大类",
    "物资子类",
    "填报人",
    "填报部门",
    "申请日期",
    "计量单位",
    "计划需求数量",
    "申请数量",
    "采购申请单号",
    "采购数量",
    "采购方式",
    "采购日期",
    "计划备注",
]

thead = (
    '<thead class="bg-slate-50/80"><tr>'
    '<th class="w-10 px-3 py-3" data-pending-col-check>'
    '<input type="checkbox" class="rounded border-slate-300" title="全选待申请" data-wms-pending-check-all /></th>'
    + "".join(TH.format(label=h) for h in HEADERS)
    + '<th class="wms-col-actions px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>'
    + "</tr></thead>"
)

tbody_rows = "".join(build_row(i + 1, r) for i, r in enumerate(ROWS))

html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>待采物资 · 物资管理系统</title>
  <link rel="stylesheet" href="../css/tailwind.css" />
  <link rel="stylesheet" href="../css/custom.css" />
  <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css" />
</head>
<body data-page="purchase_pending_list" data-title="待采物资" data-breadcrumb="采购管理 / 待采物资">
  <div id="main-content">
    <div data-wms-list-page data-wms-pending-list>
      <p class="mb-4 text-sm text-slate-500">仅<strong>一般计划</strong>生成待采；申请生成 JJSQ，审核通过后进入<strong>物资采购</strong>；急件不进待采。待申请可单条/批量申请，已申请不可重复。列表默认按<strong>计划审核通过时间</strong>降序；可开启按物资子类分组。</p>
      <div class="mb-4 flex flex-wrap gap-2" data-wms-list-tabs><button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white" data-wms-list-tab="全部">全部</button><button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="待申请">待申请</button><button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="已申请">已申请</button></div>
      <div class="mb-4 flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto" data-wms-list-toolbar>
        <label class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200" title="开启后按物资子类分段展示">
          <span class="text-slate-500 shrink-0">按物资子类分组</span>
          <input type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-400" data-wms-pending-group-minor />
        </label>
        <label class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
          <span class="text-slate-500 shrink-0">计划类型</span>
          <select class="border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-slate-800 outline-none focus:ring-0" data-wms-list-filter="planType" data-wms-list-filter-default="全部">
            <option value="全部" selected>全部</option><option value="一般计划">一般计划</option>
          </select>
        </label>
        <div class="relative shrink-0 w-[280px]">
          <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
          <input type="search" data-wms-list-search placeholder="计划单号、物资编码、物资名称" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
          <button type="button" data-wms-list-search-clear class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" title="清空"><i class="fa-solid fa-xmark text-xs"></i></button>
        </div>
        <button type="button" class="hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" data-wms-list-reset><i class="fa-solid fa-rotate-left text-xs"></i>重置</button>
      </div>
      <div class="mb-3 flex flex-wrap items-center gap-2" data-wms-pending-batch-bar>
        <button type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40" data-wms-pending-batch-apply disabled><i class="fa-solid fa-file-circle-plus text-xs"></i>批量申请</button>
        <span class="text-xs text-slate-500" data-wms-pending-batch-hint>已选 0 条（仅待申请可勾选）</span>
      </div>
      <div class="card overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-list-card>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap><table class="min-w-full text-sm wms-data-table">{thead}<tbody data-wms-list-tbody>{tbody_rows}</tbody></table></div>
        <div class="hidden py-16 text-center" data-wms-list-empty>
    <i class="fa-solid fa-inbox mb-3 text-3xl text-slate-300"></i>
    <p class="text-sm text-slate-500">无匹配数据，请调整筛选条件</p>
  </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
    <span data-wms-list-count>共 3 条</span>
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex gap-1"><span class="rounded-lg bg-slate-900 px-3 py-1 text-white">1</span></div>
      <span class="text-slate-400">10 条/页</span>
    </div>
  </div>
      </div>
    </div></div>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>
"""

PAGE.write_text(html, encoding="utf-8")
print(f"wrote {PAGE}")

FN = r"""
function initPurchasePendingGroup(root) {
  if (root.dataset.page !== 'purchase_pending_list') return;
  if (root.dataset.title !== '待采物资') return;
  const list = document.querySelector('[data-wms-pending-list]');
  if (!list || list.dataset.wmsPendingGroupInit) return;
  list.dataset.wmsPendingGroupInit = '1';

  const tbody = list.querySelector('[data-wms-list-tbody]');
  const toggle = list.querySelector('[data-wms-pending-group-minor]');
  if (!tbody || !toggle) return;

  const clearGroupHeaders = () => {
    tbody.querySelectorAll('[data-wms-pending-group-header]').forEach(el => el.remove());
  };

  const sortRows = (rows, byGroup) => rows.slice().sort((a, b) => {
    if (byGroup) {
      const ma = a.dataset.minor || '';
      const mb = b.dataset.minor || '';
      if (ma !== mb) return ma.localeCompare(mb, 'zh');
    }
    const ta = a.dataset.approveTime || '';
    const tb = b.dataset.approveTime || '';
    if (ta !== tb) return tb.localeCompare(ta);
    const pa = a.dataset.planNo || '';
    const pb = b.dataset.planNo || '';
    return pa.localeCompare(pb);
  });

  const renumberVisible = () => {
    let n = 0;
    [...tbody.querySelectorAll('[data-wms-pending-row]')].forEach(row => {
      if (row.classList.contains('hidden')) return;
      n += 1;
      const seq = row.children[1];
      if (seq) seq.textContent = String(n);
    });
  };

  const applyGroup = () => {
    clearGroupHeaders();
    const dataRows = [...tbody.querySelectorAll('[data-wms-pending-row]')];
    const grouped = !!toggle.checked;
    const sorted = sortRows(dataRows, grouped);
    sorted.forEach(r => tbody.appendChild(r));

    if (grouped) {
      const colCount = list.querySelectorAll('thead th').length || 24;
      let lastMinor = null;
      sorted.forEach(row => {
        if (row.classList.contains('hidden')) return;
        const minor = row.dataset.minor || '未分类';
        if (minor === lastMinor) return;
        const count = sorted.filter(r => !r.classList.contains('hidden') && (r.dataset.minor || '未分类') === minor).length;
        const tr = document.createElement('tr');
        tr.setAttribute('data-wms-pending-group-header', '');
        tr.className = 'bg-slate-100/90 border-t border-slate-200';
        tr.innerHTML = `<td colspan="${colCount}" class="px-3 py-2.5 text-sm font-semibold text-slate-800"><i class="fa-solid fa-layer-group mr-1.5 text-slate-400"></i>${minor}<span class="ml-2 text-xs font-normal text-slate-500">${count} 条</span></td>`;
        tbody.insertBefore(tr, row);
        lastMinor = minor;
      });
    }
    renumberVisible();
  };

  const schedule = () => setTimeout(applyGroup, 0);
  toggle.addEventListener('change', applyGroup);
  list.querySelectorAll('[data-wms-list-tab]').forEach(btn => btn.addEventListener('click', schedule));
  list.querySelector('[data-wms-list-search]')?.addEventListener('input', schedule);
  list.querySelector('[data-wms-list-search-clear]')?.addEventListener('click', schedule);
  list.querySelectorAll('[data-wms-list-filter]').forEach(sel => sel.addEventListener('change', schedule));
  list.querySelector('[data-wms-list-reset]')?.addEventListener('click', schedule);

  applyGroup();
}
"""

text = LAYOUT.read_text(encoding="utf-8")
marker = "function initPurchasePendingBatch(root) {"
if "function initPurchasePendingGroup(root)" not in text:
    text = text.replace(marker, FN.strip() + "\n\n" + marker)
    text = text.replace(
        "  initPurchasePendingBatch(root);",
        "  initPurchasePendingGroup(root);\n  initPurchasePendingBatch(root);",
    )
    LAYOUT.write_text(text, encoding="utf-8")
    print(f"patched {LAYOUT}")
else:
    print("layout already has initPurchasePendingGroup")
