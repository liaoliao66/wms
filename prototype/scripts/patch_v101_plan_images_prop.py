# -*- coding: utf-8 -*-
"""Patch v1.0.1 pages for plan images/remark propagation + preview."""
from pathlib import Path
import re

ROOT = Path("prototype/versions/v1.0.1/pages")

THUMB = (
    '<button type="button" class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200 hover:ring-sky-400 cursor-pointer" '
    'data-wms-plan-image-thumb data-preview-label="{label}" title="点击预览">'
    '<span class="flex h-full w-full items-center justify-center text-[10px] text-slate-500">{label}</span>'
    "</button>"
)


def thumbs_html(n, editable=False):
    if n <= 0:
        return '<span class="text-slate-400">—</span>'
    parts = []
    for i in range(1, n + 1):
        label = f"图{i}"
        btn = THUMB.format(label=label)
        if editable:
            btn = (
                f'<div class="relative h-10 w-10 shrink-0" data-wms-plan-image-thumb data-preview-label="{label}">'
                f'<button type="button" class="flex h-10 w-10 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200 hover:ring-sky-400 cursor-pointer" data-wms-plan-image-preview title="点击预览">'
                f'<span class="flex h-full w-full items-center justify-center text-[10px] text-slate-500">{label}</span></button>'
                f'<button type="button" class="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white" data-wms-plan-image-remove aria-label="删除图片"><i class="fa-solid fa-xmark"></i></button>'
                f"</div>"
            )
        parts.append(btn)
    add = ""
    if editable:
        add = (
            '<button type="button" class="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:bg-slate-50" '
            'data-wms-plan-image-add title="上传图片"><i class="fa-solid fa-plus text-xs"></i></button>'
            f'<span class="shrink-0 text-[11px] text-slate-400" data-wms-plan-image-count>{n}/9</span>'
        )
    readonly = "0" if editable else "1"
    return (
        f'<div class="flex max-w-[240px] flex-row flex-nowrap items-center gap-1.5 overflow-x-auto" '
        f'data-wms-plan-line-images data-max="9" data-count="{n}" data-readonly="{readonly}">'
        + "".join(parts)
        + add
        + "</div>"
    )


def patch_pending_list():
    p = ROOT / "purchase_pending_list.html"
    t = p.read_text(encoding="utf-8")
    # header
    needle = (
        '采购日期</th><th class="wms-col-actions px-3 py-3 text-right text-xs font-semibold '
        'uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>'
    )
    repl = (
        '采购日期</th><th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide '
        'text-slate-500 whitespace-nowrap">计划备注</th><th class="wms-col-actions px-3 py-3 text-right '
        'text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>'
    )
    if needle not in t:
        raise SystemExit("pending list header miss")
    t = t.replace(needle, repl, 1)

    # insert remark cell before each actions cell that links to plan detail
    # pattern: ...</td><td class="wms-col-actions ...><a href="purchase_pending_plan_detail
    remarks = {
        "JJJH202510001": "优先到货",
        "JJJH202510002": "—",
        "JJJH202606050001": "—",
    }

    def insert_remark(m):
        plan = m.group(2)
        remark = remarks.get(plan, "—")
        if remark == "—":
            cell = '<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="text-slate-400">—</span></td>'
        else:
            cell = f'<td class="px-3 py-3.5 text-sm text-slate-700 whitespace-nowrap">{remark}</td>'
        return cell + m.group(1)

    t2, n = re.subn(
        r'(<td class="wms-col-actions px-3 py-3\.5 text-right text-sm whitespace-nowrap"><a href="purchase_pending_plan_detail\.html\?planNo=([^&"]+))',
        insert_remark,
        t,
    )
    print("pending list remark cells", n)
    p.write_text(t2, encoding="utf-8")


