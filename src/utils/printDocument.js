/**
 * Prints the content of a ref via the browser's native print pipeline,
 * inside an isolated hidden iframe with a fixed A4/desktop width.
 *
 * This fixes two problems with the old html-to-image + jsPDF approach:
 * 1. Content no longer gets clipped on small screens, because the iframe
 *    always renders at a fixed 210mm width regardless of the viewport
 *    that triggered it (the modal's mobile layout never gets captured).
 * 2. Output is a real text/vector PDF via "Save as PDF" in the print
 *    dialog, not a rasterized PNG — so file size drops drastically.
 */
export function printDocument(elementRef, { title = "Document", extraStyles = "" } = {}) {
  return new Promise((resolve, reject) => {
    const node = elementRef?.current;
    if (!node) {
      reject(new Error("Nothing to print - ref is empty"));
      return;
    }

    const printContents = node.outerHTML;

    // Carry over every stylesheet the app already has loaded (Bootstrap,
    // template.css, etc.) so the print output matches the on-screen design.
    const styleSheets = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((el) => el.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const cleanup = () => {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 500);
    };

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          ${styleSheets}
          <style>
            @page {
              size: A4;
              margin: 12mm 0mm;
            }
            html, body {
              width: 210mm;
              margin: 0 auto;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .po-container {
              width: 210mm !important;
              max-width: 210mm !important;
              margin: 0 auto !important;
              font-size: 12px;
            }
            table {
              page-break-inside: auto;
              width: 100% !important;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            ${extraStyles}
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    doc.close();

    let printed = false;
    const triggerPrint = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        cleanup();
      }
    };

    // Give images (e.g. the logo) a moment to finish loading before printing.
    const images = doc.images ? Array.from(doc.images) : [];
    if (images.length === 0) {
      setTimeout(triggerPrint, 300);
    } else {
      let loaded = 0;
      const onDone = () => {
        loaded += 1;
        if (loaded >= images.length) triggerPrint();
      };
      images.forEach((img) => {
        if (img.complete) onDone();
        else {
          img.addEventListener("load", onDone);
          img.addEventListener("error", onDone);
        }
      });
      setTimeout(triggerPrint, 1500); // safety net
    }
  });
}