'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientMedicationsPage() {
  const params = useParams()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedication, setNewMedication] = useState({
    brandName: '',
    generic: '',
    strength: '',
    form: '',
    dosage: '',
    frequency: ''
  })
  const [medications, setMedications] = useState([])

  const handleAddMedication = () => {
    if (newMedication.brandName && newMedication.strength) {
      const medication = {
        id: Date.now(),
        ...newMedication,
        status: 'Active'
      }
      setMedications([...medications, medication])
      setNewMedication({ brandName: '', generic: '', strength: '', form: '', dosage: '', frequency: '' })
      setShowAddForm(false)
    }
  }

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
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Medication History</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print List
                </button>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Medication
                </button>
              </div>
            </div>

            {showAddForm && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Medication</h3>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name *</label>
                    <input
                      type="text"
                      value={newMedication.brandName}
                      onChange={(e) => setNewMedication({...newMedication, brandName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g., Lisinopril"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Generic Name</label>
                    <input
                      type="text"
                      value={newMedication.generic}
                      onChange={(e) => setNewMedication({...newMedication, generic: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g., Lisinopril"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strength *</label>
                    <input
                      type="text"
                      value={newMedication.strength}
                      onChange={(e) => setNewMedication({...newMedication, strength: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form</label>
                    <select
                      value={newMedication.form}
                      onChange={(e) => setNewMedication({...newMedication, form: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select form</option>
                      <option value="Tab">Tablet</option>
                      <option value="Cap">Capsule</option>
                      <option value="Liq">Liquid</option>
                      <option value="Inj">Injection</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={handleAddMedication}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Medication
                  </button>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Brand Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Generic</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Strength</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Form</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">medication</span>
                        <p>No medications recorded</p>
                      </td>
                    </tr>
                  ) : (
                    medications.map((med) => (
                      <tr key={med.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{med.brandName}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{med.generic}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{med.strength}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{med.form}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            med.status === 'Active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {med.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}