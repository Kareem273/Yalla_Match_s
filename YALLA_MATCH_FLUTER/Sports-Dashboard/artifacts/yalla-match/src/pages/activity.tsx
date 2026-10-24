import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Activity as ActivityIcon, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { apiGet, type ApiAuditLog } from '@/lib/yalla-api';
import { downloadAuditLogsReport } from '@/lib/report-export';
import { PageMotion } from '@/components/page-motion';

export default function Activity() {
  const [logs, setLogs] = useState<ApiAuditLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('yalla-admin-role') || 'Admin';
  const currentEmail = localStorage.getItem('yalla-admin-email') || '';

  useEffect(() => {
    void (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await apiGet<ApiAuditLog[]>('/admin/audit-logs');
        setLogs(data || []);
      } catch {
        setError('Could not load activity log data from the API.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter logs according to role: SuperAdmin sees all admin logs; Regular Admin sees operational activity / own logs
  const visibleLogs = userRole === 'SuperAdmin' 
    ? logs 
    : logs.filter(l => l.adminEmail.toLowerCase() === currentEmail.toLowerCase() || l.adminRole === 'Admin');

  return (
    <AppLayout>
      <PageMotion loading={loading}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <ActivityIcon className="inline -mt-1 mr-2 h-6 w-6 text-primary" />
              Activity Log (سجل النشاطات والحركات)
            </h1>
            <p className="text-muted-foreground mt-1">Real-time audit log of admin operations and system actions.</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
              onClick={() => downloadAuditLogsReport(visibleLogs)}
              disabled={loading || visibleLogs.length === 0}
            >
              <Download className="mr-2 w-4 h-4" /> Export Excel
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {userRole === 'SuperAdmin' ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-sm text-amber-800 dark:text-amber-300 flex items-center justify-between shadow-sm">
            <span className="font-medium flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              سجل حركات جميع الأدمنز متاح بالكامل لصاحب أعلى رول (Super Admin Audit Mode)
            </span>
            <Badge variant="default" className="bg-amber-600">SuperAdmin View</Badge>
          </div>
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 p-3.5 text-sm text-blue-800 dark:text-blue-300 flex items-center justify-between shadow-sm">
            <span className="font-medium flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              معروض سجل النشاطات والحركات التشغيلية كأدمن (Admin Activity View)
            </span>
            <Badge variant="secondary">Admin View</Badge>
          </div>
        )}

        <Card>
          <CardHeader className="border-b bg-muted/10 py-3 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Admin Activity &amp; Audit Trail</CardTitle>
              <Badge variant="secondary">{visibleLogs.length} entries</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-muted-foreground text-sm">Loading activity logs…</div>
            ) : visibleLogs.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">No activity records found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{log.adminEmail}</TableCell>
                      <TableCell>
                        <Badge variant={log.adminRole === 'SuperAdmin' ? 'default' : 'outline'} className={log.adminRole === 'SuperAdmin' ? 'bg-amber-600 text-white' : ''}>
                          {log.adminRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      </PageMotion>
    </AppLayout>
  );
}
