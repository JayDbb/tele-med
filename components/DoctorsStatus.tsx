'use client'

const DoctorsStatus = () => {
  const availableDoctors: any[] = []
  const busyDoctors: any[] = []

  return (
    <section>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Available Doctors */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#111418] dark:text-white text-lg font-bold flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
              Available Doctors
            </h2>
            <a className="text-primary text-sm font-bold hover:underline" href="#">View All</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableDoctors.length === 0 ? (
              <div className="col-span-full flex items-center justify-center rounded-xl bg-white dark:bg-surface-dark border border-[#dbe0e6] dark:border-gray-800 p-6 text-sm text-[#617589] dark:text-gray-400">
                No available doctors recorded.
              </div>
            ) : (
              availableDoctors.map((doctor, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-[#dbe0e6] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 group-hover:scale-105 transition-transform"
                    style={{backgroundImage: `url("${doctor.avatar}")`}}
                  />
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight">{doctor.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        doctor.statusType === 'online' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {doctor.statusType === 'online' ? 'Remote' : 'In-Person'}
                      </span>
                    </div>
                    <p className="text-[#617589] dark:text-gray-400 text-xs font-medium">{doctor.specialty}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                      doctor.statusType === 'online' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-[#617589] dark:text-gray-500'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {doctor.statusType === 'online' ? 'videocam' : 'meeting_room'}
                      </span>
                      {doctor.statusType === 'online' ? 'Online' : doctor.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Busy Doctors */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[#111418] dark:text-white text-lg font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-orange-400"></span>
            Busy Doctors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {busyDoctors.length === 0 ? (
              <div className="col-span-full flex items-center justify-center rounded-xl bg-white dark:bg-surface-dark border border-[#dbe0e6] dark:border-gray-800 p-6 text-sm text-[#617589] dark:text-gray-400">
                No busy doctors recorded.
              </div>
            ) : (
              busyDoctors.map((doctor, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-[#dbe0e6] dark:border-gray-800 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 grayscale"
                    style={{backgroundImage: `url("${doctor.avatar}")`}}
                  />
                  <div className="flex flex-col flex-1 gap-1">
                    <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight">{doctor.name}</h3>
                    <p className="text-[#617589] dark:text-gray-400 text-xs font-medium">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase tracking-wide">
                        {doctor.status}
                      </span>
                      <span className="text-[10px] text-gray-400">{doctor.timeLeft}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DoctorsStatus
