'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPatient } from '@/lib/api'
import { usePatientRoutes } from '@/lib/usePatientRoutes'
import type { Visit } from '@/lib/types'

interface VisitHistoryProps {
  patientId: string
}

const VisitHistory = ({ patientId }: VisitHistoryProps) => {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null)
  const [visits, setVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuditTrail, setShowAuditTrail] = useState(false)
  const router = useRouter()
  const { getNewVisitUrl } = usePatientRoutes()

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

        // Extract chief complaint - look for entries specifically about chief complaint
        const chiefComplaintEntry = subjectiveEntries.find((e: any) =>
          e.content?.toLowerCase().includes('chief complaint') ||
          e.content?.toLowerCase().startsWith('chief complaint:')
        )
        const chiefComplaint = chiefComplaintEntry?.content?.replace(/chief complaint:?\s*/i, '').trim() ||
          (subjectiveEntries.length > 0 && !subjectiveEntries[0].content?.toLowerCase().includes('patient presented')
            ? subjectiveEntries[0].content
            : 'No chief complaint recorded')

        // Extract HPI - filter out summaries, structured data, and chief complaint entries
        const hpiEntries = subjectiveEntries.filter((e: any) => {
          const content = e.content?.toLowerCase() || ''
          // Exclude entries that are:
          // - Chief complaint entries
          // - Summary text (contains "patient presented" or similar summary language)
          // - JSON structured data
          // - Too long (likely summaries - summaries are usually 200+ chars)
          // - Contains summary-like phrases
          const isSummary = content.includes('patient presented') ||
            content.includes('the patient presented') ||
            content.includes('physical examination revealed') ||
            content.includes('the primary diagnosis') ||
            content.includes('the treatment plan involves')

          return !content.includes('chief complaint') &&
            !isSummary &&
            !content.trim().startsWith('{') &&
            content.length < 300 // Reasonable HPI length
        })

        let hpi = hpiEntries.length > 0
          ? hpiEntries.map((e: any) => e.content).join(' ').trim()
          : ''

        // If HPI is empty or looks like a summary, set to default
        if (!hpi || hpi.length === 0) {
          hpi = 'No HPI recorded'
        }

        // Try to parse structured data from assessment entries (new format)
        let structuredData: any = null
        let assessment = ''
        let plan = ''
        let summary = ''

        // Look for structured JSON in assessment entries
        for (const entry of assessmentEntries) {
          if (entry.content && entry.content.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(entry.content)
              if (parsed.past_medical_history !== undefined || parsed.current_symptoms !== undefined || parsed.diagnosis) {
                structuredData = parsed
                break
              }
            } catch {
              // Not valid JSON, continue
            }
          }
        }

        // If structured data found, extract from it
        if (structuredData) {
          // Extract diagnosis
          if (structuredData.diagnosis) {
            assessment = Array.isArray(structuredData.diagnosis)
              ? structuredData.diagnosis.join(', ')
              : structuredData.diagnosis
          }

          // Extract treatment plan
          if (structuredData.treatment_plan && Array.isArray(structuredData.treatment_plan)) {
            plan = structuredData.treatment_plan.join('\n')
          }

          // Extract summary
          if (structuredData.summary) {
            summary = structuredData.summary
          }

          // If no HPI found in entries, check if past_medical_history exists in structured data
          // Note: past_medical_history is different from HPI, but if HPI is empty, we can use it
          // Actually, let's not use past_medical_history for HPI - they're different things
          // HPI should remain "No HPI recorded" if there's no actual HPI
        } else {
          // Fallback to old format
          assessment = assessmentEntries.map((e: any) => e.content).join(' ') || 'No assessment recorded'
          plan = planEntries.map((e: any) => e.content).join(' ') || 'No plan recorded'
        }

        // Extract vitals from objective entries or structured data
        const vitals: any = {}
        const objectiveText = objectiveEntries.map((e: any) => e.content).join(' ')

        // Extract ROS and Physical Exam from structured data if available
        let ros: any = null
        let physicalExam: any = null

        // Try to extract vitals and exam findings from structured data
        if (structuredData?.physical_exam_findings) {
          const findings = structuredData.physical_exam_findings
          const vitalSigns = findings.vital_signs || {}

          // Extract vitals from structured data
          vitals.bp = vitalSigns.blood_pressure || vitalSigns.bp || extractVital(objectiveText, 'bp', 'blood pressure')
          vitals.hr = vitalSigns.heart_rate || vitalSigns.hr || extractVital(objectiveText, 'hr', 'heart rate')
          vitals.temp = vitalSigns.temperature || vitalSigns.temp || extractVital(objectiveText, 'temp', 'temperature')
          vitals.weight = vitalSigns.weight || extractVital(objectiveText, 'weight')

          // Extract physical exam findings (excluding vitals)
          const examFindings: any = {}
          Object.entries(findings).forEach(([key, value]) => {
            if (key !== 'vital_signs' &&
              key !== 'blood_pressure' && key !== 'bp' &&
              key !== 'heart_rate' && key !== 'hr' &&
              key !== 'temperature' && key !== 'temp' &&
              key !== 'weight') {
              examFindings[key] = value
            }
          })
          if (Object.keys(examFindings).length > 0) {
            physicalExam = examFindings
          }
        } else if (visit.transcripts?.segments?.structured) {
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
        if (structuredData?.review_of_systems) {
          ros = structuredData.review_of_systems
        } else if (visit.transcripts?.segments?.structured?.review_of_systems) {
          ros = visit.transcripts.segments.structured.review_of_systems
        }

        // Format assessment and plan for display
        let assessmentPlanDisplay = ''
        if (structuredData) {
          // Format structured data nicely
          const parts: string[] = []
          if (assessment) {
            parts.push(assessment)
          }
          if (plan) {
            parts.push(`Plan: ${plan}`)
          }
          if (structuredData.prescriptions && Array.isArray(structuredData.prescriptions) && structuredData.prescriptions.length > 0) {
            const prescriptionsText = structuredData.prescriptions
              .map((p: any) => {
                const medParts = []
                if (p.medication) medParts.push(p.medication)
                if (p.dosage) medParts.push(`(${p.dosage})`)
                return medParts.join(' ')
              })
              .filter(Boolean)
              .join(', ')
            if (prescriptionsText) {
              parts.push(`Prescriptions: ${prescriptionsText}`)
            }
          }
          assessmentPlanDisplay = parts.join('\n\n')
        } else {
          assessmentPlanDisplay = `${plan ? 'Plan: ' + plan : ''}`
        }

        return {
          id: visit.id,
          date: formatDate(visit.created_at),
          time: formatTime(visit.created_at),
          type: visit.status || 'Visit',
          provider: 'Provider', // Can be fetched from clinician_id if needed
          chiefComplaint,
          hpi,
          assessmentPlan: assessmentPlanDisplay,
          summary: summary || (structuredData?.summary || ''),
          structuredData, // Store for detailed display
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

  const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return 'Not recorded'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'Not recorded'
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            href={getNewVisitUrl(patientId)}
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
                <div className="space-y-3">
                  {selectedVisitData?.structuredData ? (
                    <>
                      {selectedVisitData.structuredData.diagnosis && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Diagnosis</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {Array.isArray(selectedVisitData.structuredData.diagnosis)
                              ? selectedVisitData.structuredData.diagnosis.join(', ')
                              : selectedVisitData.structuredData.diagnosis}
                          </p>
                        </div>
                      )}
                      {selectedVisitData.structuredData.treatment_plan && Array.isArray(selectedVisitData.structuredData.treatment_plan) && selectedVisitData.structuredData.treatment_plan.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Treatment Plan</p>
                          <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                            {selectedVisitData.structuredData.treatment_plan.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedVisitData.structuredData.prescriptions && Array.isArray(selectedVisitData.structuredData.prescriptions) && selectedVisitData.structuredData.prescriptions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Prescriptions</p>
                          <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                            {selectedVisitData.structuredData.prescriptions.map((p: any, idx: number) => {
                              const parts = []
                              if (p.medication) parts.push(p.medication)
                              if (p.dosage) parts.push(`Dosage: ${p.dosage}`)
                              if (p.frequency) parts.push(`Frequency: ${p.frequency}`)
                              if (p.duration) parts.push(`Duration: ${p.duration}`)
                              return (
                                <li key={idx}>{parts.length > 0 ? parts.join(', ') : 'Prescription'}</li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                      {selectedVisitData.summary && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Summary</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedVisitData.summary}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedVisitData?.assessmentPlan}</p>
                  )}
                </div>
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
                  <button
                    onClick={() => setShowAuditTrail(true)}
                    className="text-xs text-primary hover:text-primary/80 font-medium mt-2"
                  >
                    View Full Audit Trail →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAuditTrail && selectedVisitData && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Trail</h3>
              <button
                onClick={() => setShowAuditTrail(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Visit Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Visit Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Visit ID:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedVisitData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Visit Type:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedVisitData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(selectedVisitData.rawVisit?.created_at)}
                    </span>
                  </div>
                  {selectedVisitData.rawVisit?.clinician_id && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Clinician ID:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedVisitData.rawVisit.clinician_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Signature & Status</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`text-sm font-medium ${selectedVisitData.signature.status === 'Signed'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                      {selectedVisitData.signature.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Signed By:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedVisitData.signature.signedBy || 'Not signed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Signed Date:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedVisitData.signature.signedDate || 'Not signed'}
                    </span>
                  </div>
                  {selectedVisitData.rawVisit?.notes?.status && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Note Status:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedVisitData.rawVisit.notes.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document History */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Document History</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Visit Created</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(selectedVisitData.rawVisit?.created_at)}
                      </div>
                      {selectedVisitData.rawVisit?.clinician_id && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By Clinician: {selectedVisitData.rawVisit.clinician_id}
                        </div>
                      )}
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      Created
                    </span>
                  </div>

                  {selectedVisitData.signature.status === 'Signed' && (
                    <div className="flex items-start justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Document Signed</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(selectedVisitData.rawVisit?.created_at)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {selectedVisitData.signature.signedBy}
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        Signed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Metadata */}
              {selectedVisitData.rawVisit && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Additional Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    {selectedVisitData.rawVisit.audio_url && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Audio Recording:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Available</span>
                      </div>
                    )}
                    {selectedVisitData.rawVisit.transcripts && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Transcript:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Available</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Patient ID:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedVisitData.rawVisit.patient_id}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowAuditTrail(false)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitHistory
