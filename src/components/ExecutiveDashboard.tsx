import React from 'react';
import { EntityRecord, ModuleType, TaskItem, Tenant } from '../types/erp';
import {
  DollarSign,
  Users,
  Activity,
  Lock,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ExecutiveDashboardProps {
  tenant: Tenant;
  records: EntityRecord[];
  tasks: TaskItem[];
  onNavigateToModule: (module: ModuleType) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  tenant,
  records,
  tasks,
}) => {
  const { t, isRtl } = useLanguage();

  const isFinanceEnabled = tenant.enabledModules.finance;
  const isHrEnabled = tenant.enabledModules.hr;
  const isOpsEnabled = tenant.enabledModules.operations;
  const isTasksEnabled = tenant.enabledModules.tasks;

  const invoiceRecords = records.filter((r) => r.entityType === 'vendor_invoice');
  const assetRecords = records.filter((r) => r.entityType === 'asset_entry');

  const totalInvoiceSpend = invoiceRecords.reduce((sum, r) => {
    return sum + (Number(r.data.total_amount) || 0);
  }, 0);

  const totalAssetCapitalExpenditure = assetRecords.reduce((sum, r) => {
    return sum + (Number(r.data.acquisition_cost) || 0);
  }, 0);

  const pendingApprovalsCount = tasks.filter((task) => task.status === 'pending').length;
  const completedTasksCount = tasks.filter((task) => task.status === 'completed' || task.status === 'approved').length;
  const slaCompliance = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Health */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              {isRtl ? 'مركز القيادة المؤسسي' : 'Enterprise Command Center'}
            </span>
            <span className="text-xs text-slate-400">
              {t.activeTenant} <strong className="text-white">{tenant.name}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{t.execTitle}</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">{t.execSub}</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-xs">
          <div className={isRtl ? 'text-left' : 'text-right'}>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{t.activePlan}</div>
            <div className="text-lg font-black text-amber-400 uppercase">{tenant.tier}</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className={isRtl ? 'text-left' : 'text-right'}>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{t.dbLatency}</div>
            <div className="text-lg font-mono font-bold text-emerald-400 dir-ltr">1.8 ms (GIN)</div>
          </div>
        </div>
      </div>

      {/* Top 4 Real-time High Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Finance Summary */}
        <div
          className={`p-5 rounded-xl border bg-white shadow-xs transition-all relative overflow-hidden ${
            isFinanceEnabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
          }`}
        >
          {!isFinanceEnabled && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs flex items-center justify-center z-10">
              <span className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5" /> {t.moduleInactive}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.kpiApInvoices}</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dir-ltr text-left">
            ${totalInvoiceSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{invoiceRecords.length}</span> {t.acrossActiveGl}
          </div>
        </div>

        {/* Card 2: Operations Capital Assets */}
        <div
          className={`p-5 rounded-xl border bg-white shadow-xs transition-all relative overflow-hidden ${
            isOpsEnabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
          }`}
        >
          {!isOpsEnabled && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs flex items-center justify-center z-10">
              <span className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5" /> {t.moduleInactive}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.kpiAssetsValue}</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dir-ltr text-left">
            ${totalAssetCapitalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-blue-600">{assetRecords.length}</span> {t.registeredJsonb}
          </div>
        </div>

        {/* Card 3: Human Resources */}
        <div
          className={`p-5 rounded-xl border bg-white shadow-xs transition-all relative overflow-hidden ${
            isHrEnabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
          }`}
        >
          {!isHrEnabled && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs flex items-center justify-center z-10">
              <span className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5" /> {t.moduleInactive}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.kpiHeadcount}</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{tenant.userCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-purple-600">98.4%</span> {t.retentionRate}
          </div>
        </div>

        {/* Card 4: Task SLA Compliance */}
        <div
          className={`p-5 rounded-xl border bg-white shadow-xs transition-all relative overflow-hidden ${
            isTasksEnabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
          }`}
        >
          {!isTasksEnabled && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs flex items-center justify-center z-10">
              <span className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5" /> {t.moduleInactive}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.kpiWorkflowSla}</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dir-ltr text-left">{slaCompliance}%</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-amber-600">{pendingApprovalsCount}</span> {t.pendingGates}
          </div>
        </div>
      </div>

      {/* Module Breakdown Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Health Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{t.moduleMatrixTitle}</h3>
            <span className="text-xs text-slate-400">Freemium / A La Carte</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'finance',
                title: t.modules.finance,
                metric: isRtl ? '284,500$ شهرياً' : '$284,500 Monthly Run Rate',
                sub: isRtl ? '3 عملات، 12 مركز تكلفة' : '3 Currencies, 12 Cost Centers',
                status: isFinanceEnabled,
              },
              {
                id: 'operations',
                title: t.modules.operations,
                metric: '99.98% MTBF',
                sub: isRtl ? 'منشأتان صناعيتان، 4 مستودعات' : '2 Facilities, 4 Warehouses',
                status: isOpsEnabled,
              },
              {
                id: 'hr',
                title: t.modules.hr,
                metric: isRtl ? '4 طلبات توظيف مفتوحة' : '4 Open Requisitions',
                sub: isRtl ? '14 يوماً متوسط وقت التوظيف' : '14 Days Avg Time to Hire',
                status: isHrEnabled,
              },
              {
                id: 'tasks',
                title: t.modules.tasks,
                metric: isRtl ? `${tasks.length} مهام نشطة` : `${tasks.length} Active Tasks`,
                sub: isRtl ? 'اعتمادات هرمية متعددة' : 'Multi-Signature Hierarchies',
                status: isTasksEnabled,
              },
            ].map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 bg-slate-50/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.status ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-800">{m.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{m.sub}</div>
                </div>

                <div className="text-right">
                  {m.status ? (
                    <span className="text-xs font-semibold text-slate-700">{m.metric}</span>
                  ) : (
                    <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {isRtl ? 'مغلق' : 'Locked'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Dynamic Records Stored in PostgreSQL JSONB */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {t.recentRecordsTitle}
            </h3>
            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {t.ginIndexed}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
            {records.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-700 font-bold dir-ltr">{rec.id}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-800 font-semibold">
                  {t.entityLabel} <code className="bg-slate-100 px-1 py-0.5 rounded dir-ltr">{rec.entityType}</code>
                </div>
                <div className="text-slate-500 font-mono text-[11px] truncate bg-slate-50 p-1.5 rounded border border-slate-100 dir-ltr text-left">
                  {JSON.stringify(rec.data)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
