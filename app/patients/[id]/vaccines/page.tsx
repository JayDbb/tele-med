'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { getVaccines, createVaccine, deleteVaccine, getPatient, getAllergies } from '@/lib/api'

export default function PatientVaccinesPage() {
  const params = useParams()
  const patientId = params.id as string
  const [vaccines, setVaccines] = useState<any[]>([])
  const [patient, setPatient] = useState<any>(null)
  const [allergies, setAllergies] = useState<any[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    dose: '',
    site: '',
    route: '',
    lotNumber: '',
    manufacturer: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
  }, [patientId])

  const fetchUserName = async (userId: string): Promise<string> => {
    if (!userId) return 'Unknown'
    if (userNames[userId]) return userNames[userId]

    try {
      const res = await fetch(`/api/clinicians/${userId}`)
      if (res.ok) {
        const userData = await res.json()
        const name = userData.full_name || userData.email?.split('@')[0] || 'Unknown User'
        setUserNames(prev => ({ ...prev, [userId]: name }))
        return name
      }
    } catch (err) {
      console.warn('Could not fetch user name:', err)
    }
    return 'Unknown User'
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [vaccinesData, patientData, allergiesData] = await Promise.all([
        getVaccines(patientId),
        getPatient(patientId),
        getAllergies(patientId).catch(() => [])
      ])
      setVaccines(vaccinesData || [])
      setPatient(patientData.patient)
      setAllergies(allergiesData || [])

      // Fetch user names for all recorded_by IDs
      if (vaccinesData && vaccinesData.length > 0) {
        const uniqueUserIds = Array.from(new Set(vaccinesData.map((v: any) => v.recorded_by).filter(Boolean)))
        await Promise.all(uniqueUserIds.map((userId: string) => fetchUserName(userId)))
      }
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadVaccines = async () => {
    try {
      const data = await getVaccines(patientId)
      setVaccines(data || [])
    } catch (err: any) {
      console.error('Error loading vaccines:', err)
      setError(err?.message || 'Failed to load vaccines')
    }
  }

  const handleSaveVaccine = async () => {
    if (!formData.name.trim() || !formData.date.trim()) {
      setError('Vaccine name and date are required')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await createVaccine(patientId, {
        name: formData.name,
        date: formData.date,
        dose: formData.dose || undefined,
        site: formData.site || undefined,
        route: formData.route || undefined,
        lotNumber: formData.lotNumber || undefined,
        manufacturer: formData.manufacturer || undefined,
      })

      // Reload all data from API (this will also fetch user names)
      await loadAllData()

      setFormData({
        name: '',
        date: '',
        dose: '',
        site: '',
        route: '',
        lotNumber: '',
        manufacturer: ''
      })
    } catch (err: any) {
      console.error('Error adding vaccine:', err)
      setError(err?.message || 'Failed to add vaccine')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveVaccine = async (id: string) => {
    try {
      setIsDeleting(id)
      await deleteVaccine(patientId, id)
      // Reload all data from API
      await loadAllData()
    } catch (err: any) {
      console.error('Error deleting vaccine:', err)
      setError(err?.message || 'Failed to delete vaccine')
    } finally {
      setIsDeleting(null)
    }
  }

  // Calculate patient age from DOB
  const calculateAge = (dob: string | null) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Get latest vaccine by name
  const getLatestVaccine = (vaccineName: string) => {
    const matchingVaccines = vaccines
      .filter(v => v.name?.toLowerCase().includes(vaccineName.toLowerCase()))
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    return matchingVaccines[0] || null
  }

  // Check for egg allergy
  const hasEggAllergy = allergies.some(a =>
    a.name?.toLowerCase().includes('egg')
  )

  // Get most recent vaccine
  const latestVaccine = vaccines.length > 0
    ? vaccines.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0]
    : null

  // Get specific vaccines
  const covidVaccine = getLatestVaccine('covid')
  const fluVaccine = getLatestVaccine('flu')
  const tdapVaccine = getLatestVaccine('tdap')
  const hepBVaccines = vaccines.filter(v => v.name?.toLowerCase().includes('hepatitis b') || v.name?.toLowerCase().includes('hep b'))
  const mmrVaccines = vaccines.filter(v => v.name?.toLowerCase().includes('mmr') || v.name?.toLowerCase().includes('measles'))

  const patientAge = calculateAge(patient?.dob)
  const patientName = patient?.full_name || 'Not recorded'
  const patientDOB = patient?.dob
    ? new Date(patient.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not provided'

  // Calculate vaccine status
  const getVaccineStatus = () => {
    if (vaccines.length === 0) return { status: 'No Records', color: 'gray', count: 0 }
    const recentVaccines = vaccines.filter(v => {
      if (!v.date) return false
      const vaccineDate = new Date(v.date)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      return vaccineDate >= oneYearAgo
    })
    if (recentVaccines.length === vaccines.length) {
      return { status: 'Up to Date', color: 'green', count: vaccines.length }
    }
    return { status: 'Partially Up to Date', color: 'amber', count: recentVaccines.length }
  }

  const vaccineStatus = getVaccineStatus()

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id as string} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                  <span className="text-primary text-sm font-medium">
                    {loading ? 'Loading...' : `${patientName} (DOB: ${patientDOB})`}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Immunization Management</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Record
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Import History
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Status</span>
                  </div>
                  {vaccineStatus.color === 'green' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Up to Date</span>
                  ) : vaccineStatus.color === 'amber' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Action Needed</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">No Records</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{vaccineStatus.status}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>{vaccines.length} {vaccines.length === 1 ? 'vaccine' : 'vaccines'} recorded</span>
                </div>
              </div>

              {hasEggAllergy && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">Contraindication</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-lg font-bold text-red-700 dark:text-red-300 leading-tight">Egg Allergy</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                    <span>Use Egg-Free Flu Vax</span>
                  </div>
                </div>
              )}

              {tdapVaccine && (() => {
                const tdapDate = new Date(tdapVaccine.date || 0)
                const tenYearsAgo = new Date()
                tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
                const isOverdue = tdapDate < tenYearsAgo
                return isOverdue ? (
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
                      </div>
                      <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">Tdap</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-[11px] font-medium">
                      <span>Last: {tdapDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ) : null
              })()}

              {latestVaccine && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">Last Vax</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{latestVaccine.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span>{latestVaccine.date ? new Date(latestVaccine.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not recorded'}</span>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Docs</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-sm">open_in_new</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Certificate</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Generate PDF</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* {patientAge !== null && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 relative">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">medical_information</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Decision Support: Recommended Today</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Based on age ({patientAge}y) and risk factors{hasEggAllergy ? ', <strong>Influenza (Egg-free)</strong>' : ', <strong>Influenza</strong>'} is recommended.
                        {!tdapVaccine && ' <strong>Tdap Booster</strong> is recommended. '}
                        {hepBVaccines.length === 0 && 'Patient has no record of Hep B series; consider screening.'}
                      </p>
                    </div>
                    <button className="ml-auto text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                )} */}

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">Vaccine Schedule</h3>
                      <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">Adult Guidelines (19+)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400"><span className="size-2 rounded-full bg-green-500"></span>Given</span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400"><span className="size-2 rounded-full bg-amber-500"></span>Due</span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400"><span className="size-2 rounded-full bg-red-500"></span>Overdue</span>
                    </div>
                  </div>
                  <div className="p-0">
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {covidVaccine && (() => {
                        const covidDate = new Date(covidVaccine.date || 0)
                        const oneYearAgo = new Date()
                        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
                        const isUpToDate = covidDate >= oneYearAgo
                        return (
                          <div className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isUpToDate ? '' : 'border-l-4 border-l-amber-400 bg-amber-50/10 dark:bg-amber-900/10'}`}>
                            <div className="flex items-center gap-3 w-1/3">
                              <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg material-symbols-outlined text-sm">coronavirus</span>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">COVID-19</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Annual Updated Formula</p>
                              </div>
                            </div>
                            <div className="flex-1 px-4">
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div className={`h-2 rounded-full ${isUpToDate ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: isUpToDate ? '100%' : '50%' }}></div>
                              </div>
                              <p className={`text-[10px] mt-1 text-right ${isUpToDate ? 'text-gray-400 dark:text-gray-500' : 'text-amber-600 dark:text-amber-400 font-semibold'}`}>
                                {isUpToDate ? `Last: ${covidDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Due Now'}
                              </p>
                            </div>
                            <div className="w-24 text-right">
                              {isUpToDate ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Up to date</span>
                              ) : (
                                <button
                                  onClick={() => setFormData({ ...formData, name: 'COVID-19' })}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                                >
                                  Administer
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })()}

                      {fluVaccine ? (() => {
                        const fluDate = new Date(fluVaccine.date || 0)
                        const sixMonthsAgo = new Date()
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
                        const isDue = fluDate < sixMonthsAgo
                        return (
                          <div className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isDue ? 'border-l-4 border-l-amber-400 bg-amber-50/10 dark:bg-amber-900/10' : ''}`}>
                            <div className="flex items-center gap-3 w-1/3">
                              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg material-symbols-outlined text-sm">ac_unit</span>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Influenza</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Seasonal</p>
                              </div>
                            </div>
                            <div className="flex-1 px-4">
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 relative">
                                {isDue && <div className="absolute -top-1 right-0 text-amber-500 material-symbols-outlined text-sm bg-white dark:bg-gray-800 rounded-full shadow-sm">warning</div>}
                                <div className={`h-2 rounded-full ${isDue ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: isDue ? '50%' : '100%' }}></div>
                              </div>
                              <p className={`text-[10px] mt-1 text-right ${isDue ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                                {isDue ? 'Due Now' : `Last: ${fluDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                              </p>
                            </div>
                            <div className="w-24 text-right">
                              {isDue ? (
                                <button
                                  onClick={() => setFormData({ ...formData, name: hasEggAllergy ? 'Flu (Egg-Free)' : 'Influenza' })}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                                >
                                  Administer
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Up to date</span>
                              )}
                            </div>
                          </div>
                        )
                      })() : (
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4 border-l-amber-400 bg-amber-50/10 dark:bg-amber-900/10">
                          <div className="flex items-center gap-3 w-1/3">
                            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg material-symbols-outlined text-sm">ac_unit</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Influenza</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Seasonal</p>
                            </div>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2"></div>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold text-right">Due Now</p>
                          </div>
                          <div className="w-24 text-right">
                            <button
                              onClick={() => setFormData({ ...formData, name: hasEggAllergy ? 'Flu (Egg-Free)' : 'Influenza' })}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                            >
                              Administer
                            </button>
                          </div>
                        </div>
                      )}

                      {tdapVaccine ? (() => {
                        const tdapDate = new Date(tdapVaccine.date || 0)
                        const tenYearsAgo = new Date()
                        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
                        const isOverdue = tdapDate < tenYearsAgo
                        return (
                          <div className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isOverdue ? 'border-l-4 border-l-red-400 bg-red-50/10 dark:bg-red-900/10' : ''}`}>
                            <div className="flex items-center gap-3 w-1/3">
                              <span className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg material-symbols-outlined text-sm">vaccines</span>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Tdap / Td</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Every 10 years</p>
                              </div>
                            </div>
                            <div className="flex-1 px-4">
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div className={`h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: isOverdue ? '0%' : '100%' }}></div>
                              </div>
                              <p className={`text-[10px] mt-1 text-right ${isOverdue ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                                {isOverdue ? `Overdue (Last: ${tdapDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : `Last: ${tdapDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                              </p>
                            </div>
                            <div className="w-24 text-right">
                              {isOverdue ? (
                                <button
                                  onClick={() => setFormData({ ...formData, name: 'Tdap' })}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                                >
                                  Administer
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Up to date</span>
                              )}
                            </div>
                          </div>
                        )
                      })() : (
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4 border-l-red-400 bg-red-50/10 dark:bg-red-900/10">
                          <div className="flex items-center gap-3 w-1/3">
                            <span className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg material-symbols-outlined text-sm">vaccines</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Tdap / Td</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Every 10 years</p>
                            </div>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2"></div>
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold text-right">No Record</p>
                          </div>
                          <div className="w-24 text-right">
                            <button
                              onClick={() => setFormData({ ...formData, name: 'Tdap' })}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                            >
                              Administer
                            </button>
                          </div>
                        </div>
                      )}

                      {hepBVaccines.length > 0 ? (
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3 w-1/3">
                            <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg material-symbols-outlined text-sm">bloodtype</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Hepatitis B</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">3-dose series</p>
                            </div>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((hepBVaccines.length / 3) * 100, 100)}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
                              {hepBVaccines.length} of 3 doses
                            </p>
                          </div>
                          <div className="w-24 text-right">
                            {hepBVaccines.length >= 3 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Completed</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">In Progress</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3 w-1/3">
                            <span className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg material-symbols-outlined text-sm">bloodtype</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Hepatitis B</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">3-dose series</p>
                            </div>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">No Record</p>
                          </div>
                          <div className="w-24 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">Missing</span>
                          </div>
                        </div>
                      )}

                      {mmrVaccines.length > 0 ? (
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3 w-1/3">
                            <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg material-symbols-outlined text-sm">child_care</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">MMR</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Measles, Mumps, Rubella</p>
                            </div>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
                              Last: {new Date(mmrVaccines[0].date || 0).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="w-24 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Completed</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col h-full ring-1 ring-gray-900/5 dark:ring-gray-100/5">
                  <div className="bg-primary p-4 text-white">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined">syringe</span>
                      Administer Vaccine
                    </h3>
                    <p className="text-xs text-blue-100 mt-1">Record a new administration now</p>
                  </div>
                  <div className="p-5 flex flex-col gap-5 flex-1 bg-white dark:bg-gray-900">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Vaccine</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 text-[18px]">search</span>
                        <input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-9 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary font-medium text-gray-900 dark:text-white"
                          placeholder="Search vaccine (e.g. Tdap)"
                          type="text"
                        />
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => setFormData({ ...formData, name: 'Tdap' })}
                          className="px-2 py-1 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
                        >
                          Tdap
                        </button>
                        <button
                          onClick={() => setFormData({ ...formData, name: 'Flu (Egg-Free)' })}
                          className="px-2 py-1 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                        >
                          Flu (Egg-Free)
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Date</label>
                        <input
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                          type="date"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Dose #</label>
                        <select
                          value={formData.dose}
                          onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                          className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                        >
                          <option value="">Select dose</option>
                          <option>Booster</option>
                          <option>Dose 1</option>
                          <option>Dose 2</option>
                          <option>Dose 3</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Site</label>
                        <select
                          value={formData.site}
                          onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                          className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                        >
                          <option value="">Select site</option>
                          <option>Left Deltoid</option>
                          <option>Right Deltoid</option>
                          <option>Left Vastus Lateralis</option>
                          <option>Right Vastus Lateralis</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Route</label>
                        <select
                          value={formData.route}
                          onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                          className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                        >
                          <option value="">Select route</option>
                          <option>Intramuscular (IM)</option>
                          <option>Subcutaneous (SC)</option>
                          <option>Intranasal</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex justify-between">
                        Lot Number
                        <span className="text-primary cursor-pointer flex items-center gap-1 text-[10px] font-normal"><span className="material-symbols-outlined text-[12px]">qr_code_scanner</span> Scan</span>
                      </label>
                      <input
                        value={formData.lotNumber}
                        onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                        placeholder="Lot #"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Manufacturer</label>
                      <select
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                      >
                        <option value="">Select Manufacturer</option>
                        <option>GSK</option>
                        <option>Sanofi Pasteur</option>
                        <option>Merck</option>
                        <option>Pfizer</option>
                        <option>Moderna</option>
                      </select>
                    </div>
                    <div className="mt-auto pt-4">
                      <button
                        onClick={handleSaveVaccine}
                        disabled={isSaving || !formData.name.trim() || !formData.date.trim()}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">save</span>
                            Save & Update Schedule
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Immunization History</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      All ({loading ? '...' : vaccines.length})
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">Refusals (0)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1.5 text-gray-400 dark:text-gray-500 text-lg">filter_list</span>
                    <select className="pl-8 pr-8 py-1.5 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 focus:ring-0 focus:border-gray-300 dark:focus:border-gray-500">
                      <option>Filter by Vaccine</option>
                      <option>Filter by Date</option>
                    </select>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">download</span> Export PDF
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                      <th className="px-6 py-3">Vaccine Name</th>
                      <th className="px-6 py-3">Date Given</th>
                      <th className="px-6 py-3">Dose #</th>
                      <th className="px-6 py-3">Site / Route</th>
                      <th className="px-6 py-3">Lot # / Mfr</th>
                      <th className="px-6 py-3">Source</th>
                      <th className="px-6 py-3">Given By</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-gray-500 dark:text-gray-400">Loading vaccines...</p>
                          </div>
                        </td>
                      </tr>
                    ) : vaccines.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">vaccines</span>
                          <p>No vaccines recorded</p>
                        </td>
                      </tr>
                    ) : (
                      vaccines.map((vaccine) => (
                        <tr key={vaccine.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-gray-900 dark:text-white">{vaccine.name}</div>
                            {vaccine.manufacturer && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">{vaccine.manufacturer}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-900 dark:text-white">
                              {vaccine.date ? new Date(vaccine.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not recorded'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {vaccine.dose || 'Not specified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 dark:text-white">{vaccine.site || 'Not specified'}</div>
                            {vaccine.route && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">{vaccine.route}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {vaccine.lotNumber && (
                              <div className="font-mono text-xs text-gray-600 dark:text-gray-400">{vaccine.lotNumber}</div>
                            )}
                            {vaccine.manufacturer && (
                              <div className="text-[10px] text-gray-400 dark:text-gray-500">{vaccine.manufacturer}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-primary">medical_services</span>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">MedCore Clinic</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {vaccine.recorded_by ? (
                                <>
                                  <div className="bg-primary/10 text-primary rounded-full size-6 flex items-center justify-center text-[10px] font-bold">
                                    {userNames[vaccine.recorded_by]
                                      ? userNames[vaccine.recorded_by].split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                      : 'U'}
                                  </div>
                                  <span className="text-xs font-medium">
                                    {userNames[vaccine.recorded_by] || 'Loading...'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full size-6 flex items-center justify-center text-[10px] font-bold text-gray-400">?</div>
                                  <span className="text-xs font-medium text-gray-400">Not recorded</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleRemoveVaccine(vaccine.id)}
                              disabled={isDeleting === vaccine.id}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete vaccine"
                            >
                              {isDeleting === vaccine.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                              ) : (
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Showing 3 of 24 records</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-50">Previous</button>
                  <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