def patch_detail_table_images():
    """Replace text image counts in plan detail with clickable thumbs."""
    p = ROOT / "purchase_pending_plan_detail.html"
    t = p.read_text(encoding="utf-8")
    # Replace static rows image/remark cells that say "N 张" or "—" in image column
    # Simpler: rewrite tbody via known content already patched - replace "2 张" etc with thumbs
    replacements = [
        ("<td class=\"px-3 py-2.5 text-sm text-slate-700\">2 张</td>\n      <td class=\"px-3 py-2.5 text-sm text-slate-700\">汛期备货</td>",
         f'<td class="px-3 py-2.5">{thumbs_html(2)}</td>\n      <td class="px-3 py-2.5 text-sm text-slate-700">汛期备货</td>'),
        ("<td class=\"px-3 py-2.5 text-sm text-slate-700\">—</td>\n      <td class=\"px-3 py-2.5 text-sm text-slate-700\">—</td>",
         f'<td class="px-3 py-2.5">{thumbs_html(0)}</td>\n      <td class="px-3 py-2.5 text-sm text-slate-700">—</td>'),
        ("<td class=\"px-3 py-2.5 text-sm text-slate-700\">1 张</td>\n      <td class=\"px-3 py-2.5 text-sm text-slate-700\">现场配发</td>",
         f'<td class="px-3 py-2.5">{thumbs_html(1)}</td>\n      <td class="px-3 py-2.5 text-sm text-slate-700">现场配发</td>'),
    ]
    for a, b in replacements:
        c = t.count(a)
        t = t.replace(a, b)
        print("detail replace", c, a[:40])
    p.write_text(t, encoding="utf-8")


PLAN_IMG_TH = (
    '<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide '
    'text-slate-500 whitespace-nowrap">计划图片</th>'
)
PLAN_RM_TH = (
    '<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide '
    'text-slate-500 whitespace-nowrap">计划备注</th>'
)


def patch_purchase_detail_tables(filename, row_specs):
    """Insert 计划图片/计划备注 columns before 说明 column in purchase forms."""
    p = ROOT / filename
    t = p.read_text(encoding="utf-8")
    # header: before 说明
    old = (
        '<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide '
        'text-slate-500 whitespace-nowrap">说明</th>'
    )
    if old not in t:
        raise SystemExit(f"{filename} 说明 header miss")
    if "计划图片" not in t:
        t = t.replace(old, PLAN_IMG_TH + PLAN_RM_TH + old, 1)

    # For each row: before 说明 input cell, insert two cells
    # Pattern of 说明 cell: <td ...><input type="text" value="" class="w-24 ...
    # Better: find each 说明 input td and prepend
    pattern = re.compile(
        r'(<td class="px-3 py-2\.5 text-sm text-slate-700 whitespace-nowrap">'
        r'<input type="text" value="[^"]*" class="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200" /></td>'
        r'<td class="wms-col-actions)'
    )

    idx = 0

    def repl(m):
        nonlocal idx
        if idx >= len(row_specs):
            spec = (0, "—")
        else:
            spec = row_specs[idx]
        idx += 1
        n, remark = spec
        img = thumbs_html(n)
        if remark == "—":
            rm = '<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap"><span class="text-slate-400">—</span></td>'
        else:
            rm = f'<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">{remark}</td>'
        return f'<td class="px-3 py-2.5 align-top">{img}</td>{rm}{m.group(1)}'

    t2, n = pattern.subn(repl, t)
    print(filename, "rows patched", n)
    p.write_text(t2, encoding="utf-8")


def patch_execute_direct():
    p = ROOT / "purchase_execute_direct.html"
    t = p.read_text(encoding="utf-8")
    # Add columns to material header before 参考单价 or at end before closing
    # Current headers end with 采购总额
    old_h = (
        '<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide '
        'text-slate-500 whitespace-nowrap">采购总额（元）</th></tr></thead>'
    )
    new_h = (
        '<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide '
        'text-slate-500 whitespace-nowrap">采购总额（元）</th>'
        + PLAN_IMG_TH
        + PLAN_RM_TH
        + "</tr></thead>"
    )
    if "计划图片" not in t:
        if old_h not in t:
            raise SystemExit("execute header miss")
        t = t.replace(old_h, new_h, 1)

    # Row 1 expanded: ends with 1000.00</td></tr><tr class="wms-execute-quote
    r1 = (
        '<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">1000.00</td></tr>'
        '<tr class="wms-execute-quote-nested-row'
    )
    r1n = (
        '<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">1000.00</td>'
        f'<td class="px-3 py-2.5 align-top">{thumbs_html(1)}</td>'
        '<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">优先到货</td></tr>'
        '<tr class="wms-execute-quote-nested-row'
    )
    # Row 2 collapsed
    r2 = (
        '<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">2000.00</td></tr></tbody></table>'
    )
    r2n = (
        '<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap">2000.00</td>'
        f'<td class="px-3 py-2.5 align-top">{thumbs_html(0)}</td>'
        '<td class="px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap"><span class="text-slate-400">—</span></td></tr></tbody></table>'
    )
    # Also need colspan on nested row: colspan="10" -> 12
    t = t.replace('colspan="10"', 'colspan="12"')
    if r1 in t:
        t = t.replace(r1, r1n, 1)
        print("execute r1 ok")
    else:
        print("execute r1 MISS")
    if r2 in t:
        t = t.replace(r2, r2n, 1)
        print("execute r2 ok")
    else:
        print("execute r2 MISS")
    p.write_text(t, encoding="utf-8")


