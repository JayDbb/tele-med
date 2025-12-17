import React, { useState, useEffect } from 'react';
import { Patient, TimelineEvent, PatientCondition, Update, User } from '../types';
import { apiService } from '../services/api';
import PatientsPage from './PatientsPage';

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [conditions, setConditions] = useState<PatientCondition[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const loadData = async () => {
      const [patientsData, timelineData, conditionsData, updatesData, userData] = await Promise.all([
        apiService.getPatients(),
        apiService.getTimeline(),
        apiService.getPatientConditions(),
        apiService.getUpdates(),
        apiService.getUser()
      ]);
      
      setPatients(patientsData);
      setTimeline(timelineData);
      setConditions(conditionsData);
      setUpdates(updatesData);
      setUser(userData);
      setSelectedPatient(patientsData.find((p: Patient) => p.status === 'current') || patientsData[0]);
    };

    loadData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await apiService.searchPatients(query);
      setPatients(results);
    } else {
      const allPatients = await apiService.getPatients();
      setPatients(allPatients);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'done':
        return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50';
      case 'current':
        return 'text-primary bg-primary/20';
      case 'upcoming':
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const totalPatients = conditions.reduce((sum, condition) => sum + condition.count, 0);

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8" 
                 style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIvhsI2mvBKXaHlCUz0PA5n5FW4lyFIJhxJpNXoPyBoHFL72A1graDo7-FmfcUdzvHyJAKBwcmxr83-yxj9STK928Og--F5_H0wNRQ_9VdAzZrxxk-eeBdZ8P8Xcsyp5jqHD2KCc3UBFPnoePLA69iZaeOKgxg5mRsGO14CqdGLak3vlMb-KYEDtX0z3re05rOcoV-vlF1Ky8Hn3MqrxdKFFhIT8pCiW3iMVgbHKKzpkRHw-741kfhXZ6RRnrsHalhB4WafkR6mKs")'}} />
            <h1 className="text-gray-900 dark:text-white text-lg font-medium">Medical.</h1>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-16 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="flex flex-col gap-2 p-4">
          <button 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${currentPage === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}
          >
            <span className="material-symbols-outlined fill">dashboard</span>
            <p className="text-sm font-medium">Dashboard</p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">calendar_month</span>
            <p className="text-sm font-medium">Calendar</p>
          </button>
          <button 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${currentPage === 'patients' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => { setCurrentPage('patients'); setMobileMenuOpen(false); }}
          >
            <span className="material-symbols-outlined">groups</span>
            <p className="text-sm font-medium">Patients</p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">monitor_heart</span>
            <p className="text-sm font-medium">Diagnosis</p>
          </button>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 sticky top-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
               style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIvhsI2mvBKXaHlCUz0PA5n5FW4lyFIJhxJpNXoPyBoHFL72A1graDo7-FmfcUdzvHyJAKBwcmxr83-yxj9STK928Og--F5_H0wNRQ_9VdAzZrxxk-eeBdZ8P8Xcsyp5jqHD2KCc3UBFPnoePLA69iZaeOKgxg5mRsGO14CqdGLak3vlMb-KYEDtX0z3re05rOcoV-vlF1Ky8Hn3MqrxdKFFhIT8pCiW3iMVgbHKKzpkRHw-741kfhXZ6RRnrsHalhB4WafkR6mKs")'}} />
          <h1 className="text-gray-900 dark:text-white text-lg font-medium">Medical.</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <button 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${currentPage === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="material-symbols-outlined fill">dashboard</span>
            <p className="text-sm font-medium">Dashboard</p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">calendar_month</span>
            <p className="text-sm font-medium">Calendar</p>
          </button>
          <button 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${currentPage === 'patients' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => setCurrentPage('patients')}
          >
            <span className="material-symbols-outlined">groups</span>
            <p className="text-sm font-medium">Patients</p>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">monitor_heart</span>
            <p className="text-sm font-medium">Diagnosis</p>
          </button>
        </nav>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" href="#">
              <span className="material-symbols-outlined">notifications</span>
              <p className="text-sm font-medium">Notifications</p>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" href="#">
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Settings</p>
            </a>
          </div>
          
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
                     style={{backgroundImage: `url("${user.avatar}")`}} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      {currentPage === 'dashboard' ? (
      <main className="flex-1 pt-20 lg:pt-8 p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
        {/* Search */}
        <div className="col-span-1 lg:col-span-12">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-12">
            <div className="text-gray-500 flex border-none bg-white dark:bg-gray-900 items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input 
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-gray-900 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              placeholder="Search patients, medication, or diagnosis..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Center Column */}
        <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
          {/* Calendar */}
          <div className="col-span-1 bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">October</p>
              <div className="flex gap-2">
                <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3">
                  <p className="text-gray-800 dark:text-gray-200 text-xs font-medium">Work day</p>
                </div>
                <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3">
                  <p className="text-gray-800 dark:text-gray-200 text-xs font-medium">Vacation request</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-900 dark:text-white text-base font-bold">October 2024</p>
              <p className="text-sm text-gray-500 mt-4">Calendar component would go here</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="col-span-1 bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's timeline</h3>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`size-4 rounded-full ring-4 ring-white dark:ring-gray-900 ${
                      event.status === 'current' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    {index < timeline.length - 1 && <div className="w-px bg-gray-300 dark:bg-gray-600 h-8 mt-2" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="col-span-1 bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointments</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {Array.from({ length: 12 }, (_, i) => {
                const hour = 8 + i;
                const timeSlot = `${String(hour).padStart(2, '0')}:00`;
                const patient = patients.find(p => p.time === timeSlot);
                
                return (
                  <div key={i} className="flex items-center border-b border-gray-100 dark:border-gray-800 py-2">
                    <div className="w-16 text-sm text-gray-500 dark:text-gray-400">
                      {timeSlot}
                    </div>
                    <div className="flex-1 ml-4">
                      {patient ? (
                        <div 
                          className={`p-2 rounded cursor-pointer ${
                            patient.status === 'current' 
                              ? 'bg-primary/10 ring-1 ring-primary' 
                              : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="flex justify-between items-center">
                            <p className={`font-medium text-sm ${
                              patient.status === 'current' ? 'text-primary' : 'text-gray-800 dark:text-gray-200'
                            }`}>
                              {patient.name}
                            </p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(patient.status)}`}>
                              {patient.status === 'done' ? 'Done' : patient.status === 'current' ? 'Current' : 'Upcoming'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-8 bg-gray-50 dark:bg-gray-800/30 rounded"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Detail */}
          {selectedPatient && (
            <div className="col-span-1 bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPatient.time} - {selectedPatient.time.split(':')[0]}:30</p>
                </div>
              </div>
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Type</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPatient.type}</span>
                </div>
                {selectedPatient.referral && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Referral</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPatient.referral}</span>
                  </div>
                )}
                {selectedPatient.diagnosis && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Diagnosis</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPatient.diagnosis}</span>
                  </div>
                )}
                {selectedPatient.symptoms && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Symptoms</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPatient.symptoms}</span>
                  </div>
                )}
                {selectedPatient.comment && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Comment</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{selectedPatient.comment}</span>
                  </div>
                )}
              </div>
              <button className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90">
                <span>Medical Card</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 lg:gap-8">
          {/* Patient Conditions */}
          <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patients by condition</h3>
            <div className="flex items-center justify-center my-6">
              <div className="relative size-40">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalPatients}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {conditions.map((condition) => (
                <div key={condition.condition} className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${condition.color}`} />
                  <span className="text-gray-600 dark:text-gray-300">{condition.condition}</span>
                  <span className="font-medium ml-auto text-gray-800 dark:text-gray-100">{condition.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Updates */}
          <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Important updates</h3>
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${update.categoryColor}`}>
                      {update.category}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{update.date}</p>
                  </div>
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">{update.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{update.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      ) : currentPage === 'patients' ? (
        <PatientsPage />
      ) : (
        <div className="flex-1 pt-20 lg:pt-8 p-4 lg:p-8 flex items-center justify-center">
          <p className="text-gray-500">Page not found</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;