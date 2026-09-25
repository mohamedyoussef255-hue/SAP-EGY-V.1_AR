import React, { useState } from 'react';
import {
  Server,
  Cloud,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  KeyRound,
  FileCode,
  HardDrive,
  Cpu,
  RefreshCw,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DeploymentMode, OnPremiseLicense } from '../types/erp';
import { useLanguage } from '../i18n/LanguageContext';

interface HybridDeploymentStudioProps {
  currentMode: DeploymentMode;
  onToggleMode: (newMode: DeploymentMode) => void;
  license: OnPremiseLicense;
  onUpdateLicense: (updated: OnPremiseLicense) => void;
}

export const HybridDeploymentStudio: React.FC<HybridDeploymentStudioProps> = ({
  currentMode,
  onToggleMode,
  license,
  onUpdateLicense,
}) => {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'compose' | 'dockerfile' | 'middleware' | 'hr_sap'>('compose');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // License test input state
  const [inputKey, setInputKey] = useState(license.licenseKey);
  const [licenseFeedback, setLicenseFeedback] = useState<{ status: 'valid' | 'expired' | 'invalid'; msg: string } | null>(null);

  const copyToClipboard = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const handleTestLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    if (inputKey.includes('EXPIRED')) {
      const updated: OnPremiseLicense = {
        ...license,
        licenseKey: inputKey,
        isValid: false,
        isExpired: true,
        expiresAt: '2025-12-31T23:59:59Z',
      };
      onUpdateLicense(updated);
      setLicenseFeedback({
        status: 'expired',
        msg: isRtl
          ? 'تنبيه أمني: مفتاح الترخيص منتهي الصلاحية بتاريخ 31-12-2025. تم تفعيل الحظر على الخادم المحلي.'
          : 'Security Alert: License expired on 2025-12-31. Local server operations blocked.',
      });
    } else if (inputKey.length < 15) {
      const updated: OnPremiseLicense = {
        ...license,
        licenseKey: inputKey,
        isValid: false,
        isExpired: false,
      };
      onUpdateLicense(updated);
      setLicenseFeedback({
        status: 'invalid',
        msg: isRtl
          ? 'خطأ: التوقيع الرقمي للمفتاح غير صالح أو تالف. فشل فحص RSA/Ed25519.'
          : 'Error: Invalid cryptographic signature. Cryptographic verification failed.',
      });
    } else {
      const updated: OnPremiseLicense = {
        ...license,
        licenseKey: inputKey,
        isValid: true,
        isExpired: false,
        expiresAt: '2028-06-30T23:59:59Z',
      };
      onUpdateLicense(updated);
      setLicenseFeedback({
        status: 'valid',
        msg: isRtl
          ? 'تم التحقق بنجاح: الترخيص صالح ومعتمد محلياً حتى 30-06-2028 لشركة ' + license.licensedTo
          : 'Verified Successfully: License active until 2028-06-30 for ' + license.licensedTo,
      });
    }
  };

  const DOCKER_COMPOSE_CONTENT = `# ==============================================================================
# EZWATY ERP (عزوتي) - ON-PREMISE PRODUCTION DOCKER-COMPOSE
# Designed for Turnkey Local Server Installation & Air-Gapped / Private Deployments
# ==============================================================================

version: '3.9'

networks:
  ezwaty-network:
    driver: bridge

volumes:
  ezwaty-postgres-data:
    driver: local
  ezwaty-uploads-data:
    driver: local

services:
  # ----------------------------------------------------------------------------
  # 1. PostgreSQL 16 Relational & JSONB Database Engine
  # ----------------------------------------------------------------------------
  postgres:
    image: postgres:16-alpine
    container_name: ezwaty-erp-postgres
    restart: always
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-ezwaty_erp_db}
      POSTGRES_USER: \${POSTGRES_USER:-ezwaty_admin}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-ChangeMeSecurely2026!}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - ezwaty-postgres-data:/var/lib/postgresql/data
    ports:
      - "\${POSTGRES_LOCAL_PORT:-5432}:5432"
    networks:
      - ezwaty-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-ezwaty_admin} -d \${POSTGRES_DB:-ezwaty_erp_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # ----------------------------------------------------------------------------
  # 2. EZWATY ERP Full-Stack Application (Node.js API + React Frontend)
  # ----------------------------------------------------------------------------
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: ezwaty-erp:latest
    container_name: ezwaty-erp-core
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      
      # HYBRID DEPLOYMENT SWITCH: 'ON_PREMISE' vs 'CLOUD'
      DEPLOYMENT_MODE: \${DEPLOYMENT_MODE:-ON_PREMISE}
      
      # Fixed Tenant UUID for Local On-Premise Single-Tenant Database Queries
      LOCAL_TENANT_ID: \${LOCAL_TENANT_ID:-00000000-0000-0000-0000-000000000001}
      LOCAL_TENANT_NAME: "\${LOCAL_TENANT_NAME:-Al-Amal Enterprise Local}"
      
      # Cryptographic Offline / Online License Key for On-Premise Validation
      ON_PREMISE_LICENSE_KEY: \${ON_PREMISE_LICENSE_KEY:-EZWATY-ENT-2026-X992-LIVE}
      LICENSE_PUBLIC_KEY: \${LICENSE_PUBLIC_KEY:-MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...}
      
      # Database Connection Strings
      DATABASE_URL: postgres://\${POSTGRES_USER:-ezwaty_admin}:\${POSTGRES_PASSWORD:-ChangeMeSecurely2026!}@postgres:5432/\${POSTGRES_DB:-ezwaty_erp_db}
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: \${POSTGRES_DB:-ezwaty_erp_db}
      DATABASE_USER: \${POSTGRES_USER:-ezwaty_admin}
      DATABASE_PASSWORD: \${POSTGRES_PASSWORD:-ChangeMeSecurely2026!}

      # Authentication Secrets
      JWT_SECRET: \${JWT_SECRET:-EzwatySuperSecretOnPremiseKey2026!}
      JWT_EXPIRY: \${JWT_EXPIRY:-12h}
    volumes:
      - ezwaty-uploads-data:/app/uploads
    ports:
      - "\${APP_PORT:-3000}:3000"
    networks:
      - ezwaty-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s`;

  const DOCKERFILE_CONTENT = `# ==============================================================================
# EZWATY ERP (عزوتي) - PRODUCTION MULTI-STAGE DOCKERFILE
# ==============================================================================

# STAGE 1: Build Frontend SPA
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STAGE 2: Production Container
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets & server source
COPY --from=frontend-builder /app/dist ./dist
COPY server.ts ./
COPY tsconfig.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "run", "start"]`;

  const MIDDLEWARE_CODE = `// ============================================================================
// PHASE 1: HYBRID AUTHENTICATION & LICENSE VALIDATION MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { hybridConfig } from '../config/hybridConfig';

export const hybridAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Check Deployment Mode Toggle
  const isCloud = process.env.DEPLOYMENT_MODE === 'CLOUD';

  if (!isCloud) {
    // ------------------------------------------------------------------------
    // ON-PREMISE BRANCH: Validate Cryptographic License Key
    // ------------------------------------------------------------------------
    const licenseKey = req.headers['x-license-key'] || process.env.ON_PREMISE_LICENSE_KEY;
    const license = verifyCryptographicLicense(licenseKey as string);

    if (!license.isValid || license.isExpired) {
      return res.status(403).json({
        error: 'LicenseExpiredOrInvalid',
        message: 'Active On-Premise License Key required. Server access blocked.',
      });
    }

    // Default to the single local tenant UUID (bypassing tenant extraction)
    req.user = {
      userId: req.headers['x-user-id'] || 'local-admin-01',
      tenantId: process.env.LOCAL_TENANT_ID || '00000000-0000-0000-0000-000000000001',
      role: 'Enterprise Administrator',
    };
    return next();
  }

  // --------------------------------------------------------------------------
  // CLOUD BRANCH: Strict JWT Tenant Extraction & Row-Level Security
  // --------------------------------------------------------------------------
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Cloud JWT Bearer Token' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

  req.user = {
    userId: decoded.sub,
    tenantId: decoded.tenant_id,
    role: decoded.role,
  };

  // Set PostgreSQL RLS transaction context
  await dbPool.query("SELECT set_config('app.current_tenant_id', $1, true);", [req.user.tenantId]);
  next();
};`;

  const HR_SAP_ADAPTATION_CODE = `// ============================================================================
// PHASE 3: DATABASE & HR/SAP MODULE REFACTORING
// Demonstrates how getEmployees() dynamically adjusts its WHERE clause
// without breaking the SAP personnel number mapping or JSONB schemas.
// ============================================================================

export async function getEmployees(departmentCode?: string) {
  const isCloud = process.env.DEPLOYMENT_MODE === 'CLOUD';
  const defaultLocalTenantId = process.env.LOCAL_TENANT_ID || '00000000-0000-0000-0000-000000000001';

  const whereConditions: string[] = [];
  const queryParams: any[] = [];

  // In Cloud Mode: Strict tenant_id filtering is applied from current user context
  // In On-Premise Mode: Defaults to the singleton local tenant UUID
  if (isCloud) {
    queryParams.push(currentUser.tenantId);
    whereConditions.push(\`e.tenant_id = $\${queryParams.length}\`);
  } else {
    // Single-Tenant optimization: Still links to local tenant ID so the exact
    // same DDL schema and indexes function seamlessly without running table migrations!
    queryParams.push(defaultLocalTenantId);
    whereConditions.push(\`e.tenant_id = $\${queryParams.length}\`);
  }

  if (departmentCode) {
    queryParams.push(departmentCode);
    whereConditions.push(\`d.code = $\${queryParams.length}\`);
  }

  const sql = \`
    SELECT 
      e.id,
      e.tenant_id,
      e.full_name,
      e.email,
      e.sap_personnel_number,   -- Preserves SAP HR ERP Master Record mapping
      e.dynamic_attributes,     -- PostgreSQL JSONB dynamic custom fields
      d.name AS department_name
    FROM hr_employees e
    LEFT JOIN departments d ON d.id = e.department_id
    WHERE \${whereConditions.join(' AND ')}
    ORDER BY e.created_at DESC;
  \`;

  return dbPool.query(sql, queryParams);
}`;

  return (
    <div className="space-y-6">
      {/* Top Banner: Deployment Mode Interactive Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${currentMode === 'ON_PREMISE' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              {currentMode === 'ON_PREMISE' ? <Server className="w-6 h-6" /> : <Cloud className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{t.hybridTitle}</h1>
              <p className="text-xs text-slate-500">{t.hybridSub}</p>
            </div>
          </div>

          {/* Toggle Button Cloud vs On-Premise */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onToggleMode('CLOUD')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentMode === 'CLOUD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{t.modeCloud}</span>
            </button>

            <button
              onClick={() => onToggleMode('ON_PREMISE')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentMode === 'ON_PREMISE'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{t.modeOnPremise}</span>
            </button>
          </div>
        </div>

        {/* Mode Information Card */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          currentMode === 'ON_PREMISE' ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-blue-50/60 border-blue-200 text-blue-900'
        }`}>
          {currentMode === 'ON_PREMISE' ? (
            <Server className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Cloud className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm">
              {currentMode === 'ON_PREMISE' ? t.modeOnPremise : t.modeCloud}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {currentMode === 'ON_PREMISE' ? t.modeOnPremiseDesc : t.modeCloudDesc}
            </p>
            {currentMode === 'ON_PREMISE' && (
              <p className="text-[11px] font-semibold text-amber-700 pt-1">
                {t.onPremiseSwitchNotice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* On-Premise License Card (Always visible or highlighted in On-Premise mode) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">{t.licenseCardTitle}</h2>
          </div>

          <div className="flex items-center gap-2">
            {license.isValid && !license.isExpired ? (
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t.licenseValid}
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {t.licenseExpired}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">{t.licenseCompany}</span>
            <strong className="text-slate-900 font-bold text-sm">{license.licensedTo}</strong>
            <span className="block text-[11px] text-slate-400 mt-0.5">{license.edition}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">{t.licenseExpiryDate}</span>
            <strong className="text-slate-900 font-bold text-sm">{new Date(license.expiresAt).toLocaleDateString()}</strong>
            <span className="block text-[11px] text-emerald-600 mt-0.5">Air-Gapped Cryptographic Signature Verified</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">Local Database Connection:</span>
            <strong className="text-slate-900 font-mono text-xs">localhost:5432 (PostgreSQL 16)</strong>
            <span className="block text-[11px] text-indigo-600 font-mono mt-0.5">{t.singleTenantLocalNotice}</span>
          </div>
        </div>

        {/* License Key Test Form */}
        <form onSubmit={handleTestLicense} className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-slate-700 block">
            {t.licenseKeyInput}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="e.g. EZWATY-ENT-2026-X992-LIVE or test with EZWATY-EXPIRED-TEST-KEY"
              className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50 dir-ltr text-left"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {t.validateLicenseBtn}
            </button>
          </div>

          {licenseFeedback && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              licenseFeedback.status === 'valid'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {licenseFeedback.status === 'valid' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{licenseFeedback.msg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Code & Infrastructure Explorer Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
          {[
            { key: 'compose', label: t.dockerTabCompose, icon: Server },
            { key: 'dockerfile', label: t.dockerTabDockerfile, icon: HardDrive },
            { key: 'middleware', label: t.dockerTabMiddleware, icon: Terminal },
            { key: 'hr_sap', label: t.dockerTabHrSap, icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 text-xs md:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-2 dir-ltr">
                {activeTab === 'compose'
                  ? 'docker-compose.yml'
                  : activeTab === 'dockerfile'
                  ? 'Dockerfile'
                  : activeTab === 'middleware'
                  ? 'hybridAuthMiddleware.ts'
                  : 'getEmployeesAdaptability.ts'}
              </span>
            </div>

            <button
              onClick={() => {
                const code =
                  activeTab === 'compose'
                    ? DOCKER_COMPOSE_CONTENT
                    : activeTab === 'dockerfile'
                    ? DOCKERFILE_CONTENT
                    : activeTab === 'middleware'
                    ? MIDDLEWARE_CODE
                    : HR_SAP_ADAPTATION_CODE;
                copyToClipboard(code, activeTab);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedTab === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.copiedDockerBtn}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.copyDockerBtn}</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-5 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[520px] leading-relaxed dir-ltr text-left">
            {activeTab === 'compose'
              ? DOCKER_COMPOSE_CONTENT
              : activeTab === 'dockerfile'
              ? DOCKERFILE_CONTENT
              : activeTab === 'middleware'
              ? MIDDLEWARE_CODE
              : HR_SAP_ADAPTATION_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};
