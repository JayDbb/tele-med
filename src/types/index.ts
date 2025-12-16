export interface Patient {
  id: string;
  name: string;
  time: string;
  status: 'done' | 'current' | 'upcoming';
  type: string;
  referral?: string;
  diagnosis?: string;
  symptoms?: string;
  comment?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface PatientCondition {
  condition: string;
  count: number;
  color: string;
}

export interface Update {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string;
  categoryColor: string;
}

export interface User {
  name: string;
  role: string;
  avatar: string;
}