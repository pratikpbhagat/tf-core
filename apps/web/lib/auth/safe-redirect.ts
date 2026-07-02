// Guards against open-redirect: only accept same-origin relative paths
// (must start with a single "/", never "//" which browsers treat as
// protocol-relative to another host).
export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
