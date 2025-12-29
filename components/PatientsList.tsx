'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useVideoCall } from '../contexts/VideoCallContext'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'

const PatientsList = () => {
  const { startVideoCall } = useVideoCall()
  const router = useRouter()
  const [allPatients, setAllPatients] = useState<any[]>([])
  const { doctor } = useDoctor()
  const { nurse } = useNurse()
  
  const getPatientUrl = (patientId: string) => {
    if (nurse) {
      return `/nurse-portal/patients/${patientId}`
    } else {
      return `/doctor/patients/${patientId}`
    }
  }
  
  const getNewVisitUrl = (patientId: string) => {
    if (nurse) {
      return `/nurse-portal/patients/${patientId}/new-visit`
    } else {
      return `/doctor/patients/${patientId}/new-visit`
    }
  }

  useEffect(() => {
    loadAllPatients()
    
    // Refresh patient list when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllPatients()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadAllPatients = () => {
    // Load patients using PatientDataManager for proper isolation
    const savedPatients = PatientDataManager.getAllPatients()
    
    // Combine with hardcoded patients
    const combinedPatients = [...patients, ...savedPatients]
    setAllPatients(combinedPatients)
  }

  const handleVideoCall = (patientEmail: string, patientName: string) => {
    startVideoCall(patientName, patientEmail)
  }

  const handleAddPatient = () => {
    // Generate new patient ID
    const newPatientId = Date.now().toString()
    router.push(getNewVisitUrl(newPatientId))
  }

  const patients = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
      name: 'Floyd Miles',
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
      id: '4',
      name: 'Priscilla Watson',
      email: 'priscilla.watson@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQcJt52dizwDtGf45WpCO6vopDcxPbd5yuMrSCpdxayx11kPTJZ_GjG4Y6Xgl1TbghgzvtFWLIGelo-Fxj-bGZ8A376zL17HkmTdorYCl3nfiBz72scd8XlbUmBX6YQspbXcbxbFkQUTPTXEdS-C6gVb3HjEFuRZTx-cEbNJzHdeAVy4urxpQCYrOtCd4ajzjB5kPInjmjtA_VBV-yBuziJ_7kaJu1R77dtvCar9Shld9bBFXkhhy4sJTjiYDezoyqu7FFWDJVOjlf',
      gender: 'Female, 31y',
      physician: 'Francisco',
      lastConsultation: 'Feb 29, 2012',
      appointment: '15 May 2020 8:00 am',
      status: 'Under Treatment',
      statusColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300'
    },
    {
      id: '5',
      name: 'Kristin Cooper',
      email: 'kristin.cooper@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBND33UlxfyQf7bGCgf6yYJWaIXmgwaY-20q065AMJUI3nipA3UtIzu5_4Q9jRZXHFycvDCgMX2zi74pLixUcIyy7a62e11MoYNIHtY3W_2jsGGG2-MyuG1_I3GtyYBZgec4_YbgxaKs_Rm-8wEXuYJI0d92kIGbF-v1LvrbMKaoKmauJyqjhOnNuQrZg8JfD1eyIkBtktZCDbOkEpc5YoSi2OrmBbmADN7zhIKazL-82ZskjOw8UokQDWZq8BejBkanoB3YZzf353t',
      gender: 'Female, 28y',
      physician: 'Harold',
      lastConsultation: 'Mar 6, 2018',
      appointment: '15 May 2020 9:30 am',
      status: 'Under Observation',
      statusColor: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300'
    },
    {
      id: '6',
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
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
    <div className="col-span-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patients List</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all patient information</p>
        </div>
        <button 
          onClick={handleAddPatient}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Patient
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPatients.map((patient, index) => (
          <Link 
            key={index}
            href={getPatientUrl(patient.id)}
            className="block bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-start gap-4 mb-4">
              <img 
                alt={patient.name} 
                className="w-12 h-12 rounded-full object-cover" 
                src={patient.image}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{patient.name}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{patient.email}</p>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleVideoCall(patient.email, patient.name)
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white p-1 rounded flex items-center justify-center transition-colors"
                    title="Start Video Call"
                  >
                    <span className="material-symbols-outlined text-sm">videocam</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Gender, Age</span>
                <span className="font-medium text-gray-900 dark:text-white">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Physician</span>
                <span className="font-medium text-gray-900 dark:text-white">{patient.physician}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Visit</span>
                <span className="font-medium text-gray-900 dark:text-white">{patient.lastConsultation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Next Appointment</span>
                <span className="font-medium text-gray-900 dark:text-white">{patient.appointment}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${patient.statusColor}`}>
                {patient.status}
              </span>
              <button className="text-primary hover:text-primary/80 transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default PatientsList