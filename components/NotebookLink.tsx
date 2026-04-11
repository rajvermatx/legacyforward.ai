interface NotebookLinkProps {
  url: string;
}

export default function NotebookLink({ url }: NotebookLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-white border border-slate-200 text-navy-900 px-4 py-2 rounded-lg text-sm font-semibold hover:border-teal-500/50 hover:text-teal-600 transition-all"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      Open in Colab
    </a>
  );
}
