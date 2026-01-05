import NewVisitForm from '@/components/NewVisitForm'

export default async function NewVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewVisitForm patientId={id} />
}