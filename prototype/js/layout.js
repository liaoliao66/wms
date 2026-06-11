const WMS_TRANSACTION_SAMPLES = {
  RK202606090012: { no: 'RK202606090012', type: '入库', typeKey: 'inbound', materialCode: 'HC-00128', materialName: '安全帽', category: '耗材', qty: '200 顶', warehouse: '主仓库/A区', location: 'A-01', time: '2026-06-09 14:32', operator: '张仓管', relatedNo: 'YS202606090018', relatedLabel: '验收单号', sourceHref: 'warehouse_inbound_form.html', remark: '批量入库' },
  CK202606090008: { no: 'CK202606090008', type: '出库', typeKey: 'outbound', materialCode: 'ZC202606001', materialName: '笔记本电脑', category: '固定资产', qty: '1 台', warehouse: '主仓库/B区', location: 'B-03', time: '2026-06-09 11:20', operator: '李仓管', relatedNo: 'LY202606070002', relatedLabel: '领用单号', recipient: '王工', assetCode: 'ZC202606001', sourceHref: 'warehouse_outbound_fixed_form.html', remark: '—' },
  HK202606090003: { no: 'HK202606090003', type: '归还', typeKey: 'return', materialCode: 'LA-00456', materialName: '电钻', category: '类资产', qty: '1 台', warehouse: '主仓库/A区', location: 'A-02', time: '2026-06-08 16:45', operator: '王工', relatedNo: 'LY202605200008', relatedLabel: '领用单号', returnStatus: '完好', sourceHref: 'warehouse_return_like_form.html', remark: '按时归还' },
  TH202606030001: { no: 'TH202606030001', type: '退货', typeKey: 'refund', materialCode: 'DL-00234', materialName: '电缆 YJV-3×2.5', category: '类资产', qty: '100 m', warehouse: '主仓库/A区', location: 'A-01', time: '2026-06-03 10:15', operator: '张仓管', relatedNo: 'GH202605280002', relatedLabel: '供货单号', supplier: '华建物资有限公司', refundReason: '质量问题', sourceHref: 'warehouse_refund_like_form.html?refundKey=TH202606030001&mode=view', remark: '规格不符退供应商' },
};

const WMS_REQUISITION_RECORD_SAMPLES = {
  LY202510001: { no: 'LY202510001', name: '生产部备件领用', reason: '项目用料', plan: 'JH202509001 月度采购', status: '审核通过', applicant: '李四', dept: '生产部', applyTime: '2025-08-28', outboundNo: '—', outboundDate: '—', outboundQty: '—', materials: [{ code: 'GD001001-001', name: '抓斗', spec: '455', unit: '个', qty: '5' }, { code: 'GD001001-002', name: '料斗', spec: '455', unit: '个', qty: '10' }] },
  LY202510002: { no: 'LY202510002', name: '设备部工具领用', reason: '设备维修', plan: '—', status: '审核通过', applicant: '李四', dept: '设备部', applyTime: '2025-08-30', outboundNo: 'LY202510002-CK001', outboundDate: '2025-09-03', outboundQty: '10', materials: [{ code: 'GD001001-003', name: '螺丝刀', spec: '455', unit: '个', qty: '10' }] },
  LY202510003: { no: 'LY202510003', name: '设备部工具领用', reason: '日常办公', plan: '—', status: '审核通过', applicant: '王五', dept: '设备部', applyTime: '2025-08-31', outboundNo: 'LY202510003-CK001', outboundDate: '2025-09-03', outboundQty: '5', materials: [{ code: 'GD001001-004', name: '扳手', spec: '455', unit: '个', qty: '5' }] },
  LY202510004: { no: 'LY202510004', name: '维保部钢丝绳领用', reason: '项目用料', plan: 'JH202509002 维保计划', status: '审核通过', applicant: '赵六', dept: '维保部', applyTime: '2025-09-01', outboundNo: 'LY202510004-CK001', outboundDate: '2025-09-03', outboundQty: '100', materials: [{ code: 'GD001001-005', name: '钢丝绳', spec: '455', unit: 'm', qty: '100' }] },
  LY202510005: { no: 'LY202510005', name: '设备部工具领用', reason: '应急领用', plan: '—', status: '审核通过', applicant: '李四', dept: '设备部', applyTime: '2025-07-18', outboundNo: 'LY202510005-CK001', outboundDate: '2025-07-20', outboundQty: '5', materials: [{ code: 'GD001001-006', name: '扳手', spec: '455', unit: '个', qty: '5' }] },
  LY202510006: { no: 'LY202510006', name: '设备部工具领用', reason: '日常办公', plan: '—', status: '审核通过', applicant: '王五', dept: '设备部', applyTime: '2025-07-12', outboundNo: 'LY202510006-CK001', outboundDate: '2025-07-15', outboundQty: '8', materials: [{ code: 'GD001001-007', name: '螺丝刀', spec: '455', unit: '个', qty: '8' }] },
};

const WMS_ACCEPTANCE_SUPPLY_SAMPLES = {
  GH2025001: { supplyNo: 'GH2025001', supplier: '科尼', supplierStatus: '正常', code: 'GD001001-001', name: '抓斗', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '10', pending: '0', supplied: '10', qualified: '10', unqualified: '0', accepted: '10' },
  GH2025002: { supplyNo: 'GH2025002', supplier: '上海佩纳', supplierStatus: '正常', code: 'GD001001-002', name: '料斗', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '10', pending: '0', supplied: '10', qualified: '10', unqualified: '0', accepted: '10' },
  GH2025003: { supplyNo: 'GH2025003', supplier: '河南蒲瑞', supplierStatus: '正常', code: 'GD001001-003', name: '钢丝绳', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: 'm', required: '100', pending: '50', supplied: '50', qualified: '50', unqualified: '0', accepted: '50' },
  GH2025004: { supplyNo: 'GH2025004', supplier: '江苏华能电子有限公司', supplierStatus: '正常', code: 'GD001001-004', name: '螺丝刀', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '20', pending: '10', supplied: '10', qualified: '9', unqualified: '1', accepted: '10' },
  GH2025005: { supplyNo: 'GH2025005', supplier: '宁波北仑君威有限公司', supplierStatus: '正常', code: 'GD001001-005', name: '扳手', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', required: '20', pending: '20', supplied: '0', qualified: '0', unqualified: '0', accepted: '0' },
};

const WMS_ACCEPTANCE_RECORDS = {
  GH2025001: [{ no: 'GH2025001-YS01', batchQty: '10', qualified: '10', unqualified: '0', date: '2025-11-15', warehouse: '张仓管', planner: '王工', status: '审核通过' }],
  GH2025002: [{ no: 'GH2025002-YS01', batchQty: '10', qualified: '10', unqualified: '0', date: '2025-11-16', warehouse: '李仓管', planner: '赵工', status: '审核通过' }],
  GH2025003: [{ no: 'GH2025003-YS01', batchQty: '50', qualified: '50', unqualified: '0', date: '2025-11-20', warehouse: '张仓管', planner: '王工', status: '审核中' }],
  GH2025004: [
    { no: 'GH2025004-YS01', batchQty: '10', qualified: '9', unqualified: '1', date: '2025-11-22', warehouse: '张仓管', planner: '王工', status: '审核通过', disposition: '换货', refundKey: '' },
    { no: 'GH2025004-YS02', batchQty: '10', qualified: '9', unqualified: '1', date: '2025-11-25', warehouse: '李仓管', planner: '赵工', status: '审核通过', disposition: '退货', refundKey: 'GH2025004-YS02-TH' },
  ],
  GH2025005: [],
};

const WMS_INBOUND_ACCEPT_SAMPLES = {
  'GH2025001-YS01': { acceptNo: 'GH2025001-YS01', supplyNo: 'GH2025001', acceptDate: '2025-08-08', supplier: '中铁1局', supplierStatus: '正常', contact: '张飞', phone: '134 5558 4564', code: 'GD001001-001', name: '抓斗', major: '资产-固定资产', minor: '设备-配件', spec: '4m³-Q345B', unit: '个', qualified: '10', inboundQty: '0', pendingQty: '10', materialType: 'fixed', inboundNo: '', inboundDate: '', status: '待入库', operator: '', department: '', remark: '', locations: [] },
  'GH2025003-YS01': { acceptNo: 'GH2025003-YS01', supplyNo: 'GH2025003', acceptDate: '2025-11-20', supplier: '河南蒲瑞', supplierStatus: '正常', contact: '李经理', phone: '138 0000 1234', code: 'LA-00456', name: '钢丝绳', major: '资产-类资产', minor: '防汛设备', spec: 'Φ18×100m', unit: 'm', qualified: '50', inboundQty: '30', pendingQty: '20', materialType: 'like', inboundNo: '', inboundDate: '', status: '部分入库', operator: '', department: '', remark: '', locations: [] },
  'GH2025004-YS01': { acceptNo: 'GH2025004-YS01', supplyNo: 'GH2025004', acceptDate: '2025-11-22', supplier: '江苏华能电子有限公司', supplierStatus: '正常', contact: '王工', phone: '139 1111 2233', code: 'LA-00456', name: '电钻', major: '资产-类资产', minor: '电动工具', spec: '650W', unit: '台', qualified: '9', inboundQty: '0', pendingQty: '9', materialType: 'like', inboundNo: '', inboundDate: '', status: '待入库', operator: '', department: '', remark: '', locations: [] },
  'GH2025006-YS01': { acceptNo: 'GH2025006-YS01', supplyNo: 'GH2025006', acceptDate: '2025-11-25', supplier: '鄂东办公用品', supplierStatus: '正常', contact: '陈经理', phone: '137 6666 7788', code: 'HC-00089', name: '打印纸 A4', major: '耗材-办公耗材', minor: '办公用纸', spec: 'A4/80g/500张', unit: '箱', qualified: '200', inboundQty: '0', pendingQty: '200', materialType: 'consumable', inboundNo: '', inboundDate: '', status: '待入库', operator: '', department: '', remark: '', locations: [] },
  'GH2025002-YS01': { acceptNo: 'GH2025002-YS01', supplyNo: 'GH2025002', acceptDate: '2025-11-16', supplier: '鄂东办公用品', supplierStatus: '正常', contact: '陈经理', phone: '137 6666 7788', code: 'HC-00128', name: '安全帽', major: '耗材-劳保耗材', minor: '安全防护', spec: '标准型', unit: '顶', qualified: '200', inboundQty: '200', pendingQty: '0', materialType: 'consumable', inboundNo: 'RK202509002', inboundDate: '2025-11-18', status: '已入库', operator: '李仓管', department: '物资管理部', remark: '首批入库完成', locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '200' }] },
};

const WMS_INBOUND_TYPE_LABELS = { fixed: '固定资产入库', like: '类资产入库', consumable: '耗材入库' };

const WMS_OUTBOUND_REQUISITION_SAMPLES = {
  'LY202606070002-L1': { lineKey: 'LY202606070002-L1', requisitionNo: 'LY202606070002', lineId: 'L1', reason: '施工现场临时用具', plan: '—', applicant: '王工', applicantDept: '工程部', applyTime: '2026-06-07', code: 'GD001001-005', name: '工程测量仪', major: '资产-固定资产', minor: '办公设备', spec: '全站仪 TS06', unit: '台', applyQty: '1', outboundQty: '0', pendingQty: '1', materialType: 'fixed', needReturn: true, outboundNo: '', outboundDate: '', status: '待出库', recipient: '王工', recipientDept: '工程部', operator: '', department: '', remark: '', assetCodes: [], locations: [] },
  'LY202606070003-L1': { lineKey: 'LY202606070003-L1', requisitionNo: 'LY202606070003', lineId: 'L1', reason: '设备维修', plan: '—', applicant: '李工', applicantDept: '设备部', applyTime: '2026-06-07', code: 'LA-00456', name: '电钻', major: '资产-类资产', minor: '电动工具', spec: '650W', unit: '台', applyQty: '3', outboundQty: '0', pendingQty: '3', materialType: 'like', needReturn: true, outboundNo: '', outboundDate: '', status: '待出库', recipient: '李工', recipientDept: '设备部', operator: '', department: '', remark: '', assetCodes: [], locations: [] },
  'LY202606070004-L1': { lineKey: 'LY202606070004-L1', requisitionNo: 'LY202606070004', lineId: 'L1', reason: '日常办公', plan: 'JH202606090001', applicant: '张三', applicantDept: '行政部', applyTime: '2026-06-08', code: 'HC-00089', name: '打印纸 A4', major: '耗材-办公耗材', minor: '办公用纸', spec: 'A4/80g/500张', unit: '箱', applyQty: '50', outboundQty: '0', pendingQty: '50', materialType: 'consumable', needReturn: false, outboundNo: '', outboundDate: '', status: '待出库', recipient: '张三', recipientDept: '行政部', operator: '', department: '', remark: '', assetCodes: [], locations: [] },
  'LY202606070005-L1': { lineKey: 'LY202606070005-L1', requisitionNo: 'LY202606070005', lineId: 'L1', reason: '项目用料', plan: 'JH202509002 维保计划', applicant: '赵六', applicantDept: '维保部', applyTime: '2026-06-06', code: 'LA-00457', name: '钢丝绳', major: '资产-类资产', minor: '防汛设备', spec: 'Φ18×100m', unit: 'm', applyQty: '100', outboundQty: '60', pendingQty: '40', materialType: 'like', needReturn: true, outboundNo: 'LY202606070005-CK001', outboundDate: '2026-06-08', status: '部分出库', recipient: '赵六', recipientDept: '维保部', operator: '李仓管', department: '物资管理部', remark: '首批出库', assetCodes: [], locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ002', level: '1层', qty: '60' }] },
  'LY202606010003-L1': { lineKey: 'LY202606010003-L1', requisitionNo: 'LY202606010003', lineId: 'L1', reason: '劳保发放', plan: '—', applicant: '张三', applicantDept: '工程部', applyTime: '2026-06-01', code: 'HC-00128', name: '安全帽', major: '耗材-劳保耗材', minor: '安全防护', spec: '标准型', unit: '顶', applyQty: '50', outboundQty: '50', pendingQty: '0', materialType: 'consumable', needReturn: false, outboundNo: 'CK202606010003', outboundDate: '2026-06-01', status: '已出库', recipient: '张三', recipientDept: '工程部', operator: '李仓管', department: '物资管理部', remark: '劳保发放完成', assetCodes: [], locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '50' }] },
};

const WMS_OUTBOUND_TYPE_LABELS = { fixed: '固定资产出库', like: '类资产出库', consumable: '耗材出库' };

const WMS_RETURN_PENDING_SAMPLES = {
  'LY202606010003-ZC202605012': { returnKey: 'LY202606010003-ZC202605012', requisitionNo: 'LY202606010003', outboundNo: 'CK202606010003', assetCode: 'ZC202605012', code: 'GD001001-005', name: '工程测量仪', major: '资产-固定资产', minor: '办公设备', spec: '全站仪 TS06', unit: '台', borrower: '张三', borrowerDept: '工程部', outboundDate: '2026-06-01', dueDate: '2026-06-15', extendedDueDate: '', outboundQty: '1', returnedQty: '0', pendingQty: '1', materialType: 'fixed', status: '待归还', returnNo: '', returnDate: '', condition: '', returnPerson: '', operator: '', department: '', remark: '', locations: [], requisitionName: '工程部测量仪领用', requisitionReason: '施工现场测量' },
  'LY202605200008-LA-00331': { returnKey: 'LY202605200008-LA-00331', requisitionNo: 'LY202605200008', outboundNo: 'LY202605200008-CK001', assetCode: 'LA-00331', code: 'LA-00330', name: '铝合金梯', major: '资产-类资产', minor: '登高工具', spec: '3m', unit: '架', borrower: '王工', borrowerDept: '工程部', outboundDate: '2026-05-20', dueDate: '2026-06-05', extendedDueDate: '2026-06-20', outboundQty: '1', returnedQty: '0', pendingQty: '1', materialType: 'like', status: '已延期', returnNo: '', returnDate: '', condition: '', returnPerson: '', operator: '', department: '', remark: '', locations: [], requisitionName: '工程部登高工具领用', requisitionReason: '设备检修' },
  'LY202606070003-L1': { returnKey: 'LY202606070003-L1', requisitionNo: 'LY202606070003', outboundNo: '—', assetCode: '', code: 'LA-00456', name: '电钻', major: '资产-类资产', minor: '电动工具', spec: '650W', unit: '台', borrower: '李工', borrowerDept: '设备部', outboundDate: '—', dueDate: '2026-07-09', extendedDueDate: '', outboundQty: '3', returnedQty: '0', pendingQty: '3', materialType: 'like', status: '待归还', returnNo: '', returnDate: '', condition: '', returnPerson: '', operator: '', department: '', remark: '', locations: [], requisitionName: '设备部工具领用', requisitionReason: '设备维修' },
  'LY202606070005-L1': { returnKey: 'LY202606070005-L1', requisitionNo: 'LY202606070005', outboundNo: 'LY202606070005-CK001', assetCode: '', code: 'LA-00457', name: '钢丝绳', major: '资产-类资产', minor: '防汛设备', spec: 'Φ18×100m', unit: 'm', borrower: '赵六', borrowerDept: '维保部', outboundDate: '2026-06-08', dueDate: '2026-08-08', extendedDueDate: '', outboundQty: '60', returnedQty: '40', pendingQty: '20', materialType: 'like', status: '部分归还', returnNo: 'HK20260608001', returnDate: '2026-06-10', condition: '完好', returnPerson: '赵六', operator: '李仓管', department: '物资管理部', remark: '首批归还', locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ002', level: '1层', qty: '40' }], requisitionName: '维保部钢丝绳领用', requisitionReason: '项目用料' },
  'LY202510006-GD007': { returnKey: 'LY202510006-GD007', requisitionNo: 'LY202510006', outboundNo: 'LY202510006-CK001', assetCode: 'GD001001-007', code: 'GD001001-007', name: '螺丝刀', major: '资产-类资产', minor: '设备-配件', spec: '455', unit: '个', borrower: '王五', borrowerDept: '设备部', outboundDate: '2025-07-15', dueDate: '2025-08-05', extendedDueDate: '', outboundQty: '8', returnedQty: '8', pendingQty: '0', materialType: 'like', status: '已归还', returnNo: 'HK20250715001', returnDate: '2025-08-04', condition: '完好', returnPerson: '王五', operator: '张仓管', department: '物资管理部', remark: '按时归还', locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '8' }], requisitionName: '设备部工具领用', requisitionReason: '日常办公' },
  'LY20260608001-LA-002': { returnKey: 'LY20260608001-LA-002', requisitionNo: 'LY20260608001', outboundNo: 'CK20260608001', assetCode: 'LA-00501', code: 'LA-00500', name: '手持对讲机', major: '资产-类资产', minor: '通讯设备', spec: 'UHF 400-470MHz', unit: '台', borrower: '张三', borrowerDept: '工程部', outboundDate: '2026-06-05', dueDate: '2026-06-20', extendedDueDate: '', outboundQty: '2', returnedQty: '2', pendingQty: '0', materialType: 'like', status: '待确认', returnNo: 'HK20260608002', returnDate: '2026-06-08', condition: '完好', returnPerson: '张三', operator: '张仓管', department: '物资管理部', remark: '设备检修完毕归还', thisReturnQty: '2', locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ002', level: '1层', qty: '2' }], requisitionName: '工程部对讲机领用', requisitionReason: '施工现场通讯' },
};

const WMS_RETURN_TYPE_LABELS = { fixed: '固定资产归还', like: '类资产归还' };

const WMS_REFUND_BY_ACCEPT = {
  'GH2025004-YS02': 'GH2025004-YS02-TH',
  'GH2025003-YS01': 'GH2025003-YS01-TH',
  'GH2025002-YS01': 'RK202509002-TH01',
};

const WMS_ACCEPTANCE_RECORD_DETAIL_SAMPLES = {
  'GH2025003-YS01': { no: 'GH2025003-YS01', batchNo: '1', batchQty: '30', qualified: '30', unqualified: '0', date: '2025-11-20', warehouse: '张仓管', planner: '王工', unqualifiedRemark: '—', disposition: '—', refundKey: '' },
  'GH2025004-YS02': { no: 'GH2025004-YS02', batchNo: '2', batchQty: '10', qualified: '9', unqualified: '1', date: '2025-11-25', warehouse: '李仓管', planner: '赵工', unqualifiedRemark: '刀头断裂，无法使用', disposition: '退货', refundKey: 'GH2025004-YS02-TH' },
};

const WMS_REFUND_PENDING_SAMPLES = {
  'GH2025004-YS02-TH': { refundKey: 'GH2025004-YS02-TH', scene: 'pre_inbound', refundNo: '', supplyNo: 'GH2025004', acceptNo: 'GH2025004-YS02', inboundNo: '—', supplier: '江苏华能电子有限公司', supplierStatus: '正常', contact: '王工', phone: '139 1111 2233', acceptDate: '2025-11-25', code: 'GD001001-004', name: '螺丝刀', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: '个', unqualifiedQty: '1', inboundQty: '0', refundedQty: '0', pendingQty: '1', materialType: 'fixed', status: '待退货', refundDate: '', refundReason: '', remark: '', operator: '', department: '', assetCodes: [], locations: [], createTime: '2025-11-25' },
  'GH2025003-YS01-TH': { refundKey: 'GH2025003-YS01-TH', scene: 'pre_inbound', refundNo: 'TH20251121001', supplyNo: 'GH2025003', acceptNo: 'GH2025003-YS01', inboundNo: '—', supplier: '河南蒲瑞', supplierStatus: '正常', contact: '李经理', phone: '138 0000 1234', acceptDate: '2025-11-20', code: 'GD001001-003', name: '钢丝绳', major: '资产-固定资产', minor: '设备-配件', spec: '455', unit: 'm', unqualifiedQty: '50', inboundQty: '0', refundedQty: '30', pendingQty: '20', materialType: 'like', status: '部分退货', refundDate: '2025-11-21', refundReason: '质量问题', remark: '首批已退 30m', operator: '张仓管', department: '物资管理部', assetCodes: [], locations: [], createTime: '2025-11-20' },
  'RK202509002-TH01': { refundKey: 'RK202509002-TH01', scene: 'post_inbound', refundNo: '', supplyNo: 'GH2025002', acceptNo: 'GH2025002-YS01', inboundNo: 'RK202509002', supplier: '鄂东办公用品', supplierStatus: '正常', contact: '陈经理', phone: '137 6666 7788', acceptDate: '2025-11-16', code: 'HC-00128', name: '安全帽', major: '耗材-劳保耗材', minor: '安全防护', spec: '标准型', unit: '顶', unqualifiedQty: '0', inboundQty: '200', refundedQty: '0', pendingQty: '50', materialType: 'consumable', status: '待退货', refundDate: '', refundReason: '', remark: '', operator: '', department: '', assetCodes: [], locations: [], createTime: '2026-06-01' },
  'TH202606030001': { refundKey: 'TH202606030001', scene: 'post_inbound', refundNo: 'TH202606030001', supplyNo: 'GH202605280002', acceptNo: '—', inboundNo: 'RK202606020015', supplier: '华建物资有限公司', supplierStatus: '正常', contact: '陈经理', phone: '138 8888 8821', acceptDate: '2026-05-28', code: 'DL-00234', name: '电缆 YJV-3×2.5', major: '资产-类资产', minor: '电气材料', spec: '3×2.5mm²', unit: 'm', unqualifiedQty: '0', inboundQty: '100', refundedQty: '100', pendingQty: '0', materialType: 'like', status: '已退货', refundDate: '2026-06-03', refundReason: '质量问题', remark: '规格不符，全量退供应商', operator: '张仓管', department: '物资管理部', assetCodes: [], locations: [{ warehouse: '主仓库', shelf: 'CK001001-HJ001', level: '1层', qty: '100' }], createTime: '2026-06-03' },
};

