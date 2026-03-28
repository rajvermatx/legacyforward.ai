import { MDXRemote } from "next-mdx-remote/rsc";

interface ProseProps {
  content: string;
}

export default function Prose({ content }: ProseProps) {
  return (
    <div className="prose prose-slate prose-lg max-w-none prose-headings:text-navy-900 prose-headings:font-bold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-navy-900 prose-table:text-sm">
      <MDXRemote source={content} />
    </div>
  );
}
