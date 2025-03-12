"use client";

import * as React from "react";
import withAuth from "@/components/withAuth";
import ServiceTable from "./newservice";

const ServicesPage = () => {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/tickets/services/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch services");
      const services = await response.json();
      setData(services);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-10">
      <div className="mx-auto h-24 w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-3">Available Services</h1>
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <ServiceTable
          data={data}
          isLoading={isLoading}
          fetchServices={fetchServices}
        />
      </div>
    </div>
  );
};

export default withAuth(ServicesPage, { requiredRole: "admin" });
