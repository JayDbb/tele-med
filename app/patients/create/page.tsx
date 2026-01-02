"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { createPatient } from "../../../lib/api";

export default function NewPatientPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [allergies, setAllergies] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVisitPrompt, setShowVisitPrompt] = useState(false);
    const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Convert gender to sex_at_birth format (M/F/null)
            let sex_at_birth: "M" | "F" | null = null;
            if (gender === "Male") sex_at_birth = "M";
            else if (gender === "Female") sex_at_birth = "F";

            const response = await createPatient({
                full_name: fullName,
                dob: dob || null,
                sex_at_birth: sex_at_birth,
                phone: phone || null,
                email: email || null,
                allergies: allergies || null,
            });

            // Handle API response - it returns { success: true, patient: {...} }
            if (response.success === false) {
                setError(response.error || "Failed to create patient. Please try again.");
                return;
            }

            const patient = response.patient || response;
            if (!patient || !patient.id) {
                setError("Invalid response from server. Please try again.");
                return;
            }

            // Show prompt to start a new visit
            setCreatedPatientId(patient.id);
            setShowVisitPrompt(true);
        } catch (err: any) {
            setError(err?.message || "Failed to create patient. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartVisit = () => {
        if (createdPatientId) {
            router.push(`/patients/${createdPatientId}/new-visit`);
        }
    };

    const handleSkipVisit = () => {
        if (createdPatientId) {
            router.push(`/patients/${createdPatientId}`);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
                    <GlobalSearchBar />
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-baseline gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Patient Registration</h1>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Enter patient details below to create a new record</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/patients" className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    Cancel
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8">
                                <form onSubmit={onSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Patient Demographics</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Enter patient's full name"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                                                <input
                                                    type="date"
                                                    value={dob}
                                                    onChange={(e) => setDob(e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">MRN</label>
                                                <input
                                                    type="text"
                                                    value="Auto-generated"
                                                    readOnly
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                                <select
                                                    value={gender}
                                                    onChange={(e) => setGender(e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                                    placeholder="(555) 123-4567"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="patient@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Known Allergies</label>
                                            <input
                                                type="text"
                                                value={allergies}
                                                onChange={(e) => setAllergies(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="e.g., Penicillin, Shellfish (or 'None')"
                                            />
                                        </div>

                                        {/* Error Display */}
                                        {error && (
                                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                                <div className="flex items-center">
                                                    <span className="material-symbols-outlined text-sm mr-2">error</span>
                                                    {error}
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="flex justify-end gap-3 mt-6">
                                            <Link
                                                href="/patients"
                                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Creating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-sm">check</span>
                                                        <span>Create Patient</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Right Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Patient Registration Tips</h3>
                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 material-symbols-outlined text-sm">check_circle</span>
                                            <span>Ensure full legal name matches ID documents</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 material-symbols-outlined text-sm">check_circle</span>
                                            <span>Verify contact information for appointment reminders</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 material-symbols-outlined text-sm">check_circle</span>
                                            <span>All fields marked with * are required</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Start New Visit Prompt Modal */}
            {showVisitPrompt && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Patient Created Successfully!</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Would you like to start a new visit?</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Starting a visit now will allow you to record the consultation, document symptoms, and create clinical notes.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSkipVisit}
                                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                Not Now
                            </button>
                            <button
                                onClick={handleStartVisit}
                                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Start New Visit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
