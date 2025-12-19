'use client'

import Link from 'next/link'

interface NewVisitFormProps {
  patientId: string
}

const NewVisitForm = ({ patientId }: NewVisitFormProps) => {
  const patient = {
    name: 'Leslie Alexander',
    dob: '12/05/1985 (38yo)',
    mrn: '884210',
    allergies: 'Penicillin'
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-gray-900 dark:text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">local_hospital</span>
            </div>
            <h2 className="text-lg font-bold">Medical Dashboard</h2>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <input 
              className="w-64 lg:w-80 px-4 pl-10 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm placeholder-gray-500 dark:placeholder-gray-400" 
              placeholder="Search patients, MDs..." 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link href="/patients" className="text-gray-500 dark:text-gray-400 hover:text-primary">Patients</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/patients/${patientId}`} className="text-gray-500 dark:text-gray-400 hover:text-primary">{patient.name}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-semibold">New Visit</span>
          </div>

          {/* Patient Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold border border-yellow-200 dark:border-yellow-800">Draft</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">calendar_today</span> 
                  DOB: {patient.dob}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">id_card</span> 
                  MRN: {patient.mrn}
                </span>
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                  <span className="material-symbols-outlined text-sm">warning</span> 
                  Allergies: {patient.allergies}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/patients/${patientId}`} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </Link>
              <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                <span>Continue to Visit</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
            {/* Left Column: Recording Tools */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Recording Panel */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 px-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex gap-6">
                    <button className="flex flex-col items-center justify-center border-b-2 border-primary text-primary gap-1 pb-3 pt-4 px-2">
                      <span className="material-symbols-outlined">mic</span>
                      <span className="text-sm font-medium">Record</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white gap-1 pb-3 pt-4 px-2">
                      <span className="material-symbols-outlined">cloud_upload</span>
                      <span className="text-sm font-medium">Upload</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white gap-1 pb-3 pt-4 px-2">
                      <span className="material-symbols-outlined">keyboard</span>
                      <span className="text-sm font-medium">Type</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-2">
                      <span className="material-symbols-outlined text-4xl">mic</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Capture</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                        Start recording the consultation to automatically generate clinical notes.
                      </p>
                    </div>
                    <button className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors w-full max-w-[200px] gap-2">
                      <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
                      <span>Start Recording</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Previous Visit Info */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Previous Visit</h3>
                  <a href="#" className="text-primary text-xs font-semibold hover:underline">View All</a>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Oct 24, 2023</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Follow-up</span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Patient reported improvement in lower back pain. Continued physical therapy regimen. Prescribed NSAIDs as needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: SOAP Note Form */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <span className="material-symbols-outlined text-sm">description</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Visit Note</h2>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">open_in_full</span>
                    </button>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">settings</span>
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-8 overflow-y-auto flex-1">
                  {/* Subjective Section */}
                  <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                    <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Subjective
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chief Complaint & HPI</span>
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Chief Complaint</label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                          placeholder="e.g., Persistent cough, fever" 
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">History of Present Illness</label>
                        <textarea 
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                          placeholder="Describe the HPI..." 
                          rows={4}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Objective Section */}
                  <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                    <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Objective
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Vitals & Exam</span>
                    </h3>
                    
                    {/* Vitals Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">BP (mmHg)</label>
                        <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="120/80" type="text" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">HR (bpm)</label>
                        <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="72" type="text" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Temp (°F)</label>
                        <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="98.6" type="text" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Weight (lbs)</label>
                        <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="165" type="text" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Physical Exam Findings</label>
                      <textarea 
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                        placeholder="General appearance, HEENT, Lungs, Heart..." 
                        rows={3}
                      />
                    </div>
                  </section>

                  {/* Assessment & Plan */}
                  <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                    <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Assessment & Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Assessment / Diagnosis</label>
                        <div className="relative">
                          <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-sm">medical_services</span>
                          </span>
                          <textarea 
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 pl-10 py-2 resize-none" 
                            placeholder="Primary diagnosis..." 
                            rows={5}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Treatment Plan</label>
                        <div className="relative">
                          <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-sm">healing</span>
                          </span>
                          <textarea 
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 pl-10 py-2 resize-none" 
                            placeholder="Medications, referrals, follow-up..." 
                            rows={5}
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Form Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">Last saved: 2 mins ago</span>
                  <div className="flex gap-3">
                    <button className="text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NewVisitForm