'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

interface VisitDetailProps {
  patientId: string
  visitId: string
}

export default function VisitDetail({ patientId, visitId }: VisitDetailProps) {
  const pathname = usePathname()
  const basePath = pathname.startsWith('/nurse-portal')
    ? '/patients'
    : pathname.startsWith('/doctor')
      ? '/doctor/patients'
      : '/patients'
  const [openSections, setOpenSections] = useState({
    demographics: true,
    complaint: true,
    assessment: true
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`${basePath}/${patientId}/history`} className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-base">arrow_back</span> Back to History
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            Visit Record
            <span className="text-lg font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">Not recorded</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Patient: <span className="font-semibold text-gray-800 dark:text-gray-200">Not recorded</span> (ID: --)</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl flex items-center shadow-sm transition-all text-sm font-medium">
            <span className="material-symbols-outlined text-lg mr-2">print</span>
            Print Record
          </button>
          <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center shadow-lg transition-all text-sm font-medium">
            <span className="material-symbols-outlined text-lg mr-2">edit_document</span>
            Edit Record
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="material-symbols-outlined mr-2 text-red-500">monitor_heart</span> Vital Signs
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">BP</span>
                <span className="font-bold text-gray-800 dark:text-white">--</span>
                <span className="text-[10px] text-gray-400">mmHg</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">HR</span>
                <span className="font-bold text-gray-800 dark:text-white">--</span>
                <span className="text-[10px] text-gray-400">bpm</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Temp</span>
                <span className="font-bold text-gray-800 dark:text-white">--</span>
                <span className="text-[10px] text-gray-400">°F</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Weight</span>
                <span className="font-bold text-gray-800 dark:text-white">--</span>
                <span className="text-[10px] text-gray-400">kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="material-symbols-outlined mr-2 text-blue-500">info</span> Visit Details
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Visit Type</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">Not recorded</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Provider</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">Not recorded</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Priority</span>
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300 px-2 py-0.5 rounded-md">—</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          {/* Demographics Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('demographics')}
              className="w-full flex justify-between items-center font-semibold p-5 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                Patient Demographics & Contact
              </div>
              <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${openSections.demographics ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {openSections.demographics && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Full Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Not recorded</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Date of Birth / Age</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Not recorded</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Sex / Gender</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Not recorded</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Contact Phone</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Not recorded</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Not recorded</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Insurance</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Not recorded</p>
                </div>
              </div>
            )}
          </div>

          {/* Chief Complaint Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('complaint')}
              className="w-full flex justify-between items-center font-semibold p-5 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600">
                  <span className="material-symbols-outlined">report_problem</span>
                </div>
                Chief Complaint & History of Present Illness
              </div>
              <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${openSections.complaint ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {openSections.complaint && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chief Complaint</h5>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                    <p className="text-sm text-gray-800 dark:text-gray-200">No chief complaint recorded.</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-500 text-gray-500 dark:text-gray-400">Duration: —</span>
                      <span className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-500 text-gray-500 dark:text-gray-400">Severity: —</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">History of Present Illness (HPI)</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    No HPI recorded.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Assessment & Plan Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('assessment')}
              className="w-full flex justify-between items-center font-semibold p-5 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                  <span className="material-symbols-outlined">clinical_notes</span>
                </div>
                Assessment & Plan
              </div>
              <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${openSections.assessment ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {openSections.assessment && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <h5 className="text-indigo-800 dark:text-indigo-300 font-semibold mb-3 flex items-center">
                      <span className="material-symbols-outlined mr-2 text-sm">diagnosis</span> Assessment / Diagnosis
                    </h5>
                    <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <li className="font-medium">No assessment recorded.</li>
                    </ol>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <h5 className="text-blue-800 dark:text-blue-300 font-semibold mb-3 flex items-center">
                      <span className="material-symbols-outlined mr-2 text-sm">medication</span> Treatment Plan
                    </h5>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-xs mt-1 text-blue-500">check_circle</span>
                        <span>No treatment plan recorded.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                <span className="material-symbols-outlined">signature</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Signed electronically by</p>
                <h4 className="font-bold text-gray-800 dark:text-white">Not recorded</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">—</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="text-sm text-primary hover:underline">View Audit Log</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
