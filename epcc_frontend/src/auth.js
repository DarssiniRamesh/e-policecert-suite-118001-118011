import { getAuthToken, apiRequest } from "./api";

// PUBLIC_INTERFACE
/**
 * Returns the user role from the JWT payload if present.
 * Returns: { isAdmin: true/false, user: {...claims}, role: string }
 */
export function getUserRoleInfo() {
  const token = getAuthToken();
  if (!token) return { isAdmin: false, user: null, role: null };
  try {
    // Decode JWT body (payload)
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return { isAdmin: false, user: null, role: null };
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(decodeURIComponent(escape(payloadJson)));
    const role = claims.role || claims["https://schemas.dev/role"] || claims["roles"] || claims["scope"];
    const isAdmin = (typeof role === "string")
      ? ["admin", "officer", "ADMIN", "OFFICER"].includes(role)
      : Array.isArray(role)
        ? role.some((r) => ["admin", "officer"].includes(r.toLowerCase()))
        : false;
    return { isAdmin, user: claims, role: role || null };
  } catch {
    return { isAdmin: false, user: null, role: null };
  }
}

// PUBLIC_INTERFACE
/**
 * Returns a promise of {isAdmin, user, role}, optionally forcibly refetching user info from backend.
 */
export async function fetchUserRoleInfo(forceFetchProfile = false) {
  // Attempt to decode!
  if (!forceFetchProfile) {
    const decoded = getUserRoleInfo();
    if (decoded.role !== null) return decoded;
  }
  // Fallback to backend (should call /profile or /users/me)
  let user = null, isAdmin = false, role = null;
  try {
    const profile = await apiRequest("/users/me", "GET", null, getAuthToken());
    user = profile;
    role = profile.role || profile.roles || null;
    isAdmin =
      (typeof role === "string" && ["admin", "officer"].includes(role.toLowerCase())) ||
      (Array.isArray(role) && role.some((r) => ["admin", "officer"].includes(r.toLowerCase())));
  } catch {
    return { isAdmin: false, user: null, role: null };
  }
  return { isAdmin, user, role };
}
