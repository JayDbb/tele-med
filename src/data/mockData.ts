import { Patient, TimelineEvent, PatientCondition, Update, User } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Martin Coblen',
    time: '08:00',
    status: 'done',
    type: 'Consultation',
    referral: 'Dr. Sarah Johnson',
    diagnosis: 'Routine checkup',
    symptoms: 'None',
    comment: 'Patient in good health.',
    currentIssue: 'Hypertension',
    currentMedication: 'Lisinopril 10mg',
    email: 'martin.coblen@example.com',
    gender: 'Male',
    age: 24,
    lastConsultation: 'May 12, 2019'
  },
  {
    id: '2',
    name: 'Katie-Mary Tannebe',
    time: '08:30',
    status: 'done',
    type: 'Follow-up',
    referral: 'Dr. Michael Brown',
    diagnosis: 'Hypertension monitoring',
    symptoms: 'Mild headaches',
    comment: 'Blood pressure stable.',
    currentIssue: 'Diabetes Type 2',
    currentMedication: 'Metformin 500mg',
    email: 'katie.tannebe@example.com',
    gender: 'Female',
    age: 28,
    lastConsultation: 'May 15, 2019'
  },
  {
    id: '3',
    name: 'Amanda Kimber',
    time: '09:00',
    status: 'current',
    type: 'Consultation',
    referral: 'Dr. Helen Miller',
    diagnosis: 'Post-operative checkup',
    symptoms: 'Mild pain, swelling',
    comment: 'Patient recovering well.',
    currentIssue: 'Post-surgical recovery',
    currentMedication: 'Ibuprofen 400mg',
    email: 'amanda.kimber@example.com',
    gender: 'Female',
    age: 31,
    lastConsultation: 'May 10, 2019'
  },
  {
    id: '4',
    name: 'Robert Mirro',
    time: '09:30',
    status: 'upcoming',
    type: 'Surgery consultation',
    referral: 'Dr. Ilya',
    diagnosis: 'Appendicitis evaluation',
    symptoms: 'Abdominal pain',
    comment: 'Requires immediate attention.',
    currentIssue: 'Acute appendicitis',
    currentMedication: 'Morphine 5mg PRN',
    email: 'robert.mirro@example.com',
    gender: 'Male',
    age: 35,
    lastConsultation: 'May 8, 2019'
  },
  {
    id: '5',
    name: 'Chester Bennington',
    time: '10:00',
    status: 'upcoming',
    type: 'Consultation',
    referral: 'Dr. Lisa Wang',
    diagnosis: 'Cardiac evaluation',
    symptoms: 'Chest pain, shortness of breath',
    comment: 'Scheduled for ECG.',
    currentIssue: 'Chest pain investigation',
    currentMedication: 'Aspirin 81mg daily',
    email: 'chester.bennington@example.com',
    gender: 'Male',
    age: 42,
    lastConsultation: 'May 5, 2019'
  }
];

export const mockTimeline: TimelineEvent[] = [
  {
    id: '1',
    title: 'Brief & Patient rounds',
    time: '08:00',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Consultations',
    time: '09:00 - 11:00',
    status: 'current'
  },
  {
    id: '3',
    title: 'Surgeries',
    time: '11:00 - 13:00',
    status: 'upcoming'
  },
  {
    id: '4',
    title: 'ER shift',
    time: '14:00',
    status: 'upcoming'
  }
];

export const mockPatientConditions: PatientCondition[] = [
  { condition: 'Stable', count: 85, color: 'bg-green-400' },
  { condition: 'Fair', count: 43, color: 'bg-yellow-400' },
  { condition: 'Serious', count: 14, color: 'bg-red-400' },
  { condition: 'Critical', count: 0, color: 'bg-blue-200 dark:bg-blue-800' }
];

export const mockUpdates: Update[] = [
  {
    id: '1',
    category: 'Clinic',
    title: 'New Sterilization Protocols',
    description: 'Updated guidelines for equipment sterilization are now in effect. Please review the documentation.',
    date: 'Oct 4',
    categoryColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50'
  },
  {
    id: '2',
    category: 'Ministry of Health',
    title: 'Annual Flu Vaccination Drive',
    description: 'The national vaccination campaign begins next week. All staff are encouraged to participate.',
    date: 'Oct 2',
    categoryColor: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50'
  }
];

export const mockUser: User = {
  name: 'Dr. Ilya',
  role: 'Surgeon',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBevzzTiuFvj77hHgIQO-zsMGw3JH6wML3gRur0C6z0xrjqm75RCjxpea_yuq9YxdfbrSCVugctD9ckg66H_Es4AnRjNeKVKJN-3hhwq3uoZVX4xXctMFHvTAZDBz3PUNqzdAGDvX-raEXyNcmiBKZItUurchM50ZCy5v92O7NEIIYv1seAmACOaiGlWAfwACk8nZhn6Wvww3wdpeK0QrFBb8yGpQA7M9plB7puFkf9xxic63ekREoqqelmGMm-v3TzjOMdbL4291I'
};