"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type {
  UserTicket,
  TicketData,
  TicketDistributionChartProps,
} from "@/types/chart";

// Define ChartConfig type
type ChartConfig = {
  tickets: {
    label: string;
  };
  [key: string]: {
    label: string;
    color?: string;
  };
};

export function TicketDistributionChart({
  userTicketDistribution = [],
}: TicketDistributionChartProps) {
  console.log("userTicketDistribution:", userTicketDistribution); // Debug log

  // Generate dynamic chart config based on users
  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      tickets: {
        label: "Tickets",
      },
    };

    // Color palette for users
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];

    userTicketDistribution.forEach((user, index) => {
      config[user.username] = {
        label: user.username,
        color: colors[index % colors.length],
      };
    });

    return config;
  }, [userTicketDistribution]);

  const chartData: TicketData[] = React.useMemo(() => {
    if (!userTicketDistribution?.length) return [];

    return userTicketDistribution.map((user: UserTicket, index: number) => {
      const data = {
        username: user.username,
        tickets: user.ticketCount,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`, // Cycle through 5 colors
      };
      console.log("Chart data item:", data); // Debug log
      return data;
    });
  }, [userTicketDistribution]);

  const totalTickets = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.tickets, 0);
  }, [chartData]);

  // Don't render chart if no data
  if (!chartData.length) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribuição de Tickets</CardTitle>
          <CardDescription>Por Usuário</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribuição de Tickets</CardTitle>
        <CardDescription>Por Usuário</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="tickets"
              nameKey="username"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalTickets}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Tickets
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
