# -*- coding: utf-8 -*-
from pathlib import Path

p = Path('prototype/versions/v1.0.1/pages/purchase_pending_select.html')
t = p.read_text(encoding='utf-8')
t = t.replace('应急防汛物资', '六月办公物资补充')
t = t.replace('六月设备配件', '设备配件补库')
t = t.replace(
    '从待采清单勾选物资，确认后进入采购申请',
    '仅展示<strong>一般计划</strong>待采物资，勾选后进入采购申请（急件不进待采）',
)
p.write_text(t, encoding='utf-8')
print('select', t.count('一般计划'), 'urgent', t.count('急件计划'))

p = Path('prototype/versions/v1.0.1/pages/purchase_pending_plan_detail.html')
t = p.read_text(encoding='utf-8')
t = t.replace('JJJH202606080001', 'JJJH202510001')
t = t.replace('防汛应急采购', '设备配件补库')
t = t.replace(
    'bg-amber-50 text-amber-700 ring-amber-600/20">急件计划</span>',
    'bg-slate-100 text-slate-700 ring-slate-600/10">一般计划</span>',
)
t = t.replace('>急件计划</dd>', '>一般计划</dd>')
t = t.replace('汛期临近，需尽快补齐防汛物资库存。', '抓斗备件库存不足，申请补库。')
p.write_text(t, encoding='utf-8')
print('detail urgent left', '急件计划' in t)

p = Path('prototype/versions/v1.0.1/pages/purchase_pending_apply.html')
t = p.read_text(encoding='utf-8')
t = t.replace('急件采购', '一般计划采购')
p.write_text(t, encoding='utf-8')
print('apply', t.count('一般计划采购'))
