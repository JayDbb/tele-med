'use client'

import React, { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

interface Message {
  id: string
  conversation_id?: string | null
  sender_id?: string | null
  recipient_id?: string | null
  body?: string | null
  attachments?: any
  created_at?: string | null
}

export default function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')

  useEffect(() => {
    loadMessages()
  }, [])

  async function getToken() {
    const supabase = supabaseBrowser()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  async function loadMessages() {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return setMessages([])
      const res = await fetch('/api/messages', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch messages')
      const json = await res.json()
      setMessages(json.messages || [])
    } catch (err) {
      console.error('Failed to load messages', err)
    } finally {
      setLoading(false)
    }
  }

  async function sendReply(recipientId: string) {
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipient_id: recipientId, body: replyBody })
      })
      if (!res.ok) throw new Error('Failed to send message')
      setReplyBody('')
      setReplyTo(null)
      await loadMessages()
    } catch (err) {
      console.error('Failed to send reply', err)
      alert('Failed to send message')
    }
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {loading && <div className="p-4">Loading messages…</div>}
      {!loading && messages.length === 0 && <div className="p-6 text-gray-500">No messages yet.</div>}

      {messages.map(m => (
        <div key={m.id} className={`group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer relative overflow-hidden ${!m.created_at ? '' : ''}`}>
          <div className="flex items-center gap-4 min-w-[200px]">
            <input className="ml-2 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" type="checkbox"/>
            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-300 shrink-0">
              <span className="material-symbols-outlined">chat_bubble</span>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{m.sender_id || 'Unknown'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">Message</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.body ? (m.body.length > 60 ? m.body.substring(0, 60) + '…' : m.body) : 'No message'}</p>
            </div>
            <p className="text-sm text-gray-900 dark:text-gray-300 font-medium line-clamp-1">{m.body}</p>
          </div>
          <div className="flex items-center gap-6 justify-between w-full md:w-auto mt-2 md:mt-0">
            <span className="text-xs font-bold text-primary dark:text-blue-400 whitespace-nowrap">{m.created_at ? timeAgo(m.created_at) : ''}</span>
            <div className="flex gap-2">
              <button onClick={() => { setReplyTo(m.sender_id || null); setReplyBody('') }} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:border-blue-400 dark:hover:text-blue-400 rounded-lg text-sm font-semibold text-gray-900 dark:text-white shadow-sm transition-all whitespace-nowrap">Reply</button>
            </div>
          </div>

          {replyTo === m.sender_id && (
            <div className="w-full mt-3">
              <textarea className="w-full p-2 border rounded-md" value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder="Write a reply…" />
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => { setReplyTo(null); setReplyBody('') }} className="px-3 py-1 rounded-md border">Cancel</button>
                <button onClick={() => sendReply(m.sender_id!)} className="px-3 py-1 rounded-md bg-primary text-white">Send</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}