const WMS_REFUND_TYPE_LABELS = { fixed: '固定资产退货', like: '类资产退货', consumable: '耗材退货' };
const WMS_REFUND_SCENE_LABELS = { pre_inbound: '验收不合格退货', post_inbound: '在库退供应商' };

const WMS_SHELF_SAMPLES = {
  'CK001001-HJ001': { code: 'CK001001-HJ001', name: '1号货架', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ001', status: '启用', enabled: true },
  'CK001001-HJ002': { code: 'CK001001-HJ002', name: '2号货架', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ002', status: '启用', enabled: true },
  'CK001001-HJ003': { code: 'CK001001-HJ003', name: '3号货架', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ003', status: '启用', enabled: true },
  'CK001001-HJ004': { code: 'CK001001-HJ004', name: '4号货架（停用）', warehouse: '1号仓库', zone: 'A区', location: '1号仓库 / A区', status: '停用', enabled: false },
  'CK001001-HJ101': { code: 'CK001001-HJ101', name: 'B区1号货架', warehouse: '1号仓库', zone: 'B区', location: '1号仓库 / B区', inboundWarehouse: '主仓库', inboundShelf: 'CK001001-HJ101', status: '启用', enabled: true },
};

const WMS_ASSET_SAMPLES = {
  ZC202606001: { code: 'ZC202606001', materialCode: 'BG-00201', name: '笔记本电脑', location: '主仓库/B区/B-03', status: '在库', time: '2026-06-09 11:20' },
  ZC202606002: { code: 'ZC202606002', materialCode: 'BG-00201', name: '笔记本电脑', location: '主仓库/B区/B-03', status: '在库', time: '2026-06-09 11:20' },
  ZC202605012: { code: 'ZC202605012', materialCode: 'GC-20001', name: '工程测量仪', location: '主仓库/B区/B-01', status: '借出', time: '2026-06-01 09:00' },
  'GD001001-001': { code: 'GD001001-001', materialCode: 'GD001001-001', name: '扳手', location: '借出 · 设备部', status: '借出', time: '2025-08-09' },
  'GD001001-002': { code: 'GD001001-002', materialCode: 'GD001001-002', name: '螺丝刀', location: '借出 · 设备部', status: '借出', time: '2025-08-09' },
  'GD001001-003': { code: 'GD001001-003', materialCode: 'GD001001-003', name: '钳子', location: '借出 · 设备部', status: '借出', time: '2025-08-09' },
  'GD001001-005': { code: 'GD001001-005', materialCode: 'GD001001-005', name: '钢丝绳', location: '借出 · 维保部', status: '借出', time: '2025-08-09' },
  'GD001001-006': { code: 'GD001001-006', materialCode: 'GD001001-006', name: '扳手', location: '借出 · 设备部', status: '借出', time: '2025-07-20' },
  'GD001001-007': { code: 'GD001001-007', materialCode: 'GD001001-007', name: '螺丝刀', location: '已归还 · 设备部', status: '在库', time: '2025-08-04' },
};

const WMS_NAV = [
  { id: 'dashboard', label: '工作台', icon: 'fa-gauge-high', href: '../index.html' },
  { group: '物资台账' },
  { id: 'ledger_warehouse', label: '仓库台账', icon: 'fa-warehouse', href: 'ledger_warehouse.html' },
  { id: 'ledger_transaction', label: '出入库记录', icon: 'fa-right-left', href: 'ledger_transaction.html' },
  { group: '我的物资' },
  { id: 'mine_pending_pickup', label: '待领物资', icon: 'fa-hand-holding-box', href: 'mine_pending_pickup.html' },
  { id: 'mine_pending_return', label: '待还物资', icon: 'fa-rotate-left', href: 'mine_pending_return.html' },
  { group: '物资申请' },
  { id: 'apply_plan_list', label: '物资计划', icon: 'fa-clipboard-list', href: 'apply_plan_list.html' },
  { id: 'apply_requisition_list', label: '领用申请', icon: 'fa-file-signature', href: 'apply_requisition_list.html' },
  { group: '采购管理' },
  { id: 'purchase_pending_list', label: '待采物资', icon: 'fa-cart-shopping', href: 'purchase_pending_list.html' },
  { id: 'purchase_request_list', label: '采购申请', icon: 'fa-file-invoice', href: 'purchase_request_list.html' },
  { id: 'purchase_execute_list', label: '物资采购', icon: 'fa-bag-shopping', href: 'purchase_execute_list.html' },
  { id: 'purchase_supply_list', label: '供应商供货单', icon: 'fa-truck', href: 'purchase_supply_list.html' },
  { group: '物资管理' },
  { id: 'warehouse_pending_check', label: '待验物资', icon: 'fa-hourglass-half', href: 'warehouse_pending_check.html' },
  { id: 'warehouse_acceptance_list', label: '物资验收', icon: 'fa-clipboard-check', href: 'warehouse_acceptance_list.html' },
  { id: 'warehouse_inbound_list', label: '物资入库', icon: 'fa-arrow-down-to-bracket', href: 'warehouse_inbound_list.html' },
  { id: 'warehouse_outbound_list', label: '物资出库', icon: 'fa-arrow-up-from-bracket', href: 'warehouse_outbound_list.html' },
  { id: 'warehouse_return_list', label: '物资归还', icon: 'fa-undo', href: 'warehouse_return_list.html' },
  { id: 'warehouse_refund_list', label: '物资退货', icon: 'fa-box-open', href: 'warehouse_refund_list.html' },
  { group: '供应商管理' },
  { id: 'supplier_list', label: '供应商列表', icon: 'fa-building', href: 'supplier_list.html' },
  { id: 'supplier_eval_list', label: '供应商评价', icon: 'fa-star', href: 'supplier_eval_list.html' },
  { group: '基础配置' },
  { id: 'config_warehouse', label: '仓库配置', icon: 'fa-sitemap', href: 'config_warehouse.html' },
  { id: 'config_category', label: '分类管理', icon: 'fa-tags', href: 'config_category.html' },
  { id: 'config_unit_list', label: '计量单位', icon: 'fa-ruler', href: 'config_unit_list.html' },
  { id: 'config_material_catalog', label: '物资清单', icon: 'fa-list', href: 'config_material_catalog.html' },
  { id: 'config_acceptance_standard', label: '验收标准', icon: 'fa-clipboard-check', href: 'config_acceptance_standard.html' },
  { id: 'config_eval_weight', label: '评价设置', icon: 'fa-sliders', href: 'config_eval_weight.html' },
  { id: 'config_location_list', label: '使用地点', icon: 'fa-map-pin', href: 'config_location_list.html' },
  { group: '系统' },
  { id: 'system_workflow', label: '流程配置', icon: 'fa-diagram-project', href: 'system_workflow.html' },
];

function renderSidebar(activeId, basePath) {
  const prefix = basePath || '';
  return WMS_NAV.map(item => {
    if (item.group) {
      return `<div class="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">${item.group}</div>`;
    }
    const href = item.href.startsWith('../') ? item.href : prefix + item.href;
    const active = item.id === activeId ? 'active' : '';
    return `<a href="${href}" class="nav-item ${active} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 mb-0.5">
      <i class="fa-solid ${item.icon} w-4 text-center opacity-70"></i>${item.label}
    </a>`;
  }).join('');
}

function initLayout() {
  const root = document.body;
  const activeId = root.dataset.page || 'dashboard';
  const title = root.dataset.title || '工作台';
  const breadcrumb = root.dataset.breadcrumb || title;
  const isIndex = root.dataset.index === 'true';
  const pagesPrefix = isIndex ? 'pages/' : '';

  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const contentHtml = mainContent.innerHTML;
  mainContent.remove();

  const shell = document.createElement('div');
  shell.className = 'flex h-screen overflow-hidden bg-slate-50 wms-app-shell';
  shell.innerHTML = `
    <aside class="glass-sidebar flex w-64 shrink-0 flex-col border-r border-slate-200/80">
      <div class="flex h-16 items-center gap-3 border-b border-slate-200/80 px-5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-bold">W</div>
        <div>
          <div class="text-sm font-semibold text-slate-900">物资管理系统</div>
          <div class="text-xs text-slate-500">黄冈武穴 · V1.0</div>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto px-3 py-4">${renderSidebar(activeId, pagesPrefix)}</nav>
      <div class="border-t border-slate-200/80 p-4">
        <a href="${isIndex ? 'pages/prototype_map.html' : 'prototype_map.html'}" class="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-slate-100">
          <i class="fa-solid fa-table-cells"></i> 原型页面目录
        </a>
      </div>
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="glass-sidebar flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-6">
        <div>
          <div class="text-xs text-slate-500">${breadcrumb}</div>
          <h1 class="text-lg font-semibold text-slate-900">${title}</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative hidden md:block">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="search" placeholder="搜索物资、单号…" class="w-64 rounded-xl border border-slate-200 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400" />
          </div>
          <button class="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <i class="fa-solid fa-bell"></i>
            <span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500"></span>
          </button>
          <div class="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-1.5 border border-slate-200">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64&q=80" class="h-8 w-8 rounded-lg object-cover" alt="用户头像" />
            <div class="text-sm"><span class="font-medium text-slate-800">Admin</span><div class="text-xs text-slate-500">仓库管理员</div></div>
          </div>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-7xl">${contentHtml}</div>
      </main>
    </div>
  `;
  document.body.prepend(shell);

  initModal(root, title, contentHtml);
  initWarehouseConfig(root);
  initCategoryConfig(root);
  initAcceptanceStandard(root);
  initLedgerWarehouse(root);
  initAssetQrActions(root);
  initWarehouseLocQr(root);
  initAssetPageFromQuery(root);
  initShelfQrPageFromQuery(root);
  initShelfFormFromQuery(root);
  initInboundLocScan(root);
  initTransactionPageFromQuery(root);
  initRequisitionRecordFromQuery(root);
  initAcceptanceFromQuery(root);
  initSupplyCompleteFromQuery(root);
  initInboundFromQuery(root);
  initInboundSuccessFromQuery(root);
  initOutboundFromQuery(root);
  initOutboundSuccessFromQuery(root);
  initOutboundSelectAsset(root);
  initReturnFromQuery(root);
  initReturnConfirmFromQuery(root);
  initReturnScrapFromQuery(root);
  initReturnSuccessFromQuery(root);
  initRefundFromQuery(root);
  initRefundSuccessFromQuery(root);
  initRefundSelectAsset(root);
  initAcceptanceRecordDetailFromQuery(root);
  initMaterialForm(root);
  initMaterialFormFromQuery(root);
  initMaterialCatalogSidebar(root);
  initMaterialCatalog(root);
  initMaterialPicker(root);
  initListToolbar(root);
  initLocationList(root);
  initLocationForm(root);
  initLocationFormFromQuery(root);
  initSupplierEvalForm(root);
  initPurchasePendingApply(root);
  initPurchaseRequestFromQuery(root);
  initRequisitionForm(root);
  initAcceptanceFormInteraction(root);
  initSupplierEvalSelect(root);
  initSupplierDetail(root);
  initEvalConfig(root);
}

const WMS_MATERIAL_MINORS = {
  '资产-固定资产': ['办公电脑', '设备-配件'],
  '资产-类资产': ['电动工具', '防汛设备'],
  '耗材-办公耗材': ['办公用纸', '办公文具'],
  '耗材-生产耗材': ['设备-配件'],
  '耗材-劳保耗材': ['安全防护'],
};

const WMS_MATERIAL_TYPE_BADGES = {
  fixed: '<span class="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200/80">固定资产</span>',
  like: '<span class="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200/80">类资产</span>',
  consumable: '<span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/80">耗材</span>',
};

const WMS_MATERIAL_MAJORS_BY_TYPE = {
  fixed: ['资产-固定资产'],
  like: ['资产-类资产'],
  consumable: ['耗材-办公耗材', '耗材-生产耗材', '耗材-劳保耗材'],
};

const WMS_MATERIAL_FORM_SAMPLES = {
  'GD001001-001': { type: 'fixed', major: '资产-固定资产', minor: '设备-配件', name: '抓斗', spec: '4m³-Q345B', mainUnit: '个', auxUnit: '箱', price: '10000.00', returnNeed: '需要' },
  'LA-00456': { type: 'like', major: '资产-类资产', minor: '电动工具', name: '电钻', spec: '工业级', mainUnit: '台', price: '680.00', safeStock: '10', minStock: '5', maxStock: '20' },
  'HC-00089': { type: 'consumable', major: '耗材-办公耗材', minor: '办公用纸', name: '打印纸 A4', spec: '70g/500张', mainUnit: '箱', price: '120.00', safeStock: '100', minStock: '50', maxStock: '300' },
  'GD001001-006': { type: 'consumable', major: '耗材-生产耗材', minor: '设备-配件', name: '润滑油', spec: 'CD 15W-40', mainUnit: '桶', auxUnit: '箱', price: '10000.00', safeStock: '50', minStock: '20', maxStock: '200' },
};

function initMaterialFormFromQuery(root) {
  const scope = document.querySelector('.wms-modal-backdrop') || root;
  const form = scope.querySelector('[data-wms-material-form]');
  if (!form || form.dataset.wmsQueryApplied) return;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const mode = params.get('mode');
  const type = params.get('type');

  if (mode === 'edit' && code && WMS_MATERIAL_FORM_SAMPLES[code]) {
    const s = WMS_MATERIAL_FORM_SAMPLES[code];
    form.dataset.wmsQueryApplied = '1';
    form.dispatchEvent(new CustomEvent('wms-material-prefill', { detail: { ...s, code } }));
    return;
  }

  if (type) {
    form.dataset.wmsQueryApplied = '1';
    form.dispatchEvent(new CustomEvent('wms-material-prefill', { detail: { type } }));
  }
}

function applyMaterialFormPrefill(form, d) {
  const setVal = (sel, val) => { const el = form.querySelector(sel); if (el && val !== undefined) el.value = val; };
  if (d.code && d.code !== '系统自动生成') {
    const codeInput = form.querySelector('input[readonly]');
    if (codeInput) codeInput.value = d.code;
  }
  const inputs = [...form.querySelectorAll('input[type="text"]:not([readonly]), input[type="number"]')];
  const nameInput = inputs.find(el => el.closest('div')?.querySelector('label')?.textContent?.includes('物资名称'));
  const specInput = inputs.find(el => el.closest('div')?.querySelector('label')?.textContent?.includes('规格型号'));
  const priceInput = form.querySelector('input[type="number"]');
  if (d.name && nameInput) nameInput.value = d.name;
  if (d.spec && specInput) specInput.value = d.spec;
  if (d.price && priceInput) priceInput.value = d.price;
  setVal('[data-wms-material-safe]', d.safeStock);
  setVal('[data-wms-material-min]', d.minStock);
  setVal('[data-wms-material-max]', d.maxStock);
  if (d.returnNeed) {
    form.querySelectorAll('[data-wms-material-return]').forEach(r => { r.checked = r.value === d.returnNeed; });
  }
  const mainUnit = form.querySelector('[data-wms-material-unit="主计量单位"]');
  const auxUnit = form.querySelector('[data-wms-material-unit="辅计量单位"]');
  if (d.mainUnit && mainUnit) {
    const match = [...mainUnit.options].find(o => o.dataset.symbol === d.mainUnit);
    if (match) mainUnit.value = match.value;
  }
  if (d.auxUnit && auxUnit) {
    const match = [...auxUnit.options].find(o => o.dataset.symbol === d.auxUnit);
    if (match) auxUnit.value = match.value;
  }
}

function initMaterialForm(root) {
  const scope = document.querySelector('.wms-modal-backdrop') || root;
  const form = scope.querySelector('[data-wms-material-form]');
  if (!form) return;

  const majorSelect = form.querySelector('select[data-wms-material-major]');
  const minorSelect = form.querySelector('select[data-wms-material-minor]');
  const typeTabs = form.querySelectorAll('[data-wms-material-type-tab]');
  const returnSection = form.querySelector('[data-wms-material-business-return]');
  const stockSection = form.querySelector('[data-wms-material-business-stock]');
  if (!majorSelect) return;

  function setActiveTypeTab(matType) {
    form.dataset.materialType = matType;
    typeTabs.forEach(tab => {
      const on = tab.getAttribute('data-wms-material-type-tab') === matType;
      tab.classList.toggle('bg-slate-900', on);
      tab.classList.toggle('text-white', on);
      tab.classList.toggle('bg-white', !on);
      tab.classList.toggle('text-slate-600', !on);
      tab.classList.toggle('ring-1', !on);
      tab.classList.toggle('ring-slate-200', !on);
      tab.classList.toggle('hover:bg-slate-50', !on);
    });
    returnSection?.classList.toggle('hidden', matType !== 'fixed');
    stockSection?.classList.toggle('hidden', matType !== 'like' && matType !== 'consumable');
  }

  function fillMajors(matType, selectedMajor = '') {
    const majors = WMS_MATERIAL_MAJORS_BY_TYPE[matType] || WMS_MATERIAL_MAJORS_BY_TYPE.fixed;
    majorSelect.innerHTML = '<option value="" disabled selected>请选择</option>' +
      majors.map(m => `<option value="${m}"${selectedMajor === m ? ' selected' : ''}>${m}</option>`).join('');
    if (selectedMajor && majors.includes(selectedMajor)) majorSelect.value = selectedMajor;
  }

  function fillMinors(major, selectedMinor = '') {
    if (!minorSelect) return;
    const opts = WMS_MATERIAL_MINORS[major] || ['设备-配件'];
    minorSelect.innerHTML = '<option value="" disabled selected>请选择</option>' +
      opts.map(o => `<option value="${o}"${selectedMinor === o ? ' selected' : ''}>${o}</option>`).join('');
    if (selectedMinor && opts.includes(selectedMinor)) minorSelect.value = selectedMinor;
  }

  function switchType(matType, prefill = {}) {
    setActiveTypeTab(matType);
    fillMajors(matType, prefill.major || '');
    const major = prefill.major || majorSelect.value || WMS_MATERIAL_MAJORS_BY_TYPE[matType][0];
    fillMinors(major, prefill.minor || '');
    applyMaterialFormPrefill(form, prefill);
  }

  typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchType(tab.getAttribute('data-wms-material-type-tab') || 'fixed');
    });
  });
  majorSelect.addEventListener('change', () => fillMinors(majorSelect.value));
  form.addEventListener('wms-material-prefill', (e) => {
    const d = e.detail || {};
    switchType(d.type || form.dataset.materialType || 'fixed', d);
  });

  switchType(form.dataset.materialType || 'fixed');
}

const WMS_LOCATION_SAMPLES = {
  '001': { code: '001', name: '1号楼', region: 'work', remark: '', enabled: true },
  '002': { code: '002', name: '2号楼', region: 'work', remark: '', enabled: true },
  '003': { code: '003', name: '3号楼', region: 'work', remark: '', enabled: true },
  '003001': { code: '003001', name: '1层', region: 'work', parentCode: '003', parentName: '3号楼', remark: '', enabled: true },
  '101': { code: '101', name: '行政楼', region: 'office', remark: '', enabled: true },
  '101001': { code: '101001', name: '2层', region: 'office', parentCode: '101', parentName: '行政楼', remark: '', enabled: true },
  '102': { code: '102', name: '会议室楼', region: 'office', remark: '', enabled: false },
};

function showLocationToast(message) {
  const toast = document.getElementById('wms-location-toast') || document.getElementById('wms-material-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showLocationToast._t);
  showLocationToast._t = setTimeout(() => toast.classList.add('hidden'), 2200);
}

function setListTabStyles(tabBtns, activeTab, attr = 'data-wms-list-tab') {
  tabBtns.forEach(btn => {
    const on = btn.getAttribute(attr) === activeTab;
    btn.classList.toggle('bg-slate-900', on);
    btn.classList.toggle('text-white', on);
    btn.classList.toggle('bg-white', !on);
    btn.classList.toggle('text-slate-600', !on);
    btn.classList.toggle('ring-1', !on);
    btn.classList.toggle('ring-slate-200', !on);
    btn.classList.toggle('hover:bg-slate-50', !on);
  });
}

function initListToolbar(root) {
  document.querySelectorAll('[data-wms-list-page]:not([data-wms-location-page])').forEach(pageEl => {
    const tbody = pageEl.querySelector('[data-wms-list-tbody]') || pageEl.querySelector('tbody');
    if (!tbody) return;

    const searchInput = pageEl.querySelector('[data-wms-list-search]');
    const searchClear = pageEl.querySelector('[data-wms-list-search-clear]');
    const resetBtn = pageEl.querySelector('[data-wms-list-reset]');
    const countEl = pageEl.querySelector('[data-wms-list-count]');
    const emptyEl = pageEl.querySelector('[data-wms-list-empty]');
    const tableWrap = pageEl.querySelector('[data-wms-list-table-wrap]');
    const tabContainer = pageEl.querySelector('[data-wms-list-tabs]');
    const tabBtns = tabContainer ? [...tabContainer.querySelectorAll('[data-wms-list-tab]')] : [];
    const filterSelects = [...pageEl.querySelectorAll('[data-wms-list-filter]')];
    const rows = () => [...tbody.querySelectorAll('[data-wms-list-row]')];

    let activeTab = tabBtns[0]?.getAttribute('data-wms-list-tab') || '';
    const defaultTab = activeTab;
    const hasAllTab = defaultTab === '全部';

    function rowVisible(row) {
      const q = (searchInput?.value || '').trim().toLowerCase();
      if (q && !(row.dataset.listSearch || '').includes(q)) return false;

      if (tabBtns.length && activeTab) {
        if (!(hasAllTab && activeTab === '全部')) {
          if ((row.dataset.listTab || '') !== activeTab) return false;
        }
      }

      for (const sel of filterSelects) {
        const key = sel.getAttribute('data-wms-list-filter');
        const val = sel.value;
        if (val && val !== '全部') {
          const rowVal = row.getAttribute(`data-list-filter-${key}`) || '';
          if (rowVal !== val) return false;
        }
      }
      return true;
    }

    function updateClearBtn() {
      if (!searchClear || !searchInput) return;
      const has = !!searchInput.value.trim();
      searchClear.classList.toggle('hidden', !has);
      searchClear.classList.toggle('inline-flex', has);
    }

    function hasActiveFilters() {
      const q = (searchInput?.value || '').trim();
      const tabChanged = tabBtns.length && activeTab !== defaultTab;
      const filtersChanged = filterSelects.some(s => s.value && s.value !== '全部');
      return !!(q || tabChanged || filtersChanged);
    }

    function updateResetBtn() {
      if (!resetBtn) return;
      const show = hasActiveFilters();
      resetBtn.classList.toggle('hidden', !show);
      resetBtn.classList.toggle('inline-flex', show);
    }

    function applyFilters() {
      let visible = 0;
      rows().forEach(row => {
        const show = rowVisible(row);
        row.classList.toggle('hidden', !show);
        if (show) visible += 1;
      });
      if (countEl) countEl.textContent = `共 ${visible} 条`;
      if (emptyEl) emptyEl.classList.toggle('hidden', visible > 0);
      if (tableWrap) tableWrap.classList.toggle('hidden', visible === 0 && rows().length > 0);
      updateClearBtn();
      updateResetBtn();
    }

    function resetFilters() {
      if (searchInput) searchInput.value = '';
      activeTab = defaultTab;
      setListTabStyles(tabBtns, activeTab);
      filterSelects.forEach(s => { s.selectedIndex = 0; });
      applyFilters();
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-wms-list-tab') || '';
        setListTabStyles(tabBtns, activeTab);
        applyFilters();
      });
    });
    searchInput?.addEventListener('input', applyFilters);
    searchClear?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
    filterSelects.forEach(s => s.addEventListener('change', applyFilters));
    resetBtn?.addEventListener('click', resetFilters);

    const urlTab = new URLSearchParams(window.location.search).get('tab');
    if (urlTab && tabBtns.some(b => b.getAttribute('data-wms-list-tab') === urlTab)) {
      activeTab = urlTab;
      setListTabStyles(tabBtns, activeTab);
    }

    applyFilters();
  });
}

