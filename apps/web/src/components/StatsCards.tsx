'use client'

const StatsCards = () => {
  const stats = [
    {
      title: '1,250k',
      subtitle: 'Total Patients',
      change: '+20%',
      icon: 'trending_up',
      isPrimary: true
    },
    {
      title: '58',
      subtitle: 'Critical',
      change: '+10%',
      icon: 'arrow_forward',
      hasIndicator: true,
      indicatorColor: 'bg-red-500'
    },
    {
      title: '219',
      subtitle: 'Follow up',
      change: '+4%',
      icon: 'arrow_forward',
      hasIndicator: true,
      indicatorColor: 'bg-blue-500',
      changeColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    },
    {
      title: '23',
      subtitle: 'Draft',
      change: '-5%',
      icon: 'arrow_forward',
      hasIndicator: true,
      indicatorColor: 'bg-purple-500',
      changeColor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    }
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`${
            stat.isPrimary 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-surface-dark'
          } rounded-2xl p-5 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group`}
        >
          {stat.isPrimary && (
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform duration-500" />
          )}
          
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h3 className={`text-3xl font-bold flex items-start ${
                stat.isPrimary ? 'text-white' : 'text-gray-800 dark:text-white'
              }`}>
                {stat.title}
                {stat.hasIndicator && (
                  <div className={`w-2 h-2 ${stat.indicatorColor} rounded-full ml-1 ${
                    stat.indicatorColor === 'bg-red-500' ? 'animate-pulse' : ''
                  }`} />
                )}
              </h3>
              <p className={`text-xs font-medium mt-1 ${
                stat.isPrimary 
                  ? 'text-blue-100' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {stat.subtitle}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              stat.isPrimary 
                ? 'bg-white/20' 
                : stat.changeColor || 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
              {stat.change}
            </span>
          </div>
          
          <div className="mt-4 flex justify-end">
            <span className={`material-icons-outlined p-1.5 rounded-full text-sm ${
              stat.isPrimary 
                ? 'bg-white/20' 
                : 'text-blue-400 bg-blue-50 dark:bg-blue-900/20 transform -rotate-45'
            }`}>
              {stat.icon}
            </span>
          </div>
        </div>
      ))}
    </>
  )
}

export default StatsCards