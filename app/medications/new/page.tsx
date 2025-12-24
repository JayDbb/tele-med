'use client'

import Sidebar from '@/components/Sidebar'
import { useState } from 'react'

const PrescriptionPage = () => {
  const [draggedMed, setDraggedMed] = useState<any>(null)
  const [droppedMeds, setDroppedMeds] = useState<any[]>([])

  const handleDragStart = (e: React.DragEvent, med: any) => {
    setDraggedMed(med)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedMed && !droppedMeds.find(m => m.id === draggedMed.id)) {
      setDroppedMeds([...droppedMeds, draggedMed])
    }
    setDraggedMed(null)
  }

  const medications = [
    { id: 1, name: 'Cisplatin', details: 'Injection • 1mg/mL', category: 'Chemotherapy' },
    { id: 2, name: 'Pemetrexed', details: 'Injection • 500mg', category: 'Chemotherapy' },
    { id: 3, name: 'Carboplatin', details: 'Injection • 10mg/mL', category: 'Chemotherapy' }
  ]
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Patient Context Banner */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <a href="/patients/1" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">Back to Patient Profile</span>
            </a>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jane Doe</h1>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">ID: #49203</span>
                  <span className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span> Penicillin Allergy
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Stage III Non-Small Cell Lung Cancer (NSCLC) • ECOG 1</p>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
              <div className="flex flex-col min-w-[80px]">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Weight</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">62 kg</span>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700 h-full"></div>
              <div className="flex flex-col min-w-[80px]">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Height</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">165 cm</span>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700 h-full"></div>
              <div className="flex flex-col min-w-[80px]">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">BSA</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">1.68 m²</span>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700 h-full"></div>
              <div className="flex flex-col min-w-[80px]">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">CrCl</span>
                <span className="text-lg font-bold text-red-600 flex items-center gap-1">45 mL/min <span className="material-symbols-outlined text-sm">arrow_downward</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace (3 Columns) */}
        <main className="flex-1 flex overflow-hidden w-full relative">
          {/* LEFT PANEL: Medication Selector */}
          <aside className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Medication Library</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm text-gray-900 dark:text-white" 
                  placeholder="Search generic or brand..." 
                  type="text"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                    AI Recommended
                  </h4>
                  <span className="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">High Confidence</span>
                </div>
                
                {medications.map((med) => (
                  <div 
                    key={med.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, med)}
                    className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{med.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{med.details}</p>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">drag_indicator</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{med.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* CENTER PANEL: Active Prescription */}
          <section className="flex-1 bg-white dark:bg-gray-900 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Prescription</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Cycle 1, Day 1 • Protocol: Cisplatin/Pemetrexed</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-lg">calculate</span>
                    Dose Calc
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                    Clear
                  </button>
                </div>
              </div>

              {droppedMeds.length > 0 ? (
                droppedMeds.map((med) => (
                  <div key={med.id} className="mb-4 relative group">
                    <div className="absolute -left-3 top-4 bottom-4 w-1.5 rounded-full bg-green-500"></div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-xl p-5 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                            <span className="material-symbols-outlined">vaccines</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{med.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{med.details}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setDroppedMeds(droppedMeds.filter(m => m.id !== med.id))}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Dose (mg/m²)</label>
                          <input className="block w-full border-gray-200 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white" type="text" defaultValue="75" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Route</label>
                          <select className="block w-full border-gray-200 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option>IV Infusion</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Frequency</label>
                          <select className="block w-full border-gray-200 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option>Day 1 only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Instructions</label>
                          <textarea className="block w-full border-gray-200 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:border-primary focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={1} placeholder="Enter instructions..."></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 mb-6">
                  <span className="material-symbols-outlined text-4xl mb-2">medication</span>
                  <span className="text-sm font-medium">Drag medications here to build prescription</span>
                </div>
              )}

              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 opacity-60"
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span className="text-sm">Drop medication here</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-lg shrink-0">
              <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Summary</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{droppedMeds.length} Medication{droppedMeds.length !== 1 ? 's' : ''} • Ready for Review</span>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Save Draft</button>
                  <button className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                    Review & Sign
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL: Clinical Intelligence */}
          <aside className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">psychology</span>
                Clinical Intelligence
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg p-3">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 mt-0.5">report</span>
                  <div>
                    <h4 className="text-sm font-bold text-red-900 dark:text-red-100">Drug-Drug Interaction</h4>
                    <p className="text-xs text-red-800 dark:text-red-200 mt-1 leading-relaxed">
                      <strong>Severe:</strong> Cisplatin + Furosemide (Patient Med List). Increased risk of ototoxicity and nephrotoxicity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-3">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">lightbulb</span>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Dose Adjustment Needed</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-200 mt-1 leading-relaxed">
                      Patient CrCl dropped to 45 mL/min. Cisplatin dose should be reduced to 50% or switched to Carboplatin (AUC 5) to preserve renal function.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default PrescriptionPage