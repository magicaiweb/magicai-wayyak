'use client'

import { FormEvent, useMemo, useState } from 'react'

type PortalRole = 'owner' | 'admin' | 'ksu_admin'
type Step = 'login' | 'otp' | 'inside'
type SpaceStatus = 'awaiting_approval' | 'approved' | 'changes_requested'
type PaymentStatus = 'paid' | 'manual_pending' | 'refund_review'
type BookingStatus = 'new' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'

type Booking = {
  id: string
  guest: string
  guestName: string
  space: string
  slot: string
  end: string
  payment: PaymentStatus
  status: BookingStatus
  total: string
  task: string
  guests: number
  owner: string
  location: string
  notes: string
  chat: { from: 'admin' | 'guest'; text: string; time: string }[]
}

const roles: { id: PortalRole; label: string; note: string }[] = [
  { id: 'owner', label: 'Owner Portal', note: 'Create and manage spaces' },
  { id: 'admin', label: 'Admin Portal', note: 'Review spaces and bookings' },
  { id: 'ksu_admin', label: 'KSU Admin', note: 'Campus-level approvals' },
]

const MOCK_OTP = '123456'
const phonePattern = /^\+9665\d{8}$/
const ksuEmailPattern = /^[^\s@]+@ksu\.edu\.sa$/i

const initialSpaces = [
  { id: 'SP-1042', title: 'قاعة اجتماعات الحاضنة', owner: 'KSU Incubation Centre', status: 'awaiting_approval' as SpaceStatus, price: '120 SAR/hr', submitted: 'Today 09:20', risk: 'Photos need review' },
  { id: 'SP-1041', title: 'قاعة تدريب KSU', owner: 'KSU Facilities', status: 'approved' as SpaceStatus, price: '180 SAR/hr', submitted: 'Yesterday', risk: 'Published' },
  { id: 'SP-1039', title: 'استوديو محتوى جامعي', owner: 'KSU Media Lab', status: 'changes_requested' as SpaceStatus, price: '90 SAR/hr', submitted: 'May 18', risk: 'Missing capacity proof' },
]

const initialBookings: Booking[] = [
  { id: 'BK-2208', guest: '+966512345678', guestName: 'Sarah A.', space: 'قاعة اجتماعات الحاضنة', slot: 'Today 11:00', end: 'Today 12:00', payment: 'manual_pending', status: 'new', total: '120 SAR', task: 'Confirm transfer receipt', guests: 8, owner: 'KSU Incubation Centre', location: 'Business Incubator, KSU', notes: 'Needs projector and parking instructions.', chat: [{ from: 'guest', text: 'Hello, can you confirm the exact entrance?', time: '10:02' }] },
  { id: 'BK-2207', guest: '+966599440011', guestName: 'Omar K.', space: 'استوديو محتوى جامعي', slot: 'Tomorrow 13:00', end: 'Tomorrow 15:00', payment: 'paid', status: 'confirmed', total: '180 SAR', task: 'Ready for owner confirmation', guests: 3, owner: 'KSU Media Lab', location: 'Student Media Zone, KSU', notes: 'Podcast recording setup.', chat: [{ from: 'admin', text: 'Payment received. Please arrive 10 minutes early.', time: '09:44' }] },
  { id: 'BK-2202', guest: '+966588771122', guestName: 'Noura M.', space: 'قاعة تدريب KSU', slot: 'May 21 10:00', end: 'May 21 12:00', payment: 'refund_review', status: 'cancelled', total: '360 SAR', task: 'Refund policy check', guests: 22, owner: 'KSU Facilities', location: 'Entrepreneurship Building, KSU', notes: 'Cancelled under 48 hours.', chat: [{ from: 'guest', text: 'Can you process the refund?', time: 'Yesterday' }] },
]

