'use client'

import { Update } from '@/types'

const ImportantUpdates = () => {
  const updates: Update[] = [
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
  ]

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Important updates
      </h3>
      
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${update.categoryColor}`}>
                {update.category}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">{update.date}</p>
            </div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">
              {update.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {update.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImportantUpdates