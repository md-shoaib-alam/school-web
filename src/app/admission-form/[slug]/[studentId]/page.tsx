"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, Printer } from "lucide-react";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { AdmissionForm, type AdmissionRecord } from "./admission-form";
import "./admission-form.css";

export default function AdmissionFormPage() {
  const { slug, studentId } = useParams<{ slug: string; studentId: string }>();
  const searchParams = useSearchParams();
  const autoDownload = searchParams.get("download") === "1";
  const paperRef = useRef<HTMLDivElement>(null);
  const autoDownloadedRef = useRef(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatedAt] = useState(() => new Date().toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }));
  const { data: student, isPending, error, refetch } = useQuery<AdmissionRecord>({
    queryKey: ["admission-form", slug, studentId],
    queryFn: async () => {
      const res = await apiFetch(`/api/students/${encodeURIComponent(studentId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Sign in to the school that owns this student record, then try again.");
      const record: AdmissionRecord = await res.json();
      if (record.school?.slug !== slug) throw new Error("This student record is not available for the selected school.");
      return record;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    setAssetsReady(false);
    document.title = `Admission-Form-${student.username || student.rollNumber || "Student"}`.replace(/[/\\?%*:|"<>]/g, "-");
    const images = Array.from(paperRef.current?.querySelectorAll("img") ?? []);
    Promise.all([
      document.fonts.ready,
      ...images.map(image => image.decode().catch(() => undefined)),
    ]).then(() => { if (!cancelled) setAssetsReady(true); });
    return () => { cancelled = true; };
  }, [student]);

  const handleDownload = async () => {
    const sheet = paperRef.current?.querySelector<HTMLElement>(".af-sheet");
    if (!sheet || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(sheet, { quality: 0.95, pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageW = 210, pageH = 297, margin = 8;
      const maxW = pageW - margin * 2, maxH = pageH - margin * 2;
      const ratio = img.width / img.height;
      let w = maxW, h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      pdf.addImage(dataUrl, "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h);
      pdf.save(`Admission-Form-${student?.username || student?.rollNumber || "Student"}.pdf`);
      toast.success("Admission form downloaded");
      try {
        window.parent?.postMessage({ type: "ADMISSION_FORM_DOWNLOAD_COMPLETE", success: true }, "*");
      } catch {}
    } catch {
      toast.error("Could not generate the PDF. Use Print / Save as PDF instead.");
      try {
        window.parent?.postMessage({ type: "ADMISSION_FORM_DOWNLOAD_COMPLETE", success: false }, "*");
      } catch {}
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (autoDownload && assetsReady && student && !autoDownloadedRef.current) {
      autoDownloadedRef.current = true;
      handleDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, assetsReady, student]);

  return (
    <main className="admission-view">
      {isPending ? (
        <div className="admission-state" role="status">Loading admission form…</div>
      ) : error || !student ? (
        <div className="admission-state" role="alert">
          <h1>Admission form unavailable</h1>
          <p>{error?.message || "The student record could not be loaded."}</p>
          <div className="admission-toolbar" style={{ justifyContent: "center", marginTop: 16 }}>
            <button type="button" onClick={() => refetch()}>Try again</button>
          </div>
        </div>
      ) : (
        <>
          <div className="admission-toolbar">
            <p>A4 admission form · Print, or download a PDF directly.</p>
            <div className="admission-actions">
              <button type="button" onClick={() => window.print()} disabled={!assetsReady}>
                <Printer size={16} aria-hidden="true" />
                {assetsReady ? "Print / Save as PDF" : "Preparing fonts and photo…"}
              </button>
              <button
                type="button"
                className="admission-download"
                onClick={handleDownload}
                disabled={!assetsReady || downloading}
                aria-label="Download PDF"
                title="Download PDF"
              >
                {downloading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div className="admission-scroll">
            <div className="admission-paper" ref={paperRef}>
              <AdmissionForm student={student} generatedAt={generatedAt} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