function initPurchasePendingApply(root) {
  if (root.dataset.page !== 'purchase_pending_list') return;
  if (!(root.dataset.breadcrumb || '').includes('待采申请')) return;
  const params = new URLSearchParams(window.location.search);
  const planNo = params.get('planNo');
  const code = params.get('code');
  const name = params.get('name');
  const qty = params.get('qty');
  if (planNo) {
    document.querySelector('[data-purchase-plan-no]')?.replaceChildren(document.createTextNode(planNo));
  }
  if (code || name) {
    const label = [code, name].filter(Boolean).join(' · ');
    const el = document.querySelector('[data-purchase-pending-material]');
    if (el && label) el.textContent = label;
  }
  if (qty) {
    const table = document.querySelector('.wms-purchase-form table tbody tr');
    const qtyCell = table?.cells?.[9];
    if (qtyCell) qtyCell.textContent = qty;
  }
  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl && planNo) titleEl.textContent = `待采采购申请 · ${planNo}`;
}

function initRequisitionForm(root) {
  const form = document.querySelector('[data-wms-requisition-form]');
  if (!form || form.dataset.wmsRequisitionInit) return;
  form.dataset.wmsRequisitionInit = '1';

  const validateQty = (input) => {
    const type = input.dataset.materialType;
    if (type === 'fixed') return true;
    const max = Number(input.dataset.maxStock || 0);
    const val = Number(input.value);
    input.classList.remove('border-rose-400', 'ring-rose-200');
    if (!input.value || val < 1) {
      input.classList.add('border-rose-400', 'ring-rose-200');
      return false;
    }
    if (max > 0 && val > max) {
      input.value = String(max);
      showSupplyCompleteToast(`申请数量不能超过可用库存（${max}）`);
      return true;
    }
    return true;
  };

  form.querySelectorAll('[data-requisition-qty]').forEach(input => {
    input.addEventListener('change', () => validateQty(input));
    input.addEventListener('blur', () => validateQty(input));
  });

  form.querySelector('.wms-btn-primary')?.addEventListener('click', (e) => {
    const invalid = [...form.querySelectorAll('[data-requisition-qty]')].filter(inp => {
      const type = inp.dataset.materialType;
      return type !== 'fixed' && !validateQty(inp);
    });
    if (invalid.length) {
      e.preventDefault();
      showSupplyCompleteToast('类资产、耗材须填写申请领用数量');
    }
  });
}

function initPurchaseRequestFromQuery(root) {
  if (root.dataset.page !== 'purchase_request_list') return;
  const title = root.dataset.title || '';
  if (!title.includes('采购申请') && !title.includes('新建申请')) return;
  const params = new URLSearchParams(window.location.search);
  const requestNo = params.get('requestNo');
  const showSupply = params.get('showSupply') === '1';
  if (requestNo) {
    const noInput = document.querySelector('[data-purchase-request-no]');
    if (noInput) noInput.value = requestNo;
    const titleEl = document.getElementById('wms-modal-title');
    if (titleEl) titleEl.textContent = `${params.get('mode') === 'edit' ? '编辑' : '查看'}采购申请 · ${requestNo}`;
  }
  if (showSupply) {
    document.querySelector('[data-wms-purchase-supply-orders]')?.classList.remove('hidden');
  }
}

function initAcceptanceFormInteraction(root) {
  if (root.dataset.page !== 'warehouse_acceptance_list') return;
  if (!(root.dataset.title || '').includes('物资验收') && !(root.dataset.title || '').includes('执行验收')) return;
  const scope = document.querySelector('[data-wms-acceptance-form]');
  if (!scope) return;
  const disposition = scope.querySelector('[data-accept-disposition]');
  const unqualified = scope.querySelector('[data-accept-unqualified-qty]');
  const hint = scope.querySelector('[data-accept-refund-hint]');
  const syncHint = () => {
    const qty = Number(unqualified?.value || 0);
    const isRefund = disposition?.value === '退货';
    hint?.classList.toggle('hidden', !(qty > 0 && isRefund));
  };
  disposition?.addEventListener('change', syncHint);
  unqualified?.addEventListener('input', syncHint);
  syncHint();
}

function initLocationList(root) {
  const pageEl = document.querySelector('[data-wms-location-page]');
  if (!pageEl) return;

  const tbody = pageEl.querySelector('[data-wms-location-tbody]');
  const regionTabs = [...pageEl.querySelectorAll('[data-wms-list-region]')];
  const searchInput = pageEl.querySelector('[data-wms-list-search]');
  const statusFilter = pageEl.querySelector('[data-wms-list-filter="enabled"]');
  const countEl = pageEl.querySelector('[data-wms-list-count]');
  const resetBtn = pageEl.querySelector('[data-wms-list-reset]');
  const searchClear = pageEl.querySelector('[data-wms-list-search-clear]');
  const emptyEl = pageEl.querySelector('[data-wms-list-empty]');
  const tableWrap = pageEl.querySelector('[data-wms-list-table-wrap]');
  const addBtn = pageEl.querySelector('[data-wms-location-add]');
  let activeRegion = 'work';

  function rowMatches(row) {
    if (row.dataset.locationRegion !== activeRegion) return false;
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (q && !(row.dataset.locationName || '').toLowerCase().includes(q)) {
      const isChild = row.hasAttribute('data-wms-location-child');
      if (!isChild) {
        const hasVisibleChild = [...tbody.querySelectorAll(`[data-wms-location-child][data-location-parent="${row.dataset.locationCode}"]`)]
          .some(c => (c.dataset.locationName || '').toLowerCase().includes(q));
        if (!hasVisibleChild) return false;
      } else if (!(row.dataset.locationName || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    const status = statusFilter?.value || '全部';
    if (status === '启用' && row.dataset.listFilterEnabled !== '启用') return false;
    if (status === '停用' && row.dataset.listFilterEnabled !== '停用') return false;
    return true;
  }

  function updateClearBtn() {
    if (!searchClear || !searchInput) return;
    const has = !!searchInput.value.trim();
    searchClear.classList.toggle('hidden', !has);
    searchClear.classList.toggle('inline-flex', has);
  }

  function hasActiveFilters() {
    const q = (searchInput?.value || '').trim();
    const statusChanged = statusFilter && statusFilter.value !== '全部';
    return !!(q || statusChanged);
  }

  function updateResetBtn() {
    if (!resetBtn) return;
    const show = hasActiveFilters();
    resetBtn.classList.toggle('hidden', !show);
    resetBtn.classList.toggle('inline-flex', show);
  }

  function applyFilters() {
    if (!tbody) return;
    let visible = 0;
    tbody.querySelectorAll('[data-wms-location-row]').forEach(row => {
      const show = rowMatches(row);
      if (row.hasAttribute('data-wms-location-child')) {
        const parent = tbody.querySelector(`[data-wms-location-parent-row][data-location-code="${row.dataset.locationParent}"]`);
        const parentHidden = parent?.classList.contains('hidden') || parent?.dataset.locationRegion !== activeRegion;
        const parentCollapsed = parent?.dataset.locationCollapsed === '1';
        row.classList.toggle('hidden', !show || parentHidden || parentCollapsed);
      } else {
        row.classList.toggle('hidden', !show);
      }
      if (!row.classList.contains('hidden')) visible += 1;
    });
    if (countEl) countEl.textContent = `共 ${visible} 条`;
    if (emptyEl) emptyEl.classList.toggle('hidden', visible > 0);
    if (tableWrap) tableWrap.classList.toggle('hidden', visible === 0);
    updateClearBtn();
    updateResetBtn();
  }

  function setRegionTab(region) {
    activeRegion = region;
    setListTabStyles(regionTabs, region, 'data-wms-list-region');
    if (addBtn) addBtn.href = `config_location_form.html?mode=major&region=${region}`;
    applyFilters();
  }

  regionTabs.forEach(tab => {
    tab.addEventListener('click', () => setRegionTab(tab.getAttribute('data-wms-list-region') || 'work'));
  });
  searchInput?.addEventListener('input', applyFilters);
  statusFilter?.addEventListener('change', applyFilters);
  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    applyFilters();
  });
  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.selectedIndex = 0;
    applyFilters();
  });

  pageEl.querySelectorAll('[data-wms-location-tree-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-location-code');
      const parent = tbody?.querySelector(`[data-wms-location-parent-row][data-location-code="${code}"]`);
      if (!parent) return;
      const collapsed = parent.dataset.locationCollapsed === '1';
      parent.dataset.locationCollapsed = collapsed ? '0' : '1';
      btn.classList.toggle('is-expanded', collapsed);
      btn.setAttribute('aria-label', collapsed ? '收起' : '展开');
      applyFilters();
    });
  });

  pageEl.querySelectorAll('[data-wms-location-enabled]').forEach(input => {
    input.addEventListener('change', () => {
      const row = input.closest('[data-wms-location-row]');
      if (row) row.dataset.locationEnabled = input.checked ? '1' : '0';
      if (!input.checked && row?.hasAttribute('data-wms-location-parent-row')) {
        tbody?.querySelectorAll(`[data-wms-location-child][data-location-parent="${row.dataset.locationCode}"]`).forEach(child => {
          child.dataset.locationEnabled = '0';
          const childToggle = child.querySelector('[data-wms-location-enabled]');
          if (childToggle) childToggle.checked = false;
        });
        showLocationToast('父级已停用，子级地点同步停用');
      } else {
        showLocationToast(input.checked ? '地点已启用' : '地点已停用');
      }
      applyFilters();
    });
  });

  pageEl.querySelectorAll('[data-wms-location-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.confirm('确认删除该使用地点？删除后不可恢复。')) {
        const row = btn.closest('[data-wms-location-row]');
        const code = btn.getAttribute('data-location-code');
        tbody?.querySelectorAll(`[data-wms-location-child][data-location-parent="${code}"]`).forEach(c => c.remove());
        row?.remove();
        applyFilters();
        showLocationToast('已删除');
      }
    });
  });

  setRegionTab('work');
}

function initLocationFormFromQuery(root) {
  const scope = document.querySelector('.wms-modal-backdrop') || root;
  const form = scope.querySelector('[data-wms-location-form]');
  if (!form || form.dataset.wmsQueryApplied) return;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const mode = params.get('mode') || 'major';
  const parent = params.get('parent');
  const parentName = params.get('parentName');
  const region = params.get('region') || 'work';

  if (code && WMS_LOCATION_SAMPLES[code]) {
    const s = WMS_LOCATION_SAMPLES[code];
    form.dataset.wmsQueryApplied = '1';
    const nameInput = form.querySelector('[data-wms-location-name]');
    const remarkInput = form.querySelector('[data-wms-location-remark]');
    const codeInput = form.querySelector('input[readonly]');
    if (codeInput) codeInput.value = s.code;
    if (nameInput) nameInput.value = s.name;
    if (remarkInput) remarkInput.value = s.remark || '';
    const enabledInput = form.querySelector('[data-wms-location-form-enabled]');
    if (enabledInput) enabledInput.checked = s.enabled !== false;
    if (s.parentName) {
      const parentInput = form.querySelector('[data-wms-location-parent-name]');
      if (parentInput) parentInput.value = s.parentName;
    }
    document.getElementById('wms-modal-title')?.replaceChildren(document.createTextNode(
      mode === 'view' ? '查看使用地点' : '编辑使用地点'
    ));
    return;
  }

  if (mode === 'child' && parent) {
    form.dataset.wmsQueryApplied = '1';
    const parentInput = form.querySelector('[data-wms-location-parent-name]');
    if (parentInput) parentInput.value = parentName ? decodeURIComponent(parentName) : parent;
    document.getElementById('wms-modal-title')?.replaceChildren(document.createTextNode('添加子级地点'));
    return;
  }

  if (mode === 'major' && region) {
    form.dataset.wmsQueryApplied = '1';
    const regionSelect = form.querySelector('[data-wms-location-region]');
    const label = region === 'office' ? '办公区' : '作业区';
    if (regionSelect) regionSelect.value = label;
  }
}

function initLocationForm(root) {
  const scope = document.querySelector('.wms-modal-backdrop') || root;
  const form = scope.querySelector('[data-wms-location-form]');
  if (!form) return;

  form.querySelector('[data-wms-location-save]')?.addEventListener('click', () => {
    showLocationToast('已保存');
    setTimeout(() => { window.location.href = 'config_location_list.html'; }, 600);
  });
}

function showMaterialToast(message) {
  const toast = document.getElementById('wms-material-toast') || document.getElementById('wms-qr-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showMaterialToast._timer);
  showMaterialToast._timer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

function materialColTabFromType(matType) {
  if (matType === 'asset') return 'all';
  return matType || 'all';
}

function initMaterialCatalog(root) {
  const catalog = root.querySelector('[data-wms-material-catalog]');
  if (!catalog) return;

  const table = catalog.querySelector('[data-wms-material-table]');
  const rows = [...catalog.querySelectorAll('[data-material-row]')];
  const countEl = root.querySelector('[data-wms-material-count]');
  const searchInput = root.querySelector('[data-wms-material-search]');
  const enabledFilter = root.querySelector('[data-wms-filter-enabled]');
  const alertFilter = root.querySelector('[data-wms-filter-alert]');
  const returnFilter = root.querySelector('[data-wms-filter-return]');
  const sidebar = root.querySelector('[data-wms-material-sidebar]');

  function activeColTab() {
    return materialColTabFromType(sidebar?.dataset.materialType || 'all');
  }

  function colVisibleForTab(colEl, tab) {
    const tabs = (colEl.getAttribute('data-show-tabs') || '').split(',');
    return tab === 'all' || tabs.includes(tab);
  }

  function syncColumns() {
    const tab = activeColTab();
    table?.querySelectorAll('[data-material-col]').forEach(el => {
      el.classList.toggle('hidden', !colVisibleForTab(el, tab));
    });
  }

  function rowMatches(row) {
    const type = row.dataset.materialType;
    const enabled = row.dataset.materialEnabled;
    const alert = row.dataset.materialAlert || 'normal';
    const text = row.textContent.toLowerCase();
    const matType = sidebar?.dataset.materialType || 'all';
    if (matType === 'asset') {
      if (type !== 'fixed' && type !== 'like') return false;
    } else if (matType === 'fixed' || matType === 'like' || matType === 'consumable') {
      if (type !== matType) return false;
    }
    const categoryFilter = sidebar?.dataset.wmsFilterValue || '';
    if (categoryFilter) {
      const rowPath = row.dataset.materialCategoryPath || '';
      if (!rowPath.startsWith(categoryFilter)) return false;
    }
    if (enabledFilter?.value === 'true' && enabled !== 'true') return false;
    if (enabledFilter?.value === 'false' && enabled !== 'false') return false;
    if (alertFilter?.value !== 'all' && alert !== alertFilter.value) return false;
    if (returnFilter?.value !== 'all') {
      const returnCell = row.querySelector('[data-material-col="returnNeed"]');
      if (!returnCell?.textContent.includes(returnFilter.value)) return false;
    }
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (q && !text.includes(q)) return false;
    return true;
  }

  function applyFilters() {
    let visible = 0;
    let enabledCount = 0;
    rows.forEach(row => {
      const show = rowMatches(row);
      row.classList.toggle('hidden', !show);
      if (show) {
        visible += 1;
        if (row.dataset.materialEnabled === 'true') enabledCount += 1;
      }
    });
    if (countEl) countEl.textContent = `共 ${visible} 条 · 启用 ${enabledCount} 条`;
    syncColumns();
  }

  [enabledFilter, alertFilter, returnFilter].forEach(el => el?.addEventListener('change', applyFilters));
  searchInput?.addEventListener('input', applyFilters);
  sidebar?.addEventListener('wms-category-filter', applyFilters);
  applyFilters();

  root.querySelectorAll('.wms-material-disable').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-material-code');
      showMaterialToast(`物资 ${code} 已停用（原型演示）`);
      const row = btn.closest('[data-material-row]');
      if (row) {
        row.dataset.materialEnabled = 'false';
        const statusCell = row.querySelector('[data-material-col="enabled"]');
        if (statusCell) statusCell.innerHTML = '<span class="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200/80">停用</span>';
        btn.outerHTML = '<span class="text-slate-400 text-xs">已停用</span>';
        const editLink = row.querySelector('a[href*="mode=edit"]');
        editLink?.remove();
        const cb = row.querySelector('.wms-material-check');
        if (cb) { cb.checked = false; cb.disabled = true; }
        applyFilters();
      }
    });
  });

  root.querySelector('[data-wms-material-batch-disable]')?.addEventListener('click', () => {
    const checked = root.querySelectorAll('.wms-material-check:checked:not(:disabled)');
    if (!checked.length) {
      showMaterialToast('请先勾选要停用的物资');
      return;
    }
    checked.forEach(cb => {
      const row = cb.closest('[data-material-row]');
      const btn = row?.querySelector('.wms-material-disable');
      btn?.click();
    });
    showMaterialToast(`已批量停用 ${checked.length} 条物资（原型演示）`);
  });

  const addBtn = root.querySelector('[data-wms-material-add]');
  if (addBtn && sidebar) {
    addBtn.addEventListener('click', () => {
      const matType = sidebar.dataset.materialType || 'all';
      const params = new URLSearchParams();
      if (['fixed', 'like', 'consumable'].includes(matType)) params.set('type', matType);
      const q = params.toString();
      addBtn.href = q ? `config_material_form.html?${q}` : 'config_material_form.html';
    });
  }
}

function initMaterialCatalogSidebar(root) {
  const sidebar = root.querySelector('[data-wms-material-sidebar]');
  if (!sidebar) return;

  const breadcrumb = root.querySelector('[data-wms-material-breadcrumb]');
  const searchInput = sidebar.querySelector('[data-wms-material-tree-search]');
  const searchClear = sidebar.querySelector('[data-wms-material-tree-search-clear]');
  const emptyHint = sidebar.querySelector('[data-wms-material-tree-empty]');
  const treeRoot = sidebar.querySelector('[data-wms-material-tree]');
  const picks = () => [...sidebar.querySelectorAll('[data-wms-material-tree-pick]')];
  const branches = () => [...sidebar.querySelectorAll('[data-wms-material-tree-branch]')];

  function setExpanded(branch, open) {
    branch.dataset.wmsFilterExpanded = open ? 'true' : 'false';
    const toggle = branch.querySelector(':scope > div [data-wms-material-tree-toggle], :scope > [data-wms-material-tree-toggle]');
    const children = branch.querySelector(':scope > [data-wms-material-tree-children]');
    const t = branch.querySelector('[data-wms-material-tree-toggle]');
    t?.setAttribute('aria-expanded', open ? 'true' : 'false');
    t?.classList.toggle('is-expanded', open);
    children?.classList.toggle('hidden', !open);
  }

  function expandAncestors(el) {
    let node = el?.parentElement;
    while (node && node !== sidebar) {
      if (node.matches('[data-wms-material-tree-branch]')) setExpanded(node, true);
      node = node.parentElement;
    }
  }

  function updateBreadcrumb(val, label) {
    if (!breadcrumb) return;
    const text = val ? val.replace(/ \/ /g, ' › ') : '全部物资';
    breadcrumb.innerHTML = `当前分类：<span class="font-medium text-slate-800">${text}</span>`;
    breadcrumb.title = val || '全部物资';
  }

  function selectNode(btn) {
    const val = btn.getAttribute('data-wms-filter-value') || '';
    const label = btn.getAttribute('data-wms-filter-label') || '全部物资';
    const matType = btn.getAttribute('data-material-type') || 'all';
    sidebar.dataset.wmsFilterValue = val;
    sidebar.dataset.materialType = matType;
    picks().forEach(el => {
      el.classList.remove('is-active', 'bg-blue-50/80', 'text-blue-600');
      el.classList.add('text-slate-600');
    });
    btn.classList.add('is-active', 'bg-blue-50/80', 'text-blue-600');
    btn.classList.remove('text-slate-600');
    updateBreadcrumb(val, label);
    sidebar.dispatchEvent(new CustomEvent('wms-category-filter', { bubbles: true, detail: { value: val, label, matType } }));
  }

  function applySearch() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    searchClear?.classList.toggle('hidden', !q);
    if (!q) {
      sidebar.querySelectorAll('[data-wms-material-tree-item], [data-wms-material-tree-group]').forEach(el => el.classList.remove('hidden'));
      emptyHint?.classList.add('hidden');
      treeRoot?.classList.remove('hidden');
      return;
    }

    sidebar.querySelectorAll('[data-wms-material-tree-item], [data-wms-material-tree-group]').forEach(el => el.classList.add('hidden'));
    let visibleCount = 0;

    picks().forEach(btn => {
      const path = (btn.getAttribute('data-wms-filter-value') || '').toLowerCase();
      const text = (btn.getAttribute('data-wms-filter-label') || btn.textContent || '').toLowerCase();
      if (!path.includes(q) && !text.includes(q)) return;
      visibleCount += 1;
      const item = btn.closest('[data-wms-material-tree-item]') || btn.closest('[data-wms-material-tree-group]');
      item?.classList.remove('hidden');
      expandAncestors(item);
      let node = item?.parentElement;
      while (node && node !== sidebar) {
        if (node.matches('[data-wms-material-tree-branch], [data-wms-material-tree-group]')) node.classList.remove('hidden');
        node = node.parentElement;
      }
    });

    const hasResult = visibleCount > 0;
    emptyHint?.classList.toggle('hidden', hasResult);
    treeRoot?.classList.toggle('hidden', !hasResult);
  }

  picks().forEach(btn => btn.addEventListener('click', () => selectNode(btn)));

  sidebar.querySelectorAll('[data-wms-material-tree-toggle]').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const branch = toggle.closest('[data-wms-material-tree-branch]');
      if (!branch) return;
      setExpanded(branch, branch.dataset.wmsFilterExpanded !== 'true');
    });
  });

  searchInput?.addEventListener('input', applySearch);
  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    applySearch();
    searchInput?.focus();
  });
}

function initMaterialPicker(root) {
  const picker = root.querySelector('[data-wms-material-picker]');
  if (!picker) return;

  const sidebar = picker.querySelector('[data-wms-material-sidebar]');
  const tableRows = [...picker.querySelectorAll('[data-wms-picker-row]')];
  const searchInput = picker.querySelector('[data-wms-picker-search]');
  const searchClear = picker.querySelector('[data-wms-picker-search-clear]');
  const countEl = picker.querySelector('[data-wms-picker-count]');

  function applyFilter() {
    const matType = sidebar?.dataset.materialType || 'all';
    const categoryFilter = sidebar?.dataset.wmsFilterValue || '';
    const q = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;
    tableRows.forEach(row => {
      const type = row.dataset.materialType;
      let show = true;
      if (matType === 'asset') {
        if (type !== 'fixed' && type !== 'like') show = false;
      } else if (matType === 'fixed' || matType === 'like' || matType === 'consumable') {
        if (type !== matType) show = false;
      }
      const rowPath = row.dataset.materialCategoryPath || '';
      if (categoryFilter && !rowPath.startsWith(categoryFilter)) show = false;
      if (q && !row.textContent.toLowerCase().includes(q)) show = false;
      row.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    if (countEl) countEl.textContent = `共 ${visible} 条可选物资`;
  }

  sidebar?.addEventListener('wms-category-filter', applyFilter);
  searchInput?.addEventListener('input', () => {
    searchClear?.classList.toggle('hidden', !(searchInput.value || '').trim());
    applyFilter();
  });
  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchClear.classList.add('hidden');
    applyFilter();
    searchInput?.focus();
  });
  applyFilter();
}

