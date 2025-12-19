'use client'

interface PatientModalProps {
  patient: any
  isOpen: boolean
  onClose: () => void
}

const PatientModal = ({ patient, isOpen, onClose }: PatientModalProps) => {
  if (!isOpen || !patient) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </button>
            <h1 className="text-lg font-semibold">Patient Details</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Left Sidebar */}
            <div className="w-full xl:w-1/4 flex flex-col gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
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
                  <span className="font-medium text-right">{patient.gender.split(',')[0]}</span>
                  <span className="text-gray-500 dark:text-gray-400">Age</span>
                  <span className="font-medium text-right">{patient.gender.split(',')[1]}</span>
                  <span className="text-gray-500 dark:text-gray-400">Language</span>
                  <span className="font-medium text-right">English</span>
                  <span className="text-gray-500 dark:text-gray-400">Height</span>
                  <span className="font-medium text-right">5' 8"</span>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-md">#patient</span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-md">#active</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Allergies</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Penicillin</span>
                    <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs font-medium">High</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Aspirin</span>
                    <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs font-medium">Medium</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Regular checkups recommended. Patient shows good compliance with medication.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 flex items-center gap-1 overflow-x-auto">
                <button className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 shadow-sm rounded-lg whitespace-nowrap">General</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white whitespace-nowrap">Orders</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white whitespace-nowrap">Family</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white whitespace-nowrap">Messages</button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Personal Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last name</label>
                      <div className="text-sm font-medium">{patient.name.split(' ')[1] || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First name</label>
                      <div className="text-sm font-medium">{patient.name.split(' ')[0]}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Birthdate</label>
                      <div className="text-sm font-medium">03/15/1990</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                      <div className="text-sm font-medium">+1 (555) 123-4567</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
                      <div className="text-sm font-medium">123 Main St, City, State 12345</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                      <div className="text-sm font-medium">{patient.email}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Medical Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Physician</label>
                      <div className="text-sm font-medium">Dr. {patient.physician}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Consultation</label>
                      <div className="text-sm font-medium">{patient.lastConsultation}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next Appointment</label>
                      <div className="text-sm font-medium">{patient.appointment}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientModal