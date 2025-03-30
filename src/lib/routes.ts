/**
 * Definição centralizada de rotas para toda a aplicação
 */

// Definição das rotas da aplicação
export const APP_ROUTES = {
  // Rotas que requerem autenticação
  PROTECTED: {
    DASHBOARD: "/dashboard",
    ADMIN: "/admin",
    CONFIG: "/config",
    HOME: "/home",
    SETTINGS: "/settings",
    TICKETS: "/home/ticket",
    PAYMENTS: "/admin/payment",
    USERS: "/admin/users",
  },
  
  // Rotas de autenticação (usuários logados não devem acessar)
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    PROFILE: "/auth/profile",
    PASSWORD: "/auth/password",
  },
  
  // Rotas para redirecionamento baseadas em role
  REDIRECT: {
    ADMIN: "/admin",
    USER: "/home",
    LOGIN: "/auth/login",
    UNAUTHORIZED: "/unauthorized",
  },
};

// Definição dos endpoints da API
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    CHANGE_PASSWORD: "/api/auth/change-password",
    VALIDATE_TOKEN: "/api/auth/validate-token",
    USERS: "/api/auth/userinfo",
    DEACTIVATE_USER: (id: string) => `/api/auth/users/${id}/deactivate`,
  },
  PROFILE: {
    GET: "/api/home/profile", 
    REGISTER: "/api/home/admin/register-info",
  },
  TICKETS: {
    NEW: "/api/tickets/new",
    LIST: "/api/tickets/list",
    HIDE: (id: string) => `/api/tickets/${id}/hide`,
    PROOF_IMAGE: (filename: string) => `/api/tickets/proof-image/${encodeURIComponent(filename)}`,
    TRANSFER_REQUEST: "/api/tickets/transfer/request",
    CATEGORIES: {
      LIST: "/api/tickets/categories/list",
    },
    SERVICES: {
      LIST: "/api/tickets/services/list",
    },
    DISCOUNTS: {
      LIST: "/api/tickets/discounts/list",
      BASE: "/api/tickets/discounts",
      SINGLE: (id: string) => `/api/tickets/discounts/${id}`,
      DELETE: (id: string) => `/api/tickets/discounts/${id}/delete`,
    },
  },
  ADMIN: {
    DASHBOARD: "/api/home/admin/dashboard-data",
    TICKETS: {
      COUNT: "/api/home/admin/ticketscount",
      OVERDUE: "/api/home/admin/overdue-tickets",
      TODAY: "/api/home/admin/today-tickets",
      UPCOMING: "/api/home/admin/upcoming-tickets",
    },
    PAYMENTS: {
      LIST: "/api/home/admin/payments/list",
      CONFIRM: "/api/home/admin/payments/confirm",
    },
  },
  USER: {
    DASHBOARD: "/api/home/user-dashboard",
    DUE_TICKETS: "/api/home/dueTickets",
    TODAY_TICKETS: "/api/home/todayTickets",
  },
  SERVICES: {
    NEW: "/api/services/new",
    LIST: "/api/services/list",
    UPDATE: (id: string) => `/api/services/${id}`,
    DELETE: (id: string) => `/api/services/${id}/delete`,
  },
};

// Para manter compatibilidade, mantemos o objeto ROUTES, mas agora é uma composição
export const ROUTES = {
  ...APP_ROUTES,
  API: API_ROUTES
};

/**
 * Verifica se uma rota é protegida (exige autenticação)
 */
export function isProtectedRoute(pathname: string): boolean {
  return Object.values(APP_ROUTES.PROTECTED).some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Verifica se uma rota é de autenticação (login, registro)
 */
export function isAuthRoute(pathname: string): boolean {
  return Object.values(APP_ROUTES.AUTH).some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Obtém a rota de redirecionamento baseada na role do usuário
 */
export function getRedirectByRole(role?: string): string {
  return role === "admin" ? APP_ROUTES.REDIRECT.ADMIN : APP_ROUTES.REDIRECT.USER;
}
