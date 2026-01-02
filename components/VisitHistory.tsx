'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPatient } from '@/lib/api'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import type { Visit } from '@/lib/types'

interface VisitHistoryProps {
  patientId: string
}

const VisitHistory = ({ patientId }: VisitHistoryProps) => {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null)
  const [visits, setVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { nurse } = useNurse()
  const router = useRouter()

  const getNewVisitUrl = () => {
    if (nurse) {
      return `/nurse-portal/patients/${patientId}/new-visit`
    } else {
      return `/doctor/patients/${patientId}/new-visit`
    }
  }

  useEffect(() => {
    loadVisits()
  }, [patientId])

  const loadVisits = async () => {
    try {
      setLoading(true)
      const { visits: apiVisits } = await getPatient(patientId)

      // Map database visits to component format
      const mappedVisits = (apiVisits || []).map((visit: Visit) => {
        // Extract note entries from notes field
        const noteEntries = visit.notes?.note || []
        const noteArray = Array.isArray(noteEntries) ? noteEntries : []

        // Extract SOAP sections from note entries
        const subjectiveEntries = noteArray.filter((e: any) => e.section === 'subjective')
        const objectiveEntries = noteArray.filter((e: any) => e.section === 'objective')
        const assessmentEntries = noteArray.filter((e: any) => e.section === 'assessment')
        const planEntries = noteArray.filter((e: any) => e.section === 'plan')

        // Combine content from entries
        const chiefComplaint = subjectiveEntries.find((e: any) => e.content?.toLowerCase().includes('chief complaint'))?.content ||
          subjectiveEntries[0]?.content ||
          'No chief complaint recorded'

        const hpi = subjectiveEntries
          .filter((e: any) => !e.content?.toLowerCase().includes('chief complaint'))
          .map((e: any) => e.content)
          .join(' ') || 'No HPI recorded'

        const assessment = assessmentEntries.map((e: any) => e.content).join(' ') || 'No assessment recorded'
        const plan = planEntries.map((e: any) => e.content).join(' ') || 'No plan recorded'

        // Extract vitals from objective entries or structured data
        const vitals: any = {}
        const objectiveText = objectiveEntries.map((e: any) => e.content).join(' ')

        // Extract ROS and Physical Exam from structured data if available
        let ros: any = null
        let physicalExam: any = null

        // Try to extract vitals and exam findings from structured data if available
        if (visit.transcripts?.segments?.structured) {
          const structured = visit.transcripts.segments.structured

          // Extract vitals
          vitals.bp = structured.physical_exam_findings?.blood_pressure ||
            structured.physical_exam_findings?.bp ||
            extractVital(objectiveText, 'bp', 'blood pressure')
          vitals.hr = structured.physical_exam_findings?.heart_rate ||
            structured.physical_exam_findings?.hr ||
            extractVital(objectiveText, 'hr', 'heart rate')
          vitals.temp = structured.physical_exam_findings?.temperature ||
            structured.physical_exam_findings?.temp ||
            extractVital(objectiveText, 'temp', 'temperature')
          vitals.weight = structured.physical_exam_findings?.weight ||
            extractVital(objectiveText, 'weight')

          // Extract physical exam findings
          if (structured.physical_exam_findings) {
            physicalExam = structured.physical_exam_findings
          }
        } else {
          vitals.bp = extractVital(objectiveText, 'bp', 'blood pressure')
          vitals.hr = extractVital(objectiveText, 'hr', 'heart rate')
          vitals.temp = extractVital(objectiveText, 'temp', 'temperature')
          vitals.weight = extractVital(objectiveText, 'weight')
        }

        // Extract ROS from structured data if available
        // Note: ROS might be in a separate field or embedded in subjective
        if (visit.transcripts?.segments?.structured?.review_of_systems) {
          ros = visit.transcripts.segments.structured.review_of_systems
        }

        return {
          id: visit.id,
          date: formatDate(visit.created_at),
          time: formatTime(visit.created_at),
          type: visit.status || 'Visit',
          provider: 'Provider', // Can be fetched from clinician_id if needed
          chiefComplaint,
          hpi,
          assessmentPlan: `${assessment}${plan ? '\n\nPlan: ' + plan : ''}`,
          vitals,
          ros,
          physicalExam,
          signature: {
            signedBy: visit.notes?.status === 'signed' ? 'Signed' : 'Unsigned',
            signedDate: visit.notes?.status === 'signed' ? formatDate(visit.created_at) : '',
            status: visit.notes?.status === 'signed' ? 'Signed' : (visit.notes?.status || 'Draft'),
            cosignRequired: false
          },
          // Store raw data for detailed view
          rawVisit: visit
        }
      })

      setVisits(mappedVisits)
    } catch (err: any) {
      console.error('Error loading visits:', err)
      setVisits([])
    } finally {
      setLoading(false)
    }
  }

  const extractVital = (text: string, ...keywords: string[]): string => {
    if (!text) return '--'
    const lowerText = text.toLowerCase()
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[\\s:]*([0-9./]+)`, 'i')
      const match = text.match(regex)
      if (match) return match[1]
    }
    return '--'
  }

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

  const selectedVisitData = visits.find(v => v.id === selectedVisit)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visit History</h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
            {visits.length} visits
          </span>
        </div>
        {!selectedVisit && (
          <Link
            href={getNewVisitUrl()}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Visit
          </Link>
        )}
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
                  onClick={() => {/* Edit functionality */ }}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit Record"
                  disabled={selectedVisitData?.signature.status === 'Signed'}
                >
                  <span className="material-symbols-outlined text-sm">edit_document</span>
                </button>

                <span className={`text-xs px-2 py-1 rounded-full ${selectedVisitData?.signature.status === 'Signed'
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
                    <span className={`text-xs font-medium ${selectedVisitData?.signature.status === 'Signed'
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