def patch_acceptance():
    p = ROOT / "warehouse_acceptance_form.html"
    t = p.read_text(encoding="utf-8")
    block = """
        <div class="wms-form-section md:col-span-2"><h3 class="wms-form-section-title">计划来源信息（只读）</h3></div>
        <div class="md:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <dl class="grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="mb-1.5 text-xs font-medium text-slate-500">计划备注</dt>
              <dd class="text-sm text-slate-800" data-accept-field="planRemark">优先到货</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="mb-1.5 text-xs font-medium text-slate-500">计划图片</dt>
              <dd data-accept-field="planImages">""" + thumbs_html(1) + """</dd>
            </div>
          </dl>
          <p class="mt-2 text-xs text-slate-400">来自物资计划明细，沿待采→采购申请→物资采购透传，验收时仅供对照。</p>
        </div>
"""
    if "计划来源信息" not in t:
        t = t.replace(
            '<div class="wms-form-section md:col-span-2"><h3 class="wms-form-section-title">验收信息</h3></div>',
            block + '        <div class="wms-form-section md:col-span-2"><h3 class="wms-form-section-title">验收信息</h3></div>',
            1,
        )
        print("acceptance block ok")
    else:
        print("acceptance already")
    p.write_text(t, encoding="utf-8")


def patch_apply_plan_form():
    """Ensure thumbs are horizontal + clickable preview attrs."""
    p = ROOT / "apply_plan_form.html"
    t = p.read_text(encoding="utf-8")
    # Make existing thumb clickable: add data-wms-plan-image-preview on inner content
    # Replace thumb structure for row1
    old_thumb = """                      <div class="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200" data-wms-plan-image-thumb title="示意图片 1">
                        <div class="flex h-full w-full items-center justify-center text-[10px] text-slate-500">图1</div>
                        <button type="button" class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white" data-wms-plan-image-remove aria-label="删除图片"><i class="fa-solid fa-xmark"></i></button>
                      </div>"""
    new_thumb = """                      <div class="relative h-10 w-10 shrink-0" data-wms-plan-image-thumb data-preview-label="图1">
                        <button type="button" class="flex h-10 w-10 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200 hover:ring-sky-400 cursor-pointer" data-wms-plan-image-preview title="点击预览">
                          <span class="flex h-full w-full items-center justify-center text-[10px] text-slate-500">图1</span>
                        </button>
                        <button type="button" class="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white" data-wms-plan-image-remove aria-label="删除图片"><i class="fa-solid fa-xmark"></i></button>
                      </div>"""
    if old_thumb in t:
        t = t.replace(old_thumb, new_thumb, 1)
        print("apply form thumb ok")
    else:
        print("apply form thumb miss - check structure")
    # ensure flex-row on wraps
    t = t.replace(
        'class="flex min-w-[168px] flex-wrap items-center gap-1.5"',
        'class="flex max-w-[240px] flex-row flex-nowrap items-center gap-1.5 overflow-x-auto"',
    )
    p.write_text(t, encoding="utf-8")


if __name__ == "__main__":
    patch_pending_list()
    patch_detail_table_images()
    patch_purchase_detail_tables(
        "purchase_pending_apply.html",
        [(2, "汛期备货"), (0, "—")],
    )
    patch_purchase_detail_tables(
        "purchase_request_form.html",
        [(1, "优先到货"), (0, "—")],
    )
    patch_execute_direct()
    patch_acceptance()
    patch_apply_plan_form()
    print("done")
