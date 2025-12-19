'use client'

import Link from 'next/link'

interface VisitHistoryProps {
  patientId: string
}

const VisitHistory = ({ patientId }: VisitHistoryProps) => {
  const patient = {
    name: 'Leslie Alexander',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3ICbZ8z0Efd_JndI0nxLf1xoPT9Qu5u7JOVQk1C4v9jvf9Imxxeihie4tzXRP0fxByp_jZ5-t8ZaRReubpV0Ot7RZKtjdd8nGeVTenCfxbFkmtAsfproneHcg9ObslryS-maUvfjOKzKMwNQty7FtvQQQxjA1isNwGRxWyk22ra2LTOLu7zUo-PaEREQDs7soTQIxrs7kYcD34Y4qyjxuDJhM3QFIVNUMAuKPbslsBc8K2Zv2KbHENeK-FlWUql8LUgxgSwU-4cl',
    gender: 'Male, 24y',
    id: '#PT-00921',
    lastVisit: 'Jan 15, 2024',
    condition: 'Hypertension',
    physician: 'Dr. Ilya'
  }

  const visits = [
    {
      id: '1',
      date: '15',
      month: 'Jan 2024',
      time: '09:00 AM',
      type: 'Follow-up',
      title: 'Hypertension monitoring',
      description: 'Routine follow-up to check blood pressure levels and adjust medication dosage. Patient reports occasional headaches but improved energy levels.',
      medications: ['Lisinopril 10mg daily', 'Aspirin 81mg daily'],
      doctor: 'Dr. Ilya',
      specialty: 'Cardiologist',
      typeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      dateColor: 'text-primary dark:text-blue-400',
      dateBg: 'bg-blue-50 dark:bg-blue-900/10'
    },
    {
      id: '2',
      date: '10',
      month: 'Dec 2023',
      time: '10:30 AM',
      type: 'Routine Checkup',
      title: 'Annual physical exam',
      description: 'Comprehensive annual review. Blood work ordered. Patient advised on dietary changes to manage weight.',
      medications: ['Vitamin D3 1000IU daily'],
      doctor: 'Dr. Sarah Johnson',
      specialty: 'General Practitioner',
      typeColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      dateColor: 'text-gray-700 dark:text-gray-300',
      dateBg: 'bg-gray-50 dark:bg-slate-800/50'
    },
    {
      id: '3',
      date: '05',
      month: 'Nov 2023',
      time: '02:15 PM',
      type: 'Consultation',
      title: 'Initial hypertension diagnosis',
      description: 'Patient presented with elevated BP readings from home monitoring. Confirmed in-office. Treatment plan initiated.',
      medications: ['Lisinopril 10mg daily'],
      doctor: 'Dr. Ilya',
      specialty: 'Cardiologist',
      typeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      dateColor: 'text-gray-700 dark:text-gray-300',
      dateBg: 'bg-gray-50 dark:bg-slate-800/50'
    },
    {
      id: '4',
      date: '20',
      month: 'Oct 2023',
      time: '08:45 PM',
      type: 'Emergency',
      title: 'Acute illness',
      description: 'Patient arrived with high fever (102°F) and chills. Tested positive for viral infection.',
      medications: ['Ibuprofen 400mg as needed', 'Fluids and rest'],
      doctor: 'Dr. Emily Chen',
      specialty: 'ER Resident',
      typeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      dateColor: 'text-gray-700 dark:text-gray-300',
      dateBg: 'bg-gray-50 dark:bg-slate-800/50'
    }
  ]

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span className="hover:text-primary cursor-pointer">Patients</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="hover:text-primary cursor-pointer">{patient.name}</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-medium">History</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Visit History</h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all" 
              placeholder="Search visits, symptoms..." 
              type="text"
            />
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full flex items-center shadow-sm transition-transform transform hover:scale-105 whitespace-nowrap">
            <span className="material-symbols-outlined text-sm mr-2">edit_calendar</span>
            <span className="text-sm font-medium">Log New Visit</span>
          </button>
        </div>
      </header>

      <section className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-primary rounded-2xl p-6 shadow-sm text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-4 z-10">
            <div className="relative">
              <img 
                alt={patient.name} 
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white/30" 
                src={patient.image}
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-blue-500 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-blue-100 text-sm opacity-90">{patient.gender} • ID: {patient.id}</p>
            </div>
          </div>
          <div className="flex gap-4 z-10">
            <div className="text-center px-4 border-r border-blue-400/50 last:border-0">
              <p className="text-xs text-blue-100 uppercase tracking-wide">Last Visit</p>
              <p className="font-semibold mt-1">{patient.lastVisit}</p>
            </div>
            <div className="text-center px-4 border-r border-blue-400/50 last:border-0">
              <p className="text-xs text-blue-100 uppercase tracking-wide">Condition</p>
              <p className="font-semibold mt-1">{patient.condition}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-blue-100 uppercase tracking-wide">Physician</p>
              <p className="font-semibold mt-1">{patient.physician}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative space-y-6">
        {visits.map((visit, index) => (
          <Link key={index} href={`/patients/${patientId}/history/${visit.id}`} className="group relative flex gap-6">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-0 shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 overflow-hidden cursor-pointer">
              <div className="flex flex-col md:flex-row">
                <div className={`md:w-48 ${visit.dateBg} p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-blue-100 dark:border-blue-900/20`}>
                  <span className={`text-3xl font-bold ${visit.dateColor}`}>{visit.date}</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{visit.month}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{visit.time}</span>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${visit.typeColor}`}>
                        {visit.type}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{visit.title}</h3>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">arrow_forward_ios</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {visit.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined text-sm">medication</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Prescribed Medications</p>
                        {visit.medications.map((med, medIndex) => (
                          <p key={medIndex} className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{med}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined text-sm">person</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Attending Physician</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{visit.doctor}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{visit.specialty}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}

export default VisitHistory