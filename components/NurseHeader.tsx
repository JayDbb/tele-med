'use client'

import Link from 'next/link'

const NurseHeader = () => {
  return (
    <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-8 py-6 flex flex-col gap-6 border-b border-transparent">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-tight">Nurse Dashboard</h1>
          <p className="text-[#617589] dark:text-gray-400 text-base font-normal">Monday, Oct 24 • Shift A</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex h-10 w-80 items-stretch rounded-lg bg-white dark:bg-surface-dark border border-[#dbe0e6] dark:border-gray-700 shadow-sm focus-within:border-primary transition-all">
            <div className="flex items-center justify-center pl-3 pr-2 text-[#617589] dark:text-gray-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none text-sm text-[#111418] dark:text-white placeholder-[#617589] dark:placeholder-gray-500 focus:ring-0" 
              placeholder="Search patients, doctors..."
            />
          </div>
          <Link href="/nurse/new-patient" className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-white shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-sm font-bold">New Patient Intake</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default NurseHeader