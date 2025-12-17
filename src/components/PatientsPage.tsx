import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { apiService } from '../services/api';
import PatientDetail from './PatientDetail';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [videoPosition, setVideoPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadPatients = async () => {
      const patientsData = await apiService.getPatients();
      setPatients(patientsData);
    };
    loadPatients();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recovered': return 'text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-300';
      case 'under_treatment': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300';
      case 'under_observation': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/40 dark:text-gray-300';
    }
  };

  if (selectedPatient) {
    return (
      <div className="relative">
        {/* Video Call Overlay */}
        {videoCallActive && (
          <div 
            className="fixed w-80 h-60 bg-black rounded-lg shadow-2xl z-50 border-2 border-blue-500 cursor-move"
            style={{ left: videoPosition.x, top: videoPosition.y }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragOffset({
                x: e.clientX - videoPosition.x,
                y: e.clientY - videoPosition.y
              });
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setVideoPosition({
                  x: e.clientX - dragOffset.x,
                  y: e.clientY - dragOffset.y
                });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-t-lg">
              <span className="text-white text-sm font-medium">Video Call - Patient</span>
              <button 
                onClick={() => setVideoCallActive(false)}
                className="text-white hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex items-center justify-center h-48 bg-gray-800 rounded-b-lg">
              <div className="text-center text-white">
                <span className="material-symbols-outlined text-4xl mb-2 block">videocam</span>
                <p className="text-sm">Video call active</p>
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined text-sm">call_end</span>
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined text-sm">mic_off</span>
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined text-sm">videocam_off</span>
              </button>
            </div>
          </div>
        )}
        <PatientDetail 
          patient={selectedPatient} 
          onBack={() => setSelectedPatient(null)}
          onVideoCall={() => setVideoCallActive(true)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Video Call Overlay */}
      {videoCallActive && (
        <div 
          className="fixed w-80 h-60 bg-black rounded-lg shadow-2xl z-50 border-2 border-blue-500 cursor-move"
          style={{ left: videoPosition.x, top: videoPosition.y }}
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragOffset({
              x: e.clientX - videoPosition.x,
              y: e.clientY - videoPosition.y
            });
          }}
          onMouseMove={(e) => {
            if (isDragging) {
              setVideoPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
              });
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div className="flex justify-between items-center p-3 bg-gray-900 rounded-t-lg">
            <span className="text-white text-sm font-medium">Video Call - Patient</span>
            <button 
              onClick={() => setVideoCallActive(false)}
              className="text-white hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="flex items-center justify-center h-48 bg-gray-800 rounded-b-lg">
            <div className="text-center text-white">
              <span className="material-symbols-outlined text-4xl mb-2 block">videocam</span>
              <p className="text-sm">Video call active</p>
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined text-sm">call_end</span>
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined text-sm">mic_off</span>
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined text-sm">videocam_off</span>
            </button>
          </div>
        </div>
      )}
      
    <main className="flex-1 pt-20 lg:pt-8 p-4 lg:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Patients List</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Search Patients"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full flex items-center shadow-lg">
            <span className="material-symbols-outlined text-sm mr-2">add</span>
            <span className="text-sm font-medium">Add Patients</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-primary rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold">1,250k</h3>
                <p className="text-blue-100 text-xs font-medium mt-1">Total Patients</p>
              </div>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">+20%</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white flex items-start">
                  58
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-1 animate-pulse"></div>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1">Critical</p>
              </div>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-semibold">+10%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white flex items-start">
                  219
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1">Follow up</p>
              </div>
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-semibold">+4%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white flex items-start">
                  23
                  <div className="w-2 h-2 bg-purple-500 rounded-full ml-1"></div>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1">Draft</p>
              </div>
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-semibold">-5%</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Patients status</h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full cursor-pointer">
              Yearly <span className="material-symbols-outlined text-sm ml-1">expand_more</span>
            </div>
          </div>
          <div className="h-40 flex items-center justify-center text-gray-500">
            <span>Chart visualization would go here</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-6">
        {patients.map((patient) => (
          <div 
            key={patient.id} 
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 cursor-move"
            draggable
            onClick={() => setSelectedPatient(patient)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', patient.id);
              e.currentTarget.style.opacity = '0.5';
            }}
            onDragEnd={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#137fec';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'transparent';
              const draggedId = e.dataTransfer.getData('text/plain');
              const targetId = patient.id;
              
              if (draggedId !== targetId) {
                const newPatients = [...patients];
                const draggedIndex = newPatients.findIndex(p => p.id === draggedId);
                const targetIndex = newPatients.findIndex(p => p.id === targetId);
                
                const [draggedPatient] = newPatients.splice(draggedIndex, 1);
                newPatients.splice(targetIndex, 0, draggedPatient);
                
                setPatients(newPatients);
              }
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <img 
                alt={patient.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900 cursor-pointer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM3ICbZ8z0Efd_JndI0nxLf1xoPT9Qu5u7JOVQk1C4v9jvf9Imxxeihie4tzXRP0fxByp_jZ5-t8ZaRReubpV0Ot7RZKtjdd8nGeVTenCfxbFkmtAsfproneHcg9ObslryS-maUvfjOKzKMwNQty7FtvQQQxjA1isNwGRxWyk22ra2LTOLu7zUo-PaEREQDs7soTQIxrs7kYcD34Y4qyjxuDJhM3QFIVNUMAuKPbslsBc8K2Zv2KbHENeK-FlWUql8LUgxgSwU-4cl"
                onClick={() => setSelectedPatient(patient)}
              />
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-bold text-gray-800 dark:text-white truncate cursor-pointer hover:text-blue-500"
                  onClick={() => setSelectedPatient(patient)}
                >
                  {patient.name}
                </h4>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                    <span className="material-symbols-outlined text-[12px] mr-1">call</span> Phone
                  </button>
                  <button 
                    className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoCallActive(true);
                    }}
                  >
                    <span className="material-symbols-outlined text-[12px] mr-1">videocam</span> Video Call
                  </button>
                  <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                    <span className="material-symbols-outlined text-[12px] mr-1">monitor_heart</span> Live Vital
                  </button>
                  <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                    <span className="material-symbols-outlined text-[12px] mr-1">email</span> Email
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
              <div className="text-gray-500 dark:text-gray-400">Gender, Age</div>
              <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.gender || 'Male'}, {patient.age || 24}y</div>
              <div className="text-gray-500 dark:text-gray-400">Physician</div>
              <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.referral || 'Dr. Smith'}</div>
              <div className="text-gray-500 dark:text-gray-400">Last Consultation</div>
              <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.lastConsultation || 'May 12, 2019'}</div>
              <div className="text-gray-500 dark:text-gray-400">Appointments</div>
              <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.time}</div>
              <div className="text-gray-500 dark:text-gray-400">Current Issue</div>
              <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.currentIssue || 'N/A'}</div>
              <div className="text-gray-500 dark:text-gray-400">Medication</div>
              <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.currentMedication || 'None'}</div>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                <select 
                  className={`text-xs font-semibold px-3 py-1 rounded-full border-none focus:ring-2 focus:ring-blue-500 ${getStatusColor('under_treatment')}`}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    // Handle status change
                    console.log('Status changed to:', e.target.value);
                  }}
                >
                  <option value="under_treatment">Under Treatment</option>
                  <option value="recovered">Recovered</option>
                  <option value="under_observation">Under Observation</option>
                  <option value="critical">Critical</option>
                  <option value="stable">Stable</option>
                </select>
              </div>
              <button 
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-700 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPatient(patient);
                }}
              >
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
    </div>
  );
};

export default PatientsPage;