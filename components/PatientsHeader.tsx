'use client'

const PatientsHeader = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Patients List</h1>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
          <span className="material-icons-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            search
          </span>
          <input 
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-surface-dark border-none shadow-soft focus:ring-2 focus:ring-primary text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all" 
            placeholder="Search Patients" 
            type="text"
          />
        </div>
        
        <button className="bg-[#0f172a] hover:bg-slate-800 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full inline-flex items-center sm:gap-2 shadow-lg transition-transform transform hover:scale-105">
          <span className="material-icons-outlined text-sm hidden sm:inline-flex">add</span>
          <span className="text-sm font-medium">Add Patient</span>
        </button>
      </div>
    </header>
  )
}

export default PatientsHeader