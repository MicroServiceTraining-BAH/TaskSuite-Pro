import { auth } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_URL not set, using default: http://localhost:3001"
  );
}

// Helper to check if API is available
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api`, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
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

// Helper function to remove companyId from data objects
// companyId is set from JWT on the backend, not from request body
function cleanData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const cleaned = { ...data };
  delete cleaned.companyId;
  
  // Also clean nested objects/arrays
  for (const key in cleaned) {
    if (Array.isArray(cleaned[key])) {
      cleaned[key] = cleaned[key].map((item: any) => cleanData(item));
    } else if (cleaned[key] && typeof cleaned[key] === 'object') {
      cleaned[key] = cleanData(cleaned[key]);
    }
  }
  
  return cleaned;
}

// ---------------------------------------------------------------------------
// Simple in-memory GET cache (stale-while-revalidate, 30s TTL)
// ---------------------------------------------------------------------------
interface CacheEntry { data: unknown; ts: number }
const _cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000; // 30 seconds

function getCached<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setCached(key: string, data: unknown) {
  _cache.set(key, { data, ts: Date.now() });
}

/** Invalidate all cache entries whose key starts with any of the given prefixes. */
export function invalidateCache(...prefixes: string[]) {
  for (const key of _cache.keys()) {
    if (prefixes.some((p) => key.startsWith(p))) _cache.delete(key);
  }
}
// ---------------------------------------------------------------------------

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

  // Return cached data immediately for GET requests, then revalidate in background
  const isGet = !options.method || options.method === "GET";
  if (isGet) {
    const cached = getCached<T>(url);
    if (cached !== null) return cached;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error: any) {
    // Network error or CORS issue
    const errorMessage = error.message || "Network error";
    console.error(`Failed to fetch ${url}:`, errorMessage);
    
    // Provide helpful error message
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      throw new Error(
        `Unable to connect to API server at ${API_URL}. ` +
        `Please ensure the API server is running. ` +
        `If using a different URL, set NEXT_PUBLIC_API_URL environment variable.`
      );
    }
    
    throw new Error(`API request failed: ${errorMessage}`);
  }

  if (!response.ok) {
    // Handle 401 Unauthorized - clear auth and redirect to login
    if (response.status === 401) {
      auth.logout();
      // Only redirect if we're in the browser and not already on a login page
      if (typeof window !== "undefined") {
        const isLoginPage = window.location.pathname.startsWith("/login") || 
                           window.location.pathname.startsWith("/client/login");
        if (!isLoginPage) {
          const isClientRoute = window.location.pathname.startsWith("/client");
          window.location.href = isClientRoute ? "/client/login" : "/login";
        }
      }
    }
    
    // Try to parse error message from response
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, the response body might be empty or invalid
          // Use the default error message
        }
      } else {
        try {
          const errorText = await response.text();
          if (errorText && errorText.trim()) {
            errorMessage = errorText;
          }
        } catch {
          // If text parsing fails, use the default error message
        }
      }
    } catch (parseError) {
      // If we can't parse the error, use the default message
      console.error("Failed to parse error response:", parseError);
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (isGet) {
    setCached(url, data);
  } else {
    // After any successful mutation, bust cache for that resource so the
    // next GET for the same collection returns fresh data.
    const resourceBase = `${API_URL}/${endpoint.split("/")[1]}`;
    invalidateCache(resourceBase);
  }
  return data as T;
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
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
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

export const getProfile = async () => {
  return apiRequest("/auth/profile");
};

export const signup = async (
  email: string,
  password: string,
  companyName: string,
  name?: string
) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, companyName, name }),
  });
  if (!response.ok) {
    let errorMessage = "Signup failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
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
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateUser(id: string, data: any) {
  return apiRequest(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
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
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateClient(id: string, data: any) {
  return apiRequest(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
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
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateEstimate(id: string, data: any) {
  return apiRequest(`/estimates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
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

// Public estimate API functions (no auth required)
export async function getPublicEstimate(token: string) {
  const response = await fetch(`${API_URL}/public/estimates/${token}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function approvePublicEstimate(token: string) {
  const response = await fetch(`${API_URL}/public/estimates/${token}/approve`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function rejectPublicEstimate(token: string) {
  const response = await fetch(`${API_URL}/public/estimates/${token}/reject`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Jobs API functions
export async function getJobs() {
  return apiRequest("/jobs");
}

export async function createJob(data: any) {
  return apiRequest("/jobs", {
    method: "POST",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateJob(id: string, data: any) {
  return apiRequest(`/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
  });
}

