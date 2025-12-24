'use client'

import { useState, useEffect } from 'react'

interface Patient {
  id: string
  name: string
  email: string
  dob: string
  phone: string
}

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (appointmentData: any) => void
  selectedTimeSlot?: {date: Date, hour: number} | null
}

export default function NewAppointmentModal({ isOpen, onClose, onSubmit, selectedTimeSlot }: NewAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    type: 'consultation',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  })
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    dob: '',
    phone: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchPatients()
      // Pre-fill date and time if time slot was selected
      if (selectedTimeSlot) {
        const date = selectedTimeSlot.date.toISOString().split('T')[0]
        const startTime = `${selectedTimeSlot.hour.toString().padStart(2, '0')}:00`
        const endTime = `${(selectedTimeSlot.hour + 1).toString().padStart(2, '0')}:00`
        setFormData(prev => ({
          ...prev,
          date,
          startTime,
          endTime
        }))
      }
    }
  }, [isOpen, selectedTimeSlot])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()
      setPatients(data.patients)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      })
      const data = await response.json()
      
      if (data.success) {
        setPatients([...patients, data.patient])
        setSearchQuery(data.patient.name)
        setFormData({ ...formData, patientId: data.patient.id, patientName: data.patient.name })
        setNewPatient({ name: '', email: '', dob: '', phone: '' })
        setShowAddPatient(false)
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error adding patient:', error)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.length > 0) {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(value.toLowerCase()) ||
        patient.id.toLowerCase().includes(value.toLowerCase()) ||
        patient.email.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredPatients(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setFormData({ ...formData, patientId: '', patientName: '' })
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSearchQuery(patient.name)
    setFormData({ ...formData, patientId: patient.id, patientName: patient.name })
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const startDateTime = `${formData.date}T${formData.startTime}:00`
    const endDateTime = `${formData.date}T${formData.endTime}:00`
    
    onSubmit({
      ...formData,
      startDateTime,
      endDateTime
    })
    
    // Reset form
    setFormData({
      patientId: '',
      patientName: '',
      type: 'consultation',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      notes: ''
    })
    setSearchQuery('')
    setShowSuggestions(false)
    setShowAddPatient(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Appointment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {!showAddPatient ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Patient
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddPatient(true)}
                  className="text-xs text-primary hover:text-blue-600 font-medium"
                >
                  + Add New Patient
                </button>
              </div>
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Search by name, ID, or email..."
              />
              
              {showSuggestions && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {patient.id} • {patient.email}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {showSuggestions && searchQuery && filteredPatients.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">No patients found</div>
                  <button
                    type="button"
                    onClick={() => setShowAddPatient(true)}
                    className="text-primary hover:text-blue-600 text-sm font-medium mt-1"
                  >
                    + Add "{searchQuery}" as new patient
                  </button>
                </div>
              )}
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Appointment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="surgery">Surgery</option>
              <option value="chemotherapy">Chemotherapy</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Room number or location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Additional notes..."
            />
          </div>

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
              Create Appointment
            </button>
          </div>
        </form>
        ) : (
          <form onSubmit={handleAddPatient} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Patient</h3>
              <button
                type="button"
                onClick={() => setShowAddPatient(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter patient full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="patient@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={newPatient.dob}
                onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddPatient(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Patient
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}