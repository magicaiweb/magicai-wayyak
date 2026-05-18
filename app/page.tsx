'use client'

import { FormEvent, useMemo, useState } from 'react'

type Role = 'seeker' | 'owner' | 'admin' | 'ksu_admin'
type AuthStep = 'phone' | 'otp' | 'signed_in'

type Space = {
  id: string
  category: string
  title: string
  en: string
  type: string
  price: string
  capacity: string
  tone: string
  location: string
  amenities: string[]
  availability: string
  owner: string
  approval: 'approved' | 'pending'
}

type Booking = {
  id: string
  spaceTitle: string
  slot: string
  hours: number
  total: number
  status: 'payment_pending'
  userPhone: string
}

const MOCK_OTP = '123456'
const saudiPhonePattern = /^\+9665\d{8}$/
const ksuEmailPattern = /^[^\s@]+@ksu\.edu\.sa$/i

const roles: { id: Role; label: string; description: string }[] = [
  { id: 'seeker', label: 'باحث', description: 'يحجز المساحات' },
  { id: 'owner', label: 'مالك', description: 'يرسل مساحات للأدمن' },
  { id: 'admin', label: 'أدمن', description: 'يراجع الموافقات' },
  { id: 'ksu_admin', label: 'KSU Admin', description: 'يتطلب بريد KSU' },
]

const categories = [
  { id: 'all', ar: 'الكل', en: 'All' },
  { id: 'office', ar: 'مكاتب', en: 'Office' },
  { id: 'meeting', ar: 'اجتماعات', en: 'Boardroom' },
  { id: 'restaurant', ar: 'مطاعم', en: 'Restaurant' },
  { id: 'studio', ar: 'استوديو', en: 'Studio' },
  { id: 'event', ar: 'فعاليات', en: 'Event Hall' },
]

const initialSpaces: Space[] = [
  { id: 'incubation-boardroom', category: 'meeting', title: 'قاعة اجتماعات الحاضنة', en: 'Incubation Boardroom', type: 'قاعة اجتماعات', price: '120', capacity: '12', tone: 'from-[#1B6B3A] to-[#2F8D55]', location: 'مركز حاضنة الأعمال - جامعة الملك سعود', amenities: ['WiFi', 'Projector', 'Parking', 'Prayer room'], availability: 'اليوم 09:00–15:00', owner: 'KSU Incubation Centre', approval: 'approved' },
  { id: 'ksu-training-room', category: 'event', title: 'قاعة تدريب KSU', en: 'KSU Training Room', type: 'قاعة تدريب', price: '180', capacity: '30', tone: 'from-[#123621] to-[#1B6B3A]', location: 'مبنى ريادة الأعمال - جامعة الملك سعود', amenities: ['WiFi', 'Screens', 'Flexible seating', 'Coffee setup'], availability: 'الأحد–الخميس 10:00–16:00', owner: 'KSU Facilities', approval: 'approved' },
  { id: 'campus-content-studio', category: 'studio', title: 'استوديو محتوى جامعي', en: 'Campus Content Studio', type: 'استوديو', price: '90', capacity: '6', tone: 'from-[#2B5E49] to-[#F5A623]', location: 'منطقة الإعلام الطلابي - جامعة الملك سعود', amenities: ['Lighting', 'Backdrop', 'WiFi', 'Quiet zone'], availability: 'غداً 11:00–17:00', owner: 'KSU Media Lab', approval: 'approved' },
]

const slots = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00']

const Logo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 shrink-0" aria-label="WAYYAK logo">
    <rect x="10" y="18" width="80" height="64" rx="18" fill="#1B6B3A" />
    <path d="M29 36h42M29 51h42M29 66h24" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    <circle cx="72" cy="66" r="7" fill="#F5A623" />
  </svg>
)

