'use client'

import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useState } from 'react'

export default function PatientMessagingPage() {
  const params = useParams()
  const [message, setMessage] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  const messages = [
    {
      id: 1,
      type: 'received',
      content: 'Hi Dr. Doe, the pharmacy said my refill for Metformin requires authorization. Can you help?',
      timestamp: 'Yesterday 4:15 PM',
      status: 'Read',
      sender: 'Patient'
    },
    {
      id: 2,
      type: 'sent',
      content: "I've sent the authorization request just now. It should be ready for pickup by tomorrow morning.",
      timestamp: 'Yesterday 4:45 PM',
      status: 'Delivered',
      sender: 'Dr. J. Doe'
    },
    {
      id: 3,
      type: 'system',
      content: 'New Lab Results (CMP, Lipid Panel) released to patient portal.',
      timestamp: 'Today',
      icon: 'science'
    },
    {
      id: 4,
      type: 'received',
      content: "Dr. Doe, I'm feeling a bit of chest pain and shortness of breath since lunch. Should I take another pill?",
      timestamp: 'Today 10:45 AM',
      status: 'Unread',
      sender: 'Patient',
      isUrgent: true,
      hasAttachment: true,
      attachment: {
        name: 'Skin_Reaction.jpg',
        size: '1.2 MB',
        type: 'image'
      }
    }
  ]

  const quickTemplates = [
    '+ Clinical Question',
    '+ Normal Lab Result', 
    '+ Follow-up Instructions',
    '! Urgent: Call 911'
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle message sending logic here
      setMessage('')
      setIsUrgent(false)
    }
  }

  const handleTemplateClick = (template: string) => {
    if (template.includes('Clinical Question')) {
      setMessage('Thank you for your question. Based on your symptoms, I recommend...')
    } else if (template.includes('Normal Lab Result')) {
      setMessage('Your recent lab results are within normal limits. Please continue your current medications as prescribed.')
    } else if (template.includes('Follow-up Instructions')) {
      setMessage('Please schedule a follow-up appointment in 2-4 weeks to monitor your progress.')
    } else if (template.includes('Urgent: Call 911')) {
      setMessage('This requires immediate medical attention. Please call 911 or go to the nearest emergency room immediately.')
      setIsUrgent(true)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>
        <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-6 py-3 shrink-0 z-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Messaging Context</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary flex items-center justify-center text-xs font-bold">SJ</div>
                  <span className="text-slate-900 dark:text-white text-sm font-bold">Sarah Jenkins</span>
                  <span className="text-slate-400 text-xs">(DOB: 04/12/1985)</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Secure Messaging</h1>
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-0.5 rounded text-xs font-bold border border-red-100 dark:border-red-800">
                  <span className="material-symbols-outlined text-[14px] fill-current">flag</span>
                  1 Urgent Flag
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-bold border border-blue-100 dark:border-blue-800">
                  <span className="material-symbols-outlined text-[14px]">mail</span>
                  2 Unread
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden xl:flex flex-col items-end mr-4 border-r border-slate-100 dark:border-gray-700 pr-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Last Patient Message</span>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                  <span className="truncate max-w-[150px] font-medium">"Can I increase my dosage..."</span>
                  <span className="text-slate-400">10 mins ago</span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-600 transition-all text-xs">
                <span className="material-symbols-outlined text-[18px]">call</span>
                Call Phone
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-all text-xs animate-pulse">
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                Start Video Call
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Chat Area */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full border-r border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
            {/* Chat Header */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1.5 text-slate-400 text-[18px]">search</span>
                  <input 
                    className="pl-8 pr-3 py-1 text-xs border border-slate-200 dark:border-gray-600 rounded-md focus:border-primary focus:ring-0 text-slate-700 dark:text-gray-300 w-48 bg-slate-50 dark:bg-gray-700" 
                    placeholder="Search history..." 
                    type="text"
                  />
                </div>
                <span className="h-4 w-px bg-slate-200 dark:bg-gray-600 mx-1"></span>
                <select className="text-xs border-none py-1 pl-2 pr-6 text-slate-500 dark:text-gray-400 font-medium focus:ring-0 cursor-pointer hover:text-primary bg-transparent">
                  <option>Filter: All Messages</option>
                  <option>Urgent Only</option>
                  <option>Attachments</option>
                </select>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Patient Online
                </span>
                <span className="text-slate-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  End-to-End Encrypted
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50/50 dark:bg-gray-900/50">
              {/* Date Separator */}
              <div className="flex justify-center my-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full uppercase tracking-wide">Yesterday</span>
              </div>

              {/* Messages */}
              {messages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-4 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">{msg.icon}</span>
                        <span><strong>System:</strong> {msg.content}</span>
                        <a className="text-primary hover:underline font-semibold ml-1" href="#">View Results</a>
                      </div>
                    </div>
                  )
                }

                if (msg.type === 'received') {
                  return (
                    <div key={msg.id}>
                      {msg.id === 4 && (
                        <>
                          <div className="flex justify-center my-2">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full uppercase tracking-wide">Today</span>
                          </div>
                          {msg.isUrgent && (
                            <div className="mx-auto w-full max-w-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-3 flex items-start gap-3 shadow-sm mb-4">
                              <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase">AI Triage Alert: Urgent Keyword Detected</h4>
                                  <span className="text-[10px] text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-red-100 dark:border-red-700">High Priority</span>
                                </div>
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Patient message contains keywords: "Chest pain", "Shortness of breath". Recommended Action: Initiate video triage or refer to ER.</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex flex-col items-start gap-1 group max-w-[80%]">
                        <div className="flex items-end gap-2">
                          <div className="size-8 rounded-full bg-slate-200 dark:bg-gray-600 shrink-0 overflow-hidden relative">
                            {msg.id === 4 && <span className="absolute top-0 right-0 size-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>}
                            <span className="material-symbols-outlined text-slate-400 text-3xl -mb-1">person</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className={`bg-white dark:bg-gray-700 p-3 rounded-t-xl rounded-br-xl shadow-sm border text-sm text-slate-700 dark:text-gray-300 ${
                              msg.isUrgent ? 'border-l-4 border-l-red-500 border-t border-r border-b border-slate-200 dark:border-gray-600' : 'border-slate-200 dark:border-gray-600'
                            }`}>
                              <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/chest pain|shortness of breath/gi, '<strong>$&</strong>') }}></p>
                            </div>
                            {msg.hasAttachment && (
                              <div className="ml-1 flex items-center gap-2 p-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg w-fit shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-600">
                                <div className="size-8 bg-purple-100 dark:bg-purple-900/40 rounded flex items-center justify-center text-purple-600 dark:text-purple-400">
                                  <span className="material-symbols-outlined text-[18px]">image</span>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-700 dark:text-gray-300">{msg.attachment?.name}</p>
                                  <p className="text-[10px] text-slate-400">{msg.attachment?.size} • Uploaded by Patient</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-gray-600 rounded text-slate-500 dark:text-gray-400" title="Convert to Task">
                              <span className="material-symbols-outlined text-[16px]">task_alt</span>
                            </button>
                            {msg.isUrgent && (
                              <button className="p-1 hover:bg-slate-200 dark:hover:bg-gray-600 rounded text-slate-500 dark:text-gray-400" title="Flag as Critical">
                                <span className="material-symbols-outlined text-[16px]">flag</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-10">{msg.timestamp}</span>
                      </div>
                    </div>
                  )
                }

                if (msg.type === 'sent') {
                  return (
                    <div key={msg.id} className="flex flex-col items-end gap-1 group self-end max-w-[80%]">
                      <div className="flex items-end gap-2 flex-row-reverse">
                        <div className="size-8 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-xs font-bold">JD</div>
                        <div className="bg-primary text-white p-3 rounded-t-xl rounded-bl-xl shadow-md text-sm">
                          <p>{msg.content}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mr-10 flex items-center gap-1">
                        {msg.timestamp} • <span className="material-symbols-outlined text-[12px] text-blue-500">done_all</span> {msg.status}
                      </span>
                    </div>
                  )
                }

                return null
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 shrink-0 relative z-10">
              {/* Quick Templates */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
                {quickTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateClick(template)}
                    className={`whitespace-nowrap px-3 py-1 border rounded-full text-xs font-medium transition-colors ${
                      template.includes('Urgent')
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                        : 'bg-slate-50 dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 hover:text-primary hover:border-primary'
                    }`}
                  >
                    {template}
                  </button>
                ))}
              </div>

              {/* Message Composer */}
              <div className="relative rounded-xl border border-slate-300 dark:border-gray-600 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-gray-700">
                {/* Toolbar */}
                <div className="flex items-center gap-2 p-2 border-b border-slate-100 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 rounded-t-xl">
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 transition">
                    <span className="material-symbols-outlined text-[18px]">attach_file</span>
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 transition">
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                  </button>
                  <span className="w-px h-4 bg-slate-200 dark:bg-gray-600 mx-1"></span>
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 transition">
                    <span className="material-symbols-outlined text-[18px]">assignment_add</span>
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        className="rounded border-slate-300 dark:border-gray-600 text-primary focus:ring-primary h-3 w-3" 
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                      />
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">Mark Urgent</span>
                    </label>
                  </div>
                </div>

                {/* Text Area */}
                <textarea 
                  className="w-full border-0 bg-transparent p-3 text-sm text-slate-800 dark:text-gray-200 focus:ring-0 min-h-[80px] resize-none placeholder:text-slate-400 dark:placeholder:text-gray-500" 
                  placeholder="Type a message to Sarah... (Press '/' for templates)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />

                {/* Footer */}
                <div className="p-2 flex justify-between items-center">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">keyboard</span>
                    <span>Enter to send, Shift+Enter for new line</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 rounded text-xs font-bold transition">Save Draft</button>
                    <div className="flex rounded-md shadow-sm">
                      <button 
                        onClick={handleSendMessage}
                        className="px-4 py-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-l-md transition flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span> Send
                      </button>
                      <button className="px-1.5 bg-blue-700 hover:bg-blue-800 text-white border-l border-blue-400/30 rounded-r-md transition">
                        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <span className="text-[10px] text-slate-400 italic">Sending as: Dr. J. Doe (Attending)</span>
              </div>
            </div>
          </div>

          {/* Patient Context NurseSidebar */}
          <div className="lg:col-span-4 xl:col-span-3 h-full bg-slate-50 dark:bg-gray-900 border-l border-slate-200 dark:border-gray-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">space_dashboard</span> Patient Context
              </h3>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Available for Visit
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Since 10:40 AM</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded transition shadow-sm">Launch Video</button>
                  <button className="px-2 bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded transition" title="Create Visit Note">
                    <span className="material-symbols-outlined text-[16px] mt-1">edit_note</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Last Visit */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase">Last Visit</h4>
                  <a className="text-[10px] text-primary hover:underline" href="#">Oct 12</a>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">Follow-up for hypertension. BP 130/85. Meds adjusted. Patient compliant with diet.</p>
              </div>

              {/* Active Problems */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-2">Active Problems</h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800 rounded text-[10px] font-bold">Type 2 Diabetes</span>
                  <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800 rounded text-[10px] font-bold">Hypertension</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600 rounded text-[10px] font-medium">Asthma (Mild)</span>
                </div>
              </div>

              {/* Current Medications */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-2">Current Medications</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-gray-700 pb-1">
                    <span className="font-medium text-slate-800 dark:text-gray-200">Metformin 500mg</span>
                    <span className="text-slate-500 dark:text-gray-400">BID</span>
                  </li>
                  <li className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-gray-700 pb-1">
                    <span className="font-medium text-slate-800 dark:text-gray-200">Lisinopril 10mg</span>
                    <span className="text-slate-500 dark:text-gray-400">Daily</span>
                  </li>
                  <li className="flex justify-between items-start text-xs">
                    <span className="font-medium text-slate-800 dark:text-gray-200">Albuterol Inhaler</span>
                    <span className="text-slate-500 dark:text-gray-400">PRN</span>
                  </li>
                </ul>
              </div>

              {/* Recent Labs */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-2">Recent Labs (Last 30d)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-gray-400">HbA1c</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">7.2% (High)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{width: '70%'}}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-600 dark:text-gray-400">LDL Cholesterol</span>
                    <span className="font-bold text-green-600 dark:text-green-400">98 mg/dL</span>
                  </div>
                </div>
              </div>

              {/* Patient Engagement */}
              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2">Patient Engagement</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-blue-700">
                    <span className="block text-[10px] text-slate-400">Portal Login</span>
                    <span className="block text-xs font-bold text-slate-700 dark:text-gray-300">Today</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-blue-700">
                    <span className="block text-[10px] text-slate-400">Msg Response</span>
                    <span className="block text-xs font-bold text-slate-700 dark:text-gray-300">~2 Hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-800 text-[10px] text-slate-400 text-center">
              <div className="flex justify-center items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[12px] text-green-600">check_circle</span>
                <span className="text-slate-500 dark:text-gray-400 font-medium">Consent for Telehealth on File</span>
              </div>
              <p>After-hours: Auto-reply active (Emergency: 911)</p>
              <p className="mt-1 opacity-70">Audit ID: #MSG-99281-REF • Retained 7 Years</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}