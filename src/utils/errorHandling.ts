import { toast } from "sonner";

type ErrorResponse = {
  message?: string;
  error?: string;
  statusCode?: number;
};

/**
 * Extrai uma mensagem de erro legível de várias possíveis fontes de erro
 */
export const getErrorMessage = (error: unknown): string => {
  // Se for um Error padrão do JavaScript
  if (error instanceof Error) {
    return error.message;
  }
  
  // Se for um objeto que parece ser uma resposta de API
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as ErrorResponse;
    return errorObj.message || errorObj.error || 'Ocorreu um erro inesperado';
  }
  
  // Para string
  if (typeof error === 'string') {
    return error;
  }
  
  // Caso padrão
  return 'Ocorreu um erro inesperado';
};

/**
 * Função helper para tratar erros de API e exibir mensagens apropriadas
 */
export const handleApiError = (error: unknown): string => {
  const message = getErrorMessage(error);
  toast.error(message);
  console.error('API Error:', error);
  return message;
};

/**
 * Extrai dados da resposta HTTP verificando o status e tratando erros
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ErrorResponse = {};
    try {
      errorData = await response.json();
    } catch {
      // Se não conseguir processar o JSON, usa os dados de status
      errorData = { 
        statusCode: response.status,
        message: response.statusText 
      };
    }

    const message = errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`;
    
    // Tratamento especial para tipos comuns de erro
    if (response.status === 401) {
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    } else if (response.status === 403) {
      throw new Error('Você não tem permissão para realizar esta operação.');
    } else if (response.status === 404) {
      throw new Error('Recurso não encontrado.');
    } else if (response.status >= 500) {
      throw new Error('Erro no servidor. Por favor, tente novamente mais tarde.');
    }
    
    throw new Error(message);
  }

  return await response.json() as T;
}

/**
 * Função utilitária para fazer requisições com tratamento de erro padrão
 */
export async function fetchWithErrorHandling<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}