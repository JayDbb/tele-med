'use client'

import Link from 'next/link'
import NurseSidebar from '@/components/NurseSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function NursePortalPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          <Link href="/nurse/new-patient" className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Patient Intake
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nurse Dashboard</h2>
                <p className="text-slate-600 dark:text-gray-400">Monday, Oct 24 • Shift A</p>
              </div>
            </div>

            {/* Doctors Status Section */}
            <section>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Available Doctors */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-gray-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    Available Doctors
                  </h2>
                  <a className="text-primary text-sm font-bold hover:underline" href="#">View All</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer group">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 group-hover:scale-105 transition-transform" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBBA0LuUPvPheNTBMOBEDsV3g3prL1Xqs0FFDmjqEw5tQ0P_0mX0GvoGJ1RNOeA9YkVAsK_SUCxrB5flyFJeyIvKMY5LcxrDAgmyHx12E8pTJWQZ1dJVArlWTzEsivnSO5t94DU6TB4fJKzbd0RJvtkucIEg8Ru-Yfe2N9jRsqpT06a-7d0G3nGd6itkQCfTATz5K_5aMa6I_5kB72GERA9HkVTG1RLp7nSn8CWPM7NmaZT0SAksrzlKfP3gphfd4QWfT4UhIL2UA")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. Emily Chen</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">Remote</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Oncologist</p>
                      <div className="flex items-center gap-1 mt-1 text-green-600 dark:text-green-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[14px]">videocam</span>
                        Online
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer group">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 group-hover:scale-105 transition-transform" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAah71yzOcaCPS3iSjs5EjrZX2CDavOkYz_IS_fYISxhgcliJT12zcXA6SNN3k3yXQo-IzpeuqSXRiqvvE-kTCysKa39c_GV_ck_B4mSUkr26DiBBLPMtLvyGtiCgXFUuxXlypXfW28M2-PizLoyNalJU1ArkhpCeyy0Qh1Cey3Eo4QbSgITJdq0x2ZY9tkktDB6yaR37ORhHf3oIa_eesiWO3JCRaM91rhj4gDmhdfR-OM9e2NyFTv-pqeVVD4W1xxUTD1RcTh0g")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. Mark Ross</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 uppercase">In-Person</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Hematologist</p>
                      <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                        Room 302
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Busy Doctors */}
              <div className="flex flex-col gap-4">
                <h2 className="text-gray-900 dark:text-white text-lg font-bold flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orange-400" />
                  Busy Doctors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 cursor-pointer">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 grayscale" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmKZn89cHc9GTgvk50-SUjgjBJRaljZFDNZtjhLUZVGmJ-W7jxyefzEAPe5c-eLWje2I42QckN3bAu5DSX_i-jFKq1xgffkbxTXpkDNXioyjulP5_8sIXYvl1YvdE1QfCgeK_csNaOVVenkCqeDfBHWNxhNXtqPeuPxoEfQnXBLscAK33hIUtLFzTaRH9LuSZT_xk-hkWwjWanoe9Bz7-3MouGAq4Dy8iVkshy4GrpFegE_BY0vV7UTq4tb7RPxWYfOjZzU7Xm_A")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. Sarah Lee</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Radiologist</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">In Surgery</span>
                        <span className="text-[10px] text-gray-400">~45m left</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 cursor-pointer">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 grayscale" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAsjxUnSY9ibAb1o15wuohiAukHKquH2bgmfDH3UUyC3qCuZv6SfI0qgy-jT6i32f4rNXqwOVfy9W_YOPgNE1vhI8S8WTCmK1kgTGGIIf_6BMvV1jp1uRDgvnkG9RKX1A6NzjWi8O1IMv26jqgL_L_u2JjXUDKqN2oZzH3D_2WkkIQXN5z401Urzi8lQl0szJaKJaaVQBVZLQ4PvuOv5JCt1URDjqLsAYzrgOYAaHz-q50ydgZoH9NL-pNuoMjtnm4vmk6wFuRGiQ")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. James Wu</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Oncologist</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">Consultation</span>
                        <span className="text-[10px] text-gray-400">~10m left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </section>

            {/* Recent Patients Table */}
            <section className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">Recent Patients</h2>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
            </div>
            
            <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Patient</th>
                      <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Time In</th>
                      <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Symptoms</th>
                      <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Severity</th>
                      <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Assigned To</th>
                      <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA_uU_6EW7lp02luTc4w49mVxu8-uT39xrYBdHCEbJTsi-6ph7S4cJ9SbvbbcIHv_jHdIHvXoUaKT6wW0hev_5U7bVZOyIB0T6KJBv7kUGpelIpqbIZtcPRBoVbhgvtsWdPNvq_2PvbLKK0X1g1aYb2QgfU8mfrht2NClJKkUAiq0C6ggY5i_8TBobwX0JwXd1EJ95DVUdS2ZoQ42U5ed91QuydTdkrAeuqAvXPEy1Ir3S6q1JFCoWUzrPQlCTsLgtawiUNYYJlSw")'}} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">Jane Doe</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">45 F • ID #9201</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300 font-medium">10:42 AM</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300">Severe Nausea, Dizziness</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <span className="size-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                          High
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-gray-200 bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBBk58NG6pgu9iA8jstuD-3XWLoxlR4-CH6s9bwVM9GtIVKH8LwM5onhvhUPHuAFrHnKJfD4-mDs8p_pDAfqCU0EUNQG-uh-xUy8a2zajumwXsVlU0E4rH4RFWOke5AU_yVTT5qy4A-imToZ7Nu8xRA5vsYBh3S3J3mGgrABhOAoFquQN6BuS1enBwusFsPBEQf2LcUwIFSAIbOCbo5ull43sFc-wK-CjXe1uE1el44Bs4l9VVKSNF6ml557NZVQseNyB7HjImUnw")'}} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Dr. Chen</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    
                    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmFyoBAV8HYo-6hIQUlhxpdN4VoiBlaIZbR79qwH9MBpDilKlB4-pYlGN3vbrEhRe8aBvEzbT4AJhGyCWmyxu8j3loDCyCBcj0IkaVs_F61bDrn6jYIH3a7WBA0N1XHexz_DupPubcBTmeEEt3WFgfaC5lvfS9HrKO8Zu3T5UQp-X4UWaddMMmnpkvmD_dt_aDPpEWVaPDFXeUctnjkZrRwSJrgljjq6xQHN-HG-eqYBBFpasABQAdKjkoA1Z5anhxMA5Ea-jwWw")'}} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">John Smith</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">62 M • ID #8842</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300 font-medium">10:15 AM</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300">Routine Checkup, Fatigue</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <span className="size-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                          Stable
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-gray-200 bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBhojKY7rMx1vMjyp0oNaNKc2u0wW_4jhzOJdzC0hrfvP5hypOsBJS8kATNJj2lUk3sYuzy_J3VCWFAxHn8hUfXGoYFGGKR6YaLv2JCSvIkYGtuXBP50jY6j4sRj5KPBWyxpSS4AxLwjR_hK5Rk1Az4H8kcUgsv__4vq6XgCwIIYPWg7ehDOLJyCXC_R1rmLy19ECHP75RLHwmPQgXs-DFP-eO9NGHAQFEpTlE6fYE-2Ji-heOLM2Mp94Or2cBK2HENLpq6LEzIQ")'}} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Dr. Ross</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    
                    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCwfgRjDRF0l-hBWzf8C2Eo8cnOAEt7tGxs-Nlhhq5i876gastjYfQ2oWRkiXP5SdfCxvaBOn81heoHP58q-SZU9aQaJoBPplpcM4iIxb8DHjxRjQP8AfT54fOMf0D165Cm6y29xT3RZ7liZ4-I_2ziL5q9YqUzw1AwvH9OtF7ZSin3CTI0M0HHVJeu9CZ9VxANId-33n6_ueS4913ui9CLCm3VRJcwIJQxMP4ehftkilyzm-Nbp09nypmSUjJr06FBiIB6MmhSwg")'}} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">Maria Garcia</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">55 F • ID #9321</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300 font-medium">09:55 AM</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300">Chemo Follow-up</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <span className="size-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                          Moderate
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-gray-200 bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD2vw4u4a7Pp5XSYDZ69lrn5ecOn58oSBUKsndIEIUL4rytfbjdEzxZSb5iTFoLzbwCbb56XGiMZSAKdlyZ1tHSKOVNczueI17ufvJzl73mH5TjqwMvITUrPVEo-TgE3Lv_hzrxPTzm-tVFcSEByZVpy0zDl_Ki0oJkx6g9ZuY9DTgizKsDT_LRwz-ZK3tLMyLdPyEFz5tGUGJV_q0CHgZK8mP7LZ7MiY1LomvL_JVv03FS4cuuPPgm_zJw4f19ljOG886JGrkadQ")'}} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Dr. Wu</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    
                    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDmOTeQh-tEyzw4zo9_sgwges11R8N464TTkVbXhgx0mt5RSVOIfcZkZTfAiVv2CHDTrV-J7lcf2BuFc9asbaHArsupYqXu9D7hKIfv1GeokeS3nDE49dnr20vP-iexgUQO0CIFpdi9R3WQqZ7a7C5AF0x7HViQW-sCVxYvfAzzHLUBxwNIZe9DSa8D5aynIWrAVO33PKIPExXiIXY5Zlduj1HFPWtKwyZTRltTlCp2RlNtLEUzL4XcaTgHqjkny0hdZQwL3V7U0w")'}} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">Robert Johnson</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">71 M • ID #7822</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300 font-medium">09:30 AM</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-gray-300">Joint Pain, Fever</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <span className="size-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                          Moderate
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-gray-200 bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAY-By0TC5E8s2LtDxstefKLYxeMUnEGNa3dBqMFrXd6JQtkqsEDZKy5h88NDx1sjRx6ijtFxiKmpYI_QDZbPac6tMVxSb7sB28JHwVNIqwm5koe4cnJKTnD3dbwcF4vELjtYyp3Meu3AJXH6n_tSRucLxOaUr2HW5wqc_infXoWkKDDN_yoNRQFL1VW5dSaTzHkn9un27958PzpeJc_yQpbGDRtZq1hsknJXB9hVhNnhFaCJulxSyd0MWXjkqMOUGQ-BkiwZ751A")'}} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Dr. Chen</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Showing 4 of 12 patients</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600">Previous</button>
                  <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600">Next</button>
                </div>
              </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}