// Simple i18n implementation for English/Spanish
export type Language = "en" | "es";

let currentLanguage: Language = "en";
let languageListeners: Array<(lang: Language) => void> = [];

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.clients": "Clients",
    "nav.estimates": "Estimates",
    "nav.jobs": "Jobs",
    "nav.schedule": "Schedule",
    "nav.invoices": "Invoices",
    "nav.expenses": "Expenses",
    "nav.reports": "Reports",
    "nav.templates": "Templates",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    
    // Common
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.view": "View",
    
    // Jobs
    "jobs.title": "Jobs",
    "jobs.add": "Add Job",
    "jobs.status.pending": "Pending",
    "jobs.status.in_progress": "In Progress",
    "jobs.status.completed": "Completed",
    "jobs.status.cancelled": "Cancelled",
    "jobs.type.cleaning": "Cleaning",
    "jobs.type.flooring": "Flooring",
    
    // Estimates
    "estimates.title": "Estimates",
    "estimates.add": "Add Estimate",
    "estimates.service.cleaning": "Cleaning Service",
    "estimates.service.flooring": "Flooring Installation",
    
    // Clients
    "clients.title": "Clients",
    "clients.add": "Add Client",
    
    // Invoices
    "invoices.title": "Invoices",
    "invoices.add": "Add Invoice",
    "invoices.markPaid": "Mark Paid",
    
    // Dashboard
    "dashboard.totalClients": "Total Clients",
    "dashboard.activeJobs": "Active Jobs",
    "dashboard.pendingEstimates": "Pending Estimates",
    "dashboard.unpaidInvoices": "Unpaid Invoices",
  },
  es: {
    // Navigation
    "nav.dashboard": "Panel",
    "nav.clients": "Clientes",
    "nav.estimates": "Estimaciones",
    "nav.jobs": "Trabajos",
    "nav.schedule": "Horario",
    "nav.invoices": "Facturas",
    "nav.expenses": "Gastos",
    "nav.reports": "Informes",
    "nav.templates": "Plantillas",
    "nav.settings": "Configuración",
    "nav.logout": "Cerrar sesión",
    
    // Common
    "common.add": "Agregar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.search": "Buscar",
    "common.loading": "Cargando...",
    "common.view": "Ver",
    
    // Jobs
    "jobs.title": "Trabajos",
    "jobs.add": "Agregar Trabajo",
    "jobs.status.pending": "Pendiente",
    "jobs.status.in_progress": "En Progreso",
    "jobs.status.completed": "Completado",
    "jobs.status.cancelled": "Cancelado",
    "jobs.type.cleaning": "Limpieza",
    "jobs.type.flooring": "Pisos",
    
    // Estimates
    "estimates.title": "Estimaciones",
    "estimates.add": "Agregar Estimación",
    "estimates.service.cleaning": "Servicio de Limpieza",
    "estimates.service.flooring": "Instalación de Pisos",
    
    // Clients
    "clients.title": "Clientes",
    "clients.add": "Agregar Cliente",
    
    // Invoices
    "invoices.title": "Facturas",
    "invoices.add": "Agregar Factura",
    "invoices.markPaid": "Marcar como Pagado",
    
    // Dashboard
    "dashboard.totalClients": "Total de Clientes",
    "dashboard.activeJobs": "Trabajos Activos",
    "dashboard.pendingEstimates": "Estimaciones Pendientes",
    "dashboard.unpaidInvoices": "Facturas sin Pagar",
  },
};

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang);
    // Notify all listeners
    languageListeners.forEach(listener => listener(lang));
  }
}

export function subscribeToLanguageChanges(listener: (lang: Language) => void) {
  languageListeners.push(listener);
  return () => {
    languageListeners = languageListeners.filter(l => l !== listener);
  };
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function getLanguage(): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "en" || saved === "es")) {
      return saved;
    }
  }
  // Detect browser language
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "es") return "es";
  }
  return "en";
}

export function t(key: string, lang?: Language): string {
  const langToUse = lang || currentLanguage;
  return translations[langToUse]?.[key] || translations.en[key] || key;
}

// Initialize language on load
if (typeof window !== "undefined") {
  currentLanguage = getLanguage();
}

