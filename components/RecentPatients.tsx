'use client'

const RecentPatients = () => {
  const patients: any[] = []

  const getSeverityStyles = (severity: string, color: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
    
    switch (color) {
      case 'red':
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`
      case 'green':
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`
      case 'orange':
        return `${baseClasses} bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400`
    }
  }

  const getDotColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-600 dark:bg-red-400'
      case 'green':
        return 'bg-green-600 dark:bg-green-400'
      case 'orange':
        return 'bg-orange-600 dark:bg-orange-400'
      default:
        return 'bg-gray-600 dark:bg-gray-400'
    }
  }

  return (
    <section className="flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <h2 className="text-[#111418] dark:text-white text-xl font-bold">Recent Patients</h2>
        <div className="flex gap-2">
          <button className="p-2 text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="p-2 text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-surface-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-[#dbe0e6] dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Patient</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Time In</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Symptoms</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Severity</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Assigned To</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbe0e6] dark:divide-gray-800">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#617589] dark:text-gray-400">
                    No recent patients yet.
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="bg-center bg-no-repeat bg-cover rounded-full size-10"
                          style={{backgroundImage: `url("${patient.patientAvatar}")`}}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111418] dark:text-white">{patient.name}</span>
                          <span className="text-xs text-[#617589] dark:text-gray-500">{patient.age} • ID {patient.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#111418] dark:text-gray-300 font-medium">{patient.timeIn}</span>
                      <p className="text-xs text-[#617589] dark:text-gray-500">{patient.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#111418] dark:text-gray-300">{patient.symptoms}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getSeverityStyles(patient.severity, patient.severityColor)}>
                        <span className={`size-1.5 rounded-full ${getDotColor(patient.severityColor)}`}></span>
                        {patient.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="size-6 rounded-full bg-gray-200 bg-cover"
                          style={{backgroundImage: `url("${patient.doctorAvatar}")`}}
                        />
                        <span className="text-sm font-medium text-[#111418] dark:text-gray-300">{patient.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#617589] hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#dbe0e6] dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-xs text-[#617589] dark:text-gray-400">Showing {patients.length} of {patients.length} patients</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-[#dbe0e6] dark:border-gray-700 text-xs font-medium text-[#617589] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700">
              Previous
            </button>
            <button className="px-3 py-1 rounded border border-[#dbe0e6] dark:border-gray-700 text-xs font-medium text-[#617589] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecentPatients
