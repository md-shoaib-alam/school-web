'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText, Award, Download, Eye, Plus, Printer, ShieldBan, GraduationCap,
  ShieldCheck, RotateCcw, Ban, BookOpen, ArrowRightLeft, Loader2,
} from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { apiFetch } from '@/lib/api';

// ── Types ──

interface StudentOption {
  id: string;
  name: string;
  className: string;
}

interface CertificateContent {
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  parentName?: string;
  admissionDate: string;
  class: { id: string; name: string; section: string; grade: string } | null;
  notes?: string;
  [key: string]: unknown;
}

interface CertificateRecord {
  id: string;
  studentId: string;
  certificateType: string;
  certificateNo: string;
  issueDate: string;
  content: CertificateContent;
  status: string;
  createdAt: string;
  student: {
    id: string;
    rollNumber: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup?: string;
    admissionDate: string;
    user: { id: string; name: string; email: string };
    class: { id: string; name: string; section: string; grade: string } | null;
  };
}

interface GenerateForm {
  studentId: string;
  certificateType: string;
  issueDate: string;
  notes: string;
}

// ── Constants ──

const CERTIFICATE_TYPES = ['transfer', 'bonafide', 'character', 'migration', 'provisional'] as const;

const CERT_TYPE_LABELS: Record<string, string> = {
  transfer: 'Transfer Certificate',
  bonafide: 'Bonafide Certificate',
  character: 'Character Certificate',
  migration: 'Migration Certificate',
  provisional: 'Provisional Certificate',
};

