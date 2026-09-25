import React, { useState } from 'react';
import {
  INITIAL_TENANTS,
  INITIAL_FORM_TEMPLATES,
  INITIAL_ENTITY_RECORDS,
  INITIAL_WORKFLOWS,
  INITIAL_TASKS,
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
} from './data/initialData';
import {
  DeploymentMode,
  EntityRecord,
  FormTemplate,
  ModuleType,
  OnPremiseLicense,
  PlanTier,
  TaskItem,
  Tenant,
} from './types/erp';
import { FormBuilder } from './components/FormBuilder';
import { TenantSubscriptionManager } from './components/TenantSubscriptionManager';
import { WorkflowManager } from './components/WorkflowManager';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { SqlArchitectureViewer } from './components/SqlArchitectureViewer';
import { ApiSimulator } from './components/ApiSimulator';
import { HybridDeploymentStudio } from './components/HybridDeploymentStudio';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { useSecretClick } from './hooks/useSecretClick';
import {
  Building2,
  Layers,
  GitPullRequest,
  BarChart3,
  Database,
  Terminal,
  ShieldCheck,
  Globe,
  Server,
  Cloud,
  Eye,
  EyeOff,
  X,
  Lock,
} from 'lucide-react';

const LOCAL_TENANT_ON_PREM: Tenant = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Al-Amal Enterprise Local Server',
  slug: 'local-server',
  tier: 'enterprise',
  createdAt: '2026-01-01',
  status: 'active',
  storageUsedMb: 14200,
  storageQuotaMb: 1048576, // 1 TB local disk
  userCount: 84,
  userLimit: 500,
  enabledModules: {
    hr: true,
    finance: true,
    operations: true,
    tasks: true,
    analytics: true,
  },
};

