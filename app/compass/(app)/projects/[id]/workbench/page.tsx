import { redirect } from 'next/navigation';

export default function WorkbenchRedirect({ params }: { params: { id: string } }) {
  redirect(`/compass/projects/${params.id}/templates`);
}
