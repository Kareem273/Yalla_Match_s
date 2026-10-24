import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

type Reservation = {
  id: string;
  customer: string;
  court: string;
  date: string;
  time: string;
  status: string;
  amount: number;
};

interface ChartModalWrapperProps {
  children: React.ReactNode;
  title: string;
  reservations: Reservation[];
}

export function ChartModalWrapper({ children, title, reservations }: ChartModalWrapperProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group relative">
          <div className="absolute inset-0 bg-transparent z-10" />
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col z-50">
        <DialogHeader>
          <DialogTitle>{title} — {reservations.length} Records</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-xl mt-4">
          {reservations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No records for this chart under the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Date &amp; Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.id}</TableCell>
                    <TableCell>{res.customer}</TableCell>
                    <TableCell>{res.court}</TableCell>
                    <TableCell>{res.date} • {res.time}</TableCell>
                    <TableCell>
                      <Badge variant={
                        res.status === 'Confirmed' ? 'success' :
                        res.status === 'Pending'   ? 'warning' :
                        res.status === 'Cancelled' ? 'destructive' : 'secondary'
                      }>
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">EGP {res.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
