"use client";

import dynamic from "next/dynamic";

const PDFDownloadButton = dynamic(() => import("./PDFDownloadButton"), {
  ssr: false,
  loading: () => (
    <span className="bg-teal-500 text-white px-8 py-3 rounded font-semibold text-lg opacity-60">
      Preparing PDF&hellip;
    </span>
  ),
});

export default function PrintButton() {
  return <PDFDownloadButton />;
}
