'use client'

const DoctorsStatus = () => {
  const availableDoctors = [
    {
      name: "Dr. Emily Chen",
      specialty: "Oncologist",
      status: "Remote",
      statusType: "online",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBA0LuUPvPheNTBMOBEDsV3g3prL1Xqs0FFDmjqEw5tQ0P_0mX0GvoGJ1RNOeA9YkVAsK_SUCxrB5flyFJeyIvKMY5LcxrDAgmyHx12E8pTJWQZ1dJVArlWTzEsivnSO5t94DU6TB4fJKzbd0RJvtkucIEg8Ru-Yfe2N9jRsqpT06a-7d0G3nGd6itkQCfTATz5K_5aMa6I_5kB72GERA9HkVTG1RLp7nSn8CWPM7NmaZT0SAksrzlKfP3gphfd4QWfT4UhIL2UA"
    },
    {
      name: "Dr. Mark Ross",
      specialty: "Hematologist",
      status: "Room 302",
      statusType: "in-person",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAah71yzOcaCPS3iSjs5EjrZX2CDavOkYz_IS_fYISxhgcliJT12zcXA6SNN3k3yXQo-IzpeuqSXRiqvvE-kTCysKa39c_GV_ck_B4mSUkr26DiBBLPMtLvyGtiCgXFUuxXlypXfW28M2-PizLoyNalJU1ArkhpCeyy0Qh1Cey3Eo4QbSgITJdq0x2ZY9tkktDB6yaR37ORhHf3oIa_eesiWO3JCRaM91rhj4gDmhdfR-OM9e2NyFTv-pqeVVD4W1xxUTD1RcTh0g"
    }
  ]

  const busyDoctors = [
    {
      name: "Dr. Sarah Lee",
      specialty: "Radiologist",
      status: "In Surgery",
      timeLeft: "~45m left",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmKZn89cHc9GTgvk50-SUjgjBJRaljZFDNZtjhLUZVGmJ-W7jxyefzEAPe5c-eLWje2I42QckN3bAu5DSX_i-jFKq1xgffkbxTXpkDNXioyjulP5_8sIXYvl1YvdE1QfCgeK_csNaOVVenkCqeDfBHWNxhNXtqPeuPxoEfQnXBLscAK33hIUtLFzTaRH9LuSZT_xk-hkWwjWanoe9Bz7-3MouGAq4Dy8iVkshy4GrpFegE_BY0vV7UTq4tb7RPxWYfOjZzU7Xm_A"
    },
    {
      name: "Dr. James Wu",
      specialty: "Oncologist",
      status: "Consultation",
      timeLeft: "~10m left",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsjxUnSY9ibAb1o15wuohiAukHKquH2bgmfDH3UUyC3qCuZv6SfI0qgy-jT6i32f4rNXqwOVfy9W_YOPgNE1vhI8S8WTCmK1kgTGGIIf_6BMvV1jp1uRDgvnkG9RKX1A6NzjWi8O1IMv26jqgL_L_u2JjXUDKqN2oZzH3D_2WkkIQXN5z401Urzi8lQl0szJaKJaaVQBVZLQ4PvuOv5JCt1URDjqLsAYzrgOYAaHz-q50ydgZoH9NL-pNuoMjtnm4vmk6wFuRGiQ"
    }
  ]

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
            {availableDoctors.map((doctor, index) => (
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
            ))}
          </div>
        </div>

        {/* Busy Doctors */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[#111418] dark:text-white text-lg font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-orange-400"></span>
            Busy Doctors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {busyDoctors.map((doctor, index) => (
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
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DoctorsStatus