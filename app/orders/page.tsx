'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import NewOrderModal from '@/components/NewOrderModal'

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)

  const orders = [
    {
      id: '99281',
      patient: { name: 'Sarah Jenkins', mrn: '884-291', initials: 'SJ', color: 'purple' },
      details: 'Cisplatin 50mg/m2 IV',
      alert: 'Interaction Alert',
      type: 'Medication',
      priority: 'STAT',
      status: 'Pending',
      date: 'Today, 09:15 AM'
    },
    {
      id: '99282',
      patient: { name: 'Robert Miller', mrn: '492-110', initials: 'RM', color: 'blue' },
      details: 'CBC with Differential',
      note: 'Routine monitoring',
      type: 'Lab',
      priority: 'Routine',
      status: 'Completed',
      date: 'Yesterday, 04:30 PM'
    },
    {
      id: '99283',
      patient: { name: 'Emily Liu', mrn: '339-012', initials: 'EL', color: 'green' },
      details: 'CT Scan Chest/Abd/Pelvis',
      note: 'Evaluate progression',
      type: 'Imaging',
      priority: 'Urgent',
      status: 'In Progress',
      date: 'Oct 24, 02:15 PM'
    }
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Orders List */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-col gap-1 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-xl">assignment</span>
                  <p className="text-sm font-medium">Orders Today</p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">128</p>
                  <span className="text-green-600 text-xs font-medium mb-1.5">+12%</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 rounded-xl p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <span className="material-symbols-outlined text-xl">pending_actions</span>
                  <p className="text-sm font-medium">Pending Approval</p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-yellow-800 dark:text-yellow-300 text-2xl font-bold">14</p>
                  <span className="text-yellow-700 dark:text-yellow-400 text-xs font-medium mb-1.5">Needs Review</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <span className="material-symbols-outlined text-xl">emergency</span>
                  <p className="text-sm font-medium">STAT Orders</p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-red-700 dark:text-red-300 text-2xl font-bold">3</p>
                  <span className="text-red-600 dark:text-red-400 text-xs font-medium mb-1.5">Action Req.</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <p className="text-sm font-medium">Completed</p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">85</p>
                  <span className="text-green-600 text-xs font-medium mb-1.5">+8%</span>
                </div>
              </div>
            </div>

            {/* Page Header */}
            <div className="px-6 py-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Orders Management</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage patient orders, labs, and medications.</p>
                </div>
                <button 
                  onClick={() => setShowNewOrderModal(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span>New Order</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input 
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-shadow" 
                      placeholder="Search by Patient Name or MRN..." 
                      type="text"
                    />
                  </div>
                  
                  <select className="min-w-[160px] pl-3 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer text-gray-900 dark:text-white">
                    <option>Last 7 Days</option>
                    <option>Today</option>
                    <option>Last 30 Days</option>
                  </select>
                  
                  <select className="min-w-[140px] pl-3 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer text-gray-900 dark:text-white">
                    <option>All Priorities</option>
                    <option>STAT</option>
                    <option>Urgent</option>
                    <option>Routine</option>
                  </select>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button className="flex items-center px-4 py-1.5 rounded-full bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium whitespace-nowrap transition-colors">
                    All Types
                  </button>
                  <button className="flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium whitespace-nowrap transition-colors">
                    Medications
                  </button>
                  <button className="flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium whitespace-nowrap transition-colors">
                    Labs
                  </button>
                  <button className="flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium whitespace-nowrap transition-colors">
                    Imaging
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="flex-1 px-6 pb-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Details</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.map((order, index) => (
                      <tr key={order.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${index === 0 ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-9 rounded-full bg-${order.patient.color}-100 text-${order.patient.color}-700 flex items-center justify-center font-bold text-sm`}>
                              {order.patient.initials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{order.patient.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">MRN: {order.patient.mrn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-[200px]">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.details}</p>
                          {order.alert && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs font-medium">
                              <span className="material-symbols-outlined text-[14px]">warning</span>
                              <span>{order.alert}</span>
                            </div>
                          )}
                          {order.note && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{order.note}</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
                            {order.type}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                            order.priority === 'STAT' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                            order.priority === 'Urgent' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800' :
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                          }`}>
                            {order.priority === 'STAT' && <span className="material-symbols-outlined text-[14px] mr-1">bolt</span>}
                            {order.priority}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                            order.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                            'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              order.status === 'Pending' ? 'bg-yellow-500' :
                              order.status === 'Completed' ? 'bg-green-600' :
                              'bg-blue-500'
                            }`}></span>
                            {order.status === 'In Progress' && <span className="material-symbols-outlined text-[14px] mr-1 animate-spin">progress_activity</span>}
                            {order.status}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {order.date}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* New Order Modal */}
      <NewOrderModal 
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onSubmit={(orderData) => {
          console.log('New order:', orderData)
          setShowNewOrderModal(false)
        }}
      />
    </div>
  )
}