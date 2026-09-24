import React, { useState } from 'react';
import { ModuleType, PlanTier, Tenant } from '../types/erp';
import {
  Building2,
  ShieldCheck,
  HardDrive,
  Users,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface TenantSubscriptionManagerProps {
  tenants: Tenant[];
  activeTenant: Tenant;
  onSelectTenant: (tenant: Tenant) => void;
  onUpdateTenantModules: (tenantId: string, modules: Record<ModuleType, boolean>) => void;
  onUpdateTenantTier: (tenantId: string, tier: PlanTier) => void;
}

export const TenantSubscriptionManager: React.FC<TenantSubscriptionManagerProps> = ({
  tenants,
  activeTenant,
  onSelectTenant,
  onUpdateTenantModules,
  onUpdateTenantTier,
}) => {
  const { t, isRtl } = useLanguage();
  const [simulationResponse, setSimulationResponse] = useState<{
    status: number;
    message: string;
    allowed: boolean;
  } | null>(null);

  const handleToggleModule = (module: ModuleType) => {
    const updated = {
      ...activeTenant.enabledModules,
      [module]: !activeTenant.enabledModules[module],
    };
    onUpdateTenantModules(activeTenant.id, updated);
  };

  const handleTestModuleAccess = (module: ModuleType) => {
    const isEnabled = activeTenant.enabledModules[module];
    if (!isEnabled) {
      setSimulationResponse({
        status: 403,
        message: isRtl
          ? `HTTP 403 ممنوع: المستأجر '${activeTenant.name}' (المعرف: ${activeTenant.id}) لا يملك اشتراكاً نشطاً للوحدة '${t.modules[module]}'. الخطة الحالية: ${activeTenant.tier}. قم بترقية الباقة لفتح الوحدة.`
          : `HTTP 403 Forbidden: Tenant '${activeTenant.name}' (ID: ${activeTenant.id}) does not have an active subscription for module '${module.toUpperCase()}'. Plan: ${activeTenant.tier}. Upgrade plan to unlock.`,
        allowed: false,
      });
    } else {
      setSimulationResponse({
        status: 200,
        message: isRtl
          ? `HTTP 200 تم بنجاح: المستخدم مصرح له. تم التحقق من المعرف '${activeTenant.id}'. الوحدة '${t.modules[module]}' مفعّلة. تم ضبط سياق أمان PostgreSQL RLS: 'SET LOCAL app.current_tenant_id = ${activeTenant.id}'.`
          : `HTTP 200 OK: User authorized. Tenant ID '${activeTenant.id}' verified. Module '${module.toUpperCase()}' is active. RLS context set: 'SET LOCAL app.current_tenant_id = ${activeTenant.id}'.`,
        allowed: true,
      });
    }
  };

  const getTierColor = (tier: PlanTier) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'growth':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'freemium':
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const storagePercentage = Math.round(
    (activeTenant.storageUsedMb / activeTenant.storageQuotaMb) * 100
  );
  const seatsPercentage = Math.round(
    (activeTenant.userCount / activeTenant.userLimit) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t.tenantManagerTitle}</h1>
            <p className="text-xs text-slate-500">{t.tenantManagerSub}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{t.currentEnterpriseTenant}</span>
          <select
            value={activeTenant.id}
            onChange={(e) => {
              const selected = tenants.find((item) => item.id === e.target.value);
              if (selected) onSelectTenant(selected);
              setSimulationResponse(null);
            }}
            className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
          >
            {tenants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} &bull; [{item.tier.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenant Details & Quota Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">{t.subTier}</span>
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getTierColor(
                activeTenant.tier
              )}`}
            >
              {activeTenant.tier.toUpperCase()}
            </span>
          </div>

          <div className="text-lg font-bold text-slate-900">{activeTenant.name}</div>
          <div className="text-xs font-mono text-slate-500">
            {t.tenantUuid} <code className="text-indigo-600 font-bold">{activeTenant.id}</code>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.footerSharedDb}</span>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            {(['freemium', 'growth', 'enterprise'] as PlanTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => onUpdateTenantTier(activeTenant.id, tier)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded capitalize transition-colors ${
                  activeTenant.tier === tier
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Storage Quota Gauge */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">{t.storageQuota}</span>
            <HardDrive className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {(activeTenant.storageUsedMb / 1024).toFixed(1)} GB
            </span>
            <span className="text-xs text-slate-500">
              / {(activeTenant.storageQuotaMb / 1024).toFixed(0)} GB
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                storagePercentage > 85 ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {storagePercentage}% {t.storageConsumed}
          </p>
        </div>

        {/* User Seats Quota Gauge */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">{t.seatUtil}</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeTenant.userCount}</span>
            <span className="text-xs text-slate-500">/ {activeTenant.userLimit}</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{ width: `${Math.min(seatsPercentage, 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {seatsPercentage}% {t.seatProvisioned}
          </p>
        </div>
      </div>

      {/* A La Carte Module Toggle Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t.moduleTogglesTitle}</h2>
          <p className="text-xs text-slate-500">{t.moduleTogglesSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'finance',
              name: t.modules.finance,
              desc: isRtl ? 'الأستاذ العام، الفواتير، العملات المتعددة، ومراكز التكلفة' : 'General Ledger, AP/AR Invoices, Currency Multi-Book, Cost Centers',
              route: '/api/v1/finance/invoices',
            },
            {
              id: 'hr',
              name: t.modules.hr,
              desc: isRtl ? 'طلبات التوظيف، الهيكل التنظيمي، والإجازات' : 'Onboarding Requisitions, Hierarchy, Leave, Department Headcount',
              route: '/api/v1/hr/onboarding',
            },
            {
              id: 'operations',
              name: t.modules.operations,
              desc: isRtl ? 'إدخال الأصول الرأسمالية الثابتة، وأوامر العمل والتشغيل' : 'Fixed Capital Asset Entry, Work Orders, Equipment Management',
              route: '/api/v1/operations/assets',
            },
            {
              id: 'tasks',
              name: t.modules.tasks,
              desc: isRtl ? 'الاعتمادات متعددة المراحل وتتبع اتفاقيات مستوى الخدمة (SLA)' : 'Multi-Step Approvals, Department SLA Trackers, Audit Trail',
              route: '/api/v1/tasks',
            },
            {
              id: 'analytics',
              name: t.modules.analytics,
              desc: isRtl ? 'مؤشرات الأداء المجمعة فورياً عبر جميع الوحدات' : 'Cross-Module Real-Time KPIs, High-Level Financial Dashboards',
              route: '/api/v1/analytics/kpis',
            },
          ].map((mod) => {
            const isEnabled = activeTenant.enabledModules[mod.id as ModuleType];
            return (
              <div
                key={mod.id}
                className={`p-4 rounded-xl border transition-all ${
                  isEnabled
                    ? 'border-indigo-200 bg-indigo-50/20'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <h3 className="font-semibold text-sm text-slate-900">{mod.name}</h3>
                  </div>

                  <button
                    onClick={() => handleToggleModule(mod.id as ModuleType)}
                    className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                    title={isEnabled ? 'Disable Module' : 'Enable Module'}
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-7 h-7 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-3">{mod.desc}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-mono text-slate-400 dir-ltr">{mod.route}</span>
                  <button
                    onClick={() => handleTestModuleAccess(mod.id as ModuleType)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {t.testRouteBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Middleware Response Display */}
        {simulationResponse && (
          <div
            className={`mt-4 p-4 rounded-lg border text-xs font-mono flex items-start gap-3 ${
              simulationResponse.allowed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {simulationResponse.allowed ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>{t.middlewareAuthResult} Status {simulationResponse.status}</span>
              </div>
              <p>{simulationResponse.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
