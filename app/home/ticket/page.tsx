import React from 'react';
import { TicketTable } from './TicketTab';

const UsersPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10">
      <div className="h-24 w-full max-w-3xl flex items-center justify-center">
        <h3 className="text-xl font-semibold mb-4">Ticket Controler</h3>
      </div>
      <div className="w-full max-w-3xl p-6">
        <TicketTable />
      </div>
    </div>
  );
};

export default UsersPage;