// Job Photos
export async function uploadJobPhoto(jobId: string, file: File, photoType: string = "general", description?: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('photoType', photoType);
  if (description) {
    formData.append('description', description);
  }

  const token = auth.getToken();
  const url = `${API_URL}/jobs/${jobId}/photos`;
  
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to upload photo" }));
    throw new Error(error.message || "Failed to upload photo");
  }

  return response.json();
}

export async function getJobPhotos(jobId: string) {
  return apiRequest(`/jobs/${jobId}/photos`);
}

export async function deleteJobPhoto(jobId: string, photoId: string) {
  return apiRequest(`/jobs/${jobId}/photos/${photoId}`, {
    method: "DELETE",
  });
}

// Cleaning Checklist
export async function upsertCleaningChecklistItem(jobId: string, room: string, task: string, completed: boolean, notes?: string) {
  return apiRequest(`/jobs/${jobId}/cleaning-checklist`, {
    method: "POST",
    body: JSON.stringify({ room, task, completed, notes }),
  });
}

export async function deleteCleaningChecklistItem(jobId: string, itemId: string) {
  return apiRequest(`/jobs/${jobId}/cleaning-checklist/${itemId}`, {
    method: "DELETE",
  });
}

// Flooring Materials
export async function addFlooringMaterial(jobId: string, data: any) {
  return apiRequest(`/jobs/${jobId}/flooring-materials`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFlooringMaterial(jobId: string, materialId: string, data: any) {
  return apiRequest(`/jobs/${jobId}/flooring-materials/${materialId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFlooringMaterial(jobId: string, materialId: string) {
  return apiRequest(`/jobs/${jobId}/flooring-materials/${materialId}`, {
    method: "DELETE",
  });
}

// Appointments API functions
export async function getAppointments() {
  return apiRequest("/appointments");
}

export async function createAppointment(data: any) {
  return apiRequest("/appointments", {
    method: "POST",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateAppointment(id: string, data: any) {
  return apiRequest(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function deleteAppointment(id: string) {
  return apiRequest(`/appointments/${id}`, {
    method: "DELETE",
  });
}

// Estimate Templates API functions
export async function getEstimateTemplates() {
  return apiRequest("/estimate-templates");
}

export async function createEstimateTemplate(data: any) {
  return apiRequest("/estimate-templates", {
    method: "POST",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateEstimateTemplate(id: string, data: any) {
  return apiRequest(`/estimate-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function deleteEstimateTemplate(id: string) {
  return apiRequest(`/estimate-templates/${id}`, {
    method: "DELETE",
  });
}

// Invoice Templates API functions
export async function getInvoiceTemplates() {
  return apiRequest("/invoice-templates");
}

export async function createInvoiceTemplate(data: any) {
  return apiRequest("/invoice-templates", {
    method: "POST",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateInvoiceTemplate(id: string, data: any) {
  return apiRequest(`/invoice-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
  });
}

export async function deleteInvoiceTemplate(id: string) {
  return apiRequest(`/invoice-templates/${id}`, {
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
    body: JSON.stringify(cleanData(data)),
  });
}

export async function updateInvoice(id: string, data: any) {
  return apiRequest(`/invoices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData(data)),
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

// Accounts (Chart of Accounts) API functions
export async function getAccounts(type?: string) {
  const url = type ? `/accounts?type=${type}` : "/accounts";
  return apiRequest(url);
}

export async function createAccount(data: any) {
  return apiRequest("/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAccount(id: string, data: any) {
  return apiRequest(`/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(id: string) {
  return apiRequest(`/accounts/${id}`, {
    method: "DELETE",
  });
}

// Expenses API functions
export async function getExpenses(startDate?: string, endDate?: string, accountId?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (accountId) params.append("accountId", accountId);
  const query = params.toString();
  return apiRequest(`/expenses${query ? `?${query}` : ""}`);
}

export async function getExpensesSummary(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const query = params.toString();
  return apiRequest(`/expenses/summary${query ? `?${query}` : ""}`);
}

export async function createExpense(data: any) {
  return apiRequest("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateExpense(id: string, data: any) {
  return apiRequest(`/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id: string) {
  return apiRequest(`/expenses/${id}`, {
    method: "DELETE",
  });
}

// Bills API functions
export async function getBills(status?: string) {
  const url = status ? `/bills?status=${status}` : "/bills";
  return apiRequest(url);
}

export async function createBill(data: any) {
  return apiRequest("/bills", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBill(id: string, data: any) {
  return apiRequest(`/bills/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function markBillPaid(id: string, paymentMethod?: string) {
  return apiRequest(`/bills/${id}/mark-paid`, {
    method: "POST",
    body: JSON.stringify({ paymentMethod }),
  });
}

export async function deleteBill(id: string) {
  return apiRequest(`/bills/${id}`, {
    method: "DELETE",
  });
}

// Time Entries API functions
export async function getTimeEntries(jobId?: string, userId?: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (jobId) params.append("jobId", jobId);
  if (userId) params.append("userId", userId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const query = params.toString();
  return apiRequest(`/time-entries${query ? `?${query}` : ""}`);
}

export async function getTimeEntrySummary(jobId: string) {
  return apiRequest(`/time-entries/summary/job/${jobId}`);
}

export async function createTimeEntry(data: any) {
  return apiRequest("/time-entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTimeEntry(id: string, data: any) {
  return apiRequest(`/time-entries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTimeEntry(id: string) {
  return apiRequest(`/time-entries/${id}`, {
    method: "DELETE",
  });
}

// Tax Rates API functions
export async function getTaxRates(isActive?: boolean) {
  const url = isActive !== undefined ? `/tax-rates?isActive=${isActive}` : "/tax-rates";
  return apiRequest(url);
}

export async function getDefaultTaxRate() {
  return apiRequest("/tax-rates/default");
}

export async function createTaxRate(data: any) {
  return apiRequest("/tax-rates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTaxRate(id: string, data: any) {
  return apiRequest(`/tax-rates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTaxRate(id: string) {
  return apiRequest(`/tax-rates/${id}`, {
    method: "DELETE",
  });
}

// Reports API functions
export async function getProfitLoss(startDate: string, endDate: string) {
  return apiRequest(`/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`);
}

export async function getCashFlow(startDate: string, endDate: string) {
  return apiRequest(`/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`);
}

export async function getBalanceSheet(asOfDate: string) {
  return apiRequest(`/reports/balance-sheet?asOfDate=${asOfDate}`);
}

export async function getReportsSummary() {
  return apiRequest("/reports/summary");
}

// Service Types API functions
export async function getServiceTypes() {
  return apiRequest("/service-types");
}

export async function createServiceType(data: any) {
  return apiRequest("/service-types", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateServiceType(id: string, data: any) {
  return apiRequest(`/service-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteServiceType(id: string) {
  return apiRequest(`/service-types/${id}`, {
    method: "DELETE",
  });
}

// Invoice Line Items API functions
export async function getInvoiceLineItems(invoiceId: string) {
  return apiRequest(`/invoices/${invoiceId}/line-items`);
}

export async function createInvoiceLineItem(invoiceId: string, data: any) {
  return apiRequest(`/invoices/${invoiceId}/line-items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInvoiceLineItem(invoiceId: string, id: string, data: any) {
  return apiRequest(`/invoices/${invoiceId}/line-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteInvoiceLineItem(invoiceId: string, id: string) {
  return apiRequest(`/invoices/${invoiceId}/line-items/${id}`, {
    method: "DELETE",
  });
}

// Payment API functions
export async function createPaymentIntent(invoiceId: string, amount?: number) {
  return apiRequest(`/payments/create-intent/${invoiceId}`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function confirmPayment(paymentIntentId: string) {
  return apiRequest(`/payments/confirm/${paymentIntentId}`, {
    method: "POST",
  });
}

export async function getPaymentStatus(paymentId: string) {
  return apiRequest(`/payments/status/${paymentId}`);
}

export async function getPayments(invoiceId?: string) {
  const url = invoiceId ? `/payments?invoiceId=${invoiceId}` : "/payments";
  return apiRequest(url);
}
