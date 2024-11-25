'use client';

import * as React from 'react';
import withAuth from '@/components/withAuth';
import { useEffect, useState, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui';

// Registrar os componentes do Chart.js
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const Admin = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [pendingTickets, setPendingTickets] = useState(0);
  const [completedTickets, setCompletedTickets] = useState(0);
  const [dueTickets, setDueTickets] = useState(0);
  const [todayTickets, setTodayTickets] = useState(0);
  const [upcomingTickets, setUpcomingTickets] = useState(0);
  const [ticketsByMonth, setTicketsByMonth] = useState<number[]>([]);
  const ticketsByMonthChartRef = useRef<Chart | null>(null);

  // Novos estados para o diálogo
  const [openDialog, setOpenDialog] = useState(false);
  interface CardData {
    ticket: string;
    createdBy: {
      username: string;
    };
    endDate: string;
  }

  const [selectedCardData, setSelectedCardData] = useState<CardData[]>([]);

  useEffect(() => {
    // Buscar dados do dashboard ao montar o componente
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Inicializar o gráfico apenas se houver dados
    if (ticketsByMonth.length > 0) {
      // Destruir o gráfico existente, se houver
      if (ticketsByMonthChartRef.current) {
        ticketsByMonthChartRef.current.destroy();
      }

      const ctx = document.getElementById(
        'ticketsByMonthChart'
      ) as HTMLCanvasElement;

      if (ctx) {
        ticketsByMonthChartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: [
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ],
            datasets: [
              {
                label: 'Tickets Abertos',
                data: ticketsByMonth,
                backgroundColor: '#36A2EB',
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Tickets Abertos por Mês',
              },
            },
          },
        });
      }
    }
  }, [ticketsByMonth]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      const response = await fetch('/api/home/admin/dashboard-data', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar dados do dashboard');
      }

      const data = await response.json();
      setTotalUsers(data.totalUsers);
      setTotalTickets(data.totalTickets);
      setPendingTickets(data.pendingTickets);
      setCompletedTickets(data.completedTickets);
      setDueTickets(data.dueTickets);
      setTodayTickets(data.todayTickets);
      setUpcomingTickets(data.upcomingTickets);
      setTicketsByMonth(data.ticketsByMonth); // Certifique-se de que o backend retorna os tickets por mês
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  // Função para lidar com o clique nos cards
  const handleCardClick = async (cardType: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      let endpoint = '';
      switch (cardType) {
        case 'dueTickets':
          endpoint = '/api/home/admin/overdue-tickets';
          break;
        case 'todayTickets':
          endpoint = '/api/home/admin/today-tickets';
          break;
        case 'upcomingTickets':
          endpoint = '/api/home/admin/upcoming-tickets';
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do card');
      }

      const data = await response.json();
      setSelectedCardData(data);
      setOpenDialog(true);
    } catch (error) {
      console.error('Erro ao buscar dados do card:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10">
      <div className="h-24 w-full max-w-3xl flex items-center justify-center">
        <h3 className="text-xl font-semibold mb-4">Admin Dashboard</h3>
      </div>
      <div className="w-full max-w-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Tickets em Aberto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalTickets}</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Tickets Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{pendingTickets}</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Finalizados Não Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{completedTickets}</p>
            </CardContent>
          </Card>
          <Card
            className="text-center cursor-pointer"
            onClick={() => handleCardClick('dueTickets')}
          >
            <CardHeader>
              <CardTitle>Tickets Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{dueTickets}</p>
            </CardContent>
          </Card>
          <Card
            className="text-center cursor-pointer"
            onClick={() => handleCardClick('todayTickets')}
          >
            <CardHeader>
              <CardTitle>Vence Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{todayTickets}</p>
            </CardContent>
          </Card>
          <Card
            className="text-center cursor-pointer"
            onClick={() => handleCardClick('upcomingTickets')}
          >
            <CardHeader>
              <CardTitle>Próximos 2 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{upcomingTickets}</p>
            </CardContent>
          </Card>
        </div>

        {/* Diálogo */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-[400px] w-full max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            {selectedCardData && selectedCardData.length > 0 ? (
              selectedCardData.map((item) => (
                <div key={item.ticket} className="mb-4">
                  <Label>
                    <p>
                      <strong>Ticket:</strong> {item.ticket}
                    </p>
                  </Label>
                  <Label>
                    <p>
                      <strong>Usuário:</strong>{' '}
                      {item.createdBy?.username || 'N/A'}
                    </p>
                  </Label>
                  <Label>
                    <p>
                      <strong>Data de Término:</strong>{' '}
                      {item.endDate
                        ? new Date(item.endDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </Label>
                </div>
              ))
            ) : (
              <Label>Nenhum dado disponível.</Label>
            )}
          </DialogContent>
        </Dialog>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tickets Abertos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <canvas
                id="ticketsByMonthChart"
                width="400"
                height="200"
              ></canvas>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withAuth(Admin, { requiredRole: 'admin' });
