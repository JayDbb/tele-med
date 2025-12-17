import React, { useState } from 'react';
import { Patient } from '../types';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onVideoCall?: () => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onVideoCall }) => {
  const [activeSection, setActiveSection] = useState('vitals');
  const [activeTab, setActiveTab] = useState('general');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

  const medicalData = {
    vitals: [
      { date: '2024-01-15', bp: '120/80', pulse: 72, temp: '98.6°F', weight: '165 lbs', height: '5\'8"' },
      { date: '2024-01-08', bp: '125/82', pulse: 75, temp: '98.4°F', weight: '167 lbs', height: '5\'8"' }
    ],
    allergies: [
      { allergen: 'Penicillin', reaction: 'Rash', severity: 'Moderate', date: '2020-03-15' },
      { allergen: 'Shellfish', reaction: 'Anaphylaxis', severity: 'Severe', date: '2018-07-22' }
    ],
    vaccines: [
      { vaccine: 'COVID-19 Booster', date: '2023-10-15', lot: 'ABC123' },
      { vaccine: 'Flu Shot', date: '2023-09-20', lot: 'FLU456' },
      { vaccine: 'Tdap', date: '2022-05-10', lot: 'TDP789' }
    ],
    problems: [
      { problem: 'Hypertension', status: 'Active', onset: '2020-01-15', icd10: 'I10' },
      { problem: 'Type 2 Diabetes', status: 'Active', onset: '2019-06-20', icd10: 'E11.9' },
      { problem: 'Anxiety', status: 'Resolved', onset: '2021-03-10', icd10: 'F41.9' }
    ],
    familyHistory: [
      { relation: 'Father', condition: 'Heart Disease', ageOfOnset: '65', status: 'Deceased' },
      { relation: 'Mother', condition: 'Diabetes', ageOfOnset: '58', status: 'Living' },
      { relation: 'Sister', condition: 'Breast Cancer', ageOfOnset: '45', status: 'Living' }
    ],
    socialHistory: {
      smoking: 'Never smoker',
      alcohol: 'Occasional (1-2 drinks/week)',
      drugs: 'None',
      occupation: 'Teacher',
      maritalStatus: 'Married',
      exercise: '3x per week'
    },
    surgicalHistory: [
      { procedure: 'Appendectomy', date: '2015-08-12', surgeon: 'Dr. Johnson', complications: 'None' },
      { procedure: 'Gallbladder Removal', date: '2018-03-22', surgeon: 'Dr. Smith', complications: 'Minor bleeding' }
    ],
    pastMedicalHistory: [
      { condition: 'Pneumonia', date: '2019-12-15', resolved: true },
      { condition: 'Broken Arm', date: '2016-07-08', resolved: true },
      { condition: 'Migraine Headaches', date: '2020-ongoing', resolved: false }
    ],
    screening: [
      { test: 'Mammogram', date: '2023-11-15', result: 'Normal', nextDue: '2024-11-15' },
      { test: 'Colonoscopy', date: '2022-06-10', result: 'Normal', nextDue: '2032-06-10' },
      { test: 'Pap Smear', date: '2023-08-20', result: 'Normal', nextDue: '2026-08-20' }
    ],
    qualityMeasures: [
      { measure: 'Blood Pressure Control', status: 'Met', lastCheck: '2024-01-15' },
      { measure: 'Diabetes HbA1c < 7%', status: 'Met', lastCheck: '2024-01-10' },
      { measure: 'Cholesterol Screening', status: 'Due', lastCheck: '2023-01-15' },
      { measure: 'Mammography Screening', status: 'Met', lastCheck: '2023-11-15' }
    ],
    historyOfPresentIllness: {
      chiefComplaint: 'Follow-up for diabetes and hypertension',
      historyOfPresentIllness: 'Patient reports good adherence to medications. Blood sugars have been well controlled with readings between 90-130 mg/dL. No episodes of hypoglycemia. Blood pressure has been stable. Patient denies chest pain, shortness of breath, or palpitations.',
      reviewOfSystems: 'Negative for fever, chills, weight loss, chest pain, shortness of breath, abdominal pain, nausea, vomiting, or urinary symptoms.'
    },
    ordersAndResults: [
      { type: 'Lab', order: 'HbA1c', date: '2024-01-10', result: '6.8%', status: 'Complete' },
      { type: 'Lab', order: 'Lipid Panel', date: '2024-01-10', result: 'Pending', status: 'Pending' },
      { type: 'Imaging', order: 'Chest X-ray', date: '2024-01-15', result: 'Normal', status: 'Complete' }
    ]
  };

  const patientVisits = [
    {
      id: '1',
      date: '2024-01-15',
      time: '09:00 AM',
      type: 'Follow-up',
      physician: 'Dr. Ilya',
      diagnosis: 'Hypertension monitoring',
      notes: 'Blood pressure stable. Continue current medication.',
      vitals: { bp: '130/80', pulse: '72', temp: '98.6°F', weight: '185 lbs' },
      medications: ['Lisinopril 10mg daily', 'Aspirin 81mg daily'],
      procedures: ['Blood pressure check', 'Routine examination'],
      labResults: ['Cholesterol: Normal', 'Blood glucose: 95 mg/dL'],
      calls: [{ date: '2024-01-16', time: '2:30 PM', summary: 'Patient called about mild dizziness. Advised to monitor BP and reduce salt intake.' }]
    },
    {
      id: '2', 
      date: '2023-12-10',
      time: '02:30 PM',
      type: 'Routine Checkup',
      physician: 'Dr. Ilya',
      diagnosis: 'Annual physical exam',
      notes: 'Patient in good health. Recommended lifestyle changes.',
      vitals: { bp: '128/78', pulse: '68', temp: '98.4°F', weight: '188 lbs' },
      medications: ['Lisinopril 10mg daily'],
      procedures: ['Complete physical exam', 'EKG'],
      labResults: ['CBC: Normal', 'Lipid panel: Borderline high'],
      calls: []
    },
    {
      id: '3',
      date: '2023-09-22',
      time: '11:15 AM', 
      type: 'Consultation',
      physician: 'Dr. Ilya',
      diagnosis: 'Initial hypertension diagnosis',
      notes: 'Started on Lisinopril 10mg daily. Follow up in 3 months.',
      vitals: { bp: '145/92', pulse: '75', temp: '98.8°F', weight: '190 lbs' },
      medications: ['Lisinopril 10mg daily (newly prescribed)'],
      procedures: ['Blood pressure monitoring', 'Cardiovascular assessment'],
      labResults: ['Basic metabolic panel: Normal'],
      calls: [{ date: '2023-09-25', time: '10:15 AM', summary: 'Patient called with questions about new medication side effects. Reassured about normal adjustment period.' }]
    }
  ];

  const sidebarSections = [
    { id: 'vitals', name: 'Vitals', completed: true },
    { id: 'allergies', name: 'Allergies', completed: true },
    { id: 'medications', name: 'Medications', completed: true },
    { id: 'vaccines', name: 'Vaccines', completed: true },
    { id: 'problems', name: 'Problems', completed: true },
    { id: 'family-history', name: 'Family History', completed: true },
    { id: 'social-history', name: 'Social History', completed: true },
    { id: 'surgical-history', name: 'Surgical History', completed: false },
    { id: 'medical-history', name: 'Past Medical History', completed: false },
    { id: 'screening', name: 'Screening', completed: false },
    { id: 'quality-measures', name: 'Quality Measures (14)', completed: false },
    { id: 'present-illness', name: 'History of Present Illness', completed: false },
    { id: 'review-systems', name: 'Review of Systems', completed: false },
    { id: 'orders-results', name: 'Orders and Results', completed: false }
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Medical Sidebar */}
      <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-y-auto">
        <div className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
          Follow-up
        </div>
        <nav className="flex-1 space-y-0.5 text-sm">
          {sidebarSections.map((section) => (
            <button
              key={section.id}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-white dark:bg-gray-700 border-l-4 border-teal-500 text-teal-700 dark:text-teal-400 font-medium shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className={`material-symbols-outlined text-lg ${
                section.completed ? 'text-teal-600 dark:text-teal-500' : 'text-gray-400'
              }`}>
                {section.completed ? 'check_circle_outline' : 'radio_button_unchecked'}
              </span>
              {section.name}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {activeSection === 'vitals' && (
              <div className="space-y-4">
                {medicalData.vitals.map((vital, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">{vital.date}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-600 dark:text-gray-400">BP:</span> <span className="ml-1 font-medium">{vital.bp}</span></div>
                      <div><span className="text-gray-600 dark:text-gray-400">Pulse:</span> <span className="ml-1 font-medium">{vital.pulse}</span></div>
                      <div><span className="text-gray-600 dark:text-gray-400">Temp:</span> <span className="ml-1 font-medium">{vital.temp}</span></div>
                      <div><span className="text-gray-600 dark:text-gray-400">Weight:</span> <span className="ml-1 font-medium">{vital.weight}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'allergies' && (
              <div className="space-y-2">
                {medicalData.allergies.map((allergy, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded-lg">
                    <div className="font-medium text-red-900 dark:text-red-200 text-sm">{allergy.allergen}</div>
                    <div className="text-xs text-red-700 dark:text-red-300">{allergy.reaction} - {allergy.severity}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'medications' && (
              <div className="space-y-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2 rounded-lg">
                  <div className="font-medium text-blue-900 dark:text-blue-200 text-sm">Lisinopril</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">10mg daily - Active</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2 rounded-lg">
                  <div className="font-medium text-blue-900 dark:text-blue-200 text-sm">Aspirin</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">81mg daily - Active</div>
                </div>
              </div>
            )}

            {activeSection === 'vaccines' && (
              <div className="space-y-2">
                {medicalData.vaccines.map((vaccine, index) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-2 rounded-lg">
                    <div className="font-medium text-green-900 dark:text-green-200 text-sm">{vaccine.vaccine}</div>
                    <div className="text-xs text-green-700 dark:text-green-300">{vaccine.date}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'problems' && (
              <div className="space-y-2">
                {medicalData.problems.map((problem, index) => (
                  <div key={index} className={`p-2 rounded-lg border text-sm ${
                    problem.status === 'Active' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="font-medium">{problem.problem}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{problem.status}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'family-history' && (
              <div className="space-y-2">
                {medicalData.familyHistory.map((history, index) => (
                  <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2 rounded-lg">
                    <div className="font-medium text-blue-900 dark:text-blue-200 text-sm">{history.relation}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">{history.condition}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'social-history' && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2 text-xs">
                <div><span className="font-medium">Smoking:</span> {medicalData.socialHistory.smoking}</div>
                <div><span className="font-medium">Alcohol:</span> {medicalData.socialHistory.alcohol}</div>
                <div><span className="font-medium">Exercise:</span> {medicalData.socialHistory.exercise}</div>
              </div>
            )}

            {activeSection === 'surgical-history' && (
              <div className="space-y-2">
                {medicalData.surgicalHistory.map((surgery, index) => (
                  <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-2 rounded-lg">
                    <div className="font-medium text-purple-900 dark:text-purple-200 text-sm">{surgery.procedure}</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">{surgery.date}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'medical-history' && (
              <div className="space-y-2">
                {medicalData.pastMedicalHistory.map((history, index) => (
                  <div key={index} className={`p-2 rounded-lg border text-sm ${
                    history.resolved ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  }`}>
                    <div className="font-medium">{history.condition}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{history.resolved ? 'Resolved' : 'Ongoing'}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'screening' && (
              <div className="space-y-2">
                {medicalData.screening.map((screen, index) => (
                  <div key={index} className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-2 rounded-lg">
                    <div className="font-medium text-teal-900 dark:text-teal-200 text-sm">{screen.test}</div>
                    <div className="text-xs text-teal-700 dark:text-teal-300">{screen.result}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'quality-measures' && (
              <div className="space-y-2">
                {medicalData.qualityMeasures.slice(0, 3).map((measure, index) => (
                  <div key={index} className={`p-2 rounded-lg border text-sm ${
                    measure.status === 'Met' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="font-medium text-xs">{measure.measure}</div>
                    <div className={`text-xs ${
                      measure.status === 'Met' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>{measure.status}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'present-illness' && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Chief Complaint</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">{medicalData.historyOfPresentIllness.chiefComplaint}</p>
              </div>
            )}

            {activeSection === 'review-systems' && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Review of Systems</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">{medicalData.historyOfPresentIllness.reviewOfSystems}</p>
              </div>
            )}

            {activeSection === 'orders-results' && (
              <div className="space-y-2">
                {medicalData.ordersAndResults.map((order, index) => (
                  <div key={index} className={`p-2 rounded-lg border text-sm ${
                    order.status === 'Complete' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div className="font-medium text-xs">{order.order}</div>
                    <div className={`text-xs ${
                      order.status === 'Complete' ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
                    }`}>{order.result}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 pt-20 lg:pt-8 p-4 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Patient Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-yellow-400 text-black font-medium text-sm rounded-full shadow-sm hover:opacity-90 transition-opacity">Scan ID</button>
          <button className="px-4 py-2 bg-yellow-400 text-black font-medium text-sm rounded-full shadow-sm hover:opacity-90 transition-opacity">Register visit</button>
          <button className="p-2 bg-yellow-400 text-black rounded-full shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">more_horiz</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-1/4 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <div className="mb-4 relative">
              <img 
                alt={`Profile Picture of ${patient.name}`}
                className="w-24 h-24 rounded-xl object-cover shadow-sm mx-auto sm:mx-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJxu4YqFGEFoBJlL3wcHcoeT4tB3tNqNlCThxcz5LUjyu-3zHN3qMbKEZMJBqbR-OvJm29MMOLEj-wwXCTptCJKmk8Kym3zYvpGbGUJhtNkwQQMnwznEZF7ZAPzKbvSdBLCNabjmQeaJ1kCbxDsE0XS5DxjQFoGbE2_0aZaRbvo2jg1t6lSsuY8HaPMVjW3flNhlI8LpxzMDV1V1nhDyGGu0kIyB5IrfqoOOmHhpp24WpiKJyrZkUcchau2Ce5TUm5y0l1slzZ2o5H"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{patient.name}</h2>
            <p className="text-green-500 text-sm font-medium mb-4">Active</p>
            <div className="flex gap-2 mb-4 flex-wrap">
              <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                <span className="material-symbols-outlined text-[12px] mr-1">call</span> Phone
              </button>
              <button 
                className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition"
                onClick={() => onVideoCall && onVideoCall()}
              >
                <span className="material-symbols-outlined text-[12px] mr-1">videocam</span> Video Call
              </button>
              <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                <span className="material-symbols-outlined text-[12px] mr-1">monitor_heart</span> Live Vital
              </button>
              <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                <span className="material-symbols-outlined text-[12px] mr-1">email</span> Email
              </button>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Gender</span>
              <span className="font-medium text-right">{patient.gender || 'Male'}</span>
              <span className="text-gray-500 dark:text-gray-400">Age</span>
              <span className="font-medium text-right">{patient.age || 24}</span>
              <span className="text-gray-500 dark:text-gray-400">Language</span>
              <span className="font-medium text-right">English</span>
              <span className="text-gray-500 dark:text-gray-400">Height</span>
              <span className="font-medium text-right">5' 20''</span>
            </div>
            <div className="mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Tags</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md">#young</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md">#male</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md">#allergies</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">+12</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Allergies</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-800 dark:text-white font-medium">Penicillin</span>
                <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs font-medium">High</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-800 dark:text-white font-medium">Tilorone</span>
                <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs font-medium">Medium</span>
              </div>
            </div>
            <button className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-yellow-400 transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
              Add allergy
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Notes</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {patient.symptoms || 'No current symptoms reported'}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-2 shadow-sm flex items-center gap-1 overflow-x-auto">
            <button 
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg ${
                activeTab === 'general' 
                  ? 'text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg ${
                activeTab === 'visits' 
                  ? 'text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('visits')}
            >
              Visits
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg ${
                activeTab === 'orders' 
                  ? 'text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>

            <button 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg ${
                activeTab === 'messages' 
                  ? 'text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>

          {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last name</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{patient.name.split(' ')[1] || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First name</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{patient.name.split(' ')[0]}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Salutation</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">—</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Birthdate</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">03/03/1995</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">83 Mile Drive, Los Angeles, CA</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone number</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">289-367-2697</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{patient.email || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Current Treatment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Current Issue</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{patient.currentIssue || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Current Medication</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{patient.currentMedication || 'None'}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Physician</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{patient.referral || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Consultation</label>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{patient.lastConsultation || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Health Trends & Analysis</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Latest: {patientVisits[0]?.type}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{patientVisits[0]?.date} - {patientVisits[0]?.physician}</p>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                    AI Analysis
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">BP:</span>
                    <span className="ml-1 font-medium text-gray-800 dark:text-white">{patientVisits[0]?.vitals.bp}</span>
                    <span className="material-symbols-outlined text-green-500 text-xs">trending_down</span>
                    <span className="text-green-600 text-xs">↓15</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Pulse:</span>
                    <span className="ml-1 font-medium text-gray-800 dark:text-white">{patientVisits[0]?.vitals.pulse} bpm</span>
                    <span className="material-symbols-outlined text-green-500 text-xs">trending_down</span>
                    <span className="text-green-600 text-xs">↓3</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                    <span className="ml-1 font-medium text-gray-800 dark:text-white">{patientVisits[0]?.vitals.weight}</span>
                    <span className="material-symbols-outlined text-green-500 text-xs">trending_down</span>
                    <span className="text-green-600 text-xs">↓5lbs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Temp:</span>
                    <span className="ml-1 font-medium text-gray-800 dark:text-white">{patientVisits[0]?.vitals.temp}</span>
                    <span className="material-symbols-outlined text-gray-400 text-xs">trending_flat</span>
                  </div>
                </div>
                
                <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">🤖 AI Insight:</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Blood pressure trending down 15 points since starting Lisinopril. Weight loss of 5lbs indicates good medication compliance. Continue current treatment.</p>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Medications:</p>
                  <div className="flex flex-wrap gap-1">
                    {patientVisits[0]?.medications.slice(0, 2).map((med: string, index: number) => (
                      <span key={index} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveTab('visits')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  View detailed trends →
                </button>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'visits' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Visit History</h3>
            </div>
            
            {selectedVisit ? (
              <div>
                <button 
                  onClick={() => setSelectedVisit(null)}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-4"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to visits
                </button>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedVisit.type}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVisit.date} at {selectedVisit.time}</p>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                      {selectedVisit.physician}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Vitals</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Blood Pressure:</span>
                          <span className="text-gray-800 dark:text-white">{selectedVisit.vitals.bp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Pulse:</span>
                          <span className="text-gray-800 dark:text-white">{selectedVisit.vitals.pulse} bpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Temperature:</span>
                          <span className="text-gray-800 dark:text-white">{selectedVisit.vitals.temp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                          <span className="text-gray-800 dark:text-white">{selectedVisit.vitals.weight}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Diagnosis</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedVisit.diagnosis}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Medications Prescribed</h5>
                      <div className="space-y-1">
                        {selectedVisit.medications.map((med: string, index: number) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-300">• {med}</div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Procedures</h5>
                      <div className="space-y-1">
                        {selectedVisit.procedures.map((proc: string, index: number) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-300">• {proc}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Lab Results</h5>
                    <div className="space-y-1">
                      {selectedVisit.labResults.map((result: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-300">• {result}</div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedVisit.calls && selectedVisit.calls.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Patient Calls</h5>
                    <div className="space-y-2">
                      {selectedVisit.calls.map((call: any, index: number) => (
                        <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Call on {call.date} at {call.time}</span>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">{call.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Notes</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedVisit.notes}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {patientVisits.map((visit) => (
                  <div 
                    key={visit.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedVisit(visit)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-white">{visit.type}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{visit.date} at {visit.time}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{visit.diagnosis}</p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Medications:</p>
                          <div className="flex flex-wrap gap-1">
                            {visit.medications.slice(0, 2).map((med: string, index: number) => (
                              <span key={index} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                {med}
                              </span>
                            ))}
                            {visit.medications.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">+{visit.medications.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          {visit.physician}
                        </span>
                        <div className="mt-2">
                          <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Orders & Lab Results</h3>
              <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-400 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                New Order
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Blood Work Panel</h4>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">Completed</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ordered: Jan 10, 2024 | Completed: Jan 12, 2024</p>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>• Cholesterol: 180 mg/dL (Normal)</p>
                  <p>• Blood glucose: 95 mg/dL (Normal)</p>
                  <p>• Hemoglobin: 14.2 g/dL (Normal)</p>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">EKG</h4>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">Pending</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ordered: Jan 15, 2024</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cardiac evaluation - scheduled for Jan 20, 2024</p>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'messages' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Messages</h3>
              <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-400 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                New Message
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Medication Side Effects</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Jan 16, 2024</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Patient reported mild dizziness after starting Lisinopril. Advised to monitor blood pressure and reduce salt intake.
                </p>
                <div className="flex gap-2">
                  <button className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">Reply</button>
                  <button className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">Mark Read</button>
                </div>
              </div>
              
              <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Appointment Confirmation</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Jan 14, 2024</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Follow-up appointment confirmed for January 20, 2024 at 9:00 AM. Please bring current medication list.
                </p>
                <div className="flex gap-2">
                  <button className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded">Confirmed</button>
                </div>
              </div>
              
              <div className="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Lab Results Available</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Jan 12, 2024</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Blood work results are now available. All values within normal range. Continue current treatment plan.
                </p>
                <div className="flex gap-2">
                  <button className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">View Results</button>
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Medication History</h3>
              <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-400 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                Add medication
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="font-normal pb-3 pr-4">Brand Name</th>
                    <th className="font-normal pb-3 pr-4">Generic Name</th>
                    <th className="font-normal pb-3 pr-4">Strength</th>
                    <th className="font-normal pb-3 pr-4">Form</th>
                    <th className="font-normal pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-white">
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 pr-4 font-medium">Lisinopril</td>
                    <td className="py-4 pr-4 text-gray-500 dark:text-gray-400">Lisinopril</td>
                    <td className="py-4 pr-4">10mg</td>
                    <td className="py-4 pr-4">Tab</td>
                    <td className="py-4">Active</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 pr-4 font-medium">Ibuprofen</td>
                    <td className="py-4 pr-4 text-gray-500 dark:text-gray-400">Ibuprofen</td>
                    <td className="py-4 pr-4">400mg</td>
                    <td className="py-4 pr-4">Tab</td>
                    <td className="py-4">Discontinued</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

export default PatientDetail;