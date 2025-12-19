export interface Appointment {
  id: string
  patientName: string
  time: string
  status: 'done' | 'current' | 'upcoming'
}

export interface TimelineEvent {
  id: string
  title: string
  time: string
  status: 'completed' | 'current' | 'upcoming'
}

export interface PatientCondition {
  condition: string
  count: number
  color: string
}

export interface Update {
  id: string
  category: string
  title: string
  description: string
  date: string
  categoryColor: string
}