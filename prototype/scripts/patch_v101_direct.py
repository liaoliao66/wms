# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path('prototype/versions/v1.0.1/pages')

# Remove 急件 plan rows from pending list (JJJH202606080001)
p = root / 'purchase_pending_list.html'
t = p.read_text(encoding='utf-8')
# remove tr blocks containing JJJH202606080001
pattern = re.compile(
    r'<tr class="border-t border-slate-100 hover:bg-slate-50/80"[^>]*data-pending-key="JJJH202606080001\|[^"]+"[\s\S]*?</tr>',
    re.M,
)
t2, n = pattern.subn('', t)
print('removed pending rows', n)
# renumber remaining seq cells roughly — leave as-is for prototype
t2 = t2.replace('共 6 条', f'共 {6-n} 条')
p.write_text(t2, encoding='utf-8')

# Patch purchase_execute_direct
p = root / 'purchase_execute_direct.html'
t = p.read_text(encoding='utf-8')
# tip + header rewrite
if 'data-wms-v101-direct-tip' not in t:
    tip = (
        '<p class="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200" data-wms-v101-direct-tip>'
        '<strong>急件直采约束</strong>：采购方式锁定直采；供应商<strong>有且仅有 1 个</strong>；提交后需走物资采购审核，通过后进入供货。'
        '</p>'
    )
    t = t.replace('<div data-wms-modal', tip + '\n    <div data-wms-modal', 1)

old_info = '''        <div class="wms-form-section md:col-span-2"><h3 class="wms-form-section-title">采购申请信息</h3></div>
        <div class="md:col-span-2 wms-execute-apply-info overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm">
      <tbody>
        <tr>
          <td class="w-32 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">申请单号</td>
          <td class="px-4 py-2.5 text-slate-800">CG202510001</td>
          <td class="w-32 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">采购方式</td>
          <td class="px-4 py-2.5 text-slate-800">直采</td>
        </tr>
        <tr class="border-t border-slate-200">
          <td class="bg-slate-50 px-4 py-2.5 font-medium text-slate-500">参考总额（元）</td>
          <td class="px-4 py-2.5 text-slate-800" colspan="3">100.00</td>
        </tr>
      </tbody>
    </table>
  </div>'''

new_info = '''        <div class="wms-form-section md:col-span-2"><h3 class="wms-form-section-title">来源计划 / 采购单信息</h3></div>
        <div class="md:col-span-2 wms-execute-apply-info overflow-hidden rounded-xl border border-slate-200">
    <table class="min-w-full text-sm">
      <tbody>
        <tr>
          <td class="w-36 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">采购单号</td>
          <td class="px-4 py-2.5 text-slate-800">WZCG202606090001</td>
          <td class="w-36 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">采购方式</td>
          <td class="px-4 py-2.5 text-slate-800">直采（锁定）</td>
        </tr>
        <tr class="border-t border-slate-200">
          <td class="bg-slate-50 px-4 py-2.5 font-medium text-slate-500">计划类型</td>
          <td class="px-4 py-2.5 text-slate-800">急件计划</td>
          <td class="bg-slate-50 px-4 py-2.5 font-medium text-slate-500">来源计划单号</td>
          <td class="px-4 py-2.5 text-slate-800">JJJH202606080001</td>
        </tr>
        <tr class="border-t border-slate-200">
          <td class="bg-slate-50 px-4 py-2.5 font-medium text-slate-500">参考总额（元）</td>
          <td class="px-4 py-2.5 text-slate-800" colspan="3">28,600.00</td>
        </tr>
      </tbody>
    </table>
  </div>'''

if old_info in t:
    t = t.replace(old_info, new_info)
    print('direct header ok')
else:
    print('direct header MISS')

# Remove second supplier row (seq 2)
t2, n = re.subn(
    r'<tr class="border-t border-slate-100" data-wms-quote-supplier-row>\s*'
    r'<td class="px-3 py-2 text-sm text-slate-600 whitespace-nowrap wms-quote-supplier-seq">2</td>[\s\S]*?</tr>',
    '',
    t,
    count=1,
)
print('removed supplier row2', n)
# Disable "是否中选" multi-supplier semantics — mark only one supplier, auto selected
t2 = t2.replace(
    '<option value="" disabled selected>请选择</option>\n    <option value="yes">已中选</option>\n    <option value="no">未中选</option>',
    '<option value="yes" selected>已中选（唯一供应商）</option>',
)
# Hide add-supplier UI if any — add note under nested table
t2 = t2.replace(
    '</tbody>\n        </table>\n        \n      </div>',
    '</tbody>\n        </table>\n        <p class="mt-2 text-xs text-slate-500">本期急件直采仅允许填写 <strong>1</strong> 个供应商，不可再增行。</p>\n      </div>',
)
p.write_text(t2, encoding='utf-8')
print('direct patched')
