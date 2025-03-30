import { LOCAL_STORAGE_KEYS, JWT_CONFIG } from "@/lib/constants";
import { fetchWithErrorHandling } from "./errorHandling";

/**
 * Função utilitária para fazer requisições autenticadas
 * com tratamento de erro padrão
 */
export async function authenticatedFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  
  // Definindo cabeçalhos com tipagem adequada
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    Authorization: `Bearer ${token}`,
  };

  // Adicionando Content-Type para requisições com body JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  return fetchWithErrorHandling<T>(url, {
    ...options,
    headers
  });
}

/**
 * Define o token de autenticação no localStorage e em cookies
 */
export function setAuthToken(token: string): void {
  if (!token) return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
  
  // Define também em um cookie para acesso no lado do servidor se necessário
  // Use JWT_CONFIG.COOKIE_NAME para garantir consistência com o middleware
  document.cookie = `${JWT_CONFIG.COOKIE_NAME}=${token}; path=/; max-age=${60*60*24}`;
}

/**
 * Remove o token de autenticação
 */
export function clearAuthToken(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.HAS_PROFILE);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.IS_TEMPORARY_PASSWORD);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
  
  // Remove também do cookie - usar o mesmo nome definido em JWT_CONFIG
  document.cookie = `${JWT_CONFIG.COOKIE_NAME}=; path=/; max-age=0`;
}
