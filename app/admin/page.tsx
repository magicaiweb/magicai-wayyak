'use client'

import { FormEvent, useMemo, useState } from 'react'

type PortalRole = 'owner' | 'admin' | 'ksu_admin'
type Step = 'login' | 'otp' | 'inside'
type SpaceStatus = 'awaiting_approval' | 'approved' | 'changes_requested'
type PaymentStatus = 'paid' | 'manual_pending' | 'refund_review'

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

const initialBookings = [
  { id: 'BK-2208', guest: '+966512345678', space: 'قاعة اجتماعات الحاضنة', slot: 'Today 11:00', payment: 'manual_pending' as PaymentStatus, total: '120 SAR', task: 'Confirm transfer receipt' },
  { id: 'BK-2207', guest: '+966599440011', space: 'استوديو محتوى جامعي', slot: 'Tomorrow 13:00', payment: 'paid' as PaymentStatus, total: '180 SAR', task: 'Ready for owner confirmation' },
  { id: 'BK-2202', guest: '+966588771122', space: 'قاعة تدريب KSU', slot: 'May 21 10:00', payment: 'refund_review' as PaymentStatus, total: '360 SAR', task: 'Refund policy check' },
]

const statusLabel: Record<SpaceStatus, string> = { awaiting_approval: 'Awaiting approval', approved: 'Approved', changes_requested: 'Changes requested' }
const paymentLabel: Record<PaymentStatus, string> = { paid: 'Paid', manual_pending: 'Manual pending', refund_review: 'Refund review' }

