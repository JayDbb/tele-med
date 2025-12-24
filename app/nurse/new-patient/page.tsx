'use client'

import { useState } from 'react'

export default function NewPatientIntake() {
  const [isRecording, setIsRecording] = useState(false)
  const [visitNote, setVisitNote] = useState({
    chiefComplaint: '',
    hpi: '',
    bp: '120/80',
    hr: '72',
    temp: '98.6',
    weight: '165',
    physicalExam: '',
    assessment: '',
    treatmentPlan: ''
  })

  const handleStartRecording = () => {
    setIsRecording(!isRecording)
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#111418] dark:text-white min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-surface-dark border-b border-[#dbe0e6] dark:border-gray-800 px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-[#617589] dark:text-gray-400 mb-4">
          <span>Patients</span>
          <span>/</span>
          <span>New Patient</span>
          <span>/</span>
          <span className="text-[#111418] dark:text-white">New Visit</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-[#111418] dark:text-white">New Patient</h1>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Draft
                </span>
                <div className="flex items-center gap-1 text-[#617589] dark:text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>DOB: ___/___/_____ (Age: ___)</span>
                </div>
                <div className="flex items-center gap-1 text-[#617589] dark:text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">id_card</span>
                  <span>MRN: To be assigned</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Allergies: To be determined</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-[#617589] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
              <span>Continue to Visit</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Methods */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe0e6] dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">mic</span>
                    <span className="text-sm font-medium">Record</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-[#617589] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                    <span className="text-sm font-medium">Upload</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-[#617589] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">keyboard</span>
                    <span className="text-sm font-medium">Type</span>
                  </button>
                </div>

                <div className="text-center py-8">
                  <div className="flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[48px] text-primary">mic</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">Ready to Capture</h3>
                  <p className="text-sm text-[#617589] dark:text-gray-400 mb-6">
                    Start recording the consultation to automatically generate clinical notes.
                  </p>
                  <button 
                    onClick={handleStartRecording}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-primary hover:bg-blue-600 text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isRecording ? 'stop' : 'fiber_manual_record'}
                    </span>
                    <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visit Notes Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe0e6] dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-[#617589] dark:text-gray-400">description</span>
                    <h2 className="text-xl font-bold text-[#111418] dark:text-white">Visit Note</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-[#617589] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <span className="material-symbols-outlined">open_in_full</span>
                    </button>
                    <button className="p-2 text-[#617589] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <span className="material-symbols-outlined">settings</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Subjective */}
                  <div>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Subjective</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#617589] dark:text-gray-400 mb-2">
                          Chief Complaint & HPI
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Persistent cough, fever"
                          className="w-full p-3 border border-[#dbe0e6] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-[#111418] dark:text-white placeholder-[#617589] dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                          value={visitNote.chiefComplaint}
                          onChange={(e) => setVisitNote({...visitNote, chiefComplaint: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#617589] dark:text-gray-400 mb-2">
                          History of Present Illness
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Describe the HPI..."
                          className="w-full p-3 border border-[#dbe0e6] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-[#111418] dark:text-white placeholder-[#617589] dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                          value={visitNote.hpi}
                          onChange={(e) => setVisitNote({...visitNote, hpi: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Objective */}
                  <div>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Objective</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#617589] dark:text-gray-400 mb-2">
                          Vitals & Exam
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-[#617589] dark:text-gray-500 mb-1">BP (mmHg)</label>
                            <input
                              type="text"
                              value={visitNote.bp}
                              onChange={(e) => setVisitNote({...visitNote, bp: e.target.value})}
                              className="w-full p-2 border border-[#dbe0e6] dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-[#111418] dark:text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-[#617589] dark:text-gray-500 mb-1">HR (bpm)</label>
                            <input
                              type="text"
                              value={visitNote.hr}
                              onChange={(e) => setVisitNote({...visitNote, hr: e.target.value})}
                              className="w-full p-2 border border-[#dbe0e6] dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-[#111418] dark:text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-[#617589] dark:text-gray-500 mb-1">Temp (°F)</label>
                            <input
                              type="text"
                              value={visitNote.temp}
                              onChange={(e) => setVisitNote({...visitNote, temp: e.target.value})}
                              className="w-full p-2 border border-[#dbe0e6] dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-[#111418] dark:text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-[#617589] dark:text-gray-500 mb-1">Weight (lbs)</label>
                            <input
                              type="text"
                              value={visitNote.weight}
                              onChange={(e) => setVisitNote({...visitNote, weight: e.target.value})}
                              className="w-full p-2 border border-[#dbe0e6] dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-[#111418] dark:text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#617589] dark:text-gray-400 mb-2">
                          Physical Exam Findings
                        </label>
                        <textarea
                          rows={3}
                          placeholder="General appearance, HEENT, Lungs, Heart..."
                          className="w-full p-3 border border-[#dbe0e6] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-[#111418] dark:text-white placeholder-[#617589] dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                          value={visitNote.physicalExam}
                          onChange={(e) => setVisitNote({...visitNote, physicalExam: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assessment & Plan */}
                  <div>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Assessment & Plan</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#617589] dark:text-gray-400 mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">medical_services</span>
                          Assessment / Diagnosis
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Primary diagnosis..."
                          className="w-full p-3 border border-[#dbe0e6] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-[#111418] dark:text-white placeholder-[#617589] dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                          value={visitNote.assessment}
                          onChange={(e) => setVisitNote({...visitNote, assessment: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#617589] dark:text-gray-400 mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">healing</span>
                          Treatment Plan
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Medications, referrals, follow-up..."
                          className="w-full p-3 border border-[#dbe0e6] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-[#111418] dark:text-white placeholder-[#617589] dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                          value={visitNote.treatmentPlan}
                          onChange={(e) => setVisitNote({...visitNote, treatmentPlan: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#dbe0e6] dark:border-gray-700">
                  <span className="text-sm text-[#617589] dark:text-gray-400">Last saved: 2 mins ago</span>
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}