'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientOrdersPage() {
  const params = useParams()
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All Types')

  const orders: any[] = []

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Orders</h2>
              </div>
              <button 
                onClick={() => setShowNewOrderModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Order
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Orders Today</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">No data</p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">assignment</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Pending Approval</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">No data</p>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">pending_actions</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">STAT Orders</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">No data</p>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">emergency</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">No data</p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Orders Management</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Manage patient orders, labs, and medications.</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {['All Types', 'Medications', 'Labs', 'Imaging'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          activeFilter === filter
                            ? 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
                            : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <span className="material-symbols-outlined text-slate-500 dark:text-gray-400 text-sm">search</span>
                    <input 
                      className="bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 focus:ring-0 w-32"
                      placeholder="Search..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Order Details</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Ordered By</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 px-6 text-center text-sm text-slate-500 dark:text-gray-400">
                          No orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50">
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{order.orderDetails}</div>
                              <div className={`text-sm flex items-center gap-1 ${
                                order.alert === 'Interaction Alert' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-gray-400'
                              }`}>
                                {order.alert === 'Interaction Alert' && (
                                  <span className="material-symbols-outlined text-sm">warning</span>
                                )}
                                {order.alert}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{order.type}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.priority === 'STAT' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              order.priority === 'Urgent' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {order.priority === 'STAT' && <span className="material-symbols-outlined text-xs">bolt</span>}
                              {order.priority}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              order.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {order.status === 'In Progress' && <span className="material-symbols-outlined text-xs">progress_activity</span>}
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{order.date}</td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{order.orderedBy}</td>
                          <td className="py-4 px-6">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                              <span className="material-symbols-outlined text-sm">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <NewOrderModal onClose={() => setShowNewOrderModal(false)} />
      )}
    </div>
  )
}

function NewOrderModal({ onClose }: { onClose: () => void }) {
  const [orderType, setOrderType] = useState('Medication')
  const [medication, setMedication] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [route, setRoute] = useState('')
  const [duration, setDuration] = useState('')
  const [refills, setRefills] = useState('')
  const [instructions, setInstructions] = useState('')
  const [priority, setPriority] = useState('Routine')

  const aiSuggestions: any[] = []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Order</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Order Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['Medication', 'Lab', 'Imaging', 'Procedure'].map(type => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`p-3 text-sm font-medium rounded-lg border transition-all ${
                    orderType === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Medication Fields */}
          {orderType === 'Medication' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Medication Search</label>
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                  placeholder="Search medication..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Frequency</label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Route</label>
                  <input
                    type="text"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Refills Authorized</label>
                <input
                  type="number"
                  value={refills}
                  onChange={(e) => setRefills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                />
              </div>
            </>
          )}

          {/* AI Diagnosis Suggestions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Link to Diagnosis (AI Suggestions)
            </label>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{suggestion.code}</div>
                    <div className="text-sm text-slate-600 dark:text-gray-300">{suggestion.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">psychology</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{suggestion.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Special Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            >
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="STAT">STAT</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
            Create Order
          </button>
        </div>
      </div>
    </div>
  )
}