export default function Home() {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces)
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('جامعة الملك سعود، الرياض')
  const [selectedSpaceId, setSelectedSpaceId] = useState(initialSpaces[0].id)
  const [selectedSlot, setSelectedSlot] = useState(slots[0])
  const [hours, setHours] = useState(1)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [message, setMessage] = useState('Phase 2 Auth + Phase 3 MVP: mock OTP جاهز، والأزرار الظاهرة تعمل كتجربة داخل المتصفح.')
  const [ownerForm, setOwnerForm] = useState({ title: '', type: 'قاعة اجتماعات', category: 'meeting', price: '150', capacity: '10' })
  const [role, setRole] = useState<Role>('seeker')
  const [phone, setPhone] = useState('+9665')
  const [email, setEmail] = useState('student@ksu.edu.sa')
  const [otp, setOtp] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>('phone')
  const [authError, setAuthError] = useState('')

  const signedIn = authStep === 'signed_in'
  const isAdminRole = role === 'admin' || role === 'ksu_admin'
  const approvedSpaces = useMemo(() => spaces.filter((space) => space.approval === 'approved'), [spaces])
  const pendingSpaces = useMemo(() => spaces.filter((space) => space.approval === 'pending'), [spaces])
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSpaces = useMemo(() => approvedSpaces.filter((space) => {
    const matchesCategory = activeCategory === 'all' || space.category === activeCategory
    const matchesQuery = !normalizedQuery || [space.title, space.en, space.type, space.location, space.owner].join(' ').toLowerCase().includes(normalizedQuery) || normalizedQuery.includes('ksu') || normalizedQuery.includes('جامعة') || normalizedQuery.includes('الرياض')
    return matchesCategory && matchesQuery
  }), [activeCategory, approvedSpaces, normalizedQuery])
  const selectedSpace = approvedSpaces.find((space) => space.id === selectedSpaceId) ?? visibleSpaces[0] ?? approvedSpaces[0]
  const bookingTotal = selectedSpace ? Number(selectedSpace.price) * hours : 0

  const roleLabel = roles.find((item) => item.id === role)?.label ?? role

  const startAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError('')
    if (!saudiPhonePattern.test(phone)) {
      setAuthError('رقم الجوال يجب أن يكون بصيغة سعودية صحيحة: +9665XXXXXXXX')
      return
    }
    if (role === 'ksu_admin' && !ksuEmailPattern.test(email)) {
      setAuthError('حساب KSU Admin يتطلب بريد @ksu.edu.sa')
      return
    }
    setAuthStep('otp')
    setMessage(`تم إنشاء OTP تجريبي للدور ${roleLabel}. استخدم الكود ${MOCK_OTP}.`)
  }

  const verifyOtp = () => {
    if (otp !== MOCK_OTP) {
      setAuthError(`OTP غير صحيح. كود التطوير هو ${MOCK_OTP}.`)
      return
    }
    setAuthError('')
    setAuthStep('signed_in')
    setMessage(`تم تسجيل الدخول كتجربة: ${roleLabel}. الهاتف مؤكد، وبريد KSU ${ksuEmailPattern.test(email) ? 'مؤكد' : 'غير مطلوب لهذا الدور'}.`)
  }

  const resetAuth = () => {
    setAuthStep('phone')
    setOtp('')
    setAuthError('')
    setMessage('تم تسجيل الخروج من جلسة التطوير.')
  }

  const focusSpaces = () => {
    setActiveCategory('all')
    setSelectedSpaceId(approvedSpaces[0]?.id ?? initialSpaces[0].id)
    setMessage(`تم البحث عن: ${query || 'كل المساحات'}. النتائج المعروضة مفلترة حسب الموقع/الكلمة.`)
    document.getElementById('spaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const applyCategory = (categoryId: string) => {
    const nextSpaces = approvedSpaces.filter((space) => categoryId === 'all' || space.category === categoryId)
    setActiveCategory(categoryId)
    if (nextSpaces[0]) setSelectedSpaceId(nextSpaces[0].id)
    setMessage(nextSpaces.length ? `تم تطبيق الفلتر: ${categories.find((c) => c.id === categoryId)?.ar}` : 'لا توجد مساحة معتمدة ضمن هذا التصنيف حالياً.')
    document.getElementById('spaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const createBooking = () => {
    if (!selectedSpace) return
    if (!signedIn) {
      setMessage('ابدأ بتسجيل الدخول عبر mock OTP قبل إرسال طلب الحجز.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const booking: Booking = { id: `WY-${bookings.length + 1001}`, spaceTitle: selectedSpace.title, slot: selectedSlot, hours, total: bookingTotal, status: 'payment_pending', userPhone: phone }
    setBookings((current) => [booking, ...current])
    setMessage(`تم إنشاء طلب ${booking.id}: ${selectedSpace.title}. الحالة: manual payment pending + internal notification log placeholder.`)
    document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const submitOwnerSpace = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!signedIn || role === 'seeker') {
      setMessage('إضافة المساحات متاحة بعد تسجيل الدخول كمالك أو أدمن.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const title = ownerForm.title.trim() || 'مساحة جديدة من المالك'
    const newSpace: Space = { id: `owner-${Date.now()}`, category: ownerForm.category, title, en: 'Owner submitted space', type: ownerForm.type, price: ownerForm.price, capacity: ownerForm.capacity, tone: 'from-[#1B6B3A] to-[#F5A623]', location: 'الرياض · موقع تجريبي من المالك', amenities: ['WiFi', 'Owner managed', 'Manual review'], availability: 'بانتظار تحديد جدول التوفر', owner: signedIn ? roleLabel : 'Demo Owner', approval: 'pending' }
    setSpaces((current) => [newSpace, ...current])
    setOwnerForm({ title: '', type: 'قاعة اجتماعات', category: 'meeting', price: '150', capacity: '10' })
    setMessage(`تم إرسال ${title} إلى قائمة موافقة الأدمن.`)
    document.getElementById('admin')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const approveSpace = (spaceId: string) => {
    if (!signedIn || !isAdminRole) {
      setMessage('موافقة الأدمن تتطلب تسجيل الدخول كـ admin أو ksu_admin.')
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setSpaces((current) => current.map((space) => space.id === spaceId ? { ...space, approval: 'approved' } : space))
    setSelectedSpaceId(spaceId)
    setActiveCategory('all')
    setMessage('تمت موافقة الأدمن: المساحة أصبحت ظاهرة في السوق الآن.')
    document.getElementById('spaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden font-arabic text-wayyak-deep">
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <nav className="sticky top-3 z-20 flex items-center justify-between rounded-[1.4rem] border border-white/70 bg-white/95 px-3 py-3 shadow-soft backdrop-blur md:rounded-[1.75rem] md:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3"><Logo /><div className="min-w-0 leading-tight"><p className="truncate text-lg font-black tracking-tight text-wayyak-green sm:text-xl">وياك</p><p className="font-english text-[11px] font-bold uppercase tracking-[0.22em] text-wayyak-deep/50">WAYYAK</p></div></div>
          <div className="hidden rounded-full border border-wayyak-green/10 bg-wayyak-sand p-1 text-sm font-black text-wayyak-green sm:flex" dir="ltr" aria-label="Language toggle coming soon"><span className="rounded-full bg-wayyak-green px-4 py-2 text-white shadow-sm">AR</span><span className="px-4 py-2 text-wayyak-green/35">EN soon</span></div>
          <button type="button" onClick={focusSpaces} className="shrink-0 rounded-full bg-wayyak-green px-4 py-3 text-sm font-black text-white shadow-lg shadow-wayyak-green/20 md:px-6">استكشف</button>
        </nav>

        <div className="mt-5 rounded-[1.5rem] border border-wayyak-gold/35 bg-white/90 p-4 text-sm font-bold leading-7 text-wayyak-deep shadow-sm"><span className="text-wayyak-green">Phase 2 + MVP:</span> المصادقة تعمل كـ mock OTP، الأدوار ظاهرة، KSU email يتحقق، والحجز/الدفع يبقى manual pending داخلياً حتى مفاتيح Moyasar/Unifonic.</div>

        <div className="grid min-w-0 items-center gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.85fr)] lg:gap-10 lg:py-14">
          <div className="min-w-0 text-center lg:text-right">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-wayyak-green/10 bg-white px-3 py-2 text-xs font-black text-wayyak-green shadow-sm lg:mx-0"><span className="h-2 w-2 rounded-full bg-wayyak-gold" />Phase 2 Auth · Phase 3 Marketplace MVP</div>
            <h1 className="mx-auto max-w-4xl text-[2.45rem] font-black leading-[1.12] tracking-tight text-wayyak-deep sm:text-6xl lg:mx-0 lg:text-6xl xl:text-7xl">احجز مساحة بعد تسجيل دخول سعودي تجريبي</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-wayyak-deep/70 sm:text-lg lg:mx-0">التجربة الآن تربط mock OTP، الأدوار، التحقق من بريد KSU، الفلاتر، التفاصيل، طلب الحجز، إرسال مساحة من المالك، وموافقة الأدمن.</p>

            <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 rounded-[2rem] border border-wayyak-green/10 bg-white p-3 shadow-card lg:mx-0" dir="rtl">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><label className="rounded-2xl bg-wayyak-sand px-5 py-4 text-right"><span className="text-xs font-bold text-wayyak-deep/45">بحث / موقع</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 w-full bg-transparent font-black text-wayyak-deep outline-none" /></label><button type="button" onClick={focusSpaces} className="rounded-2xl bg-wayyak-gold px-7 py-4 text-center font-black text-wayyak-deep transition hover:scale-[1.01]">ابحث الآن</button></div>
              <p className="px-2 pb-1 text-right text-xs font-bold text-wayyak-green">{message}</p>
            </div>

            <div className="mt-7 flex max-w-full flex-wrap justify-center gap-2 overflow-visible pb-2 lg:justify-start" aria-label="Space category filters">
              {categories.map((category) => {
                const isActive = activeCategory === category.id
                return <button key={category.id} type="button" onClick={() => applyCategory(category.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black shadow-sm transition ${isActive ? 'border-wayyak-green bg-wayyak-green text-white' : 'border-wayyak-green/10 bg-white text-wayyak-green hover:border-wayyak-green/30'}`}>{category.ar} <bdi className={`${isActive ? 'text-white/70' : 'text-wayyak-deep/35'} font-english`} dir="ltr">/ {category.en}</bdi></button>
              })}
            </div>
          </div>

          {selectedSpace ? <div className="relative mx-auto w-full max-w-[27rem] min-w-0 lg:max-w-[30rem]"><div className="rounded-[2.2rem] border border-white bg-white p-3 shadow-soft"><div className="overflow-hidden rounded-[1.8rem] bg-wayyak-deep text-white"><div className="bg-gradient-to-br from-wayyak-green via-[#237747] to-wayyak-deep p-5"><p className="font-english text-xs font-bold uppercase tracking-[0.2em] text-white/55" dir="ltr">Selected space</p><div className="mt-2 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">{selectedSpace.title}</h2><p className="mt-2 text-sm leading-6 text-white/70">{selectedSpace.availability} · {selectedSpace.capacity} شخص</p></div><div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur"><p className="font-english text-2xl font-black" dir="ltr">{selectedSpace.price}</p><p className="text-[10px] font-bold text-white/65">ر.س/ساعة</p></div></div><div className="mt-8 grid grid-cols-3 gap-2" dir="ltr">{slots.map((slot) => <button key={slot} type="button" onClick={() => { setSelectedSlot(slot); setMessage(`تم اختيار وقت ${slot}. يمكنك الآن إرسال طلب الحجز بعد mock OTP.`) }} className={`rounded-2xl px-2 py-3 text-center font-english text-sm font-black ${selectedSlot === slot ? 'bg-wayyak-gold text-wayyak-deep' : 'bg-white text-wayyak-green'}`}>{slot}</button>)}</div></div><div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/10 border-t border-white/10 bg-white/5 text-center">{selectedSpace.amenities.slice(0, 3).map((item) => <div key={item} className="px-2 py-4 font-english text-xs font-bold text-white/75" dir="ltr">{item}</div>)}</div></div></div></div> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[approvedSpaces.length, 'مساحات معتمدة'], [pendingSpaces.length, 'بانتظار الأدمن'], [bookings.length, 'طلبات حجز'], [signedIn ? roleLabel : 'Mock OTP', 'حالة الدخول']].map(([value, label]) => <div key={label} className="rounded-[1.6rem] border border-wayyak-green/10 bg-white p-5 shadow-card"><p className="font-english text-3xl font-black text-wayyak-gold" dir="ltr">{value}</p><p className="mt-1 font-black text-wayyak-green">{label}</p></div>)}</div>
      </section>

      <section id="auth" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-[2rem] bg-white p-5 shadow-card md:grid-cols-[.9fr_1.1fr] md:p-7">
          <div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Phase 2 Auth foundation</p><h2 className="mt-2 text-3xl font-black">تسجيل دخول Mock OTP</h2><p className="mt-3 leading-8 text-wayyak-deep/65">يدعم الأدوار seeker / owner / admin / ksu_admin، يتحقق من رقم +966، ويتحقق من بريد @ksu.edu.sa لدور KSU Admin. كود التطوير: <bdi dir="ltr" className="font-english font-black text-wayyak-green">123456</bdi></p></div>
          <form onSubmit={startAuth} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold">الدور<select value={role} disabled={signedIn} onChange={(event) => setRole(event.target.value as Role)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3">{roles.map((item) => <option key={item.id} value={item.id}>{item.label} — {item.description}</option>)}</select></label>
            <label className="text-sm font-bold">رقم الجوال<input value={phone} disabled={signedIn} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label>
            <label className="text-sm font-bold sm:col-span-2">KSU Email<input value={email} disabled={signedIn} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label>
            {authStep === 'phone' ? <button className="rounded-2xl bg-wayyak-green px-4 py-3 font-black text-white sm:col-span-2">إرسال OTP تجريبي</button> : null}
            {authStep === 'otp' ? <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[1fr_auto]"><input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 text-center font-english" dir="ltr" /><button type="button" onClick={verifyOtp} className="rounded-2xl bg-wayyak-gold px-6 py-3 font-black text-wayyak-deep">تحقق ودخول</button></div> : null}
            {signedIn ? <button type="button" onClick={resetAuth} className="rounded-2xl bg-wayyak-deep px-4 py-3 font-black text-white sm:col-span-2">تسجيل خروج / تغيير الدور</button> : null}
            {authError ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-2">{authError}</p> : null}
            <p className="rounded-2xl bg-wayyak-mint p-3 text-sm font-bold text-wayyak-green sm:col-span-2">الحالة: {signedIn ? `داخل كـ ${roleLabel}` : authStep === 'otp' ? 'OTP مرسل تجريبياً' : 'بانتظار رقم سعودي صحيح'}</p>
          </form>
        </div>
      </section>

      <section id="spaces" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Marketplace listings</p><h2 className="mt-2 text-3xl font-black tracking-tight text-wayyak-deep md:text-4xl">مساحات معتمدة للحجز التجريبي</h2></div><p className="max-w-md text-sm leading-6 text-wayyak-deep/60">الفلاتر والبحث والتفاصيل وطلب الحجز تعمل. الدفع يبقى manual pending.</p></div>
        <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-wayyak-green shadow-sm">التصنيف الحالي: {categories.find((category) => category.id === activeCategory)?.ar} · النتائج: {visibleSpaces.length}</div>
        <div className="grid gap-5 md:grid-cols-3">{visibleSpaces.map((space) => <article key={space.id} className={`group overflow-hidden rounded-[2rem] border bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft ${selectedSpaceId === space.id ? 'border-wayyak-green ring-2 ring-wayyak-green/10' : 'border-wayyak-green/10'}`}><div className={`relative h-48 bg-gradient-to-br ${space.tone}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.30),transparent_14rem)]" /><div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-wayyak-green backdrop-blur">{space.type}</div></div><div className="p-5"><p className="font-english text-xs font-black uppercase tracking-[0.18em] text-wayyak-deep/40" dir="ltr">{space.owner}</p><h3 className="mt-2 text-2xl font-black text-wayyak-deep">{space.title}</h3><div className="mt-5 flex items-center justify-between rounded-2xl bg-wayyak-sand px-4 py-3"><div><p className="text-xs font-bold text-wayyak-deep/45">السعر</p><p className="font-english text-xl font-black text-wayyak-green" dir="ltr">{space.price} SAR/hr</p></div><div className="text-left"><p className="text-xs font-bold text-wayyak-deep/45">السعة</p><p className="font-english text-xl font-black text-wayyak-green" dir="ltr">{space.capacity}</p></div></div><button type="button" onClick={() => { setSelectedSpaceId(space.id); setMessage(`تم فتح تفاصيل ${space.title}`); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="mt-4 w-full rounded-2xl bg-wayyak-green px-4 py-3 font-black text-white transition hover:bg-wayyak-deep">عرض التفاصيل</button></div></article>)}</div>
        {!visibleSpaces.length ? <p className="mt-4 rounded-2xl bg-white p-5 text-sm font-bold text-wayyak-deep/60 shadow-sm">لا توجد نتائج لهذا البحث. جرّب “جامعة الملك سعود” أو اختر “الكل”.</p> : null}
        {selectedSpace ? <div id="details" className="mt-6 scroll-mt-24 rounded-[2rem] border border-wayyak-green/10 bg-white p-5 shadow-card md:p-7"><div className="grid gap-6 lg:grid-cols-[1fr_.8fr]"><div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Listing details</p><h3 className="mt-2 text-3xl font-black text-wayyak-deep">{selectedSpace.title}</h3><p className="mt-4 leading-8 text-wayyak-deep/70">{selectedSpace.location} · {selectedSpace.availability}. المالك: {selectedSpace.owner}</p><div className="mt-4 flex flex-wrap gap-2">{selectedSpace.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-wayyak-mint px-3 py-2 font-english text-xs font-bold text-wayyak-green" dir="ltr">{amenity}</span>)}</div></div><div className="rounded-[1.5rem] bg-wayyak-sand p-5"><p className="text-sm font-bold text-wayyak-deep/50">طلب حجز</p><div className="mt-3 grid grid-cols-2 gap-3"><label className="rounded-2xl bg-white p-3 text-sm font-bold">الوقت<select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)} className="mt-2 w-full rounded-xl border border-wayyak-green/10 p-2 font-english" dir="ltr">{slots.map((slot) => <option key={slot}>{slot}</option>)}</select></label><label className="rounded-2xl bg-white p-3 text-sm font-bold">الساعات<input type="number" min="1" max="8" value={hours} onChange={(event) => setHours(Math.max(1, Number(event.target.value)))} className="mt-2 w-full rounded-xl border border-wayyak-green/10 p-2 font-english" dir="ltr" /></label></div><div className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-wayyak-deep/75">الإجمالي: <bdi dir="ltr" className="font-english text-xl text-wayyak-green">{bookingTotal} SAR</bdi><br />الحالة بعد الإرسال: manual payment pending</div><button type="button" onClick={createBooking} className="mt-5 w-full rounded-2xl bg-wayyak-gold px-4 py-3 font-black text-wayyak-deep">{signedIn ? 'إرسال طلب حجز' : 'سجّل دخول mock OTP لإرسال الحجز'}</button></div></div></div> : null}
      </section>

      <section id="bookings" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8"><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-[2rem] bg-white p-5 shadow-card md:p-7"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Booking requests</p><h2 className="mt-2 text-3xl font-black">طلبات الحجز</h2><div className="mt-5 space-y-3">{bookings.length ? bookings.map((booking) => <div key={booking.id} className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 text-sm font-bold leading-7"><bdi dir="ltr" className="font-english text-wayyak-green">{booking.id}</bdi> · {booking.spaceTitle}<br />{booking.slot} · {booking.hours} ساعة · <bdi dir="ltr">{booking.total} SAR</bdi><br />الحالة: دفع يدوي بانتظار التأكيد · <bdi dir="ltr">{booking.userPhone}</bdi></div>) : <p className="rounded-2xl bg-wayyak-sand p-4 text-sm font-bold text-wayyak-deep/60">لا توجد طلبات بعد. سجّل دخول ثم أرسل طلب حجز من تفاصيل المساحة.</p>}</div></div>
          <form onSubmit={submitOwnerSpace} className="rounded-[2rem] bg-white p-5 shadow-card md:p-7"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Owner flow</p><h2 className="mt-2 text-3xl font-black">إضافة مساحة كمالك</h2><p className="mt-2 text-sm font-bold text-wayyak-deep/55">يعمل بعد الدخول كـ owner/admin/ksu_admin. الباحث لا يضيف مساحات.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">اسم المساحة<input value={ownerForm.title} onChange={(event) => setOwnerForm({ ...ownerForm, title: event.target.value })} placeholder="مثلاً: مكتب خاص في KSU" className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3" /></label><label className="text-sm font-bold">التصنيف<select value={ownerForm.category} onChange={(event) => setOwnerForm({ ...ownerForm, category: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3">{categories.filter((category) => category.id !== 'all').map((category) => <option key={category.id} value={category.id}>{category.ar}</option>)}</select></label><label className="text-sm font-bold">النوع<input value={ownerForm.type} onChange={(event) => setOwnerForm({ ...ownerForm, type: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3" /></label><label className="text-sm font-bold">السعر/ساعة<input value={ownerForm.price} onChange={(event) => setOwnerForm({ ...ownerForm, price: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold">السعة<input value={ownerForm.capacity} onChange={(event) => setOwnerForm({ ...ownerForm, capacity: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label></div><button className="mt-5 w-full rounded-2xl bg-wayyak-green px-4 py-3 font-black text-white">إرسال للأدمن</button></form></div></section>

      <section id="admin" className="mx-auto w-full max-w-7xl overflow-hidden px-4 pb-14 sm:px-6 lg:px-8"><div className="rounded-[2rem] bg-wayyak-deep p-5 text-white shadow-soft md:p-8"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Admin approval queue</p><h2 className="mt-3 text-3xl font-black">قائمة موافقة الأدمن</h2><p className="mt-2 text-sm font-bold text-white/60">النشر يعمل فقط عند دخول admin أو ksu_admin.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{pendingSpaces.length ? pendingSpaces.map((space) => <div key={space.id} className="rounded-2xl bg-white/10 p-4"><h3 className="text-xl font-black">{space.title}</h3><p className="mt-2 text-sm text-white/65">{space.type} · {space.price} SAR/hr · {space.capacity} شخص</p><button type="button" onClick={() => approveSpace(space.id)} className="mt-4 rounded-2xl bg-wayyak-gold px-5 py-3 font-black text-wayyak-deep">موافقة ونشر</button></div>) : <p className="rounded-2xl bg-white/10 p-4 text-white/70">لا توجد مساحات بانتظار الموافقة. جرّب إرسال مساحة من فورم المالك.</p>}</div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{['Auth: mock OTP + roles', 'Validation: +966 phone', 'KSU: @ksu.edu.sa check', 'Placeholders: manual payment + internal logs'].map((item) => <div key={item} className="rounded-2xl bg-white/10 p-4 font-english text-sm font-bold text-white/80" dir="ltr">{item}</div>)}</div></div></section>
    </main>
  )
}
