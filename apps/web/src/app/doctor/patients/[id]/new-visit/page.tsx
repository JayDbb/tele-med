import NewVisitForm from '@/components/NewVisitForm'

export default function NewVisitPage({ params }: { params: { id: string } }) {
  return <NewVisitForm patientId={params.id} />
}