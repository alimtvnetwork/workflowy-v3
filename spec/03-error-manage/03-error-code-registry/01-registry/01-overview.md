# 1. Registry Overview

> **Parent:** [Error Code Registry overview](../00-overview.md)

---

## Registered Project Prefixes

| Prefix | Project | Range | Spec Location | Status |
|--------|---------|-------|---------------|--------|
| `GEN` | General/Shared | 1000-1999 | (embedded) | ✅ Active |
| `SM` | Spec Management Software | 2000-2999 | `spec/02-spec-management-software/` | ✅ Active |
| `LM` | Link Manager | 3000-3999 | `spec/13-wp-plugin/04-link-manager/` | ⚠️ Deprecated — range reassigned to 15000-15999 |
| `CLI` | CLI Tools (legacy) | 4000-4999 | (deprecated) | ⚠️ Deprecated |
| `GS` | GSearch CLI Core | 7000-7099 | `spec/09-gsearch-cli/` | ✅ Active |
| `BR` | BRun CLI | 7100-7599 | `spec/10-brun-cli/` | ✅ Active |
| `GS` | GSearch Movie Search | 7600-7609 | `spec/09-gsearch-cli/01-backend/` | ✅ Active |
| `GS` | GSearch BI Suite | 7700-7839 | `spec/09-gsearch-cli/01-backend/openapi-bi-suite.yaml` | ✅ Active |
| `GS` | GSearch Multi-Source | 7840-7859 | `spec/09-gsearch-cli/01-backend/` | ✅ Active |
| `GS` | GSearch Scheduled | 7860-7879 | `spec/09-gsearch-cli/01-backend/` | ✅ Active |
| `GS` | GSearch Chrome Extension | 7880-7899 | `spec/09-gsearch-cli/01-backend/` | ✅ Active |
| `GS` | GSearch Enum Architecture | 7900-7919 | `spec/09-gsearch-cli/01-backend/` | ✅ Active |
| `GS` | GSearch Provider Integration | 7920-7949 | `spec/09-gsearch-cli/01-backend/` | ✅ Active |
| `NF` | Nexus Flow | 8000-8399 | `spec/12-nexus-flow-cli/` | ✅ Active |
| `AB` | AI Bridge Core | 9000-9499 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `PS` | PowerShell Integration | 9500-9599 | `spec/06-powershell-integration/` | ✅ Active |
| `AB` | AI Bridge SEO | 9500-9540 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Extended | 9600-9699 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Revisions/Suggestions | 9700-9749 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge RAG Session Memory | 9750-9809 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Adaptive Reasoning | 9810-9829 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge WebSocket Resilience | 9830-9839 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Context Integration | 9840-9847 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Research Mode | 9848-9849 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Code Pattern Learning | 9850-9869 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Plan Generation | 9870-9889 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Plan Synchronization | 9890-9909 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Plan Templates | 9910-9929 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Execution Monitoring | 9930-9949 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Retry Strategies | 9950-9969 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Long-Chain Commands | 9970-9989 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Vector DB | 9990-9999 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB` | AI Bridge Lovable Reasoning | 19000-19019 | `spec/11-ai-bridge-cli/` | ✅ Active |
| `AB-TR` | AI Bridge Non-Vector RAG | 20000-20999 | `spec/33-ai-bridge-non-vector-rag/` | ✅ Active |
| `WPB` | WP Plugin Builder | 10000-10499 | `spec/14-wp-plugin-builder/` | ✅ Active |
| `SRC` | Spec Reverse CLI | 11000-11999 | `spec/15-spec-reverse-cli/` | ✅ Active |
| `WSP` | WP SEO Publish | 12000-12599 | `spec/21-wp-seo-publish-cli/` | ✅ Active |
| `WPP` | WP Plugin Publish | 13000-13999 | `spec/13-wp-plugin/05-wp-plugin-publish/` | ✅ Active |
| `AIT` | AI Transcribe CLI | 14000-14499 | `spec/16-ai-transcribe-cli/` | ✅ Active |
| `EQM` | Exam Manager | 14500-14999 | `spec/13-wp-plugin/03-exam-manager/` | ✅ Active |
| `LM` | Link Manager | 15000-15999 | `spec/13-wp-plugin/04-link-manager/` | ✅ Active |
| `SM-CG` | SM Code Generation | 16000-16799 | `spec/02-spec-management-software/05-features/24-code-generation-system/` | ✅ Active |
| `SM-PE` | SM Project Editor | 17000-17999 | `spec/02-spec-management-software/05-features/28-project-editor/` | ✅ Active |
| `SM-GS` | SM GSearch CLI | 18000-18249 | `spec/02-spec-management-software/05-features/22-golang-search-cli/` | ✅ Active |
| `SM-RT` | SM Realtime | 2800-2849 | `spec/02-spec-management-software/05-features/18-realtime/` | ✅ Active |
| `SM-RV` | SM Registry Validator | 2850-2859 | `spec/07-error-code-registry/08-overlap-validator.md` | ✅ Active |
| `CAST` | Type Casting (Cross-Cutting) | GEN-600-01 to GEN-600-10 | `spec/03-coding-guidelines/01-cross-language/03-casting-elimination-patterns/00-overview.md` | ✅ Active |

---

## Range Allocation Map

```
1000-1999  GEN (General/Shared)
2000-2999  SM  (Spec Management)
3000-3999  LM  [DEPRECATED - moved to 15000]
4000-4999  CLI [DEPRECATED]
5000-6999  --- [UNALLOCATED]
7000-7099  GS  (GSearch Core)
7100-7599  BR  (BRun)
7600-7609  GS  (Movie Search)
7610-7699  --- [UNALLOCATED]
7700-7839  GS  (BI Suite)
7840-7859  GS  (Multi-Source)
7860-7879  GS  (Scheduled)
7880-7899  GS  (Chrome Extension)
7900-7919  GS  (Enum Architecture)
7920-7949  GS  (Provider Integration)
7950-7999  --- [UNALLOCATED]
8000-8399  NF  (Nexus Flow)
8400-8999  --- [UNALLOCATED]
9000-9499  AB  (AI Bridge Core)
9500-9599  PS  (PowerShell) / AB (AI SEO 9500-9540)
9600-9999  AB  (AI Bridge Extended)
10000-10499 WPB (WP Plugin Builder) ✅ Compressed from 10000-10999
10500-10999 --- [UNALLOCATED]
11000-11999 SRC (Spec Reverse)
12000-12599 WSP (WP SEO Publish)
12600-12999 --- [UNALLOCATED]
13000-13999 WPP (WP Plugin Publish)
14000-14499 AIT (AI Transcribe)
14500-14999 EQM (Exam Manager)
15000-15999 LM  (Link Manager)
16000-16799 SM-CG (SM Code Generation) ✅ Reassigned from 12xxx
16800-16999 --- [UNALLOCATED]
17000-17999 SM-PE (SM Project Editor) ✅ Reassigned from 13xxx
18000-18249 SM-GS (SM GSearch CLI) ✅ Reassigned from 1xxx-12xxx
18250-18999 --- [UNALLOCATED]
19000-19019 AB  (Lovable Reasoning) ✅ Reassigned from 10500-10519
19020-19999 --- [UNALLOCATED]
20000-20999 AB-TR (Non-Vector RAG) ✅ Reassigned from 12000-12999
20999+      --- [UNALLOCATED]
```

---

## Sibling Files

| # | File | Content |
|---|------|---------|
| 02 | [02-collision-resolution.md](./02-collision-resolution.md) | Wave 1 collision resolution log (13 resolutions) |
| 03 | [03-module-error-ranges.md](./03-module-error-ranges.md) | Per-module error code sub-range allocations |
| 04 | [04-detailed-error-codes.md](./04-detailed-error-codes.md) | Specific error code tables (RAG, SEO, GSearch) |
| 05 | [05-gen-sm-lm-errors.md](./05-gen-sm-lm-errors.md) | GEN, SM, LM, CLI, PS error code tables |
| 06 | [06-format-and-usage.md](./06-format-and-usage.md) | Format reference, adding codes, apperrtype relationship |
