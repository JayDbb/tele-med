'use client'

const RecentPatients = () => {
  const patients = [
    {
      name: "Jane Doe",
      age: "45 F",
      id: "#9201",
      timeIn: "10:42 AM",
      date: "Today",
      symptoms: "Severe Nausea, Dizziness",
      severity: "High",
      severityColor: "red",
      assignedTo: "Dr. Chen",
      doctorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBk58NG6pgu9iA8jstuD-3XWLoxlR4-CH6s9bwVM9GtIVKH8LwM5onhvhUPHuAFrHnKJfD4-mDs8p_pDAfqCU0EUNQG-uh-xUy8a2zajumwXsVlU0E4rH4RFWOke5AU_yVTT5qy4A-imToZ7Nu8xRA5vsYBh3S3J3mGgrABhOAoFquQN6BuS1enBwusFsPBEQf2LcUwIFSAIbOCbo5ull43sFc-wK-CjXe1uE1el44Bs4l9VVKSNF6ml557NZVQseNyB7HjImUnw",
      patientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_uU_6EW7lp02luTc4w49mVxu8-uT39xrYBdHCEbJTsi-6ph7S4cJ9SbvbbcIHv_jHdIHvXoUaKT6wW0hev_5U7bVZOyIB0T6KJBv7kUGpelIpqbIZtcPRBoVbhgvtsWdPNvq_2PvbLKK0X1g1aYb2QgfU8mfrht2NClJKkUAiq0C6ggY5i_8TBobwX0JwXd1EJ95DVUdS2ZoQ42U5ed91QuydTdkrAeuqAvXPEy1Ir3S6q1JFCoWUzrPQlCTsLgtawiUNYYJlSw"
    },
    {
      name: "John Smith",
      age: "62 M",
      id: "#8842",
      timeIn: "10:15 AM",
      date: "Today",
      symptoms: "Routine Checkup, Fatigue",
      severity: "Stable",
      severityColor: "green",
      assignedTo: "Dr. Ross",
      doctorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBhojKY7rMx1vMjyp0oNaNKc2u0wW_4jhzOJdzC0hrfvP5hypOsBJS8kATNJj2lUk3sYuzy_J3VCWFAxHn8hUfXGoYFGGKR6YaLv2JCSvIkYGtuXBP50jY6j4sRj5KPBWyxpSS4AxLwjR_hK5Rk1Az4H8kcUgsv__4vq6XgCwIIYPWg7ehDOLJyCXC_R1rmLy19ECHP75RLHwmPQgXs-DFP-eO9NGHAQFEpTlE6fYE-2Ji-heOLM2Mp94Or2cBK2HENLpq6LEzIQ",
      patientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmFyoBAV8HYo-6hIQUlhxpdN4VoiBlaIZbR79qwH9MBpDilKlB4-pYlGN3vbrEhRe8aBvEzbT4AJhGyCWmyxu8j3loDCyCBcj0IkaVs_F61bDrn6jYIH3a7WBA0N1XHexz_DupPubcBTmeEEt3WFgfaC5lvfS9HrKO8Zu3T5UQp-X4UWaddMMmnpkvmD_dt_aDPpEWVaPDFXeUctnjkZrRwSJrgljjq6xQHN-HG-eqYBBFpasABQAdKjkoA1Z5anhxMA5Ea-jwWw"
    },
    {
      name: "Maria Garcia",
      age: "55 F",
      id: "#9321",
      timeIn: "09:55 AM",
      date: "Today",
      symptoms: "Chemo Follow-up",
      severity: "Moderate",
      severityColor: "orange",
      assignedTo: "Dr. Wu",
      doctorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2vw4u4a7Pp5XSYDZ69lrn5ecOn58oSBUKsndIEIUL4rytfbjdEzxZSb5iTFoLzbwCbb56XGiMZSAKdlyZ1tHSKOVNczueI17ufvJzl73mH5TjqwMvITUrPVEo-TgE3Lv_hzrxPTzm-tVFcSEByZVpy0zDl_Ki0oJkx6g9ZuY9DTgizKsDT_LRwz-ZK3tLMyLdPyEFz5tGUGJV_q0CHgZK8mP7LZ7MiY1LomvL_JVv03FS4cuuPPgm_zJw4f19ljOG886JGrkadQ",
      patientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwfgRjDRF0l-hBWzf8C2Eo8cnOAEt7tGxs-Nlhhq5i876gastjYfQ2oWRkiXP5SdfCxvaBOn81heoHP58q-SZU9aQaJoBPplpcM4iIxb8DHjxRjQP8AfT54fOMf0D165Cm6y29xT3RZ7liZ4-I_2ziL5q9YqUzw1AwvH9OtF7ZSin3CTI0M0HHVJeu9CZ9VxANId-33n6_ueS4913ui9CLCm3VRJcwIJQxMP4ehftkilyzm-Nbp09nypmSUjJr06FBiIB6MmhSwg"
    },
    {
      name: "Robert Johnson",
      age: "71 M",
      id: "#7822",
      timeIn: "09:30 AM",
      date: "Today",
      symptoms: "Joint Pain, Fever",
      severity: "Moderate",
      severityColor: "orange",
      assignedTo: "Dr. Chen",
      doctorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY-By0TC5E8s2LtDxstefKLYxeMUnEGNa3dBqMFrXd6JQtkqsEDZKy5h88NDx1sjRx6ijtFxiKmpYI_QDZbPac6tMVxSb7sB28JHwVNIqwm5koe4cnJKTnD3dbwcF4vELjtYyp3Meu3AJXH6n_tSRucLxOaUr2HW5wqc_infXoWkKDDN_yoNRQFL1VW5dSaTzHkn9un27958PzpeJc_yQpbGDRtZq1hsknJXB9hVhNnhFaCJulxSyd0MWXjkqMOUGQ-BkiwZ751A",
      patientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmOTeQh-tEyzw4zo9_sgwges11R8N464TTkVbXhgx0mt5RSVOIfcZkZTfAiVv2CHDTrV-J7lcf2BuFc9asbaHArsupYqXu9D7hKIfv1GeokeS3nDE49dnr20vP-iexgUQO0CIFpdi9R3WQqZ7a7C5AF0x7HViQW-sCVxYvfAzzHLUBxwNIZe9DSa8D5aynIWrAVO33PKIPExXiIXY5Zlduj1HFPWtKwyZTRltTlCp2RlNtLEUzL4XcaTgHqjkny0hdZQwL3V7U0w"
    }
  ]

  const getSeverityStyles = (severity: string, color: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
    
    switch (color) {
      case 'red':
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`
      case 'green':
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`
      case 'orange':
        return `${baseClasses} bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400`
    }
  }

  const getDotColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-600 dark:bg-red-400'
      case 'green':
        return 'bg-green-600 dark:bg-green-400'
      case 'orange':
        return 'bg-orange-600 dark:bg-orange-400'
      default:
        return 'bg-gray-600 dark:bg-gray-400'
    }
  }

  return (
    <section className="flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <h2 className="text-[#111418] dark:text-white text-xl font-bold">Recent Patients</h2>
        <div className="flex gap-2">
          <button className="p-2 text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="p-2 text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-surface-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-[#dbe0e6] dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Patient</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Time In</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Symptoms</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Severity</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs">Assigned To</th>
                <th className="px-6 py-4 font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbe0e6] dark:divide-gray-800">
              {patients.map((patient, index) => (
                <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10"
                        style={{backgroundImage: `url("${patient.patientAvatar}")`}}
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111418] dark:text-white">{patient.name}</span>
                        <span className="text-xs text-[#617589] dark:text-gray-500">{patient.age} • ID {patient.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#111418] dark:text-gray-300 font-medium">{patient.timeIn}</span>
                    <p className="text-xs text-[#617589] dark:text-gray-500">{patient.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#111418] dark:text-gray-300">{patient.symptoms}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getSeverityStyles(patient.severity, patient.severityColor)}>
                      <span className={`size-1.5 rounded-full ${getDotColor(patient.severityColor)}`}></span>
                      {patient.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="size-6 rounded-full bg-gray-200 bg-cover"
                        style={{backgroundImage: `url("${patient.doctorAvatar}")`}}
                      />
                      <span className="text-sm font-medium text-[#111418] dark:text-gray-300">{patient.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#617589] hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#dbe0e6] dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-xs text-[#617589] dark:text-gray-400">Showing 4 of 12 patients</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-[#dbe0e6] dark:border-gray-700 text-xs font-medium text-[#617589] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700">
              Previous
            </button>
            <button className="px-3 py-1 rounded border border-[#dbe0e6] dark:border-gray-700 text-xs font-medium text-[#617589] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecentPatients