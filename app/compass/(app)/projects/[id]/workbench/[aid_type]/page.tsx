import { redirect } from 'next/navigation';

export default function AidTypeRedirect({ params }: { params: { id: string } }) {
  redirect(`/compass/projects/${params.id}/templates`);
}
