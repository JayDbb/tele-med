'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

interface Note {
  id: string
  date: string
  type: string
  status: 'draft' | 'signed' | 'pending'
  author: string
  content: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  lastModified: string
}

export default function PatientNotesPage() {
  const params = useParams()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [isListening, setIsListening] = useState(false)
  const [showSignModal, setShowSignModal] = useState(false)
  const autoSaveTimer = useRef<NodeJS.Timeout>()
  const recognitionRef = useRef<any>()

  // Mock notes data
  const mockNotes: Note[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'Progress Note',
      status: 'signed',
      author: 'Dr. Alex Robin',
      content: {
        subjective: 'Patient reports feeling well. No new complaints. Medication compliance good.',
        objective: 'Vital signs stable. BP 120/80, HR 72, Temp 98.6°F. Physical exam unremarkable.',
        assessment: 'Stable condition. Hypertension well controlled.',
        plan: 'Continue current medications. Follow up in 3 months. Regular checkups recommended.'
      },
      lastModified: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      date: '2024-01-10',
      type: 'Initial Consultation',
      status: 'draft',
      author: 'Dr. Alex Robin',
      content: {
        subjective: 'New patient presenting with...',
        objective: '',
        assessment: '',
        plan: ''
      },
      lastModified: '2024-01-10T14:20:00Z'
    }
  ]

  // Macro templates
  const macroTemplates: { [key: string]: any } = {
    '.dia': {
      assessment: 'Type 2 Diabetes Mellitus, well controlled',
      plan: '1. Continue metformin 500mg BID\n2. HbA1c in 3 months\n3. Diabetic diet counseling\n4. Regular exercise'
    },
    '.htn': {
      assessment: 'Essential Hypertension, well controlled',
      plan: '1. Continue lisinopril 10mg daily\n2. Monitor BP at home\n3. Low sodium diet\n4. Follow up in 3 months'
    },
    '.fu': {
      plan: 'Follow up in clinic as needed\nReturn if symptoms worsen\nPatient education provided'
    },
    '.pe': {
      objective: 'General: Well-appearing, no acute distress\nVitals: BP ___, HR ___, Temp ___°F, RR ___\nHEENT: Normocephalic, atraumatic\nCardiac: RRR, no murmurs\nPulmonary: Clear to auscultation bilaterally\nAbdomen: Soft, non-tender, non-distended\nExtremities: No edema'
    }
  }

  useEffect(() => {
    setNotes(mockNotes)
    if (mockNotes.length > 0) {
      setCurrentNote(mockNotes[0])
    }
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (currentNote && isEditing) {
      setAutoSaveStatus('unsaved')
      
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        setAutoSaveStatus('saving')
        // Simulate API call
        setTimeout(() => {
          setAutoSaveStatus('saved')
          console.log('Note auto-saved:', currentNote)
        }, 500)
      }, 2000)
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [currentNote, isEditing])

  // Voice dictation setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        
        if (finalTranscript && currentNote) {
          // Add to current section (assuming subjective for demo)
          setCurrentNote({
            ...currentNote,
            content: {
              ...currentNote.content,
              subjective: currentNote.content.subjective + ' ' + finalTranscript
            }
          })
        }
      }
      
      recognitionRef.current = recognition
    }
  }, [currentNote])

  const handleMacroExpansion = (text: string, section: keyof Note['content']) => {
    const words = text.split(' ')
    const lastWord = words[words.length - 1]
    
    if (macroTemplates[lastWord]) {
      const template = macroTemplates[lastWord]
      const newText = words.slice(0, -1).join(' ')
      
      if (template[section]) {
        return newText + (newText ? ' ' : '') + template[section]
      }
    }
    return text
  }

  const handleContentChange = (section: keyof Note['content'], value: string) => {
    if (!currentNote) return
    
    const expandedValue = handleMacroExpansion(value, section)
    
    setCurrentNote({
      ...currentNote,
      content: {
        ...currentNote.content,
        [section]: expandedValue
      }
    })
    setIsEditing(true)
  }

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'Progress Note',
      status: 'draft',
      author: 'Dr. Alex Robin',
      content: {
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
      },
      lastModified: new Date().toISOString()
    }
    
    setNotes([newNote, ...notes])
    setCurrentNote(newNote)
    setIsEditing(true)
  }

  const cloneLastNote = () => {
    if (notes.length === 0) return
    
    const lastNote = notes.find(note => note.status === 'signed') || notes[0]
    const newNote: Note = {
      ...lastNote,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      lastModified: new Date().toISOString(),
      content: {
        ...lastNote.content,
        subjective: '', // Clear subjective for new visit
        objective: '', // Clear objective for new visit
      }
    }
    
    setNotes([newNote, ...notes])
    setCurrentNote(newNote)
    setIsEditing(true)
  }

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const signNote = () => {
    if (!currentNote) return
    
    const updatedNote = {
      ...currentNote,
      status: 'signed' as const,
      lastModified: new Date().toISOString()
    }
    
    setCurrentNote(updatedNote)
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
    setIsEditing(false)
    setShowSignModal(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'pending': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'saving': return (
        <div className="flex items-center gap-1 text-blue-600">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span className="text-xs">Saving...</span>
        </div>
      )
      case 'saved': return (
        <div className="flex items-center gap-1 text-green-600">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span className="text-xs">Saved</span>
        </div>
      )
      case 'unsaved': return (
        <div className="flex items-center gap-1 text-orange-600">
          <span className="material-symbols-outlined text-sm">edit</span>
          <span className="text-xs">Unsaved changes</span>
        </div>
      )
    }
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
            {getAutoSaveIndicator()}
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Notes List Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clinical Notes</h2>
                <div className="flex gap-2">
                  <button
                    onClick={cloneLastNote}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Clone Last Note"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <button
                    onClick={createNewNote}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="New Note"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
              
              {/* Unsigned Notes Alert */}
              {notes.filter(note => note.status === 'draft').length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-600 text-sm">warning</span>
                    <span className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                      {notes.filter(note => note.status === 'draft').length} unsigned notes
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {notes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setCurrentNote(note)}
                  className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    currentNote?.id === note.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{note.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status)}`}>
                      {note.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{note.date}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {note.content.subjective || 'No content yet...'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Note Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentNote ? (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentNote.type}</h1>
                      <p className="text-gray-500 dark:text-gray-400">{currentNote.date} • {currentNote.author}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleVoiceDictation}
                        className={`p-2 rounded-lg transition-colors ${
                          isListening 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/20' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        title="Voice Dictation"
                      >
                        <span className="material-symbols-outlined">
                          {isListening ? 'mic' : 'mic_none'}
                        </span>
                      </button>
                      
                      {currentNote.status === 'draft' && (
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
                  
                  {/* Macro Help */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Macros:</span> .dia (diabetes), .htn (hypertension), .fu (follow-up), .pe (physical exam)
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* SOAP Note Template */}
                    {(['subjective', 'objective', 'assessment', 'plan'] as const).map(section => (
                      <div key={section} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                          {section === 'subjective' && 'Subjective (S)'}
                          {section === 'objective' && 'Objective (O)'}
                          {section === 'assessment' && 'Assessment (A)'}
                          {section === 'plan' && 'Plan (P)'}
                        </h3>
                        <textarea
                          value={currentNote.content[section]}
                          onChange={(e) => handleContentChange(section, e.target.value)}
                          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                          placeholder={`Enter ${section} information...`}
                          disabled={currentNote.status === 'signed'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">note_add</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Note Selected</h3>
                  <p className="text-gray-500 dark:text-gray-400">Select a note from the sidebar or create a new one</p>
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
                onClick={signNote}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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