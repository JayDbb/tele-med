"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function NewPatientPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState<"M" | "F" | "">("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Simple redirect for now - in real app would create patient
      router.push(`/doctor/patients`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full lg:w-auto">
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-blue-100 text-[#5BB5E8] text-xs font-semibold px-2 py-0.5 rounded-md">Phase 1</span>
              <h2 className="text-sm text-[#718096] font-medium">Intellibus Tele-Medicine</h2>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D3748] mt-4">Ready to help your patients today?</h1>
            <p className="text-sm text-[#718096] mt-1">Enter patient details below to create a new record and start managing their health progress</p>
          </div>
          <div className="flex justify-end w-full lg:w-auto">
            <div className="relative w-full sm:w-auto max-w-sm">
              <Link href="/doctor/dashboard" className="pl-10 pr-4 py-2 rounded-xl border-none bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#5BB5E8] w-full block text-center hover:bg-gray-50 transition">
                Back to Dashboard
              </Link>
              <span className="absolute left-3 top-2 text-gray-400 text-lg">←</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            {/* Welcome Card */}
            <div className="bg-[#5BB5E8] rounded-2xl p-6 md:p-8 relative overflow-hidden text-white shadow-lg shadow-blue-200 min-h-[180px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>
              <div className="relative z-10 w-full">
                <p className="text-blue-100 mb-1">New Patient Registration</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">Add a new patient to your practice</h2>
                <p className="text-blue-50 text-sm opacity-90">Fill out the essential information to get started with patient care.</p>
              </div>
            </div>

            {/* Form Card */}
            <form className="bg-white rounded-2xl shadow-sm p-6 fade-in" onSubmit={onSubmit}>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-full bg-[#5BB5E8]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#5BB5E8] text-xl">👤</span>
                </div>
                <h2 className="text-lg font-bold text-[#2D3748]">Demographics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-[#718096] mb-2" htmlFor="fullname">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-[#2D3748] placeholder:text-gray-400 focus:ring-2 focus:ring-[#5BB5E8] focus:border-[#5BB5E8] transition-all" 
                    id="fullname" 
                    name="fullname" 
                    placeholder="e.g. Johnathan Doe" 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-[#718096] mb-2">
                    Biological Sex <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <div className="relative flex items-center w-full">
                      <input 
                        className="peer hidden" 
                        id="sex_male" 
                        name="sex" 
                        type="radio" 
                        value="M"
                        checked={sex === "M"}
                        onChange={(e) => setSex("M")}
                      />
                      <label className="flex flex-1 items-center justify-center h-11 px-4 cursor-pointer rounded-xl border border-gray-200 bg-white text-gray-500 font-medium hover:bg-gray-50 peer-checked:bg-[#5BB5E8] peer-checked:text-white peer-checked:border-[#5BB5E8] transition-all" htmlFor="sex_male">
                        Male
                      </label>
                    </div>
                    <div className="relative flex items-center w-full">
                      <input 
                        className="peer hidden" 
                        id="sex_female" 
                        name="sex" 
                        type="radio" 
                        value="F"
                        checked={sex === "F"}
                        onChange={(e) => setSex("F")}
                      />
                      <label className="flex flex-1 items-center justify-center h-11 px-4 cursor-pointer rounded-xl border border-gray-200 bg-white text-gray-500 font-medium hover:bg-gray-50 peer-checked:bg-[#5BB5E8] peer-checked:text-white peer-checked:border-[#5BB5E8] transition-all" htmlFor="sex_female">
                        Female
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-full bg-[#5BB5E8]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#5BB5E8] text-xl">📞</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#2D3748]">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-[#718096] mb-2" htmlFor="phone">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-[#2D3748] placeholder:text-gray-400 focus:ring-2 focus:ring-[#5BB5E8] focus:border-[#5BB5E8] transition-all" 
                      id="phone" 
                      name="phone" 
                      placeholder="(555) 000-0000" 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6">
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    <div className="flex items-center">
                      <span className="mr-2">⚠️</span>
                      {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer / Actions */}
              <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button 
                  className="w-full sm:w-auto px-6 h-11 rounded-xl border border-gray-200 text-gray-700 font-medium bg-white hover:bg-gray-50 transition-colors" 
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="w-full sm:w-auto px-6 h-11 rounded-xl bg-[#5BB5E8] text-white font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2" 
                  type="submit"
                  disabled={loading}
                >
                  <span className="text-[20px]">✓</span>
                  {loading ? "Creating..." : "Create Patient"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#2D3748] mb-4">Patient Registration Tips</h3>
              <div className="space-y-3 text-sm text-[#718096]">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Ensure full legal name matches ID documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Verify contact information for appointment reminders</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>All fields marked with * are required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
