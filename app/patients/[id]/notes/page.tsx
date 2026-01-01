'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import AITransparency from '@/components/AITransparency'
import { getPatient, createVisit, appendVisitNote, getVisitNotes, updateVisitNoteStatus, createRecordingCacheUpload, enqueueTranscriptionWithCache, getCurrentLocation } from '@/lib/api'
import { useAudioRecorder } from '@/lib/useAudioRecorder'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import type { Visit } from '@/lib/types'

interface NoteEntry {
  id: string
  timestamp: string
  content: string
  section: 'subjective' | 'objective' | 'assessment' | 'plan'
  source: 'manual' | 'dictation'
  author_id: string
}

interface VisitNote {
  visit_id: string
  status: 'draft' | 'signed' | 'pending'
  entries: NoteEntry[]
}

type Section = 'subjective' | 'objective' | 'assessment' | 'plan'

export default function PatientNotesPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [visits, setVisits] = useState<(Visit & { created_at: string })[]>([])
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [visitNotes, setVisitNotes] = useState<VisitNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [currentSection, setCurrentSection] = useState<Section>('subjective')
  const [newEntryText, setNewEntryText] = useState('')
  const [saving, setSaving] = useState(false)
  const [visitType, setVisitType] = useState<string>('telehealth')
  const [showSignModal, setShowSignModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); }

  const recorder = useAudioRecorder()
  const newEntryRefs = {
    subjective: useRef<HTMLTextAreaElement>(null),
    objective: useRef<HTMLTextAreaElement>(null),
    assessment: useRef<HTMLTextAreaElement>(null),
    plan: useRef<HTMLTextAreaElement>(null),
  }

  // Load patient and visits
  useEffect(() => {
    loadData()

    return () => {
      if (transcriptionPollRef.current) {
        clearInterval(transcriptionPollRef.current)
      }
    }
  }, [patientId])

  // Load visit notes when visit is selected
  useEffect(() => {
    if (selectedVisitId) {
      loadVisitNotes(selectedVisitId)
    }
  }, [selectedVisitId])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getPatient(patientId)
      const visitsWithDate = (data.visits || []).map(v => ({
        ...v,
        created_at: v.created_at || new Date().toISOString()
      }))
      setVisits(visitsWithDate)
      if (visitsWithDate.length > 0) {
        setSelectedVisitId(visitsWithDate[0].id)
      }
    } catch (error) {
      console.error('Failed to load patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVisitNotes = async (visitId: string) => {
    try {
      const notes = await getVisitNotes(visitId)
      setVisitNotes(notes)
    } catch (error) {
      console.error('Failed to load visit notes:', error)
      setVisitNotes({ visit_id: visitId, status: 'draft', entries: [] })
    }
  }

  const createNewVisit = async () => {
    try {
      setSaving(true)
      const location = await getCurrentLocation();
      const payload: any = { patient_id: patientId, status: 'draft', type: visitType };
      if (location) {
        payload.location_lat = location.latitude;
        payload.location_lng = location.longitude;
        if (location.accuracy) payload.location_accuracy = Math.round(location.accuracy);
        if (location.timestamp) payload.location_recorded_at = location.timestamp;
      }
      const newVisit = await createVisit(payload)
      setVisits([newVisit, ...visits])
      setSelectedVisitId(newVisit.id)
    } catch (error) {
      console.error('Failed to create visit:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAppendEntry = async (section: Section, content: string, source: 'manual' | 'dictation' = 'manual') => {
    if (!selectedVisitId || !content.trim()) return

    try {
      setSaving(true)
      await appendVisitNote(selectedVisitId, content.trim(), section, source)
      await loadVisitNotes(selectedVisitId)
      // Clear the input
      if (newEntryRefs[section].current) {
        newEntryRefs[section].current!.value = ''
      }
      setNewEntryText('')
    } catch (error) {
      console.error('Failed to append note:', error)
      alert('Failed to save note entry')
    } finally {
      setSaving(false)
    }
  }

  const handleStartDictation = async (section: Section) => {
    try {
      setCurrentSection(section)
      setIsRecording(true)
      await recorder.startRecording()
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to start recording. Please check microphone permissions.')
      setIsRecording(false)
    }
  }

  const transcriptionPollRef = useRef<number | null>(null);

  const handleStopDictation = async () => {
    try {
      setIsRecording(false)
      const blob = await recorder.stopRecording()

      if (!selectedVisitId) {
        alert('Please select a visit first')
        return
      }

      // Convert to MP3 and create cache entry
      const mp3Blob = await convertToMP3(blob)
      const mp3File = new File([mp3Blob], `dictation-${Date.now()}.mp3`, { type: 'audio/mp3' })

      const { cache, path, token, bucket } = await createRecordingCacheUpload({ filename: mp3File.name, contentType: mp3File.type, size: mp3File.size })

      const supabase = supabaseBrowser()
      const { error: uploadErr } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, mp3File, { contentType: mp3File.type })
      if (uploadErr) throw new Error(uploadErr.message)

      // Enqueue transcription job
      const cacheId = cache && cache[0] ? cache[0].id : cache.id
      await enqueueTranscriptionWithCache(selectedVisitId, cacheId, path)
      showToast('Dictation queued for transcription')

      // Poll visit notes until new dictation entry appears
      if (transcriptionPollRef.current) clearInterval(transcriptionPollRef.current)
      transcriptionPollRef.current = window.setInterval(async () => {
        try {
          const notes = await getVisitNotes(selectedVisitId)
          if (notes && notes.entries && notes.entries.some(e => e.source === 'dictation')) {
            // reload notes and stop polling
            await loadVisitNotes(selectedVisitId)
            if (transcriptionPollRef.current) { clearInterval(transcriptionPollRef.current); transcriptionPollRef.current = null }
            showToast('Dictation available in notes')
          }
        } catch (e) {
          // ignore
        }
      }, 2500)

    } catch (error) {
      console.error('Failed to process dictation:', error)
      alert('Failed to process dictation')
    }
  }

  const convertToMP3 = async (blob: Blob): Promise<Blob> => {
    // For now, return the blob as-is. In production, you'd use a library like lamejs
    // to convert WebM to MP3 on the client side, or handle conversion on the server
    return blob
  }

  const handleSignNote = async () => {
    if (!selectedVisitId) return

    try {
      setSaving(true)
      await updateVisitNoteStatus(selectedVisitId, 'signed')
      await loadVisitNotes(selectedVisitId)
      setShowSignModal(false)
    } catch (error) {
      console.error('Failed to sign note:', error)
      alert('Failed to sign note')
    } finally {
      setSaving(false)
    }
  }

  const getEntriesForSection = (section: Section): NoteEntry[] => {
    if (!visitNotes) return []
    return visitNotes.entries.filter(entry => entry.section === section)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const selectedVisit = visits.find(v => v.id === selectedVisitId)

  if (loading) {
    return (
      <div className="flex h-screen w-full">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <GlobalSearchBar />
          </div>

          <div className="flex items-center gap-4">
            {saving && (
              <div className="flex items-center gap-1 text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="text-xs">Saving...</span>
              </div>
            )}
            {toast && (
              <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-md shadow-md">{toast}</div>
            )}
            <AITransparency className="ml-2" />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Visits List Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Visits</h2>
                <div className="flex items-center gap-2">
                  <select className="input" value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                    <option value="telehealth">Telehealth</option>
                    <option value="mobile_acute">Mobile Acute Care</option>
                    <option value="triage">Triage</option>
                    <option value="nurse_visit">Nurse Visit</option>
                    <option value="doctor_visit">Doctor Visit</option>
                  </select>
                  <button
                    onClick={createNewVisit}
                    disabled={saving}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    title="New Visit"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>

              {visits.filter(v => {
                // Check if visit has unsigned notes
                return true // For now, show all visits
              }).length > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-600 text-sm">warning</span>
                      <span className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                        {visits.filter(v => {
                          // Count visits with draft notes
                          return true
                        }).length} visits with draft notes
                      </span>
                    </div>
                  </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {visits.map(visit => (
                <button
                  key={visit.id}
                  onClick={() => setSelectedVisitId(visit.id)}
                  className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedVisitId === visit.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(visit.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${visit.status === 'finalized' ? 'text-green-600 bg-green-100 dark:bg-green-900/20' :
                      visit.status === 'draft' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' :
                        'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                      {visit.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(visit.created_at).toLocaleTimeString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Note Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedVisitId && visitNotes ? (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clinical Notes</h1>
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedVisit ? new Date(selectedVisit.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.print()}
                        className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Print Record"
                      >
                        <span className="material-symbols-outlined">print</span>
                      </button>

                      {visitNotes.status === 'draft' && (
                        <button
                          onClick={() => setShowSignModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">draw</span>
                          Sign Note
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Status:</span> {visitNotes.status} •
                    <span className="font-medium ml-2">Entries:</span> {visitNotes.entries.length}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {(['subjective', 'objective', 'assessment', 'plan'] as Section[]).map(section => {
                      const entries = getEntriesForSection(section)
                      return (
                        <div key={section} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                              {section === 'subjective' && 'Subjective (S)'}
                              {section === 'objective' && 'Objective (O)'}
                              {section === 'assessment' && 'Assessment (A)'}
                              {section === 'plan' && 'Plan (P)'}
                            </h3>
                            {visitNotes.status === 'draft' && (
                              <button
                                onClick={() => isRecording && currentSection === section
                                  ? handleStopDictation()
                                  : handleStartDictation(section)}
                                disabled={isRecording && currentSection !== section}
                                className={`p-2 rounded-lg transition-colors ${isRecording && currentSection === section
                                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20 animate-pulse'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                                title={isRecording && currentSection === section ? 'Stop Dictation' : 'Start Dictation'}
                              >
                                <span className="material-symbols-outlined">
                                  {isRecording && currentSection === section ? 'mic' : 'mic_none'}
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Append-only entries display */}
                          <div className="space-y-2 mb-4">
                            {entries.map(entry => (
                              <div
                                key={entry.id}
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-primary"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimestamp(entry.timestamp)}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${entry.source === 'dictation'
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
                                    }`}>
                                    {entry.source}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                  {entry.content}
                                </p>
                              </div>
                            ))}
                            {entries.length === 0 && (
                              <p className="text-sm text-gray-400 italic">No entries yet</p>
                            )}
                          </div>

                          {/* Add new entry input */}
                          {visitNotes.status === 'draft' && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                              <textarea
                                ref={newEntryRefs[section]}
                                placeholder={`Add ${section} entry...`}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                rows={3}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault()
                                    const content = newEntryRefs[section].current?.value || ''
                                    if (content.trim()) {
                                      handleAppendEntry(section, content, 'manual')
                                    }
                                  }
                                }}
                              />
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Press Cmd/Ctrl + Enter to add entry
                                </span>
                                <button
                                  onClick={() => {
                                    const content = newEntryRefs[section].current?.value || ''
                                    if (content.trim()) {
                                      handleAppendEntry(section, content, 'manual')
                                    }
                                  }}
                                  disabled={saving}
                                  className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                  Add Entry
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">note_add</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Visit Selected</h3>
                  <p className="text-gray-500 dark:text-gray-400">Select a visit from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sign Note Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sign Clinical Note</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to sign this note? Once signed, it cannot be edited.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignNote}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Sign Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
