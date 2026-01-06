'use client'

import { useState, useEffect } from 'react'
import AITransparency from './AITransparency'

interface ClinicalSectionsProps {
  patientId: string
  visitId?: string
  isEditable?: boolean
}

interface ClinicalData {
  reviewOfSystems: {
    constitutional: string
    cardiovascular: string
    respiratory: string
    gastrointestinal: string
    genitourinary: string
    musculoskeletal: string
    neurological: string
    psychiatric: string
    endocrine: string
    hematologic: string
    allergic: string
  }
  socialHistory: {
    smoking: string
    alcohol: string
    drugs: string
    occupation: string
    maritalStatus: string
    livingArrangement: string
    exercise: string
    diet: string
  }
  familyHistory: {
    father: string
    mother: string
    siblings: string
    children: string
    maternalGrandparents: string
    paternalGrandparents: string
  }
  surgicalHistory: {
    procedures: Array<{
      procedure: string
      date: string
      surgeon: string
      complications: string
    }>
  }
}

const ClinicalSections = ({ patientId, visitId, isEditable = false }: ClinicalSectionsProps) => {
  const [activeSection, setActiveSection] = useState('ros')
  const [isListening, setIsListening] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [clinicalData, setClinicalData] = useState<ClinicalData>({
    reviewOfSystems: {
      constitutional: 'No fever, chills, or unintentional weight loss',
      cardiovascular: 'No chest pain, palpitations, or shortness of breath',
      respiratory: 'No cough, dyspnea, or wheezing',
      gastrointestinal: 'No nausea, vomiting, or abdominal pain',
      genitourinary: 'No dysuria or frequency',
      musculoskeletal: 'No joint pain or stiffness',
      neurological: 'No headaches, dizziness, or weakness',
      psychiatric: 'Mood stable, no depression or anxiety',
      endocrine: 'No heat/cold intolerance, no polyuria/polydipsia',
      hematologic: 'No easy bruising or bleeding',
      allergic: 'No known drug allergies'
    },
    socialHistory: {
      smoking: 'Never smoker',
      alcohol: 'Occasional social drinking',
      drugs: 'Denies illicit drug use',
      occupation: 'Office worker',
      maritalStatus: 'Married',
      livingArrangement: 'Lives with spouse',
      exercise: 'Walks 30 minutes 3x/week',
      diet: 'Regular diet, trying to reduce sodium'
    },
    familyHistory: {
      father: 'Hypertension, diabetes (age 65)',
      mother: 'Breast cancer (age 58), alive',
      siblings: '1 brother - healthy',
      children: '2 children - healthy',
      maternalGrandparents: 'Grandmother - stroke (age 78)',
      paternalGrandparents: 'Grandfather - MI (age 70)'
    },
    surgicalHistory: {
      procedures: [
        {
          procedure: 'Appendectomy',
          date: '2010-03-15',
          surgeon: 'Dr. Smith',
          complications: 'None'
        }
      ]
    }
  })

  const sections = [
    { id: 'ros', label: 'Review of Systems', icon: 'checklist' },
    { id: 'social', label: 'Social History', icon: 'groups' },
    { id: 'family', label: 'Family History', icon: 'family_restroom' },
    { id: 'surgical', label: 'Surgical History', icon: 'medical_services' }
  ]

  const handleDictation = () => {
    setIsListening(!isListening)
    // Simulate AI processing
    if (!isListening) {
      setTimeout(() => {
        setAiSuggestions([
          'Patient mentions father has diabetes',
          'Social drinking mentioned - 2-3 drinks per week',
          'Denies chest pain or shortness of breath'
        ])
      }, 2000)
    }
  }

  const applySuggestion = (suggestion: string) => {
    // AI mapping logic would go here
    console.log('Applying AI suggestion:', suggestion)
    setAiSuggestions(prev => prev.filter(s => s !== suggestion))
  }

  const updateField = (section: keyof ClinicalData, field: string, value: string) => {
    setClinicalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const saveToPatientChart = async () => {
    // This would save to the longitudinal patient chart
    console.log('Saving to patient chart:', clinicalData)
    // API call to update patient profile
  }

  useEffect(() => {
    if (isEditable) {
      // Auto-save changes to patient chart
      const timer = setTimeout(saveToPatientChart, 1000)
      return () => clearTimeout(timer)
    }
  }, [clinicalData, isEditable])

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clinical Documentation</h3>
        {isEditable && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDictation}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isListening 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isListening ? 'stop' : 'mic'}
              </span>
              {isListening ? 'Stop Dictation' : 'Start Dictation'}
            </button>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              AI Enabled
            </span>
            <AITransparency className="ml-2" />
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">psychology</span>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Detected Information</span>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                <button
                  onClick={() => applySuggestion(suggestion)}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
              activeSection === section.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="space-y-4">
        {activeSection === 'ros' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(clinicalData.reviewOfSystems).map(([system, value]) => (
              <div key={system}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                  {system.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {isEditable ? (
                  <textarea
                    value={value}
                    onChange={(e) => updateField('reviewOfSystems', system, e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(clinicalData.socialHistory).map(([category, value]) => (
              <div key={category}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {isEditable ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateField('socialHistory', category, e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'family' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(clinicalData.familyHistory).map(([relation, value]) => (
              <div key={relation}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                  {relation.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {isEditable ? (
                  <textarea
                    value={value}
                    onChange={(e) => updateField('familyHistory', relation, e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'surgical' && (
          <div className="space-y-4">
            {clinicalData.surgicalHistory.procedures.map((procedure, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Procedure
                    </label>
                    {isEditable ? (
                      <input
                        type="text"
                        value={procedure.procedure}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{procedure.procedure}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    {isEditable ? (
                      <input
                        type="date"
                        value={procedure.date}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{procedure.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Surgeon
                    </label>
                    {isEditable ? (
                      <input
                        type="text"
                        value={procedure.surgeon}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{procedure.surgeon}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Complications
                    </label>
                    {isEditable ? (
                      <input
                        type="text"
                        value={procedure.complications}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{procedure.complications}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isEditable && (
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Surgical Procedure
              </button>
            )}
          </div>
        )}
      </div>

      {isEditable && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
              Auto-saving to patient chart
            </div>
            <button
              onClick={saveToPatientChart}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicalSections