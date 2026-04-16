'use client';

import { GraduationCap } from 'lucide-react';

interface CertificateTemplateProps {
  cert: any;
  formatDate: (d: string) => string;
}

export function CertificateTemplate({ cert, formatDate }: CertificateTemplateProps) {
  if (!cert) return null;

  const getParentName = () => cert.content?.parentName || 'N/A';

  const getBodyText = () => {
    const studentName = cert.content?.studentName || cert.student?.user?.name || 'the student';
    const className = cert.content?.class
      ? `${cert.content.class.grade} - ${cert.content.class.name} (${cert.content.class.section})`
      : 'the institution';

    switch (cert.certificateType) {
      case 'transfer': return `This certificate is issued to certify that ${studentName} has been a bonafide student of class ${className} of this institution. The student is leaving the school and this transfer certificate is issued for admission to another institution.`;
      case 'bonafide': return `This is to certify that ${studentName} is a bonafide student of class ${className} of Sunrise Academy. This certificate is issued for the purpose of ${cert.content?.notes ? `"${String(cert.content.notes)}"` : 'official verification'}.`;
      case 'character': return `This is to certify that ${studentName} has been a student of this institution in class ${className}. During the student's tenure, they have maintained good conduct, discipline, and character. The student bears a good moral character.`;
      case 'migration': return `This migration certificate is issued to facilitate the transfer of ${studentName} from Sunrise Academy to another recognized educational institution. The student has successfully completed the academic requirements of class ${className}.`;
      case 'provisional': return `This provisional certificate is issued to ${studentName} pending the issuance of the final certificate. The student has appeared for the qualifying examination from class ${className} of this institution.`;
      default: return `This certificate is issued to ${studentName} of class ${className}.`;
    }
  };

  return (
    <div className="print-container bg-white">
      <div className="relative cert-frame flex flex-col border-4 border-double border-amber-800 rounded-lg p-8 sm:p-12 bg-white mx-auto dark:bg-white dark:text-gray-900 min-h-[250mm]">
        
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
            <h2 className="text-3xl font-extrabold text-amber-900 tracking-tight uppercase font-serif">Sunrise Academy</h2>
            <p className="text-sm font-medium text-gray-700 italic">Affiliated to Central Board of Secondary Education (CBSE)</p>
            <p className="text-xs text-gray-600">123 Education Lane, Academic City — PIN: 560001</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-32 h-[1px] bg-amber-800" />
            <div className="h-2 w-2 rotate-45 bg-amber-800" />
            <div className="w-32 h-[1px] bg-amber-800" />
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-10">
          <h3 className="text-4xl font-bold text-amber-800 uppercase tracking-[0.2em] mb-2 drop-shadow-sm">
            {(cert.certificateType || '').toUpperCase().split(' ')[0]}
          </h3>
          <h4 className="text-xl font-semibold text-amber-700 uppercase tracking-widest mb-3">CERTIFICATE</h4>
          <p className="text-xs text-gray-500 font-mono">CERTIFICATE NO: <span className="font-bold text-gray-800">{cert.certificateNo}</span></p>
        </div>

        {/* Body */}
        <div className="space-y-8 max-w-2xl mx-auto text-center flex-1">
          <p className="text-lg text-gray-700 italic leading-relaxed">This is to certify that</p>
          <div className="relative py-2 px-4 inline-block mx-auto min-w-[300px] border-b-2 border-amber-800/30">
            <p className="text-3xl font-bold text-gray-900 uppercase tracking-wider font-serif">
              {cert.content?.studentName || cert.student?.user?.name || 'N/A'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left border border-amber-100 bg-amber-50/30 rounded-xl p-6 mt-4">
            <DetailRow label="Roll Number" value={cert.content?.rollNumber || cert.student?.rollNumber || 'N/A'} />
            <DetailRow label="Class / Grade" value={cert.content?.class ? `${cert.content.class.grade} - ${cert.content.class.name}` : 'N/A'} />
            <DetailRow label="Date of Birth" value={formatDate(cert.content?.dateOfBirth || '')} />
            <DetailRow label="Gender" value={cert.content?.gender || 'N/A'} />
            <DetailRow label="Parent's Name" value={getParentName()} />
            <DetailRow label="Admission Date" value={formatDate(cert.content?.admissionDate || '')} />
          </div>

          <p className="text-md text-gray-800 leading-[1.8] font-medium mt-6 px-4">{getBodyText()}</p>
          
          {cert.content?.notes && (
            <div className="mt-6 p-4 border border-dashed border-amber-300 rounded-lg bg-gray-50/50">
              <p className="text-[10px] uppercase font-bold text-amber-800 mb-1 tracking-wider">REMARKS</p>
              <p className="text-sm text-gray-600 italic">{String(cert.content.notes)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-auto pt-6 border-t border-amber-100">
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">DATE OF ISSUE</p>
            <p className="text-sm font-bold text-gray-800">{formatDate(cert.issueDate)}</p>
          </div>
          <div className="h-16 w-16 rounded-full border border-dashed border-amber-200 flex items-center justify-center opacity-30">
            <p className="text-[8px] font-bold text-center">OFFICIAL<br/>SEAL</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b-2 border-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">PRINCIPAL</p>
          </div>
        </div>

        {cert.status === 'revoked' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-50">
            <span className="text-9xl font-black text-red-600 rotate-[-25deg] border-[20px] border-red-600 p-8 rounded-3xl">REVOKED</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-bold text-amber-800/70 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-900 truncate">{value || 'N/A'}</p>
    </div>
  );
}
