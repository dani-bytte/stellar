// Importar de routes.ts ao invés de duplicar
import { API_ROUTES } from "./routes";

// Exportar para manter compatibilidade
export const API_ENDPOINTS = API_ROUTES;

export const LOCAL_STORAGE_KEYS = {
  TOKEN: "token",
  ROLE: "role",
  HAS_PROFILE: "hasProfile",
  IS_TEMPORARY_PASSWORD: "isTemporaryPassword",
  USER_PROFILE: "userProfile",
};

// Configuração para JWT
export const JWT_CONFIG = {
  SECRET: "stellar_default_secret_key",
  EXPIRATION: "24h",
  COOKIE_NAME: "user-token"
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