function MinhajERPApp() {
  const { language, toggleLanguage, t, isRtl } = useLanguage();

  // Deployment Mode: 'CLOUD' vs 'ON_PREMISE'
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ON_PREMISE');

  // Easter Egg Secret Click Hook (5 clicks within 2 seconds toggles Client Preview Mode)
  const {
    isActive: isPreviewMode,
    registerClick: handleLogoSecretClick,
    deactivate: exitPreviewMode,
    clickCountProgress,
    requiredClicks,
  } = useSecretClick({
    requiredClicks: 5,
    timeWindowMs: 2000,
    onTrigger: (active) => {
      if (active) {
        // Auto-switch away from purely administrative tabs to client form/employee view
        setActiveView((current) =>
          current === 'sql' || current === 'backend' || current === 'hybrid' || current === 'tenants'
            ? 'forms'
            : current
        );
      }
    },
  });

  // On-Premise License State
  const [license, setLicense] = useState<OnPremiseLicense>({
    licenseKey: 'EZWATY-ENT-2026-X992-LIVE',
    licensedTo: 'Al-Amal Enterprise Local Server',
    edition: 'Enterprise On-Premise',
    issuedAt: '2026-01-01T00:00:00Z',
    expiresAt: '2027-12-31T23:59:59Z',
    maxUsers: 500,
    serverFingerprint: 'SHA256:8849bca449102c918...local-host-node',
    signature: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
    enabledModules: { hr: true, finance: true, operations: true, tasks: true, analytics: true },
    isValid: true,
    isExpired: false,
  });

  // Master state
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [templates, setTemplates] = useState<FormTemplate[]>(INITIAL_FORM_TEMPLATES);
  const [records, setRecords] = useState<EntityRecord[]>(INITIAL_ENTITY_RECORDS);
  const [workflows] = useState(INITIAL_WORKFLOWS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  // Active view tab
  const [activeView, setActiveView] = useState<
    'dashboard' | 'forms' | 'tenants' | 'workflows' | 'sql' | 'backend' | 'hybrid'
  >('hybrid');

  // If in ON_PREMISE mode, resolve activeTenant to the single local tenant
  const currentTenant = deploymentMode === 'ON_PREMISE' ? LOCAL_TENANT_ON_PREM : activeTenant;

  const handleSelectTenant = (selectedTenant: Tenant) => {
    setActiveTenant(selectedTenant);
  };

  const handleUpdateTenantModules = (
    tenantId: string,
    modules: Record<ModuleType, boolean>
  ) => {
    setTenants((prev) =>
      prev.map((item) => (item.id === tenantId ? { ...item, enabledModules: modules } : item))
    );
    if (activeTenant.id === tenantId) {
      setActiveTenant((prev) => ({ ...prev, enabledModules: modules }));
    }
  };

  const handleUpdateTenantTier = (tenantId: string, tier: PlanTier) => {
    const quotaMap: Record<PlanTier, { quota: number; seats: number }> = {
      freemium: { quota: 5120, seats: 5 },
      growth: { quota: 25600, seats: 50 },
      enterprise: { quota: 102400, seats: 500 },
    };

    setTenants((prev) =>
      prev.map((item) =>
        item.id === tenantId
          ? {
              ...item,
              tier,
              storageQuotaMb: quotaMap[tier].quota,
              userLimit: quotaMap[tier].seats,
            }
          : item
      )
    );

    if (activeTenant.id === tenantId) {
      setActiveTenant((prev) => ({
        ...prev,
        tier,
        storageQuotaMb: quotaMap[tier].quota,
        userLimit: quotaMap[tier].seats,
      }));
    }
  };

  const handleSaveTemplate = (updated: FormTemplate) => {
    setTemplates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleCreateTemplate = (newTmpl: FormTemplate) => {
    setTemplates((prev) => [newTmpl, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskItem['status']) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === taskId ? { ...item, status: newStatus } : item))
    );
  };

  const handleCreateTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Enterprise Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand with Secret 5-Click Trigger */}
          <div
            onClick={handleLogoSecretClick}
            className="flex items-center gap-3 cursor-pointer select-none group relative"
            title={`${t.secretClickHint} (${clickCountProgress}/${requiredClicks})`}
          >
            <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
              <Layers className="w-5 h-5 text-white" />
              {clickCountProgress > 0 && clickCountProgress < requiredClicks && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-bounce ring-2 ring-slate-900">
                  {clickCountProgress}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  {t.appName}
                </span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded ${
                  deploymentMode === 'ON_PREMISE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                }`}>
                  {deploymentMode === 'ON_PREMISE' ? 'ON-PREMISE SERVER' : 'CLOUD SAAS'}
                </span>
                {isPreviewMode && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1 animate-pulse">
                    <Eye className="w-3 h-3 text-rose-400" />
                    <span>{isRtl ? 'معاينة العميل' : 'PREVIEW'}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{t.appSub}</p>
            </div>
          </div>

          {/* Quick Active Tenant & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Deployment Mode Quick Toggle */}
            <button
              onClick={() => setDeploymentMode((prev) => (prev === 'CLOUD' ? 'ON_PREMISE' : 'CLOUD'))}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                deploymentMode === 'ON_PREMISE'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/60'
                  : 'bg-blue-950/60 text-blue-300 border-blue-700/60 hover:bg-blue-900/60'
              }`}
              title="Toggle Deployment Mode"
            >
              {deploymentMode === 'ON_PREMISE' ? <Server className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
              <span>{deploymentMode === 'ON_PREMISE' ? 'On-Premise' : 'Cloud'}</span>
            </button>

            {/* Bilingual Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Switch Language / تبديل اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">{t.activeTenant}</span>
              <strong className="text-slate-100">{currentTenant.name}</strong>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-900/60 text-purple-300 border border-purple-700/60 ml-1">
                {currentTenant.tier}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{deploymentMode === 'ON_PREMISE' ? 'License Active' : t.rlsActive}</span>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs Bar */}
        <div className="bg-slate-900/90 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2">
            <div className="flex items-center gap-1">
              {[
                {
                  id: 'forms',
                  label: t.navForms,
                  icon: Layers,
                  badge: `${templates.length} ${t.formsBadge}`,
                },
                {
                  id: 'workflows',
                  label: t.navWorkflows,
                  icon: GitPullRequest,
                  badge: `${tasks.filter((item) => item.status === 'pending').length} ${t.pendingBadge}`,
                },
                {
                  id: 'dashboard',
                  label: t.navDashboard,
                  icon: BarChart3,
                },
                // Admin-only views (hidden when in Client Preview Mode)
                ...(!isPreviewMode
                  ? [
                      {
                        id: 'hybrid',
                        label: t.navHybrid,
                        icon: Server,
                        badge: deploymentMode === 'ON_PREMISE' ? 'On-Premise' : 'Cloud',
                      },
                      {
                        id: 'tenants',
                        label: t.navTenants,
                        icon: Building2,
                      },
                      {
                        id: 'sql',
                        label: t.navSql,
                        icon: Database,
                        badge: 'DDL & RLS',
                      },
                      {
                        id: 'backend',
                        label: t.navBackend,
                        icon: Terminal,
                        badge: 'Node.js',
                      },
                    ]
                  : []),
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as any)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isActive
                            ? 'bg-indigo-700/80 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick indication when Preview Mode is active */}
            {isPreviewMode && (
              <div className="flex items-center gap-2 text-xs text-amber-300 font-mono pl-3 shrink-0">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>{isRtl ? 'وضع معاينة العميل (محمي)' : 'Client Preview (Protected)'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Discreet Floating Banner: Client Preview Mode Active */}
      {isPreviewMode && (
        <div className="sticky top-16 z-30 bg-amber-400 text-slate-950 px-4 py-2.5 shadow-md border-b border-amber-500 animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  {t.previewModeBanner}
                </span>
                <span className="text-[11px] text-slate-900 hidden md:inline">
                  &bull; {t.previewModeDesc}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-900 bg-amber-300/80 px-2 py-0.5 rounded hidden sm:inline">
                {isRtl ? 'انقر 5 مرات على الشعار للتبديل' : '5 Clicks on Logo to Toggle'}
              </span>
              <button
                onClick={exitPreviewMode}
                className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.previewModeExitBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Dynamic Form Studio / SAP Employee Profile Builder */}
        {activeView === 'forms' && (
          <FormBuilder
            templates={templates}
            activeTenantId={currentTenant.id}
            isPreviewMode={isPreviewMode}
            onSaveTemplate={handleSaveTemplate}
            onCreateNewTemplate={handleCreateTemplate}
          />
        )}

        {/* Executive Dashboard */}
        {activeView === 'dashboard' && (
          <ExecutiveDashboard
            tenant={currentTenant}
            records={records}
            tasks={tasks}
            onNavigateToModule={(mod) => {
              if (mod === 'tasks') setActiveView('workflows');
              else setActiveView('forms');
            }}
          />
        )}

        {/* Workflows and Tasks Queue */}
        {activeView === 'workflows' && (
          <WorkflowManager
            workflows={workflows}
            tasks={tasks}
            departments={INITIAL_DEPARTMENTS}
            users={INITIAL_USERS}
            tenantId={currentTenant.id}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onCreateTask={handleCreateTask}
          />
        )}

        {/* Administrative Views: Hidden completely when isPreviewMode is true */}
        {!isPreviewMode && activeView === 'hybrid' && (
          <HybridDeploymentStudio
            currentMode={deploymentMode}
            onToggleMode={(newMode) => setDeploymentMode(newMode)}
            license={license}
            onUpdateLicense={(updated) => setLicense(updated)}
          />
        )}

        {!isPreviewMode && activeView === 'tenants' && (
          <TenantSubscriptionManager
            tenants={tenants}
            activeTenant={currentTenant}
            onSelectTenant={handleSelectTenant}
            onUpdateTenantModules={handleUpdateTenantModules}
            onUpdateTenantTier={handleUpdateTenantTier}
            deploymentMode={deploymentMode}
          />
        )}

        {!isPreviewMode && activeView === 'sql' && <SqlArchitectureViewer />}

        {!isPreviewMode && activeView === 'backend' && (
          <ApiSimulator
            tenants={tenants}
            activeTenant={currentTenant}
            templates={templates}
          />
        )}

        {/* Fallback if user toggles preview mode while on an administrative tab */}
        {isPreviewMode &&
          (activeView === 'hybrid' ||
            activeView === 'tenants' ||
            activeView === 'sql' ||
            activeView === 'backend') && (
            <div className="bg-white border border-amber-200 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm my-12">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t.previewModeBanner}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                {t.previewModeDesc}
              </p>
              <button
                onClick={() => setActiveView('forms')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {t.navForms}
              </button>
            </div>
          )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">{t.footerTitle}</span>
            <span>&bull;</span>
            <span>{deploymentMode === 'ON_PREMISE' ? 'Single-Tenant Local Server Mode' : t.footerSharedDb}</span>
            <span>&bull;</span>
            <span>{t.footerJsonb}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 dir-ltr">
            Mode: {deploymentMode} &bull; Tenant: {currentTenant.id} &bull; {t.footerLatency}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MinhajERPApp />
    </LanguageProvider>
  );
}


