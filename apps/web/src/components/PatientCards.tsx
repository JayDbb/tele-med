'use client'

import { PatientDataManager } from '@/utils/PatientDataManager'

const PatientCards = () => {
  const patients = PatientDataManager.getAllPatients()

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-6">
      {patients.map((patient, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 group"
        >
          <div className="flex items-start gap-4 mb-6">
            <img 
              alt={patient.name} 
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900" 
              src={patient.image}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-white truncate">{patient.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{patient.email}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                  <span className="material-icons-outlined text-[12px] mr-1">call</span> Phone
                </button>
                <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                  <span className="material-icons-outlined text-[12px] mr-1">monitor_heart</span> Live Vital
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
            <div className="text-gray-500 dark:text-gray-400">Gender, Age</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.gender}</div>
            <div className="text-gray-500 dark:text-gray-400">Physician</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.physician}</div>
            <div className="text-gray-500 dark:text-gray-400">Last Consultation</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.lastConsultation}</div>
            <div className="text-gray-500 dark:text-gray-400">Appointments</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.appointment}</div>
          </div>
          
          <div className="flex items-center justify-end mt-2 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
              <span className="material-icons-outlined text-sm">arrow_downward</span>
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

export default PatientCards
