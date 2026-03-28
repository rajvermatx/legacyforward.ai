"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded font-semibold text-lg transition-colors"
    >
      Download as PDF
    </button>
  );
}
