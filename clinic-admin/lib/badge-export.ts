import QRCode from "qrcode";
import { jsPDF } from "jspdf";

function badgePayload(clinicianName: string, badgeId?: string) {
  return badgeId ?? `clinic-admin:badge:${clinicianName}`;
}

function printHtml(qrDataUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Clinician Badge QR</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fff;
    }
    img { width: 240px; height: 240px; }
    @media print {
      body { min-height: auto; padding: 24px; }
    }
  </style>
</head>
<body>
  <img src="${qrDataUrl}" alt="QR code" />
  <script>
    window.onload = function () {
      window.focus();
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;
}

export async function printBadge(clinicianName: string, badgeId?: string) {
  const qrDataUrl = await QRCode.toDataURL(badgePayload(clinicianName, badgeId), {
    width: 480,
    margin: 2,
    color: { dark: "#1c1b1b", light: "#ffffff" },
  });

  const printWindow = window.open("", "_blank", "width=360,height=360");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(printHtml(qrDataUrl));
  printWindow.document.close();
}

export async function downloadBadgePdf(clinicianName: string, badgeId?: string) {
  const qrDataUrl = await QRCode.toDataURL(badgePayload(clinicianName, badgeId), {
    width: 512,
    margin: 2,
    color: { dark: "#1c1b1b", light: "#ffffff" },
  });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a6" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const qrSize = 80;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = (pageHeight - qrSize) / 2;

  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  const filename = `${clinicianName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_qr.pdf`;
  doc.save(filename);
}
