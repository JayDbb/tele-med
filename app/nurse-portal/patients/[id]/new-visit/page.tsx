'use client'

import { useParams } from 'next/navigation'
import NurseNewVisitForm from '@/components/NurseNewVisitForm'

export default function NurseNewVisitPage() {
  const params = useParams()
  const patientId = params.id as string

  return <NurseNewVisitForm patientId={patientId} />
}