function initCategoryConfig(root) {
  const layout = root.querySelector('.wms-category-layout');
  if (!layout) return;

  const majorNodes = layout.querySelectorAll('.wms-tree-node--major');
  const panels = layout.querySelectorAll('[data-wms-category-panel]');
  const addBtn = layout.querySelector('[data-wms-category-add]');

  const panelMeta = {
    fixed: { addHref: 'config_category_sub_fixed.html', title: '固定资产（ZC-GD）' },
    like: { addHref: 'config_category_sub_like.html', title: '类资产（LA-ZC）' },
    consumable: { addHref: 'config_category_sub_consumable.html', title: '办公耗材（HC-BG）' },
  };

  const consumableTitles = { bg: '办公耗材（HC-BG）', sc: '生产耗材（HC-SC）', lb: '劳保耗材（HC-LB）' };

  function selectMajor(node) {
    const panelKey = node.dataset.panel || 'fixed';
    const major = node.dataset.major || 'fixed';

    majorNodes.forEach(n => {
      n.classList.remove('is-active', 'bg-blue-50/80', 'text-blue-600');
      n.classList.add('text-slate-600');
      n.querySelector('.wms-category-tree-actions')?.classList.add('hidden');
      n.querySelector('.wms-category-tree-actions')?.classList.remove('flex');
    });
    node.classList.add('is-active', 'bg-blue-50/80', 'text-blue-600');
    node.classList.remove('text-slate-600');
    const actions = node.querySelector('.wms-category-tree-actions');
    if (actions && panelKey === 'consumable') {
      actions.classList.remove('hidden');
      actions.classList.add('flex');
    }

    panels.forEach(p => p.classList.toggle('hidden', p.dataset.wmsCategoryPanel !== panelKey));

    if (addBtn && panelMeta[panelKey]) addBtn.href = panelMeta[panelKey].addHref;

    const activePanel = layout.querySelector(`[data-wms-category-panel="${panelKey}"]`);
    const titleEl = activePanel?.querySelector('[data-wms-category-title]');
    if (titleEl) {
      if (panelKey === 'consumable' && consumableTitles[major]) titleEl.textContent = consumableTitles[major];
      else if (panelMeta[panelKey]) titleEl.textContent = panelMeta[panelKey].title;
    }
  }

  majorNodes.forEach(node => node.addEventListener('click', () => selectMajor(node)));
}

function initAcceptanceStandard(root) {
  const layout = root.querySelector('[data-wms-acceptance-layout]');
  if (!layout) return;

  const editor = layout.querySelector('[data-wms-acceptance-editor]');
  const editBtn = layout.querySelector('[data-wms-acceptance-edit]');
  const saveBtn = layout.querySelector('[data-wms-acceptance-save]');
  const nodes = [...layout.querySelectorAll('[data-acceptance-key]')];

  const standards = {
    fixed: { label: '固定资产', content: '' },
    like: { label: '类资产', content: '1. 外观完好，无锈蚀、变形\n2. 铭牌信息齐全，规格型号与采购清单一致\n3. 随机配件、说明书数量完整\n4. 通电/试运行正常（适用时）' },
    bg: { label: '办公耗材', content: '包装完整无破损；数量清点准确；生产日期在有效期内；无受潮、污染。' },
    sc: { label: '生产耗材', content: '' },
    lb: { label: '劳保耗材', content: '' },
  };

  let activeKey = 'fixed';
  let dirty = false;

  function setEditing(on) {
    if (!editor) return;
    editor.readOnly = !on;
    editor.classList.toggle('bg-white', on);
    editor.classList.toggle('bg-slate-50', !on);
    saveBtn.disabled = !on;
    editBtn.classList.toggle('hidden', on);
  }

  function loadStandard(key) {
    activeKey = key;
    const item = standards[key] || standards.fixed;
    if (editor) {
      editor.value = item.content;
      editor.placeholder = item.content ? '' : '请输入验收标准';
    }
    dirty = false;
    setEditing(false);
  }

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => {
        n.classList.remove('is-active', 'bg-blue-50/80', 'text-blue-600');
        n.classList.add('text-slate-600');
        n.querySelector('i.fa-file')?.classList.replace('text-blue-400', 'text-slate-400');
      });
      node.classList.add('is-active', 'bg-blue-50/80', 'text-blue-600');
      node.classList.remove('text-slate-600');
      node.querySelector('i.fa-file')?.classList.replace('text-slate-400', 'text-blue-400');
      loadStandard(node.dataset.acceptanceKey);
    });
  });

  editBtn?.addEventListener('click', () => setEditing(true));
  editor?.addEventListener('input', () => { dirty = true; });

  saveBtn?.addEventListener('click', () => {
    if (!editor || saveBtn.disabled) return;
    standards[activeKey].content = editor.value.trim();
    const statusSpan = layout.querySelector(`[data-acceptance-key="${activeKey}"] span span`);
    if (statusSpan) {
      const configured = !!standards[activeKey].content;
      statusSpan.textContent = `（${configured ? '已配置' : '待配置'}）`;
      statusSpan.classList.toggle('text-blue-500', configured);
      statusSpan.classList.toggle('text-slate-400', !configured);
    }
    setEditing(false);
    showMaterialToast(`「${standards[activeKey].label}」验收标准已保存`);
  });

  loadStandard(activeKey);
}

function showQrToast(message) {
  const toast = document.getElementById('wms-qr-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showQrToast._timer);
  showQrToast._timer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

function downloadLocQrPng(shelfCode) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`wms://loc/${shelfCode}`)}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `loc-${shelfCode}.png`;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  showQrToast(`已开始下载 loc-${shelfCode}.png`);
}

function downloadAssetQrPng(assetCode) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`wms://asset/${assetCode}`)}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${assetCode}.png`;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  showQrToast(`已开始下载 ${assetCode}.png`);
}

function getVisibleShelfChecks(root) {
  const panel = root.querySelector('[data-wms-shelf-panel]');
  if (!panel) return [];
  return [...panel.querySelectorAll('tr[data-shelf-row]:not(.hidden) .wms-shelf-check:checked')];
}

function updateShelfSelectedCount(root) {
  const countEl = root.querySelector('#wms-shelf-selected-count');
  if (!countEl) return;
  countEl.textContent = String(getVisibleShelfChecks(root).length);
}

function initWarehouseLocQr(root) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.wms-loc-qr-download-single, .wms-loc-qr-print, #wms-warehouse-batch-loc-qr');
    if (!btn) return;
    e.preventDefault();
    if (btn.classList.contains('wms-loc-qr-print')) {
      showQrToast(`原型演示：打开货位码 ${btn.dataset.shelfCode || ''} 打印预览`);
      return;
    }
    if (btn.id === 'wms-warehouse-batch-loc-qr') {
      const checked = getVisibleShelfChecks(root);
      const codes = checked.map(el => el.dataset.shelfCode).filter(Boolean);
      const zone = btn.dataset.zoneName || root.querySelector('[data-wms-active-zone]')?.textContent || '当前分区';
      if (!codes.length) {
        showQrToast('请先勾选启用状态的货架');
        return;
      }
      showQrToast(`原型演示：${zone} 将打包下载 ${codes.length} 张货位码标签 ZIP（${codes.join('、')}）`);
      return;
    }
    const code = btn.dataset.shelfCode;
    if (code) downloadLocQrPng(code);
  });
}

function initAssetQrActions(root) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.wms-qr-download-single, #wms-inbound-batch-qr, #wms-ledger-batch-qr');
    if (!btn) return;
    e.preventDefault();
    if (btn.id === 'wms-inbound-batch-qr') {
      const codes = (btn.dataset.codes || '').split(',').filter(Boolean);
      showQrToast(`原型演示：将打包下载 ${codes.length} 张资产标签（${codes.join('、')}）ZIP`);
      return;
    }
    if (btn.id === 'wms-ledger-batch-qr') {
      const panel = root.querySelector('[data-wms-ledger-panel]');
      const checked = panel ? panel.querySelectorAll('.wms-ledger-check:checked:not(:disabled)') : [];
      const codes = [...checked].map(el => el.dataset.assetCode).filter(Boolean);
      if (!codes.length) {
        showQrToast('请先勾选固定资产');
        return;
      }
      showQrToast(`原型演示：将打包下载 ${codes.length} 张资产二维码 ZIP（${codes.join('、')}）`);
      return;
    }
    const code = btn.dataset.assetCode;
    if (code) downloadAssetQrPng(code);
  });
}

function initLedgerWarehouse(root) {
  const panel = root.querySelector('[data-wms-ledger-panel]');
  if (!panel) return;

  const checkAll = root.querySelector('#wms-ledger-check-all');
  const countEl = root.querySelector('#wms-ledger-selected-count');
  const checks = () => [...panel.querySelectorAll('.wms-ledger-check:not(:disabled)')];

  function updateCount() {
    if (!countEl) return;
    countEl.textContent = String(panel.querySelectorAll('.wms-ledger-check:checked:not(:disabled)').length);
  }

  if (checkAll) {
    checkAll.addEventListener('change', () => {
      checks().forEach(cb => { cb.checked = checkAll.checked; });
      updateCount();
    });
  }

  panel.addEventListener('change', (e) => {
    if (!e.target.classList.contains('wms-ledger-check')) return;
    updateCount();
    if (checkAll) {
      const all = checks();
      checkAll.checked = all.length > 0 && all.every(cb => cb.checked);
      checkAll.indeterminate = !checkAll.checked && all.some(cb => cb.checked);
    }
  });

  updateCount();
}

function initTransactionPageFromQuery(root) {
  if (root.dataset.page !== 'ledger_transaction') return;
  const params = new URLSearchParams(window.location.search);
  const no = params.get('no');
  if (!no || !WMS_TRANSACTION_SAMPLES[no]) return;

  const tx = WMS_TRANSACTION_SAMPLES[no];
  const typeBadgeMap = { 入库: 'success', 出库: 'warning', 归还: 'info', 退货: 'danger' };
  const typeBadgeClass = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    info: 'bg-slate-100 text-slate-700 ring-slate-600/10',
    danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  };

  document.querySelectorAll('[data-tx-field]').forEach(el => {
    const key = el.dataset.txField;
    if (key === 'type') {
      const cls = typeBadgeClass[typeBadgeMap[tx.type]] || typeBadgeClass.info;
      el.innerHTML = `<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}">${tx.type}</span>`;
      return;
    }
    if (key === 'category') {
      el.innerHTML = `<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-slate-100 text-slate-700 ring-slate-600/10">${tx.category}</span>`;
      return;
    }
    if (key === 'returnStatus' && tx.returnStatus) {
      el.innerHTML = `<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">${tx.returnStatus}</span>`;
      return;
    }
    if (tx[key] !== undefined) el.textContent = tx[key];
  });

  const relatedLabelEl = document.querySelector('[data-tx-label="related"]');
  if (relatedLabelEl && tx.relatedLabel) relatedLabelEl.textContent = tx.relatedLabel;

  document.querySelectorAll('[data-tx-row]').forEach(row => {
    const key = row.dataset.txRow;
    const hasValue = tx[key] && tx[key] !== '—';
    row.classList.toggle('hidden', !hasValue);
  });

  const sourceLink = document.querySelector('[data-tx-source-link]');
  if (sourceLink && tx.sourceHref) {
    sourceLink.href = tx.sourceHref;
    const sourceLabel = { inbound: '查看入库单', outbound: '查看出库单', return: '查看归还单', refund: '查看退货单' };
    if (sourceLabel[tx.typeKey]) sourceLink.textContent = sourceLabel[tx.typeKey];
  }

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl) titleEl.textContent = `流水详情 · ${no}`;
}

function initRequisitionRecordFromQuery(root) {
  if (root.dataset.page !== 'mine_pending_return') return;
  if (!(root.dataset.title || '').includes('领用记录')) return;
  const params = new URLSearchParams(window.location.search);
  const no = params.get('no');
  if (!no || !WMS_REQUISITION_RECORD_SAMPLES[no]) return;

  const rec = WMS_REQUISITION_RECORD_SAMPLES[no];
  const backHref = params.get('back') || 'mine_pending_return.html';
  const statusBadgeClass = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    info: 'bg-slate-100 text-slate-700 ring-slate-600/10',
  };
  const statusCls = statusBadgeClass[rec.status === '审核通过' ? 'success' : 'info'];

  document.querySelectorAll('[data-req-field]').forEach(el => {
    const key = el.dataset.reqField;
    if (key === 'status') {
      el.innerHTML = `<span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusCls}">${rec.status}</span>`;
      return;
    }
    if (rec[key] !== undefined) el.textContent = rec[key];
  });

  const tbody = document.querySelector('[data-req-materials]');
  if (tbody && rec.materials?.length) {
    tbody.innerHTML = rec.materials.map((m, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm text-slate-700">${i + 1}</td><td class="px-3 py-2.5 font-mono text-sm text-slate-800">${m.code}</td><td class="px-3 py-2.5 text-sm text-slate-800">${m.name}</td><td class="px-3 py-2.5 text-sm text-slate-700">${m.spec}</td><td class="px-3 py-2.5 text-sm text-slate-700">${m.unit}</td><td class="px-3 py-2.5 text-sm text-slate-800">${m.qty}</td></tr>`
    ).join('');
  }

  const backdrop = document.querySelector('.wms-modal-backdrop');
  backdrop?.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes('mine_pending_return.html')) a.setAttribute('href', backHref);
  });
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) window.location.href = backHref;
    };
  }

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl) titleEl.textContent = `领用记录 · ${no}`;
}

function applyAcceptanceBackLinks(backHref) {
  const backdrop = document.querySelector('.wms-modal-backdrop');
  backdrop?.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === 'warehouse_acceptance_list.html' || href.endsWith('warehouse_acceptance_list.html')) {
      a.setAttribute('href', backHref);
    }
  });
  if (backdrop) {
    backdrop.onclick = (e) => { if (e.target === backdrop) window.location.href = backHref; };
    backdrop.querySelector('.wms-modal-close')?.setAttribute('href', backHref);
  }
}

function fillAcceptanceSupplyFields(scope, sample) {
  scope.querySelectorAll('[data-accept-field]').forEach(el => {
    const key = el.dataset.acceptField;
    if (key === 'recordNo') {
      el.value = `${sample.supplyNo}-YS01`;
      return;
    }
    if (key === 'supplierStatus') {
      el.innerHTML = statusBadge(sample.supplierStatus, 'success');
      return;
    }
    if (sample[key] !== undefined) {
      if (el.tagName === 'INPUT') el.value = sample[key];
      else el.textContent = sample[key];
    }
  });
}

function wmsRefundFormHref(refundKey, back = 'warehouse_refund_list.html') {
  const sample = WMS_REFUND_PENDING_SAMPLES[refundKey];
  if (!sample) return '';
  const formPage = sample.scene === 'pre_inbound' ? 'warehouse_refund_pre_form.html' : {
    fixed: 'warehouse_refund_fixed_form.html',
    like: 'warehouse_refund_like_form.html',
    consumable: 'warehouse_refund_consumable_form.html',
  }[sample.materialType] || 'warehouse_refund_pre_form.html';
  return `${formPage}?${new URLSearchParams({ refundKey, back })}`;
}

function renderAcceptanceRecordRows(supplyNo, backHref) {
  const tbody = document.querySelector('[data-accept-records-tbody]');
  if (!tbody) return;
  const d = WMS_ACCEPTANCE_SUPPLY_SAMPLES[supplyNo];
  const records = WMS_ACCEPTANCE_RECORDS[supplyNo] || [];
  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="12" class="px-4 py-12 text-center text-sm text-slate-400">暂无验收记录</td></tr>';
    return;
  }
  const statusMap = { '审核通过': 'success', '审核中': 'warning' };
  tbody.innerHTML = records.map((r, i) => {
    const badgeCls = statusMap[r.status] === 'success'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      : 'bg-amber-50 text-amber-700 ring-amber-600/20';
    const detailBack = encodeURIComponent(`warehouse_acceptance_record.html?no=${supplyNo}&back=${backHref}`);
    const auditLink = r.status === '审核中' ? '<a href="#" class="hover:underline">审核</a>' : '';
    const viewLink = `<a href="warehouse_acceptance_record_detail.html?no=${r.no}&back=${detailBack}" class="mr-2 hover:underline">查看</a>`;
    const refundKey = r.refundKey || WMS_REFUND_BY_ACCEPT[r.no] || '';
    const refundHref = refundKey ? wmsRefundFormHref(refundKey) : '';
    const refundLink = refundHref ? `<a href="${refundHref}" class="ml-2 text-rose-600 hover:underline">发起退货</a>` : '';
    return `<tr class="border-t border-slate-100 hover:bg-slate-50/80" data-wms-list-row>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${i + 1}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${r.no}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${r.batchQty}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${r.qualified}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${r.unqualified}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${supplyNo}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${d?.supplier || '—'}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${r.date}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${r.warehouse}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${r.planner}</td>
      <td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap"><span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeCls}">${r.status}</span></td>
      <td class="wms-col-actions px-4 py-3.5 text-slate-900 text-right text-sm whitespace-nowrap">${viewLink}${refundLink}${auditLink}</td>
    </tr>`;
  }).join('');
}

function initAcceptanceRecordDetailFromQuery(root) {
  if (root.dataset.page !== 'warehouse_acceptance_list') return;
  if (!(root.dataset.title || '').includes('验收记录详情')) return;

  const params = new URLSearchParams(window.location.search);
  const recordNo = params.get('no');
  const backHref = params.get('back') || 'warehouse_acceptance_record.html';
  if (!recordNo) return;

  const d = WMS_ACCEPTANCE_RECORD_DETAIL_SAMPLES[recordNo];
  if (!d) return;

  document.querySelectorAll('[data-accept-record-field]').forEach(el => {
    const key = el.dataset.acceptRecordField;
    if (d[key] !== undefined) {
      if (el.tagName === 'TEXTAREA') el.value = d[key];
      else el.value = d[key];
    }
  });

  const refundKey = d.refundKey || WMS_REFUND_BY_ACCEPT[recordNo] || '';
  const refundBtn = document.querySelector('.wms-modal-footer a.wms-btn-primary');
  if (refundBtn && refundKey && WMS_REFUND_PENDING_SAMPLES[refundKey]) {
    refundBtn.href = wmsRefundFormHref(refundKey);
    refundBtn.textContent = '发起退货';
  } else if (refundBtn && !refundKey) {
    refundBtn.remove();
  }

  document.querySelectorAll('.wms-modal-backdrop [href="warehouse_acceptance_record.html"], .wms-modal-close').forEach(a => {
    a.setAttribute('href', backHref);
  });

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl) titleEl.textContent = `验收记录详情 · ${recordNo}`;
}

function initAcceptanceFromQuery(root) {
  if (root.dataset.page !== 'warehouse_acceptance_list') return;
  const params = new URLSearchParams(window.location.search);
  const no = params.get('no');
  if (!no || !WMS_ACCEPTANCE_SUPPLY_SAMPLES[no]) return;

  const sample = WMS_ACCEPTANCE_SUPPLY_SAMPLES[no];
  const backHref = params.get('back') || 'warehouse_acceptance_list.html';
  const title = root.dataset.title || '';

  applyAcceptanceBackLinks(backHref);

  const supplyScope = document.querySelector('[data-wms-acceptance-supply]');
  if (supplyScope) fillAcceptanceSupplyFields(supplyScope, sample);

  if (title.includes('验收记录')) {
    document.querySelectorAll('[data-accept-field="supplyNo"]').forEach(el => { el.textContent = no; });
    renderAcceptanceRecordRows(no, backHref);
    const addBtn = document.querySelector('.wms-modal-footer a[href*="warehouse_acceptance_form"]');
    if (addBtn) addBtn.setAttribute('href', `warehouse_acceptance_form.html?no=${no}&back=${encodeURIComponent(`warehouse_acceptance_record.html?no=${no}&back=${backHref}`)}`);
    const titleEl = document.getElementById('wms-modal-title');
    if (titleEl) titleEl.textContent = `验收记录 · ${no}`;
    return;
  }

  if (title.includes('供货详情')) {
    const titleEl = document.getElementById('wms-modal-title');
    if (titleEl) titleEl.textContent = `供货详情 · ${no}`;
    return;
  }

  if (title.includes('物资验收') || title.includes('执行验收')) {
    const titleEl = document.getElementById('wms-modal-title');
    if (titleEl) titleEl.textContent = `执行验收 · ${no}`;
  }
}

function fillSupplyCompleteFields(scope, sample) {
  scope.querySelectorAll('[data-supply-field]').forEach(el => {
    const key = el.dataset.supplyField;
    if (sample[key] !== undefined) el.textContent = sample[key];
  });
}

function applySupplyCompleteBackLinks(backHref) {
  const backdrop = document.querySelector('.wms-modal-backdrop');
  backdrop?.querySelectorAll('[data-supply-back-link], .wms-modal-close').forEach(a => {
    a.setAttribute('href', backHref);
  });
  if (backdrop) {
    backdrop.onclick = (e) => { if (e.target === backdrop) window.location.href = backHref; };
  }
}

