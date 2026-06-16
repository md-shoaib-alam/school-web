import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PDFExportOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  pageClassName: string;
  filename: string;
  onStart?: () => void;
  onProgress?: (current: number, total: number) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export async function downloadContainerAsPDF({
  containerRef,
  pageClassName,
  filename,
  onStart,
  onProgress,
  onComplete,
  onError,
}: PDFExportOptions) {
  if (!containerRef.current) {
    const err = new Error('Container reference not found');
    onError?.(err);
    return;
  }

  onStart?.();

  // Find page elements in the print container
  const container = containerRef.current;
  const pages = Array.from(container.getElementsByClassName(pageClassName));
  
  if (pages.length === 0) {
    const err = new Error(`No pages found with class name: ${pageClassName}`);
    onError?.(err);
    onComplete?.();
    return;
  }

  // Create temporary offscreen container
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '794px'; // Standard A4 width at 96 DPI
  tempDiv.style.display = 'block';
  tempDiv.style.backgroundColor = '#ffffff';
  document.body.appendChild(tempDiv);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalPages = pages.length;

    for (let i = 0; i < totalPages; i++) {
      onProgress?.(i + 1, totalPages);

      // Clone page element
      const pageEl = pages[i] as HTMLElement;
      const clonedPage = pageEl.cloneNode(true) as HTMLElement;
      
      // Override style overrides that might make it hidden or formatted incorrectly
      clonedPage.style.display = 'block';
      clonedPage.style.width = '794px';
      clonedPage.style.height = '1123px';
      clonedPage.style.boxShadow = 'none';
      clonedPage.style.border = 'none';
      clonedPage.style.margin = '0';
      clonedPage.style.padding = '0';
      clonedPage.classList.remove('hidden');
      
      // If it contains a print class that hides it, override it
      clonedPage.classList.remove('print:block', 'hidden');

      tempDiv.appendChild(clonedPage);

      // Give images/fonts a small moment to render if needed
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(clonedPage, {
        scale: 2, // High resolution (retina) for clear print
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        logging: false,
      });

      // Cleanup cloned page immediately
      tempDiv.removeChild(clonedPage);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (i > 0) {
        pdf.addPage();
      }
      
      // A4 is 210mm x 297mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(filename);
    onComplete?.();
  } catch (error) {
    console.error('PDF export failed:', error);
    onError?.(error);
  } finally {
    if (tempDiv.parentNode) {
      document.body.removeChild(tempDiv);
    }
  }
}
