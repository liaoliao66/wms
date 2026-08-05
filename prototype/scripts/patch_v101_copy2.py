# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path('prototype/versions/v1.0.1/pages')

p = root / 'apply_plan_form.html'
t = p.read_text(encoding='utf-8')
old = '急件计划审核通过后生成 1 张物资采购待执行直采单，并可作领用依据；一般计划审核通过后进入待采物资并走完申请→供货→验收→入库，同时可作领用依据。'
new = '急件：计划→物资采购→供货→验收；一般：计划→待采→采购申请→物资采购→供货→验收；二者均可作领用依据。'
if old in t:
    p.write_text(t.replace(old, new), encoding='utf-8')
    print('apply_plan_form ok')
else:
    print('apply_plan_form miss')

p = root / 'apply_plan_list.html'
t = p.read_text(encoding='utf-8')
a = '编制物资需求计划：<strong>急件</strong>审核通过→物资采购直采（并可领用）；<strong>一般</strong>审核通过→待采全流程（并可领用）'
b = '编制物资需求计划：<strong>急件</strong>→物资采购→供货验收；<strong>一般</strong>→待采→采购申请→物资采购→供货验收；均可领用'
if a in t:
    p.write_text(t.replace(a, b), encoding='utf-8')
    print('apply_plan_list ok')
else:
    print('apply_plan_list miss')

p = root / 'purchase_request_list.html'
t = p.read_text(encoding='utf-8')
t2, n = re.subn(
    r'(<p class="mb-4 text-sm text-slate-500">)(.*?)(</p>)',
    r'\1来源为<strong>一般计划</strong>待采；审核通过后<strong>自动生成物资采购单</strong>，再供货→验收（计划人+需求人）\3',
    t,
    count=1,
)
print('request_list', 'ok' if n else 'miss')
if n:
    p.write_text(t2, encoding='utf-8')

p = root / 'purchase_pending_list.html'
t = p.read_text(encoding='utf-8')
a = (
    '仅<strong>一般计划</strong>审核通过后按<strong>计划单号 + 物资编码</strong>生成待采记录（急件计划进「物资采购」，不进待采）；'
    '<strong>待申请</strong>可单条或批量发起采购申请，<strong>已申请</strong>不可重复申请'
)
b = (
    '仅<strong>一般计划</strong>生成待采；申请生成 JJSQ，审核通过后进入<strong>物资采购</strong>；急件不进待采。'
    '待申请可单条/批量申请，已申请不可重复'
)
if a in t:
    p.write_text(t.replace(a, b), encoding='utf-8')
    print('pending ok')
else:
    print('pending miss')

tip = (
    '来源可辨：急件/一般均经「物资采购」审核通过后供货；仓管点供货发起验收，'
    '<strong>计划人与需求人一起验收</strong>。'
)
for name in ('purchase_supply_list.html', 'warehouse_acceptance_list.html'):
    p = root / name
    t = p.read_text(encoding='utf-8')
    if 'data-wms-v101-source-hint' not in t:
        print(name, 'no hint')
        continue
    t2, n = re.subn(
        r'(<p class="mb-4 rounded-xl[^"]*" data-wms-v101-source-hint>)(.*?)(</p>)',
        r'\1' + tip + r'\3',
        t,
        count=1,
    )
    if n:
        p.write_text(t2, encoding='utf-8')
        print(name, 'updated')
    else:
        print(name, 'replace miss')

p = Path('prototype/versions/v1.0.1/index.html')
t = p.read_text(encoding='utf-8')
t = t.replace(
    '急件计划→物资采购直采；一般计划承接原急件待采全流程。',
    '急件：计划→物资采购→供货验收；一般：待采→申请→物资采购→供货验收。',
)
t = t.replace(
    '关联页已改：物资计划分流引导、一般计划待采、急件物资采购直采（无手工新建）。',
    '关联页：物资采购含急件+一般；已移除新增；供货后计划人与需求人共同验收。',
)
p.write_text(t, encoding='utf-8')
print('portal ok')
