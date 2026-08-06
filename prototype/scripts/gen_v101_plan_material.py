# -*- coding: utf-8 -*-
"""Generate v1.0.1 计划物资 PC pages + nav patch."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "versions" / "v1.0.1" / "pages"
LAYOUT = ROOT / "versions" / "v1.0.1" / "js" / "layout.js"
MAP = PAGES / "prototype_map.html"
PORTAL = ROOT / "versions" / "v1.0.1" / "index.html"
PRD = Path(__file__).resolve().parents[2] / "docs" / "versions" / "v1.0.1" / "prd.md"

HEAD = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} · 物资管理系统</title>
  <link rel="stylesheet" href="../css/tailwind.css" />
  <link rel="stylesheet" href="../css/custom.css" />
  <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css" />
</head>
"""


def badge(text, kind="slate"):
    colors = {
        "slate": "bg-slate-100 text-slate-700 ring-slate-600/10",
        "emerald": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        "amber": "bg-amber-50 text-amber-800 ring-amber-600/20",
        "sky": "bg-sky-50 text-sky-700 ring-sky-600/20",
        "rose": "bg-rose-50 text-rose-700 ring-rose-600/20",
    }
    cls = colors.get(kind, colors["slate"])
    return (
        f'<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium '
        f'ring-1 ring-inset {cls}">{text}</span>'
    )


def cell(html, px="px-3"):
    return f'<td class="{px} py-3.5 text-sm text-slate-700 whitespace-nowrap">{html}</td>'


def th(label, right=False):
    align = "text-right" if right else "text-left"
    extra = "wms-col-actions " if right else ""
    return (
        f'<th class="{extra}px-3 py-3 {align} text-xs font-semibold uppercase tracking-wide '
        f'text-slate-500 whitespace-nowrap">{label}</th>'
    )


# —— list page ——
HOLD_ROWS = [
    # sorted by approve_time desc
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
        "occupied": 1,
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
        "occupied": 2,
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
        "occupied": 0,
        "locked": 0,
        "transferable": 6,
        "status": "可转让",
        "status_kind": "emerald",
        "source": "转入 · 王五",
        "approve_time": "2026-05-08 09:30",
        "actions": "transfer",
    },
    {
        "tab": "已用尽",
        "plan_no": "JJJH202504010001",
        "plan_name": "办公耗材计划",
        "plan_type": "一般计划",
        "code": "HC-00089",
        "name": "打印纸 A4",
        "spec": "A4/80g",
        "major": "耗材-办公耗材",
        "minor": "办公用纸",
        "unit": "箱",
        "plan_qty": 20,
        "occupied": 20,
        "locked": 0,
        "transferable": 0,
        "status": "已用尽",
        "status_kind": "slate",
        "source": "原计划",
        "approve_time": "2026-04-01 10:00",
        "actions": "view",
    },
]

CONFIRM_ROWS = [
    {
        "tab": "待我确认",
        "transfer_no": "JHZR20260608002",
        "plan_no": "JJJH202606080001",
        "plan_name": "防汛应急补库",
        "plan_type": "急件",
        "code": "XF-00102",
        "name": "防汛沙袋",
        "spec": "50×80cm",
        "major": "耗材-生产耗材",
        "minor": "防汛物资",
        "unit": "条",
        "qty": 200,
        "from_user": "赵六",
        "from_dept": "工程部",
        "reason": "本部门用量下调，额度转让",
        "approve_time": "2026-06-08 16:40",
        "submit_time": "2026-06-08 17:05",
    },
]


def hold_row_html(i, r):
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
                r["approve_time"],
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
        f'data-list-tab="{r["tab"]}" data-list-search="{search}" data-approve-time="{r["approve_time"]}">'
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
        f'{cell(str(r["occupied"]))}'
        f'{cell(str(r["locked"]))}'
        f'{cell("<strong>" + str(r["transferable"]) + "</strong>")}'
        f'{cell(badge(r["status"], r["status_kind"]))}'
        f'{cell(r["source"])}'
        f'<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap">{ops}</td>'
        f"</tr>"
    )