const CERT_TYPE_COLORS: Record<string, string> = {
  transfer: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  bonafide: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  character: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  migration: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  provisional: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  revoked: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

const emptyForm: GenerateForm = {
  studentId: '',
  certificateType: '',
  issueDate: new Date().toISOString().split('T')[0],
  notes: '',
};

// ── Component ──

export function AdminCertificates() {
  // Data
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Generate dialog
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState<GenerateForm>({ ...emptyForm });
  const [generating, setGenerating] = useState(false);

  // View dialog
  const [viewCert, setViewCert] = useState<CertificateRecord | null>(null);

  // Revoke dialog
  const [revokeCert, setRevokeCert] = useState<CertificateRecord | null>(null);
  const [revoking, setRevoking] = useState(false);

  // ── Fetch Data ──

  async function fetchData() {
    try {
      const [certsRes, studentsRes] = await Promise.all([
        apiFetch('/api/certificates'),
        apiFetch('/api/students'),
      ]);
      if (certsRes.ok) {
        setCertificates(await certsRes.json());
      }
      if (studentsRes.ok) {
        const studentData = await studentsRes.json();
        setStudents(
          studentData.map((s: { id: string; name: string; className: string }) => ({
            id: s.id,
            name: s.name,
            className: s.className,
          })),
        );
      }
    } catch {
      console.error('Error fetching certificates data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ── Filtering ──

  const filtered = certificates.filter((c) => {
    const matchType = typeFilter === 'all' || c.certificateType === typeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchType && matchStatus;
  });

  // ── Summary ──

  const totalCerts = certificates.length;
  const activeCerts = certificates.filter((c) => c.status === 'active').length;
  const revokedCerts = certificates.filter((c) => c.status === 'revoked').length;

  const typeBreakdown = CERTIFICATE_TYPES.map((type) => ({
    type,
    label: CERT_TYPE_LABELS[type],
    count: certificates.filter((c) => c.certificateType === type).length,
    color: CERT_TYPE_COLORS[type],
    icon: getTypeIcon(type),
  }));

  function getTypeIcon(type: string) {
    switch (type) {
      case 'transfer': return <ArrowRightLeft className="h-4 w-4" />;
      case 'bonafide': return <BookOpen className="h-4 w-4" />;
      case 'character': return <ShieldCheck className="h-4 w-4" />;
      case 'migration': return <GraduationCap className="h-4 w-4" />;
      case 'provisional': return <Award className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  }

  // ── Generate Certificate ──

  const handleGenerate = async () => {
    if (!generateForm.studentId || !generateForm.certificateType || !generateForm.issueDate) {
      toast.error('Validation Error', { description: 'Student, certificate type, and issue date are required' });
      return;
    }
    setGenerating(true);
    const promise = (async () => {
      const res = await apiFetch('/api/certificates', {
        method: 'POST',
        body: JSON.stringify({
          studentId: generateForm.studentId,
          certificateType: generateForm.certificateType,
          issueDate: generateForm.issueDate,
          content: generateForm.notes ? { notes: generateForm.notes } : {},
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate certificate');
      }
      setGenerateOpen(false);
      setGenerateForm({ ...emptyForm });
      await fetchData();
    })();

    toast.promise(promise, {
      loading: 'Generating certificate...',
      success: 'Certificate generated successfully!',
      error: (err: any) => err.message || 'Error generating certificate',
    });

    try { await promise; } catch { /* handled */ }
    setGenerating(false);
  };

  // ── Revoke Certificate ──

  const handleRevoke = async () => {
    if (!revokeCert) return;
    setRevoking(true);
    const promise = (async () => {
      const res = await apiFetch('/api/certificates', {
        method: 'PUT',
        body: JSON.stringify({ id: revokeCert.id, status: 'revoked' }),
      });
      if (!res.ok) throw new Error('Failed to revoke certificate');
      setRevokeCert(null);
      await fetchData();
      if (viewCert?.id === revokeCert.id) setViewCert(null);
    })();

    toast.promise(promise, {
      loading: 'Revoking certificate...',
      success: 'Certificate revoked successfully',
      error: (err: any) => err.message || 'Error revoking certificate',
    });

    try { await promise; } catch { /* handled */ }
    setRevoking(false);
  };

  // ── Print Certificate ──

  const handlePrint = () => {
    window.print();
  };

  // ── Helpers ──

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatClass = (cert: CertificateRecord) => {
    if (!cert.student?.class) return 'N/A';
    const { name, section, grade } = cert.student.class;
    return `${grade} - ${name} (${section})`;
  };

  const getParentName = (cert: CertificateRecord) => {
    const content = cert.content;
    if (content.parentName) return String(content.parentName);
    return 'N/A';
  };

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-7 w-7 text-amber-600" />
            Certificate Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate, view, and manage student certificates including transfer, bonafide, character, migration, and provisional certificates.
          </p>
        </div>
        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          onClick={() => { setGenerateForm({ ...emptyForm }); setGenerateOpen(true); }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate Certificate
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Certificates</p>
              <p className="text-xl font-bold">{totalCerts}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{activeCerts}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revoked</p>
              <p className="text-xl font-bold">{revokedCerts}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Certificate Types</p>
              <p className="text-xl font-bold">{typeBreakdown.filter((t) => t.count > 0).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {typeBreakdown.map((item) => (
          <Card key={item.type} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs ${item.color.split(' ').slice(0, 2).join(' ')}`}>
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground truncate">{item.label.replace(' Certificate', '')}</p>
                <p className="text-lg font-bold leading-tight">{item.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Certificate Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CERTIFICATE_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {CERT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{filtered.length} certificate{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Certificates Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="hidden md:table-cell">Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No certificates found</p>
                        <p className="text-xs mt-1">Generate a new certificate to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((cert) => (
                      <TableRow key={cert.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors">
                        <TableCell>
                          <span className="font-mono text-xs">{cert.certificateNo}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-semibold shrink-0">
                              {cert.student?.user?.name
                                ? cert.student.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                                : '??'}
                            </div>
                            <span className="font-medium text-sm">{cert.student?.user?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatClass(cert)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${CERT_TYPE_COLORS[cert.certificateType] || ''} font-normal text-xs`}
                          >
                            {getTypeIcon(cert.certificateType)}
                            <span className="ml-1 capitalize">{cert.certificateType}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {formatDate(cert.issueDate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${STATUS_COLORS[cert.status] || ''} font-medium text-xs`}
                          >
                            {cert.status === 'active' ? (
                              <ShieldCheck className="h-3 w-3 mr-1" />
                            ) : (
                              <Ban className="h-3 w-3 mr-1" />
                            )}
                            <span className="capitalize">{cert.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              onClick={() => setViewCert(cert)}
                              title="View Certificate"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            {cert.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                                onClick={() => setRevokeCert(cert)}
                                title="Revoke Certificate"
                              >
                                <ShieldBan className="h-3.5 w-3.5 mr-1" />
                                <span className="hidden sm:inline">Revoke</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Generate Certificate Dialog ── */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-amber-600" />
              Generate Certificate
            </DialogTitle>
            <DialogDescription>
              Create a new certificate for a student. Student details will be auto-populated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Student Select */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Student *</label>
              <Select value={generateForm.studentId} onValueChange={(v) => setGenerateForm({ ...generateForm, studentId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground text-xs">({s.className})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Type */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Certificate Type *</label>
              <Select value={generateForm.certificateType} onValueChange={(v) => setGenerateForm({ ...generateForm, certificateType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {CERT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Issue Date */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Issue Date *</label>
              <Input
                type="date"
                value={generateForm.issueDate}
                onChange={(e) => setGenerateForm({ ...generateForm, issueDate: e.target.value })}
              />
            </div>

            {/* Additional Notes */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                placeholder="Any additional notes or description for the certificate..."
                value={generateForm.notes}
                onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleGenerate}
              disabled={generating || !generateForm.studentId || !generateForm.certificateType || !generateForm.issueDate}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Certificate Dialog ── */}
      <Dialog open={!!viewCert} onOpenChange={(open) => { if (!open) setViewCert(null); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:p-0 print:static print:inset-auto print:bg-white print:z-auto print:overflow-visible print:rounded-none print:border-0 print:shadow-none print:max-h-none">
          {viewCert && (
            <div className="print:block print:w-[210mm] print:h-[297mm] print:mx-auto">
              {/* Dialog Header (hidden on print) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden mb-4">
                <DialogHeader className="flex-1">
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-amber-600" />
                    Certificate Preview
                  </DialogTitle>
                  <DialogDescription>
                    {CERT_TYPE_LABELS[viewCert.certificateType]} — {viewCert.certificateNo}
                  </DialogDescription>
                </DialogHeader>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 print:hidden"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>

              {/* Certificate Container - High Fidelity for Print */}
              <div className="relative border-4 border-double border-amber-800 rounded-lg p-8 sm:p-12 bg-white print:border-amber-800 print:border-4 print:border-double print:rounded-lg print:bg-white print:h-full print:w-full print:shadow-none shadow-xl mx-auto dark:bg-white dark:text-gray-900">
                
                {/* Decorative Corners */}
                <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-amber-800 rounded-tl-md" />
                <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-amber-800 rounded-tr-md" />
                <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-amber-800 rounded-bl-md" />
                <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-amber-800 rounded-br-md" />

                {/* School Header */}
                <div className="text-center space-y-3 mb-10">
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border-2 border-amber-200">
                      <GraduationCap className="h-10 w-10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold text-amber-900 tracking-tight uppercase print:text-amber-900 font-serif">
                      Sunrise Academy
                    </h2>
                    <p className="text-sm font-medium text-gray-700 print:text-gray-700 italic">
                      Affiliated to Central Board of Secondary Education (CBSE)
                    </p>
                    <p className="text-xs text-gray-600 print:text-gray-600">
                      123 Education Lane, Academic City — PIN: 560001
                    </p>
                  </div>
                  {/* Decorative Divider */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="w-32 h-[1px] bg-amber-800" />
                    <div className="h-2 w-2 rotate-45 bg-amber-800" />
                    <div className="w-32 h-[1px] bg-amber-800" />
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="text-center mb-12">
                  <h3 className="text-4xl font-bold text-amber-800 uppercase tracking-[0.2em] print:text-amber-800 mb-2 drop-shadow-sm">
                    {CERT_TYPE_LABELS[viewCert.certificateType]?.split(' ')[0] || viewCert.certificateType.toUpperCase()}
                  </h3>
                  <h4 className="text-xl font-semibold text-amber-700 uppercase tracking-widest mb-3">
                    CERTIFICATE
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">
                    CERTIFICATE NO: <span className="font-bold text-gray-800">{viewCert.certificateNo}</span>
                  </p>
                </div>

                {/* Certificate Body */}
                <div className="space-y-8 max-w-2xl mx-auto text-center">
                  <p className="text-lg text-gray-700 italic leading-relaxed">
                    This is to certify that
                  </p>

                  {/* Student Name Wrapper */}
                  <div className="relative py-2 px-4 inline-block mx-auto min-w-[300px] border-b-2 border-amber-800/30">
                    <p className="text-3xl font-bold text-gray-900 uppercase tracking-wider font-serif">
                      {viewCert.content?.studentName || viewCert.student?.user?.name || 'N/A'}
                    </p>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left border border-amber-100 bg-amber-50/30 rounded-xl p-6 mt-4">
                    <CertDetailRow label="Roll Number" value={viewCert.content?.rollNumber || viewCert.student?.rollNumber || 'N/A'} />
                    <CertDetailRow label="Class / Grade" value={viewCert.content?.class
                      ? `${viewCert.content.class.grade} - ${viewCert.content.class.name} (${viewCert.content.class.section})`
                      : viewCert.student?.class
                        ? `${viewCert.student.class.grade} - ${viewCert.student.class.name} (${viewCert.student.class.section})`
                        : 'N/A'} />
                    <CertDetailRow label="Date of Birth" value={formatDate(viewCert.content?.dateOfBirth || viewCert.student?.dateOfBirth)} />
                    <CertDetailRow label="Gender" value={viewCert.content?.gender || viewCert.student?.gender || 'N/A'} />
                    <CertDetailRow label="Parent's Name" value={getParentName(viewCert)} />
                    <CertDetailRow label="Date of Admission" value={formatDate(viewCert.content?.admissionDate || viewCert.student?.admissionDate)} />
                  </div>

                  {/* Narrative Text */}
                  <p className="text-md text-gray-800 leading-[1.8] font-medium mt-6 px-4">
                    {getCertificateBodyText(viewCert.certificateType, viewCert)}
                  </p>

                  {/* Additional Notes / Remarks */}
                  {viewCert.content?.notes && (
                    <div className="mt-6 p-4 border border-dashed border-amber-300 rounded-lg bg-gray-50/50">
                      <p className="text-[10px] uppercase font-bold text-amber-800 mb-1 tracking-wider">OFFICIAL REMARKS</p>
                      <p className="text-sm text-gray-600 italic leading-relaxed">{String(viewCert.content.notes)}</p>
                    </div>
                  )}
                </div>

                {/* Footer Signature Section */}
                <div className="flex justify-between items-end mt-16 pt-8 border-t border-amber-100">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">DATE OF ISSUE</p>
                    <p className="text-md font-bold text-gray-800">{formatDate(viewCert.issueDate)}</p>
                  </div>
                  
                  {/* School Seal Placeholder */}
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-2 border-dashed border-amber-200 flex items-center justify-center opacity-30 rotate-12">
                      <p className="text-[8px] font-bold text-center text-amber-800 leading-tight">OFFICIAL<br/>SCHOOL<br/>SEAL</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-48 border-b-2 border-gray-400 mb-3" />
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">PRINCIPAL</p>
                    <p className="text-[10px] font-bold text-amber-800 mt-0.5 tracking-tighter">SUNRISE ACADEMY, ACADEMIC CITY</p>
                  </div>
                </div>

                {/* Revoked Watermark */}
                {viewCert.status === 'revoked' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.12] z-50">
                    <span className="text-7xl sm:text-9xl font-black text-red-600 rotate-[-25deg] tracking-[0.15em] border-[20px] border-red-600 p-8 rounded-3xl">
                      REVOKED
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Revoke Confirmation Dialog ── */}
      <Dialog open={!!revokeCert} onOpenChange={(open) => { if (!open) setRevokeCert(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldBan className="h-5 w-5" />
              Revoke Certificate
            </DialogTitle>
            <DialogDescription>
              This action will mark the certificate as revoked. The certificate will no longer be considered valid.
            </DialogDescription>
          </DialogHeader>
          {revokeCert && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Certificate: {revokeCert.certificateNo}
                  </span>
                </div>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 pl-6">
                  {CERT_TYPE_LABELS[revokeCert.certificateType]} for{' '}
                  <span className="font-medium">{revokeCert.student?.user?.name}</span>
                </p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 pl-6">
                  Issued on {formatDate(revokeCert.issueDate)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to revoke this certificate? This action can help prevent misuse of invalidated certificates.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeCert(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRevoke}
              disabled={revoking}
            >
              {revoking ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                <>
                  <ShieldBan className="h-4 w-4 mr-2" />
                  Revoke Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ──

function CertDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-[10px] font-bold text-amber-800/70 uppercase tracking-wider leading-none">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 truncate print:text-gray-900 leading-tight">
        {value || 'N/A'}
      </p>
    </div>
  );
}

function getCertificateBodyText(type: string, cert: CertificateRecord): string {
  const studentName = cert.content?.studentName || cert.student?.user?.name || 'the student';
  const className = cert.content?.class
    ? `${cert.content.class.grade} - ${cert.content.class.name} (${cert.content.class.section})`
    : 'the institution';

  switch (type) {
    case 'transfer':
      return `This certificate is issued to certify that ${studentName} has been a bonafide student of class ${className} of this institution. The student is leaving the school and this transfer certificate is issued for admission to another institution.`;
    case 'bonafide':
      return `This is to certify that ${studentName} is a bonafide student of class ${className} of Sunrise Academy. This certificate is issued for the purpose of ${cert.content?.notes ? `"${String(cert.content.notes)}"` : 'official verification'}.`;
    case 'character':
      return `This is to certify that ${studentName} has been a student of this institution in class ${className}. During the student's tenure, they have maintained good conduct, discipline, and character. The student bears a good moral character.`;
    case 'migration':
      return `This migration certificate is issued to facilitate the transfer of ${studentName} from Sunrise Academy to another recognized educational institution. The student has successfully completed the academic requirements of class ${className}.`;
    case 'provisional':
      return `This provisional certificate is issued to ${studentName} pending the issuance of the final certificate. The student has appeared for the qualifying examination from class ${className} of this institution.`;
    default:
      return `This certificate is issued to ${studentName} of class ${className}.`;
  }
}
