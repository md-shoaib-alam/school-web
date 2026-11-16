import type { StudentInfo } from "@/components/screens/admin/students/types";

export interface AdmissionRecord extends StudentInfo {
  parentOccupation?: string | null;
  school: { name: string; slug: string; logo: string | null; address: string | null };
  documents: { name: string; category: string; status: string }[];
}

const dash = (value?: string | null) => value?.trim() || "—";
const titleCase = (value?: string | null) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";
const initials = (name?: string | null) => name?.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "—";

function dateLabel(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function Fields({ values }: { values: [string, string | null | undefined][] }) {
  return <tr>{values.map(([label, value]) => (
    <td key={label} colSpan={values.length === 1 ? 2 : 1}>
      <div className="af-field"><span className="af-label">{label}</span><span className="af-value">{dash(value)}</span></div>
    </td>
  ))}</tr>;
}

function ParentBlock({ role, student }: { role: string; student?: AdmissionRecord }) {
  return (
    <div className="af-parent">
      <div className="af-parent-side"><span>{initials(student?.parentName)}</span></div>
      <table className="af-table af-parent-table"><tbody>
        <Fields values={[[role, student?.parentName]]} />
        <Fields values={[["Occupation", student?.parentOccupation], ["Education", null]]} />
        <Fields values={[["Annual income", null], ["Staff at school", null]]} />
        <Fields values={[["Mobile", student?.parentPhone], ["Alt. mobile", null]]} />
        <Fields values={[["Email", student?.parentEmail], ["Work phone", null]]} />
        <Fields values={[["Work address", null]]} />
      </tbody></table>
    </div>
  );
}

export function AdmissionForm({ student: s, generatedAt }: { student: AdmissionRecord; generatedAt: string }) {
  return (
    <article className="af-sheet" aria-label="Student admission form">
      <header className="af-head">
        <div className="af-logo">
          {s.school.logo ? <img src={s.school.logo} alt="School logo" /> : <span>{initials(s.school.name)}</span>}
        </div>
        <h1>{s.school.name}</h1>
        <p>{dash(s.school.address)}</p>
      </header>
      <h2 className="af-title">Admission Form</h2>
      <div className="af-top">
        <table className="af-table af-identifiers"><tbody>
          <Fields values={[["Admission no.", null], ["Student ID", s.username]]} />
          <Fields values={[["Admission date", dateLabel(s.admissionDate)], ["Session", s.academicYear]]} />
          <Fields values={[["Class & section", s.className], ["Roll no.", s.rollNumber]]} />
          <Fields values={[["Registration no.", null], ["Status", titleCase(s.status)]]} />
        </tbody></table>
        <div className="af-photo">
          {s.avatar ? <img src={s.avatar} alt={`Photo of ${s.name}`} /> : <span>Photo</span>}
        </div>
      </div>
      <h3 className="af-bar">Student Details</h3>
      <table className="af-table"><tbody>
        <Fields values={[["Full name", s.name]]} />
        <Fields values={[["Father's name", s.parentName], ["Mother's name", null]]} />
        <Fields values={[["Date of birth", dateLabel(s.dateOfBirth)], ["Gender", titleCase(s.gender)]]} />
        <Fields values={[["Blood group", s.bloodGroup], ["Religion", s.religion]]} />
        <Fields values={[["Category", s.category?.toUpperCase()], ["Nationality", s.nationality]]} />
        <Fields values={[["Mother tongue", null], ["Guardianship", null]]} />
        <Fields values={[["Aadhaar no.", s.aadhaarNumber], ["APAAR / ABC ID", null]]} />
        <Fields values={[["PEN", null], ["Special category", null]]} />
        <Fields values={[["Mobile", s.phone], ["Email", s.email]]} />
      </tbody></table>
      <h3 className="af-bar">Parent / Guardian Details</h3>
      <ParentBlock role="Father" student={s} />
      <ParentBlock role="Mother" />
      <h3 className="af-bar">Address</h3>
      <table className="af-table"><tbody><Fields values={[["Permanent", s.address]]} /></tbody></table>
      <h3 className="af-bar">Documents Checklist</h3>
      <div className="af-documents">
        {[
          ["Identity proof", "identity"], ["Birth certificate", "birth"], ["Transfer certificate", "transfer"],
        ].map(([label, category]) => {
          const records = s.documents.filter(doc => doc.category === category);
          const verified = records.some(doc => doc.status === "verified");
          return <div key={category}>
            <span className="af-checkbox" aria-hidden="true">{records.length ? "✓" : ""}</span>
            <span>{label}</span>
            <span className="af-tag">{verified ? "Verified" : records.length ? "On record" : "Not uploaded"}</span>
          </div>;
        })}
      </div>
      <h3 className="af-bar">Declaration</h3>
      <p className="af-declaration">I / We hereby declare that the information furnished above is true and correct to the best of my knowledge and belief. I / We have read and agree to abide by the rules and regulations of the school, and understand that any false statement may lead to cancellation of admission.</p>
      <div className="af-signatures">
        <div><strong>Father</strong><small>Signature &amp; Date</small></div>
        <div><strong>Mother</strong><small>Signature &amp; Date</small></div>
        <div><strong>Principal / Authorised Signatory</strong><small>For {s.school.name}</small></div>
        <div><span className="af-seal">School<br />Seal</span></div>
      </div>
      <footer className="af-foot"><span>This is a system-generated admission record.</span><span>Generated on {generatedAt}</span></footer>
    </article>
  );
}
