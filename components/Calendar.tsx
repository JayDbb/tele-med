'use client'

const Calendar = () => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const currentDate = 5

  const generateCalendarDays = () => {
    const days = []
    // Start from Tuesday (day 1)
    for (let i = 1; i <= 31; i++) {
      const isToday = i === currentDate
      const isPastMonth = i === 1 && days.length === 0
      
      days.push(
        <button
          key={i}
          className={`h-10 w-full text-sm font-medium ${
            isToday
              ? 'text-white'
              : isPastMonth
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-800 dark:text-gray-100'
          } ${i === 1 ? 'col-start-3' : ''}`}
        >
          <div className={`flex size-full items-center justify-center rounded-full ${
            isToday ? 'bg-primary' : ''
          }`}>
            {i}
          </div>
        </button>
      )
    }
    return days
  }

  return (
    <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">October</p>
        <div className="flex gap-2">
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3">
            <p className="text-gray-800 dark:text-gray-200 text-xs font-medium">Work day</p>
          </div>
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3">
            <p className="text-gray-800 dark:text-gray-200 text-xs font-medium">Vacation request</p>
          </div>
        </div>
      </div>

      <div className="flex min-w-72 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <button className="text-gray-600 dark:text-gray-300">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <p className="text-gray-900 dark:text-white text-base font-bold leading-tight flex-1 text-center">
            October 2024
          </p>
          <button className="text-gray-600 dark:text-gray-300">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-7 mt-2">
          {daysOfWeek.map((day) => (
            <p key={day} className="text-gray-500 dark:text-gray-400 text-[13px] font-bold flex h-10 w-full items-center justify-center">
              {day}
            </p>
          ))}
          {generateCalendarDays()}
        </div>
      </div>
    </div>
  )
}

export default Calendar