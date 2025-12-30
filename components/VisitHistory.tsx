'use client'

import { useState } from 'react'

interface VisitHistoryProps {
  patientId: string
}

const VisitHistory = ({ patientId }: VisitHistoryProps) => {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null)

  const getVisitsForPatient = (patientId: string) => {
    const patientVisits = {
      '7': [ // Mary Johnson
        {
          id: '1',
          date: '2023-10-20',
          time: '09:15 AM',
          type: 'BP Check',
          provider: 'Dr. Emily Chen',
          chiefComplaint: 'Routine blood pressure monitoring',
          hpi: 'Patient here for routine BP check. Reports taking medications as prescribed.',
          assessmentPlan: 'BP elevated at 145/92. Increase Lisinopril to 15mg daily. RTC in 2 weeks.',
          vitals: { bp: '145/92', hr: '78', temp: '98.4', weight: '165', height: '5\'4"', bmi: '28.3' },
          signature: {
            signedBy: 'Dr. Emily Chen, MD',
            signedDate: '2023-10-20 10:30 AM',
            status: 'Signed',
            cosignRequired: false
          }
        }
      ],
      '8': [ // Robert Smith
        {
          id: '1',
          date: '2023-10-18',
          time: '09:25 AM',
          type: 'Screening',
          provider: 'Dr. Mark Ross',
          chiefComplaint: 'Annual health screening',
          hpi: 'Patient here for routine annual screening. No acute complaints.',
          assessmentPlan: 'Overall good health. Continue current medications. Lab work ordered.',
          vitals: { bp: '128/82', hr: '72', temp: '98.6', weight: '180', height: '5\'10"', bmi: '25.8' },
          signature: {
            signedBy: 'Dr. Mark Ross, MD',
            signedDate: '2023-10-18 10:45 AM',
            status: 'Signed',
            cosignRequired: false
          }
        }
      ],
      '9': [ // Patricia Davis
        {
          id: '1',
          date: '2023-10-15',
          time: '09:30 AM',
          type: 'Follow-up',
          provider: 'Dr. Sarah Lee',
          chiefComplaint: 'Follow-up for diabetes management',
          hpi: 'Patient reports good glucose control. No hypoglycemic episodes.',
          assessmentPlan: 'Diabetes well controlled. Continue Metformin. A1C in 3 months.',
          vitals: { bp: '135/85', hr: '68', temp: '98.2', weight: '155', height: '5\'6"', bmi: '25.0' },
          signature: {
            signedBy: 'Dr. Sarah Lee, MD',
            signedDate: '2023-10-15 11:15 AM',
            status: 'Signed',
            cosignRequired: false
          }
        }
      ],
      '10': [ // James Wilson
        {
          id: '1',
          date: '2023-10-22',
          time: '09:35 AM',
          type: 'Lab Review',
          provider: 'Dr. James Wu',
          chiefComplaint: 'Review of recent laboratory results',
          hpi: 'Patient here to review lab results from last week.',
          assessmentPlan: 'Lab results within normal limits. Continue current regimen.',
          vitals: { bp: '122/78', hr: '70', temp: '98.6', weight: '175', height: '5\'11"', bmi: '24.4' },
          signature: {
            signedBy: 'Dr. James Wu, MD',
            signedDate: '2023-10-22 10:20 AM',
            status: 'Signed',
            cosignRequired: false
          }
        }
      ]
    }
    
    return patientVisits[patientId as keyof typeof patientVisits] || [
      {
        id: '1',
        date: '2024-01-15',
        time: '09:30 AM',
        type: 'Follow-up',
        provider: 'Dr. Sarah Johnson',
        chiefComplaint: 'Follow-up for hypertension management',
        hpi: 'Patient reports good compliance with Lisinopril 10mg daily. No side effects noted.',
        assessmentPlan: 'HTN well controlled. Continue current regimen. RTC in 3 months.',
        vitals: { bp: '130/80', hr: '72', temp: '98.6', weight: '185', height: '5\'8"', bmi: '28.1' },
        signature: {
          signedBy: 'Dr. Sarah Johnson, MD',
          signedDate: '2024-01-15 10:45 AM',
          status: 'Signed',
          cosignRequired: false
        }
      }
    ]
  }

  const visits = getVisitsForPatient(patientId)

  const selectedVisitData = visits.find(v => v.id === selectedVisit)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visit History</h3>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
          {visits.length} visits
        </span>
      </div>

      {!selectedVisit ? (
        <div className="space-y-3">
          {visits.map((visit) => (
            <div
              key={visit.id}
              onClick={() => setSelectedVisit(visit.id)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {visit.date}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {visit.time}
                  </span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {visit.type}
                  </span>
                </div>
                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{visit.provider}</p>
              <p className="text-sm text-gray-900 dark:text-white">{visit.chiefComplaint}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedVisit(null)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Visit List
          </button>

          {/* Visit Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedVisitData?.date} - {selectedVisitData?.type}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Print Record"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                </button>
                
                <button
                  onClick={() => {/* Edit functionality */}}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit Record"
                  disabled={selectedVisitData?.signature.status === 'Signed'}
                >
                  <span className="material-symbols-outlined text-sm">edit_document</span>
                </button>
                
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedVisitData?.signature.status === 'Signed' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {selectedVisitData?.signature.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedVisitData?.provider} • {selectedVisitData?.time}
            </p>
          </div>

          {/* Visit Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Chief Complaint */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Chief Complaint</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedVisitData?.chiefComplaint}</p>
              </div>

              {/* HPI */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">History of Present Illness</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedVisitData?.hpi}</p>
              </div>

              {/* Visit Vitals */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Visit Vitals</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blood Pressure</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedVisitData?.vitals.bp} mmHg</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Heart Rate</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedVisitData?.vitals.hr} bpm</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedVisitData?.vitals.temp}°F</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedVisitData?.vitals.weight} lbs</p>
                  </div>
                </div>
              </div>

              {/* Review of Systems */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Review of Systems</h5>
                <div className="space-y-2">
                  {(selectedVisitData as any)?.ros ? Object.entries((selectedVisitData as any).ros).map(([system, finding]) => (
                    <div key={system} className="flex gap-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide min-w-[100px]">
                        {system}:
                      </span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{String(finding)}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No review of systems documented</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Physical Exam */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Physical Examination</h5>
                <div className="space-y-2">
                  {(selectedVisitData as any)?.physicalExam ? Object.entries((selectedVisitData as any).physicalExam).map(([system, finding]) => (
                    <div key={system} className="flex gap-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide min-w-[100px]">
                        {system}:
                      </span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{String(finding)}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No physical exam documented</p>
                  )}
                </div>
              </div>

              {/* Assessment & Plan */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Assessment & Plan</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedVisitData?.assessmentPlan}</p>
              </div>

              {/* Signature & Audit */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Signature & Audit Trail</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Signed by:</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{selectedVisitData?.signature.signedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Signed on:</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{selectedVisitData?.signature.signedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`text-xs font-medium ${
                      selectedVisitData?.signature.status === 'Signed' 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {selectedVisitData?.signature.status}
                    </span>
                  </div>
                  <button className="text-xs text-primary hover:text-primary/80 font-medium mt-2">
                    View Full Audit Trail →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitHistory