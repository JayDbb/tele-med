import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

export default function TrendPage({ params }: { params: { id: string, type: string } }) {
  const trendConfig = {
    'blood-pressure': {
      title: 'Blood Pressure',
      icon: 'monitor_heart',
      unit: 'mmHg',
      value: '120/80',
      change: '-2% vs last month',
      color: 'red',
      description: 'Systolic & Diastolic trends over time'
    },
    'pulse': {
      title: 'Heart Rate',
      icon: 'ecg_heart',
      unit: 'bpm',
      value: '72',
      change: '-3 vs last month',
      color: 'blue',
      description: 'Heart rate trends over time'
    },
    'weight': {
      title: 'Weight',
      icon: 'scale',
      unit: 'lbs',
      value: '185',
      change: '-5lbs vs last month',
      color: 'green',
      description: 'Weight trends over time'
    },
    'temperature': {
      title: 'Temperature',
      icon: 'device_thermostat',
      unit: '°F',
      value: '98.6',
      change: 'Normal range',
      color: 'orange',
      description: 'Temperature trends over time'
    }
  }

  const config = trendConfig[params.type as keyof typeof trendConfig] || trendConfig['blood-pressure']

  return (
    <div className="font-body bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100 transition-colors duration-300 h-screen overflow-hidden flex">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/doctor/patients/${params.id}`} className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm">
                <span className="material-symbols-outlined text-base">arrow_back</span> Back to Patient Profile
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              Vitals Trends
            </h1>
            <p className="text-sm text-gray-500 mt-1">Patient: <span className="font-semibold text-gray-800 dark:text-gray-200">Not recorded</span> (ID: --) | Not recorded</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl flex items-center shadow-sm transition-all text-sm font-medium whitespace-nowrap">
              <span className="material-symbols-outlined text-lg mr-2">download</span>
              Export Data
            </button>
            <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 text-sm font-medium whitespace-nowrap">
              <span className="material-symbols-outlined text-lg mr-2">add</span>
              Add Vitals
            </button>
          </div>
        </header>

        {/* Trend Type Tabs */}
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {Object.entries(trendConfig).map(([key, item]) => (
              <Link
                key={key}
                href={`/doctor/patients/${params.id}/trends/${key}`}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                  params.type === key 
                    ? 'shadow-glow bg-primary text-white' 
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.title}
              </Link>
            ))}
            <Link
              href={`/doctor/patients/${params.id}/trends/o2-saturation`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <span className="material-symbols-outlined text-lg">air</span>
              O2 Saturation
            </Link>
            <Link
              href={`/doctor/patients/${params.id}/trends/bmi`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <span className="material-symbols-outlined text-lg">body_system</span>
              BMI
            </Link>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 transition-all">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`p-2.5 rounded-xl bg-${config.color}-100 text-${config.color}-600 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
                  <span className="material-symbols-outlined">{config.icon}</span>
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{config.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
                </div>
              </div>
              <div className="flex items-end gap-3 mt-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-400 font-medium">Latest Reading</span>
                  <span className="text-4xl font-bold text-gray-800 dark:text-white">{config.value} <span className="text-base font-normal text-gray-500">{config.unit}</span></span>
                </div>
                <div className="mb-1.5">
                  <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">trending_down</span> {config.change}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1.5 flex flex-wrap gap-1">
              <button className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-all rounded-lg">1M</button>
              <button className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-all rounded-lg">3M</button>
              <button className="px-4 py-2 text-xs font-medium bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm rounded-lg border border-gray-200 dark:border-gray-600">6M</button>
              <button className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-all rounded-lg">1Y</button>
              <button className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-all rounded-lg">All</button>
            </div>
          </div>

          {/* Chart */}
          <div className="relative w-full h-80 lg:h-96">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 400">
              <g className="text-gray-200 dark:text-gray-700" stroke="currentColor" strokeWidth="1">
                <line strokeDasharray="4" x1="0" x2="1000" y1="50" y2="50"></line>
                <line strokeDasharray="4" x1="0" x2="1000" y1="125" y2="125"></line>
                <line strokeDasharray="4" x1="0" x2="1000" y1="200" y2="200"></line>
                <line strokeDasharray="4" x1="0" x2="1000" y1="275" y2="275"></line>
                <line strokeDasharray="4" x1="0" x2="1000" y1="350" y2="350"></line>
              </g>
              <path className="text-primary drop-shadow-lg" d="M0,150 C100,140 200,160 300,140 S500,100 600,110 S800,130 1000,120" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
              <defs>
                <linearGradient id="systolicGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1e88e5" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#1e88e5" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,150 C100,140 200,160 300,140 S500,100 600,110 S800,130 1000,120 V400 H0 Z" fill="url(#systolicGradient)" stroke="none"></path>
              {params.type === 'blood-pressure' && (
                <path className="text-blue-300 dark:text-blue-600" d="M0,280 C100,285 200,270 300,275 S500,250 600,260 S800,265 1000,260" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
              )}
              {[0, 200, 400, 600, 800, 1000].map((x, i) => (
                <circle key={i} className="text-primary fill-white dark:fill-gray-900 stroke-current chart-point cursor-pointer transition-all hover:scale-125" cx={x} cy={150 - i * 5} r="5" strokeWidth="3"></circle>
              ))}
              {params.type === 'blood-pressure' && [0, 200, 400, 600, 800, 1000].map((x, i) => (
                <circle key={`diastolic-${i}`} className="text-blue-300 dark:text-blue-600 fill-white dark:fill-gray-900 stroke-current chart-point cursor-pointer transition-all hover:scale-125" cx={x} cy={280 - i * 2} r="5" strokeWidth="3"></circle>
              ))}
              <g className="chart-tooltip pointer-events-none opacity-0">
                <rect className="fill-gray-900 text-white rounded shadow-lg" height="50" rx="6" width="100" x="900" y="50"></rect>
                <text className="text-xs fill-white font-medium" x="910" y="70">May 15</text>
                <text className="text-sm fill-white font-bold" x="910" y="90">120 mmHg</text>
              </g>
            </svg>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-4 px-2">
              <span>Dec 2022</span>
              <span>Jan 2023</span>
              <span>Feb 2023</span>
              <span>Mar 2023</span>
              <span>Apr 2023</span>
              <span>May 2023</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg">Recent Recorded Data</h3>
            <Link href="#" className="text-sm text-primary hover:underline font-medium">View Full History</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium" scope="col">Date</th>
                  <th className="px-6 py-4 font-medium" scope="col">{params.type === 'blood-pressure' ? 'BP (mmHg)' : `${config.title}`}</th>
                  <th className="px-6 py-4 font-medium" scope="col">Heart Rate</th>
                  <th className="px-6 py-4 font-medium" scope="col">Temp (°F)</th>
                  <th className="px-6 py-4 font-medium" scope="col">Weight (kg)</th>
                  <th className="px-6 py-4 font-medium" scope="col">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white font-medium">May 15, 2023</td>
                  <td className="px-6 py-4">{config.value}</td>
                  <td className="px-6 py-4">72 bpm</td>
                  <td className="px-6 py-4">98.6</td>
                  <td className="px-6 py-4">70.0</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">RR</div>
                    Not recorded
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white font-medium">Apr 12, 2023</td>
                  <td className="px-6 py-4">{params.type === 'blood-pressure' ? '118/79' : config.value}</td>
                  <td className="px-6 py-4">74 bpm</td>
                  <td className="px-6 py-4">98.4</td>
                  <td className="px-6 py-4">70.5</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">JD</div>
                    Not recorded
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white font-medium">Mar 10, 2023</td>
                  <td className="px-6 py-4">{params.type === 'blood-pressure' ? '122/82' : config.value}</td>
                  <td className="px-6 py-4">70 bpm</td>
                  <td className="px-6 py-4">98.5</td>
                  <td className="px-6 py-4">71.2</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">RR</div>
                    Not recorded
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
