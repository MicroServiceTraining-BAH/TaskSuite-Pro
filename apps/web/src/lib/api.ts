import { auth } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_URL not set, using default: http://localhost:3001"
  );
}

function getCompanyId(): string {
  const user = auth.getUser();
  if (user && "companyId" in user) {
    return user.companyId;
  }
  // Fallback for development
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("companyId");
    if (stored) return stored;
  }
  return "";
}

async function apiRequest<T>(
  endpoint: string,
  options: any = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const token = auth.getToken();
  const companyId = getCompanyId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Fallback for development/testing without auth
  if (companyId && !token) {
    headers["X-Company-Id"] = companyId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Auth API calls
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }));
      throw new Error(error.message || "Login failed");
    }
    return response.json();
  } catch (error: any) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Login failed");
  }
};

export const register = async (
  email: string,
  password: string,
  name: string,
  companyId: string,
  role: string = "user"
) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, companyId, role }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(error.message || "Registration failed");
  }
  return response.json();
};

export const clientLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/client/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error("Login error:", errorMessage, errorData);
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error("Client login error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Login failed");
  }
};

// Users API functions
export async function getUsers() {
  return apiRequest("/users");
}

export async function createUser(data: any) {
  // Ensure companyId is never sent - it's set from JWT on backend
  const { companyId, ...cleanData } = data;
  
  // Double-check: explicitly exclude companyId
  if ('companyId' in cleanData) {
    delete cleanData.companyId;
  }
  
  // Log the final payload to verify
  const finalPayload = {
    email: cleanData.email,
    name: cleanData.name,
    password: cleanData.password,
    role: cleanData.role,
  };
  
  console.log("createUser API call - final payload:", JSON.stringify(finalPayload, null, 2));
  console.log("createUser API call - has companyId?", 'companyId' in finalPayload);
  
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(finalPayload),
  });
}

export async function updateUser(id: string, data: any) {
  return apiRequest(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return apiRequest(`/users/${id}`, {
    method: "DELETE",
  });
}

// Client API functions
export async function getClients() {
  return apiRequest("/clients");
}

export async function createClient(data: any) {
  return apiRequest("/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: string, data: any) {
  return apiRequest(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string) {
  return apiRequest(`/clients/${id}`, {
    method: "DELETE",
  });
}

// Estimates API functions
export async function getEstimates() {
  return apiRequest("/estimates");
}

export async function createEstimate(data: any) {
  return apiRequest("/estimates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEstimate(id: string, data: any) {
  return apiRequest(`/estimates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteEstimate(id: string) {
  return apiRequest(`/estimates/${id}`, {
    method: "DELETE",
  });
}

export async function convertEstimateToJob(id: string) {
  return apiRequest(`/estimates/${id}/convert-to-job`, {
    method: "POST",
  });
}

// Jobs API functions
export async function getJobs() {
  return apiRequest("/jobs");
}

export async function createJob(data: any) {
  return apiRequest("/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateJob(id: string, data: any) {
  return apiRequest(`/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Appointments API functions
export async function getAppointments() {
  return apiRequest("/appointments");
}

export async function createAppointment(data: any) {
  return apiRequest("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAppointment(id: string, data: any) {
  return apiRequest(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAppointment(id: string) {
  return apiRequest(`/appointments/${id}`, {
    method: "DELETE",
  });
}

// Invoices API functions
export async function getInvoices() {
  return apiRequest("/invoices");
}

export async function createInvoice(data: any) {
  return apiRequest("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function markInvoicePaid(id: string) {
  return apiRequest(`/invoices/${id}/mark-paid`, {
    method: "POST",
  });
}

export async function deleteInvoice(id: string) {
  return apiRequest(`/invoices/${id}`, { method: "DELETE" });
}

// Client Portal API functions
export async function getClientEstimates() {
  return apiRequest("/client/estimates");
}

export async function getClientJobs() {
  return apiRequest("/client/jobs");
}

export async function getClientInvoices() {
  return apiRequest("/client/invoices");
}

export async function getClientAppointments() {
  return apiRequest("/client/appointments");
}
