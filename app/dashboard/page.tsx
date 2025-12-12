"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPatients } from "../../lib/api";
import type { Patient } from "../../lib/types";
import { useAuthGuard } from "../../lib/useAuthGuard";
import { supabaseBrowser } from "../../lib/supabaseBrowser";
import { Header } from "../../components/Header";

export default function DashboardPage() {
  const { ready } = useAuthGuard();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        const data = await getPatients();
        setPatients(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready]);

  const ownedPatients = patients.filter((p) => !p.is_shared);
  const filteredPatients = ownedPatients.filter(patient => 
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'Loading...';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

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
            <p className="text-sm text-[#718096] mt-1">Manage your patient records, schedule visits, and track health progress</p>
          </div>
          <div className="flex justify-end w-full lg:w-auto">
            <div className="relative w-full sm:w-auto max-w-sm">
              <input 
                className="pl-10 pr-4 py-2 rounded-xl border-none bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#5BB5E8] w-full" 
                placeholder="Search patients..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2 text-gray-400 text-lg">🔍</span>
            </div>
          </div>
        </header>

        {/* No Patients Message */}
        {!loading && patients.length === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-[#2D3748] mb-2">No patients yet</h3>
              <p className="text-[#718096] mb-4">Create your first patient to get started with your practice.</p>
              <Link href="/patients/new" className="bg-[#5BB5E8] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition">
                <span className="mr-2">➕</span> Add Your First Patient
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            {/* Welcome Card */}
            <div className="bg-[#5BB5E8] rounded-2xl p-6 md:p-8 relative overflow-hidden text-white shadow-lg shadow-blue-200 min-h-[240px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>
              <div className="relative z-10 w-full md:w-2/3">
                <p className="text-blue-100 mb-1">Welcome back</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">Ready to help your <br/>patients today?</h2>
                <p className="text-blue-50 text-sm mb-6 opacity-90">Manage your patient records, schedule visits, and track health progress all in one place.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/patients/new" className="bg-white text-[#5BB5E8] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow-sm">
                    Add New Patient
                  </Link>
                  <button className="bg-blue-400 bg-opacity-30 border border-blue-300 border-opacity-30 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-opacity-40 transition">
                    View All Patients
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[#718096] text-sm font-medium">My Patients</h3>
                    <p className="text-4xl font-bold text-[#2D3748] mt-2">{ownedPatients.length}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <span className="text-[#5BB5E8] text-xl">👥</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5BB5E8] h-full rounded-full" style={{width: ownedPatients.length > 0 ? '100%' : '0%'}}></div>
                </div>
              </div>
            </div>

            {/* Recent Patients */}
            {!loading && ownedPatients.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 fade-in">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="bg-blue-100 text-[#5BB5E8] text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">My Patients</span>
                    <h3 className="text-lg font-bold text-[#2D3748]">All Patients</h3>
                  </div>
                  <Link href="/patients/new" className="bg-[#5BB5E8] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition">
                    <span className="text-sm mr-1">➕</span> New Patient
                  </Link>
                </div>
                <div className="space-y-4">
                  {(searchTerm ? filteredPatients : ownedPatients).map((patient) => (
                    <div key={patient.id} className="border border-gray-100 p-4 rounded-xl hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <Link href={`/patients/${patient.id}`} className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {getInitials(patient.full_name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2D3748]">{patient.full_name}</h4>
                          <p className="text-sm text-[#718096]">{patient.phone || "No contact"}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="hidden sm:block text-right mr-4">
                          <p className="text-xs text-[#718096]">Last Visit</p>
                          <p className="text-sm font-medium text-[#2D3748]">Recent</p>
                        </div>
                        <Link href={`/patients/${patient.id}/visit`} className="bg-blue-50 text-[#5BB5E8] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition w-full sm:w-auto text-center">
                          Start Visit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                {searchTerm && filteredPatients.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-[#718096]">No patients found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#2D3748]">{formatDate(currentDate)}</h3>
                <div className="flex space-x-2 text-[#718096]">
                  <button 
                    onClick={() => navigateMonth('prev')}
                    className="hover:text-[#5BB5E8] p-1 rounded transition-colors"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => navigateMonth('next')}
                    className="hover:text-[#5BB5E8] p-1 rounded transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                  <div key={day} className="text-xs text-[#718096] font-medium py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* Empty cells for days before month starts */}
                {Array.from({length: getFirstDayOfMonth(currentDate)}, (_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {/* Days of the month */}
                {Array.from({length: getDaysInMonth(currentDate)}, (_, i) => {
                  const day = i + 1;
                  return (
                    <button 
                      key={day} 
                      className={`p-2 rounded-lg transition-colors ${
                        isToday(day)
                          ? 'bg-[#5BB5E8] text-white shadow-md shadow-blue-200' 
                          : 'hover:bg-gray-100 text-[#2D3748]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
            <div className="text-[#718096] text-center py-6">
              <div className="animate-spin w-8 h-8 border-4 border-[#5BB5E8] border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading patients...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

