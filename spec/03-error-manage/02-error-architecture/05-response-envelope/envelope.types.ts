// ============================================================================
// envelope.types.ts — Normative TypeScript Contract Peer
// ============================================================================
//
// SPEC ARTIFACT — NOT RUNTIME CODE.
// Lives under spec/ and is the third machine-readable peer of the Universal
// Response Envelope, alongside:
//   - envelope.schema.json   (JSON Schema 2020-12 SSOT)
//   - openapi.envelope.yaml  (OpenAPI 3.1 mirror)
//
// All three MUST stay byte-shape-equivalent. Drift requires updating all three
// in the same commit. Enforced by:
//   - G-CON-01-OPENAPI-PARITY        (OpenAPI ↔ JSON Schema)
//   - G-CON-02-TYPES-PARITY          (this file ↔ JSON Schema)
//   - G-CON-02-TYPES-PASCALCASE      (PascalCase property names)
//   - G-CON-02-TYPES-BRANDED-IDS     (no raw string IDs in any payload type)
//
// When the runtime frontend imports `Envelope<T>`, it MUST import a copy of
// this file vendored under `src/types/envelope.types.ts` — never edit the
// runtime copy directly; regenerate it from this spec file.
// ============================================================================

// ----------------------------------------------------------------------------
// §1 Branded primitive types (ADR-0020 / ADR-0016)
// ----------------------------------------------------------------------------
//
// Branded types prevent raw string IDs from flowing into payload positions.
// `as ItemId` casts are forbidden outside the dedicated `brandItemId()` /
// `parseItemId()` constructors — see G-CON-02-TYPES-BRANDED-IDS.

declare const __ItemIdBrand: unique symbol;
declare const __OwnerIdBrand: unique symbol;
declare const __SortOrderBrand: unique symbol;
declare const __PeerGroupIdBrand: unique symbol;
declare const __ClientMutationIdBrand: unique symbol;

/** ULID-shaped ItemId per ADR-0020. Pattern: ^[0-9A-HJKMNP-TV-Z]{26}$ */
export type ItemId = string & { readonly [__ItemIdBrand]: true };

/** ULID-shaped OwnerId per ADR-0020. Same encoding as ItemId. */
export type OwnerId = string & { readonly [__OwnerIdBrand]: true };

/**
 * Fractional-index base-62 string per ADR-0016.
 * Pattern: ^[0-9A-Za-z]+$
 * Lexicographic sort = visual sort. NEVER cast to number.
 */
export type SortOrder = string & { readonly [__SortOrderBrand]: true };

/** ULID-shaped peer-group identifier per ADR-0005. */
export type PeerGroupId = string & { readonly [__PeerGroupIdBrand]: true };

/**
 * UUID v4 client-minted mutation identifier per ADR-0010 §C1 / §D4.
 * Used by the offline FIFO replay queue for idempotency.
 */
export type ClientMutationId = string & { readonly [__ClientMutationIdBrand]: true };

// ----------------------------------------------------------------------------
// §2 Closed enums (ADR-0015)
// ----------------------------------------------------------------------------

/** 12 closed ItemTypes per ADR-0015. Adding a value requires a new ADR. */
export type ItemType =
  | "bullet"
  | "todo"
  | "note"
  | "board"
  | "column"
  | "card"
  | "dashboard"
  | "mirror"   // legacy enum slot — peer-group model (ADR-0005) is canonical; never assign a new item this value
  | "template"
  | "search"
  | "embed"
  | "separator";

/** Replay queue operation tags per ADR-0010 §C1. */
export type MutationOp =
  | "create"
  | "update"
  | "delete"
  | "move"
  | "mirror"
  | "detach";

// ----------------------------------------------------------------------------
// §3 Envelope tree — mirrors envelope.schema.json field-for-field
// ----------------------------------------------------------------------------

/**
 * Universal Response Envelope.
 *
 * - `Status` / `Attributes` / `Results` are ALWAYS present.
 * - `Navigation` / `Errors` / `MethodsStack` are **omit-never-null**: the field
 *   is absent from the JSON when not applicable, never serialized as `null`.
 *   The runtime parser MAY treat `null` as a producer bug.
 * - `Results` is ALWAYS an array, even for single-item or empty responses.
 *
 * Generic parameter `TResult` is the per-endpoint payload shape.
 */
export interface Envelope<TResult = unknown> {
  Status: Status;
  Attributes: Attributes;
  Results: TResult[];
  Navigation?: Navigation;
  Errors?: Errors;
  MethodsStack?: MethodsStack;
}

export interface Status {
  IsSuccess: boolean;
  IsFailed: boolean;
  /** HTTP status code. */
  Code: number;
  Message: string;
  /** ISO 8601 timestamp of the response. */
  Timestamp: string;
}

export interface Attributes {
  /** Go backend endpoint that handled the request. */
  RequestedAt?: string;
  /**
   * Downstream URL when the Go backend proxied/delegated the request.
   * Empty string when not delegated.
   */
  RequestDelegatedAt?: string;
  /** Session id for diagnostics linking. */
  SessionId?: string;
  HasAnyErrors: boolean;
  IsSingle: boolean;
  IsMultiple: boolean;
  IsEmpty?: boolean;
  TotalRecords?: number;
  PerPage?: number;
  TotalPages?: number;
  CurrentPage?: number;
}

