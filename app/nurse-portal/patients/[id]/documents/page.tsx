'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function PatientDocumentsPage() {
  const params = useParams()
  const patientId = params.id as string
  const patient = PatientDataManager.getPatient(patientId)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    const savedDocs = PatientDataManager.getPatientSectionList(patientId, 'documents')
    setDocuments(savedDocs)
  }, [patientId])

  const handleRemoveDocument = (id: string) => {
    const nextDocuments = documents.filter((doc) => doc.id !== id)
    setDocuments(nextDocuments)
    PatientDataManager.savePatientSectionList(patientId, 'documents', nextDocuments)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={patientId} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                  <span className="text-primary text-sm font-medium">{patient?.name || 'Patient'}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Documents</h2>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Uploaded files appear here after saving the visit.
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Patient Documents</h3>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {documents.length} file{documents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">description</span>
                    <p>No documents uploaded yet</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">description</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{doc.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(doc.type || 'file').toString().toUpperCase()} • {Math.round((doc.size || 0) / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.dataUrl && (
                          <a
                            href={doc.dataUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-primary hover:text-primary/80"
                          >
                            Open
                          </a>
                        )}
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove document"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