function showSupplyCompleteToast(message) {
  let toast = document.getElementById('wms-supply-complete-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'wms-supply-complete-toast';
    toast.className = 'fixed bottom-6 left-1/2 z-[9999] hidden -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showSupplyCompleteToast._timer);
  showSupplyCompleteToast._timer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

function initSupplyCompleteFromQuery(root) {
  if (root.dataset.page !== 'purchase_supply_list') return;
  if (!(root.dataset.title || '').includes('完成供货')) return;

  const params = new URLSearchParams(window.location.search);
  const no = params.get('no');
  const backHref = params.get('back') || 'purchase_supply_list.html';
  const fromAcceptance = params.get('from') === 'acceptance' || backHref.includes('warehouse_acceptance');

  if (no && WMS_ACCEPTANCE_SUPPLY_SAMPLES[no]) {
    const s = WMS_ACCEPTANCE_SUPPLY_SAMPLES[no];
    const sample = {
      supplyNo: s.supplyNo,
      supplier: s.supplier,
      code: s.code,
      name: s.name,
      required: s.required,
      supplied: s.supplied,
      qualified: s.qualified,
      unqualified: s.unqualified,
      returned: '0',
      pending: s.pending,
    };
    const scope = document.querySelector('[data-wms-supply-complete]');
    if (scope) fillSupplyCompleteFields(scope, sample);
  }

  applySupplyCompleteBackLinks(backHref);

  const breadcrumbEl = document.querySelector('.wms-app-shell header .text-xs.text-slate-500');
  if (breadcrumbEl && fromAcceptance) {
    breadcrumbEl.textContent = '物资管理 / 完成供货（来自验收）';
  }

  const hint = document.querySelector('[data-supply-from-hint]');
  if (hint && fromAcceptance) hint.classList.remove('hidden');

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl && no) titleEl.textContent = `完成供货 · ${no}`;

  const submitBtn = document.querySelector('[data-supply-complete-submit]');
  submitBtn?.addEventListener('click', () => {
    const yes = document.querySelector('input[name="supplyComplete"][value="是"]');
    const remark = document.querySelector('[data-supply-complete-remark]');
    if (!yes?.checked) {
      showSupplyCompleteToast('请选择「是」确认完成供货');
      return;
    }
    if (!remark?.value?.trim()) {
      showSupplyCompleteToast('请填写说明');
      remark?.focus();
      return;
    }
    const redirectHref = fromAcceptance ? backHref : 'warehouse_acceptance_list.html';
    showSupplyCompleteToast(fromAcceptance ? '已终结供货，验收待办已关闭' : '供货完成，请前往物资验收');
    setTimeout(() => { window.location.href = redirectHref; }, 900);
  });
}

function initShelfQrPageFromQuery(root) {
  if (root.dataset.page !== 'config_warehouse' || !(root.dataset.title || '').includes('货位二维码')) return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code || !WMS_SHELF_SAMPLES[code]) return;

  const shelf = WMS_SHELF_SAMPLES[code];
  if (!shelf.enabled) {
    showQrToast('停用货架不可查看货位码');
    return;
  }
  const qrData = encodeURIComponent(`wms://loc/${code}`);

  document.querySelectorAll('.wms-loc-qr-image, .wms-qr-image').forEach(img => {
    const size = img.width || img.getAttribute('width') || 160;
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrData}`;
    img.alt = `货位二维码 ${code}`;
  });

  document.querySelectorAll('[data-shelf-field="code"]').forEach(el => { el.textContent = shelf.code; });
  document.querySelectorAll('[data-shelf-field="name"]').forEach(el => { el.textContent = shelf.name; });
  document.querySelectorAll('[data-shelf-field="location"]').forEach(el => { el.textContent = shelf.location; });

  document.querySelectorAll('.wms-loc-qr-download-single, .wms-loc-qr-print').forEach(btn => {
    btn.dataset.shelfCode = shelf.code;
  });

  document.querySelectorAll('[data-shelf-uri]').forEach(el => {
    el.textContent = `wms://loc/${code}`;
  });

  document.querySelectorAll('.wms-loc-qr-label-wrap').forEach(wrap => {
    wrap.innerHTML = wrap.innerHTML.replace(/wms:\/\/loc\/[^<"']+/g, `wms://loc/${code}`);
  });

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl) titleEl.textContent = `货位二维码 · ${code}`;
}

function initShelfFormFromQuery(root) {
  if (root.dataset.page !== 'config_warehouse' || (root.dataset.title || '').includes('货位二维码')) return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code || !WMS_SHELF_SAMPLES[code]) return;

  const shelf = WMS_SHELF_SAMPLES[code];
  const qrData = encodeURIComponent(`wms://loc/${code}`);
  const qrBlock = root.querySelector('[data-shelf-qr-block]');

  if (qrBlock) {
    if (!shelf.enabled) {
      qrBlock.innerHTML = '<p class="text-sm text-slate-500">货架已停用，不可生成或下载货位码。启用后可自动生成 <code class="rounded bg-white px-1 text-xs">wms://loc/{货架编码}</code></p>';
    } else {
      document.querySelectorAll('.wms-loc-qr-image').forEach(img => {
        const size = img.width || img.getAttribute('width') || 96;
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrData}`;
        img.alt = `货位二维码 ${code}`;
      });
    }
  }

  const form = root.querySelector('.wms-warehouse-form');
  if (form) {
    const labels = [...form.querySelectorAll('label')];
    const setField = (labelText, value, isSelect = false) => {
      const label = labels.find(l => l.textContent.includes(labelText));
      if (!label) return;
      const field = label.parentElement?.querySelector(isSelect ? 'select' : 'input');
      if (!field) return;
      if (isSelect) {
        [...field.options].forEach(opt => { opt.selected = opt.textContent.trim() === value; });
      } else {
        field.value = value;
      }
    };
    setField('所在仓库', shelf.warehouse, true);
    setField('所在分区', shelf.zone, true);
    setField('货架编码', shelf.code);
    setField('货架名称', shelf.name);
  }

  document.querySelectorAll('[data-shelf-uri]').forEach(el => {
    el.textContent = `wms://loc/${code}`;
  });

  document.querySelectorAll('.wms-loc-qr-download-single').forEach(btn => {
    btn.dataset.shelfCode = shelf.code;
  });

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl) titleEl.textContent = `货架详情 · ${code}`;
}

function initInboundLocScan(root) {
  if (root.dataset.page !== 'warehouse_inbound_list') return;
  const scanBtn = document.querySelector('#wms-inbound-scan-loc');
  if (!scanBtn) return;

  scanBtn.addEventListener('click', () => {
    const demoCode = 'CK001001-HJ001';
    const shelf = WMS_SHELF_SAMPLES[demoCode];
    if (!shelf || !shelf.enabled) {
      showQrToast('货位码无效或货架已停用');
      return;
    }

    const row = document.querySelector('[data-inbound-loc-row]');
    if (!row) return;

    const wh = row.querySelector('[data-inbound-warehouse]');
    const sh = row.querySelector('[data-inbound-shelf]');
    if (wh) [...wh.options].forEach(o => { o.selected = o.textContent.trim() === (shelf.inboundWarehouse || '主仓库'); });
    if (sh) [...sh.options].forEach(o => { o.selected = o.textContent.trim() === (shelf.inboundShelf || demoCode); });
    showQrToast(`已识别货位码：${demoCode}（${shelf.name}）`);
  });
}

function initInboundLocationRows(pendingQty, isFixed) {
  const list = document.querySelector('[data-inbound-loc-list]');
  const addBtn = document.querySelector('[data-inbound-loc-add]');
  if (!list || !addBtn) return;

  const bindRow = (row) => {
    const removeBtn = row.querySelector('[data-inbound-loc-remove]');
    removeBtn?.addEventListener('click', () => {
      if (list.querySelectorAll('[data-inbound-loc-row]').length <= 1) return;
      row.remove();
    });
    const qtyInput = row.querySelector('[data-inbound-qty]');
    if (isFixed && qtyInput) {
      qtyInput.value = '1';
      qtyInput.max = '1';
      qtyInput.readOnly = true;
      qtyInput.classList.add('bg-slate-50', 'text-slate-500');
    }
  };

  list.querySelectorAll('[data-inbound-loc-row]').forEach(bindRow);

  addBtn.addEventListener('click', () => {
    const first = list.querySelector('[data-inbound-loc-row]');
    if (!first) return;
    const clone = first.cloneNode(true);
    clone.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
    clone.querySelectorAll('[data-inbound-qty]').forEach(i => {
      i.value = isFixed ? '1' : '';
      i.readOnly = !!isFixed;
    });
    if (!clone.querySelector('[data-inbound-loc-remove]')) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'mb-0.5 shrink-0 text-sm text-rose-600 hover:underline';
      del.dataset.inboundLocRemove = '';
      del.textContent = '删除';
      clone.appendChild(del);
    }
    list.appendChild(clone);
    bindRow(clone);
  });

  const pendingEl = document.querySelector('[data-inbound-pending-qty-display]');
  if (pendingEl) pendingEl.textContent = pendingQty;
}

function fillInboundFields(scope, sample) {
  scope.querySelectorAll('[data-inbound-field]').forEach(el => {
    const key = el.dataset.inboundField;
    if (key === 'supplierStatus') {
      el.innerHTML = statusBadge(sample.supplierStatus, 'success');
      return;
    }
    if (key === 'pendingQty') {
      el.innerHTML = `<span class="font-semibold text-slate-900">${sample.pendingQty}</span>`;
      return;
    }
    if (sample[key] === undefined) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.type !== 'date' || sample[key]) el.value = sample[key];
    } else if (el.tagName === 'SELECT') {
      [...el.options].forEach(o => { o.selected = o.textContent.trim() === sample[key]; });
    } else {
      el.textContent = sample[key];
    }
  });
}

function initInboundFromQuery(root) {
  if (root.dataset.page !== 'warehouse_inbound_list') return;
  const title = root.dataset.title || '';
  if (!title.includes('入库')) return;

  const params = new URLSearchParams(window.location.search);
  const acceptNo = params.get('acceptNo');
  const viewMode = params.get('mode') === 'view';
  const backHref = params.get('back') || 'warehouse_inbound_list.html';

  if (!acceptNo || !WMS_INBOUND_ACCEPT_SAMPLES[acceptNo]) return;

  const sample = { ...WMS_INBOUND_ACCEPT_SAMPLES[acceptNo], viewMode };
  const scope = document.querySelector('[data-wms-inbound-form]');
  if (scope) fillInboundFields(scope, sample);

  document.querySelectorAll('[data-inbound-back-link], .wms-modal-close').forEach(a => {
    a.setAttribute('href', backHref);
  });
  const backdrop = document.querySelector('.wms-modal-backdrop');
  if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) window.location.href = backHref; };

  const titleEl = document.getElementById('wms-modal-title');
  const typeLabel = WMS_INBOUND_TYPE_LABELS[sample.materialType] || '执行入库';
  if (titleEl) {
    titleEl.textContent = viewMode ? `入库详情 · ${acceptNo}` : `${typeLabel} · ${acceptNo}`;
  }

  const breadcrumbEl = document.querySelector('.wms-app-shell header .text-xs.text-slate-500');
  if (breadcrumbEl && sample.materialType && sample.materialType !== 'fixed') {
    breadcrumbEl.textContent = `物资管理 / ${typeLabel}${viewMode ? ' · 查看' : ''}`;
  }

  if (viewMode) {
    scope?.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true; });
    scope?.querySelector('[data-wms-inbound-loc-scan]')?.classList.add('hidden');
    const locSection = document.querySelector('[data-wms-inbound-locations]');
    if (locSection && sample.locations?.length) {
      const tr = sample.locations.map((loc, i) =>
        `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 text-sm">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm">${loc.shelf}</td><td class="px-3 py-2.5 text-sm">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium">${loc.qty}</td></tr>`
      ).join('');
      locSection.innerHTML = `<div class="wms-form-section md:col-span-2"><h3 class="wms-form-section-title">存放位置</h3></div>
        <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">仓库</th><th class="px-3 py-2 text-left text-xs text-slate-500">货架</th><th class="px-3 py-2 text-left text-xs text-slate-500">架层</th><th class="px-3 py-2 text-left text-xs text-slate-500">数量</th></tr></thead><tbody>${tr}</tbody></table></div>`;
    }
  } else {
    initInboundLocationRows(sample.pendingQty, sample.materialType === 'fixed');
  }

  const submitBtn = document.querySelector('[data-inbound-submit]');
  submitBtn?.addEventListener('click', () => {
    const operator = scope?.querySelector('[data-inbound-field="operator"]');
    const department = scope?.querySelector('[data-inbound-field="department"]');
    const dateInput = scope?.querySelector('[data-inbound-field="inboundDate"]');
    if (!dateInput?.value) {
      showSupplyCompleteToast('请选择入库日期');
      return;
    }
    if (!operator?.value || operator.selectedIndex <= 0) {
      showSupplyCompleteToast('请选择入库人员');
      return;
    }
    if (!department?.value || department.selectedIndex <= 0) {
      showSupplyCompleteToast('请选择入库部门');
      return;
    }

    const rows = [...document.querySelectorAll('[data-inbound-loc-row]')];
    let totalQty = 0;
    for (const row of rows) {
      const wh = row.querySelector('[data-inbound-warehouse]');
      const qty = row.querySelector('[data-inbound-qty]');
      if (!wh?.value || wh.selectedIndex <= 0) {
        showSupplyCompleteToast('请选择存放仓库');
        return;
      }
      if (!qty?.value || Number(qty.value) <= 0) {
        showSupplyCompleteToast('请填写有效的入库数量');
        return;
      }
      totalQty += Number(qty.value);
    }
    const pending = Number(sample.pendingQty);
    if (totalQty > pending) {
      showSupplyCompleteToast(`入库数量合计不能超过待入库数量 ${pending}`);
      return;
    }

    const inboundNo = scope?.querySelector('[data-inbound-field="inboundNo"]')?.value || 'RK202509001';
    if (sample.materialType === 'fixed') {
      window.location.href = `warehouse_inbound_success.html?acceptNo=${encodeURIComponent(acceptNo)}&rk=${encodeURIComponent(inboundNo)}&qty=${totalQty}&back=${encodeURIComponent(backHref)}`;
      return;
    }
    showSupplyCompleteToast(`${WMS_INBOUND_TYPE_LABELS[sample.materialType] || '入库'}成功`);
    setTimeout(() => { window.location.href = backHref; }, 900);
  });
}

function initInboundSuccessFromQuery(root) {
  if (root.dataset.page !== 'warehouse_inbound_list') return;
  if (!(root.dataset.title || '').includes('入库成功')) return;

  const params = new URLSearchParams(window.location.search);
  const acceptNo = params.get('acceptNo') || 'GH2025001-YS01';
  const rk = params.get('rk') || 'RK202509001';
  const qty = Math.min(Number(params.get('qty')) || 3, 6);
  const sample = WMS_INBOUND_ACCEPT_SAMPLES[acceptNo];
  const name = sample?.name || '抓斗';

  const codes = Array.from({ length: qty }, (_, i) => `ZC20260609000${i + 1}`);
  const titleEl = document.querySelector('[data-inbound-success-title]');
  const descEl = document.querySelector('[data-inbound-success-desc]');
  if (titleEl) titleEl.textContent = `入库成功 · 已生成 ${qty} 个资产编码`;
  if (descEl) descEl.textContent = `入库单号 ${rk} · 验收单 ${acceptNo} · 货位 主仓库`;

  const grid = document.querySelector('[data-inbound-success-qr-grid]');
  if (grid) {
    grid.innerHTML = codes.map(c =>
      `<div class="rounded-xl border border-slate-200 p-4"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`wms://asset/${c}`)}" width="120" height="120" alt="" class="mx-auto" /><div class="mt-2 font-mono text-xs font-semibold">${c}</div><div class="text-xs text-slate-500">${name}</div><div class="text-xs text-slate-400">主仓库</div></div>`
    ).join('');
  }

  const batchBtn = document.getElementById('wms-inbound-batch-qr');
  if (batchBtn) batchBtn.dataset.codes = codes.join(',');
}

function fillOutboundFields(scope, sample) {
  scope.querySelectorAll('[data-outbound-field]').forEach(el => {
    const key = el.dataset.outboundField;
    if (key === 'needReturn') {
      el.innerHTML = sample.needReturn ? statusBadge('需归还', 'info') : statusBadge('不需归还', 'success');
      return;
    }
    if (key === 'pendingQty') {
      el.innerHTML = `<span class="font-semibold text-slate-900">${sample.pendingQty}</span>`;
      return;
    }
    if (sample[key] === undefined) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.type !== 'date' || sample[key]) el.value = sample[key];
    } else if (el.tagName === 'SELECT') {
      [...el.options].forEach(o => { o.selected = o.textContent.trim() === sample[key]; });
    } else {
      el.textContent = sample[key];
    }
  });
}

function renderOutboundAssetTags(listEl, codes) {
  if (!listEl) return;
  if (!codes.length) {
    listEl.innerHTML = '<p class="text-sm text-slate-400" data-outbound-asset-empty>尚未选择资产编码</p>';
  } else {
    listEl.innerHTML = codes.map(c =>
      `<span class="mr-2 mb-2 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-sm font-mono ring-1 ring-slate-200" data-outbound-asset-tag="${c}">${c}<button type="button" class="text-slate-400 hover:text-rose-600" data-outbound-asset-remove="${c}">&times;</button></span>`
    ).join('');
  }
  document.querySelectorAll('[data-outbound-asset-count]').forEach(el => { el.textContent = String(codes.length); });
}

function initOutboundLocationRows(pendingQty) {
  const list = document.querySelector('[data-outbound-loc-list]');
  const addBtn = document.querySelector('[data-outbound-loc-add]');
  if (!list || !addBtn) return;

  const bindRow = (row) => {
    row.querySelector('[data-outbound-loc-remove]')?.addEventListener('click', () => {
      if (list.querySelectorAll('[data-outbound-loc-row]').length <= 1) return;
      row.remove();
    });
  };

  list.querySelectorAll('[data-outbound-loc-row]').forEach(bindRow);

  addBtn.addEventListener('click', () => {
    const first = list.querySelector('[data-outbound-loc-row]');
    if (!first) return;
    const clone = first.cloneNode(true);
    clone.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
    clone.querySelectorAll('[data-outbound-qty]').forEach(i => { i.value = ''; });
    if (!clone.querySelector('[data-outbound-loc-remove]')) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'mb-0.5 shrink-0 text-sm text-rose-600 hover:underline';
      del.dataset.outboundLocRemove = '';
      del.textContent = '删除';
      clone.appendChild(del);
    }
    list.appendChild(clone);
    bindRow(clone);
  });

  document.querySelectorAll('[data-outbound-pending-qty-display]').forEach(el => { el.textContent = pendingQty; });
}

function initOutboundFromQuery(root) {
  if (root.dataset.page !== 'warehouse_outbound_list') return;
  const title = root.dataset.title || '';
  if (!title.includes('出库')) return;

  const params = new URLSearchParams(window.location.search);
  const lineKey = params.get('lineKey');
  const viewMode = params.get('mode') === 'view';
  const backHref = params.get('back') || 'warehouse_outbound_list.html';
  const preAssets = (params.get('assets') || '').split(',').filter(Boolean);

  if (!lineKey || !WMS_OUTBOUND_REQUISITION_SAMPLES[lineKey]) return;

  const sample = { ...WMS_OUTBOUND_REQUISITION_SAMPLES[lineKey], viewMode };
  const scope = document.querySelector('[data-wms-outbound-form]');
  if (scope) fillOutboundFields(scope, sample);

  document.querySelectorAll('[data-outbound-back-link], .wms-modal-close').forEach(a => {
    a.setAttribute('href', backHref);
  });
  const backdrop = document.querySelector('.wms-modal-backdrop');
  if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) window.location.href = backHref; };

  const titleEl = document.getElementById('wms-modal-title');
  const typeLabel = WMS_OUTBOUND_TYPE_LABELS[sample.materialType] || '执行出库';
  if (titleEl) {
    titleEl.textContent = viewMode ? `出库详情 · ${sample.requisitionNo}` : `${typeLabel} · ${sample.requisitionNo}`;
  }

  const breadcrumbEl = document.querySelector('.wms-app-shell header .text-xs.text-slate-500');
  if (breadcrumbEl) {
    breadcrumbEl.textContent = `物资管理 / ${typeLabel}${viewMode ? ' · 查看' : ''}`;
  }

  const assetListEl = document.querySelector('[data-outbound-asset-list]');
  let selectedAssets = viewMode ? (sample.assetCodes?.length ? sample.assetCodes : []) : [...preAssets];

  const refreshAssets = () => {
    renderOutboundAssetTags(assetListEl, selectedAssets);
    assetListEl?.querySelectorAll('[data-outbound-asset-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.outboundAssetRemove;
        selectedAssets = selectedAssets.filter(c => c !== code);
        refreshAssets();
      });
    });
  };

  if (viewMode) {
    scope?.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true; });
    if (sample.materialType === 'fixed' && sample.status === '已出库' && !selectedAssets.length) {
      selectedAssets = ['ZC202606001'];
    }
    if (sample.materialType === 'fixed') {
      renderOutboundAssetTags(assetListEl, selectedAssets);
    }
    const locSection = document.querySelector('[data-wms-outbound-locations]');
    if (locSection && sample.locations?.length && sample.materialType === 'like') {
      const tr = sample.locations.map((loc, i) =>
        `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 text-sm">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm">${loc.shelf}</td><td class="px-3 py-2.5 text-sm">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium">${loc.qty}</td></tr>`
      ).join('');
      locSection.innerHTML = `<div class="mb-2"><h4 class="text-sm font-semibold text-slate-800">扣减货位</h4></div>
        <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">仓库</th><th class="px-3 py-2 text-left text-xs text-slate-500">货架</th><th class="px-3 py-2 text-left text-xs text-slate-500">架层</th><th class="px-3 py-2 text-left text-xs text-slate-500">数量</th></tr></thead><tbody>${tr}</tbody></table></div>`;
    }
  } else {
    if (sample.materialType === 'fixed') {
      refreshAssets();
      document.getElementById('wms-outbound-scan-asset')?.addEventListener('click', () => {
        const demo = 'ZC202606001';
        if (!selectedAssets.includes(demo)) selectedAssets.push(demo);
        refreshAssets();
        showQrToast(`已识别资产码：${demo}`);
      });
    } else if (sample.materialType === 'like') {
      initOutboundLocationRows(sample.pendingQty);
    } else {
      document.querySelectorAll('[data-outbound-pending-qty-display]').forEach(el => { el.textContent = sample.pendingQty; });
    }
  }

  const submitBtn = document.querySelector('[data-outbound-submit]');
  submitBtn?.addEventListener('click', () => {
    const operator = scope?.querySelector('[data-outbound-field="operator"]');
    const department = scope?.querySelector('[data-outbound-field="department"]');
    const dateInput = scope?.querySelector('[data-outbound-field="outboundDate"]');
    const recipient = scope?.querySelector('[data-outbound-field="recipient"]');
    const recipientDept = scope?.querySelector('[data-outbound-field="recipientDept"]');

    if (!dateInput?.value) { showSupplyCompleteToast('请选择出库日期'); return; }
    if (!recipient?.value || recipient.selectedIndex <= 0) { showSupplyCompleteToast('请选择领用人'); return; }
    if (!recipientDept?.value || recipientDept.selectedIndex <= 0) { showSupplyCompleteToast('请选择领用部门'); return; }
    if (!operator?.value || operator.selectedIndex <= 0) { showSupplyCompleteToast('请选择出库人员'); return; }
    if (!department?.value || department.selectedIndex <= 0) { showSupplyCompleteToast('请选择出库部门'); return; }

    const outboundNo = scope?.querySelector('[data-outbound-field="outboundNo"]')?.value || 'CK202606090001';
    let totalQty = 0;

    if (sample.materialType === 'fixed') {
      totalQty = selectedAssets.length;
      if (totalQty <= 0) { showSupplyCompleteToast('请选择至少一个资产编码'); return; }
      if (totalQty > Number(sample.pendingQty)) {
        showSupplyCompleteToast(`出库数量不能超过待出库数量 ${sample.pendingQty}`);
        return;
      }
      const recipientName = recipient.options[recipient.selectedIndex]?.textContent?.trim() || '—';
      window.location.href = `warehouse_outbound_success.html?lineKey=${encodeURIComponent(lineKey)}&ck=${encodeURIComponent(outboundNo)}&assets=${encodeURIComponent(selectedAssets.join(','))}&recipient=${encodeURIComponent(recipientName)}&back=${encodeURIComponent(backHref)}`;
      return;
    }

    if (sample.materialType === 'like') {
      const rows = [...document.querySelectorAll('[data-outbound-loc-row]')];
      for (const row of rows) {
        const wh = row.querySelector('[data-outbound-warehouse]');
        const qty = row.querySelector('[data-outbound-qty]');
        if (!wh?.value || wh.selectedIndex <= 0) { showSupplyCompleteToast('请选择扣减仓库'); return; }
        if (!qty?.value || Number(qty.value) <= 0) { showSupplyCompleteToast('请填写有效的出库数量'); return; }
        totalQty += Number(qty.value);
      }
    } else {
      const qtyInput = scope?.querySelector('[data-outbound-field="thisOutboundQty"]');
      totalQty = Number(qtyInput?.value);
      if (!totalQty || totalQty <= 0) { showSupplyCompleteToast('请填写本次出库数量'); return; }
    }

    const pending = Number(sample.pendingQty);
    if (totalQty > pending) {
      showSupplyCompleteToast(`出库数量不能超过待出库数量 ${pending}`);
      return;
    }

    showSupplyCompleteToast(`${WMS_OUTBOUND_TYPE_LABELS[sample.materialType] || '出库'}成功`);
    setTimeout(() => { window.location.href = backHref; }, 900);
  });
}

