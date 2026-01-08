"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { createPatient, createAllergy, checkDuplicatePatient } from "../../../lib/api";
import type { Patient } from "../../../lib/types";

export default function NewPatientPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVisitPrompt, setShowVisitPrompt] = useState(false);
    const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
    const [duplicatePatients, setDuplicatePatients] = useState<Patient[]>([]);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);

    // Allergy form state
    const [showAllergyForm, setShowAllergyForm] = useState(false);
    const [allergies, setAllergies] = useState<Array<{
        name: string;
        severity: string;
        type: string;
        reactions: string[];
        date: string;
        notes: string;
    }>>([]);
    const [newAllergy, setNewAllergy] = useState({
        name: '',
        severity: '',
        reactions: [] as string[],
        date: '',
        notes: '',
        type: ''
    });

    const handleReactionChange = (reaction: string, checked: boolean) => {
        if (checked) {
            setNewAllergy({ ...newAllergy, reactions: [...newAllergy.reactions, reaction] });
        } else {
            setNewAllergy({ ...newAllergy, reactions: newAllergy.reactions.filter(r => r !== reaction) });
        }
    };

    const handleQuickAdd = (name: string) => {
        setNewAllergy({ ...newAllergy, name });
        setShowAllergyForm(true);
    };

    const handleAddAllergy = () => {
        if (!newAllergy.name || !newAllergy.severity) {
            setError('Please fill in the allergen name and select a severity level');
            return;
        }
        setAllergies([...allergies, { ...newAllergy }]);
        setNewAllergy({ name: '', severity: '', reactions: [], date: '', notes: '', type: '' });
        setShowAllergyForm(false);
        setError(null);
    };

    const handleRemoveAllergy = (index: number) => {
        setAllergies(allergies.filter((_, i) => i !== index));
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setDuplicatePatients([]);

        try {
            // Check for duplicate patients first
            if (email || phone) {
                setCheckingDuplicate(true);
                try {
                    const duplicateCheck = await checkDuplicatePatient(
                        email || null,
                        phone || null
                    );

                    if (duplicateCheck.isDuplicate && duplicateCheck.patients.length > 0) {
                        setDuplicatePatients(duplicateCheck.patients);
                        setError(`A patient with this ${email && phone ? 'email or phone number' : email ? 'email' : 'phone number'} already exists.`);
                        setLoading(false);
                        setCheckingDuplicate(false);
                        return;
                    }
                } catch (checkError: any) {
                    console.error('Error checking for duplicates:', checkError);
                    // Continue with creation if check fails (don't block user)
                } finally {
                    setCheckingDuplicate(false);
                }
            }

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
                allergies: null, // We'll create allergies separately
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

            // Create allergies if any were added
            if (allergies.length > 0) {
                try {
                    for (const allergy of allergies) {
                        await createAllergy(patient.id, {
                            name: allergy.name,
                            severity: allergy.severity,
                            type: allergy.type || 'Unknown',
                            reactions: allergy.reactions,
                            date: allergy.date || undefined,
                            notes: allergy.notes || undefined,
                            status: 'Active'
                        });
                    }
                } catch (allergyErr: any) {
                    console.error('Error creating allergies:', allergyErr);
                    // Don't fail the whole operation if allergies fail, just log it
                }
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
        <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
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
                                        {/* Allergies Section */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Known Allergies</label>
                                                {!showAllergyForm && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAllergyForm(true)}
                                                        className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add</span>
                                                        Add Allergy
                                                    </button>
                                                )}
                                            </div>

                                            {/* Display added allergies */}
                                            {allergies.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {allergies.map((allergy, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                                        >
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{allergy.name}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded ${allergy.severity === 'Severe' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                                allergy.severity === 'Moderate' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                                                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                }`}>
                                                                {allergy.severity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveAllergy(index)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Allergy Form */}
                                            {showAllergyForm && (
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mt-2">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-primary text-lg">add_alert</span>
                                                            Add New Allergy
                                                        </h3>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowAllergyForm(false);
                                                                setNewAllergy({ name: '', severity: '', reactions: [], date: '', notes: '', type: '' });
                                                            }}
                                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-sm">close</span>
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col gap-4">
                                                        {/* Allergen Name */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-sm text-primary">science</span>
                                                                Allergen Name <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 material-symbols-outlined text-sm">search</span>
                                                                <input
                                                                    className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                                                    placeholder="Enter allergen name (e.g., Peanuts, Penicillin, Latex)..."
                                                                    type="text"
                                                                    value={newAllergy.name}
                                                                    onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">Quick add:</span>
                                                                {['Peanuts', 'Penicillin', 'Latex', 'Shellfish', 'Eggs', 'Codeine', 'Aspirin', 'Iodine'].map((item) => (
                                                                    <button
                                                                        key={item}
                                                                        type="button"
                                                                        onClick={() => handleQuickAdd(item)}
                                                                        className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary px-2 py-1 rounded-full text-gray-700 dark:text-gray-300 transition-all font-medium"
                                                                    >
                                                                        {item}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Allergy Type */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-sm text-primary">category</span>
                                                                Allergy Type
                                                            </label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                {[
                                                                    { value: 'Food', icon: 'nutrition', colorClass: 'text-orange-500' },
                                                                    { value: 'Medication', icon: 'medication', colorClass: 'text-blue-500' },
                                                                    { value: 'Environmental', icon: 'grass', colorClass: 'text-green-500' },
                                                                    { value: 'Other', icon: 'help', colorClass: 'text-gray-500' }
                                                                ].map((type) => (
                                                                    <label key={type.value} className="cursor-pointer group">
                                                                        <input
                                                                            className="peer sr-only"
                                                                            name="type"
                                                                            type="radio"
                                                                            value={type.value}
                                                                            checked={newAllergy.type === type.value}
                                                                            onChange={(e) => setNewAllergy({ ...newAllergy, type: e.target.value })}
                                                                        />
                                                                        <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 p-2 text-center hover:border-primary/50 dark:hover:border-primary/50 transition-all peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                                                                            <span className={`material-symbols-outlined text-lg mb-1 block ${type.colorClass}`}>{type.icon}</span>
                                                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 peer-checked:text-primary">{type.value}</div>
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Severity */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-sm text-primary">warning</span>
                                                                Severity <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {[
                                                                    { value: 'Mild', icon: 'check_circle', desc: 'Minor reaction' },
                                                                    { value: 'Moderate', icon: 'info', desc: 'Moderate reaction' },
                                                                    { value: 'Severe', icon: 'error', desc: 'Severe reaction' }
                                                                ].map((severity) => (
                                                                    <label key={severity.value} className="cursor-pointer">
                                                                        <input
                                                                            className="peer sr-only"
                                                                            name="severity"
                                                                            type="radio"
                                                                            value={severity.value}
                                                                            checked={newAllergy.severity === severity.value}
                                                                            onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                                                                            required
                                                                        />
                                                                        <div className={`rounded-lg border-2 p-3 text-center transition-all hover:scale-105 ${severity.value === 'Mild'
                                                                            ? 'border-gray-200 dark:border-gray-700 peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20'
                                                                            : severity.value === 'Moderate'
                                                                                ? 'border-gray-200 dark:border-gray-700 peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900/20'
                                                                                : 'border-gray-200 dark:border-gray-700 peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20'
                                                                            }`}>
                                                                            <span className={`material-symbols-outlined text-xl mb-1 block ${severity.value === 'Mild' ? 'text-green-600 dark:text-green-400' :
                                                                                severity.value === 'Moderate' ? 'text-amber-600 dark:text-amber-400' :
                                                                                    'text-red-600 dark:text-red-400'
                                                                                }`}>{severity.icon}</span>
                                                                            <div className={`text-xs font-bold ${severity.value === 'Mild' ? 'text-green-700 dark:text-green-300' :
                                                                                severity.value === 'Moderate' ? 'text-amber-700 dark:text-amber-300' :
                                                                                    'text-red-700 dark:text-red-300'
                                                                                }`}>{severity.value}</div>
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Reactions */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-sm text-primary">sick</span>
                                                                Reactions
                                                            </label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                {[
                                                                    'Skin Rash / Hives',
                                                                    'Swelling',
                                                                    'Trouble Breathing',
                                                                    'Nausea / Vomiting',
                                                                    'Anaphylaxis',
                                                                    'Itching',
                                                                    'Dizziness',
                                                                    'Other'
                                                                ].map((reaction) => (
                                                                    <label key={reaction} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary/50 transition-all">
                                                                        <input
                                                                            className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary w-3 h-3"
                                                                            type="checkbox"
                                                                            checked={newAllergy.reactions.includes(reaction)}
                                                                            onChange={(e) => handleReactionChange(reaction, e.target.checked)}
                                                                        />
                                                                        <span className="text-xs text-gray-700 dark:text-gray-300">{reaction}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Date and Notes */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                                                                    When did this happen?
                                                                </label>
                                                                <input
                                                                    className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white px-3 py-2"
                                                                    type="date"
                                                                    value={newAllergy.date}
                                                                    onChange={(e) => setNewAllergy({ ...newAllergy, date: e.target.value })}
                                                                    max={new Date().toISOString().split('T')[0]}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm text-primary">note</span>
                                                                    Additional Notes
                                                                </label>
                                                                <textarea
                                                                    className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none text-gray-900 dark:text-white px-3 py-2"
                                                                    placeholder="e.g. First occurred in childhood, requires epinephrine..."
                                                                    rows={2}
                                                                    value={newAllergy.notes}
                                                                    onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                                                                ></textarea>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2 pt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowAllergyForm(false);
                                                                    setNewAllergy({ name: '', severity: '', reactions: [], date: '', notes: '', type: '' });
                                                                    setError(null);
                                                                }}
                                                                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleAddAllergy}
                                                                disabled={!newAllergy.name || !newAllergy.severity}
                                                                className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">save</span>
                                                                Add Allergy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Error Display */}
                                        {error && (
                                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                                <div className="flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-sm mt-0.5">error</span>
                                                    <div className="flex-1">
                                                        <p className="font-semibold mb-1">{error}</p>
                                                        {duplicatePatients.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-2">
                                                                    Existing patient{duplicatePatients.length > 1 ? 's' : ''} found:
                                                                </p>
                                                                {duplicatePatients.map((patient) => (
                                                                    <div
                                                                        key={patient.id}
                                                                        className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg p-3 space-y-1"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="material-symbols-outlined text-sm text-red-600 dark:text-red-400">person</span>
                                                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                                                    {patient.full_name || 'Unknown Patient'}
                                                                                </span>
                                                                            </div>
                                                                            <a
                                                                                href={`/patients/${patient.id}`}
                                                                                className="text-xs text-primary hover:underline font-medium"
                                                                            >
                                                                                View Patient →
                                                                            </a>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
                                                                            {patient.email && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="material-symbols-outlined text-xs">email</span>
                                                                                    <span>{patient.email}</span>
                                                                                </div>
                                                                            )}
                                                                            {patient.phone && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="material-symbols-outlined text-xs">phone</span>
                                                                                    <span>{patient.phone}</span>
                                                                                </div>
                                                                            )}
                                                                            {patient.dob && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                                                                                    <span>{new Date(patient.dob).toLocaleDateString()}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="material-symbols-outlined text-xs">schedule</span>
                                                                                <span>Created {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'Unknown'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
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
                                                disabled={loading || checkingDuplicate}
                                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {checkingDuplicate ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Checking for duplicates...</span>
                                                    </>
                                                ) : loading ? (
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
