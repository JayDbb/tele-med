"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPatient } from "../../../lib/api";
import type { Patient, Visit } from "../../../lib/types";
import { useAuthGuard } from "../../../lib/useAuthGuard";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { Header } from "../../../components/Header";

export default function PatientDetailPage() {
  const { ready } = useAuthGuard();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        const data = await getPatient(params.id);
        setPatient(data.patient);
        setVisits(data.visits);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, ready]);

  const getUserDisplayName = () => {
    if (!user) return 'Loading...';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-[#f6f7f8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#137fec] border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading patient...
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-[#f6f7f8] min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error ?? "Patient not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F6FD] min-h-screen">
      <Header />
      {/* Main Content */}
      <main className="p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full lg:w-auto">
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-blue-100 text-[#5BB5E8] text-xs font-semibold px-2 py-0.5 rounded-md">Phase 1</span>
              <h2 className="text-sm text-[#718096] font-medium">Intellibus</h2>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D3748] mt-4">Ready to help your patients today?</h1>
            <p className="text-sm text-[#718096] mt-1">Managing patient record for {patient.full_name} - track health progress and visit history</p>
          </div>
          <div className="flex justify-end w-full lg:w-auto">
            <div className="relative w-full sm:w-auto max-w-sm">
              <Link href="/dashboard" className="pl-10 pr-4 py-2 rounded-xl border-none bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#5BB5E8] w-full block text-center hover:bg-gray-50 transition">
                Back to Dashboard
              </Link>
              <span className="absolute left-3 top-2 text-gray-400 text-lg">←</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-6 md:space-y-8">

            {/* Patient Info Card */}
            <div className="bg-[#5BB5E8] rounded-2xl p-6 md:p-8 relative overflow-hidden text-white shadow-lg shadow-blue-200 min-h-[240px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>
              <div className="relative z-10 w-full md:w-2/3">
                <p className="text-blue-100 mb-1">Patient Profile</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{patient.full_name}</h2>
                <div className="flex flex-wrap gap-4 text-blue-50 text-sm mb-6 opacity-90">
                  {patient.sex_at_birth && <span>👤 {patient.sex_at_birth === 'M' ? 'Male' : 'Female'}</span>}
                  {patient.phone && <span>📞 {patient.phone}</span>}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/patients/${patient.id}/visit`} className="bg-white text-[#5BB5E8] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow-sm">
                    Start New Visit
                  </Link>
                </div>
              </div>
            </div>

            {/* Visit History Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="bg-blue-100 text-[#5BB5E8] text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">Visit History</span>
                  <h3 className="text-lg font-bold text-[#2D3748]">All Visits</h3>
                </div>
              </div>
              {visits.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-bold text-[#2D3748] mb-2">No visits yet</h3>
                  <p className="text-[#718096] mb-6">Start a visit to begin recording patient consultations and managing their health progress.</p>
                  <Link href={`/patients/${patient.id}/visit`} className="bg-[#5BB5E8] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition">
                    <span className="mr-2">🎤</span> Start First Visit
                  </Link>
                </div>
              )}
              {visits.length > 0 && (
                <div className="space-y-4">
                  {visits.map((visit, idx) => {
                    const visitDate = visit.created_at ? new Date(visit.created_at) : null;
                    const transcriptSummary = visit.transcripts?.segments?.summary;
                    const noteData = Array.isArray(visit.notes) 
                      ? visit.notes[0]?.note 
                      : visit.notes?.note;
                    const summary = transcriptSummary || noteData?.summary || noteData?.text?.substring(0, 100) || "No notes yet";
                    
                    return (
                      <Link
                        key={visit.id}
                        href={`/visits/${visit.id}`}
                        className="border border-gray-100 p-4 rounded-xl hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#2D3748]">
                              {visitDate?.toLocaleDateString()} {visitDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h4>
                            <p className="text-sm text-[#718096]">{summary}...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="hidden sm:block text-right mr-4">
                            <p className="text-xs text-[#718096]">Status</p>
                            <p className={`text-sm font-medium ${
                              visit.status === "finalized" ? "text-green-600" : 
                              visit.status === "pending_review" ? "text-yellow-600" : 
                              "text-blue-600"
                            }`}>{visit.status}</p>
                          </div>
                          <span className="bg-blue-50 text-[#5BB5E8] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition w-full sm:w-auto text-center">
                            View Details
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#2D3748] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href={`/patients/${patient.id}/visit`} className="w-full bg-[#5BB5E8] hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center transition">
                  <span className="text-sm mr-2">🎤</span> Start New Visit
                </Link>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center transition">
                  <span className="text-sm mr-2">📝</span> View All Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

