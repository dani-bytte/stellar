/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata um valor monetário em real brasileiro (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data ISO em formato legível (dd/mm/aaaa)
 */
export function formatDate(isoDate: string | Date): string {
  if (!isoDate) return '';
  
  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
  
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Formata uma data ISO com hora em formato legível (dd/mm/aaaa às hh:mm)
 */
export function formatDateTime(isoDate: string | Date): string {
  if (!isoDate) return '';
  
  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Extrai componentes de data de uma string ISO
 */
export function extractDateComponents(isoDate: string): {
  day: number;
  month: number;
  year: number;
} {
  const date = new Date(isoDate);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

/**
 * Formata o nome para ter inicial maiúscula em cada palavra
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Obtém o status formatado em português e o tipo para uso com StatusBadge
 */
export function getStatusInfo(status: string): { 
  text: string; 
  type: "success" | "warning" | "error" | "info" | "default";
} {
  const statusMap: Record<string, { text: string; type: "success" | "warning" | "error" | "info" | "default" }> = {
    finalizado: { text: "Finalizado", type: "success" },
    andamento: { text: "Em Andamento", type: "warning" },
    pendente: { text: "Pendente", type: "warning" },
    cancelado: { text: "Cancelado", type: "error" },
    completo: { text: "Completo", type: "success" },
    atrasado: { text: "Atrasado", type: "error" },
  };
  
  return statusMap[status] || { text: status, type: "default" };
}
