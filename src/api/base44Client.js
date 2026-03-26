import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const appId = appParams.appId;

console.log('[Base44 SDK] Initializing with appId:', appId);
console.log('[Base44 SDK] VITE_BASE44_APP_ID:', import.meta.env.VITE_BASE44_APP_ID);

if (!appId) {
  console.warn('[Base44 SDK] No appId found in appParams. SDK might not function correctly.');
}

export const base44 = createClient({
  appId: appId || 'unknown',
  baseUrl: appParams.appBaseUrl,
});
