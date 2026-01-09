import NurseNewVisitForm from '@/components/NurseNewVisitForm'

export default async function NewVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NurseNewVisitForm patientId={id} />
}
