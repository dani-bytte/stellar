// Update types/chart.ts to match backend response
export interface UserTicket {
  username: string;
  ticketCount: number;
}

export interface TicketData {
  username: string;
  tickets: number;
  fill: string;
}

export interface TicketDistributionChartProps {
  userTicketDistribution: UserTicket[];
}

// Type guard with unknown instead of any
function isUserTicketArray(data: unknown): data is UserTicket[] {
  if (!Array.isArray(data)) return false;

  return data.every((item): item is UserTicket => {
    if (!item || typeof item !== 'object') return false;

    return (
      'username' in item &&
      'ticketCount' in item &&
      typeof (item as UserTicket).username === 'string' &&
      typeof (item as UserTicket).ticketCount === 'number'
    );
  });
}

export { isUserTicketArray };