export interface Navigation {
  /** URL of the next page; null on last page. */
  NextPage: string | null;
  /** URL of the previous page; null on first page. */
  PrevPage: string | null;
  /** Sliding window of nearby page URLs. */
  CloserLinks: string[];
}

export interface Errors {
  /** Primary error message from the Go backend. */
  BackendMessage: string;
  /** Legacy stack lines — prefer `DelegatedRequestServer`. */
  DelegatedServiceErrorStack?: string[];
  Backend?: string[];
  Frontend?: string[];
  /**
   * REQUIRED when `Status.IsFailed === true` AND
   * `Attributes.RequestDelegatedAt` is non-empty.
   */
  DelegatedRequestServer?: DelegatedRequestServer;
}

export interface DelegatedRequestServer {
  DelegatedEndpoint: string;
  Method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  StatusCode: number;
  RequestBody: Record<string, unknown> | null;
  Response: Record<string, unknown> | null;
  StackTrace?: string[];
  AdditionalMessages?: string;
}

export interface MethodsStack {
  Backend: StackFrame[];
  Frontend: StackFrame[];
}

export interface StackFrame {
  Method: string;
  File: string;
  LineNumber: number;
}

// ----------------------------------------------------------------------------
// §4 Reference payload shapes
// ----------------------------------------------------------------------------

/**
 * Unified Node — every item in WorkFlowy is a Node, regardless of ItemType.
 * Subset of fields shown here; the authoritative schema lives in
 * spec/31-app/01-features/01-information-model.md.
 */
export interface Node {
  Id: ItemId;
  /** null only for root nodes. */
  ParentId: ItemId | null;
  Content: string;
  ItemType: ItemType;
  SortOrder: SortOrder;
  OwnerId: OwnerId;
  /** Present only when this node participates in a mirror peer group (ADR-0005). */
  PeerGroupId?: PeerGroupId;
  CreatedAt: string;
  UpdatedAt: string;
}

/** Replay-queue mutation payload per ADR-0010 §C1 / §D4. */
export interface QueuedMutation<TPayload = Record<string, unknown>> {
  MutationId: ClientMutationId;
  ClientId: string;
  /** Client-minted timestamp. **Never** consulted by the LWW guard (ADR-0026). */
  ClientTs: string;
  Op: MutationOp;
  Payload: TPayload;
}

// ----------------------------------------------------------------------------
// §5 Type guards (normative shape — runtime impl MAY add sanity checks)
// ----------------------------------------------------------------------------
//
// These guards are part of the contract. Any runtime copy MUST expose
// functions with these exact names + signatures so consumers can rely on
// structural narrowing. Bodies shown are the minimum required behaviour.

export function isSuccess<T>(env: Envelope<T>): boolean {
  return env.Status.IsSuccess === true;
}

export function isFailed<T>(env: Envelope<T>): boolean {
  return env.Status.IsFailed === true;
}

export function hasErrors<T>(env: Envelope<T>): env is Envelope<T> & { Errors: Errors } {
  return env.Attributes.HasAnyErrors === true && env.Errors !== undefined;
}

export function isPaginated<T>(
  env: Envelope<T>,
): env is Envelope<T> & { Navigation: Navigation } {
  return env.Navigation !== undefined;
}

export function isSingle<T>(env: Envelope<T>): boolean {
  return env.Attributes.IsSingle === true && env.Results.length === 1;
}

export function isEmpty<T>(env: Envelope<T>): boolean {
  return env.Results.length === 0;
}

// ----------------------------------------------------------------------------
// §6 Branded-ID constructors (sole sanctioned cast sites)
// ----------------------------------------------------------------------------
//
// `as ItemId` / `as OwnerId` / `as SortOrder` casts elsewhere in the codebase
// are a CI failure (G-CON-02-TYPES-BRANDED-IDS). All branding flows through
// these parsers, which validate the documented pattern.

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const SORTORDER_RE = /^[0-9A-Za-z]+$/;
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseItemId(raw: string): ItemId {
  if (!ULID_RE.test(raw)) throw new Error(`Invalid ItemId: ${raw}`);
  return raw as ItemId;
}

export function parseOwnerId(raw: string): OwnerId {
  if (!ULID_RE.test(raw)) throw new Error(`Invalid OwnerId: ${raw}`);
  return raw as OwnerId;
}

export function parseSortOrder(raw: string): SortOrder {
  if (!SORTORDER_RE.test(raw)) throw new Error(`Invalid SortOrder: ${raw}`);
  return raw as SortOrder;
}

export function parsePeerGroupId(raw: string): PeerGroupId {
  if (!ULID_RE.test(raw)) throw new Error(`Invalid PeerGroupId: ${raw}`);
  return raw as PeerGroupId;
}

export function parseClientMutationId(raw: string): ClientMutationId {
  if (!UUID_V4_RE.test(raw)) throw new Error(`Invalid ClientMutationId: ${raw}`);
  return raw as ClientMutationId;
}