export default function AdminPortal() {
  const [role, setRole] = useState<PortalRole>('admin')
  const [phone, setPhone] = useState('+966512345678')
  const [email, setEmail] = useState('admin@ksu.edu.sa')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('login')
  const [message, setMessage] = useState('Secure internal portal mock. Use OTP 123456 for this preview.')
  const [spaces, setSpaces] = useState(initialSpaces)
  const [bookings, setBookings] = useState(initialBookings)

  const selectedRole = roles.find((item) => item.id === role) ?? roles[1]
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
    setMessage(`Signed in to ${selectedRole.label}. Dashboard ready.`)
  }

  const updateSpace = (id: string, status: SpaceStatus) => {
    setSpaces((current) => current.map((item) => item.id === id ? { ...item, status, risk: status === 'approved' ? 'Published' : 'Owner action required' } : item))
    setMessage(`${id} moved to ${statusLabel[status]}.`)
  }

  const updatePayment = (id: string, payment: PaymentStatus) => {
    setBookings((current) => current.map((item) => item.id === id ? { ...item, payment, task: payment === 'paid' ? 'Ready for owner confirmation' : item.task } : item))
    setMessage(`${id} marked as ${paymentLabel[payment]}.`)
  }

  return (
    <main className="min-h-screen bg-[#07130D] px-4 py-6 font-arabic text-white sm:px-6 lg:px-8" dir="rtl">
      <section className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
          <div>
            <p className="font-english text-xs font-black uppercase tracking-[0.32em] text-wayyak-gold" dir="ltr">WAYYAK ADMIN PORTAL</p>
            <h1 className="mt-1 text-2xl font-black">بوابة الإدارة الداخلية</h1>
          </div>
          <a href="../" className="rounded-full border border-white/15 px-4 py-2 font-english text-xs font-black uppercase tracking-[0.18em] text-white/70" dir="ltr">User Site</a>
        </nav>

        <div className="grid items-start gap-6 py-10 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[2rem] border border-wayyak-gold/25 bg-[#0D2417] p-6 shadow-2xl">
            <p className="font-english text-xs font-black uppercase tracking-[0.28em] text-wayyak-gold" dir="ltr">Internal operations</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">Dashboard, not a user page</h2>
            <p className="mt-4 leading-8 text-white/65">Admins should immediately see what needs action: approvals, paid bookings, manual payments, refunds, and owner items.</p>
            <div className="mt-8 grid gap-3">
              {roles.map((item) => (
                <button key={item.id} type="button" disabled={step === 'inside'} onClick={() => setRole(item.id)} className={`rounded-2xl border p-4 text-right transition disabled:cursor-not-allowed ${role === item.id ? 'border-wayyak-gold bg-wayyak-gold text-[#07130D]' : 'border-white/10 bg-white/5 text-white'}`}>
                  <span className="font-english text-sm font-black" dir="ltr">{item.label}</span>
                  <span className="mt-1 block text-sm opacity-70">{item.note}</span>
                </button>
              ))}
            </div>
            {step === 'inside' ? <button type="button" onClick={() => { setStep('login'); setOtp(''); setMessage('Signed out.') }} className="mt-5 w-full rounded-2xl bg-white/10 px-4 py-3 font-black text-white">Sign out</button> : null}
          </aside>

          <section className="rounded-[2rem] bg-white p-6 text-wayyak-deep shadow-2xl lg:p-8">
            <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-green" dir="ltr">Admin authentication</p>
            <h2 className="mt-3 text-3xl font-black">{step === 'inside' ? 'لوحة التحكم التشغيلية' : 'تسجيل دخول الإدارة'}</h2>
            <p className="mt-2 font-english text-sm font-bold text-wayyak-deep/45" dir="ltr">Selected: {selectedRole.label} · {selectedRole.note}</p>

            {step !== 'inside' ? (
              <form onSubmit={start} className="mt-6 grid gap-4">
                <label className="text-sm font-bold">رقم الجوال<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 font-english" dir="ltr" /></label>
                <label className="text-sm font-bold">البريد الإداري<input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 font-english" dir="ltr" /></label>
                {step === 'otp' ? <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 text-center font-english" dir="ltr" /><button type="button" onClick={verify} className="rounded-2xl bg-wayyak-gold px-7 py-4 font-black text-wayyak-deep">Verify</button></div> : <button className="rounded-2xl bg-wayyak-green px-7 py-4 font-black text-white">Send Admin OTP</button>}
              </form>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" dir="ltr">
                  {stats.map((item) => <div key={item.label} className={`rounded-2xl p-5 ${item.tone}`}><p className="font-english text-4xl font-black">{item.value}</p><p className="mt-1 font-english text-xs font-black uppercase tracking-[0.12em]">{item.label}</p></div>)}
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-wayyak-green/10 bg-wayyak-sand p-4">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black">Awaiting space approval</h3><span className="rounded-full bg-white px-3 py-1 font-english text-xs font-black text-wayyak-green" dir="ltr">Spaces</span></div>
                    <div className="mt-4 grid gap-3">
                      {spaces.map((space) => <article key={space.id} className="rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">{space.id} · {space.owner}</p><h4 className="mt-1 text-lg font-black">{space.title}</h4><p className="font-english text-xs font-bold text-wayyak-deep/45" dir="ltr">{space.price} · {space.submitted} · {space.risk}</p></div><span className="rounded-full bg-wayyak-mint px-3 py-1 font-english text-[11px] font-black text-wayyak-green" dir="ltr">{statusLabel[space.status]}</span></div><div className="mt-3 flex flex-wrap gap-2" dir="ltr"><button onClick={() => updateSpace(space.id, 'approved')} className="rounded-xl bg-wayyak-green px-3 py-2 text-xs font-black text-white">Approve</button><button onClick={() => updateSpace(space.id, 'changes_requested')} className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-black text-amber-800">Request changes</button></div></article>)}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-wayyak-green/10 bg-wayyak-sand p-4">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black">Payments & bookings queue</h3><span className="rounded-full bg-white px-3 py-1 font-english text-xs font-black text-wayyak-green" dir="ltr">Bookings</span></div>
                    <div className="mt-4 grid gap-3">
                      {bookings.map((booking) => <article key={booking.id} className="rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-english text-xs font-black text-wayyak-green" dir="ltr">{booking.id} · {booking.guest}</p><h4 className="mt-1 text-lg font-black">{booking.space}</h4><p className="font-english text-xs font-bold text-wayyak-deep/45" dir="ltr">{booking.slot} · {booking.total} · {booking.task}</p></div><span className="rounded-full bg-wayyak-mint px-3 py-1 font-english text-[11px] font-black text-wayyak-green" dir="ltr">{paymentLabel[booking.payment]}</span></div><div className="mt-3 flex flex-wrap gap-2" dir="ltr"><button onClick={() => updatePayment(booking.id, 'paid')} className="rounded-xl bg-wayyak-green px-3 py-2 text-xs font-black text-white">Mark paid</button><button onClick={() => updatePayment(booking.id, 'refund_review')} className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-black text-rose-800">Refund review</button></div></article>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-6 rounded-2xl bg-wayyak-mint p-4 text-sm font-bold text-wayyak-green">{message}</p>
          </section>
        </div>
      </section>
    </main>
  )
}
