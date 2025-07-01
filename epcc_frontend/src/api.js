const API_BASE = "https://vscode-internal-74-beta.beta01.cloud.kavia.ai:3001";

// PUBLIC_INTERFACE
export async function apiRequest(path, method = "GET", data = null, token = null, files = null) {
  const url = API_BASE + path;
  let headers = {};
  let body;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (files) {
    body = files;
  } else if (data) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  if (res.headers.get("content-type")?.includes("application/json")) {
    const result = await res.json();
    if (!res.ok) throw (result || { error: res.statusText });
    return result;
  } else {
    if (!res.ok) throw new Error(res.statusText);
    return await res.text();
  }
}

// PUBLIC_INTERFACE
export function saveAuthToken(token) {
  localStorage.setItem("epcc_token", token);
}

// PUBLIC_INTERFACE
export function getAuthToken() {
  return localStorage.getItem("epcc_token");
}

// PUBLIC_INTERFACE
export function removeAuthToken() {
  localStorage.removeItem("epcc_token");
}