def confirm_row_html(i, r):
    search = " ".join(
        [
            r["transfer_no"],
            r["plan_no"],
            r["code"],
            r["name"],
            r["from_user"],
            "待我确认",
        ]
    ).lower()
    q = f"transferNo={r['transfer_no']}"
    ops = (
        f'<a href="mine_plan_material_confirm.html?{q}" class="font-medium text-slate-900 hover:underline">确认</a>'
    )
    return (
        f'<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row '
        f'data-list-tab="待我确认" data-list-search="{search}">'
        f'{cell(str(i))}'
        f'{cell(r["transfer_no"])}'
        f'{cell(r["plan_no"])}'
        f'{cell(badge(r["plan_type"]))}'
        f'{cell(r["code"])}'
        f'{cell(r["name"])}'
        f'{cell(r["spec"])}'
        f'{cell(r["unit"])}'
        f'{cell(str(r["qty"]))}'
        f'{cell(r["from_user"] + " · " + r["from_dept"])}'
        f'{cell(r["reason"])}'
        f'{cell(r["submit_time"])}'
        f'{cell(badge("待确认", "amber"))}'
        f'<td class="wms-col-actions px-3 py-3.5 text-right text-sm whitespace-nowrap">{ops}</td>'
        f"</tr>"
    )


def build_list():
    hold_headers = [
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
        "计划数量",
        "已占用",
        "锁定中",
        "可转让余量",
        "行状态",
        "额度来源",
    ]
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

    hold_tbody = "".join(hold_row_html(i + 1, r) for i, r in enumerate(HOLD_ROWS))
    confirm_tbody = "".join(confirm_row_html(i + 1, r) for i, r in enumerate(CONFIRM_ROWS))

    # For "全部持有" tab filtering: hold rows should also match 全部持有 via dual tabs
    # initListToolbar matches exact tab unless 全部. So we need:
    # - 全部持有 as default "全部" style OR use 全部 as first tab covering holds only
    # PRD: 全部持有 / 可转让 / 转让中 / 待我确认
    # Easiest: first tab "全部持有" with hasAllTab false - then hold rows need data-list-tab that matches OR we set hold rows to also appear under 全部持有.
    # Looking at initListToolbar: if activeTab is 全部 and hasAllTab, show all. So rename first to 全部 and label display... 
    # Better: use tabs 全部 / 可转让 / 转让中 / 待我确认 / 已用尽 and intro says 全部=我持有+待确认
    # Or: hold rows have data-list-tab="可转让" etc and ALSO we use data-list-tab primary; for 全部持有 set hasAllTab by naming first tab 全部持有 and treating it specially.
    #
    # Simplest fix matching existing code: first tab = "全部", second 可转让, 转让中, 已用尽, 待我确认.
    # Intro text clarifies 全部含持有与待确认.

    # Re-tag: for 全部 to show everything, first tab must be literally "全部"
    # Confirm rows: tab 待我确认
    # Hold rows: their status tabs

    hold_thead = (
        '<thead class="bg-slate-50/80"><tr>'
        + "".join(th(h) for h in hold_headers)
        + th("操作", right=True)
        + "</tr></thead>"
    )
    confirm_thead = (
        '<thead class="bg-slate-50/80"><tr>'
        + "".join(th(h) for h in confirm_headers)
        + th("操作", right=True)
        + "</tr></thead>"
    )

    html = HEAD.format(title="计划物资") + f"""<body data-page="mine_plan_material" data-title="计划物资" data-breadcrumb="我的物资 / 计划物资">
  <div id="main-content">
    <div data-wms-list-page data-wms-plan-material-list>
      <div class="mb-4 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
        <p><strong>仅转让计划领用额度</strong>，不涉及实物调拨，也不变更待采/采购数量。提交转让后数量进入<strong>锁定</strong>，受让人确认后划转；拒绝或撤销则释放锁定。</p>
      </div>
      <div class="mb-4 flex flex-wrap gap-2" data-wms-list-tabs>
        <button type="button" class="wms-list-tab rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white" data-wms-list-tab="全部">全部</button>
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
        <div class="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">我持有的计划额度（默认按计划审核通过时间降序）</div>
        <div class="overflow-x-auto wms-modal-table-wrap" data-wms-list-table-wrap>
          <table class="min-w-full text-sm wms-data-table">{hold_thead}<tbody data-wms-list-tbody data-wms-plan-hold-tbody>{hold_tbody}</tbody></table>
        </div>
      </div>

      <div class="card mt-4 overflow-hidden rounded-2xl bg-white shadow-sm" data-wms-plan-confirm-card>
        <div class="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">待我确认的转让</div>
        <div class="overflow-x-auto wms-modal-table-wrap">
          <table class="min-w-full text-sm wms-data-table">{confirm_thead}<tbody data-wms-plan-confirm-tbody>{confirm_tbody}</tbody></table>
        </div>
      </div>

      <div class="hidden py-16 text-center" data-wms-list-empty>
        <i class="fa-solid fa-inbox mb-3 text-3xl text-slate-300"></i>
        <p class="text-sm text-slate-500">无匹配数据，请调整筛选条件</p>
      </div>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm text-slate-500">
        <span data-wms-list-count>共 {len(HOLD_ROWS) + len(CONFIRM_ROWS)} 条</span>
        <span class="text-slate-400">10 条/页</span>
      </div>
    </div>
  </div>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>
"""
    # Problem: initListToolbar only looks at one tbody. Confirm rows won't filter with hold.
    # Better: single table OR custom JS for dual tables.
    # I'll use single unified approach with one tbody - for confirm rows use same columns where possible with colspan note... messy.
    # Custom initPlanMaterialList that filters both tbodies.

    (PAGES / "mine_plan_material.html").write_text(html, encoding="utf-8")
    print("wrote list")


