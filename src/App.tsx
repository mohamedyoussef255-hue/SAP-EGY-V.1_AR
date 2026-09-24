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
  EntityRecord,
  FormTemplate,
  ModuleType,
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
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import {
  Building2,
  Layers,
  GitPullRequest,
  BarChart3,
  Database,
  Terminal,
  ShieldCheck,
  Globe,
} from 'lucide-react';

function MinhajERPApp() {
  const { language, toggleLanguage, t } = useLanguage();

  // Master state
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [templates, setTemplates] = useState<FormTemplate[]>(INITIAL_FORM_TEMPLATES);
  const [records, setRecords] = useState<EntityRecord[]>(INITIAL_ENTITY_RECORDS);
  const [workflows] = useState(INITIAL_WORKFLOWS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  // Active view tab
  const [activeView, setActiveView] = useState<
    'dashboard' | 'forms' | 'tenants' | 'workflows' | 'sql' | 'backend'
  >('forms');

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
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  {t.appName}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded">
                  Modular SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.appSub}</p>
            </div>
          </div>

          {/* Quick Active Tenant & Language Switcher */}
          <div className="flex items-center gap-3">
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
              <strong className="text-slate-100">{activeTenant.name}</strong>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-900/60 text-purple-300 border border-purple-700/60 ml-1">
                {activeTenant.tier}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.rlsActive}</span>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs Bar */}
        <div className="bg-slate-900/90 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
            {[
              {
                id: 'forms',
                label: t.navForms,
                icon: Layers,
                badge: `${templates.length} ${t.formsBadge}`,
              },
              {
                id: 'dashboard',
                label: t.navDashboard,
                icon: BarChart3,
              },
              {
                id: 'tenants',
                label: t.navTenants,
                icon: Building2,
              },
              {
                id: 'workflows',
                label: t.navWorkflows,
                icon: GitPullRequest,
                badge: `${tasks.filter((item) => item.status === 'pending').length} ${t.pendingBadge}`,
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
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeView === 'forms' && (
          <FormBuilder
            templates={templates}
            activeTenantId={activeTenant.id}
            onSaveTemplate={handleSaveTemplate}
            onCreateNewTemplate={handleCreateTemplate}
          />
        )}

        {activeView === 'dashboard' && (
          <ExecutiveDashboard
            tenant={activeTenant}
            records={records}
            tasks={tasks}
            onNavigateToModule={(mod) => {
              if (mod === 'tasks') setActiveView('workflows');
              else setActiveView('forms');
            }}
          />
        )}

        {activeView === 'tenants' && (
          <TenantSubscriptionManager
            tenants={tenants}
            activeTenant={activeTenant}
            onSelectTenant={handleSelectTenant}
            onUpdateTenantModules={handleUpdateTenantModules}
            onUpdateTenantTier={handleUpdateTenantTier}
          />
        )}

        {activeView === 'workflows' && (
          <WorkflowManager
            workflows={workflows}
            tasks={tasks}
            departments={INITIAL_DEPARTMENTS}
            users={INITIAL_USERS}
            tenantId={activeTenant.id}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onCreateTask={handleCreateTask}
          />
        )}

        {activeView === 'sql' && <SqlArchitectureViewer />}

        {activeView === 'backend' && (
          <ApiSimulator
            tenants={tenants}
            activeTenant={activeTenant}
            templates={templates}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">{t.footerTitle}</span>
            <span>&bull;</span>
            <span>{t.footerSharedDb}</span>
            <span>&bull;</span>
            <span>{t.footerJsonb}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 dir-ltr">
            Tenant: {activeTenant.id} &bull; {t.footerLatency}
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

