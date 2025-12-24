'use client'

import { useState, useEffect } from 'react'

interface NewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (orderData: any) => void
  patientId?: string
}

interface Medication {
  id: string
  name: string
  genericName: string
  strength: string
  form: string
  category: string
}

interface DiagnosisCode {
  code: string
  description: string
  confidence: number
}

export default function NewOrderModal({ isOpen, onClose, onSubmit, patientId }: NewOrderModalProps) {
  const [orderType, setOrderType] = useState('medication')
  const [searchQuery, setSearchQuery] = useState('')
  const [medications, setMedications] = useState<Medication[]>([])
  const [filteredMeds, setFilteredMeds] = useState<Medication[]>([])
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [patientWeight, setPatientWeight] = useState(25) // kg for pediatric calc
  const [patientAge, setPatientAge] = useState(8) // years
  const [diagnosisCodes, setDiagnosisCodes] = useState<DiagnosisCode[]>([])
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    medication: '',
    dosage: '',
    frequency: 'once_daily',
    route: 'oral',
    duration: '',
    instructions: '',
    refills: 0,
    diagnosis: '',
    priority: 'routine'
  })

  // Mock medication database
  const mockMedications: Medication[] = [
    { id: '1', name: 'Amoxicillin', genericName: 'Amoxicillin', strength: '250mg', form: 'Capsule', category: 'Antibiotic' },
    { id: '2', name: 'Tylenol', genericName: 'Acetaminophen', strength: '325mg', form: 'Tablet', category: 'Analgesic' },
    { id: '3', name: 'Advil', genericName: 'Ibuprofen', strength: '200mg', form: 'Tablet', category: 'NSAID' },
    { id: '4', name: 'Lisinopril', genericName: 'Lisinopril', strength: '10mg', form: 'Tablet', category: 'ACE Inhibitor' },
    { id: '5', name: 'Metformin', genericName: 'Metformin', strength: '500mg', form: 'Tablet', category: 'Antidiabetic' }
  ]

  // Mock AI diagnosis suggestions
  const mockDiagnosisCodes: DiagnosisCode[] = [
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', confidence: 95 },
    { code: 'K59.00', description: 'Constipation, unspecified', confidence: 87 },
    { code: 'M79.3', description: 'Panniculitis, unspecified', confidence: 72 }
  ]

  useEffect(() => {
    setMedications(mockMedications)
    setDiagnosisCodes(mockDiagnosisCodes)
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = medications.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMeds(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [searchQuery, medications])

  // Pediatric dosing calculator
  const calculatePediatricDose = (medication: string, weight: number, age: number) => {
    const dosing: any = {
      'Amoxicillin': { mgPerKg: 25, maxDaily: 1000, frequency: 'twice_daily' },
      'Acetaminophen': { mgPerKg: 15, maxDaily: 3000, frequency: 'every_6_hours' },
      'Ibuprofen': { mgPerKg: 10, maxDaily: 1200, frequency: 'every_8_hours' }
    }
    
    const medDosing = dosing[medication]
    if (!medDosing) return null
    
    const calculatedDose = Math.min(medDosing.mgPerKg * weight, medDosing.maxDaily)
    return {
      dose: calculatedDose,
      frequency: medDosing.frequency,
      calculation: `${medDosing.mgPerKg}mg/kg × ${weight}kg = ${calculatedDose}mg`
    }
  }

  // Drug interaction checker
  const checkInteractions = (medication: string) => {
    const interactions: any = {
      'Amoxicillin': ['Warfarin - Monitor INR closely'],
      'Ibuprofen': ['Lisinopril - May reduce antihypertensive effect', 'Warfarin - Increased bleeding risk'],
      'Metformin': ['Contrast dye - Hold 48hrs before/after procedure']
    }
    
    return interactions[medication] || []
  }

  // Allergy checker
  const checkAllergies = (medication: string) => {
    const patientAllergies = ['Penicillin', 'Sulfa'] // Mock patient allergies
    const drugAllergies: any = {
      'Amoxicillin': ['Penicillin'],
      'Bactrim': ['Sulfa']
    }
    
    const medAllergies = drugAllergies[medication] || []
    return medAllergies.filter((allergy: string) => patientAllergies.includes(allergy))
  }

  const handleMedicationSelect = (med: Medication) => {
    setSelectedMed(med)
    setSearchQuery(med.name)
    setFormData({ ...formData, medication: med.name })
    setShowSuggestions(false)
    
    // Check for interactions and allergies
    const interactions = checkInteractions(med.genericName)
    const allergies = checkAllergies(med.genericName)
    const newWarnings = [...interactions, ...allergies.map((a: string) => `ALLERGY ALERT: Patient allergic to ${a}`)]
    setWarnings(newWarnings)
    
    // Calculate pediatric dose if applicable
    if (patientAge < 18) {
      const pediatricDose = calculatePediatricDose(med.genericName, patientWeight, patientAge)
      if (pediatricDose) {
        setFormData(prev => ({ 
          ...prev, 
          dosage: `${pediatricDose.dose}mg`,
          frequency: pediatricDose.frequency
        }))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      orderType,
      patientId,
      warnings,
      pediatricCalculation: patientAge < 18 ? calculatePediatricDose(selectedMed?.genericName || '', patientWeight, patientAge) : null
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Type</label>
            <div className="flex gap-2">
              {['medication', 'lab', 'imaging', 'procedure'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    orderType === type 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {orderType === 'medication' && (
            <>
              {/* Medication Search with Auto-complete */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medication Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Search medications..."
                />
                
                {showSuggestions && filteredMeds.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredMeds.map(med => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleMedicationSelect(med)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{med.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{med.genericName} {med.strength} {med.form}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Warnings Display */}
              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
                      <span className="material-symbols-outlined text-red-600 text-sm">warning</span>
                      <p className="text-red-800 dark:text-red-300 text-sm font-medium">{warning}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pediatric Dosing Calculator */}
              {patientAge < 18 && selectedMed && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Pediatric Dosing Calculator</h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={patientWeight}
                        onChange={(e) => setPatientWeight(Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">Age (years)</label>
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  {(() => {
                    const calc = calculatePediatricDose(selectedMed.genericName, patientWeight, patientAge)
                    return calc ? (
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium">Calculated Dose: {calc.dose}mg</p>
                        <p className="text-xs">{calc.calculation}</p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              {/* Dosing Interface */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="once_daily">Once Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="three_times_daily">Three Times Daily</option>
                    <option value="four_times_daily">Four Times Daily</option>
                    <option value="every_6_hours">Every 6 Hours</option>
                    <option value="every_8_hours">Every 8 Hours</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>
              </div>

              {/* Route and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route</label>
                  <select
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="oral">Oral</option>
                    <option value="iv">Intravenous</option>
                    <option value="im">Intramuscular</option>
                    <option value="topical">Topical</option>
                    <option value="sublingual">Sublingual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., 7 days"
                  />
                </div>
              </div>

              {/* Refills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Refills Authorized</label>
                <select
                  value={formData.refills}
                  onChange={(e) => setFormData({ ...formData, refills: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} refills</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* AI Diagnosis Code Linking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link to Diagnosis (AI Suggestions)
            </label>
            <div className="space-y-2">
              {diagnosisCodes.map(diagnosis => (
                <button
                  key={diagnosis.code}
                  type="button"
                  onClick={() => {
                    setSelectedDiagnosis(diagnosis.code)
                    setFormData({ ...formData, diagnosis: diagnosis.code })
                  }}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    selectedDiagnosis === diagnosis.code
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{diagnosis.code}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{diagnosis.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-blue-500">psychology</span>
                      <span className="text-xs text-blue-600 font-medium">{diagnosis.confidence}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Additional instructions for patient or pharmacy..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}