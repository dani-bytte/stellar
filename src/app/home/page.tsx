"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui";
import { API_ENDPOINTS } from "@/lib/constants";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

const HomePage: React.FC = () => {
  const [myActiveTickets, setMyActiveTickets] = useState(0);
  const [myPendingTickets, setMyPendingTickets] = useState(0);
  const [myCompletedTickets, setMyCompletedTickets] = useState(0);
  const [myDueTickets, setMyDueTickets] = useState(0);
  const [myTodayTickets, setMyTodayTickets] = useState(0);
  const [myTicketsByMonth, setMyTicketsByMonth] = useState<number[]>([]);
  const ticketChartRef = useRef<Chart | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  interface TicketData {
    ticket: string;
    status: string;
    endDate: string | null;
  }

  const [selectedCardData, setSelectedCardData] = useState<TicketData[]>([]);

  useEffect(() => {
    fetchUserDashboardData();
  }, []);

  useEffect(() => {
    if (myTicketsByMonth.length > 0) {
      if (ticketChartRef.current) {
        ticketChartRef.current.destroy();
      }

      const ctx = document.getElementById(
        "myTicketsChart",
      ) as HTMLCanvasElement;
      if (ctx) {
        ticketChartRef.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: [
              "Jan",
              "Fev",
              "Mar",
              "Abr",
              "Mai",
              "Jun",
              "Jul",
              "Ago",
              "Set",
              "Out",
              "Nov",
              "Dez",
            ],
            datasets: [
              {
                label: "Meus Tickets",
                data: myTicketsByMonth,
                backgroundColor: "#4F46E5",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: "Meus Tickets por Mês",
              },
            },
          },
        });
      }
    }
  }, [myTicketsByMonth]);

  const fetchUserDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado");
        return;
      }

      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await fetch(API_ENDPOINTS.USER.DASHBOARD, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Falha ao buscar dados");

      const data = await response.json();
      setMyActiveTickets(data.totalTickets);
      setMyPendingTickets(data.pendingTickets);
      setMyCompletedTickets(data.completedTickets);
      setMyDueTickets(data.dueTickets);
      setMyTodayTickets(data.todayTickets);
      setMyTicketsByMonth(data.ticketsByMonth);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleCardClick = async (cardType: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Usar endpoints dinâmicos baseados no tipo
      const endpoint = cardType === "dueTickets" 
        ? API_ENDPOINTS.USER.DUE_TICKETS 
        : API_ENDPOINTS.USER.TODAY_TICKETS;
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar dados");

      const data = await response.json();
      setSelectedCardData(data);
      setOpenDialog(true);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10">
      <div className="h-24 w-full max-w-3xl flex items-center justify-center">
        <h3 className="text-xl font-semibold mb-4">Meus Tickets</h3>
      </div>

      <div className="w-full max-w-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Tickets Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{myActiveTickets}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle>Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{myPendingTickets}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle>Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{myCompletedTickets}</p>
            </CardContent>
          </Card>

          <Card
            className="text-center cursor-pointer"
            onClick={() => handleCardClick("dueTickets")}
          >
            <CardHeader>
              <CardTitle>Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{myDueTickets}</p>
            </CardContent>
          </Card>

          <Card
            className="text-center cursor-pointer"
            onClick={() => handleCardClick("todayTickets")}
          >
            <CardHeader>
              <CardTitle>Vence Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{myTodayTickets}</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-[400px] w-full max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Ticket</DialogTitle>
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
                      <strong>Status:</strong> {item.status}
                    </p>
                  </Label>
                  <Label>
                    <p>
                      <strong>Vencimento:</strong>{" "}
                      {item.endDate
                        ? new Date(item.endDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </Label>
                </div>
              ))
            ) : (
              <Label>Nenhum ticket encontrado.</Label>
            )}
          </DialogContent>
        </Dialog>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Meus Tickets por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <canvas id="myTicketsChart" width="400" height="200"></canvas>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
