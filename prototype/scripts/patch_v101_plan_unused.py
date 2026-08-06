# -*- coding: utf-8 -*-
"""Update 计划物资 list: 计划申请 vs 已领用 vs 未领用（防浪费）— prototype only."""
from pathlib import Path

PAGES = Path(__file__).resolve().parents[1] / "versions" / "v1.0.1" / "pages"
LAYOUT = Path(__file__).resolve().parents[1] / "versions" / "v1.0.1" / "js" / "layout.js"

def badge(text, kind="slate"):
    colors = {
        "slate": "bg-slate-100 text-slate-700 ring-slate-600/10",
        "emerald": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        "amber": "bg-amber-50 text-amber-800 ring-amber-600/20",
        "rose": "bg-rose-50 text-rose-700 ring-rose-600/20",
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


# plan_qty=计划申请, received=已领用, unused=未领用=plan-received (waste)
# transferable still for transfer ops
ROWS = [
    {
        "tab": "可转让",
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
        "status": "可转让",
        "status_kind": "emerald",
        "source": "原计划",
        "approve_time": "2026-06-09 09:10",
        "actions": "transfer",
    },
    {
        "tab": "可转让",
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
        "status": "可转让",
        "status_kind": "emerald",
        "source": "原计划",
        "approve_time": "2026-06-05 15:20",
        "actions": "transfer",
    },
    {
        "tab": "转让中",
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
        "locked": 3,
        "transferable": 5,
        "status": "转让中",
        "status_kind": "amber",
        "source": "原计划",
        "approve_time": "2026-05-10 11:05",
        "actions": "view_lock",
        "transfer_no": "JHZR20260510001",
    },
    {
        "tab": "可转让",
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
        "status": "可转让",
        "status_kind": "emerald",
        "source": "转入 · 王五",
        "approve_time": "2026-05-08 09:30",
        "actions": "transfer",
        # note: transferable 6 may be after prior transfer out of 4 from original 10
    },
    {
        "tab": "已用尽",
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
        "status": "已用尽",
        "status_kind": "slate",
        "source": "原计划",
        "approve_time": "2026-04-01 10:00",
        "actions": "view",
    },
]

CONFIRM = {
    "transfer_no": "JHZR20260608002",
    "plan_no": "JJJH202606080001",
    "plan_type": "急件",
    "code": "XF-00102",
    "name": "防汛沙袋",
    "spec": "50×80cm",
    "unit": "条",
    "qty": 200,
    "from_user": "赵六 · 工程部",
    "reason": "本部门用量下调，额度转让",
    "submit_time": "2026-06-08 17:05",
}


def unused_cell(n):
    if n > 0:
        return (
            f'<span class="font-semibold text-amber-700" title="计划已申请但尚未领用，存在浪费风险">'
            f'{n}</span>'
        )
    return f'<span class="text-slate-500">{n}</span>'


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
                "未领用" if unused > 0 else "",
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
    elif r["actions"] == "view_lock":
        ops = (
            f'<a href="apply_plan_form.html?mode=view&planNo={r["plan_no"]}" class="mr-2 hover:underline">查看计划</a>'
            f'<a href="mine_plan_material_transfer.html?mode=view&transferNo={r["transfer_no"]}&{q}&locked={r["locked"]}" class="hover:underline">查看锁定</a>'
            f'<button type="button" class="ml-2 text-sm text-slate-600 hover:text-rose-600 hover:underline" data-wms-plan-transfer-revoke data-transfer-no="{r["transfer_no"]}">撤销</button>'
        )
    else:
        ops = f'<a href="apply_plan_form.html?mode=view&planNo={r["plan_no"]}" class="hover:underline">查看计划</a>'

    return (
        f'<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row '
        f'data-list-tab="{r["tab"]}" data-list-search="{search}" data-unused="{unused}" '
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
    "行状态",
    "额度来源",
]

hold_thead = (
    '<thead class="bg-slate-50/80"><tr>'
    + "".join(th(h) for h in headers)
    + th("操作", right=True)
    + "</tr></thead>"
)
hold_tbody = "".join(hold_row(i + 1, r) for i, r in enumerate(ROWS))

c = CONFIRM
confirm_row = (
    f'<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row '
    f'data-list-tab="待我确认" data-list-search="{c["transfer_no"]} {c["plan_no"]} {c["code"]} {c["name"]} 赵六 待我确认".lower()">'
    f'{cell("1")}'
    f'{cell(c["transfer_no"])}'
    f'{cell(c["plan_no"])}'
    f'{cell(badge(c["plan_type"]))}'
    f'{cell(c["code"])}'
    f'{cell(c["name"])}'
    f'{cell(c["spec"])}'
    f'{cell(c["unit"])}'
    f'{cell(str(c["qty"]))}'
    f'{cell(c["from_user"])}'
    f'{cell(c["reason"])}'
    f'{cell(c["submit_time"])}'
    f'{cell(badge("待确认", "amber"))}'
    f'<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap">'
    f'<a href="mine_plan_material_confirm.html?transferNo={c["transfer_no"]}" class="font-medium text-slate-900 hover:underline">确认</a></td>'
    f"</tr>"
)

# fix confirm search - I made a mistake with .lower() inside f-string incorrectly
search_c = f'{c["transfer_no"]} {c["plan_no"]} {c["code"]} {c["name"]} 赵六 待我确认'.lower()
confirm_row = (
    f'<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row '
    f'data-list-tab="待我确认" data-list-search="{search_c}">'
    f'{cell("1")}'
    f'{cell(c["transfer_no"])}'
    f'{cell(c["plan_no"])}'
    f'{cell(badge(c["plan_type"]))}'
    f'{cell(c["code"])}'
    f'{cell(c["name"])}'
    f'{cell(c["spec"])}'
    f'{cell(c["unit"])}'
    f'{cell(str(c["qty"]))}'
    f'{cell(c["from_user"])}'
    f'{cell(c["reason"])}'
    f'{cell(c["submit_time"])}'
    f'{cell(badge("待确认", "amber"))}'
    f'<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap">'
    f'<a href="mine_plan_material_confirm.html?transferNo={c["transfer_no"]}" class="font-medium text-slate-900 hover:underline">确认</a></td>'
    f"</tr>"
)

confirm_headers = [
    "序号",
    "转让单号",
    "计划单号",
    "计划类型",
    "物资编码",
    "物资名称",
    "规格型号",
    "计量单位",
    "转让数量",
    "转让人",
    "原因说明",
    "提交时间",
    "状态",
]
confirm_thead = (
    '<thead class="bg-slate-50/80"><tr>'
    + "".join(th(h) for h in confirm_headers)
    + th("操作", right=True)
    + "</tr></thead>"
)

html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>计划物资 · 物资管理系统</title>
  <link rel="stylesheet" href="../css/tailwind.css" />
  <link rel="stylesheet" href="../css/custom.css" />
  <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css" />
</head>
<body data-page="mine_plan_material" data-title="计划物资" data-breadcrumb="我的物资 / 计划物资">
  <div id="main-content">
    <div data-wms-list-page data-wms-plan-material-list>
      <div class="mb-4 space-y-2 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
        <p><strong>防浪费：</strong>对照<strong>计划申请数量</strong>与<strong>已领用数量</strong>；<strong>未领用数量</strong>越大，闲置浪费风险越高（例：计划 100 盒纸、只领 50 盒 → 未领用 50）。可将未领用额度<strong>转让</strong>给他人。</p>
        <p class="text-slate-600">转让仅转移<strong>计划领用额度</strong>，不涉及实物调拨，也不变更待采/采购数量。提交后数量<strong>锁定</strong>，受让人确认后划转。</p>
      </div>
      <div class="mb-4 flex flex-wrap gap-2" data-wms-list-tabs>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white" data-wms-list-tab="全部">全部</button>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="未领用">未领用</button>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="可转让">可转让</button>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="转让中">转让中</button>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="已用尽">已用尽</button>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50" data-wms-list-tab="待我确认">待我确认</button>
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
        <div class="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">我的计划物资 · 申请与领用对照（按计划审核通过时间降序）</div>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap>
          <table class="min-w-full text-sm wms-data-table">{hold_thead}<tbody data-wms-list-tbody data-wms-plan-hold-tbody>{hold_tbody}</tbody></table>
        </div>
      </div>

      <div class="card mt-4 overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-plan-confirm-card>
        <div class="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">待我确认的转让</div>
        <div class="overflow-x-auto wms-modal-table-wrap">
          <table class="min-w-full text-sm wms-data-table">{confirm_thead}<tbody data-wms-plan-confirm-tbody>{confirm_row}</tbody></table>
        </div>
      </div>

      <div class="hidden py-16 text-center" data-wms-list-empty>
        <i class="fa-solid fa-inbox mb-3 text-3xl text-slate-300"></i>
        <p class="text-sm text-slate-500">无匹配数据，请调整筛选条件</p>
      </div>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm text-slate-500">
        <span data-wms-list-count>共 {len(ROWS) + 1} 条</span>
        <span class="text-slate-400">10 条/页</span>
      </div>
    </div>
  </div>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>
"""

(PAGES / "mine_plan_material.html").write_text(html, encoding="utf-8")
print("updated list")

# patch filter for 未领用 tab
text = LAYOUT.read_text(encoding="utf-8")
old = """      if (activeTab === '待我确认') show = isConfirm;
      if (['可转让', '转让中', '已用尽'].includes(activeTab)) show = !isConfirm && tab === activeTab;"""
new = """      if (activeTab === '待我确认') show = isConfirm;
      if (activeTab === '未领用') show = !isConfirm && Number(row.dataset.unused || 0) > 0;
      if (['可转让', '转让中', '已用尽'].includes(activeTab)) show = !isConfirm && tab === activeTab;"""
if old in text and "未领用" not in text[text.find("initPlanMaterialList"):text.find("initPlanMaterialList")+800]:
    text = text.replace(old, new, 1)
    # also hide confirm on 未领用
    text = text.replace(
        "if (['可转让', '转让中', '已用尽'].includes(activeTab) && confirmCard) confirmCard.classList.add('hidden');",
        "if (['未领用', '可转让', '转让中', '已用尽'].includes(activeTab) && confirmCard) confirmCard.classList.add('hidden');",
        1,
    )
    LAYOUT.write_text(text, encoding="utf-8")
    print("patched filter")
else:
    # try anyway if pattern slightly different
    if "activeTab === '未领用'" not in text:
        text = text.replace(old, new, 1)
        text = text.replace(
            "if (['可转让', '转让中', '已用尽'].includes(activeTab) && confirmCard) confirmCard.classList.add('hidden');",
            "if (['未领用', '可转让', '转让中', '已用尽'].includes(activeTab) && confirmCard) confirmCard.classList.add('hidden');",
            1,
        )
        LAYOUT.write_text(text, encoding="utf-8")
        print("patched filter (retry)")
    else:
        print("filter already has 未领用")
