'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useState } from 'react'

export default function PastMedicalHistoryPage() {
  const params = useParams()
  const [expandedRow, setExpandedRow] = useState<number | null>(0)

  const conditions = [
    {
      id: 1,
      condition: 'Type 2 Diabetes Mellitus',
      code: 'ICD-10: E11.9',
      category: 'Chronic',
      status: 'Active',
      date: '2015',
      impact: 'High',
      source: 'Clinician',
      icon: 'glucose',
      iconBg: 'bg-red-50 text-red-600',
      description: 'Poorly controlled recently. Last A1c 8.2% (Sept 2023). Patient reports difficulty with diet adherence.',
      relevance: 'Requires monitoring for complications and medication adjustments.',
      treatment: ['Metformin 1000mg BID', 'Glipizide (Discontinued 2020)', 'Insulin glargine 20 units qHS'],
      complications: 'Mild non-proliferative retinopathy (2022). No nephropathy or neuropathy detected.',
      careGaps: [
        { label: 'Eye Exam Overdue', icon: 'visibility' },
        { label: 'Foot Exam due Dec', icon: 'footprint' }
      ]
    },
    {
      id: 2,
      condition: 'Essential Hypertension',
      code: 'ICD-10: I10',
      category: 'Chronic',
      status: 'Active',
      date: '2018',
      impact: 'Medium',
      source: 'Clinician',
      icon: 'favorite',
      iconBg: 'bg-orange-50 text-orange-600',
      description: 'Well-controlled on current regimen. Last BP 128/82 mmHg (Oct 2023).',
      relevance: 'Monitor for target BP <130/80 in diabetic patient.',
      treatment: ['Lisinopril 10mg daily', 'Amlodipine 5mg daily'],
      complications: 'No end-organ damage detected.',
      careGaps: [
        { label: 'BP Check due', icon: 'monitor_heart' }
      ]
    },
    {
      id: 3,
      condition: 'Hyperlipidemia',
      code: 'ICD-10: E78.5',
      category: 'Chronic',
      status: 'Active',
      date: '2017',
      impact: 'Medium',
      source: 'Clinician',
      icon: 'water_drop',
      iconBg: 'bg-yellow-50 text-yellow-600',
      description: 'Improving on statin therapy. Last LDL 95 mg/dL (Sept 2023).',
      relevance: 'Target LDL <70 mg/dL for diabetic patient with CVD risk.',
      treatment: ['Atorvastatin 40mg daily'],
      complications: 'No cardiovascular events.',
      careGaps: [
        { label: 'Lipid Panel due', icon: 'science' }
      ]
    },
    {
      id: 4,
      condition: 'Gastroesophageal Reflux Disease',
      code: 'ICD-10: K21.9',
      category: 'Chronic',
      status: 'Active',
      date: '2020',
      impact: 'Low',
      source: 'Patient',
      icon: 'stomach',
      iconBg: 'bg-green-50 text-green-600',
      description: 'Mild symptoms, well-controlled with PPI therapy.',
      relevance: 'Monitor for symptom control and potential complications.',
      treatment: ['Omeprazole 20mg daily'],
      complications: 'No Barrett\'s esophagus or strictures.',
      careGaps: []
    },
    {
      id: 5,
      condition: 'Osteoarthritis, Bilateral Knees',
      code: 'ICD-10: M17.0',
      category: 'Chronic',
      status: 'Active',
      date: '2019',
      impact: 'Medium',
      source: 'Imaging',
      icon: 'bone',
      iconBg: 'bg-purple-50 text-purple-600',
      description: 'Moderate degenerative changes. Patient reports morning stiffness and pain with activity.',
      relevance: 'May limit exercise capacity for diabetes management.',
      treatment: ['Ibuprofen 400mg PRN', 'Physical therapy'],
      complications: 'No joint deformity.',
      careGaps: [
        { label: 'Orthopedic referral', icon: 'healing' }
      ]
    },
    {
      id: 6,
      condition: 'Appendectomy',
      code: 'ICD-10: Z98.89',
      category: 'Surgical',
      status: 'Resolved',
      date: '1995',
      impact: 'Low',
      source: 'Patient',
      icon: 'surgical',
      iconBg: 'bg-gray-50 text-gray-600',
      description: 'Uncomplicated laparoscopic appendectomy at age 25.',
      relevance: 'No ongoing clinical significance.',
      treatment: [],
      complications: 'None.',
      careGaps: []
    },
    {
      id: 7,
      condition: 'Seasonal Allergic Rhinitis',
      code: 'ICD-10: J30.1',
      category: 'Allergic',
      status: 'Active',
      date: '2010',
      impact: 'Low',
      source: 'Patient',
      icon: 'air',
      iconBg: 'bg-blue-50 text-blue-600',
      description: 'Spring and fall symptoms, well-controlled with antihistamines.',
      relevance: 'Consider environmental triggers.',
      treatment: ['Loratadine 10mg daily PRN'],
      complications: 'No asthma development.',
      careGaps: []
    },
    {
      id: 8,
      condition: 'Vitamin D Deficiency',
      code: 'ICD-10: E55.9',
      category: 'Nutritional',
      status: 'Resolved',
      date: '2022',
      impact: 'Low',
      source: 'Lab',
      icon: 'wb_sunny',
      iconBg: 'bg-yellow-50 text-yellow-600',
      description: 'Corrected with supplementation. Last level 35 ng/mL (Aug 2023).',
      relevance: 'Monitor levels annually.',
      treatment: ['Vitamin D3 2000 IU daily'],
      complications: 'None.',
      careGaps: []
    }
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Past Medical History</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-gray-300 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  No Significant PMH
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Condition
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Total Conditions</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">medical_information</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Active Chronic</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">chronic</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">High Impact</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">2</p>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">priority_high</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Last Updated</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">2d</p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">update</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medical Conditions</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600">
                      All (8)
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-gray-400 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                      Active (5)
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-gray-400 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                      Resolved (3)
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Condition</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Impact</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Source</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                    {conditions.map((condition, index) => (
                      <>
                        <tr 
                          key={condition.id} 
                          className="hover:bg-slate-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                          onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${condition.iconBg}`}>
                                <span className="material-symbols-outlined text-sm">{condition.icon}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">{condition.condition}</div>
                                <div className="text-sm text-slate-500 dark:text-gray-400">{condition.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              condition.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              condition.status === 'Resolved' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {condition.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{condition.date}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              condition.impact === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              condition.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {condition.impact}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{condition.source}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                                <span className="material-symbols-outlined text-sm">
                                  {expandedRow === index ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === index && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-slate-50 dark:bg-gray-700/30">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Clinical Details</h4>
                                  <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">{condition.description}</p>
                                  
                                  <div className="mb-3">
                                    <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-1">Current Treatment</h5>
                                    <ul className="text-sm text-slate-600 dark:text-gray-300 space-y-1">
                                      {condition.treatment?.map((tx, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                          {tx}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  {condition.complications && (
                                    <div>
                                      <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-1">Complications</h5>
                                      <p className="text-sm text-slate-600 dark:text-gray-300">{condition.complications}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Care Gaps & Alerts</h4>
                                  <div className="space-y-2">
                                    {condition.careGaps?.map((gap, i) => (
                                      <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">{gap.icon}</span>
                                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{gap.label}</span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="mt-4">
                                    <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-2">Clinical Relevance</h5>
                                    <p className="text-sm text-slate-600 dark:text-gray-300">{condition.relevance}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Intelligence Panel */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">psychology</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Intelligence</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Risk Stratification</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                    Patient has multiple cardiovascular risk factors. Consider comprehensive risk assessment.
                  </p>
                  <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    View Risk Calculator →
                  </button>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Care Coordination</h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-3">
                    Diabetes management appears well-coordinated with endocrinology. Last consultation 3 months ago.
                  </p>
                  <button className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline">
                    View Care Team →
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Workflow */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">verified</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verification Status</h3>
                </div>
                <button className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                  Verify All Conditions
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                    <span className="font-medium text-slate-900 dark:text-white">Type 2 Diabetes Mellitus</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Verified Today</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">schedule</span>
                    <span className="font-medium text-slate-900 dark:text-white">Hypertension</span>
                  </div>
                  <button className="text-xs text-yellow-600 dark:text-yellow-400 font-medium hover:underline">
                    Needs Verification
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                    <span className="font-medium text-slate-900 dark:text-white">Hyperlipidemia</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Verified 2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}