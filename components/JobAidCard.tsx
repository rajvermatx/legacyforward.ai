import { ClipboardList } from 'lucide-react';

interface JobAidCardProps {
  title: string;
  audience: string;
  description: string;
}

export default function JobAidCard({ title, audience, description }: JobAidCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/15 transition-colors duration-200">
      <ClipboardList className="w-8 h-8 text-gold mb-3" />
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gold font-medium">{audience}</p>
      <p className="mt-2 text-sm text-light">{description}</p>
    </div>
  );
}