def build_transfer():
    html = HEAD.format(title="计划额度转让") + """<body data-page="mine_plan_material" data-title="计划额度转让" data-breadcrumb="我的物资 / 计划物资 / 转让">
  <div id="main-content">
    <div data-wms-modal data-modal-back="mine_plan_material.html" data-modal-size="lg" data-wms-plan-transfer-form>
      <div class="wms-modal-form">
        <div class="md:col-span-2 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
          提交后转让数量将<strong>立即锁定</strong>，不可再领用或再次转让该数量；受让人确认后额度划转。本操作<strong>不改变</strong>待采与采购数量。
        </div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">转让单号</label><input type="text" value="系统自动生成" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" data-transfer-no /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">状态</label><input type="text" value="草稿" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" data-transfer-status /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">计划单号</label><input type="text" value="JJJH202606050001" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700" data-field="planNo" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">物资</label><input type="text" value="XF-00105 · 抽水泵" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" data-field="material" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">规格型号</label><input type="text" value="QZ10-15" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" data-field="spec" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">计量单位</label><input type="text" value="台" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" data-field="unit" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">可转让余量</label><input type="text" value="4" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900" data-field="transferable" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 转让数量</label><input type="number" min="1" value="2" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" data-field="qty" /></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 受让人</label>
          <select class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" data-field="assignee">
            <option value="">请选择（系统内任何人）</option>
            <option value="wangwu">王五 · 维保部</option>
            <option value="zhaoliu">赵六 · 工程部</option>
            <option value="lisi">李四 · 设备部</option>
            <option value="zhangsan">张三 · 行政部</option>
          </select>
        </div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"><span class="text-rose-500">*</span> 原因说明</label>
          <textarea rows="3" maxlength="200" placeholder="请说明转让原因（最多 200 字）" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" data-field="reason">计划用量下调，额度转让给实际使用人</textarea>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="mine_plan_material.html" class="wms-btn wms-btn-secondary">取消</a>
        <button type="button" class="wms-btn wms-btn-primary" data-wms-plan-transfer-submit>提交并锁定</button>
      </div>
    </div>
  </div>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>
"""
    (PAGES / "mine_plan_material_transfer.html").write_text(html, encoding="utf-8")
    print("wrote transfer")


