'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { useGraphQLClasses, useGraphQLStudents } from '@/hooks/use-graphql';
import { useAppStore } from '@/store/use-app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  Award, Eye, Plus, Printer, ShieldBan, Loader2,
} from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { apiFetch } from '@/lib/api';
import { CertificateTemplate } from './certificates/certificate-template';

// ── Types ──

interface CertificateRecord {
  id: string;
  certificateType: string;
  certificateNo: string;
  issueDate: string;
  content: any;
  status: string;
  student: any;
}

const CERT_TYPE_COLORS: Record<string, string> = {
  transfer: 'bg-blue-100 text-blue-700 border-blue-200',
  bonafide: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  character: 'bg-purple-100 text-purple-700 border-purple-200',
  migration: 'bg-amber-100 text-amber-700 border-amber-200',
  provisional: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

export function AdminCertificates() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useAppStore();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [viewCert, setViewCert] = useState<CertificateRecord | null>(null);
  const [revokeCert, setRevokeCert] = useState<CertificateRecord | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: viewCert ? `Certificate_${viewCert.certificateNo}` : 'Certificate',
  });

  const [form, setForm] = useState({ 
    studentId: '', 
    certificateType: 'bonafide', 
    issueDate: new Date().toISOString().split('T')[0], 
    notes: '' 
  });

  // ── Queries (Optimized GraphQL) ──

  const { data: certificatesData, isLoading: certsLoading, error: certsError } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const res = await apiFetch('/api/certificates');
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to fetch certificates');
      }
      return res.json();
    },
  });

  const certificates = Array.isArray(certificatesData) ? certificatesData : [];

  const { data: classes = [] } = useGraphQLClasses(currentTenantId || undefined);
  const { data: students = [], isFetching: studentsLoading } = useGraphQLStudents(currentTenantId || undefined, selectedClassId);

  // ── Mutations ──

  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiFetch('/api/certificates', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to generate');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Certificate Generated');
      setGenerateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: () => toast.error('Generation failed'),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch('/api/certificates', { method: 'PUT', body: JSON.stringify({ id, status: 'revoked' }) });
      if (!res.ok) throw new Error('Failed to revoke');
    },
    onSuccess: () => {
      toast.success('Certificate Revoked');
      setRevokeCert(null);
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: () => toast.error('Revocation failed'),
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white !important; }
          .cert-frame { 
            width: 190mm !important; 
            height: 277mm !important; 
            margin: auto !important; 
            border: 12px double #92400e !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
        }
      `}} />

      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Award className="h-7 w-7 text-amber-600" /> Certificates</h1>
          <p className="text-muted-foreground text-sm">Official student documentation management.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setGenerateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Generate
        </Button>
      </div>

      <Card className="no-print">
        <CardContent className="p-0">
          {certsLoading ? (
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.certificateNo}</TableCell>
                    <TableCell className="font-medium">{c.student?.user?.name || c.content?.studentName}</TableCell>
                    <TableCell><Badge variant="outline" className={CERT_TYPE_COLORS[c.certificateType]}>{c.certificateType}</Badge></TableCell>
                    <TableCell><Badge variant={c.status === 'active' ? 'default' : 'destructive'} className={c.status === 'active' ? 'bg-emerald-500' : ''}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setViewCert(c)}><Eye className="h-4 w-4 mr-1" /> View</Button>
                      {c.status === 'active' && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setRevokeCert(c)}><ShieldBan className="h-4 w-4 mr-1" /> Revoke</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="no-print">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>New Certificate</DialogTitle>
              <DialogDescription>Form to generate a new certificate for a student.</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          <DialogHeader><DialogTitle>New Certificate</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}</SelectContent>
            </Select>

            <Select value={form.studentId} onValueChange={v => setForm({...form, studentId: v})} disabled={!selectedClassId || studentsLoading}>
              <SelectTrigger>{studentsLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <SelectValue placeholder="Select Student" />}</SelectTrigger>
              <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name || 'Unknown'}</SelectItem>)}</SelectContent>
            </Select>

            <Select value={form.certificateType} onValueChange={v => setForm({...form, certificateType: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                <SelectItem value="transfer">Transfer Certificate</SelectItem>
                <SelectItem value="character">Character Certificate</SelectItem>
              </SelectContent>
            </Select>

            <Input type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})} />
            <Textarea placeholder="Additional Notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <DialogFooter>
            <Button className="bg-amber-600" onClick={() => generateMutation.mutate({ studentId: form.studentId, certificateType: form.certificateType, issueDate: form.issueDate, content: { notes: form.notes } })} disabled={generateMutation.isPending}>
              {generateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewCert} onOpenChange={v => !v && setViewCert(null)}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden no-print text-slate-900">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
              <DialogDescription>Full preview of the student certificate before printing.</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          <div className="p-4 pr-16 border-b flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-900">Preview</h3>
            <Button onClick={() => handlePrint()} className="bg-amber-600 hover:bg-amber-700 text-white"><Printer className="h-4 w-4 mr-2" /> Print PDF</Button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-8 bg-gray-100">
            <div ref={contentRef}>
              <CertificateTemplate cert={viewCert} formatDate={formatDate} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revokeCert} onOpenChange={v => !v && setRevokeCert(null)}>
        <DialogContent>
           <VisuallyHidden.Root>
             <DialogHeader>
               <DialogTitle>Revoke Certificate</DialogTitle>
               <DialogDescription>Confirmation dialog to revoke an issued certificate.</DialogDescription>
             </DialogHeader>
           </VisuallyHidden.Root>
           <DialogHeader><DialogTitle className="text-red-600">Revoke Certificate</DialogTitle></DialogHeader>
           <p className="py-4 text-sm">Are you sure you want to revoke <strong>{revokeCert?.certificateNo}</strong>?</p>
           <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeCert(null)}>Cancel</Button>
              <Button className="bg-red-600" onClick={() => revokeMutation.mutate(revokeCert?.id!)} disabled={revokeMutation.isPending}>Confirm Revoke</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
