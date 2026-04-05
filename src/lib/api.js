// Get the base URL for backend API - reads from localStorage for network mode
export function getApiBase() {
  const serverMode = localStorage.getItem("serverMode");
  const serverIp = localStorage.getItem("serverIp");
  if (serverMode === "client" && serverIp) {
    return `http://${serverIp}:8000`;
  }
  return "http://localhost:8000";
}

async function apiRequest(endpoint, options = {}) {
  const url = `${getApiBase()}${endpoint}`;
  const token = localStorage.getItem("authToken");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token && options.requiresAuth) {
    const auth = btoa(token);
    headers["Authorization"] = `Basic ${auth}`;
  }
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Request failed");
  }
  
  return response.json();
}

export const api = {
  post: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),
  
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: "GET", ...options }),
  
  put: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { method: "PUT", body: JSON.stringify(data), ...options }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { method: "DELETE", ...options }),
  
  postFile: async (endpoint, formData, auth) => {
    const url = `${getApiBase()}${endpoint}`;
    const headers = {};
    
    if (auth) {
      headers["Authorization"] = `Basic ${btoa(auth)}`;
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || "Request failed");
    }
    
    return response.json();
  },
};
