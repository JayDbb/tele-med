'use client'

import { useEffect, useMemo, useState } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface VisitHistoryProps {
  patientId: string
}

const VisitHistory = ({ patientId }: VisitHistoryProps) => {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    chiefComplaint: '',
    hpi: '',
    assessment: '',
    plan: ''
  })
  const [visitsData, setVisitsData] = useState<any[]>(
    () => PatientDataManager.getPatientSectionList(patientId, 'visits')
  )

  useEffect(() => {
    setVisitsData(PatientDataManager.getPatientSectionList(patientId, 'visits'))
  }, [patientId])

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'Not recorded'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'Not recorded'
    return date.toLocaleDateString()
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const visits = useMemo(() => visitsData.map((visit: any) => ({
    id: visit.id,
    date: formatDate(visit.recordedAt),
    time: formatTime(visit.recordedAt),
    type: visit.type || 'Visit',
    provider: visit.providerName || 'Unknown provider',
    chiefComplaint: visit.subjective?.chiefComplaint || 'No chief complaint recorded',
    hpi: visit.subjective?.hpi || 'No HPI recorded',
    assessmentPlan: visit.assessmentPlan?.assessment || visit.assessmentPlan?.plan || 'No assessment recorded',
    vitals: visit.objective || {},
    signature: {
      signedBy: visit.signedBy || 'Unsigned',
      signedDate: visit.signedAt || '',
      status: visit.status || 'Draft',
      cosignRequired: false
    }
  })), [visitsData])

  const selectedVisitData = visits.find(v => v.id === selectedVisit)
  const selectedVisitRaw = visitsData.find((visit) => visit.id === selectedVisit)

  const startEditing = () => {
    if (!selectedVisitRaw) return
    setEditForm({
      chiefComplaint: selectedVisitRaw.subjective?.chiefComplaint || '',
      hpi: selectedVisitRaw.subjective?.hpi || '',
      assessment: selectedVisitRaw.assessmentPlan?.assessment || '',
      plan: selectedVisitRaw.assessmentPlan?.plan || ''
    })
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (!selectedVisitRaw) return
    const updatedVisit = {
      ...selectedVisitRaw,
      subjective: {
        ...selectedVisitRaw.subjective,
        chiefComplaint: editForm.chiefComplaint,
        hpi: editForm.hpi
      },
      assessmentPlan: {
        ...selectedVisitRaw.assessmentPlan,
        assessment: editForm.assessment,
        plan: editForm.plan
      },
      updatedAt: new Date().toISOString()
    }

    const nextVisits = visitsData.map((visit) =>
      visit.id === updatedVisit.id ? updatedVisit : visit
    )
    setVisitsData(nextVisits)
    PatientDataManager.savePatientSectionList(patientId, 'visits', nextVisits)
    PatientDataManager.logActionAuto(patientId, 'edit', 'visits', {
      changes: {
        before: {
          chiefComplaint: selectedVisitRaw.subjective?.chiefComplaint || '',
          hpi: selectedVisitRaw.subjective?.hpi || '',
          assessment: selectedVisitRaw.assessmentPlan?.assessment || '',
          plan: selectedVisitRaw.assessmentPlan?.plan || ''
        },
        after: { ...editForm }
      },
      notes: 'Edited visit details.'
    })
    setIsEditing(false)
  }

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
          {visits.length > 0 ? (
            visits.map((visit) => (
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
                    {visit.time && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {visit.time}
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {visit.type}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{visit.provider}</p>
                <p className="text-sm text-gray-900 dark:text-white">{visit.chiefComplaint}</p>
              </div>
            ))
          ) : (
            <div className="p-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400">
              No visits recorded yet.
            </div>
          )}
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
                  onClick={startEditing}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit Record"
                >
                  <span className="material-symbols-outlined text-sm">edit_document</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedVisitData?.provider} • {selectedVisitData?.time}
            </p>
          </div>

          {isEditing && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Chief Complaint</label>
                  <input
                    value={editForm.chiefComplaint}
                    onChange={(event) => setEditForm({ ...editForm, chiefComplaint: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">History of Present Illness</label>
                  <textarea
                    value={editForm.hpi}
                    onChange={(event) => setEditForm({ ...editForm, hpi: event.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Assessment</label>
                  <textarea
                    value={editForm.assessment}
                    onChange={(event) => setEditForm({ ...editForm, assessment: event.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Plan</label>
                  <textarea
                    value={editForm.plan}
                    onChange={(event) => setEditForm({ ...editForm, plan: event.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

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
