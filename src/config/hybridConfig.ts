// ============================================================================
// PHASE 1: HYBRID DEPLOYMENT CONFIGURATION & ENVIRONMENT SETUP
// ============================================================================

import dotenv from 'dotenv';
dotenv.config();

export type DeploymentMode = 'CLOUD' | 'ON_PREMISE';

export interface AppHybridConfig {
  deploymentMode: DeploymentMode;
  isCloud: boolean;
  isOnPremise: boolean;
  
  // On-Premise Single-Tenant Defaults
  localTenantId: string;
  localTenantName: string;
  
  // Licensing
  onPremiseLicenseKey: string;
  licensePublicKey: string;
  
  // Database & Server
  databaseUrl: string;
  port: number;
}

export const hybridConfig: AppHybridConfig = {
  deploymentMode: (process.env.DEPLOYMENT_MODE?.toUpperCase() === 'ON_PREMISE'
    ? 'ON_PREMISE'
    : 'CLOUD') as DeploymentMode,
  
  get isCloud() {
    return this.deploymentMode === 'CLOUD';
  },
  
  get isOnPremise() {
    return this.deploymentMode === 'ON_PREMISE';
  },

  // In On-Premise mode, all SQL queries seamlessly fallback to this singleton UUID
  localTenantId: process.env.LOCAL_TENANT_ID || '00000000-0000-0000-0000-000000000001',
  localTenantName: process.env.LOCAL_TENANT_NAME || 'Local Enterprise Server',

  onPremiseLicenseKey: process.env.ON_PREMISE_LICENSE_KEY || 'EZWATY-ENT-2026-X992-LIVE',
  licensePublicKey: process.env.LICENSE_PUBLIC_KEY || '',

  databaseUrl: process.env.DATABASE_URL || 'postgres://localhost:5432/ezwaty_erp_db',
  port: Number(process.env.PORT) || 3000,
};