def build_confirm():
    html = HEAD.format(title="确认计划额度转让") + """<body data-page="mine_plan_material" data-title="确认计划额度转让" data-breadcrumb="我的物资 / 计划物资 / 确认转让">
  <div id="main-content">
    <div data-wms-modal data-modal-back="mine_plan_material.html" data-modal-size="lg" data-wms-plan-transfer-confirm>
      <div class="wms-modal-form">
        <div class="md:col-span-2 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-slate-700">
          接受后，下列<strong>计划领用额度</strong>将划入你的「计划物资」；你可再次转让。拒绝则额度退回转让人并解除锁定。
        </div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">转让单号</label><input type="text" value="JHZR20260608002" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700" data-field="transferNo" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">状态</label><input type="text" value="待确认" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-amber-800" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">计划单号</label><input type="text" value="JJJH202606080001" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">计划类型</label><input type="text" value="急件" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">物资</label><input type="text" value="XF-00102 · 防汛沙袋" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">规格 / 单位</label><input type="text" value="50×80cm / 条" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">转让数量</label><input type="text" value="200" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900" /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700">转让人</label><input type="text" value="赵六 · 工程部" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" /></div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">原因说明</label>
          <textarea rows="2" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">本部门用量下调，额度转让</textarea>
        </div>
        <div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">拒绝原因（拒绝时填写）</label>
          <textarea rows="2" maxlength="200" placeholder="若拒绝请填写原因" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" data-field="rejectReason"></textarea>
        </div>
      </div>
      <div class="wms-modal-footer">
        <a href="mine_plan_material.html" class="wms-btn wms-btn-secondary">返回</a>
        <button type="button" class="wms-btn wms-btn-secondary" data-wms-plan-transfer-reject>拒绝</button>
        <button type="button" class="wms-btn wms-btn-primary" data-wms-plan-transfer-accept>确认接受</button>
      </div>
    </div>
  </div>
  <script src="../js/layout.js" charset="UTF-8"></script>
</body></html>
"""
    (PAGES / "mine_plan_material_confirm.html").write_text(html, encoding="utf-8")
    print("wrote confirm")


