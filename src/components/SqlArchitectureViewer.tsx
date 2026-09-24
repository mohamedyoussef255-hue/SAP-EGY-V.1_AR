import React, { useState } from 'react';
import { Database, Copy, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const SqlArchitectureViewer: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'core' | 'dynamic_forms' | 'workflows' | 'rls' | 'eav_comparison'>('core');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const CORE_SCHEMA_SQL = `-- ============================================================================
-- MINHAJ ENTERPRISE MODULAR CLOUD ERP: CORE MULTI-TENANT ARCHITECTURE
-- Engine: PostgreSQL 15+ with Row-Level Security & GIN JSONB Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS TABLE
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(63) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'freemium' 
        CHECK (tier IN ('freemium', 'growth', 'enterprise')),
    status VARCHAR(32) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'deprovisioned')),
    storage_quota_mb INTEGER NOT NULL DEFAULT 5120, -- 5 GB default
    storage_used_mb INTEGER NOT NULL DEFAULT 0,
    user_seat_limit INTEGER NOT NULL DEFAULT 5,
    custom_domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_status ON tenants(status);

-- 2. SUBSCRIPTIONS & A LA CARTE MODULE TOGGLES
CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_tier VARCHAR(32) NOT NULL DEFAULT 'freemium',
    billing_cycle VARCHAR(16) NOT NULL DEFAULT 'monthly'
        CHECK (billing_cycle IN ('monthly', 'annual')),
    -- Modular Feature Toggles (A la Carte & Freemium Matrix)
    module_hr BOOLEAN NOT NULL DEFAULT FALSE,
    module_finance BOOLEAN NOT NULL DEFAULT FALSE,
    module_operations BOOLEAN NOT NULL DEFAULT FALSE,
    module_tasks BOOLEAN NOT NULL DEFAULT TRUE,
    module_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    -- Quotas & Throttles
    api_rate_limit_per_min INTEGER NOT NULL DEFAULT 120,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_subscription UNIQUE (tenant_id)
);

CREATE INDEX idx_subscriptions_tenant ON tenant_subscriptions(tenant_id);

-- 3. DEPARTMENTS TABLE (Multi-Tenant Org Hierarchy)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL,
    parent_department_id UUID REFERENCES departments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dept_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX idx_departments_tenant ON departments(tenant_id);

-- 4. ROLES & PERMISSIONS TABLE
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_role_tenant_name UNIQUE (tenant_id, name)
);

CREATE INDEX idx_roles_permissions_gin ON roles USING gin (permissions);

-- 5. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    is_tenant_admin BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'invited', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant_dept ON users(tenant_id, department_id);`;

  const DYNAMIC_FORMS_SQL = `-- ============================================================================
-- DYNAMIC SCHEMA & CUSTOM FORM BUILDER (POSTGRESQL JSONB ENGINE)
-- Zero DDL schema migrations needed when tenant companies customize fields!
-- ============================================================================

CREATE TABLE form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    module VARCHAR(32) NOT NULL 
        CHECK (module IN ('finance', 'operations', 'hr', 'tasks', 'analytics')),
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    schema_definition JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_template_tenant_entity_version UNIQUE (tenant_id, entity_type, version)
);

CREATE INDEX idx_form_templates_lookup 
    ON form_templates(tenant_id, entity_type, is_active);

CREATE TABLE entity_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES form_templates(id),
    entity_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending_approval'
        CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entity_records_data_gin 
    ON entity_records USING gin (data jsonb_path_ops);

CREATE INDEX idx_entity_records_tenant_entity 
    ON entity_records(tenant_id, entity_type, created_at DESC);

CREATE INDEX idx_entity_records_serial 
    ON entity_records ((data->>'serial_number')) 
    WHERE entity_type = 'asset_entry';

CREATE INDEX idx_entity_records_invoice_ref 
    ON entity_records ((data->>'invoice_reference_no')) 
    WHERE entity_type = 'vendor_invoice';`;

  const WORKFLOWS_SQL = `-- ============================================================================
-- WORKFLOWS, MULTI-STEP APPROVALS & TASK HIERARCHY
-- ============================================================================

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    module VARCHAR(32) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_tenant ON workflows(tenant_id, entity_type);

CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    name VARCHAR(128) NOT NULL,
    role_required VARCHAR(64) NOT NULL,
    target_department_id UUID REFERENCES departments(id),
    sla_hours INTEGER NOT NULL DEFAULT 48,
    CONSTRAINT uq_wf_step UNIQUE (workflow_id, step_number)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module VARCHAR(32) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    assigned_to_user_id UUID REFERENCES users(id),
    priority VARCHAR(16) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'completed')),
    current_step_number INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,
    due_date DATE,
    linked_entity_id UUID REFERENCES entity_records(id) ON DELETE CASCADE,
    entity_type VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_tenant_user_status ON tasks(tenant_id, assigned_to_user_id, status);
CREATE INDEX idx_tasks_tenant_dept_due ON tasks(tenant_id, department_id, due_date);`;

  const RLS_SQL = `-- ============================================================================
-- STRICT TENANT DATA ISOLATION VIA POSTGRESQL ROW-LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

ALTER TABLE entity_records FORCE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_entity_records ON entity_records
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_form_templates ON form_templates
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_tasks ON tasks
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);`;

  const activeSql = (() => {
    switch (activeTab) {
      case 'core':
        return CORE_SCHEMA_SQL;
      case 'dynamic_forms':
        return DYNAMIC_FORMS_SQL;
      case 'workflows':
        return WORKFLOWS_SQL;
      case 'rls':
        return RLS_SQL;
      default:
        return '';
    }
  })();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t.sqlTitle}</h1>
            <p className="text-xs text-slate-500">{t.sqlSub}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        {[
          { key: 'core', label: t.tabCore },
          { key: 'dynamic_forms', label: t.tabDynamicForms },
          { key: 'workflows', label: t.tabWorkflows },
          { key: 'rls', label: t.tabRls },
          { key: 'eav_comparison', label: t.tabEav },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs md:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'eav_comparison' ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-2 dir-ltr">
                schema_pg_{activeTab}.sql
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(activeSql, activeTab)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.copiedSqlBtn}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.copySqlBtn}</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-5 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[580px] leading-relaxed dir-ltr text-left">
            {activeSql}
          </pre>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">{t.eavTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t.eavIntro}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="p-3 border border-slate-200 font-bold">{isRtl ? 'المعيار التقني' : 'Criteria'}</th>
                    <th className="p-3 border border-slate-200 font-bold text-indigo-700">
                      {isRtl ? 'نمطنا المعتمد: PostgreSQL JSONB + GIN' : 'Our Pattern: PostgreSQL JSONB + GIN'}
                    </th>
                    <th className="p-3 border border-slate-200 font-bold text-rose-700">
                      {isRtl ? 'النمط التقليدي المرفوض: EAV (Entity-Attribute-Value)' : 'Legacy Anti-Pattern: EAV'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="p-3 border border-slate-200 font-semibold text-slate-800">
                      {isRtl ? 'تعقيد الربط (JOINs)' : 'Join Complexity'}
                    </td>
                    <td className="p-3 border border-slate-200 bg-indigo-50/20 text-emerald-800">
                      <strong>{isRtl ? 'صفر عمليات ربط.' : 'Zero joins required.'}</strong> {isRtl ? 'جميع الحقول داخل صف واحد في عمود data JSONB.' : 'All custom attributes reside in a single row.'}
                    </td>
                    <td className="p-3 border border-slate-200 bg-rose-50/20 text-rose-800">
                      <strong>{isRtl ? 'انفجار هائل في الروابط.' : 'JOIN explosion.'}</strong> {isRtl ? 'استرجاع 15 حقلاً يتطلب 15 ربطاً ذاتياً.' : 'Querying 15 custom fields requires 15 self-joins.'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-semibold text-slate-800">
                      {isRtl ? 'زمن استجابة الاستعلام' : 'Query Latency'}
                    </td>
                    <td className="p-3 border border-slate-200 bg-indigo-50/20 text-emerald-800">
                      {isRtl ? 'أقل من 2 مللي ثانية بفضل فهرس GIN jsonb_path_ops.' : 'Sub-millisecond reads with jsonb_path_ops GIN index.'}
                    </td>
                    <td className="p-3 border border-slate-200 bg-rose-50/20 text-rose-800">
                      {isRtl ? 'يتدهور بشكل حاد مع زيادة السجلات (> 500 ألف سجل).' : 'Degrades drastically under high record counts (> 500k rows).'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-semibold text-slate-800">
                      {isRtl ? 'تعديلات المخطط الفورية' : 'Dynamic Schema Alterations'}
                    </td>
                    <td className="p-3 border border-slate-200 bg-indigo-50/20 text-emerald-800">
                      {isRtl ? 'فورية وبدون توقف. يحفظ المستأجر القالب دون المساس بهيكل الجداول.' : 'Instantaneous. Tenant saves form changes without touching database tables.'}
                    </td>
                    <td className="p-3 border border-slate-200 bg-rose-50/20 text-rose-800">
                      {isRtl ? 'يتطلب إدخال صفوف معقدة وإدارة مفاتيح ثانوية متعددة.' : 'Requires inserting rows into metadata tables with high overhead.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
