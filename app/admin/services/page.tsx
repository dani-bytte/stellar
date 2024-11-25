'use client';

import { useEffect, useState } from 'react';
import withAuth from '@/components/withAuth';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface Service {
  _id: string;
  name: string;
  type: string;
  dueDate: number;
  value: number;
  category: string;
}

interface GroupedServices {
  [key: string]: Service[];
}

const ServicesPage = () => {
  const [groupedServices, setGroupedServices] = useState<GroupedServices>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch('/api/tickets/services', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch services');
        const data: Service[] = await response.json();

        // Group services by type
        const grouped = data.reduce((acc, service) => {
          if (!acc[service.type]) {
            acc[service.type] = [];
          }
          acc[service.type].push(service);
          return acc;
        }, {} as GroupedServices);

        setGroupedServices(grouped);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load services'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-10">
      <div className="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50">
        <h1 className="text-3xl left-4 p-7 font-bold mb-3">
          Available Services
        </h1>
      </div>
      <div className="mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50">
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {Object.entries(groupedServices).map(([type, services]) => (
                <AccordionItem key={type} value={type} className=" rounded-lg">
                  <AccordionTrigger className="px-4">
                    <div className="flex items-center gap-2">
                      <span>{type}</span>
                      <Badge variant="secondary">{services.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="single" collapsible className="px-4">
                      {services.map((service) => (
                        <AccordionItem key={service._id} value={service._id}>
                          <AccordionTrigger>{service.name}</AccordionTrigger>
                          <AccordionContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Duration: {service.dueDate} days
                            </p>
                            <p className="text-lg font-semibold">
                              R${service.value.toFixed(2)}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ServicesPage, { requiredRole: 'admin' });
