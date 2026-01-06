'use client'

const PatientChart = () => {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 z-10">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Patients status</h3>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full cursor-pointer">
          Yearly <span className="material-icons-outlined text-sm ml-1">expand_more</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-2 relative h-40 w-full px-2 z-10">
        <div className="absolute -left-2 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 font-medium">
          <span>100k</span>
          <span>50k</span>
          <span>20k</span>
          <span>10k</span>
          <span>0</span>
        </div>
        
        <svg className="absolute bottom-6 left-8 right-0 w-full h-32 overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,128 L0,100 Q40,90 80,60 T160,50 T240,100 T320,40 T400,20 L400,128 Z" fill="url(#gradient)" />
          <path d="M0,100 Q40,90 80,60 T160,50 T240,100 T320,40 T400,20" fill="none" stroke="#4ade80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </svg>
        
        <div className="w-full pl-8 flex justify-between text-[10px] text-gray-400 font-medium mt-auto pt-4 absolute bottom-0">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
        </div>
      </div>
    </div>
  )
}

export default PatientChart