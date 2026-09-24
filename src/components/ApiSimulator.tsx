import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, Code } from 'lucide-react';
import { FormTemplate, Tenant } from '../types/erp';
import { useLanguage } from '../i18n/LanguageContext';

interface ApiSimulatorProps {
  tenants: Tenant[];
  activeTenant: Tenant;
  templates: FormTemplate[];
}

export const ApiSimulator: React.FC<ApiSimulatorProps> = ({
  tenants,
  activeTenant,
}) => {
  const { t, isRtl } = useLanguage();
  const [activeCodeTab, setActiveCodeTab] = useState<'middleware' | 'controller'>('middleware');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [simSelectedTenantId, setSimSelectedTenantId] = useState(activeTenant.id);
  const simEndpoint = '/api/v1/forms/asset_entry/records';
  const simMethod = 'POST';
  const [simModuleHeader, setSimModuleHeader] = useState<'operations' | 'finance' | 'hr' | 'tasks'>('operations');
  const [simPayload, setSimPayload] = useState(
    JSON.stringify(
      {
        asset_name: 'Cisco Nexus 9300-FX3 Core Switch',
        serial_number: 'NEX-9300-8841-DC',
        asset_category: 'datacenter',
        acquisition_cost: 18900.0,
        purchase_date: '2026-09-24',
        is_critical_infrastructure: true,
      },
      null,
      2
    )
  );

  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const MIDDLEWARE_CODE = `// ============================================================================
// PHASE 2: NODE.JS / EXPRESS MULTI-TENANT & MODULE ACCESS MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbPool } from '../db/postgres';

export interface AuthenticatedTenantRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
    email: string;
  };
  tenantSubscription?: {
    tier: string;
    enabledModules: Record<string, boolean>;
    storageQuotaMb: number;
    storageUsedMb: number;
  };
}

export const authenticateTenantUser = async (
  req: AuthenticatedTenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization Bearer token',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      tenant_id: string;
      role: string;
      email: string;
    };

    req.user = {
      userId: decoded.sub,
      tenantId: decoded.tenant_id,
      role: decoded.role,
      email: decoded.email,
    };

    // SET LOCAL app.current_tenant_id for PostgreSQL RLS:
    await dbPool.query(
      "SELECT set_config('app.current_tenant_id', $1, true);",
      [req.user.tenantId]
    );

    next();
  } catch (error: any) {
    return res.status(401).json({
      error: 'InvalidToken',
      message: 'Token verification failed or expired',
    });
  }
};

export const requireModuleAccess = (requiredModule: string) => {
  return async (
    req: AuthenticatedTenantRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant context uninitialized' });
      }

      const result = await dbPool.query(
        \`SELECT 
            s.plan_tier,
            s.module_hr,
            s.module_finance,
            s.module_operations,
            s.module_tasks,
            s.module_analytics,
            t.status AS tenant_status,
            t.storage_quota_mb,
            t.storage_used_mb
         FROM tenant_subscriptions s
         JOIN tenants t ON t.id = s.tenant_id
         WHERE s.tenant_id = $1 AND t.status = 'active'\`,
        [tenantId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          error: 'NoActiveSubscription',
          message: 'No active subscription found for tenant or tenant is suspended.',
        });
      }

      const sub = result.rows[0];
      const moduleColumn = \`module_\${requiredModule.toLowerCase()}\`;
      const isModuleEnabled = Boolean(sub[moduleColumn]);

      if (!isModuleEnabled) {
        return res.status(403).json({
          error: 'ModuleNotSubscribed',
          message: \`Module '\${requiredModule}' is not enabled on your '\${sub.plan_tier}' plan.\`,
          tenantId,
          plan: sub.plan_tier,
          requestedModule: requiredModule,
        });
      }

      next();
    } catch (err: any) {
      return res.status(500).json({ error: 'SubscriptionVerificationError', details: err.message });
    }
  };
};`;

  const CONTROLLER_CODE = `// ============================================================================
// PHASE 2: DYNAMIC FORM CONTROLLER LOGIC (GET / POST WITH JSONB VALIDATION)
// ============================================================================

import { Response } from 'express';
import { AuthenticatedTenantRequest } from '../middleware/auth';
import { dbPool } from '../db/postgres';

export const getFormTemplate = async (
  req: AuthenticatedTenantRequest,
  res: Response
) => {
  try {
    const { entityType } = req.params;
    const tenantId = req.user!.tenantId;

    const query = \`
      SELECT id, entity_type, name, description, module, version, schema_definition
      FROM form_templates
      WHERE tenant_id = $1 AND entity_type = $2 AND is_active = TRUE
      ORDER BY version DESC
      LIMIT 1;
    \`;

    const result = await dbPool.query(query, [tenantId, entityType]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'TemplateNotFound',
        message: \`No active form template defined for entity '\${entityType}' in this tenant.\`,
      });
    }

    return res.status(200).json({
      success: true,
      template: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'GetTemplateFailed', details: error.message });
  }
};

export const createEntityRecord = async (
  req: AuthenticatedTenantRequest,
  res: Response
) => {
  const client = await dbPool.connect();
  try {
    const { entityType } = req.params;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const incomingData = req.body;

    const templateRes = await client.query(
      \`SELECT id, schema_definition FROM form_templates 
       WHERE tenant_id = $1 AND entity_type = $2 AND is_active = TRUE 
       ORDER BY version DESC LIMIT 1\`,
      [tenantId, entityType]
    );

    if (templateRes.rows.length === 0) {
      return res.status(400).json({
        error: 'InvalidEntityType',
        message: \`Entity type '\${entityType}' has no registered form schema.\`,
      });
    }

    const { id: templateId, schema_definition } = templateRes.rows[0];
    const fields = schema_definition.fields || [];

    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};

    for (const field of fields) {
      const val = incomingData[field.name];

      if (field.required && (val === undefined || val === null || val === '')) {
        errors[field.name] = \`Field '\${field.label}' is mandatory.\`;
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        if (field.type === 'number' || field.type === 'currency') {
          const num = Number(val);
          if (isNaN(num)) {
            errors[field.name] = \`Field '\${field.label}' must be a numeric value.\`;
          } else {
            sanitizedData[field.name] = num;
          }
        } else if (field.type === 'boolean') {
          sanitizedData[field.name] = Boolean(val);
        } else {
          sanitizedData[field.name] = String(val).trim();
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        error: 'ValidationError',
        validationErrors: errors,
      });
    }

    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);

    const insertQuery = \`
      INSERT INTO entity_records (
        tenant_id, 
        template_id, 
        entity_type, 
        status, 
        data, 
        created_by
      )
      VALUES ($1, $2, $3, 'pending_approval', $4::jsonb, $5)
      RETURNING id, entity_type, status, data, created_at;
    \`;

    const recordRes = await client.query(insertQuery, [
      tenantId,
      templateId,
      entityType,
      JSON.stringify(sanitizedData),
      userId,
    ]);

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Dynamic record successfully stored in PostgreSQL JSONB column.',
      record: recordRes.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'RecordCreationError', details: error.message });
  } finally {
    client.release();
  }
};`;

  const runSimulation = () => {
    setIsRunning(true);
    setConsoleLogs([]);

    const tenant = tenants.find((t) => t.id === simSelectedTenantId) || activeTenant;
    const isModuleActive = tenant.enabledModules[simModuleHeader];

    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] INCOMING REQUEST: ${simMethod} ${simEndpoint}`);
    logs.push(`[HTTP HEADERS] Authorization: Bearer eyJhbGciOi... (Sub: u-user-1, Tenant: ${tenant.id})`);
    logs.push(`[MIDDLEWARE 1: authenticateTenantUser] Decoded JWT successfully.`);
    logs.push(`[DATABASE RLS] Executed: SELECT set_config('app.current_tenant_id', '${tenant.id}', true);`);
    logs.push(`[MIDDLEWARE 2: requireModuleAccess('${simModuleHeader}')] Checking subscription for Tenant '${tenant.name}'...`);

    setTimeout(() => {
      if (!isModuleActive) {
        logs.push(`[ACCESS REJECTED] Module '${simModuleHeader.toUpperCase()}' is disabled in plan tier '${tenant.tier}'.`);
        logs.push(`HTTP/1.1 403 Forbidden`);
        logs.push(
          JSON.stringify(
            {
              error: 'ModuleNotSubscribed',
              message: isRtl
                ? `الوحدة '${t.modules[simModuleHeader]}' غير مفعلة في باقة '${tenant.tier}'.`
                : `Module '${simModuleHeader}' is not enabled on your '${tenant.tier}' plan.`,
              tenantId: tenant.id,
              plan: tenant.tier,
            },
            null,
            2
          )
        );
      } else {
        logs.push(`[ACCESS GRANTED] Module '${simModuleHeader.toUpperCase()}' is verified active.`);
        logs.push(`[CONTROLLER: createEntityRecord] Fetching active template for entity 'asset_entry'...`);
        logs.push(`[SCHEMA VALIDATION] Validated dynamic fields against template. Zero schema violations.`);
        logs.push(`[POSTGRESQL INSERT] INSERT INTO entity_records (tenant_id, template_id, entity_type, data) VALUES (...) RETURNING id;`);
        logs.push(`HTTP/1.1 201 Created`);
        logs.push(
          JSON.stringify(
            {
              success: true,
              message: isRtl ? 'تم حفظ السجل بنجاح في عمود JSONB' : 'Dynamic record successfully stored in PostgreSQL JSONB column.',
              record: {
                id: `rec-${Math.random().toString(36).substring(2, 9)}`,
                entity_type: 'asset_entry',
                status: 'pending_approval',
                data: JSON.parse(simPayload || '{}'),
                created_at: new Date().toISOString(),
              },
            },
            null,
            2
          )
        );
      }
      setConsoleLogs(logs);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t.backendTitle}</h1>
            <p className="text-xs text-slate-500">{t.backendSub}</p>
          </div>
        </div>
      </div>

      {/* Code Viewer & Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Viewer */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCodeTab('middleware')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeCodeTab === 'middleware'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t.tabMiddlewareCode}
              </button>
              <button
                onClick={() => setActiveCodeTab('controller')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeCodeTab === 'controller'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t.tabControllerCode}
              </button>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  activeCodeTab === 'middleware' ? MIDDLEWARE_CODE : CONTROLLER_CODE,
                  activeCodeTab
                )
              }
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
            >
              {copiedKey === activeCodeTab ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              {isRtl ? 'نسخ' : 'Copy'}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto flex-1 max-h-[580px] leading-relaxed dir-ltr text-left">
            {activeCodeTab === 'middleware' ? MIDDLEWARE_CODE : CONTROLLER_CODE}
          </pre>
        </div>

        {/* Right: Live Middleware & Controller Sandbox */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                {t.sandboxTitle}
              </h2>
              <span className="text-xs text-slate-500 font-mono dir-ltr">Express Engine</span>
            </div>

            {/* Config inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t.targetTenant}</label>
                <select
                  value={simSelectedTenantId}
                  onChange={(e) => setSimSelectedTenantId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                >
                  {tenants.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t.requiredModuleGuard}
                </label>
                <select
                  value={simModuleHeader}
                  onChange={(e) => setSimModuleHeader(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                >
                  <option value="operations">{t.modules.operations}</option>
                  <option value="finance">{t.modules.finance}</option>
                  <option value="hr">{t.modules.hr}</option>
                  <option value="tasks">{t.modules.tasks}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">
                {t.payloadLabel}
              </label>
              <textarea
                rows={6}
                value={simPayload}
                onChange={(e) => setSimPayload(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-slate-900 text-emerald-400 dir-ltr text-left"
              />
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {isRunning ? t.executingBtn : t.dispatchBtn}
            </button>
          </div>

          {/* Console Output */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{t.terminalLogs}</span>
              <span className="text-[10px] font-mono text-slate-400">Node.js Express Log</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] h-44 overflow-y-auto space-y-1 dir-ltr text-left">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-500 italic">
                  {isRtl ? "انقر على 'إرسال الطلب' لاختبار مسار Express وحارس الاشتراك." : "Click 'Dispatch Request' to test the Express authentication and module subscription middleware."}
                </div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('403') || log.includes('REJECTED')
                        ? 'text-rose-400 font-bold'
                        : log.includes('201') || log.includes('GRANTED')
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
