import React from 'react';
import { TicketTable } from './TicketTab';

const UsersPage: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-10">
      <div className="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50">
        <h3 className="p-8 text-xl font-semibold mb-4">Ticket Controler</h3>
      </div>
      <div className="mx-auto p-6 h-full w-full max-w-3xl rounded-xl bg-muted/50">
        <TicketTable />
      </div>
    </div>
  );
};

export default UsersPage;
