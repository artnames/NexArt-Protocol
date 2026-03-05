/**
 * Shared CER bundle classifier — browser-side mirror of
 * supabase/functions/_shared/cer-classifier.ts
 *
 * KEEP IN SYNC with the edge function version.
 * This file MUST NOT import any server-side or Deno modules.
 */

export type CERCategory =
  | 'FULL_CER_VERIFIABLE'
  | 'REDACTED_DERIVATIVE'
  | 'LEGACY_INCOMPLETE_RECORD'
  | 'FULL_CER_MISMATCH'
  | 'UNKNOWN';

export interface CERClassification {
  category: CERCategory;
  surface: 'ai' | 'codemode';
  reason: string;
}

export function classifyCERBundle(
  bundle: Record<string, unknown>,
  bundleType: string | null,
  certificateHash: string | null,
  localVerifyOk: boolean | null,
): CERClassification {
  const bt = (bundle.bundleType as string | undefined) ?? bundleType;
  const isCodeMode = bt === 'cer.codemode.render.v1';
  const isAI = bt === 'cer.ai.execution.v1';
  const surface: 'ai' | 'codemode' = isCodeMode ? 'codemode' : 'ai';

  const snap = bundle.snapshot as Record<string, unknown> | undefined;
  const hash = (bundle.certificateHash as string | undefined) ?? certificateHash;

  if (!bt) {
    return { category: 'UNKNOWN', surface, reason: 'Missing bundleType' };
  }

  if (!isCodeMode && !isAI) {
    return { category: 'UNKNOWN', surface, reason: `Unrecognized bundleType: ${bt}` };
  }

  if (isCodeMode) {
    const hasEnvelope = !!snap && !!hash && !!(bundle.createdAt || bundle.version);
    const snapObj = snap ?? bundle;
    const hasInputHash = !!(snapObj.inputHash ?? (snapObj as Record<string, unknown>).input_hash);
    const hasOutputHash = !!(snapObj.outputHash ?? (snapObj as Record<string, unknown>).output_hash);
    const hasProtocol = !!(snapObj.protocolVersion ?? (snapObj as Record<string, unknown>).protocol_version);
    const hasSdk = !!(snapObj.sdkVersion ?? (snapObj as Record<string, unknown>).sdk_version);
    const hasCoreFields = hasInputHash && hasOutputHash && hasProtocol && hasSdk;

    if (!hasEnvelope || !hasCoreFields) {
      return { category: 'LEGACY_INCOMPLETE_RECORD', surface, reason: 'Code Mode record missing envelope or core CER fields' };
    }

    if (localVerifyOk === false) {
      return { category: 'FULL_CER_MISMATCH', surface, reason: 'Local certificate hash verification failed' };
    }

    return { category: 'FULL_CER_VERIFIABLE', surface, reason: 'Complete Code Mode CER' };
  }

  // AI
  if (!snap) {
    return { category: 'LEGACY_INCOMPLETE_RECORD', surface, reason: 'AI bundle missing snapshot' };
  }

  if (!hash) {
    return { category: 'LEGACY_INCOMPLETE_RECORD', surface, reason: 'AI bundle missing certificateHash' };
  }

  const isRedacted =
    !('input' in snap) || snap.input == null ||
    !('output' in snap) || snap.output == null ||
    !('prompt' in snap) || snap.prompt == null;

  if (isRedacted) {
    return { category: 'REDACTED_DERIVATIVE', surface, reason: 'AI bundle has redacted snapshot' };
  }

  if (localVerifyOk === false) {
    return { category: 'FULL_CER_MISMATCH', surface, reason: 'Local certificate hash verification failed' };
  }

  return { category: 'FULL_CER_VERIFIABLE', surface, reason: 'Complete AI CER' };
}

export function hasSignedReceipt(attestationJson: Record<string, unknown> | null): boolean {
  if (!attestationJson) return false;
  return !!(attestationJson.receipt && (attestationJson.signatureB64Url || attestationJson.signature));
}
