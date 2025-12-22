'use client'

const PatientCards = () => {
  const patients = [
    {
      name: 'Leslie Alexander',
      email: 'willie.jennings@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3ICbZ8z0Efd_JndI0nxLf1xoPT9Qu5u7JOVQk1C4v9jvf9Imxxeihie4tzXRP0fxByp_jZ5-t8ZaRReubpV0Ot7RZKtjdd8nGeVTenCfxbFkmtAsfproneHcg9ObslryS-maUvfjOKzKMwNQty7FtvQQQxjA1isNwGRxWyk22ra2LTOLu7zUo-PaEREQDs7soTQIxrs7kYcD34Y4qyjxuDJhM3QFIVNUMAuKPbslsBc8K2Zv2KbHENeK-FlWUql8LUgxgSwU-4cl',
      gender: 'Male, 24y',
      physician: 'Ronald',
      lastConsultation: 'May 12, 2019',
      appointment: '15 May 2020 8:00 am',
      status: 'Under Observation',
      statusColor: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300'
    },
    {
      name: 'Fasai Areyanukul',
      email: 'bill.sanders@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7cX2N5PAYQQYKeTZCChu9V-kKQ6oLld3qEGsLOcsxz9wxJnZ4MHm8vODF3vDAfPcHBNr_2lPGv-wGuKR3i1PooKlMxa-dtEhRDVhZKBcn-El1DuKIy_vyZP0tRxv4VvQasu_ChxmEENKNNFQEYIkN-q6Wm_9VxyTDdaBhRW7nIYDVEdxmY-jebpQHdsP9Bu_Yyd7acQrYbXXZP8EYuorit3URzhCcOg70H7Jn4nyYU9fmV51Z6JpBptw0e_KY3qfPvDaIk5OMVEJ-',
      gender: 'Female, 25y',
      physician: 'Cameron',
      lastConsultation: 'May 20, 2015',
      appointment: '15 May 2020 9:00 am',
      status: 'Recovered',
      statusColor: 'text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-300'
    },
    {
      name: 'Floyd',
      email: 'michelle.rivera@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkYXI4KNL6NZoePB7dpbH3Ykhmh2FAnHVlp9MhDP767W195T2pwnLLqczoce4_EG8d92aJ-9NNGtvsLxyl9cUXqA4EvHj6QXu3aBiQSPflYC2Eho3PYnzk834VCgTPJozDklOysKyOcRE2xWH6nvOvTd56wMXYM05mosd52cCeZn6ySOpJ4g5V7Qs_7VZ4LZvRjSfSr5kwUM4EXEgPdCW87_m2ngA4QuzgJokb3qixoDYRIihEMPJY4TpDyvHorAUo6JLWTHwjVXp5',
      gender: 'Male, 24y',
      physician: 'Brandon',
      lastConsultation: 'Sep 24, 2017',
      appointment: '15 May 2020 9:30 am',
      status: 'Under Treatment',
      statusColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300'
    },
    {
      name: 'Priscilla',
      email: 'michelle.rivera@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQcJt52dizwDtGf45WpCO6vopDcxPbd5yuMrSCpdxayx11kPTJZ_GjG4Y6Xgl1TbghgzvtFWLIGelo-Fxj-bGZ8A376zL17HkmTdorYCl3nfiBz72scd8XlbUmBX6YQspbXcbxbFkQUTPTXEdS-C6gVb3HjEFuRZTx-cEbNJzHdeAVy4urxpQCYrOtCd4ajzjB5kPInjmjtA_VBV-yBuziJ_7kaJu1R77dtvCar9Shld9bBFXkhhy4sJTjiYDezoyqu7FFWDJVOjlf',
      gender: 'Female, 31y',
      physician: 'Francisco',
      lastConsultation: 'Feb 29, 2012',
      appointment: '15 May 2020 8:00 am',
      status: 'Under Treatment',
      statusColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300'
    },
    {
      name: 'Kristin',
      email: 'willie.jennings@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBND33UlxfyQf7bGCgf6yYJWaIXmgwaY-20q065AMJUI3nipA3UtIzu5_4Q9jRZXHFycvDCgMX2zi74pLixUcIyy7a62e11MoYNIHtY3W_2jsGGG2-MyuG1_I3GtyYBZgec4_YbgxaKs_Rm-8wEXuYJI0d92kIGbF-v1LvrbMKaoKmauJyqjhOnNuQrZg8JfD1eyIkBtktZCDbOkEpc5YoSi2OrmBbmADN7zhIKazL-82ZskjOw8UokQDWZq8BejBkanoB3YZzf353t',
      gender: 'Female, 28y',
      physician: 'Harold',
      lastConsultation: 'Mar 6, 2018',
      appointment: '15 May 2020 9:30 am',
      status: 'Under Observation',
      statusColor: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300'
    },
    {
      name: 'Fasai Areyanukul',
      email: 'bill.sanders@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvf9E1G28WaRU1QDXg1gUnhO6xdZeorQb3yU53a92Ca0BYNMVXLlWyFdov9aXc4C2aWE9iwnfdcYAerHahm5WCbXVkYTs65fViT3QmbuezG3yx79I1xh4hHrvDGR1LQPQ59KRyXTAHMvyFUkgd-uTVXCbgvV5tb-E97ShchONf0v100sEATzmLW7xKWwm3C3t1ablPOe-y1gFEPJ3h6MEAzTidBzjqeKazF0jL8bBGJ5oMCclFm0oX_Ycf9VRwU5GFwq61wyqrjOj-',
      gender: 'Male, 22y',
      physician: 'Kathryn',
      lastConsultation: 'Nov 28, 2015',
      appointment: '15 May 2020 8:00 am',
      status: 'Recovered',
      statusColor: 'text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-300'
    }
  ]

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-6">
      {patients.map((patient, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 group"
        >
          <div className="flex items-start gap-4 mb-6">
            <img 
              alt={patient.name} 
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900" 
              src={patient.image}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-white truncate">{patient.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{patient.email}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                  <span className="material-icons-outlined text-[12px] mr-1">call</span> Phone
                </button>
                <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                  <span className="material-icons-outlined text-[12px] mr-1">monitor_heart</span> Live Vital
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
            <div className="text-gray-500 dark:text-gray-400">Gender, Age</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.gender}</div>
            <div className="text-gray-500 dark:text-gray-400">Physician</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.physician}</div>
            <div className="text-gray-500 dark:text-gray-400">Last Consultation</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.lastConsultation}</div>
            <div className="text-gray-500 dark:text-gray-400">Appointments</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.appointment}</div>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${patient.statusColor}`}>
                {patient.status}
              </span>
            </div>
            <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
              <span className="material-icons-outlined text-sm">arrow_downward</span>
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

export default PatientCards