JS_FN = r"""
function initPlanMaterialList(root) {
  if (root.dataset.page !== 'mine_plan_material') return;
  if (root.dataset.title !== '计划物资') return;
  const page = document.querySelector('[data-wms-plan-material-list]');
  if (!page || page.dataset.wmsPlanMaterialInit) return;
  page.dataset.wmsPlanMaterialInit = '1';

  const holdCard = page.querySelector('[data-wms-plan-hold-card]');
  const confirmCard = page.querySelector('[data-wms-plan-confirm-card]');
  const holdRows = () => [...page.querySelectorAll('[data-wms-plan-hold-tbody] [data-wms-list-row]')];
  const confirmRows = () => [...page.querySelectorAll('[data-wms-plan-confirm-tbody] [data-wms-list-row]')];
  const tabBtns = [...page.querySelectorAll('[data-wms-list-tab]')];
  const searchInput = page.querySelector('[data-wms-list-search]');
  const searchClear = page.querySelector('[data-wms-list-search-clear]');
  const resetBtn = page.querySelector('[data-wms-list-reset]');
  const countEl = page.querySelector('[data-wms-list-count]');
  const emptyEl = page.querySelector('[data-wms-list-empty]');
  let activeTab = '全部';

  const apply = () => {
    const q = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;
    const filterRow = (row, isConfirm) => {
      const tab = row.dataset.listTab || '';
      let show = activeTab === '全部' || tab === activeTab;
      if (activeTab === '全部' && isConfirm) show = true;
      if (activeTab === '待我确认') show = isConfirm;
      if (['可转让', '转让中', '已用尽'].includes(activeTab)) show = !isConfirm && tab === activeTab;
      if (q && !(row.dataset.listSearch || '').includes(q)) show = false;
      row.classList.toggle('hidden', !show);
      if (show) visible += 1;
    };
    holdRows().forEach(r => filterRow(r, false));
    confirmRows().forEach(r => filterRow(r, true));

    const holdVisible = holdRows().some(r => !r.classList.contains('hidden'));
    const confirmVisible = confirmRows().some(r => !r.classList.contains('hidden'));
    if (holdCard) holdCard.classList.toggle('hidden', activeTab === '待我确认' ? !holdVisible : !holdVisible && activeTab !== '全部');
    if (activeTab === '待我确认' && holdCard) holdCard.classList.add('hidden');
    if (['可转让', '转让中', '已用尽'].includes(activeTab) && confirmCard) confirmCard.classList.add('hidden');
    else if (confirmCard) confirmCard.classList.toggle('hidden', !confirmVisible && activeTab !== '全部');

    if (activeTab === '全部') {
      holdCard?.classList.toggle('hidden', !holdVisible);
      confirmCard?.classList.toggle('hidden', !confirmVisible);
    }

    if (countEl) countEl.textContent = `共 ${visible} 条`;
    emptyEl?.classList.toggle('hidden', visible > 0);
    if (searchClear && searchInput) {
      const has = !!searchInput.value.trim();
      searchClear.classList.toggle('hidden', !has);
      searchClear.classList.toggle('inline-flex', has);
    }
    if (resetBtn) {
      const showReset = !!(q || activeTab !== '全部');
      resetBtn.classList.toggle('hidden', !showReset);
      resetBtn.classList.toggle('inline-flex', showReset);
    }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-wms-list-tab') || '全部';
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
    activeTab = '全部';
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
  }
  apply();
}

function initPlanMaterialTransfer(root) {
  const form = document.querySelector('[data-wms-plan-transfer-form]');
  if (!form || form.dataset.wmsPlanTransferInit) return;
  form.dataset.wmsPlanTransferInit = '1';

  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const planNo = params.get('planNo');
  const code = params.get('code');
  const name = params.get('name');
  const qtyMax = params.get('qty');
  const unit = params.get('unit');
  const spec = params.get('spec');
  const locked = params.get('locked');
  const transferNo = params.get('transferNo');

  if (planNo) form.querySelector('[data-field="planNo"]')?.setAttribute('value', planNo);
  if (code || name) {
    const el = form.querySelector('[data-field="material"]');
    if (el) el.value = [code, name].filter(Boolean).join(' · ');
  }
  if (spec) form.querySelector('[data-field="spec"]')?.setAttribute('value', spec);
  if (unit) form.querySelector('[data-field="unit"]')?.setAttribute('value', unit);
  if (qtyMax) {
    const t = form.querySelector('[data-field="transferable"]');
    if (t) t.value = qtyMax;
    const q = form.querySelector('[data-field="qty"]');
    if (q) {
      q.max = qtyMax;
      q.value = Math.min(Number(qtyMax) || 1, Number(q.value) || 1);
    }
  }

  const submitBtn = form.querySelector('[data-wms-plan-transfer-submit]');
  if (mode === 'view') {
    form.querySelector('[data-transfer-no]')?.setAttribute('value', transferNo || 'JHZR20260510001');
    form.querySelector('[data-transfer-status]')?.setAttribute('value', '待确认（已锁定）');
    const q = form.querySelector('[data-field="qty"]');
    if (q) {
      q.value = locked || q.value;
      q.readOnly = true;
      q.classList.add('bg-slate-50');
    }
    form.querySelector('[data-field="assignee"]')?.setAttribute('disabled', 'disabled');
    form.querySelector('[data-field="reason"]')?.setAttribute('readonly', 'readonly');
    if (submitBtn) submitBtn.classList.add('hidden');
  }

  submitBtn?.addEventListener('click', () => {
    const max = Number(form.querySelector('[data-field="transferable"]')?.value || 0);
    const qty = Number(form.querySelector('[data-field="qty"]')?.value || 0);
    const assignee = form.querySelector('[data-field="assignee"]')?.value;
    const reason = (form.querySelector('[data-field="reason"]')?.value || '').trim();
    if (!assignee) {
      showSupplyCompleteToast('请选择受让人');
      return;
    }
    if (!qty || qty < 1) {
      showSupplyCompleteToast('请填写有效转让数量');
      return;
    }
    if (qty > max) {
      showSupplyCompleteToast(`转让数量不能超过可转让余量 ${max}`);
      return;
    }
    if (!reason) {
      showSupplyCompleteToast('请填写原因说明');
      return;
    }
    showSupplyCompleteToast('已提交并锁定额度，等待受让人确认');
    setTimeout(() => { window.location.href = 'mine_plan_material.html?tab=转让中'; }, 800);
  });
}

function initPlanMaterialConfirm(root) {
  const form = document.querySelector('[data-wms-plan-transfer-confirm]');
  if (!form || form.dataset.wmsPlanConfirmInit) return;
  form.dataset.wmsPlanConfirmInit = '1';

  const params = new URLSearchParams(window.location.search);
  const transferNo = params.get('transferNo');
  if (transferNo) {
    const el = form.querySelector('[data-field="transferNo"]');
    if (el) el.value = transferNo;
  }

  form.querySelector('[data-wms-plan-transfer-accept]')?.addEventListener('click', () => {
    showSupplyCompleteToast('已接受，额度已划入你的计划物资');
    setTimeout(() => { window.location.href = 'mine_plan_material.html?tab=可转让'; }, 800);
  });
  form.querySelector('[data-wms-plan-transfer-reject]')?.addEventListener('click', () => {
    const reason = (form.querySelector('[data-field="rejectReason"]')?.value || '').trim();
    if (!reason) {
      showSupplyCompleteToast('拒绝时请填写原因');
      return;
    }
    showSupplyCompleteToast('已拒绝，锁定额度已退回转让人');
    setTimeout(() => { window.location.href = 'mine_plan_material.html'; }, 800);
  });
}
"""


