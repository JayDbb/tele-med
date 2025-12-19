'use client'

import { PatientCondition } from '@/types'

const PatientConditions = () => {
  const conditions: PatientCondition[] = [
    { condition: 'Stable', count: 85, color: 'bg-green-400' },
    { condition: 'Fair', count: 43, color: 'bg-yellow-400' },
    { condition: 'Serious', count: 14, color: 'bg-red-400' },
    { condition: 'Critical', count: 0, color: 'bg-blue-200 dark:bg-blue-800' },
  ]

  const total = conditions.reduce((sum, condition) => sum + condition.count, 0)

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Patients by condition
      </h3>
      
      <div className="flex items-center justify-center my-6">
        <div className="relative size-40">
          <svg className="size-full" viewBox="0 0 36 36">
            <path
              className="stroke-current text-blue-200 dark:text-blue-800"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
            />
            <path
              className="stroke-current text-green-400"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeDasharray="60, 100"
              strokeWidth="3"
            />
            <path
              className="stroke-current text-yellow-400"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeDasharray="30, 100"
              strokeDashoffset="-60"
              strokeWidth="3"
            />
            <path
              className="stroke-current text-red-400"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeDasharray="10, 100"
              strokeDashoffset="-90"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {conditions.map((condition) => (
          <div key={condition.condition} className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${condition.color}`} />
            <span className="text-gray-600 dark:text-gray-300">{condition.condition}</span>
            <span className="font-medium ml-auto text-gray-800 dark:text-gray-100">
              {condition.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PatientConditions