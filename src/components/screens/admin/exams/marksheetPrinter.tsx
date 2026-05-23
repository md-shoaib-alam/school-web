import React from 'react';
import { createRoot } from "react-dom/client";
import { goeyToast as toast } from "goey-toast";
import { MarksheetPreviewPage } from './MarksheetPreviewPage';

export async function handleMarksheetPreviewNewTab({
  classId,
  classNameStr,
  classSection,
  academicYear,
}: {
  classId: string;
  classNameStr: string;
  classSection: string;
  academicYear: string;
}) {
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    toast.error("Popup blocked! Please allow popups to view the marksheet preview.");
    return;
  }

  // Build standard document structure
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Marksheet Preview - ${classNameStr} (${classSection})</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          margin: 0;
          padding: 1.5rem;
          background-color: #09090b;
          color: #f4f4f5;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
        }
      </style>
    </head>
    <body>
      <div id="preview-root"></div>
    </body>
    </html>
  `);
  previewWindow.document.close();

  // Copy CSS and stylesheets
  // 1. Copy link and style elements
  Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach((styleNode) => {
    previewWindow.document.head.appendChild(styleNode.cloneNode(true));
  });

  // 2. Clone active stylesheets directly
  try {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.href) {
          const link = previewWindow.document.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet.href;
          previewWindow.document.head.appendChild(link);
        } else if (sheet.cssRules) {
          const style = previewWindow.document.createElement('style');
          Array.from(sheet.cssRules).forEach((rule) => {
            style.appendChild(previewWindow.document.createTextNode(rule.cssText));
          });
          previewWindow.document.head.appendChild(style);
        }
      } catch (e) {
        // Ignore cross-origin rules access restrictions
      }
    });
  } catch (e) {
    console.warn("Failed to copy stylesheet rules directly:", e);
  }

  // Mount React Component
  const container = previewWindow.document.getElementById("preview-root");
  if (container) {
    const root = createRoot(container);
    root.render(
      React.createElement(MarksheetPreviewPage, {
        classId,
        classNameStr,
        classSection,
        academicYear,
        onBack: () => previewWindow.close(),
      })
    );
  }
}
