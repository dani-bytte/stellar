export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    CHANGE_PASSWORD: "/api/auth/change-password",
    USERS: "/api/auth/userinfo",
    DEACTIVATE_USER: (id: string) => `/api/auth/users/${id}/deactivate`,
  },
  PROFILE: "/api/home/profile",
  TICKETS: {
    NEW: "/api/tickets/new",
    LIST: "/api/tickets",
    PROOF_IMAGE: (filename: string) =>
      `/api/tickets/proof-image/${encodeURIComponent(filename)}`,
    TRANSFER_REQUEST: "/api/tickets/transfer/request",
    SERVICES: "/api/tickets/services/list",
    DISCOUNTS: {
      LIST: "/api/tickets/discounts/list",
      BASE: "/api/tickets/discounts",
      SINGLE: (id: string) => `/api/tickets/discounts/${id}`,
      DELETE: (id: string) => `/api/tickets/discounts/${id}/delete`, // Corrigido "delet" para "delete"
    },
  },
  ADMIN: {
    DASHBOARD: "/api/home/admin/dashboard-data",
    TICKET_COUNT: "/api/home/admin/ticketscount",
    OVERDUE_TICKETS: "/api/home/admin/overdue-tickets",
    TODAY_TICKETS: "/api/home/admin/today-tickets",
    UPCOMING_TICKETS: "/api/home/admin/upcoming-tickets",
    PAYMENTS: {
      CONFIRM: "/api/home/admin/payments/confirm",
    },
  },
  USER: {
    DASHBOARD: "/api/home/user-dashboard",
    DUE_TICKETS: "/api/home/dueTickets",
    TODAY_TICKETS: "/api/home/todayTickets",
  },
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: "token",
  ROLE: "role",
  HAS_PROFILE: "hasProfile",
  IS_TEMPORARY_PASSWORD: "isTemporaryPassword",
  USER_PROFILE: "userProfile",
};

export const CHART_COLORS = {
  BLUE: "#36A2EB",
  RED: "#FF6384",
  YELLOW: "#FFCE56",
  GREEN: "#4BC0C0",
  PURPLE: "#9966FF",
};

export const PAGE_SIZES = [10, 20, 30, 50];

export const THEME = {
  BREAKPOINTS: {
    SM: "640px",
    MD: "768px",
    LG: "1024px",
    XL: "1280px",
    "2XL": "1536px",
  },
  ANIMATION: {
    DURATION: {
      FAST: "150ms",
      NORMAL: "300ms",
      SLOW: "500ms",
    },
  },
};

export const DATE_FORMATS = {
  SHORT: "DD/MM/YYYY",
  LONG: "DD [de] MMMM [de] YYYY",
  TIME: "HH:mm",
  DATETIME: "DD/MM/YYYY HH:mm",
};
