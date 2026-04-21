# 2. Collision Resolution Log

> **Parent:** [Error Code Registry overview](../00-overview.md)
> **Updated:** 2026-03-09 · Wave 1 Remediation (2026-02-07)

---

This section documents all 13 error code collisions resolved in Wave 1 remediation.

📋 **Summary report:** [03-collision-resolution-summary.md](../03-collision-resolution-summary.md) — consolidated before/after table of all 13 resolutions.

---

## Resolution 1: AI Bridge Lovable Reasoning vs WebSocket Resilience (Phase 14, CRIT-07)

**Collision:** `42-lovable-reasoning-defaults.md` defined codes 9830-9835 for Lovable Reasoning, but 9830-9839 was already assigned to WebSocket Connection Manager.

**Resolution:** Lovable Reasoning reassigned to **10500-10519** (new range outside existing AB allocation). WebSocket Resilience retains 9830-9839.

---

## Resolution 2: Nexus Flow Reset API vs State Errors (Phase 15, W-12)

**Collision:** `09-reset-api.md` defined NF-8301 through NF-8308, but `04-error-codes.md` defines 8301-8303 as "State Errors".

**Resolution:** Reset API errors reassigned to **8350-8369** (within NF's 8000-8399 range, previously unallocated). State Errors retain 8301-8303.

---

## Resolution 3: Link Manager vs AI Transcribe (Phase 16, Finding 1.1)

**Collision:** Link Manager spec claimed 14000-14999, directly overlapping AI Transcribe's canonical 14000-14499.

**Resolution:** Link Manager reassigned to **15000-15999**. Legacy LM range 3000-3999 deprecated. AI Transcribe retains 14000-14499.

---

## Resolution 4: AI Transcribe Internal — Voice Commands vs Model Download (Phase 17, Finding 1.1)

**Collision:** Both Voice Commands and Model Download used codes starting at 14200.

**Resolution:** Model Download errors reassigned to **14470-14489** (within AIT's 14000-14499 range). Voice Commands retain 14200-14249.

---

## Resolution 5: WP Plugin Publish Local Codes (Phase 16, Finding 1.3)

**Issue:** WP Plugin Publish used local `E{x}xxx` codes disconnected from ecosystem registry.

**Resolution:** Assigned new prefix `WPP` with range **13000-13999**. All `E{x}xxx` codes must be converted to `13xxx` integers.

---

## Resolution 6: WP Plugin Builder Range Compressed (Revised 2026-02-28)

**Issue:** WPB was originally registered at 10000-10999. Resolution 1 moved Lovable Reasoning to 10500-10519, and Resolution 6 narrowed WPB to 10000-10499. WPB's own specs used codes in 10500-10899 (Code Generation, Spec Processing, Server/API, Settings, Reset).

**Resolution:** All WPB 10500-10899 codes compressed into 10000-10499 using 20-slot sub-ranges (10420-10439 Code Gen, 10440-10459 Spec Processing, 10460-10479 Server/API, 10480-10489 Settings, 10490-10499 Reset). AB Lovable Reasoning reassigned to **19000-19019**. See Resolution 13.

---

## Resolution 7: SM Code Generation vs WP SEO Publish (2026-02-28)

**Collision:** SM Code Generation System used 12000-12799, directly overlapping WSP (WP SEO Publish CLI, 12000-12599).

**Resolution:** SM Code Generation reassigned to **16000-16799**. WSP retains 12000-12599. All 12xxx codes in `spec/02-spec-management-software/05-features/24-code-generation-system/16-error-codes.md` remapped to 16xxx equivalents.

---

## Resolution 8: SM Project Editor vs WP Plugin Publish (2026-02-28)

**Collision:** SM Project Editor used 13000-13999, directly overlapping WPP (WP Plugin Publish, 13000-13999).

**Resolution:** SM Project Editor reassigned to **17000-17999**. WPP retains 13000-13999. All 13xxx codes in `spec/02-spec-management-software/05-features/28-project-editor/05-error-codes.md` remapped to 17xxx equivalents.

---

## Resolution 9: PS/AB SEO 9500 Range Overlap (2026-02-28, Documented)

**Overlap:** PowerShell Integration (PS, 9500-9599) and AI Bridge SEO (AB, 9500-9540) share the 9500-9540 sub-range.

**Resolution:** This is a **known intentional overlap** that does not cause runtime collisions due to format separation:
- **PS codes** use prefixed format: `PS-9500-00`, `PS-9501-01`, etc. (3-segment, string-based)
- **AB SEO codes** use flat integer format: `9501`, `9502`, etc. (Go constants, integer-based)

The two formats are distinguishable at parse time by their encoding. No reassignment is required. Both modules document their codes independently:
- PS: `spec/06-powershell-integration/04-error-codes.md`
- AB SEO: `spec/11-ai-bridge-cli/01-backend/16-ai-seo-error-codes.md`

**Contingency:** If future ambiguity arises (e.g., a unified logging system that strips prefixes), AB SEO should migrate to **9541-9599** (currently reserved for SEO expansion).

---

## Resolution 10: AIT Voice Codes vs WPP (2026-02-28)

**Collision:** AI Transcribe CLI voice-related specs used 13200-13308 (voice commands, voice cloning, TTS providers), directly overlapping WPP (WP Plugin Publish, 13000-13999).

**Resolution:** All AIT voice codes reassigned to their canonical 14xxx sub-ranges per the AIT allocation map:
- Voice Commands: 13200-13206 → **14200-14206**
- Voice Cloning: 13250-13257 → **14300-14307**
- TTS Providers: 13300-13308 → **14150-14158**

WPP retains 13000-13999.

---

## Resolution 11: SM Realtime vs WSP (2026-02-28)

**Collision:** SM Realtime (feature 18) used 12001-12031, directly overlapping WSP (WP SEO Publish CLI, 12000-12599).

**Resolution:** SM Realtime reassigned to **SM-RT 2800-2849** (within SM's base 2000-2999 range). WSP retains 12000-12599.

---

## Resolution 12: SM GSearch CLI vs Multiple Ranges (2026-02-28)

**Collision:** SM GSearch CLI (feature 22) used local 1xxx-12xxx codes across 12 domains, colliding with GEN (1xxx), SM (2xxx), WSP (12xxx), and others.

**Resolution:** All 92 GSearch CLI codes reassigned to **SM-GS 18000-18249** with 20-slot sub-ranges per domain. Full migration table in `spec/02-spec-management-software/05-features/22-golang-search-cli/15-error-codes.md`.

---

## Resolution 13: AB Lovable Reasoning vs WPB (2026-02-28)

**Collision:** AB Lovable Reasoning occupied 10500-10519 (per Resolution 1), within WPB's original 10000-10999 range. Resolution 6 narrowed WPB to 10000-10499 but WPB specs used 10500-10899.

**Resolution:** WPB compressed into **10000-10499** (all 10500-10899 codes remapped to 10420-10499). AB Lovable Reasoning reassigned from 10500-10519 to **19000-19019** (new dedicated range). Full migration table in WPB specs.
