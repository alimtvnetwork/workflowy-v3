# 3. Module Error Code Sub-Ranges

> **Parent:** [Error Code Registry overview](../00-overview.md)

---

## Standalone Specification Error Ranges

| Module | Prefix | Range | Frontend Sub-range | Error Codes Doc |
|--------|--------|-------|-------------------|-----------------|
| GSearch CLI Core | `GS` | 7000-7099 | 7050-7069 | `spec/09-gsearch-cli/01-backend/15-error-codes.md` |
| BRun CLI | `BR` | 7100-7599 | 7150-7169 | `spec/10-brun-cli/01-backend/06-error-handling.md` |
| GSearch Movie Search | `GS` | 7600-7609 | N/A | `spec/09-gsearch-cli/01-backend/` |
| GSearch BI Suite | `GS` | 7700-7839 | 7800-7819 | `spec/09-gsearch-cli/01-backend/openapi-bi-suite.yaml` |
| GSearch Multi-Source | `GS` | 7840-7859 | N/A | `spec/09-gsearch-cli/01-backend/` |
| GSearch Scheduled | `GS` | 7860-7879 | N/A | `spec/09-gsearch-cli/01-backend/` |
| GSearch Chrome Extension | `GS` | 7880-7899 | N/A | `spec/09-gsearch-cli/01-backend/` |
| GSearch Enum Architecture | `GS` | 7900-7919 | N/A | `spec/09-gsearch-cli/01-backend/` |
| GSearch Provider Integration | `GS` | 7920-7949 | N/A | `spec/09-gsearch-cli/01-backend/` |
| Nexus Flow | `NF` | 8000-8399 | 8050-8069 | `spec/12-nexus-flow-cli/01-backend/04-error-codes.md` |
| AI Bridge Core | `AB` | 9000-9499 | 9050-9069 | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge SEO | `AB` | 9500-9540 | N/A | `spec/11-ai-bridge-cli/01-backend/16-ai-seo-error-codes.md` |
| AI Bridge Extended | `AB` | 9600-9699 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Revisions/Suggestions | `AB` | 9700-9749 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge RAG Session Memory | `AB` | 9750-9809 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Adaptive Reasoning | `AB` | 9810-9829 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge WebSocket Resilience | `AB` | 9830-9839 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Context Integration | `AB` | 9840-9847 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Research Mode | `AB` | 9848-9849 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Code Pattern Learning | `AB` | 9850-9869 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Plan Generation | `AB` | 9870-9889 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Plan Synchronization | `AB` | 9890-9909 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Plan Templates | `AB` | 9910-9929 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Execution Monitoring | `AB` | 9930-9949 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Retry Strategies | `AB` | 9950-9969 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Long-Chain Commands | `AB` | 9970-9989 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Vector DB | `AB` | 9990-9999 | N/A | `spec/11-ai-bridge-cli/01-backend/05-error-codes.md` |
| AI Bridge Lovable Reasoning | `AB` | 19000-19019 | N/A | `spec/11-ai-bridge-cli/01-backend/42-lovable-reasoning-defaults.md` |
| WP Plugin Builder | `WPB` | 10000-10499 | N/A | `spec/14-wp-plugin-builder/10-error-handling.md` |
| Spec Reverse CLI | `SRC` | 11000-11999 | N/A | `spec/15-spec-reverse-cli/01-backend/05-error-codes.md` |
| WP SEO Publish | `WSP` | 12000-12599 | N/A | `spec/21-wp-seo-publish-cli/01-backend/` |
| WP Plugin Publish | `WPP` | 13000-13999 | N/A | `spec/13-wp-plugin/05-wp-plugin-publish/66-shared-constants.md` |
| AI Transcribe CLI | `AIT` | 14000-14499 | N/A | `spec/16-ai-transcribe-cli/01-backend/10-error-codes.md` |
| Exam Manager | `EQM` | 14500-14999 | N/A | `spec/13-wp-plugin/03-exam-manager/66-shared-constants.md` |
| Link Manager | `LM` | 15000-15999 | N/A | `spec/13-wp-plugin/04-link-manager/` |
| AI Bridge Non-Vector RAG | `AB-TR` | 20000-20999 | N/A | `spec/33-ai-bridge-non-vector-rag/08-error-codes.md` |

---

## Frontend Error Code Pattern

All CLI frontends use a consistent error code pattern at offset +50 from their base range:

