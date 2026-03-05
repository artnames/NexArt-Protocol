/**
 * Shared CER bundle classifier.
 * Determines record category for auto-stamp decision logic.
 *
 * MUST be usable in both edge functions and (via a mirrored copy) the browser.
 * MUST NOT import any Deno-specific or Supabase-specific modules.
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

/**
 * Classify a stored CER bundle into a category.
 *
 * @param bundle  The cer_bundle_redacted JSON from the DB
 * @param bundleType  bundle_type column value (fallback)
 * @param certificateHash  certificate_hash column value (fallback)
 * @param localVerifyOk  Result of local hash verification (null if not yet checked)
 */
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

  // No bundleType at all → unknown
  if (!bt) {
    return { category: 'UNKNOWN', surface, reason: 'Missing bundleType' };
  }

  // Not a recognized CER type
  if (!isCodeMode && !isAI) {
    return { category: 'UNKNOWN', surface, reason: `Unrecognized bundleType: ${bt}` };
  }

  // ── Code Mode ──
  if (isCodeMode) {
    // Check if it's a full CER envelope (has snapshot, certificateHash, createdAt)
    const hasEnvelope = !!snap && !!hash && !!(bundle.createdAt || bundle.version);
    // Check legacy indicators: missing core CER fields in the snapshot
    const snapObj = snap ?? bundle; // legacy flat records have fields at top level
    const hasInputHash = !!(snapObj.inputHash ?? snapObj.input_hash);
    const hasOutputHash = !!(snapObj.outputHash ?? snapObj.output_hash);
    const hasProtocol = !!(snapObj.protocolVersion ?? snapObj.protocol_version);
    const hasSdk = !!(snapObj.sdkVersion ?? snapObj.sdk_version);
    const hasCoreFields = hasInputHash && hasOutputHash && hasProtocol && hasSdk;

    if (!hasEnvelope || !hasCoreFields) {
      return { category: 'LEGACY_INCOMPLETE_RECORD', surface, reason: 'Code Mode record missing envelope or core CER fields (inputHash, outputHash, protocolVersion, sdkVersion)' };
    }

    if (localVerifyOk === false) {
      return { category: 'FULL_CER_MISMATCH', surface, reason: 'Local certificate hash verification failed' };
    }

    return { category: 'FULL_CER_VERIFIABLE', surface, reason: 'Complete Code Mode CER with passing local verify' };
  }

  // ── AI Execution ──
  if (!snap) {
    return { category: 'LEGACY_INCOMPLETE_RECORD', surface, reason: 'AI bundle missing snapshot entirely' };
  }

  if (!hash) {
    return { category: 'LEGACY_INCOMPLETE_RECORD', surface, reason: 'AI bundle missing certificateHash' };
  }

  // Detect redaction: input/output/prompt removed during ingestion
  const isRedacted =
    !('input' in snap) || snap.input == null ||
    !('output' in snap) || snap.output == null ||
    !('prompt' in snap) || snap.prompt == null;

  if (isRedacted) {
    return { category: 'REDACTED_DERIVATIVE', surface, reason: 'AI bundle has redacted snapshot (input/output/prompt missing or null)' };
  }

  if (localVerifyOk === false) {
    return { category: 'FULL_CER_MISMATCH', surface, reason: 'Local certificate hash verification failed' };
  }

  return { category: 'FULL_CER_VERIFIABLE', surface, reason: 'Complete AI CER with intact snapshot' };
}

/**
 * Determine if a record already has a signed receipt in its attestation_json.
 */
export function hasSignedReceipt(attestationJson: Record<string, unknown> | null): boolean {
  if (!attestationJson) return false;
  return !!(attestationJson.receipt && (attestationJson.signatureB64Url || attestationJson.signature));
}
