import { toJpeg } from 'html-to-image';
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
  Object.assign(tempDiv.style, {
    position: 'absolute',
    left: '-9999px',
    top: '0',
    width: '794px',
    display: 'block',
    backgroundColor: '#ffffff',
  });
  document.body.appendChild(tempDiv);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const totalPages = pages.length;
    const batchSize = 2;
    
    for (let i = 0; i < totalPages; i += batchSize) {
      const currentBatch = pages.slice(i, i + batchSize);
      
      const imageDataBatch = await Promise.all(currentBatch.map(async (pageEl, index) => {
        const pageIdx = i + index;
        onProgress?.(pageIdx + 1, totalPages);

        const clonedPage = pageEl.cloneNode(true) as HTMLElement;
        Object.assign(clonedPage.style, {
          display: 'block',
          width: '794px',
          height: '1123px',
          boxShadow: 'none',
          border: 'none',
          margin: '0',
          padding: '0',
        });
        clonedPage.classList.remove('hidden', 'print:block', 'print:hidden');
        
        tempDiv.appendChild(clonedPage);

        // html-to-image is much faster and doesn't need long timeouts
        await new Promise(r => setTimeout(r, 50));

        // Use toJpeg from html-to-image for high speed + high quality
        const dataUrl = await toJpeg(clonedPage, {
          quality: 0.95,
          pixelRatio: 2, // Sharpness equivalent to Retina display
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          cacheBust: true,
        });

        tempDiv.removeChild(clonedPage);
        return dataUrl;
      }));

      imageDataBatch.forEach((imgData, index) => {
        const pageIdx = i + index;
        if (pageIdx > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      });
    }

    pdf.save(filename);
    onComplete?.();
  } catch (error) {
    console.error('PDF export failed:', error);
    onError?.(error);
  } finally {
    if (tempDiv.parentNode) document.body.removeChild(tempDiv);
  }
}
