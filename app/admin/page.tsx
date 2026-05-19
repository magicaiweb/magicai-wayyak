'use client'

import { FormEvent, useState } from 'react'

type PortalRole = 'owner' | 'admin' | 'ksu_admin'
type Step = 'login' | 'otp' | 'inside'

const roles: { id: PortalRole; label: string; note: string }[] = [
  { id: 'owner', label: 'Owner Portal', note: 'Create and manage spaces' },
  { id: 'admin', label: 'Admin Portal', note: 'Review spaces and bookings' },
  { id: 'ksu_admin', label: 'KSU Admin', note: 'Campus-level approvals' },
]

const MOCK_OTP = '123456'
const phonePattern = /^\+9665\d{8}$/
const ksuEmailPattern = /^[^\s@]+@ksu\.edu\.sa$/i

export default function AdminPortal() {
  const [role, setRole] = useState<PortalRole>('admin')
  const [phone, setPhone] = useState('+966512345678')
  const [email, setEmail] = useState('admin@ksu.edu.sa')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('login')
  const [message, setMessage] = useState('Secure internal portal mock. Use OTP 123456 for this preview.')

  const selectedRole = roles.find((item) => item.id === role) ?? roles[1]

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
    setMessage(`Signed in to ${selectedRole.label}.`)
  }

  return (
    <main className="min-h-screen bg-[#07130D] px-4 py-6 font-arabic text-white sm:px-6 lg:px-8" dir="rtl">
      <section className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
          <div>
            <p className="font-english text-xs font-black uppercase tracking-[0.32em] text-wayyak-gold" dir="ltr">WAYYAK ADMIN PORTAL</p>
            <h1 className="mt-1 text-2xl font-black">بوابة الإدارة الداخلية</h1>
          </div>
          <a href="../" className="rounded-full border border-white/15 px-4 py-2 font-english text-xs font-black uppercase tracking-[0.18em] text-white/70" dir="ltr">User Site</a>
        </nav>

        <div className="grid items-stretch gap-6 py-10 lg:grid-cols-[.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-wayyak-gold/25 bg-[#0D2417] p-6 shadow-2xl">
            <p className="font-english text-xs font-black uppercase tracking-[0.28em] text-wayyak-gold" dir="ltr">Not customer-facing</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">هذه ليست صفحة المستخدم</h2>
            <p className="mt-4 leading-8 text-white/65">هذه بوابة منفصلة للمالك والأدمن فقط. الهوية داكنة، اللغة إدارية، والرابط منفصل عن تجربة الحجز العامة.</p>
            <div className="mt-8 grid gap-3">
              {roles.map((item) => (
                <button key={item.id} type="button" onClick={() => setRole(item.id)} className={`rounded-2xl border p-4 text-right transition ${role === item.id ? 'border-wayyak-gold bg-wayyak-gold text-[#07130D]' : 'border-white/10 bg-white/5 text-white'}`}>
                  <span className="font-english text-sm font-black" dir="ltr">{item.label}</span>
                  <span className="mt-1 block text-sm opacity-70">{item.note}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[2rem] bg-white p-6 text-wayyak-deep shadow-2xl lg:p-8">
            <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-green" dir="ltr">Admin authentication</p>
            <h2 className="mt-3 text-3xl font-black">تسجيل دخول الإدارة</h2>
            <p className="mt-2 font-english text-sm font-bold text-wayyak-deep/45" dir="ltr">Selected: {selectedRole.label} · {selectedRole.note}</p>

            {step !== 'inside' ? (
              <form onSubmit={start} className="mt-6 grid gap-4">
                <label className="text-sm font-bold">رقم الجوال<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 font-english" dir="ltr" /></label>
                <label className="text-sm font-bold">البريد الإداري<input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 font-english" dir="ltr" /></label>
                {step === 'otp' ? <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 text-center font-english" dir="ltr" /><button type="button" onClick={verify} className="rounded-2xl bg-wayyak-gold px-7 py-4 font-black text-wayyak-deep">Verify</button></div> : <button className="rounded-2xl bg-wayyak-green px-7 py-4 font-black text-white">Send Admin OTP</button>}
              </form>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {['Pending space approvals', 'Owner listings', 'Manual payment queue', 'Internal notifications'].map((item) => <div key={item} className="rounded-2xl bg-wayyak-sand p-5 font-black text-wayyak-green">{item}</div>)}
              </div>
            )}

            <p className="mt-6 rounded-2xl bg-wayyak-mint p-4 text-sm font-bold text-wayyak-green">{message}</p>
          </section>
        </div>
      </section>
    </main>
  )
}
