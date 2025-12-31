// Patient Data Manager - Handles isolated patient data and audit logging
export interface PatientData {
  id: string
  name: string
  email: string
  dob: string
  phone: string
  mrn: string
  gender: string
  allergies: string
  image: string
  physician: string
  lastConsultation: string
  appointment: string
  status: string
  statusColor: string
  doctorId: string
  nurseId?: string
  createdAt: string
  updatedAt: string
  address?: string
  image?: string
  [key: string]: any
}

export interface AuditLog {
  id: string
  patientId: string
  action: string
  section: string
  userId: string
  userName: string
  timestamp: string
  changes?: any
  notes?: string
}

export class PatientDataManager {
  private static getPatientKey(patientId: string): string {
    return `patient-${patientId}`
  }

  private static getAuditKey(patientId: string): string {
    return `patient-audit-${patientId}`
  }

  private static getSectionKey(patientId: string, section: string): string {
    return `patient-section-${patientId}-${section}`
  }

  // Save patient data with audit logging
  static savePatient(patientData: PatientData, action: string = 'create', userId: string = 'current-user'): void {
    try {
      // Save patient data in isolated container
      const patientKey = this.getPatientKey(patientData.id)
      patientData.updatedAt = new Date().toISOString()
      
      if (!patientData.createdAt) {
        patientData.createdAt = new Date().toISOString()
      }

      localStorage.setItem(patientKey, JSON.stringify(patientData))

      // Log the action
      this.logAction(patientData.id, action, 'patient-profile', userId, 'Dr. Alex Robin', {
        patientName: patientData.name,
        changes: action === 'create' ? 'Patient profile created' : 'Patient profile updated'
      })

    } catch (error) {
      console.error('Error saving patient data:', error)
    }
  }

  // Get patient data from isolated container
  static getPatient(patientId: string): PatientData | null {
    try {
      // Don't seed patients anymore
      const patientKey = this.getPatientKey(patientId)
      const data = localStorage.getItem(patientKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading patient data:', error)
      return null
    }
  }

  // Update specific patient section with audit logging
  static updatePatientSection(
    patientId: string, 
    section: string, 
    data: any, 
    userId: string = 'current-user'
  ): void {
    try {
      const patient = this.getPatient(patientId)
      if (!patient) return

      // Update the specific section
      const sectionKey = this.getSectionKey(patientId, section)
      localStorage.setItem(sectionKey, JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      }))

      // Log the section update
      this.logAction(patientId, 'update', section, userId, 'Dr. Alex Robin', {
        section,
        changes: data
      })

    } catch (error) {
      console.error('Error updating patient section:', error)
    }
  }

  // Get specific patient section data
  static getPatientSection(patientId: string, section: string): any {
    try {
      const sectionKey = this.getSectionKey(patientId, section)
      const data = localStorage.getItem(sectionKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading patient section:', error)
      return null
    }
  }

  static getPatientSectionList<T = any>(patientId: string, section: string): T[] {
    const data = this.getPatientSection(patientId, section)
    if (Array.isArray(data)) return data
    if (data?.items && Array.isArray(data.items)) return data.items
    return []
  }

  static savePatientSectionList<T = any>(
    patientId: string,
    section: string,
    items: T[],
    userId: string = 'current-user'
  ): void {
    this.updatePatientSection(patientId, section, { items }, userId)
  }

  // Log actions for audit trail
  static logAction(
    patientId: string,
    action: string,
    section: string,
    userId: string,
    userName: string,
    details?: any
  ): void {
    try {
      const auditKey = this.getAuditKey(patientId)
      const existingLogs = localStorage.getItem(auditKey)
      const logs: AuditLog[] = existingLogs ? JSON.parse(existingLogs) : []

      const newLog: AuditLog = {
        id: Date.now().toString(),
        patientId,
        action,
        section,
        userId,
        userName,
        timestamp: new Date().toISOString(),
        changes: details?.changes,
        notes: details?.notes
      }

      logs.unshift(newLog) // Add to beginning
      
      // Keep only last 100 logs per patient
      if (logs.length > 100) {
        logs.splice(100)
      }

      localStorage.setItem(auditKey, JSON.stringify(logs))
    } catch (error) {
      console.error('Error logging action:', error)
    }
  }

  // Get audit logs for a patient
  static getAuditLogs(patientId: string): AuditLog[] {
    try {
      const auditKey = this.getAuditKey(patientId)
      const data = localStorage.getItem(auditKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading audit logs:', error)
      return []
    }
  }

  // Clear all patient data from localStorage
  static clearAllPatients(): void {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('patient-') || key.startsWith('patient-section-') || key.startsWith('patient-audit-'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing patient data:', error)
    }
  }

  // Get all patients (for listing)
  static getAllPatients(): PatientData[] {
    try {
      const patients: PatientData[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          key.startsWith('patient-') &&
          !key.startsWith('patient-section-') &&
          !key.startsWith('patient-audit-')
        ) {
          const data = localStorage.getItem(key)
          if (data) {
            patients.push(JSON.parse(data))
          }
        }
      }
      
      return patients.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error('Error loading all patients:', error)
      return []
    }
  }
}
