import { Patient, TimelineEvent, PatientCondition, Update, User } from '../types';
import { mockPatients, mockTimeline, mockPatientConditions, mockUpdates, mockUser } from '../data/mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // For now, return mock data. Replace with actual API calls when backend is ready
    return this.getMockData(endpoint);
  }

  private getMockData(endpoint: string): any {
    switch (endpoint) {
      case '/patients':
        return mockPatients;
      case '/timeline':
        return mockTimeline;
      case '/patient-conditions':
        return mockPatientConditions;
      case '/updates':
        return mockUpdates;
      case '/user':
        return mockUser;
      default:
        return null;
    }
  }

  async getPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients');
  }

  async getTimeline(): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>('/timeline');
  }

  async getPatientConditions(): Promise<PatientCondition[]> {
    return this.request<PatientCondition[]>('/patient-conditions');
  }

  async getUpdates(): Promise<Update[]> {
    return this.request<Update[]>('/updates');
  }

  async getUser(): Promise<User> {
    return this.request<User>('/user');
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const patients = await this.getPatients();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.diagnosis?.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const apiService = new ApiService();