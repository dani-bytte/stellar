// In types/index.ts (create if needed)
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

export * from './api';
export * from './user';
export * from './common';