def patch_layout():
    text = LAYOUT.read_text(encoding="utf-8")
    if "mine_plan_material" not in text.split("WMS_NAV")[1].split("];")[0]:
        text = text.replace(
            "  { id: 'mine_pending_return', label: '归还记录', icon: 'fa-rotate-left', href: 'mine_pending_return.html' },",
            "  { id: 'mine_pending_return', label: '归还记录', icon: 'fa-rotate-left', href: 'mine_pending_return.html' },\n"
            "  { id: 'mine_plan_material', label: '计划物资', icon: 'fa-arrows-turn-right', href: 'mine_plan_material.html' },",
        )
    if "function initPlanMaterialList" not in text:
        text = text.replace(
            "function initPurchasePendingGroup(root) {",
            JS_FN.strip() + "\n\nfunction initPurchasePendingGroup(root) {",
        )
    if "initPlanMaterialList(root)" not in text:
        text = text.replace(
            "  initPurchasePendingGroup(root);",
            "  initPlanMaterialList(root);\n  initPlanMaterialTransfer(root);\n  initPlanMaterialConfirm(root);\n  initPurchasePendingGroup(root);",
        )
    # Avoid double-filtering: list page has data-wms-list-page but custom init.
    # initListToolbar will also run on hold tbody only - may fight. Mark page to skip generic toolbar.
    LAYOUT.write_text(text, encoding="utf-8")
    print("patched layout")


def patch_list_skip_generic():
    """Exclude plan material list from generic initListToolbar by adding data-wms-location-page-like skip or custom attr."""
    text = LAYOUT.read_text(encoding="utf-8")
    old = "document.querySelectorAll('[data-wms-list-page]:not([data-wms-location-page])').forEach(pageEl => {"
    new = "document.querySelectorAll('[data-wms-list-page]:not([data-wms-location-page]):not([data-wms-plan-material-list])').forEach(pageEl => {"
    if old in text and new not in text:
        text = text.replace(old, new)
        LAYOUT.write_text(text, encoding="utf-8")
        print("skipped generic list toolbar for plan material")


