'use client'

import Link from 'next/link'

interface PatientDetailProps {
  patientId: string
}

const PatientDetail = ({ patientId }: PatientDetailProps) => {
  const patients = [
    {
      id: '1',
      name: 'Leslie Alexander',
      email: 'willie.jennings@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3ICbZ8z0Efd_JndI0nxLf1xoPT9Qu5u7JOVQk1C4v9jvf9Imxxeihie4tzXRP0fxByp_jZ5-t8ZaRReubpV0Ot7RZKtjdd8nGeVTenCfxbFkmtAsfproneHcg9ObslryS-maUvfjOKzKMwNQty7FtvQQQxjA1isNwGRxWyk22ra2LTOLu7zUo-PaEREQDs7soTQIxrs7kYcD34Y4qyjxuDJhM3QFIVNUMAuKPbslsBc8K2Zv2KbHENeK-FlWUql8LUgxgSwU-4cl',
      gender: 'Male, 24y',
      physician: 'Ronald',
      lastConsultation: 'May 12, 2019',
      appointment: '15 May 2020 8:00 am',
      status: 'Under Observation',
      statusColor: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300'
    }
  ]

  const patient = patients.find(p => p.id === patientId) || patients[0]

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Overview</h1>
        <Link href={`/patients/${patientId}/new-visit`} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <span className="material-symbols-outlined text-sm">edit_calendar</span>
          Log New Visit
        </Link>
      </div>
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-1/4 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <img 
                alt={patient.name} 
                className="w-24 h-24 rounded-xl object-cover mx-auto" 
                src={patient.image}
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{patient.name}</h2>
            <p className="text-green-500 text-sm font-medium mb-4">{patient.status}</p>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Gender</span>
              <span className="font-medium text-right text-gray-900 dark:text-white">{patient.gender.split(',')[0]}</span>
              <span className="text-gray-500 dark:text-gray-400">Age</span>
              <span className="font-medium text-right text-gray-900 dark:text-white">{patient.gender.split(',')[1]}</span>
              <span className="text-gray-500 dark:text-gray-400">Language</span>
              <span className="font-medium text-right text-gray-900 dark:text-white">English</span>
              <span className="text-gray-500 dark:text-gray-400">Height</span>
              <span className="font-medium text-right text-gray-900 dark:text-white">5&apos; 8&quot;</span>
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Tags</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-md">#patient</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-md">#active</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Allergies</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-900 dark:text-white">Penicillin</span>
                <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs font-medium">High</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-900 dark:text-white">Aspirin</span>
                <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs font-medium">Medium</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Regular checkups recommended. Patient shows good compliance with medication.
            </p>
            <Link 
              href={`/patients/${patientId}/notes`}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center gap-1"
            >
              View all notes
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last name</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name.split(' ')[1] || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First name</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name.split(' ')[0]}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Birthdate</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">03/15/1990</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">+1 (555) 123-4567</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">123 Main St, City, State 12345</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.email}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Medical Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Physician</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Dr. {patient.physician}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Consultation</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.lastConsultation}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next Appointment</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.appointment}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Health Trends & Analysis</h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">AI Analysis</span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Latest: Follow-up • 2024-01-15 - Dr. Ilya</p>
            
            <div className="grid grid-cols-4 gap-3 mb-3">
              <Link href={`/patients/${patientId}/trends/blood-pressure`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">BP</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">130/80</p>
                <span className="text-xs text-green-600 dark:text-green-400">↓15</span>
              </Link>
              <Link href={`/patients/${patientId}/trends/pulse`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">Pulse</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">72 bpm</p>
                <span className="text-xs text-green-600 dark:text-green-400">↓3</span>
              </Link>
              <Link href={`/patients/${patientId}/trends/weight`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">185 lbs</p>
                <span className="text-xs text-green-600 dark:text-green-400">↓5lbs</span>
              </Link>
              <Link href={`/patients/${patientId}/trends/temperature`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">Temp</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">98.6°F</p>
                <span className="text-xs text-gray-500">—</span>
              </Link>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">🤖 BP trending down 15pts since starting Lisinopril. Weight loss of 5lbs indicates good compliance.</p>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Meds: </span>
                <span className="text-gray-900 dark:text-white">Lisinopril 10mg, Aspirin 81mg</span>
              </div>
              <Link href="/medications" className="text-primary hover:text-primary/80 font-medium">View →</Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Medication History</h3>
              <Link href="/medications" className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">add</span>
                Add
              </Link>
            </div>
            
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="font-medium pb-2 pr-3 text-left">Brand Name</th>
                  <th className="font-medium pb-2 pr-3 text-left">Generic</th>
                  <th className="font-medium pb-2 pr-3 text-left">Strength</th>
                  <th className="font-medium pb-2 pr-3 text-left">Form</th>
                  <th className="font-medium pb-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 dark:text-white">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 pr-3 font-medium">Lisinopril</td>
                  <td className="py-2 pr-3">Lisinopril</td>
                  <td className="py-2 pr-3">10mg</td>
                  <td className="py-2 pr-3">Tab</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Ibuprofen</td>
                  <td className="py-2 pr-3">Ibuprofen</td>
                  <td className="py-2 pr-3">400mg</td>
                  <td className="py-2 pr-3">Tab</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">Discontinued</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PatientDetail