import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { JWT_CONFIG, LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Define o token em localStorage e cookie para consistência
 * entre cliente e middleware
 */
export function setAuthToken(token: string) {
  // Armazena no localStorage para acesso fácil no cliente
  localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
  
  // Configuração simplificada de cookie para evitar problemas
  // Não use HttpOnly para que o JavaScript possa ler o cookie
  document.cookie = `${JWT_CONFIG.COOKIE_NAME}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

/**
 * Limpa o token de autenticação de todos os locais
 */
export function clearAuthToken() {
  // Limpa todos os itens do localStorage relacionados à autenticação
  Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  
  // Remove o cookie definindo uma data de expiração no passado
  document.cookie = `${JWT_CONFIG.COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}

/**
 * Função para realizar logout no cliente e no servidor
 */
export async function logout() {
  try {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    
    if (token) {
      // Notifica o servidor para invalidar o token
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error("Erro ao fazer logout no servidor:", error);
  } finally {
    // Sempre limpa os tokens locais
    clearAuthToken();
    
    // Redireciona para login
    window.location.href = ROUTES.REDIRECT.LOGIN;
  }
}

/**
 * Verifica se o token é válido consultando a API
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    // Usar o endpoint específico da API para validar o token
    const response = await fetch(API_ENDPOINTS.AUTH.VALIDATE_TOKEN, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.warn("Token validation failed:", response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

export function handleApiResponse(
  response: Response, 
  redirectOnUnauthorized: boolean = true
): Response {
  // Verifica se a resposta é 401 Unauthorized
  if (response.status === 401) {
    console.warn("Token de acesso expirado ou inválido");
    
    clearAuthToken();
    
    if (redirectOnUnauthorized) {
      // Notifica o usuário
      toast.error("Sua sessão expirou", {
        description: "Redirecionando para a página de login..."
      });
      
      // Redirecionamento simples e direto
      setTimeout(() => {
        window.location.href = ROUTES.REDIRECT.LOGIN;
      }, 1000);
    }
  }
  
  return response;
}

export async function authenticatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  
  if (!token) {
    toast.error("Sessão não encontrada", {
      description: "Redirecionando para a página de login..."
    });
    
    // Redirecionamento simplificado para login
    setTimeout(() => {
      window.location.href = ROUTES.REDIRECT.LOGIN;
    }, 1000);
    
    // Rejeitamos a Promise para interromper o fluxo
    throw new Error("Token não encontrado");
  }
  
  // Prepara as opções com o token de autenticação
  const fetchOptions = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await fetch(url, fetchOptions);
  
  // Verifica se a resposta é válida
  return handleApiResponse(response);
}