def patch_map():
    text = MAP.read_text(encoding="utf-8")
    needle = '["mine_pending_return.html","归还记录","我的物资"]'
    insert = (
        '["mine_pending_return.html","归还记录","我的物资"],'
        '["mine_plan_material.html","计划物资","我的物资"],'
        '["mine_plan_material_transfer.html","计划额度转让","我的物资 · 表单"],'
        '["mine_plan_material_confirm.html","确认计划额度转让","我的物资 · 表单"]'
    )
    if "mine_plan_material.html" not in text:
        text = text.replace(needle, insert)
        MAP.write_text(text, encoding="utf-8")
        print("patched map")


def patch_portal():
    text = PORTAL.read_text(encoding="utf-8")
    if "计划物资" not in text:
        text = text.replace(
            "<li><i class=\"fa-solid fa-check text-emerald-500 mr-1.5\"></i>直采：锁定 1 供应商</li>",
            "<li><i class=\"fa-solid fa-check text-emerald-500 mr-1.5\"></i>直采：锁定 1 供应商</li>\n"
            "            <li><i class=\"fa-solid fa-check text-emerald-500 mr-1.5\"></i>计划物资：额度查看 / 转让锁量 / 受让确认</li>",
        )
        text = text.replace(
            "计划采购分流补丁 · 相对 v1.0.0 增量",
            "计划采购分流 + 计划物资额度转让 · 相对 v1.0.0 增量",
        )
        PORTAL.write_text(text, encoding="utf-8")
        print("patched portal")


def patch_prd_genui():
    if not PRD.exists():
        return
    text = PRD.read_text(encoding="utf-8")
    text = text.replace(
        "| 交互原型 | 采购分流相关页已绘；**计划物资**待 GenUI 确认后绘制 |",
        "| 交互原型 | 采购分流相关页已绘；**计划物资 PC 原型已绘制** |",
    )
    text = text.replace(
        "| 文档状态 | **计划物资口径已收口 · 待 GenUI 平台确认后出原型** |",
        "| 文档状态 | **计划物资 PC 原型已交付** |",
    )
    text = text.replace(
        "| 目标平台 | **仅 PC Web**（待 GenUI 确认后出原型） |",
        "| 目标平台 | **仅 PC Web** |",
    )
    old_genui = """```markdown
✅ **PRD与交互流程已更新**：`docs/versions/v1.0.1/prd.md`（含 §3.7 计划物资）
当前生成版本：【v1.0.1】

请确认生成原型的平台：
- [ ] 仅生成 PC 端原型（推荐，与本版目标平台一致）
- [ ] 仅生成移动端原型（原生App模式）
- [ ] 仅生成移动端原型（企业微信H5模式）
- [ ] 同时生成 PC端 + 移动端（原生App）
- [ ] 同时生成 PC端 + 移动端（企业微信H5）

请直接回复选项，例如：“生成PC端原型”或“PC + 企微H5都要”。
```"""
    new_genui = """```markdown
✅ **PRD与交互流程已更新**：`docs/versions/v1.0.1/prd.md`（含 §3.7 计划物资）
✅ **PC 端原型已生成**：我的物资 / 计划物资（列表、转让锁量、受让确认）
当前生成版本：【v1.0.1】· 平台：PC
```"""
    if old_genui in text:
        text = text.replace(old_genui, new_genui)
    PRD.write_text(text, encoding="utf-8")
    print("patched prd")


def main():
    build_list()
    build_transfer()
    build_confirm()
    patch_layout()
    patch_list_skip_generic()
    patch_map()
    patch_portal()
    patch_prd_genui()


if __name__ == "__main__":
    main()
