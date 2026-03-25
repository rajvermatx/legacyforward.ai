import { redirect } from 'next/navigation';

export default function CeremonyTypeRedirect({ params }: { params: { id: string } }) {
  redirect(`/compass/projects/${params.id}/templates`);
}
