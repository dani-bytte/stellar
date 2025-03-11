import { format, parse, isValid, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o formato desejado
 */
export function formatDateString(
  date: Date | string | number,
  formatStr = 'dd/MM/yyyy'
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValid(dateObj)) return 'Data inválida';

  return format(dateObj, formatStr, { locale: ptBR });
}

/**
 * Converte uma string em um objeto Date
 */
export function parseDate(
  dateStr: string,
  formatStr = 'dd/MM/yyyy'
): Date | null {
  try {
    const parsedDate = parse(dateStr, formatStr, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    return null;
  }
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate);
}