function initOutboundSuccessFromQuery(root) {
  if (root.dataset.page !== 'warehouse_outbound_list') return;
  if (!(root.dataset.title || '').includes('出库成功')) return;

  const params = new URLSearchParams(window.location.search);
  const lineKey = params.get('lineKey') || 'LY202606070002-L1';
  const ck = params.get('ck') || 'CK202606090001';
  const recipient = params.get('recipient') || '王工';
  const assets = (params.get('assets') || 'ZC202606001').split(',').filter(Boolean);
  const sample = WMS_OUTBOUND_REQUISITION_SAMPLES[lineKey];

  const titleEl = document.querySelector('[data-outbound-success-title]');
  const descEl = document.querySelector('[data-outbound-success-desc]');
  if (titleEl) titleEl.textContent = `出库成功 · 已交接 ${assets.length} 件资产`;
  if (descEl) descEl.textContent = `出库单号 ${ck} · 领用单 ${sample?.requisitionNo || '—'} · 领用人 ${recipient}`;

  const table = document.querySelector('[data-outbound-success-asset-table] tbody');
  if (table) {
    const name = sample?.name || '工程测量仪';
    table.innerHTML = assets.map(c =>
      `<tr class="border-t border-slate-100"><td class="px-4 py-2.5 font-mono">${c}</td><td class="px-4 py-2.5">${name}</td><td class="px-4 py-2.5">${recipient}</td></tr>`
    ).join('');
  }
}

function initOutboundSelectAsset(root) {
  if (root.dataset.page !== 'warehouse_outbound_list') return;
  if (!(root.dataset.title || '').includes('选择资产')) return;

  const params = new URLSearchParams(window.location.search);
  const backHref = params.get('back') || 'warehouse_outbound_fixed_form.html';
  const lineKey = params.get('lineKey') || 'LY202606070002-L1';
  const confirmBtn = document.querySelector('.wms-modal-footer .wms-btn-primary');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const codes = [];
    document.querySelectorAll('.wms-modal-table-wrap tbody tr').forEach(tr => {
      const cb = tr.querySelector('input[type="checkbox"]');
      const codeCell = tr.querySelector('td:nth-child(2)');
      if (cb?.checked && codeCell) codes.push(codeCell.textContent.trim());
    });
    const q = new URLSearchParams({ lineKey, back: 'warehouse_outbound_list.html' });
    if (codes.length) q.set('assets', codes.join(','));
    window.location.href = `${backHref}?${q}`;
  });
}

function fillReturnFields(scope, sample) {
  scope.querySelectorAll('[data-return-field]').forEach(el => {
    const key = el.dataset.returnField;
    if (key === 'pendingQty') {
      el.innerHTML = `<span class="font-semibold text-slate-900">${sample.pendingQty}</span>`;
      return;
    }
    if (key === 'dueDate' && sample.status === '已延期' && sample.extendedDueDate) {
      el.innerHTML = `${sample.extendedDueDate} <span class="text-xs text-amber-600">（原 ${sample.dueDate}）</span>`;
      return;
    }
    if (sample[key] === undefined) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.type !== 'date' || sample[key]) el.value = sample[key];
    } else if (el.tagName === 'SELECT') {
      [...el.options].forEach(o => { o.selected = o.textContent.trim() === sample[key]; });
    } else {
      el.textContent = sample[key];
    }
  });
}

function initReturnLocationRows(pendingQty, isFixed = false) {
  const list = document.querySelector('[data-return-loc-list]');
  const addBtn = document.querySelector('[data-return-loc-add]');
  if (!list || !addBtn) return;

  const bindRow = (row) => {
    row.querySelector('[data-return-loc-remove]')?.addEventListener('click', () => {
      if (list.querySelectorAll('[data-return-loc-row]').length <= 1) return;
      row.remove();
    });
    const qtyInput = row.querySelector('[data-return-qty]');
    if (isFixed && qtyInput) {
      qtyInput.value = '1';
      qtyInput.max = '1';
      qtyInput.readOnly = true;
      qtyInput.classList.add('bg-slate-50', 'text-slate-500');
    }
  };

  list.querySelectorAll('[data-return-loc-row]').forEach(bindRow);

  addBtn.addEventListener('click', () => {
    const first = list.querySelector('[data-return-loc-row]');
    if (!first) return;
    const clone = first.cloneNode(true);
    clone.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
    clone.querySelectorAll('[data-return-qty]').forEach(i => {
      i.value = isFixed ? '1' : '';
      i.readOnly = !!isFixed;
    });
    if (!clone.querySelector('[data-return-loc-remove]')) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'mb-0.5 shrink-0 text-sm text-rose-600 hover:underline';
      del.dataset.returnLocRemove = '';
      del.textContent = '删除';
      clone.appendChild(del);
    }
    list.appendChild(clone);
    bindRow(clone);
  });

  document.querySelectorAll('[data-return-pending-qty-display]').forEach(el => { el.textContent = pendingQty; });
}

function initReturnFromQuery(root) {
  if (root.dataset.page !== 'warehouse_return_list') return;
  const title = root.dataset.title || '';
  if (!title.includes('归还') || title.includes('作废') || title.includes('归还成功')) return;

  const params = new URLSearchParams(window.location.search);
  const returnKey = params.get('returnKey');
  const viewMode = params.get('mode') === 'view';
  const backHref = params.get('back') || 'warehouse_return_list.html';

  if (!returnKey || !WMS_RETURN_PENDING_SAMPLES[returnKey]) return;

  const sample = { ...WMS_RETURN_PENDING_SAMPLES[returnKey], viewMode };
  const scope = document.querySelector('[data-wms-return-form]');
  if (scope) fillReturnFields(scope, sample);

  document.querySelectorAll('[data-return-back-link], .wms-modal-close').forEach(a => {
    a.setAttribute('href', backHref);
  });
  const backdrop = document.querySelector('.wms-modal-backdrop');
  if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) window.location.href = backHref; };

  const titleEl = document.getElementById('wms-modal-title');
  const typeLabel = WMS_RETURN_TYPE_LABELS[sample.materialType] || '执行归还';
  if (titleEl) {
    titleEl.textContent = viewMode ? `归还详情 · ${sample.requisitionNo}` : `${typeLabel} · ${sample.requisitionNo}`;
  }

  const breadcrumbEl = document.querySelector('.wms-app-shell header .text-xs.text-slate-500');
  if (breadcrumbEl) {
    breadcrumbEl.textContent = `物资管理 / ${typeLabel}${viewMode ? ' · 查看' : ''}`;
  }

  if (viewMode) {
    scope?.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true; });
  } else if (sample.materialType === 'fixed') {
    initReturnLocationRows('1', true);
    document.getElementById('wms-return-scan-asset')?.addEventListener('click', () => {
      const input = scope?.querySelector('[data-return-field="assetCodeConfirm"]');
      if (input && sample.assetCode) {
        input.value = sample.assetCode;
        showQrToast(`已识别资产码：${sample.assetCode}`);
      }
    });
  } else if (sample.materialType === 'like') {
    initReturnLocationRows(sample.pendingQty, false);
  }

  const submitBtn = document.querySelector('[data-return-submit]');
  submitBtn?.addEventListener('click', () => {
    const returnPerson = scope?.querySelector('[data-return-field="returnPerson"]');
    const operator = scope?.querySelector('[data-return-field="operator"]');
    const department = scope?.querySelector('[data-return-field="department"]');
    const dateInput = scope?.querySelector('[data-return-field="returnDate"]');
    const condition = scope?.querySelector('[data-return-field="condition"]');

    if (!dateInput?.value) { showSupplyCompleteToast('请选择归还日期'); return; }
    if (!condition?.value || condition.selectedIndex <= 0) { showSupplyCompleteToast('请选择实物状态'); return; }
    if (!returnPerson?.value || returnPerson.selectedIndex <= 0) { showSupplyCompleteToast('请选择归还人员'); return; }
    if (!operator?.value || operator.selectedIndex <= 0) { showSupplyCompleteToast('请选择验收人员'); return; }
    if (!department?.value || department.selectedIndex <= 0) { showSupplyCompleteToast('请选择验收部门'); return; }

    const returnNo = scope?.querySelector('[data-return-field="returnNo"]')?.value || 'HK202606090001';
    let totalQty = 0;

    if (sample.materialType === 'fixed') {
      const codeInput = scope?.querySelector('[data-return-field="assetCodeConfirm"]');
      if (!codeInput?.value?.trim()) { showSupplyCompleteToast('请扫码或输入资产编码'); return; }
      if (codeInput.value.trim() !== sample.assetCode) {
        showSupplyCompleteToast('资产编码与待还记录不一致');
        return;
      }
      totalQty = 1;
      const rows = [...document.querySelectorAll('[data-return-loc-row]')];
      for (const row of rows) {
        const wh = row.querySelector('[data-return-warehouse]');
        if (!wh?.value || wh.selectedIndex <= 0) { showSupplyCompleteToast('请选择回库仓库'); return; }
      }
      window.location.href = `warehouse_return_success.html?returnKey=${encodeURIComponent(returnKey)}&hk=${encodeURIComponent(returnNo)}&condition=${encodeURIComponent(condition.value)}&back=${encodeURIComponent(backHref)}`;
      return;
    }

    const qtyInput = scope?.querySelector('[data-return-field="thisReturnQty"]');
    const rows = [...document.querySelectorAll('[data-return-loc-row]')];
    if (qtyInput?.value) {
      totalQty = Number(qtyInput.value);
    } else {
      for (const row of rows) {
        const wh = row.querySelector('[data-return-warehouse]');
        const qty = row.querySelector('[data-return-qty]');
        if (!wh?.value || wh.selectedIndex <= 0) { showSupplyCompleteToast('请选择回库仓库'); return; }
        if (!qty?.value || Number(qty.value) <= 0) { showSupplyCompleteToast('请填写有效的归还数量'); return; }
        totalQty += Number(qty.value);
      }
    }

    if (!totalQty || totalQty <= 0) { showSupplyCompleteToast('请填写归还数量'); return; }
    if (totalQty > Number(sample.pendingQty)) {
      showSupplyCompleteToast(`归还数量不能超过待还数量 ${sample.pendingQty}`);
      return;
    }

    showSupplyCompleteToast(`${WMS_RETURN_TYPE_LABELS[sample.materialType] || '归还'}成功`);
    setTimeout(() => { window.location.href = backHref; }, 900);
  });
}

function initReturnConfirmFromQuery(root) {
  if (root.dataset.page !== 'mine_pending_return') return;
  if (!(root.dataset.title || '').includes('确认归还')) return;

  const params = new URLSearchParams(window.location.search);
  const returnKey = params.get('returnKey');
  const backHref = params.get('back') || 'mine_pending_return.html';
  if (!returnKey || !WMS_RETURN_PENDING_SAMPLES[returnKey]) return;

  const sample = WMS_RETURN_PENDING_SAMPLES[returnKey];
  document.querySelectorAll('[data-return-confirm-field]').forEach(el => {
    const key = el.dataset.returnConfirmField;
    if (key === 'outboundQty' && sample.outboundQty) {
      el.textContent = `${sample.outboundQty} ${sample.unit || ''}`.trim();
      return;
    }
    if (key === 'thisReturnQty') {
      el.textContent = `${sample.thisReturnQty || sample.returnedQty} ${sample.unit || ''}`.trim();
      return;
    }
    if (sample[key] !== undefined) el.textContent = sample[key];
  });

  const locBody = document.querySelector('[data-return-confirm-locations]');
  if (locBody && sample.locations?.length) {
    locBody.innerHTML = sample.locations.map((loc, i) =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm text-slate-700">${i + 1}</td><td class="px-3 py-2.5 text-sm text-slate-800">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm text-slate-800">${loc.shelf}</td><td class="px-3 py-2.5 text-sm text-slate-800">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium text-slate-900">${loc.qty}</td></tr>`
    ).join('');
  }

  document.querySelectorAll('[data-return-confirm-back], .wms-modal-close').forEach(a => {
    a.setAttribute('href', backHref);
  });
  const backdrop = document.querySelector('.wms-modal-backdrop');
  if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) window.location.href = backHref; };

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl) titleEl.textContent = `确认归还 · ${sample.requisitionNo}`;

  document.querySelector('[data-return-confirm-submit]')?.addEventListener('click', () => {
    showSupplyCompleteToast('归还确认成功，状态已更新为已归还');
    setTimeout(() => { window.location.href = `${backHref}?tab=${encodeURIComponent('已归还')}`; }, 900);
  });
}

function initReturnScrapFromQuery(root) {
  if (root.dataset.page !== 'warehouse_return_list') return;
  if (!(root.dataset.title || '').includes('作废')) return;

  const params = new URLSearchParams(window.location.search);
  const returnKey = params.get('returnKey') || 'LY202605200008-LA-00331';
  const backHref = params.get('back') || 'warehouse_return_list.html';
  const sample = WMS_RETURN_PENDING_SAMPLES[returnKey];
  const scope = document.querySelector('[data-wms-return-scrap-form]');

  if (sample && scope) {
    fillReturnFields(scope, sample);
  }

  document.querySelectorAll('[data-return-back-link]').forEach(a => { a.setAttribute('href', backHref); });

  document.querySelector('[data-return-scrap-submit]')?.addEventListener('click', () => {
    const reason = scope?.querySelector('[data-return-scrap-field="reason"]');
    const remark = scope?.querySelector('[data-return-scrap-field="remark"]');
    if (!reason?.value || reason.selectedIndex <= 0) { showSupplyCompleteToast('请选择作废原因'); return; }
    if (!remark?.value?.trim()) { showSupplyCompleteToast('请填写作废说明'); return; }
    showSupplyCompleteToast('作废成功');
    setTimeout(() => { window.location.href = backHref; }, 900);
  });
}

function initReturnSuccessFromQuery(root) {
  if (root.dataset.page !== 'warehouse_return_list') return;
  if (!(root.dataset.title || '').includes('归还成功')) return;

  const params = new URLSearchParams(window.location.search);
  const returnKey = params.get('returnKey') || 'LY202606010003-ZC202605012';
  const hk = params.get('hk') || 'HK202606090001';
  const condition = params.get('condition') || '完好';
  const sample = WMS_RETURN_PENDING_SAMPLES[returnKey];

  const titleEl = document.querySelector('[data-return-success-title]');
  const descEl = document.querySelector('[data-return-success-desc]');
  if (titleEl) titleEl.textContent = `归还成功 · ${sample?.name || '工程测量仪'}`;
  if (descEl) descEl.textContent = `归还单号 ${hk} · 领用单 ${sample?.requisitionNo || '—'}`;

  const nameEl = document.querySelector('[data-return-success-name]');
  const condEl = document.querySelector('[data-return-success-condition]');
  const locEl = document.querySelector('[data-return-success-location]');
  const borrowerEl = document.querySelector('[data-return-success-borrower]');
  if (nameEl) nameEl.textContent = sample?.name || '—';
  if (condEl) condEl.textContent = condition;
  if (locEl) locEl.textContent = '主仓库 / B区';
  if (borrowerEl) borrowerEl.textContent = sample?.borrower || '—';
}

function fillRefundFields(scope, sample) {
  scope.querySelectorAll('[data-refund-field]').forEach(el => {
    const key = el.dataset.refundField;
    if (key === 'pendingQty') {
      el.innerHTML = `<span class="font-semibold text-slate-900">${sample.pendingQty}</span>`;
      return;
    }
    if (key === 'sceneLabel') return;
    if (sample[key] === undefined) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.type !== 'date' || sample[key]) el.value = sample[key];
    } else if (el.tagName === 'SELECT') {
      [...el.options].forEach(o => { o.selected = o.textContent.trim() === sample[key]; });
    } else {
      el.textContent = sample[key];
    }
  });
}

function renderRefundAssetTags(listEl, codes) {
  if (!listEl) return;
  if (!codes.length) {
    listEl.innerHTML = '<p class="text-sm text-slate-400" data-refund-asset-empty>尚未选择资产编码</p>';
  } else {
    listEl.innerHTML = codes.map(c =>
      `<span class="mr-2 mb-2 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-sm font-mono ring-1 ring-slate-200" data-refund-asset-tag="${c}">${c}<button type="button" class="text-slate-400 hover:text-rose-600" data-refund-asset-remove="${c}">&times;</button></span>`
    ).join('');
  }
  document.querySelectorAll('[data-refund-asset-count]').forEach(el => { el.textContent = String(codes.length); });
}

function initRefundLocationRows(pendingQty) {
  const list = document.querySelector('[data-refund-loc-list]');
  const addBtn = document.querySelector('[data-refund-loc-add]');
  if (!list || !addBtn) return;

  const bindRow = (row) => {
    row.querySelector('[data-refund-loc-remove]')?.addEventListener('click', () => {
      if (list.querySelectorAll('[data-refund-loc-row]').length <= 1) return;
      row.remove();
    });
  };

  list.querySelectorAll('[data-refund-loc-row]').forEach(bindRow);

  addBtn.addEventListener('click', () => {
    const first = list.querySelector('[data-refund-loc-row]');
    if (!first) return;
    const clone = first.cloneNode(true);
    clone.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
    clone.querySelectorAll('[data-refund-qty]').forEach(i => { i.value = ''; });
    if (!clone.querySelector('[data-refund-loc-remove]')) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'mb-0.5 shrink-0 text-sm text-rose-600 hover:underline';
      del.dataset.refundLocRemove = '';
      del.textContent = '删除';
      clone.appendChild(del);
    }
    list.appendChild(clone);
    bindRow(clone);
  });

  document.querySelectorAll('[data-refund-pending-qty-display]').forEach(el => { el.textContent = pendingQty; });
}

function initRefundFromQuery(root) {
  if (root.dataset.page !== 'warehouse_refund_list') return;
  const title = root.dataset.title || '';
  if (!title.includes('退货') || title.includes('退货成功') || title.includes('选择退货资产')) return;

  const params = new URLSearchParams(window.location.search);
  const refundKey = params.get('refundKey');
  const viewMode = params.get('mode') === 'view';
  const backHref = params.get('back') || 'warehouse_refund_list.html';
  const preAssets = (params.get('assets') || '').split(',').filter(Boolean);

  if (!refundKey || !WMS_REFUND_PENDING_SAMPLES[refundKey]) return;

  const sample = { ...WMS_REFUND_PENDING_SAMPLES[refundKey], viewMode };
  const scope = document.querySelector('[data-wms-refund-form]');
  if (scope) fillRefundFields(scope, sample);

  document.querySelectorAll('[data-refund-back-link], .wms-modal-close').forEach(a => {
    a.setAttribute('href', backHref);
  });
  const backdrop = document.querySelector('.wms-modal-backdrop');
  if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) window.location.href = backHref; };

  const titleEl = document.getElementById('wms-modal-title');
  const sceneLabel = WMS_REFUND_SCENE_LABELS[sample.scene] || '执行退货';
  const typeLabel = sample.scene === 'post_inbound' ? (WMS_REFUND_TYPE_LABELS[sample.materialType] || sceneLabel) : sceneLabel;
  if (titleEl) {
    titleEl.textContent = viewMode ? `退货详情 · ${sample.supplyNo}` : `${typeLabel} · ${sample.name}`;
  }

  const breadcrumbEl = document.querySelector('.wms-app-shell header .text-xs.text-slate-500');
  if (breadcrumbEl) {
    breadcrumbEl.textContent = `物资管理 / ${typeLabel}${viewMode ? ' · 查看' : ''}`;
  }

  const assetListEl = document.querySelector('[data-refund-asset-list]');
  let selectedAssets = viewMode ? (sample.assetCodes?.length ? sample.assetCodes : []) : [...preAssets];

  const refreshAssets = () => {
    renderRefundAssetTags(assetListEl, selectedAssets);
    assetListEl?.querySelectorAll('[data-refund-asset-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.refundAssetRemove;
        selectedAssets = selectedAssets.filter(c => c !== code);
        refreshAssets();
      });
    });
  };

  if (viewMode) {
    scope?.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true; });
    if (sample.scene === 'post_inbound' && sample.materialType === 'fixed') {
      if (sample.status === '已退货' && !selectedAssets.length) selectedAssets = ['GD001001-004-A'];
      renderRefundAssetTags(assetListEl, selectedAssets);
    }
    const locSection = document.querySelector('[data-wms-refund-locations]');
    if (locSection && sample.locations?.length && sample.materialType === 'like') {
      const tr = sample.locations.map((loc, i) =>
        `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 text-sm">${i + 1}</td><td class="px-3 py-2.5 text-sm">${loc.warehouse}</td><td class="px-3 py-2.5 text-sm">${loc.shelf}</td><td class="px-3 py-2.5 text-sm">${loc.level}</td><td class="px-3 py-2.5 text-sm font-medium">${loc.qty}</td></tr>`
      ).join('');
      locSection.innerHTML = `<div class="mb-2"><h4 class="text-sm font-semibold text-slate-800">扣减货位</h4></div>
        <div class="overflow-hidden rounded-xl border border-slate-200"><table class="min-w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-3 py-2 text-left text-xs text-slate-500">序号</th><th class="px-3 py-2 text-left text-xs text-slate-500">仓库</th><th class="px-3 py-2 text-left text-xs text-slate-500">货架</th><th class="px-3 py-2 text-left text-xs text-slate-500">架层</th><th class="px-3 py-2 text-left text-xs text-slate-500">数量</th></tr></thead><tbody>${tr}</tbody></table></div>`;
    }
  } else if (sample.scene === 'post_inbound') {
    if (sample.materialType === 'fixed') {
      refreshAssets();
      document.getElementById('wms-refund-scan-asset')?.addEventListener('click', () => {
        const demo = 'GD001001-004-A';
        if (!selectedAssets.includes(demo)) selectedAssets.push(demo);
        refreshAssets();
        showQrToast(`已识别资产码：${demo}`);
      });
    } else if (sample.materialType === 'like') {
      initRefundLocationRows(sample.pendingQty);
    } else {
      document.querySelectorAll('[data-refund-pending-qty-display]').forEach(el => { el.textContent = sample.pendingQty; });
    }
  } else {
    document.querySelectorAll('[data-refund-pending-qty-display]').forEach(el => { el.textContent = sample.pendingQty; });
  }

  const submitBtn = document.querySelector('[data-refund-submit]');
  submitBtn?.addEventListener('click', () => {
    const operator = scope?.querySelector('[data-refund-field="operator"]');
    const department = scope?.querySelector('[data-refund-field="department"]');
    const dateInput = scope?.querySelector('[data-refund-field="refundDate"]');
    const reason = scope?.querySelector('[data-refund-field="refundReason"]');

    if (!dateInput?.value) { showSupplyCompleteToast('请选择退货日期'); return; }
    if (!reason?.value || reason.selectedIndex <= 0) { showSupplyCompleteToast('请选择退货原因'); return; }
    if (!operator?.value || operator.selectedIndex <= 0) { showSupplyCompleteToast('请选择经办人'); return; }
    if (!department?.value || department.selectedIndex <= 0) { showSupplyCompleteToast('请选择经办部门'); return; }

    const refundNo = scope?.querySelector('[data-refund-field="refundNo"]')?.value || 'TH202606090001';
    let totalQty = 0;

    if (sample.scene === 'pre_inbound') {
      const qtyInput = scope?.querySelector('[data-refund-field="thisRefundQty"]');
      totalQty = Number(qtyInput?.value);
      if (!totalQty || totalQty <= 0) { showSupplyCompleteToast('请填写退货数量'); return; }
      if (totalQty > Number(sample.pendingQty)) {
        showSupplyCompleteToast(`退货数量不能超过待退数量 ${sample.pendingQty}`);
        return;
      }
      window.location.href = `warehouse_refund_success.html?refundKey=${encodeURIComponent(refundKey)}&th=${encodeURIComponent(refundNo)}&qty=${encodeURIComponent(totalQty)}&back=${encodeURIComponent(backHref)}`;
      return;
    }

    if (sample.materialType === 'fixed') {
      totalQty = selectedAssets.length;
      if (totalQty <= 0) { showSupplyCompleteToast('请选择至少一个资产编码'); return; }
      if (totalQty > Number(sample.pendingQty)) {
        showSupplyCompleteToast(`退货数量不能超过待退数量 ${sample.pendingQty}`);
        return;
      }
      window.location.href = `warehouse_refund_success.html?refundKey=${encodeURIComponent(refundKey)}&th=${encodeURIComponent(refundNo)}&qty=${encodeURIComponent(totalQty)}&back=${encodeURIComponent(backHref)}`;
      return;
    }

    if (sample.materialType === 'like') {
      const rows = [...document.querySelectorAll('[data-refund-loc-row]')];
      for (const row of rows) {
        const wh = row.querySelector('[data-refund-warehouse]');
        const qty = row.querySelector('[data-refund-qty]');
        if (!wh?.value || wh.selectedIndex <= 0) { showSupplyCompleteToast('请选择扣减仓库'); return; }
        if (!qty?.value || Number(qty.value) <= 0) { showSupplyCompleteToast('请填写有效的退货数量'); return; }
        totalQty += Number(qty.value);
      }
    } else {
      const qtyInput = scope?.querySelector('[data-refund-field="thisRefundQty"]');
      totalQty = Number(qtyInput?.value);
      if (!totalQty || totalQty <= 0) { showSupplyCompleteToast('请填写本次退货数量'); return; }
    }

    if (totalQty > Number(sample.pendingQty)) {
      showSupplyCompleteToast(`退货数量不能超过待退数量 ${sample.pendingQty}`);
      return;
    }

    showSupplyCompleteToast(`${WMS_REFUND_TYPE_LABELS[sample.materialType] || '退货'}成功`);
    setTimeout(() => { window.location.href = backHref; }, 900);
  });
}

