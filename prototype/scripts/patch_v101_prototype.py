# -*- coding: utf-8 -*-
"""Patch v1.0.1 related prototype pages per PRD."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1] / 'versions' / 'v1.0.1'

# --- layout.js ---
lj_path = root / 'js' / 'layout.js'
lj = lj_path.read_text(encoding='utf-8')
lj = lj.replace('黄冈武穴 · V1.0', '黄冈武穴 · V1.0.1')


def flip_plan(text, block_no, to_type):
    pat = rf"(no: '{block_no}', name: '[^']+', planType: ')[^']+(')"
    text2, n = re.subn(pat, rf"\g<1>{to_type}\2", text, count=1)
    print(f'plan {block_no} -> {to_type}: {"ok" if n else "MISS"}')
    return text2


# Pending-side plans become 一般；保留防汛急件供物资采购演示
lj = flip_plan(lj, 'JJJH202510001', '一般计划')
lj = flip_plan(lj, 'JJJH202510002', '一般计划')
lj = flip_plan(lj, 'JJJH202606050001', '一般计划')
lj_path.write_text(lj, encoding='utf-8')
print('layout.js updated')

# --- purchase_pending_list ---
p = root / 'pages' / 'purchase_pending_list.html'
t = p.read_text(encoding='utf-8')
t = t.replace(
    '急件计划审核通过后按<strong>计划单号 + 物资编码</strong>生成待采记录；<strong>待申请</strong>可单条或批量发起采购申请，<strong>已申请</strong>不可重复申请',
    '仅<strong>一般计划</strong>审核通过后按<strong>计划单号 + 物资编码</strong>生成待采记录（急件计划进「物资采购」，不进待采）；'
    '<strong>待申请</strong>可单条或批量发起采购申请，<strong>已申请</strong>不可重复申请',
)
t = t.replace(
    '<option value="全部" selected>全部</option><option value="一般计划">一般计划</option><option value="急件计划">急件计划</option>',
    '<option value="全部" selected>全部</option><option value="一般计划">一般计划</option>',
)
t = t.replace('data-list-filter-planType="急件计划"', 'data-list-filter-planType="一般计划"')
t = t.replace(' 急件计划 ', ' 一般计划 ')
t = t.replace(
    'bg-amber-50 text-amber-700 ring-amber-600/20">急件计划</span>',
    'bg-slate-100 text-slate-700 ring-slate-600/10">一般计划</span>',
)
p.write_text(t, encoding='utf-8')
print('purchase_pending_list done')

# --- apply_plan_list ---
p = root / 'pages' / 'apply_plan_list.html'
t = p.read_text(encoding='utf-8')
t = t.replace(
    '编制物资需求计划，支持一般计划与急件计划',
    '编制物资需求计划：<strong>急件</strong>审核通过→物资采购直采（并可领用）；'
    '<strong>一般</strong>审核通过→待采全流程（并可领用）',
)
start = t.find('<tbody data-wms-list-tbody>')
end = t.find('</tbody>', start) + len('</tbody>')
new_tbody = '''<tbody data-wms-list-tbody><tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-search="jh202606090001 六月办公物资计划 一般计划 2026-06-20 审核通过 2026-06-05" data-list-tab="已通过" data-list-filter-planType="一般计划"><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">JH202606090001</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">六月办公物资计划</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-slate-100 text-slate-700 ring-slate-600/10">一般计划</span></td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">2026-06-20</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">审核通过</span></td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">2026-06-05</td><td class="wms-col-actions px-4 py-3.5 text-slate-900 text-right text-sm whitespace-nowrap"><a href="apply_plan_form.html?mode=view&amp;guide=general" class="mr-3 hover:underline">查看</a><a href="purchase_pending_list.html" class="mr-3 hover:underline">去待采</a><a href="apply_requisition_form.html" class="hover:underline">去领用</a></td></tr><tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-search="jjjh202606080001 防汛应急采购 急件计划 2026-06-10 审核通过 2026-06-08" data-list-tab="已通过" data-list-filter-planType="急件计划"><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">JJJH202606080001</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">防汛应急采购</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-rose-50 text-rose-700 ring-rose-600/20">急件计划</span></td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">2026-06-10</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">审核通过</span></td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">2026-06-08</td><td class="wms-col-actions px-4 py-3.5 text-slate-900 text-right text-sm whitespace-nowrap"><a href="apply_plan_form.html?mode=view&amp;guide=urgent" class="mr-3 hover:underline">查看</a><a href="purchase_execute_list.html?tab=待执行" class="mr-3 hover:underline">去物资采购</a><a href="apply_requisition_form.html" class="hover:underline">去领用</a></td></tr><tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row data-list-search="jh202606080003 应急防汛物资 急件计划 2026-06-10 审核中 2026-06-08" data-list-tab="审核中" data-list-filter-planType="急件计划"><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">JH202606080003</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">应急防汛物资</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-rose-50 text-rose-700 ring-rose-600/20">急件计划</span></td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">2026-06-10</td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20">审核中</span></td><td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">2026-06-08</td><td class="wms-col-actions px-4 py-3.5 text-slate-900 text-right text-sm whitespace-nowrap"><a href="apply_plan_form.html" class="mr-3 hover:underline">查看</a><span class="text-slate-400">未通过·不进采购</span></td></tr></tbody>'''
t = t[:start] + new_tbody + t[end:]
t = t.replace('共 2 条', '共 3 条')
p.write_text(t, encoding='utf-8')
print('apply_plan_list done')

# --- apply_plan_form tip ---
p = root / 'pages' / 'apply_plan_form.html'
t = p.read_text(encoding='utf-8')
if 'data-wms-plan-type-hint' not in t:
    tip = (
        '<p class="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200" data-wms-plan-type-hint>'
        '<strong>类型分流（v1.0.1）</strong>：急件计划审核通过后生成 1 张物资采购待执行直采单，并可作领用依据；'
        '一般计划审核通过后进入待采物资并走完申请→供货→验收→入库，同时可作领用依据。'
        '</p>'
    )
    t = t.replace('<div id="main-content">', '<div id="main-content">\n    ' + tip, 1)
    p.write_text(t, encoding='utf-8')
    print('apply_plan_form tip added')
else:
    print('apply_plan_form tip exists')

# --- purchase_request tip ---
for name in ('purchase_request_list.html', 'purchase_request_form.html', 'purchase_pending_apply.html'):
    p = root / 'pages' / name
    t = p.read_text(encoding='utf-8')
    orig = t
    t = t.replace('急件计划', '一般计划')
    t = t.replace('来自急件', '来自一般计划')
    if name == 'purchase_request_list.html':
        t = t.replace(
            '采购申请',
            '采购申请',
            1,
        )
        if '一般计划待采' not in t and '<p class="mb-4 text-sm text-slate-500">' in t:
            t = re.sub(
                r'(<p class="mb-4 text-sm text-slate-500">)([^<]*)(</p>)',
                r'\1来源为<strong>一般计划</strong>待采物资，审核通过后可继续供货→验收→入库\3',
                t,
                count=1,
            )
    if t != orig:
        p.write_text(t, encoding='utf-8')
        print(f'{name} patched')
    else:
        print(f'{name} no change')

# --- pc_home ---
p = root / 'pages' / 'pc_home.html'
t = p.read_text(encoding='utf-8')
# Insert 急件待采购 card after 待采物资
if '急件待采购' not in t:
    old = '''          <a href="purchase_pending_list.html?tab=待申请" class="wms-dash-stat card">
            <div class="wms-dash-stat-top"><span class="wms-dash-stat-label">待采物资</span><i class="fa-solid fa-cart-shopping wms-dash-stat-icon"></i></div>
            <div class="wms-dash-stat-num">4</div>
            <span class="wms-dash-stat-link">查看列表 →</span>
          </a>'''
    new = '''          <a href="purchase_pending_list.html?tab=待申请" class="wms-dash-stat card">
            <div class="wms-dash-stat-top"><span class="wms-dash-stat-label">待采物资（一般）</span><i class="fa-solid fa-cart-shopping wms-dash-stat-icon"></i></div>
            <div class="wms-dash-stat-num">5</div>
            <span class="wms-dash-stat-link">一般计划待申请 →</span>
          </a>
          <a href="purchase_execute_list.html?tab=待执行" class="wms-dash-stat card">
            <div class="wms-dash-stat-top"><span class="wms-dash-stat-label">急件待采购</span><i class="fa-solid fa-bolt wms-dash-stat-icon text-amber-400"></i></div>
            <div class="wms-dash-stat-num text-amber-600">1</div>
            <span class="wms-dash-stat-link">物资采购待执行 →</span>
          </a>'''
    if old in t:
        t = t.replace(old, new)
        p.write_text(t, encoding='utf-8')
        print('pc_home updated')
    else:
        print('pc_home card pattern MISS')
else:
    print('pc_home already has 急件待采购')

# --- supply / acceptance source hint ---
for name in ('purchase_supply_list.html', 'warehouse_acceptance_list.html'):
    p = root / 'pages' / name
    t = p.read_text(encoding='utf-8')
    if 'data-wms-v101-source-hint' in t:
        print(f'{name} hint exists')
        continue
    hint = (
        '<p class="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200" data-wms-v101-source-hint>'
        '来源可辨：急件链路来自「物资采购」审核通过；一般链路来自「采购申请 JJSQ」审核通过。'
        '</p>'
    )
    t = t.replace('<div id="main-content">', '<div id="main-content">\n    ' + hint, 1)
    p.write_text(t, encoding='utf-8')
    print(f'{name} hint added')

print('ALL PATCHES DONE')
