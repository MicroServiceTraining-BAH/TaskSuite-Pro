"use client";

export interface OnboardingData {
  companyName: string;
  industry: string;
  teamSize: string;
  accountingMethod: "cash" | "accrual";
  defaultCurrency: string;
  timezone: string;
  invoicePrefix: string;
  enableReminders: boolean;
  connectBankLater: boolean;
}

const ONBOARDING_DATA_KEY = "onboarding_data";
const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

const defaultData: OnboardingData = {
  companyName: "",
  industry: "",
  teamSize: "",
  accountingMethod: "cash",
  defaultCurrency: "USD",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  invoicePrefix: "INV",
  enableReminders: true,
  connectBankLater: true,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getSavedOnboardingData(): OnboardingData {
  if (!isBrowser()) return defaultData;
  const stored = localStorage.getItem(ONBOARDING_DATA_KEY);
  if (!stored) return defaultData;
  try {
    const parsed = JSON.parse(stored);
    return { ...defaultData, ...parsed };
  } catch {
    return defaultData;
  }
}

export function saveOnboardingData(data: OnboardingData) {
  if (!isBrowser()) return;
  localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
}

export function isOnboardingComplete(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
}

export function markOnboardingComplete(data?: OnboardingData) {
  if (!isBrowser()) return;
  if (data) {
    saveOnboardingData(data);
  }
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
}

export function resetOnboarding() {
  if (!isBrowser()) return;
  localStorage.removeItem(ONBOARDING_DATA_KEY);
  localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
}

export function initializeOnboardingData(partial: Partial<OnboardingData>) {
  if (!isBrowser()) return;
  const data = { ...defaultData, ...partial };
  saveOnboardingData(data);
}