const statusLabel: Record<SpaceStatus, string> = { awaiting_approval: 'Awaiting approval', approved: 'Approved', changes_requested: 'Changes requested' }
const paymentLabel: Record<PaymentStatus, string> = { paid: 'Paid', manual_pending: 'Manual pending', refund_review: 'Refund review' }
const bookingLabel: Record<BookingStatus, string> = { new: 'New', confirmed: 'Confirmed', checked_in: 'Checked in', completed: 'Completed', cancelled: 'Cancelled' }

export default function AdminPortal() {
  const [role, setRole] = useState<PortalRole>('admin')
  const [phone, setPhone] = useState('+966512345678')
  const [email, setEmail] = useState('admin@ksu.edu.sa')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('login')
  const [message, setMessage] = useState('Secure internal portal mock. Use OTP 123456 for this preview.')
  const [spaces, setSpaces] = useState(initialSpaces)
  const [bookings, setBookings] = useState(initialBookings)
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookings[0].id)
  const [chatDraft, setChatDraft] = useState('')

  const selectedRole = roles.find((item) => item.id === role) ?? roles[1]
  const selectedBooking = bookings.find((item) => item.id === selectedBookingId) ?? bookings[0]
  const stats = useMemo(() => [
    { label: 'Awaiting approval', value: spaces.filter((item) => item.status === 'awaiting_approval').length, tone: 'bg-amber-100 text-amber-800' },
    { label: 'Paid bookings', value: bookings.filter((item) => item.payment === 'paid').length, tone: 'bg-emerald-100 text-emerald-800' },
    { label: 'Manual payment queue', value: bookings.filter((item) => item.payment === 'manual_pending').length, tone: 'bg-blue-100 text-blue-800' },
    { label: 'Refund review', value: bookings.filter((item) => item.payment === 'refund_review').length, tone: 'bg-rose-100 text-rose-800' },
  ], [bookings, spaces])

  const start = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phonePattern.test(phone)) return setMessage('Use Saudi phone format: +9665XXXXXXXX')
    if (role === 'ksu_admin' && !ksuEmailPattern.test(email)) return setMessage('KSU Admin requires an @ksu.edu.sa email.')
    setStep('otp')
    setMessage('OTP sent in preview mode. Use 123456.')
  }

  const verify = () => {
    if (otp !== MOCK_OTP) return setMessage('Wrong OTP. Preview code is 123456.')
    setStep('inside')
    setMessage(`Signed in to ${selectedRole.label}. Booking management workspace ready.`)
  }

  const updateSpace = (id: string, status: SpaceStatus) => {
    setSpaces((current) => current.map((item) => item.id === id ? { ...item, status, risk: status === 'approved' ? 'Published' : 'Owner action required' } : item))
    setMessage(`${id} moved to ${statusLabel[status]}.`)
  }

  const patchBooking = (id: string, patch: Partial<Booking>) => {
    setBookings((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  const updatePayment = (id: string, payment: PaymentStatus) => {
    patchBooking(id, { payment, task: payment === 'paid' ? 'Ready for owner confirmation' : paymentLabel[payment] })
    setMessage(`${id} marked as ${paymentLabel[payment]}.`)
  }

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    patchBooking(id, { status })
    setMessage(`${id} status changed to ${bookingLabel[status]}.`)
  }

  const deleteBooking = (id: string) => {
    const remaining = bookings.filter((item) => item.id !== id)
    setBookings(remaining)
    setSelectedBookingId(remaining[0]?.id ?? '')
    setMessage(`${id} removed from the queue.`)
  }

  const sendChat = () => {
    if (!selectedBooking || !chatDraft.trim()) return
    patchBooking(selectedBooking.id, { chat: [...selectedBooking.chat, { from: 'admin', text: chatDraft.trim(), time: 'Now' }] })
    setChatDraft('')
    setMessage(`Message sent to ${selectedBooking.guest}.`)
  }

  return (
    <main className="min-h-screen bg-[#07130D] px-4 py-6 font-arabic text-white sm:px-6 lg:px-8" dir="rtl">
      <section className="mx-auto max-w-7xl">
        <nav className="flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-english text-xs font-black uppercase tracking-[0.32em] text-wayyak-gold" dir="ltr">WAYYAK ADMIN PORTAL</p>
            <h1 className="mt-1 text-2xl font-black">{step === 'inside' ? selectedRole.label : 'بوابة الإدارة الداخلية'}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2" dir="ltr">
            {step === 'inside' ? roles.map((item) => <button key={item.id} type="button" onClick={() => { setRole(item.id); setMessage(`Showing ${item.label} only.`) }} className={`rounded-full px-3 py-2 font-english text-xs font-black transition ${role === item.id ? 'bg-wayyak-gold text-[#07130D]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>{item.label}</button>) : null}
            {step === 'inside' ? <button type="button" onClick={() => { setStep('login'); setOtp(''); setMessage('Signed out.') }} className="rounded-full bg-white/10 px-4 py-2 font-english text-xs font-black text-white">Sign out</button> : null}
            <a href="../" className="rounded-full border border-white/15 px-4 py-2 font-english text-xs font-black uppercase tracking-[0.18em] text-white/70">User Site</a>
          </div>
        </nav>

        {step !== 'inside' ? <div className="grid items-start gap-6 py-10 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[2rem] border border-wayyak-gold/25 bg-[#0D2417] p-6 shadow-2xl">
            <p className="font-english text-xs font-black uppercase tracking-[0.28em] text-wayyak-gold" dir="ltr">Internal operations</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">Dashboard, not a user page</h2>
            <p className="mt-4 leading-8 text-white/65">Admins should immediately see what needs action after login: approvals, paid bookings, manual payments, refunds, and user communication.</p>
            <div className="mt-8 grid gap-3">{roles.map((item) => <button key={item.id} type="button" onClick={() => setRole(item.id)} className={`rounded-2xl border p-4 text-right transition ${role === item.id ? 'border-wayyak-gold bg-wayyak-gold text-[#07130D]' : 'border-white/10 bg-white/5 text-white'}`}><span className="font-english text-sm font-black" dir="ltr">{item.label}</span><span className="mt-1 block text-sm opacity-70">{item.note}</span></button>)}</div>
          </aside>

          <section className="rounded-[2rem] bg-white p-6 text-wayyak-deep shadow-2xl lg:p-8">
            <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-green" dir="ltr">Admin authentication</p>
            <h2 className="mt-3 text-3xl font-black">تسجيل دخول الإدارة</h2>
            <p className="mt-2 font-english text-sm font-bold text-wayyak-deep/45" dir="ltr">Selected: {selectedRole.label} · {selectedRole.note}</p>
            <form onSubmit={start} className="mt-6 grid gap-4">
              <label className="text-sm font-bold">رقم الجوال<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 font-english" dir="ltr" /></label>
              <label className="text-sm font-bold">البريد الإداري<input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 font-english" dir="ltr" /></label>
              {step === 'otp' ? <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 text-center font-english" dir="ltr" /><button type="button" onClick={verify} className="rounded-2xl bg-wayyak-gold px-7 py-4 font-black text-wayyak-deep">Verify</button></div> : <button className="rounded-2xl bg-wayyak-green px-7 py-4 font-black text-white">Send Admin OTP</button>}
            </form>
            <p className="mt-6 rounded-2xl bg-wayyak-mint p-4 text-sm font-bold text-wayyak-green">{message}</p>
          </section>
        </div> : <section className="py-8">
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" dir="ltr">
            {stats.map((item) => <div key={item.label} className={`rounded-2xl p-5 ${item.tone}`}><p className="font-english text-4xl font-black">{item.value}</p><p className="mt-1 font-english text-xs font-black uppercase tracking-[0.12em]">{item.label}</p></div>)}
          </div>

          {role === 'admin' ? <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
            <div className="rounded-[2rem] bg-white p-5 text-wayyak-deep shadow-2xl">
              <div className="flex flex-col justify-between gap-3 border-b border-wayyak-green/10 pb-4 sm:flex-row sm:items-end"><div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-green" dir="ltr">Admin selected</p><h2 className="mt-1 text-3xl font-black">كل الحجوزات</h2></div><p className="rounded-full bg-wayyak-mint px-4 py-2 font-english text-xs font-black text-wayyak-green" dir="ltr">Bookings only · open one to manage CRUD + chat</p></div>
              <div className="mt-4 grid gap-3">
                {bookings.map((booking) => <article key={booking.id} onClick={() => setSelectedBookingId(booking.id)} className={`cursor-pointer rounded-2xl border p-4 transition ${selectedBooking?.id === booking.id ? 'border-wayyak-green bg-wayyak-mint' : 'border-wayyak-green/10 bg-wayyak-sand hover:border-wayyak-green/35'}`}><div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">{booking.id} · {booking.guestName} · {booking.guest}</p><h3 className="mt-1 text-xl font-black">{booking.space}</h3><p className="font-english text-xs font-bold text-wayyak-deep/45" dir="ltr">{booking.slot} → {booking.end} · {booking.total} · {booking.location}</p></div><div className="flex flex-wrap gap-2" dir="ltr"><span className="rounded-full bg-white px-3 py-1 font-english text-[11px] font-black text-wayyak-green">{bookingLabel[booking.status]}</span><span className="rounded-full bg-white px-3 py-1 font-english text-[11px] font-black text-wayyak-green">{paymentLabel[booking.payment]}</span></div></div></article>)}
                {!bookings.length ? <p className="rounded-2xl bg-wayyak-sand p-5 text-center font-bold text-wayyak-deep/50">No bookings left.</p> : null}
              </div>
            </div>

            {selectedBooking ? <aside className="rounded-[2rem] bg-white p-5 text-wayyak-deep shadow-2xl">
              <div className="flex items-start justify-between gap-3"><div><p className="font-english text-xs font-black uppercase tracking-[0.2em] text-wayyak-green" dir="ltr">Booking detail</p><h2 className="mt-1 text-3xl font-black">{selectedBooking.id}</h2></div><button type="button" onClick={() => deleteBooking(selectedBooking.id)} className="rounded-full bg-red-50 px-4 py-2 font-english text-xs font-black text-red-700" dir="ltr">Delete</button></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-wayyak-sand p-4"><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">Guest</p><p className="font-black">{selectedBooking.guestName}</p><p className="font-english text-sm text-wayyak-deep/50" dir="ltr">{selectedBooking.guest}</p></div><div className="rounded-2xl bg-wayyak-sand p-4"><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">Location</p><p className="font-bold">{selectedBooking.location}</p></div><div className="rounded-2xl bg-wayyak-sand p-4"><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">Schedule</p><p className="font-english text-sm font-bold" dir="ltr">{selectedBooking.slot} → {selectedBooking.end}</p></div><div className="rounded-2xl bg-wayyak-sand p-4"><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">Guests / Total</p><p className="font-english text-sm font-bold" dir="ltr">{selectedBooking.guests} guests · {selectedBooking.total}</p></div></div>
              <p className="mt-3 rounded-2xl bg-wayyak-mint p-4 text-sm font-bold text-wayyak-green">{selectedBooking.notes}</p>
              <div className="mt-5 grid gap-2" dir="ltr"><div className="flex flex-wrap gap-2"><button onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')} className="rounded-xl bg-wayyak-green px-3 py-2 text-xs font-black text-white">Confirm</button><button onClick={() => updateBookingStatus(selectedBooking.id, 'checked_in')} className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-black text-blue-800">Check in</button><button onClick={() => updateBookingStatus(selectedBooking.id, 'completed')} className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">Complete</button><button onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">Cancel</button></div><div className="flex flex-wrap gap-2"><button onClick={() => updatePayment(selectedBooking.id, 'paid')} className="rounded-xl bg-wayyak-gold px-3 py-2 text-xs font-black text-wayyak-deep">Mark paid</button><button onClick={() => updatePayment(selectedBooking.id, 'manual_pending')} className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-black text-blue-800">Manual pending</button><button onClick={() => updatePayment(selectedBooking.id, 'refund_review')} className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-black text-rose-800">Refund review</button></div></div>
              <div className="mt-6 rounded-[1.5rem] border border-wayyak-green/10 bg-wayyak-sand p-4"><h3 className="font-english text-sm font-black uppercase tracking-[0.18em] text-wayyak-green" dir="ltr">Chat with guest</h3><div className="mt-3 grid max-h-64 gap-2 overflow-y-auto">{selectedBooking.chat.map((item, index) => <div key={`${item.time}-${index}`} className={`rounded-2xl p-3 text-sm font-bold ${item.from === 'admin' ? 'bg-wayyak-green text-white' : 'bg-white text-wayyak-deep'}`}><p>{item.text}</p><p className="mt-1 font-english text-[10px] opacity-60" dir="ltr">{item.from} · {item.time}</p></div>)}</div><div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]" dir="ltr"><input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Type message to user..." className="rounded-2xl border border-wayyak-green/10 bg-white p-3 font-english text-sm outline-none" /><button onClick={sendChat} className="rounded-2xl bg-wayyak-green px-5 py-3 font-english text-sm font-black text-white">Send</button></div></div>
            </aside> : null}
          </div> : null}

          {role === 'owner' ? <div className="rounded-[2rem] bg-white p-5 text-wayyak-deep shadow-2xl">
            <div className="flex flex-col justify-between gap-3 border-b border-wayyak-green/10 pb-4 sm:flex-row sm:items-end"><div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-green" dir="ltr">Owner selected</p><h2 className="mt-1 text-3xl font-black">إدارة المساحات</h2></div><button className="rounded-full bg-wayyak-green px-5 py-3 font-english text-xs font-black text-white" dir="ltr">+ Add space</button></div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">{spaces.map((space) => <article key={space.id} className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4"><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">{space.id} · {space.owner}</p><h3 className="mt-2 text-xl font-black">{space.title}</h3><p className="mt-1 font-english text-xs font-bold text-wayyak-deep/45" dir="ltr">{space.price} · {space.submitted}</p><p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-wayyak-green">{space.risk}</p><div className="mt-3 flex flex-wrap gap-2" dir="ltr"><button onClick={() => updateSpace(space.id, 'awaiting_approval')} className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-black text-blue-800">Submit</button><button onClick={() => updateSpace(space.id, 'changes_requested')} className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-black text-amber-800">Edit</button><button onClick={() => updateSpace(space.id, 'approved')} className="rounded-xl bg-wayyak-green px-3 py-2 text-xs font-black text-white">Publish mock</button></div></article>)}</div>
          </div> : null}

          {role === 'ksu_admin' ? <div className="rounded-[2rem] bg-white p-5 text-wayyak-deep shadow-2xl">
            <div className="border-b border-wayyak-green/10 pb-4"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-green" dir="ltr">KSU Admin selected</p><h2 className="mt-1 text-3xl font-black">موافقات الجامعة</h2><p className="mt-2 text-sm font-bold text-wayyak-deep/50">Only campus approval and compliance tasks are visible in this tab.</p></div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">{spaces.filter((space) => space.status !== 'approved').map((space) => <article key={space.id} className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4"><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">{space.id} · {space.owner}</p><h3 className="mt-2 text-xl font-black">{space.title}</h3><p className="mt-1 font-english text-xs font-bold text-wayyak-deep/45" dir="ltr">{statusLabel[space.status]} · {space.risk}</p><div className="mt-3 flex flex-wrap gap-2" dir="ltr"><button onClick={() => updateSpace(space.id, 'approved')} className="rounded-xl bg-wayyak-green px-3 py-2 text-xs font-black text-white">Approve campus use</button><button onClick={() => updateSpace(space.id, 'changes_requested')} className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-black text-amber-800">Request compliance fix</button></div></article>)}</div>
          </div> : null}

          <p className="mt-5 rounded-2xl bg-wayyak-mint p-4 text-sm font-bold text-wayyak-green">{message}</p>
        </section>}
      </section>
    </main>
  )
}
