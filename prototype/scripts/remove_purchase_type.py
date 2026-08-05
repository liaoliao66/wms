# -*- coding: utf-8 -*-
from pathlib import Path
import re

# --- list ---
p = Path('prototype/versions/v1.0.1/pages/purchase_request_list.html')
t = p.read_text(encoding='utf-8')
t = re.sub(
    r'<label class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">\s*'
    r'<span class="text-slate-500 shrink-0">采购类型</span>\s*'
    r'<select[^>]*>[\s\S]*?</select>\s*</label>',
    '',
    t,
    count=1,
)
t = t.replace(
    '<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">采购类型</th>',
    '',
)
# remove purchase type cell in each row
t = re.sub(
    r'<td class="px-4 py-3\.5 text-sm text-slate-700 whitespace-nowrap">'
    r'<span class="inline-flex rounded-lg px-2 py-0\.5 text-xs font-medium ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20">急件采购</span></td>',
    '',
    t,
)
t = t.replace(' data-list-filter-purchaseType="急件采购"', '')
t = t.replace(' 急件采购 ', ' ')
p.write_text(t, encoding='utf-8')
print('list ok', '采购类型' in t)

# --- form ---
p = Path('prototype/versions/v1.0.1/pages/purchase_request_form.html')
t = p.read_text(encoding='utf-8')
t = re.sub(
    r'<div><label class="mb-1\.5 block text-sm font-medium text-slate-700">采购类型</label>'
    r'<input type="text" value="[^"]*" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" /></div>\s*',
    '',
    t,
    count=1,
)
p.write_text(t, encoding='utf-8')
print('form ok', '采购类型' in t)

# --- pending apply ---
p = Path('prototype/versions/v1.0.1/pages/purchase_pending_apply.html')
t = p.read_text(encoding='utf-8')
t = re.sub(
    r'<div><label class="mb-1\.5 block text-sm font-medium text-slate-700">采购类型</label>'
    r'<input type="text" value="[^"]*" readonly class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" /></div>\s*',
    '',
    t,
    count=1,
)
t = re.sub(
    r'<div><dt class="text-slate-500">采购类型</dt><dd class="mt-0\.5 font-medium text-slate-900">[^<]*</dd></div>\s*',
    '',
    t,
    count=1,
)
p.write_text(t, encoding='utf-8')
print('apply ok', '采购类型' in t)