function initRefundSuccessFromQuery(root) {
  if (root.dataset.page !== 'warehouse_refund_list') return;
  if (!(root.dataset.title || '').includes('退货成功')) return;

  const params = new URLSearchParams(window.location.search);
  const refundKey = params.get('refundKey') || 'GH2025004-YS02-TH';
  const th = params.get('th') || 'TH202606090001';
  const qty = params.get('qty') || '1';
  const sample = WMS_REFUND_PENDING_SAMPLES[refundKey];

  const titleEl = document.querySelector('[data-refund-success-title]');
  const descEl = document.querySelector('[data-refund-success-desc]');
  if (titleEl) titleEl.textContent = `退货成功 · ${sample?.name || '螺丝刀'}`;
  if (descEl) descEl.textContent = `退货单号 ${th} · 供货单 ${sample?.supplyNo || '—'}`;

  const nameEl = document.querySelector('[data-refund-success-name]');
  const sceneEl = document.querySelector('[data-refund-success-scene]');
  const supplierEl = document.querySelector('[data-refund-success-supplier]');
  const qtyEl = document.querySelector('[data-refund-success-qty]');
  if (nameEl) nameEl.textContent = sample?.name || '—';
  if (sceneEl) sceneEl.textContent = sample?.scene === 'post_inbound' ? '在库' : '验收前';
  if (supplierEl) supplierEl.textContent = sample?.supplier || '—';
  if (qtyEl) qtyEl.textContent = `${qty} ${sample?.unit || ''}`.trim();
}

function initRefundSelectAsset(root) {
  if (root.dataset.page !== 'warehouse_refund_list') return;
  if (!(root.dataset.title || '').includes('选择退货资产')) return;

  const params = new URLSearchParams(window.location.search);
  const backHref = params.get('back') || 'warehouse_refund_fixed_form.html';
  const refundKey = params.get('refundKey') || 'GH2025004-YS02-TH';
  const confirmBtn = document.querySelector('.wms-modal-footer .wms-btn-primary');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const codes = [];
    document.querySelectorAll('.wms-modal-table-wrap tbody tr').forEach(tr => {
      const cb = tr.querySelector('input[type="checkbox"]');
      const codeCell = tr.querySelector('td:nth-child(2)');
      if (cb?.checked && codeCell) codes.push(codeCell.textContent.trim());
    });
    const q = new URLSearchParams({ refundKey, back: 'warehouse_refund_list.html' });
    if (codes.length) q.set('assets', codes.join(','));
    window.location.href = `${backHref}?${q}`;
  });
}

function initAssetPageFromQuery(root) {
  const page = root.dataset.page;
  if (page !== 'ledger_warehouse') return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return;

  const asset = WMS_ASSET_SAMPLES[code] || {
    code,
    materialCode: code,
    name: params.get('name') || '—',
    location: '—',
    status: '—',
    time: '—',
  };
  const qrData = encodeURIComponent(`wms://asset/${code}`);
  const backHref = params.get('back');

  document.querySelectorAll('.wms-qr-image').forEach(img => {
    const size = img.width || img.getAttribute('width') || 160;
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrData}`;
    img.alt = `资产二维码 ${code}`;
  });

  document.querySelectorAll('[data-asset-field="code"]').forEach(el => { el.textContent = asset.code; });
  document.querySelectorAll('[data-asset-field="materialCode"]').forEach(el => { el.textContent = asset.materialCode; });
  document.querySelectorAll('[data-asset-field="name"]').forEach(el => { el.textContent = asset.name; });
  document.querySelectorAll('[data-asset-field="location"]').forEach(el => { el.textContent = asset.location; });
  document.querySelectorAll('.font-mono.text-sm.font-semibold, .font-mono.text-xs.font-semibold').forEach(el => {
    if (/^(ZC|GD)/.test(el.textContent.trim())) el.textContent = code;
  });

  document.querySelectorAll('.wms-qr-download-single').forEach(btn => {
    btn.dataset.assetCode = code;
  });

  document.querySelectorAll('code.rounded').forEach(el => {
    if (el.textContent.includes('wms://asset/')) el.textContent = `wms://asset/${code}`;
  });

  if (backHref) {
    const backdrop = document.querySelector('.wms-modal-backdrop');
    backdrop?.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes('ledger_warehouse.html')) a.setAttribute('href', backHref);
    });
    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) window.location.href = backHref;
      };
    }
  }

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl && /资产|二维码/.test(root.dataset.title || '')) {
    titleEl.textContent = `${root.dataset.title} · ${code}`;
  }
}

function initWarehouseConfig(root) {
  const layout = root.querySelector('.wms-warehouse-layout');
  if (!layout) return;

  const tabBtns = layout.querySelectorAll('[data-wms-warehouse-tabs] .wms-tab-btn');
  const panels = layout.querySelectorAll('[data-wms-tab-panel]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      panels.forEach(p => {
        p.classList.toggle('hidden', p.dataset.wmsTabPanel !== tab);
      });
    });
  });

  const zoneNodes = layout.querySelectorAll('.wms-tree-node--zone');
  const detail = layout.querySelector('[data-wms-zone-detail]');
  const shelfPanel = layout.querySelector('[data-wms-shelf-panel]');
  const checkAll = layout.querySelector('#wms-shelf-check-all');
  const batchBtn = layout.querySelector('#wms-warehouse-batch-loc-qr');
  const activeZoneEl = layout.querySelector('[data-wms-active-zone]');
  const totalEl = layout.querySelector('[data-wms-shelf-total]');

  function visibleShelfChecks() {
    if (!shelfPanel) return [];
    return [...shelfPanel.querySelectorAll('tr[data-shelf-row]:not(.hidden) .wms-shelf-check')];
  }

  function filterShelvesByZone(zoneName) {
    if (activeZoneEl) activeZoneEl.textContent = zoneName;
    if (batchBtn) batchBtn.dataset.zoneName = zoneName;
    applyShelfFilters();
    visibleShelfChecks().forEach(cb => { cb.checked = true; });
    updateShelfSelectedCount(root);
  }

  zoneNodes.forEach(node => {
    node.addEventListener('click', () => {
      zoneNodes.forEach(n => n.classList.remove('is-active', 'bg-blue-50/80', 'text-blue-600'));
      zoneNodes.forEach(n => n.classList.add('text-slate-600'));
      node.classList.add('is-active', 'bg-blue-50/80', 'text-blue-600');
      node.classList.remove('text-slate-600');
      const name = node.dataset.zoneName || 'A区';
      const id = node.dataset.zoneId || '45544';
      if (detail) {
        const title = detail.querySelector('h3');
        if (title) title.textContent = `${name}（ID：${id}）`;
      }
      filterShelvesByZone(name);
    });
  });

  const filterRoot = layout.querySelector('[data-wms-shelf-filters]');
  const statusFilter = filterRoot?.querySelector('[data-wms-filter="status"]');
  const ownerFilter = filterRoot?.querySelector('[data-wms-filter="owner"]');
  const layersFilter = filterRoot?.querySelector('[data-wms-filter="layers"]');
  const filterReset = filterRoot?.querySelector('[data-wms-filter-reset]');

  function applyShelfFilters() {
    if (!shelfPanel) return;
    const zoneName = activeZoneEl?.textContent || 'A区';
    const status = statusFilter?.value || 'all';
    const owner = ownerFilter?.value || 'all';
    const layers = layersFilter?.value || 'all';
    let visible = 0;
    shelfPanel.querySelectorAll('tr[data-shelf-row]').forEach(row => {
      if (row.dataset.shelfZone !== zoneName) {
        row.classList.add('hidden');
        return;
      }
      const enabled = row.dataset.shelfEnabled === 'true';
      const statusMatch = status === 'all' || (status === 'enabled' && enabled) || (status === 'disabled' && !enabled);
      const ownerMatch = owner === 'all' || row.dataset.shelfOwner === owner;
      const layerNum = parseInt(row.dataset.shelfLayers, 10) || 0;
      const layersMatch = layers === 'all'
        || (layers === '6-8' && layerNum >= 6 && layerNum <= 8)
        || (layers === '9-10' && layerNum >= 9 && layerNum <= 10);
      const show = statusMatch && ownerMatch && layersMatch;
      row.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    if (totalEl) totalEl.textContent = `共 ${visible} 条`;
    if (checkAll) {
      checkAll.checked = false;
      checkAll.indeterminate = false;
    }
    updateShelfSelectedCount(root);
  }

  if (filterRoot) {
    filterRoot.addEventListener('change', (e) => {
      if (e.target.matches('[data-wms-filter]')) applyShelfFilters();
    });
    filterReset?.addEventListener('click', () => {
      if (statusFilter) statusFilter.value = 'all';
      if (ownerFilter) ownerFilter.value = 'all';
      if (layersFilter) layersFilter.value = 'all';
      applyShelfFilters();
    });
  }

  if (shelfPanel) {
    shelfPanel.addEventListener('change', (e) => {
      if (e.target.id === 'wms-shelf-check-all') {
        visibleShelfChecks().forEach(cb => { cb.checked = e.target.checked; });
        updateShelfSelectedCount(root);
        return;
      }
      if (!e.target.classList.contains('wms-shelf-check')) return;
      if (checkAll) {
        const all = visibleShelfChecks();
        checkAll.checked = all.length > 0 && all.every(cb => cb.checked);
        checkAll.indeterminate = !checkAll.checked && all.some(cb => cb.checked);
      }
      updateShelfSelectedCount(root);
    });
    updateShelfSelectedCount(root);
  }

  applyShelfFilters();
}

function initModal(root, title, contentHtml) {
  const wrap = document.createElement('div');
  wrap.innerHTML = contentHtml.trim();
  const modalSource = wrap.querySelector('[data-wms-modal]');
  if (!modalSource) return;

  const backHref = modalSource.dataset.modalBack || '#';
  const size = modalSource.dataset.modalSize || 'md';
  const sizeClass = {
    sm: 'wms-modal--sm',
    md: 'wms-modal--md',
    lg: 'wms-modal--lg',
    xl: 'wms-modal--xl',
    'xl-detail': 'wms-modal--xl-detail',
  }[size] || 'wms-modal--md';
  const isSupplierDetail = size === 'xl-detail' || !!modalSource.querySelector('[data-wms-supplier-detail]');
  const bodyExtraClass = isSupplierDetail ? ' wms-modal-body--supplier-detail' : '';

  const footerEl = modalSource.querySelector('.wms-modal-footer');
  let footerHtml = '';
  if (footerEl) {
    footerHtml = footerEl.outerHTML;
    footerEl.remove();
  }
  const inner = modalSource.innerHTML;
  document.body.classList.add('wms-modal-open');

  const preservedDataAttrs = [...modalSource.attributes]
    .filter(a => a.name.startsWith('data-') && !['data-wms-modal', 'data-modal-back', 'data-modal-size'].includes(a.name))
    .map(a => `${a.name}="${a.value.replace(/"/g, '&quot;')}"`)
    .join(' ');

  const backdrop = document.createElement('div');
  backdrop.className = 'wms-modal-backdrop';
  backdrop.setAttribute('role', 'presentation');
  backdrop.dataset.modalBack = backHref;
  backdrop.innerHTML = `
    <div class="wms-modal ${sizeClass}" role="dialog" aria-modal="true" aria-labelledby="wms-modal-title">
      <div class="wms-modal-header">
        <h2 id="wms-modal-title" class="wms-modal-title">${title}</h2>
        <a href="${backHref}" class="wms-modal-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></a>
      </div>
      <div class="wms-modal-body${bodyExtraClass}"${preservedDataAttrs ? ` ${preservedDataAttrs}` : ''}>${inner}</div>
      ${footerHtml}
    </div>
  `;

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) window.location.href = backHref;
  });
  backdrop.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-supplier-tab]');
    if (!tabBtn || !backdrop.querySelector('[data-wms-supplier-tabs]')) return;
    const tab = tabBtn.dataset.supplierTab;
    const body = backdrop.querySelector('.wms-modal-body');
    body?.querySelectorAll('[data-wms-supplier-tabs] .wms-tab-btn, [data-wms-supplier-detail] .wms-supplier-tabs .wms-tab-btn').forEach(b => b.classList.toggle('is-active', b === tabBtn));
    body?.querySelectorAll('[data-supplier-panel]').forEach(p => {
      p.classList.toggle('hidden', p.dataset.supplierPanel !== tab);
    });
  });

  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', onEsc);
      window.location.href = backHref;
    }
  });

  document.body.appendChild(backdrop);

  // Shell 内仍有一份相同 HTML，且 modal-open 时 pointer-events:none，会导致弹层表单无事件绑定
  const shellDup = document.querySelector('.wms-app-shell [data-wms-modal]');
  if (shellDup) {
    const mainWrap = shellDup.closest('.mx-auto');
    if (mainWrap) mainWrap.innerHTML = '';
    else shellDup.remove();
  }
}

const WMS_EVAL_INDICATORS = [
  { key: 'quality', name: '产品质量', weight: 0.4 },
  { key: 'delivery', name: '交货及时性', weight: 0.2 },
  { key: 'service', name: '售后服务', weight: 0.2 },
  { key: 'price', name: '价格合理性', weight: 0.2 },
];

const WMS_EVAL_GRADES = [
  { name: '优秀', min: 9, max: 10 },
  { name: '良好', min: 7, max: 9 },
  { name: '合格', min: 6, max: 7 },
  { name: '不合格', min: 0, max: 6 },
];

const WMS_EVAL_BONUS_PENALTY_MAX = 2;

