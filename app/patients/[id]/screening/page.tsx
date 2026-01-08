'use client'

import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function PatientScreeningPage() {
  const params = useParams()
  const [selectedTab, setSelectedTab] = useState('Depression')
  const [phq9Answers, setPhq9Answers] = useState([1, 2, 0, 1, 2, 1, 0, 2, 1])
  
  const phq9Questions = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless", 
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself"
  ]

  const totalScore = phq9Answers.reduce((sum, answer) => sum + answer, 0)
  
  const getScoreInterpretation = (score: number) => {
    if (score <= 4) return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
    if (score <= 9) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (score <= 14) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-50" }
    if (score <= 19) return { level: "Moderately Severe", color: "text-red-600", bg: "bg-red-50" }
    return { level: "Severe", color: "text-red-800", bg: "bg-red-100" }
  }

  const interpretation = getScoreInterpretation(totalScore)

  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden">
        <PatientDetailSidebar patientId={params.id as string} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Screening</h1>
              <p className="text-gray-600 dark:text-gray-400">Patient health questionnaires and screening tools</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {['Depression', 'Anxiety', 'Substance Use', 'ADHD'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        selectedTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {selectedTab === 'Depression' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">PHQ-9 Depression Screening</h2>
                      <p className="text-gray-600 dark:text-gray-400">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
                    </div>

                    <div className={`${interpretation.bg} border border-gray-200 rounded-lg p-4 mb-6`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">Total Score: {totalScore}/27</h3>
                          <p className={`${interpretation.color} font-medium`}>Depression Severity: {interpretation.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {phq9Questions.map((question, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <p className="text-gray-900 dark:text-white mb-3 font-medium">{index + 1}. {question}</p>
                          <div className="flex gap-4">
                            {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={optionIndex}
                                  checked={phq9Answers[index] === optionIndex}
                                  onChange={(e) => {
                                    const newAnswers = [...phq9Answers]
                                    newAnswers[index] = parseInt(e.target.value)
                                    setPhq9Answers(newAnswers)
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{option} ({optionIndex})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                        Save Assessment
                      </button>
                      <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                        Finalize & Sign
                      </button>
                      <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        Print Report
                      </button>
                    </div>
                  </div>
                )}

                {selectedTab !== 'Depression' && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">psychology</span>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{selectedTab} Screening</h3>
                    <p className="text-gray-500">Screening tools for {selectedTab.toLowerCase()} will be available soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