| Offset | Error | Description |
|--------|-------|-------------|
| +50 | ErrWsConnectionFailed | WebSocket connection failure |
| +51 | ErrWsDisconnected | WebSocket unexpectedly closed |
| +52 | ErrSettingsLoadFailed | Failed to load settings |
| +53 | ErrSettingsSaveFailed | Failed to save settings |
| +54 | ErrApiTimeout | API request timeout |
| +55 | ErrApiError | API returned error response |
| +56 | ErrConfigParseError | Failed to parse config |
| +57 | ErrVersionMismatch | Frontend/backend version mismatch |
| +58 | ErrPortUnavailable | Configured port not available |
| +59 | ErrFirewallBlocked | Firewall blocking connection |

---

## AI Bridge Error Code Details (9000-10519)

| Range | Category | Description |
|-------|----------|-------------|
| 9000-9049 | Backend Core | Go backend errors |
| 9050-9069 | Frontend | React frontend errors |
| 9100-9199 | Provider | AI provider connection errors |
| 9200-9299 | Streaming | SSE/WebSocket streaming errors |
| 9301-9310 | RAG Validation | RAG chunk config validation errors |
| 9311-9319 | Request Processing | Request validation errors |
| 9320-9339 | Model & Generation | Model loading, generation errors |
| 9400-9499 | Rate Limiting | Rate limit and quota errors |
| 9500-9540 | AI SEO Generate | SEO module errors |
| 9541-9599 | (Reserved) | Future SEO expansion |
| 9600-9699 | Extended Core | Advanced backend features |
| 9700-9749 | Revisions/Suggestions | Content revision system |
| 9750-9809 | RAG Session Memory | Session-scoped RAG errors |
| 9810-9829 | Adaptive Reasoning | Reasoning mode errors |
| 9830-9839 | WebSocket Resilience | Connection manager errors |
| 9840-9847 | Context Integration | GSearch context injection |
| 9848-9849 | Research Mode | Research delegation errors |
| 9850-9869 | Code Pattern Learning | Pattern detection/enforcement |
| 9870-9889 | Plan Generation | Plan creation errors |
| 9890-9909 | Plan Synchronization | Plan sync/conflict errors |
| 9910-9929 | Plan Templates | Template management errors |
| 9930-9949 | Execution Monitoring | Execution tracking errors |
| 9950-9969 | Retry Strategies | Retry/backoff errors |
| 9970-9989 | Long-Chain Commands | Multi-step command errors |
| 9990-9999 | Vector DB Integration | Vector search errors |
| 19000-19019 | Lovable Reasoning | Reasoning defaults/questions |

---

## AI Bridge Non-Vector RAG Error Code Details (20000-20999)

| Range | Category | Description |
|-------|----------|-------------|
| 20000-20003 | General | Startup, config, database, model availability |
| 20100-20108 | Code Parsing | AST/regex parsing, file read, encoding, timeout |
| 20200-20206 | Document Parsing | Markdown, HTML, CSV, frontmatter parsing |
| 20300-20306 | Tree Construction | LLM enrichment, batch processing, caching |
| 20400-20404 | Tree Storage | SQLite writes, FTS5, migrations, capacity |
| 20500-20507 | Retrieval | Query analysis, traversal, scoring, context assembly |
| 20600-20604 | API | Index/job lookup, validation, rate limiting |
| 20700-20702 | Configuration | Config file loading and validation |
| 20800-20802 | AI Bridge Integration | Bridge communication, router, session |
| 20803-20999 | (Reserved) | Future expansion |

---

## Nexus Flow Error Code Details (8000-8399)

| Range | Category | Description |
|-------|----------|-------------|
| 8000-8049 | Backend Core | Go backend errors |
| 8050-8069 | Frontend | React frontend errors |
| 8100-8199 | Pipeline | Pipeline execution errors |
| 8200-8299 | Block | Block/node errors |
| 8300-8303 | State | State transition errors |
| 8304-8349 | (Available) | Unallocated |
| 8350-8369 | Reset API | Reset/teardown errors |
| 8370-8399 | (Reserved) | Future expansion |

---

## AI Transcribe Error Code Details (14000-14499)

| Range | Category | Description |
|-------|----------|-------------|
| 14000-14049 | General | Initialization, config errors |
| 14050-14099 | Audio Pipeline | Audio processing errors |
| 14100-14149 | STT Providers | Speech-to-text provider errors |
| 14150-14199 | TTS Providers | Text-to-speech provider errors |
| 14200-14249 | Voice Commands | Voice command parsing errors |
| 14250-14299 | Real-time | WebSocket conversation errors |
| 14300-14349 | Voice Cloning | Voice cloning errors |
| 14350-14399 | (Reserved) | Future expansion |
| 14400-14449 | (Reserved) | Future expansion |
| 14450-14469 | Provider Registry | Provider management errors |
| 14470-14489 | Model Download | Model download/verification errors |
| 14490-14499 | (Reserved) | Future expansion |
