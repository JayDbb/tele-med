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
  createdAt: string
  updatedAt: string
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
      const sectionKey = `patient-${patientId}-${section}`
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
      const sectionKey = `patient-${patientId}-${section}`
      const data = localStorage.getItem(sectionKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading patient section:', error)
      return null
    }
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

  // Get all patients (for listing)
  static getAllPatients(): PatientData[] {
    try {
      const patients: PatientData[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('patient-') && !key.includes('-audit-') && !key.includes('-vitals') && !key.includes('-allergies')) {
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