import { PatientDataManager } from '@/utils/PatientDataManager'

interface SurgicalHistoryProps {
  patientId: string
}

const SurgicalHistory = ({ patientId }: SurgicalHistoryProps) => {
  const surgeries = PatientDataManager.getPatientSectionList(patientId, 'surgical-history')

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Surgical History</h2>
      
      <div className="space-y-4">
        {surgeries.length > 0 ? (
          surgeries.map((surgery: any) => (
            <div key={surgery.id || surgery.procedure} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{surgery.procedure || 'Unnamed procedure'}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{surgery.date || 'Date not provided'}</span>
              </div>
              {surgery.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {surgery.notes}
                </p>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {surgery.surgeon ? `Surgeon: ${surgery.surgeon}` : 'Surgeon not provided'}
                {surgery.site ? ` • Site: ${surgery.site}` : ''}
              </div>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No surgical history recorded.
          </div>
        )}
      </div>
    </div>
  )
}

export default SurgicalHistory
