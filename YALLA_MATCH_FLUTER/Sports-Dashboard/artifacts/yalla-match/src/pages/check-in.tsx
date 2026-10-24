import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, ScanLine, CheckCircle2, AlertCircle, Keyboard, Camera, X } from 'lucide-react';
import { PageMotion } from '@/components/page-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type Reservation = {
  id: string;
  courtName?: string;
  customerName?: string;
  customerPhone?: string;
  date?: string;
  fromHour?: number;
  toHour?: number;
  status?: string;
  paymentStatus?: string;
  qrToken?: string;
};

async function api(path: string, token: string, body: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error((await response.text()) || 'Request failed');
  return response.json() as Promise<Reservation>;
}

function loadHtml5QrcodeClass(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Html5Qrcode) {
      resolve((window as any).Html5Qrcode);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.onload = () => resolve((window as any).Html5Qrcode);
    script.onerror = () => reject(new Error('Failed to load QR scanner library'));
    document.body.appendChild(script);
  });
}

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const qrScannerRef = useRef<any>(null);
  const token = localStorage.getItem('yalla-admin-token') || '';

  const validateCode = async (targetCode: string) => {
    const trimmed = targetCode.trim();
    if (!trimmed) return;
    if (!token) { setMessage('Please sign in to the dashboard first.'); return; }
    setLoading(true); setMessage(''); setReservation(null);
    try {
      let result: Reservation;
      try {
        result = await api('/admin/qr/validate', token, { qrToken: trimmed });
      } catch {
        const tracking = await fetch(`${API_URL}/tracking/${encodeURIComponent(trimmed)}`);
        if (!tracking.ok) throw new Error('Reservation not found');
        const tracked = await tracking.json() as Reservation;
        if (!tracked.qrToken) throw new Error('Reservation does not have a QR token');
        result = await api('/admin/qr/validate', token, { qrToken: tracked.qrToken });
      }
      setReservation(result);
      setMessage('Booking QR validated successfully.');
    } catch {
      setMessage('Reservation was not found. Scan the QR code again or enter the booking tracking code exactly.');
    } finally { setLoading(false); }
  };

  const validate = () => validateCode(code);

  const checkIn = async () => {
    if (!reservation?.qrToken || !token) return;
    setLoading(true); setMessage('');
    try {
      const result = await api('/admin/qr/check-in', token, { qrToken: reservation.qrToken });
      setReservation(result); setMessage('Customer checked in successfully.');
    } catch {
      setMessage('Check-in could not be completed. The reservation must be confirmed and not already checked in.');
    } finally { setLoading(false); }
  };

  const stopCameraScanner = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
        qrScannerRef.current.clear();
      } catch {
        // ignore
      }
      qrScannerRef.current = null;
    }
  };

  const closeScannerModal = async () => {
    await stopCameraScanner();
    setScannerOpen(false);
  };

  const startCameraScanner = async () => {
    setCameraError('');
    setScannerOpen(true);
  };

  useEffect(() => {
    if (!scannerOpen) return;

    let isMounted = true;
    const initScanner = async () => {
      try {
        const Html5QrcodeClass = await loadHtml5QrcodeClass();
        if (!isMounted) return;

        await new Promise(r => setTimeout(r, 200));
        if (!isMounted) return;

        const html5QrCode = new Html5QrcodeClass('qr-reader-canvas');
        qrScannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            setCode(decodedText);
            void closeScannerModal();
            void validateCode(decodedText);
          },
          () => {
            // frame error - harmless
          }
        );
      } catch (err) {
        if (isMounted) {
          setCameraError('Unable to access camera. Please check camera permissions or type the QR code manually.');
        }
      }
    };

    void initScanner();

    return () => {
      isMounted = false;
      void stopCameraScanner();
    };
  }, [scannerOpen]);

  return <AppLayout>
    <PageMotion>
      <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Check-in</h1>
        <p className="text-muted-foreground mt-1">Scan a booking QR code live using your camera or enter its reservation token to validate attendance.</p>
      </div>

      <Card className="border-emerald-600/30">
        <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="text-emerald-600" /> Scan or enter booking code</CardTitle><CardDescription>Use your live camera scanner, barcode scanner, or type the booking code manually.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground"/>
              <Input className="pl-9 h-11" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&validate()} placeholder="Paste QR token or booking code" />
            </div>
            <Button className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm" onClick={validate} disabled={loading}>
              <ScanLine className="mr-2 w-4 h-4" />{loading ? 'Checking…' : 'Validate'}
            </Button>
            <Button variant="outline" className="h-11 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-medium" onClick={() => void startCameraScanner()}>
              <Camera className="mr-2 w-4 h-4" />Scan with Camera
            </Button>
          </div>
          {message && <div className={message.includes('successfully') ? 'flex gap-2 text-emerald-700 text-sm font-medium' : 'flex gap-2 text-destructive text-sm'}>{message.includes('successfully') ? <CheckCircle2 className="w-4 h-4 mt-0.5"/> : <AlertCircle className="w-4 h-4 mt-0.5"/>}{message}</div>}
        </CardContent>
      </Card>

      {/* Camera QR Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={open => { if (!open) void closeScannerModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Camera className="w-5 h-5" /> Live QR Camera Scanner (مسح كود الحجز)
            </DialogTitle>
            <DialogDescription>
              Point your camera at the customer's booking QR code.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {cameraError ? (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex flex-col items-center gap-2 text-center">
                <AlertCircle className="w-6 h-6" />
                <p>{cameraError}</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-emerald-500 bg-black min-h-[300px] flex items-center justify-center relative">
                <div id="qr-reader-canvas" className="w-full" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => void closeScannerModal()}>
              <X className="w-4 h-4 mr-1" /> Close Camera
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {reservation && <Card className="border-emerald-600/40"><CardHeader className="flex flex-row justify-between items-start"><div><CardTitle>{reservation.courtName || 'Court reservation'}</CardTitle><CardDescription>{reservation.date} · {reservation.fromHour}:00 – {reservation.toHour}:00</CardDescription></div><Badge variant={reservation.status === 'CheckedIn' ? 'secondary' : reservation.status === 'Confirmed' ? 'success' : 'warning'}>{reservation.status}</Badge></CardHeader><CardContent className="space-y-5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Customer</p><p className="font-medium">{reservation.customerName || 'Guest'}</p></div><div><p className="text-muted-foreground">Phone</p><p className="font-medium">{reservation.customerPhone || 'Not provided'}</p></div><div><p className="text-muted-foreground">Payment</p><p className="font-medium">{reservation.paymentStatus}</p></div><div><p className="text-muted-foreground">Reservation ID</p><p className="font-medium break-all">{reservation.id}</p></div></div><Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={checkIn} disabled={loading || reservation.status === 'CheckedIn' || reservation.status !== 'Confirmed'}><CheckCircle2 className="mr-2 w-4 h-4" />{reservation.status === 'CheckedIn' ? 'Already checked in' : 'Confirm check-in'}</Button></CardContent></Card>}
      </div>
    </PageMotion>
  </AppLayout>;
}
