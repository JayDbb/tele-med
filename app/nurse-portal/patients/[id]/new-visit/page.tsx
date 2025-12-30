import NurseNewVisitForm from '@/components/NurseNewVisitForm'

export default function NurseNewVisitPage({ params }: { params: { id: string } }) {
  return <NurseNewVisitForm patientId={params.id} />
}