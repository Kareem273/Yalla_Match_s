import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';

type Reservation = {
  id: string;
  customer: string;
  court: string;
  date: string;
  time: string;
  status: string;
  amount: number;
};

export type CourtItem = {
  id: string;
  name: string;
  place: string;
  sportType?: string;
  price: number;
  paymentPhone?: string;
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  reservations?: Reservation[];
  courts?: CourtItem[];
  formula?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, delay = 0, reservations = [], courts, formula }: StatCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay }}
        >
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {title}
                  </p>
                  {typeof formula === 'string' && formula.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground">i</span>
                      </TooltipTrigger>
                      <TooltipContent>{formula}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {icon}
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
                {trend && (
                  <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {title} — {courts ? courts.length : reservations.length} {courts ? 'Courts' : 'Records'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-xl mt-4">
          {courts ? (
            courts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No courts registered in the system.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Court Name</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Payment Phone</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courts.map((court) => (
                    <TableRow key={court.id}>
                      <TableCell className="font-semibold text-foreground">{court.name}</TableCell>
                      <TableCell>
                        <Badge variant="success">
                          {court.sportType || 'Football'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{court.place}</TableCell>
                      <TableCell className="font-medium text-emerald-400">EGP {court.price}/hr</TableCell>
                      <TableCell className="text-muted-foreground">{court.paymentPhone || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success">Available</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            reservations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No records for this metric under the current filters.
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
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
