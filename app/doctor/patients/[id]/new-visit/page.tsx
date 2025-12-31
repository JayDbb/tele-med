import DoctorNewVisitForm from '@/components/DoctorNewVisitForm'

export default function NewVisitPage({ params }: { params: { id: string } }) {
  return <DoctorNewVisitForm patientId={params.id} />
}