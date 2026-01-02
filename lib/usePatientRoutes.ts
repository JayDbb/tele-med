"use client";

/**
 * Custom hook to generate patient-related routes.
 * All patient routes are centralized under /patients.
 *
 * @returns Object with functions to generate patient URLs
 */
export function usePatientRoutes() {
  const baseUrl = "/patients";

  return {
    /**
     * Get the URL for a patient detail page
     */
    getPatientUrl: (patientId: string) => `${baseUrl}/${patientId}`,

    /**
     * Get the URL for creating a new visit for a patient
     */
    getNewVisitUrl: (patientId: string) => `${baseUrl}/${patientId}/new-visit`,

    /**
     * Get the base URL for patient routes
     */
    getBaseUrl: () => baseUrl,
  };
}