const WMS_SUPPLIER_SAMPLES = {
  GYS001: { code: 'GYS001', name: '科尼', shortName: '科尼', status: '正常', type: '设备配件供应商', contact: '李四', phone: '13912345678', address: '上海市浦东新区张江路 88 号', createdAt: '2024-03-15', latestScore: '8.60', latestGrade: '良好', latestEvalDate: '2025-12-30', latestEvalNo: 'PJ2025001', supplies: [{ no: 'GH2025001', material: '抓斗', qty: '10 / 10 个', status: '已供货', date: '2025-08-01' }], acceptances: [{ no: 'GH2025001-YS01', supplyNo: 'GH2025001', material: '抓斗', qualified: '10', unqualified: '0', date: '2025-08-08', status: '已验收' }], refunds: [], evalHistory: [{ evalNo: 'PJ2025001', evalName: '2025年度设备配件类供应商评价', period: '2025年度', score: '8.60', grade: '良好', evalDate: '2025-12-30', status: '审核通过' }, { evalNo: 'PJ2025002', evalName: '2025年度维修工具类供应商评价', period: '2025年度', score: '8.60', grade: '良好', evalDate: '2025-12-30', status: '审核中' }] },
  GYS002: { code: 'GYS002', name: '上海佩纳', shortName: '上海佩纳', status: '正常', type: '设备配件供应商', contact: '李四', phone: '13912345678', address: '上海市嘉定区工业路 12 号', createdAt: '2024-05-20', latestScore: '8.10', latestGrade: '良好', latestEvalDate: '2025-12-30', latestEvalNo: 'PJ2025001', supplies: [{ no: 'GH2025002', material: '料斗', qty: '10 / 10 个', status: '已供货', date: '2025-09-01' }], acceptances: [{ no: 'GH2025002-YS01', supplyNo: 'GH2025002', material: '料斗', qualified: '10', unqualified: '0', date: '2025-11-16', status: '已验收' }], refunds: [], evalHistory: [{ evalNo: 'PJ2025001', evalName: '2025年度设备配件类供应商评价', period: '2025年度', score: '8.10', grade: '良好', evalDate: '2025-12-30', status: '审核通过' }] },
  GYS003: { code: 'GYS003', name: '河南蒲瑞', shortName: '河南蒲瑞', status: '正常', type: '设备配件供应商', contact: '李经理', phone: '13800001234', address: '河南省郑州市高新区', createdAt: '2024-06-10', latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—', supplies: [{ no: 'GH2025003', material: '钢丝绳', qty: '100 / 50 m', status: '供货中', date: '2025-10-15' }], acceptances: [{ no: 'GH2025003-YS01', supplyNo: 'GH2025003', material: '钢丝绳', qualified: '50', unqualified: '0', date: '2025-11-20', status: '验收中' }], refunds: [{ no: 'TH20251121001', supplyNo: 'GH2025003', material: '钢丝绳', qty: '30 m', reason: '质量问题', date: '2025-11-21', status: '部分退货' }], evalHistory: [] },
  GYS004: { code: 'GYS004', name: '江苏华能电子有限公司', shortName: '江苏华能', status: '正常', type: '耗材供应商', contact: '王工', phone: '13911112233', address: '江苏省南京市江宁区', createdAt: '2024-08-01', latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—', supplies: [{ no: 'GH2025004', material: '螺丝刀', qty: '20 / 10 个', status: '供货中', date: '2025-11-01' }], acceptances: [{ no: 'GH2025004-YS01', supplyNo: 'GH2025004', material: '螺丝刀', qualified: '9', unqualified: '1', date: '2025-11-22', status: '验收中' }], refunds: [{ no: 'GH2025004-YS02-TH', supplyNo: 'GH2025004', material: '螺丝刀', qty: '1 个', reason: '验收不合格', date: '—', status: '待退货' }], evalHistory: [] },
  GYS005: { code: 'GYS005', name: '宁波北仑君威有限公司', shortName: '宁波北仑君威', status: '暂停', type: '耗材供应商', contact: '李四', phone: '13912345678', address: '浙江省宁波市北仑区', createdAt: '2024-09-12', latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—', supplies: [{ no: 'GH2025005', material: '扳手', qty: '20 / 0 个', status: '待供货', date: '2025-12-01' }], acceptances: [], refunds: [], evalHistory: [] },
  GYS006: { code: 'GYS006', name: '华建物资有限公司', shortName: '华建物资', status: '正常', type: '电气材料供应商', contact: '陈经理', phone: '13888888221', address: '湖北省黄冈市武穴市', createdAt: '2026-01-15', latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—', supplies: [{ no: 'GH202605280002', material: '电缆 YJV-3×2.5', qty: '100 / 100 m', status: '已供货', date: '2026-05-28' }], acceptances: [], refunds: [{ no: 'TH202606030001', supplyNo: 'GH202605280002', material: '电缆 YJV-3×2.5', qty: '100 m', reason: '规格不符', date: '2026-06-03', status: '已退货' }], evalHistory: [] },
  GYS007: { code: 'GYS007', name: '鄂东办公用品', shortName: '鄂东办公', status: '正常', type: '办公耗材供应商', contact: '刘主管', phone: '13933333002', address: '湖北省黄冈市', createdAt: '2026-02-20', latestScore: '—', latestGrade: '—', latestEvalDate: '—', latestEvalNo: '—', supplies: [{ no: 'GH2025002', material: '安全帽', qty: '200 / 200 顶', status: '已供货', date: '2025-11-10' }], acceptances: [{ no: 'GH2025002-YS01', supplyNo: 'GH2025002', material: '安全帽', qualified: '200', unqualified: '0', date: '2025-11-16', status: '已验收' }], refunds: [{ no: 'RK202509002-TH01', supplyNo: 'GH2025002', material: '安全帽', qty: '50 顶', reason: '在库退货', date: '—', status: '待退货' }], evalHistory: [] },
};

const WMS_EVAL_ORDER_SAMPLES = {
  PJ2025001: { no: 'PJ2025001', name: '2025年度设备配件类供应商评价', evaluator: '李四', evalDate: '2025-12-30', evalPeriod: '年度', periodStart: '2025-01-01', periodEnd: '2025-12-31', status: '审核通过', orderRemark: '年度例行评价', configVersion: 'V2026-001', lines: [{ code: 'GYS001', name: '科尼', quality: 9, delivery: 8, service: 8, price: 9, bonus: 0, penalty: 0, remark: '' }, { code: 'GYS002', name: '上海佩纳', quality: 8, delivery: 9, service: 7, price: 8, bonus: 0, penalty: 0, remark: '' }] },
  PJ2025002: { no: 'PJ2025002', name: '2025年度维修工具类供应商评价', evaluator: '李四', evalDate: '2025-12-30', evalPeriod: '年度', periodStart: '2025-01-01', periodEnd: '2025-12-31', status: '审核中', orderRemark: '', configVersion: 'V2026-001', lines: [{ code: 'GYS001', name: '科尼', quality: 9, delivery: 8, service: 8, price: 9, bonus: 0, penalty: 0, remark: '' }] },
  PJ2024001: { no: 'PJ2024001', name: '2024年度评价', evaluator: '李四', evalDate: '2025-12-28', evalPeriod: '年度', periodStart: '2024-01-01', periodEnd: '2024-12-31', status: '草稿', orderRemark: '', configVersion: 'V2026-001', lines: [] },
  PJ2023001: { no: 'PJ2023001', name: '2023年度耗材类供应商评价', evaluator: '张三', evalDate: '2024-01-10', evalPeriod: '年度', periodStart: '2023-01-01', periodEnd: '2023-12-31', status: '已驳回', orderRemark: '', configVersion: 'V2025-002', rejectReason: '评价期间数据不完整，请补充供货记录后重提', lines: [] },
};

function wmsSupplierGradeBadge(grade) {
  if (!grade || grade === '—') return '—';
  const map = { 优秀: 'success', 良好: 'info', 合格: 'warning', 不合格: 'danger' };
  return statusBadge(grade, map[grade] || 'info');
}

function wmsSupplierStatusBadge(status) {
  const map = { 正常: 'success', 暂停: 'warning', 黑名单: 'danger' };
  return statusBadge(status, map[status] || 'info');
}

function wmsEvalMatchGrade(score) {
  const s = Number(score);
  if (Number.isNaN(s)) return '—';
  for (const g of WMS_EVAL_GRADES) {
    const inMax = g.max === 10 ? s <= 10 : s < g.max;
    if (s >= g.min && inMax) return g.name;
  }
  return '—';
}

function wmsEvalCalcLine(row) {
  let weighted = 0;
  let wSum = 0;
  WMS_EVAL_INDICATORS.forEach(({ key, weight }) => {
    const inp = row.querySelector(`[data-eval-dimension="${key}"]`);
    const v = parseFloat(inp?.value);
    if (!Number.isNaN(v)) {
      weighted += v * weight;
      wSum += weight;
    }
  });
  let base = wSum > 0 ? weighted / wSum : 0;
  const bonus = parseFloat(row.querySelector('[data-eval-field="bonus"]')?.value) || 0;
  const penalty = parseFloat(row.querySelector('[data-eval-field="penalty"]')?.value) || 0;
  let total = Math.min(10, Math.max(0, base + bonus - penalty));
  total = Math.round(total * 100) / 100;
  const totalEl = row.querySelector('[data-eval-total]');
  const gradeEl = row.querySelector('[data-eval-grade-cell]');
  const grade = wmsEvalMatchGrade(total);
  if (totalEl) totalEl.textContent = wSum > 0 ? String(total) : '—';
  if (gradeEl) {
    const cls = grade === '优秀' ? 'text-emerald-700' : grade === '良好' ? 'text-blue-700' : grade === '合格' ? 'text-amber-700' : grade === '不合格' ? 'text-rose-700' : 'text-slate-500';
    gradeEl.innerHTML = grade === '—' ? '—' : `<span class="font-medium ${cls}">${grade}</span>`;
  }
  return total;
}

function wmsEvalRenumberLines(tbody) {
  tbody?.querySelectorAll('[data-wms-eval-line]').forEach((row, i) => {
    const seq = row.querySelector('[data-eval-seq]');
    if (seq) seq.textContent = String(i + 1);
  });
}

function wmsEvalBindLineRow(row, tbody) {
  row.querySelectorAll('[data-eval-dimension], [data-eval-field="bonus"], [data-eval-field="penalty"]').forEach(inp => {
    inp.addEventListener('input', () => wmsEvalCalcLine(row));
    inp.addEventListener('change', () => wmsEvalCalcLine(row));
  });
  const del = row.querySelector('[data-eval-line-delete]');
  if (del) {
    del.addEventListener('click', () => {
      row.remove();
      wmsEvalRenumberLines(tbody);
    });
  }
  wmsEvalCalcLine(row);
}

function wmsEvalCreateLineRowHTML(line, readOnly = false) {
  const inputCls = 'w-full min-w-[4rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200';
  const roCls = 'w-full min-w-[4rem] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-600';
  const cls = readOnly ? roCls : inputCls;
  const dis = readOnly ? ' readonly' : '';
  const indCells = WMS_EVAL_INDICATORS.map(i =>
    `<td class="px-3 py-2 whitespace-nowrap"><input type="number" step="0.1" min="0" max="10" value="${line[i.key] ?? ''}" data-eval-dimension="${i.key}"${dis} class="${cls}" /></td>`
  ).join('');
  const delBtn = readOnly ? '' : '<button type="button" class="text-rose-600 hover:underline" data-eval-line-delete>删除</button>';
  return `<tr class="border-t border-slate-100 hover:bg-slate-50/50" data-wms-eval-line data-supplier-code="${line.code}">
    <td class="px-3 py-2 text-sm text-slate-500 whitespace-nowrap" data-eval-seq>1</td>
    <td class="px-3 py-2 text-sm font-mono text-slate-600 whitespace-nowrap"><a href="supplier_detail.html?code=${line.code}" class="hover:underline">${line.code}</a></td>
    <td class="px-3 py-2 text-sm text-slate-800 whitespace-nowrap">${line.name}</td>
    ${indCells}
    <td class="px-3 py-2 whitespace-nowrap"><input type="number" step="0.1" min="0" max="${WMS_EVAL_BONUS_PENALTY_MAX}" value="${line.bonus ?? 0}" data-eval-field="bonus"${dis} class="${cls}" /></td>
    <td class="px-3 py-2 whitespace-nowrap"><input type="number" step="0.1" min="0" max="${WMS_EVAL_BONUS_PENALTY_MAX}" value="${line.penalty ?? 0}" data-eval-field="penalty"${dis} class="${cls}" /></td>
    <td class="px-3 py-2 text-sm font-medium text-slate-900 whitespace-nowrap" data-eval-total>—</td>
    <td class="px-3 py-2 whitespace-nowrap" data-eval-grade-cell>—</td>
    <td class="px-3 py-2 whitespace-nowrap"><input type="text" value="${line.remark || ''}" placeholder="有加减分时必填" data-eval-field="lineRemark"${dis} class="${cls}" /></td>
    <td class="wms-col-actions px-3 py-2 text-right text-sm whitespace-nowrap">${delBtn}</td>
  </tr>`;
}

function wmsEvalRebuildLines(tbody, lines, readOnly = false) {
  if (!tbody) return;
  if (!lines?.length) {
    tbody.innerHTML = '<tr data-wms-eval-empty><td colspan="20" class="px-4 py-8 text-center text-sm text-slate-400">请点击「选择供应商」添加评价对象</td></tr>';
    return;
  }
  tbody.innerHTML = lines.map(l => wmsEvalCreateLineRowHTML(l, readOnly)).join('');
  tbody.querySelectorAll('[data-wms-eval-line]').forEach(row => wmsEvalBindLineRow(row, tbody));
  wmsEvalRenumberLines(tbody);
}

function wmsEvalValidateForm(form) {
  const name = form.querySelector('[data-eval-field="evalName"]')?.value?.trim();
  if (!name) { alert('请填写评价名称'); return false; }
  const rows = [...form.querySelectorAll('[data-wms-eval-line]')];
  if (!rows.length) { alert('请至少选择一家供应商'); return false; }
  const codes = new Set();
  for (const row of rows) {
    const code = row.dataset.supplierCode;
    if (codes.has(code)) { alert(`供应商 ${code} 重复，请删除重复行`); return false; }
    codes.add(code);
    for (const { key } of WMS_EVAL_INDICATORS) {
      const v = parseFloat(row.querySelector(`[data-eval-dimension="${key}"]`)?.value);
      if (Number.isNaN(v) || v < 0 || v > 10) { alert(`请为 ${code} 填写完整的维度评分（0～10）`); return false; }
    }
    const bonus = parseFloat(row.querySelector('[data-eval-field="bonus"]')?.value) || 0;
    const penalty = parseFloat(row.querySelector('[data-eval-field="penalty"]')?.value) || 0;
    const remark = row.querySelector('[data-eval-field="lineRemark"]')?.value?.trim();
    if (bonus > WMS_EVAL_BONUS_PENALTY_MAX || penalty > WMS_EVAL_BONUS_PENALTY_MAX) {
      alert(`特殊加分/扣分单项上限为 ${WMS_EVAL_BONUS_PENALTY_MAX} 分`); return false;
    }
    if ((bonus > 0 || penalty > 0) && !remark) {
      alert(`供应商 ${code} 有加分或扣分时须填写行备注`); return false;
    }
  }
  return true;
}

function wmsModalScope() {
  return document.querySelector('.wms-modal-backdrop .wms-modal-body') || document.querySelector('[data-wms-modal]');
}

function initSupplierEvalForm(root) {
  const form = wmsModalScope()?.matches('[data-wms-supplier-eval-form]')
    ? wmsModalScope()
    : wmsModalScope()?.querySelector('[data-wms-supplier-eval-form]') || document.querySelector('[data-wms-supplier-eval-form]');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const evalKey = params.get('evalKey');
  const viewMode = params.get('mode') === 'view' || form.dataset.evalView === '1';
  const sample = evalKey ? WMS_EVAL_ORDER_SAMPLES[evalKey] : null;
  const readOnly = viewMode || ['审核通过', '审核中'].includes(sample?.status || form.dataset.evalStatus);

  if (sample) {
    const setVal = (sel, val) => { const el = form.querySelector(sel); if (el && val != null && val !== '') el.value = val; };
    setVal('[data-eval-order-no]', sample.no);
    setVal('[data-eval-field="evalName"]', sample.name);
    setVal('[data-eval-field="evalDate"]', sample.evalDate);
    setVal('[data-eval-field="evaluator"]', sample.evaluator);
    setVal('[data-eval-field="evalPeriod"]', sample.evalPeriod);
    setVal('[data-eval-field="periodStart"]', sample.periodStart);
    setVal('[data-eval-field="periodEnd"]', sample.periodEnd);
    setVal('[data-eval-field="orderRemark"]', sample.orderRemark);
    setVal('[data-eval-config-version]', sample.configVersion);
    const tbody = form.querySelector('[data-wms-eval-lines-tbody]');
    wmsEvalRebuildLines(tbody, sample.lines, readOnly);
    if (viewMode) {
      document.title = '查看评价 · 物资管理系统';
      const titleEl = document.getElementById('wms-modal-title');
      if (titleEl) titleEl.textContent = '查看评价';
    }
  } else {
    const picked = sessionStorage.getItem('wms_eval_picked_suppliers');
    if (picked) {
      try {
        const suppliers = JSON.parse(picked);
        const tbody = form.querySelector('[data-wms-eval-lines-tbody]');
        const existing = new Set([...form.querySelectorAll('[data-wms-eval-line]')].map(r => r.dataset.supplierCode));
        const newLines = suppliers.filter(s => !existing.has(s.code)).map(s => ({
          code: s.code, name: s.name, quality: '', delivery: '', service: '', price: '', bonus: 0, penalty: 0, remark: '',
        }));
        const currentLines = [...form.querySelectorAll('[data-wms-eval-line]')].map(row => ({
          code: row.dataset.supplierCode,
          name: row.querySelector('td:nth-child(3)')?.textContent?.trim(),
          quality: row.querySelector('[data-eval-dimension="quality"]')?.value,
          delivery: row.querySelector('[data-eval-dimension="delivery"]')?.value,
          service: row.querySelector('[data-eval-dimension="service"]')?.value,
          price: row.querySelector('[data-eval-dimension="price"]')?.value,
          bonus: row.querySelector('[data-eval-field="bonus"]')?.value || 0,
          penalty: row.querySelector('[data-eval-field="penalty"]')?.value || 0,
          remark: row.querySelector('[data-eval-field="lineRemark"]')?.value || '',
        }));
        wmsEvalRebuildLines(tbody, [...currentLines, ...newLines], false);
      } catch (_) { /* ignore */ }
      sessionStorage.removeItem('wms_eval_picked_suppliers');
    }
    const tbody = form.querySelector('[data-wms-eval-lines-tbody]');
    if (tbody) {
      tbody.querySelectorAll('[data-wms-eval-line]').forEach(row => wmsEvalBindLineRow(row, tbody));
      wmsEvalRenumberLines(tbody);
    }
  }

  form.querySelector('[data-eval-save-draft]')?.addEventListener('click', () => {
    window.location.href = form.dataset.modalBack || 'supplier_eval_list.html';
  });
  form.querySelector('[data-eval-submit]')?.addEventListener('click', () => {
    if (!wmsEvalValidateForm(form)) return;
    window.location.href = form.dataset.modalBack || 'supplier_eval_list.html';
  });
}

function initSupplierEvalSelect(root) {
  const scope = wmsModalScope();
  const page = scope?.matches('[data-wms-supplier-eval-select]')
    ? scope
    : scope?.querySelector('[data-wms-supplier-eval-select]') || document.querySelector('[data-wms-supplier-eval-select]');
  if (!page) return;
  page.querySelector('[data-eval-select-all]')?.addEventListener('change', e => {
    page.querySelectorAll('[data-supplier-pick]:not(:disabled)').forEach(cb => { cb.checked = e.target.checked; });
  });
  page.querySelector('[data-eval-select-confirm]')?.addEventListener('click', () => {
    const picked = [];
    page.querySelectorAll('[data-supplier-pick-row]').forEach(row => {
      const cb = row.querySelector('[data-supplier-pick]');
      if (cb?.checked && !cb.disabled) {
        picked.push({
          code: row.dataset.supplierCode,
          name: row.querySelector('td:nth-child(3)')?.textContent?.trim(),
        });
      }
    });
    if (!picked.length) { alert('请至少选择一家供应商'); return; }
    sessionStorage.setItem('wms_eval_picked_suppliers', JSON.stringify(picked));
    window.location.href = 'supplier_eval_form.html';
  });
}

function initSupplierDetail(root) {
  const scope = wmsModalScope();
  const detail = scope?.matches('[data-wms-supplier-detail]')
    ? scope
    : scope?.querySelector('[data-wms-supplier-detail]') || document.querySelector('[data-wms-supplier-detail]');
  if (!detail?.querySelector('[data-wms-supplier-tabs]')) return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || detail.dataset.supplierCode;
  const s = WMS_SUPPLIER_SAMPLES[code];
  if (!s) return;

  detail.dataset.supplierCode = s.code;
  const backHref = document.querySelector('.wms-modal-backdrop')?.dataset.modalBack || 'supplier_list.html';
  detail.querySelector('a[href*="supplier_form"]')?.setAttribute('href', `supplier_form.html?code=${s.code}&mode=edit`);
  document.querySelector('.wms-modal-backdrop .wms-modal-footer a[href*="supplier_list"]')?.setAttribute('href', backHref);
  document.querySelector('.wms-modal-backdrop .wms-modal-close')?.setAttribute('href', backHref);
  const setText = (field, val) => {
    const el = detail.querySelector(`[data-supplier-field="${field}"]`);
    if (el) el.textContent = val ?? '—';
  };
  const setHtml = (field, html) => {
    const el = detail.querySelector(`[data-supplier-field="${field}"]`);
    if (el) el.innerHTML = html;
  };

  setText('name', s.name);
  setText('code', s.code);
  setText('type', s.type);
  setHtml('status', wmsSupplierStatusBadge(s.status));
  setText('latestScore', s.latestScore);
  setHtml('latestGrade', wmsSupplierGradeBadge(s.latestGrade));
  setText('latestEvalDate', s.latestEvalDate);
  setText('supplyCount', String((s.supplies || []).length));
  setText('shortName', s.shortName);
  setText('contact', s.contact);
  setText('phone', s.phone);
  setText('address', s.address);
  setText('createdAt', s.createdAt);

  if (s.latestEvalNo && s.latestEvalNo !== '—') {
    const evalDd = detail.querySelector('[data-supplier-panel="profile"] dd:last-of-type');
    const profileEvalCell = [...detail.querySelectorAll('[data-supplier-panel="profile"] dt')].find(dt => dt.textContent.includes('最近评价单号'))?.nextElementSibling;
    const target = profileEvalCell || evalDd;
    if (target) {
      target.innerHTML = `<a href="supplier_eval_form.html?evalKey=${s.latestEvalNo}&mode=view" class="hover:underline font-mono text-xs">${s.latestEvalNo}</a>`;
    }
  }

  const titleEl = document.getElementById('wms-modal-title');
  if (titleEl) titleEl.textContent = `供应商详情 · ${s.name}`;
  document.title = `供应商详情 · ${s.name} · 物资管理系统`;

  const evalTbody = detail.querySelector('[data-supplier-panel="eval"] tbody');
  if (evalTbody) {
    const evalApproved = (s.evalHistory || []).filter(r => r.status === '审核通过');
    evalTbody.innerHTML = evalApproved.map(r =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="supplier_eval_form.html?evalKey=${r.evalNo}&mode=view" class="hover:underline">${r.evalNo}</a></td><td class="px-3 py-2.5 text-sm">${r.evalName}</td><td class="px-3 py-2.5 text-sm">${r.period}</td><td class="px-3 py-2.5 text-sm font-medium">${r.score}</td><td class="px-3 py-2.5 text-sm">${wmsSupplierGradeBadge(r.grade)}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.evalDate}</td></tr>`
    ).join('') || '<tr><td colspan="6" class="px-4 py-8 text-center text-sm text-slate-400">暂无已通过评价记录</td></tr>';
  }

  const supplyTbody = detail.querySelector('[data-supplier-supply-tbody]');
  if (supplyTbody) {
    supplyTbody.innerHTML = (s.supplies || []).map(r =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="warehouse_acceptance_detail.html?supplyNo=${r.no}" class="hover:underline">${r.no}</a></td><td class="px-3 py-2.5 text-sm">${r.material}</td><td class="px-3 py-2.5 text-sm">${r.qty}</td><td class="px-3 py-2.5 text-sm">${statusBadge(r.status, r.status === '已供货' ? 'success' : 'warning')}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.date}</td></tr>`
    ).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-sm text-slate-400">暂无供货记录</td></tr>';
  }

  const acceptTbody = detail.querySelector('[data-supplier-accept-tbody]');
  if (acceptTbody) {
    acceptTbody.innerHTML = (s.acceptances || []).map(r =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="warehouse_acceptance_record_detail.html?no=${r.no}" class="hover:underline">${r.no}</a></td><td class="px-3 py-2.5 text-sm font-mono text-xs">${r.supplyNo}</td><td class="px-3 py-2.5 text-sm">${r.material}</td><td class="px-3 py-2.5 text-sm">${r.qualified}</td><td class="px-3 py-2.5 text-sm">${r.unqualified}</td><td class="px-3 py-2.5 text-sm">${statusBadge(r.status, r.status === '已验收' ? 'success' : 'warning')}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.date}</td></tr>`
    ).join('') || '<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-slate-400">暂无验收记录</td></tr>';
  }

  const refundTbody = detail.querySelector('[data-supplier-refund-tbody]');
  if (refundTbody) {
    refundTbody.innerHTML = (s.refunds || []).map(r =>
      `<tr class="border-t border-slate-100"><td class="px-3 py-2.5 font-mono text-xs"><a href="warehouse_refund_like_form.html?refundKey=${r.no}" class="hover:underline">${r.no}</a></td><td class="px-3 py-2.5 text-sm font-mono text-xs">${r.supplyNo}</td><td class="px-3 py-2.5 text-sm">${r.material}</td><td class="px-3 py-2.5 text-sm">${r.qty}</td><td class="px-3 py-2.5 text-sm">${r.reason}</td><td class="px-3 py-2.5 text-sm">${statusBadge(r.status, r.status === '已退货' ? 'success' : 'warning')}</td><td class="px-3 py-2.5 text-sm text-slate-500">${r.date}</td></tr>`
    ).join('') || '<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-slate-400">暂无退货记录</td></tr>';
  }

}

function initEvalConfig(root) {
  const weightPage = document.querySelector('[data-wms-eval-weight-page]');
  if (weightPage) {
    const tbody = weightPage.querySelector('[data-wms-eval-weight-tbody]');
    const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
    const addRow = () => {
      const i = tbody.querySelectorAll('[data-wms-eval-weight-row]').length + 1;
      const tr = document.createElement('tr');
      tr.className = 'border-t border-slate-100';
      tr.dataset.wmsEvalWeightRow = '';
      tr.innerHTML = `<td class="px-4 py-3 text-sm text-slate-500">${i}</td>
        <td class="px-4 py-3"><input type="text" placeholder="指标名称" data-eval-indicator-name class="${inputCls}" /></td>
        <td class="px-4 py-3"><input type="number" step="0.01" min="0" max="1" value="0.1" data-eval-indicator-weight class="${inputCls} w-32" /></td>
        <td class="px-4 py-3 text-right"><button type="button" class="text-sm text-rose-600 hover:underline" data-eval-weight-delete>删除</button></td>`;
      tbody.appendChild(tr);
      tr.querySelector('[data-eval-weight-delete]')?.addEventListener('click', () => { tr.remove(); });
    };
    weightPage.querySelector('[data-eval-weight-add]')?.addEventListener('click', addRow);
    tbody?.querySelectorAll('[data-eval-weight-delete]').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('tr')?.remove());
    });
    weightPage.querySelector('[data-eval-weight-save]')?.addEventListener('click', () => alert('权重设置已保存（原型）'));
  }

  const gradePage = document.querySelector('[data-wms-eval-grade-page]');
  if (gradePage) {
    const tbody = gradePage.querySelector('[data-wms-eval-grade-tbody]');
    const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
    gradePage.querySelector('[data-eval-grade-add]')?.addEventListener('click', () => {
      const i = tbody.querySelectorAll('[data-wms-eval-grade-row]').length + 1;
      const tr = document.createElement('tr');
      tr.className = 'border-t border-slate-100';
      tr.dataset.wmsEvalGradeRow = '';
      tr.innerHTML = `<td class="px-4 py-3 text-sm text-slate-500">${i}</td>
        <td class="px-4 py-3"><input type="text" placeholder="等级名称" data-eval-grade-name class="${inputCls}" /></td>
        <td class="px-4 py-3"><input type="number" step="0.1" min="0" max="10" data-eval-grade-min class="${inputCls} w-28" /></td>
        <td class="px-4 py-3"><input type="number" step="0.1" min="0" max="10" data-eval-grade-max class="${inputCls} w-28" /></td>
        <td class="px-4 py-3 text-right"><button type="button" class="text-sm text-rose-600 hover:underline" data-eval-grade-delete>删除</button></td>`;
      tbody.appendChild(tr);
      tr.querySelector('[data-eval-grade-delete]')?.addEventListener('click', () => tr.remove());
    });
    tbody?.querySelectorAll('[data-eval-grade-delete]').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('tr')?.remove());
    });
    gradePage.querySelector('[data-eval-grade-save]')?.addEventListener('click', () => alert('评价等级已保存（原型）'));
  }
}

document.addEventListener('DOMContentLoaded', initLayout);

function statusBadge(text, type) {
  const map = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    info: 'bg-slate-100 text-slate-700 ring-slate-600/10',
    primary: 'bg-slate-900 text-white ring-slate-900/20',
  };
  return `<span class="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${map[type] || map.info}">${text}</span>`;
}

function dataTable(columns, rows, actions) {
  const th = columns.map(c => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">${c}</th>`).join('') + (actions ? '<th class="wms-col-actions px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">操作</th>' : '');
  const tr = rows.map(row => {
    const cells = row.cells.map(c => `<td class="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">${c}</td>`).join('');
    const act = actions ? `<td class="wms-col-actions px-4 py-3.5 text-right text-sm whitespace-nowrap">${actions(row)}</td>` : '';
    return `<tr class="table-row-hover border-t border-slate-100">${cells}${act}</tr>`;
  }).join('');
  return `<div class="card overflow-hidden rounded-2xl bg-white"><div class="overflow-x-auto wms-modal-table-wrap"><table class="min-w-full wms-data-table"><thead class="bg-slate-50/80"><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div></div>`;
}

function pageToolbar(title, btnText, btnHref) {
  return `<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <p class="text-sm text-slate-500">${title}</p>
    ${btnText ? `<a href="${btnHref || '#'}" class="btn-primary inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"><i class="fa-solid fa-plus text-xs"></i>${btnText}</a>` : ''}
  </div>`;
}

function filterBar(tabs) {
  return `<div class="mb-4 flex flex-wrap gap-2">${tabs.map((t, i) =>
    `<button class="rounded-xl px-4 py-2 text-sm font-medium ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}">${t}</button>`
  ).join('')}</div>`;
}
