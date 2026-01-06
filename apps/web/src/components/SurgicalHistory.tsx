interface SurgicalHistoryProps {
  patientId: string
}

const SurgicalHistory = ({ patientId }: SurgicalHistoryProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Surgical History</h2>
      
      <div className="space-y-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Appendectomy</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">March 15, 2020</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Laparoscopic appendectomy performed due to acute appendicitis.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Surgeon: Dr. Johnson • Hospital: General Medical Center
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Gallbladder Removal</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">June 8, 2018</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Cholecystectomy performed for gallstones. No complications.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Surgeon: Dr. Smith • Hospital: Regional Medical Center
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurgicalHistory