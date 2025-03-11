'use client';

import * as React from 'react';
import withAuth from '@/components/withAuth';
import DiscountTable from './discounttable'; // You'll need to create this component

const DiscountsPage = () => {
  const [discounts, setDiscounts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDiscounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('/api/tickets/discounts/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch discounts');
      const discountData = await response.json();
      setDiscounts(discountData);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-10">
      <div className="mx-auto h-24 w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-3">Discount Management</h1>
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <DiscountTable
          data={discounts}
          isLoading={isLoading}
          fetchDiscounts={fetchDiscounts}
        />
      </div>
    </div>
  );
};

export default withAuth(DiscountsPage, { requiredRole: 'admin' });
