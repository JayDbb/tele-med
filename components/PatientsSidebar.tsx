'use client'

const PatientsSidebar = () => {
  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'people', label: 'Patients', active: true },
    { icon: 'calendar_today', label: 'Schedule', active: false },
    { icon: 'chat_bubble_outline', label: 'Messages', active: false, badge: '2' },
    { icon: 'settings', label: 'Settings', active: false },
    { icon: 'notifications_none', label: 'Notification', active: false },
    { icon: 'help_outline', label: 'Help', active: false },
  ]

  return (
    <aside className="w-64 bg-primary flex flex-col justify-between shrink-0 shadow-xl z-20 transition-all duration-300 h-full rounded-r-3xl overflow-y-auto">
      <div className="pt-10 pb-8 flex flex-col items-center text-center text-white">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-white p-1">
            <img 
              alt="User Profile" 
              className="w-full h-full rounded-full object-cover border-2 border-blue-200" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE8hQ3fZ0Yn7KwwFl3ydLZPIM6RnaIM0YymhXfStC2Z24EI7gr2OR2SnWq4dSw6ZuQ1OFIabQROBEuU7nMG1hH6HiW5-OWXfUjMcgMuQ-bT3JG9RnmV_-UP3k3cL9X7iTHAGPvOMZRVvhdO6lyA-EyvPgmQMSw-9Ap3qZH0QDJgExD33MnGwMTTiIX7qDbTA6TnxVMxITFHIup-r6l7Mk3ZtzZmTuUadbdCKNwaPMvZiZ6DAwcDGuZT_2pCYa3gvHl4KMJIMBk5Og5" 
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-green-400 w-4 h-4 rounded-full border-2 border-primary" />
        </div>
        <h2 className="text-lg font-semibold">Istiak Ahmed</h2>
        <p className="text-xs text-blue-100 opacity-80">istiakahmed271@gmail.com</p>
        <span className="material-icons-outlined mt-2 text-blue-200 cursor-pointer hover:text-white">expand_more</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            className={`flex items-center px-4 py-3 rounded-xl transition-colors group ${
              item.active
                ? 'bg-[#0d47a1] text-white shadow-lg relative overflow-hidden'
                : 'text-blue-100 hover:bg-blue-600/30'
            } ${item.badge ? 'justify-between' : ''}`}
            href={item.active ? '#' : item.label === 'Dashboard' ? '/' : '#'}
          >
            {item.active && <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full" />}
            <div className="flex items-center">
              <span className={`material-icons-outlined text-xl mr-4 ${!item.active ? 'group-hover:text-white' : ''}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

    </aside>
  )
}

export default PatientsSidebar
