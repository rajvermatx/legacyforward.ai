"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import CheatsheetPDF from "./CheatsheetPDF";

export default function PDFDownloadButton() {
  return (
    <PDFDownloadLink
      document={<CheatsheetPDF />}
      fileName="LegacyForward-Framework-Cheatsheet.pdf"
      className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded font-semibold text-lg transition-colors inline-block"
    >
      {({ loading }) => (loading ? "Generating PDF\u2026" : "Download PDF")}
    </PDFDownloadLink>
  );
}
