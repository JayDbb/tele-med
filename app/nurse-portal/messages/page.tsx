import NurseSidebar from '@/components/NurseSidebar'

export default function NurseMessagesPage() {
  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
      <NurseSidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6">
          <div className="flex flex-wrap justify-between items-end gap-4 max-w-[1400px] mx-auto w-full">
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Messages</h1>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal">Manage your tasks, messages, and alerts for today.</p>
            </div>
            <button className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-10 px-6 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="truncate">Compose Message</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
            {/* Quick Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:border-red-400 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Urgent Alerts</p>
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full p-1">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-3xl font-black mt-2">0</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:border-amber-400 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Pending Orders</p>
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full p-1">
                    <span className="material-symbols-outlined text-[20px]">assignment_late</span>
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-3xl font-black mt-2">0</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:border-primary transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Unread Messages</p>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 rounded-full p-1">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-3xl font-black mt-2">0</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:border-green-400 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">New Lab Results</p>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-1">
                    <span className="material-symbols-outlined text-[20px]">science</span>
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-3xl font-black mt-2">0</p>
              </div>
            </section>

            {/* Search and Filters */}
            <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-600">search</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm" 
                  placeholder="Search patient, MRN, or order type..." 
                  type="text"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-2 md:px-0">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                  <span className="material-symbols-outlined text-[18px]">sort</span>
                  Sort by: Urgency
                </button>
                <div className="h-8 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <button className="flex items-center justify-center size-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
            </section>

            {/* Tabs & List Content */}
            <section className="flex flex-col gap-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Tabs Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-2 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex gap-8 overflow-x-auto">
                  <a className="relative pb-4 text-sm font-bold text-gray-900 dark:text-white group" href="#">
                    All Items
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white rounded-t-full"></span>
                  </a>
                  <a className="relative pb-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group flex items-center gap-2" href="#">
                    Urgent
                    <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs px-1.5 py-0.5 rounded-md font-bold">0</span>
                  </a>
                  <a className="relative pb-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group flex items-center gap-2" href="#">
                    Orders
                    <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs px-1.5 py-0.5 rounded-md font-bold">0</span>
                  </a>
                  <a className="relative pb-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group flex items-center gap-2" href="#">
                    Messages
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-md font-bold">0</span>
                  </a>
                  <a className="relative pb-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group flex items-center gap-2" href="#">
                    Labs
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-md font-bold">0</span>
                  </a>
                </div>
              </div>

              {/* Inbox List Items */}
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No inbox items yet.
                </div>
              </div>

              {/* Pagination Footer */}
              <div className="bg-gray-50/50 dark:bg-gray-800/30 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-bold text-gray-900 dark:text-white">0</span> of <span className="font-bold text-gray-900 dark:text-white">0</span> items
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 shadow-sm" disabled>Previous</button>
                  <button className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm">Next</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
