'use client'

const NurseSidebar = () => {
  return (
    <aside className="w-64 bg-white dark:bg-surface-dark border-r border-[#dbe0e6] dark:border-gray-800 flex flex-col justify-between shrink-0 h-full transition-colors duration-300">
      <div className="flex flex-col gap-6 p-4">
        {/* User Profile */}
        <div className="flex gap-3 items-center pb-4 border-b border-[#f0f2f4] dark:border-gray-700">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-sm" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBtTUoNyE4poaogEAj27B4De-_ieOdlaE-4cTgVW0ilrf8QUju5inUywjZhoBMRUujaYkCXQ7hoVTqWiWJApAkHgK6pCAwZ922gBKils5xkSTlWcBYcTDZkKJYN2q1xHxQyczsNQYNBHcD1sAPdi3R2rtnqrpyShkhnN4zK4TniBwMkXA2UCPjl6eJQZ_NbB6gCPMjrU20AaAjNKItmAXsGIPB6bnXfVQVol6Wgz8BCXPdUxkSgXqZN52oHE15pA25bLu0CNfjbeg")'}}
          />
          <div className="flex flex-col">
            <h1 className="text-[#111418] dark:text-white text-base font-bold leading-normal">Nurse Sarah</h1>
            <p className="text-[#617589] dark:text-gray-400 text-xs font-normal leading-normal">Oncology Dept.</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary group transition-all" href="#">
            <span className="material-symbols-outlined text-[24px]">grid_view</span>
            <span className="text-sm font-bold">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#617589] hover:bg-[#f0f2f4] dark:text-gray-400 dark:hover:bg-gray-800 transition-all" href="#">
            <span className="material-symbols-outlined text-[24px]">group</span>
            <span className="text-sm font-medium">Patients</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#617589] hover:bg-[#f0f2f4] dark:text-gray-400 dark:hover:bg-gray-800 transition-all" href="#">
            <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            <span className="text-sm font-medium">Schedule</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#617589] hover:bg-[#f0f2f4] dark:text-gray-400 dark:hover:bg-gray-800 transition-all" href="#">
            <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
            <span className="text-sm font-medium">Messages</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#617589] hover:bg-[#f0f2f4] dark:text-gray-400 dark:hover:bg-gray-800 transition-all" href="#">
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
      </div>

      <div className="p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[#617589] hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  )
}

export default NurseSidebar