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
  private static patientCache = new Map<string, PatientData>()
  private static sectionCache = new Map<string, any>()
  private static auditCache = new Map<string, AuditLog[]>()

  private static getCurrentUserKey(): string {
    return 'current-user'
  }

  static setCurrentUser(user: { id: string; name: string; email?: string; role?: string } | null): void {
    try {
      if (!user) {
        localStorage.removeItem(this.getCurrentUserKey())
        return
      }
      localStorage.setItem(this.getCurrentUserKey(), JSON.stringify(user))
    } catch (error) {
      console.error('Error saving current user:', error)
    }
  }

  static getCurrentUser(): { id: string; name: string; email?: string; role?: string } | null {
    try {
      const data = localStorage.getItem(this.getCurrentUserKey())
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading current user:', error)
      return null
    }
  }

  private static resolveUser(
    userId?: string,
    userName?: string
  ): { id: string; name: string } {
    const currentUser = this.getCurrentUser()
    if (userId && userName) {
      return { id: userId, name: userName }
    }
    if (userId && currentUser?.id === userId) {
      return { id: currentUser.id, name: currentUser.name }
    }
    if (currentUser) {
      return { id: currentUser.id, name: currentUser.name }
    }
    return { id: userId || 'current-user', name: userName || 'Staff' }
  }
  private static getPatientKey(patientId: string): string {
    return `patient-${patientId}`
  }

  private static getAuditKey(patientId: string): string {
    return `patient-audit-${patientId}`
  }

  private static getSectionKey(patientId: string, section: string): string {
    return `patient-section-${patientId}-${section}`
  }

  private static getDraftKey(patientId: string, section: string): string {
    return `patient-draft-${patientId}-${section}`
  }

  private static getOutboxKey(): string {
    return 'patient-sync-outbox'
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
      this.patientCache.set(patientData.id, patientData)

      // Log the action
      const resolvedUser = this.resolveUser(userId)
      this.logAction(patientData.id, action, 'patient-profile', resolvedUser.id, resolvedUser.name, {
        patientName: patientData.name,
        changes: action === 'create' ? 'Patient profile created' : 'Patient profile updated'
      })

      this.queueSync({
        type: 'patient',
        action,
        patientId: patientData.id,
        payload: patientData
      }, resolvedUser)

    } catch (error) {
      console.error('Error saving patient data:', error)
    }
  }

  // Get patient data from isolated container
  static getPatient(patientId: string): PatientData | null {
    try {
      // Don't seed patients anymore
      if (this.patientCache.has(patientId)) {
        return this.patientCache.get(patientId) || null
      }
      const patientKey = this.getPatientKey(patientId)
      const data = localStorage.getItem(patientKey)
      const parsed = data ? JSON.parse(data) : null
      if (parsed) {
        this.patientCache.set(patientId, parsed)
      }
      return parsed
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
      const previousDataRaw = localStorage.getItem(sectionKey)
      const previousData = previousDataRaw ? JSON.parse(previousDataRaw) : null
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      }
      localStorage.setItem(sectionKey, JSON.stringify(payload))
      this.sectionCache.set(sectionKey, payload)

      // Log the section update
      const resolvedUser = this.resolveUser(userId)
      this.logAction(patientId, 'update', section, resolvedUser.id, resolvedUser.name, {
        section,
        changes: {
          before: previousData,
          after: data
        }
      })

      this.queueSync({
        type: 'section',
        action: 'update',
        patientId,
        section,
        payload
      }, resolvedUser)

    } catch (error) {
      console.error('Error updating patient section:', error)
    }
  }

  // Get specific patient section data
  static getPatientSection(patientId: string, section: string): any {
    try {
      const sectionKey = this.getSectionKey(patientId, section)
      if (this.sectionCache.has(sectionKey)) {
        return this.sectionCache.get(sectionKey)
      }
      const data = localStorage.getItem(sectionKey)
      const parsed = data ? JSON.parse(data) : null
      if (parsed) {
        this.sectionCache.set(sectionKey, parsed)
      }
      return parsed
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
      this.auditCache.set(patientId, logs)
    } catch (error) {
      console.error('Error logging action:', error)
    }
  }

  static logActionAuto(
    patientId: string,
    action: string,
    section: string,
    details?: any
  ): void {
    const resolvedUser = this.resolveUser()
    this.logAction(patientId, action, section, resolvedUser.id, resolvedUser.name, details)
  }

  // Get audit logs for a patient
  static getAuditLogs(patientId: string): AuditLog[] {
    try {
      if (this.auditCache.has(patientId)) {
        return this.auditCache.get(patientId) || []
      }
      const auditKey = this.getAuditKey(patientId)
      const data = localStorage.getItem(auditKey)
      const parsed = data ? JSON.parse(data) : []
      this.auditCache.set(patientId, parsed)
      return parsed
    } catch (error) {
      console.error('Error loading audit logs:', error)
      return []
    }
  }

  static saveDraft(patientId: string, section: string, data: any): void {
    try {
      const draftKey = this.getDraftKey(patientId, section)
      localStorage.setItem(draftKey, JSON.stringify({
        data,
        updatedAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  static getDraft(patientId: string, section: string): any {
    try {
      const draftKey = this.getDraftKey(patientId, section)
      const data = localStorage.getItem(draftKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading draft:', error)
      return null
    }
  }

  static clearDraft(patientId: string, section: string): void {
    try {
      const draftKey = this.getDraftKey(patientId, section)
      localStorage.removeItem(draftKey)
    } catch (error) {
      console.error('Error clearing draft:', error)
    }
  }

  private static queueSync(
    entry: {
      type: 'patient' | 'section'
      action: string
      patientId: string
      section?: string
      payload: any
    },
    user: { id: string; name: string }
  ): void {
    try {
      const outboxKey = this.getOutboxKey()
      const existing = localStorage.getItem(outboxKey)
      const items = existing ? JSON.parse(existing) : []
      items.push({
        id: Date.now().toString(),
        ...entry,
        userId: user.id,
        userName: user.name,
        createdAt: new Date().toISOString(),
        attempts: 0,
        status: 'pending'
      })
      localStorage.setItem(outboxKey, JSON.stringify(items))
    } catch (error) {
      console.error('Error queueing sync item:', error)
    }
  }

  static flushPendingSync(): void {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      const outboxKey = this.getOutboxKey()
      const existing = localStorage.getItem(outboxKey)
      const items = existing ? JSON.parse(existing) : []
      if (items.length === 0) return
      const updated = items.map((item: any) => ({
        ...item,
        attempts: (item.attempts || 0) + 1,
        lastAttempt: new Date().toISOString()
      }))
      localStorage.setItem(outboxKey, JSON.stringify(updated))
    } catch (error) {
      console.error('Error flushing sync queue:', error)
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
      this.patientCache.clear()
      this.sectionCache.clear()
      this.auditCache.clear()
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
