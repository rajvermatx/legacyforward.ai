import { redirect } from 'next/navigation';

export default function CeremoniesRedirect({ params }: { params: { id: string } }) {
  redirect(`/compass/projects/${params.id}/templates`);
}
