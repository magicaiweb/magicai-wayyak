'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type Role = 'seeker' | 'owner' | 'admin' | 'ksu_admin'
type AuthStep = 'phone' | 'otp' | 'signed_in'
type SpaceStatus = 'draft' | 'pending' | 'approved' | 'rejected'

type ManagedSpace = {
  id: string
  status: SpaceStatus
  category: string
  type: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  addressAr: string
  addressEn: string
  city: string
  capacity: number
  hourlyHalalas: number
  dailyHalalas: number
  amenities: string[]
  photos: string[]
  owner: string
  ksuNotes: string
  tone: string
  rejectionReason?: string
}

type SpaceForm = Omit<ManagedSpace, 'id' | 'status' | 'owner' | 'tone' | 'rejectionReason'>

type Booking = { id: string; spaceTitle: string; slot: string; hours: number; totalHalalas: number; status: 'payment_pending'; userPhone: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

const categories = [
  { id: 'all', ar: 'الكل', en: 'All' },
  { id: 'office', ar: 'مكاتب', en: 'Office' },
  { id: 'boardroom', ar: 'اجتماعات', en: 'Boardroom' },
  { id: 'restaurant', ar: 'مطاعم', en: 'Restaurant' },
  { id: 'studio', ar: 'استوديو', en: 'Studio' },
  { id: 'event_hall', ar: 'فعاليات', en: 'Event Hall' },
  { id: 'training_room', ar: 'تدريب', en: 'Training' },
]

const amenityOptions = ['wifi', 'projector', 'whiteboard', 'parking', 'prayer_room', 'tv_screen', 'coffee_machine', 'video_conferencing']
const amenityLabels: Record<string, string> = { wifi: 'WiFi', projector: 'Projector', whiteboard: 'Whiteboard', parking: 'Parking', prayer_room: 'Prayer room', tv_screen: 'TV screen', coffee_machine: 'Coffee machine', video_conferencing: 'Video conferencing' }
const slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00']

const initialSpaces: ManagedSpace[] = [
  { id: 'incubation-boardroom', status: 'approved', category: 'boardroom', type: 'boardroom', titleAr: 'قاعة اجتماعات الحاضنة', titleEn: 'Incubation Boardroom', descriptionAr: 'قاعة اجتماعات مجهزة لاجتماعات الشركات الناشئة وورش العمل الصغيرة داخل حاضنة الأعمال.', descriptionEn: 'A fully equipped boardroom for startup meetings and small workshops inside the incubator.', addressAr: 'مركز حاضنة الأعمال - جامعة الملك سعود', addressEn: 'KSU Incubation Centre, Riyadh', city: 'الرياض', capacity: 12, hourlyHalalas: 12000, dailyHalalas: 72000, amenities: ['wifi', 'projector', 'parking', 'prayer_room'], photos: ['cover-ready', 'table-view', 'projector-wall'], owner: 'KSU Incubation Centre', ksuNotes: 'خصم 50% لطلاب جامعة الملك سعود. الدفع الحالي manual pending.', tone: 'from-[#1B6B3A] to-[#2F8D55]' },
  { id: 'ksu-training-room', status: 'approved', category: 'training_room', type: 'training_room', titleAr: 'قاعة تدريب KSU', titleEn: 'KSU Training Room', descriptionAr: 'مساحة تدريب مرنة مع شاشات وترتيب مقاعد قابل للتعديل للبرامج التعليمية.', descriptionEn: 'Flexible training room with screens and adjustable seating for learning programs.', addressAr: 'مبنى ريادة الأعمال - جامعة الملك سعود', addressEn: 'Entrepreneurship Building, KSU', city: 'الرياض', capacity: 30, hourlyHalalas: 18000, dailyHalalas: 98000, amenities: ['wifi', 'tv_screen', 'coffee_machine', 'whiteboard'], photos: ['training-cover', 'seating-layout'], owner: 'KSU Facilities', ksuNotes: 'مناسبة لورش العمل والفعاليات التعليمية. موافقة الأدمن مطلوبة لأي تعديل.', tone: 'from-[#123621] to-[#1B6B3A]' },
  { id: 'campus-content-studio', status: 'approved', category: 'studio', type: 'studio', titleAr: 'استوديو محتوى جامعي', titleEn: 'Campus Content Studio', descriptionAr: 'استوديو صغير للتصوير والبودكاست والمحتوى الطلابي مع إضاءة وخلفية جاهزة.', descriptionEn: 'Small studio for video, podcast and student content with ready lighting and backdrop.', addressAr: 'منطقة الإعلام الطلابي - جامعة الملك سعود', addressEn: 'Student Media Zone, KSU', city: 'الرياض', capacity: 6, hourlyHalalas: 9000, dailyHalalas: 52000, amenities: ['wifi', 'tv_screen', 'video_conferencing'], photos: ['studio-cover', 'lighting-placeholder'], owner: 'KSU Media Lab', ksuNotes: 'يتطلب الالتزام بسياسة استخدام الاستوديو. الحجز النهائي بعد تأكيد الدفع اليدوي.', tone: 'from-[#2B5E49] to-[#F5A623]' },
  { id: 'draft-demo-office', status: 'draft', category: 'office', type: 'office', titleAr: 'مكتب خاص قيد الإعداد', titleEn: 'Draft Private Office', descriptionAr: 'مثال لمساحة مسودة لا تظهر في السوق حتى يرسلها المالك للمراجعة.', descriptionEn: 'Draft owner space; hidden from marketplace until submitted.', addressAr: 'الرياض - موقع تجريبي', addressEn: 'Riyadh demo location', city: 'الرياض', capacity: 4, hourlyHalalas: 7000, dailyHalalas: 36000, amenities: ['wifi', 'whiteboard'], photos: ['upload-placeholder'], owner: 'Demo Owner', ksuNotes: 'Draft hidden from public listings.', tone: 'from-[#1B6B3A] to-[#F5A623]' },
]

const emptyForm: SpaceForm = { category: 'boardroom', type: 'boardroom', titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', addressAr: '', addressEn: '', city: 'الرياض', capacity: 10, hourlyHalalas: 15000, dailyHalalas: 75000, amenities: ['wifi', 'projector'], photos: ['upload-ready-placeholder'], ksuNotes: 'خصم الطلاب وملاحظات KSU تظهر هنا بعد المراجعة.' }
const formatSar = (halalas: number) => `${(halalas / 100).toLocaleString('en-US')} SAR`
const statusLabel: Record<SpaceStatus, string> = { draft: 'مسودة', pending: 'بانتظار الموافقة', approved: 'معتمد', rejected: 'مرفوض' }

async function readJson(response: Response) {
  const text = await response.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { error: 'خدمة OTP تحتاج backend runtime. المعاينة الحالية static فقط.' } }
}

const Logo = () => <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 shrink-0" aria-label="WAYYAK logo"><rect x="10" y="18" width="80" height="64" rx="18" fill="#1B6B3A" /><path d="M29 36h42M29 51h42M29 66h24" stroke="#fff" strokeWidth="7" strokeLinecap="round" /><circle cx="72" cy="66" r="7" fill="#F5A623" /></svg>

export default function Home() {
  const [spaces, setSpaces] = useState<ManagedSpace[]>(initialSpaces)
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('جامعة الملك سعود، الرياض')
  const [selectedSpaceId, setSelectedSpaceId] = useState(initialSpaces[0].id)
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState(slots[0])
  const [hours, setHours] = useState(1)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [message, setMessage] = useState('ابحث عن مساحة مناسبة، افتح التفاصيل، ثم أرسل طلب حجز تجريبي.')
  const [form, setForm] = useState<SpaceForm>(emptyForm)
  const [role, setRole] = useState<Role>('seeker')
  const phone = '+966512345678'
  const [email, setEmail] = useState('student@ksu.edu.sa')
  const [otp, setOtp] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>('phone')
  const [authError, setAuthError] = useState('')

  const signedIn = authStep === 'signed_in'
  const isAdminRole = role === 'admin' || role === 'ksu_admin'
  const approvedSpaces = useMemo(() => spaces.filter((space) => space.status === 'approved'), [spaces])
  const pendingSpaces = useMemo(() => spaces.filter((space) => space.status === 'pending'), [spaces])
  const ownerSpaces = useMemo(() => spaces.filter((space) => space.owner === 'Demo Owner' || space.id.startsWith('owner-') || space.status !== 'approved'), [spaces])
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSpaces = useMemo(() => approvedSpaces.filter((space) => {
    const matchesCategory = activeCategory === 'all' || space.category === activeCategory
    const haystack = [space.titleAr, space.titleEn, space.descriptionAr, space.descriptionEn, space.addressAr, space.addressEn, space.city, space.owner].join(' ').toLowerCase()
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery) || normalizedQuery.includes('ksu') || normalizedQuery.includes('جامعة') || normalizedQuery.includes('الرياض')
    return matchesCategory && matchesQuery
  }), [activeCategory, approvedSpaces, normalizedQuery])
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId) ?? visibleSpaces[0] ?? approvedSpaces[0]
  const bookingTotalHalalas = selectedSpace ? selectedSpace.hourlyHalalas * hours : 0

  const rotateSelectedSpace = useCallback((direction: 1 | -1) => {
    if (!approvedSpaces.length) return
    const currentIndex = approvedSpaces.findIndex((space) => space.id === selectedSpaceId)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + approvedSpaces.length) % approvedSpaces.length
    setSelectedSpaceId(approvedSpaces[nextIndex].id)
  }, [approvedSpaces, selectedSpaceId])

  useEffect(() => {
    if (approvedSpaces.length < 2) return
    const timer = window.setInterval(() => rotateSelectedSpace(1), 4500)
    return () => window.clearInterval(timer)
  }, [approvedSpaces.length, rotateSelectedSpace])

  const startAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthError('')
    if (!emailPattern.test(email)) return setAuthError('أدخل بريد إلكتروني صحيح لاستلام OTP')
    try {
      const response = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role: 'seeker' }) })
      const result = await readJson(response)
      if (!response.ok) throw new Error(result.error || 'تعذر إرسال OTP')
      setRole('seeker'); setAuthStep('otp'); setMessage('تم إرسال OTP إلى بريدك الإلكتروني. الكود صالح لمدة 10 دقائق.')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'خدمة البريد غير متاحة حالياً. تحتاج SMTP + backend runtime.')
    }
  }
  const verifyOtp = async () => {
    setAuthError('')
    try {
      const response = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role: 'seeker', code: otp }) })
      const result = await readJson(response)
      if (!response.ok) throw new Error(result.error || 'OTP غير صحيح')
      setRole(result.role || 'seeker'); setAuthStep('signed_in'); setMessage('تم الدخول بالبريد. يمكنك الآن إرسال طلب حجز.')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'تعذر التحقق من OTP')
    }
  }
  const resetAuth = () => { setAuthStep('phone'); setOtp(''); setAuthError(''); setMessage('تم تسجيل الخروج.') }
  const focusSpaces = () => { setMessage(`بحث السوق: ${query || 'كل المساحات'}`); document.getElementById('spaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const applyCategory = (categoryId: string) => { setActiveCategory(categoryId); const next = approvedSpaces.find((space) => categoryId === 'all' || space.category === categoryId); if (next) setSelectedSpaceId(next.id); setMessage(`تم تطبيق فلتر ${categories.find((c) => c.id === categoryId)?.ar}`); document.getElementById('spaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  const loadForEdit = (space: ManagedSpace) => {
    setEditingSpaceId(space.id)
    const { id: _id, status: _status, owner: _owner, tone: _tone, rejectionReason: _reason, ...editable } = space
    void _id; void _status; void _owner; void _tone; void _reason
    setForm(editable)
    setMessage(`تم تحميل ${space.titleAr} للتعديل.`)
    document.getElementById('owner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const saveOwnerSpace = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!signedIn || role === 'seeker') { setMessage('إدارة المساحات تتطلب دخول owner/admin/ksu_admin.'); document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    if (!form.titleAr.trim() || !form.titleEn.trim() || !form.addressAr.trim()) { setMessage('أدخل العنوان العربي/الإنجليزي والعنوان المكاني على الأقل.'); return }
    if (editingSpaceId) {
      setSpaces((current) => current.map((space) => space.id === editingSpaceId ? { ...space, ...form, status: space.status === 'approved' ? 'pending' : space.status, rejectionReason: undefined } : space))
      setSelectedSpaceId(editingSpaceId); setMessage('تم حفظ التعديل وإرساله للمراجعة إذا كان معتمداً سابقاً.')
    } else {
      const newSpace: ManagedSpace = { ...form, id: `owner-${Date.now()}`, status: 'draft', owner: 'Demo Owner', tone: 'from-[#1B6B3A] to-[#F5A623]' }
      setSpaces((current) => [newSpace, ...current]); setSelectedSpaceId(newSpace.id); setMessage('تم إنشاء مساحة كمسودة. أرسلها للموافقة من جدول المالك.')
    }
    setEditingSpaceId(null); setForm(emptyForm); document.getElementById('owner-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const updateStatus = (spaceId: string, status: SpaceStatus, rejectionReason?: string) => {
    setSpaces((current) => current.map((space) => space.id === spaceId ? { ...space, status, rejectionReason } : space))
    setMessage(status === 'approved' ? 'تمت الموافقة: المساحة ظهرت في السوق.' : status === 'rejected' ? 'تم رفض المساحة مع سبب واضح.' : 'تم تحديث حالة المساحة.')
  }
  const createBooking = () => {
    if (!selectedSpace) return
    if (!signedIn) { setMessage('سجّل دخول بالبريد قبل طلب الحجز.'); document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    const booking: Booking = { id: `WY-${bookings.length + 1001}`, spaceTitle: selectedSpace.titleAr, slot: selectedSlot, hours, totalHalalas: bookingTotalHalalas, status: 'payment_pending', userPhone: phone }
    setBookings((current) => [booking, ...current]); setMessage(`تم إنشاء طلب ${booking.id}: manual payment pending + internal log placeholder.`); document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden font-arabic text-wayyak-deep">
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <nav className="sticky top-3 z-20 flex items-center justify-between rounded-[1.4rem] border border-white/70 bg-white/95 px-3 py-3 shadow-soft backdrop-blur md:rounded-[1.75rem] md:px-5"><div className="flex min-w-0 items-center gap-2 sm:gap-3"><Logo /><div className="min-w-0 leading-tight"><p className="truncate text-lg font-black tracking-tight text-wayyak-green sm:text-xl">وياك</p><p className="font-english text-[11px] font-bold uppercase tracking-[0.22em] text-wayyak-deep/50">WAYYAK</p></div></div><div className="hidden rounded-full border border-wayyak-green/10 bg-wayyak-sand p-1 text-sm font-black text-wayyak-green sm:flex" dir="ltr"><span className="rounded-full bg-wayyak-green px-4 py-2 text-white shadow-sm">AR</span><span className="px-4 py-2 text-wayyak-green/35">EN soon</span></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={focusSpaces} className="rounded-full bg-wayyak-green px-4 py-3 text-sm font-black text-white shadow-lg shadow-wayyak-green/20 md:px-6">استكشف</button><a href="admin/" className="rounded-full border border-wayyak-green/15 bg-white px-3 py-3 text-xs font-black text-wayyak-green sm:px-4 sm:text-sm">Admin Portal</a></div></nav>
        <div className="mt-5 rounded-[1.5rem] border border-wayyak-gold/35 bg-white/90 p-4 text-sm font-bold leading-7 text-wayyak-deep shadow-sm"><span className="text-wayyak-green">واجهة المستخدم:</span> الصفحة الافتراضية للباحثين فقط: بحث، تفاصيل مساحة، وتدفق طلب حجز واضح. الإدارة لها بوابة منفصلة برابط وهوية مختلفة.</div>
        <div className="grid min-w-0 items-center gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.85fr)] lg:gap-10 lg:py-14">
          <div className="min-w-0 text-center lg:text-right"><div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-wayyak-green/10 bg-white px-3 py-2 text-xs font-black text-wayyak-green shadow-sm lg:mx-0"><span className="h-2 w-2 rounded-full bg-wayyak-gold" />User landing</div><h1 className="mx-auto max-w-4xl text-[2.45rem] font-black leading-[1.12] tracking-tight text-wayyak-deep sm:text-6xl lg:mx-0 lg:text-6xl xl:text-7xl">احجز مساحتك المناسبة داخل جامعة الملك سعود</h1><p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-wayyak-deep/70 sm:text-lg lg:mx-0">تجربة المستخدم تعرض المساحات المعتمدة فقط مع البحث، التفاصيل، الأسعار، والمواعيد. لوحة المالك والأدمن منفصلة حتى لا تختلط على المستخدم.</p>
            <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 rounded-[2rem] border border-wayyak-green/10 bg-white p-3 shadow-card lg:mx-0" dir="rtl"><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><label className="rounded-2xl bg-wayyak-sand px-5 py-4 text-right"><span className="text-xs font-bold text-wayyak-deep/45">بحث / موقع</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 w-full bg-transparent font-black text-wayyak-deep outline-none" /></label><button type="button" onClick={focusSpaces} className="rounded-2xl bg-wayyak-gold px-7 py-4 text-center font-black text-wayyak-deep">ابحث الآن</button></div><p className="px-2 pb-1 text-right text-xs font-bold text-wayyak-green">{message}</p></div>
            <div className="mt-7 flex max-w-full flex-wrap justify-center gap-2 overflow-visible pb-2 lg:justify-start">{categories.map((category) => <button key={category.id} type="button" onClick={() => applyCategory(category.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black shadow-sm transition ${activeCategory === category.id ? 'border-wayyak-green bg-wayyak-green text-white' : 'border-wayyak-green/10 bg-white text-wayyak-green'}`}>{category.ar} <bdi className="font-english opacity-60" dir="ltr">/ {category.en}</bdi></button>)}</div></div>
          {selectedSpace ? <div className="relative mx-auto w-full max-w-[27rem] min-w-0 lg:max-w-[30rem]"><div className="rounded-[2.2rem] border border-white bg-white p-3 shadow-soft"><div className="overflow-hidden rounded-[1.8rem] bg-wayyak-deep text-white"><div className={`bg-gradient-to-br ${selectedSpace.tone} p-5 transition-all duration-500`}><div className="flex items-center justify-between gap-3"><p className="font-english text-xs font-bold uppercase tracking-[0.2em] text-white/55" dir="ltr">Featured spaces slider</p><div className="flex gap-2" dir="ltr"><button type="button" aria-label="Previous space" onClick={() => rotateSelectedSpace(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg font-black text-white backdrop-blur hover:bg-white/25">‹</button><button type="button" aria-label="Next space" onClick={() => rotateSelectedSpace(1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg font-black text-white backdrop-blur hover:bg-white/25">›</button></div></div><div className="mt-2 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">{selectedSpace.titleAr}</h2><p className="mt-1 font-english text-xs text-white/55" dir="ltr">{selectedSpace.titleEn}</p><p className="mt-2 text-sm leading-6 text-white/70">{selectedSpace.addressAr} · {selectedSpace.capacity} شخص</p></div><div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur"><p className="font-english text-xl font-black" dir="ltr">{formatSar(selectedSpace.hourlyHalalas)}</p><p className="text-[10px] font-bold text-white/65">/ساعة</p></div></div><div className="mt-5 flex justify-center gap-2" dir="ltr">{approvedSpaces.map((space) => <button key={space.id} type="button" aria-label={`Show ${space.titleEn}`} onClick={() => setSelectedSpaceId(space.id)} className={`h-2.5 rounded-full transition-all ${selectedSpace.id === space.id ? 'w-8 bg-wayyak-gold' : 'w-2.5 bg-white/35'}`} />)}</div><div className="mt-6 grid grid-cols-3 gap-2" dir="ltr">{slots.map((slot) => <button key={slot} type="button" onClick={() => { setSelectedSlot(slot); setMessage(`تم اختيار وقت ${slot}.`) }} className={`rounded-2xl px-2 py-3 text-center font-english text-sm font-black ${selectedSlot === slot ? 'bg-wayyak-gold text-wayyak-deep' : 'bg-white text-wayyak-green'}`}>{slot}</button>)}</div></div><div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/10 border-t border-white/10 bg-white/5 text-center">{selectedSpace.photos.slice(0, 3).map((photo) => <div key={photo} className="px-2 py-4 font-english text-xs font-bold text-white/75" dir="ltr">{photo}</div>)}</div></div></div></div> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[approvedSpaces.length, 'مساحات متاحة'], [categories.length - 1, 'تصنيفات'], [slots.length, 'أوقات يومية'], [bookings.length, 'طلباتك التجريبية']].map(([value, label]) => <div key={label} className="rounded-[1.6rem] border border-wayyak-green/10 bg-white p-5 shadow-card"><p className="font-english text-3xl font-black text-wayyak-gold" dir="ltr">{value}</p><p className="mt-1 font-black text-wayyak-green">{label}</p></div>)}</div>
      </section>

      <section id="auth" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8"><div className="grid gap-5 rounded-[2rem] bg-white p-5 shadow-card md:grid-cols-[.9fr_1.1fr] md:p-7"><div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Email OTP login</p><h2 className="mt-2 text-3xl font-black">دخول المستخدم بالبريد</h2><p className="mt-3 leading-8 text-wayyak-deep/65">أدخل بريدك لاستلام كود دخول مرة واحدة. إذا كان البريد جديداً يتم إنشاء حساب مستخدم تلقائياً.</p></div><form onSubmit={startAuth} className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">البريد الإلكتروني<input value={email} disabled={signedIn} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label>{authStep === 'phone' ? <button className="rounded-2xl bg-wayyak-green px-4 py-3 font-black text-white sm:col-span-2">إرسال OTP بالبريد</button> : null}{authStep === 'otp' ? <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[1fr_auto]"><input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="6-digit OTP" className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 text-center font-english" dir="ltr" /><button type="button" onClick={verifyOtp} className="rounded-2xl bg-wayyak-gold px-6 py-3 font-black text-wayyak-deep">تحقق ودخول</button></div> : null}{signedIn ? <button type="button" onClick={resetAuth} className="rounded-2xl bg-wayyak-deep px-4 py-3 font-black text-white sm:col-span-2">تسجيل خروج</button> : null}{authError ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-2">{authError}</p> : null}<p className="rounded-2xl bg-wayyak-mint p-3 text-sm font-bold text-wayyak-green sm:col-span-2">الحالة: {signedIn ? 'داخل كـ User' : authStep === 'otp' ? 'OTP مرسل إلى البريد' : 'بانتظار البريد'}</p></form></div></section>

      <section id="spaces" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Marketplace listings</p><h2 className="mt-2 text-3xl font-black tracking-tight text-wayyak-deep md:text-4xl">المساحات المعتمدة فقط</h2></div><p className="max-w-md text-sm leading-6 text-wayyak-deep/60">البحث والفلاتر يعرضان approved فقط. المسودات والمرفوضة لا تظهر في السوق.</p></div><div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-wayyak-green shadow-sm">التصنيف الحالي: {categories.find((category) => category.id === activeCategory)?.ar} · النتائج: {visibleSpaces.length}</div><div className="grid gap-5 md:grid-cols-3">{visibleSpaces.map((space) => <article key={space.id} className={`group overflow-hidden rounded-[2rem] border bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft ${selectedSpaceId === space.id ? 'border-wayyak-green ring-2 ring-wayyak-green/10' : 'border-wayyak-green/10'}`}><div className={`relative h-48 bg-gradient-to-br ${space.tone}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.30),transparent_14rem)]" /><div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-wayyak-green backdrop-blur">{categories.find((c) => c.id === space.category)?.ar}</div></div><div className="p-5"><p className="font-english text-xs font-black uppercase tracking-[0.18em] text-wayyak-deep/40" dir="ltr">{space.owner}</p><h3 className="mt-2 text-2xl font-black text-wayyak-deep">{space.titleAr}</h3><p className="mt-1 font-english text-xs font-bold text-wayyak-deep/40" dir="ltr">{space.titleEn}</p><div className="mt-5 flex items-center justify-between rounded-2xl bg-wayyak-sand px-4 py-3"><div><p className="text-xs font-bold text-wayyak-deep/45">ساعة</p><p className="font-english text-lg font-black text-wayyak-green" dir="ltr">{formatSar(space.hourlyHalalas)}</p></div><div className="text-left"><p className="text-xs font-bold text-wayyak-deep/45">السعة</p><p className="font-english text-xl font-black text-wayyak-green" dir="ltr">{space.capacity}</p></div></div><button type="button" onClick={() => { setSelectedSpaceId(space.id); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="mt-4 w-full rounded-2xl bg-wayyak-green px-4 py-3 font-black text-white">فتح التفاصيل</button></div></article>)}</div>{!visibleSpaces.length ? <p className="mt-4 rounded-2xl bg-white p-5 text-sm font-bold text-wayyak-deep/60 shadow-sm">لا توجد نتائج معتمدة لهذا البحث.</p> : null}</section>

      {selectedSpace ? <section id="details" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8"><div className="rounded-[2rem] border border-wayyak-green/10 bg-white p-5 shadow-card md:p-7"><div className="grid gap-6 lg:grid-cols-[1fr_.8fr]"><div><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Space detail experience</p><h2 className="mt-2 text-3xl font-black">{selectedSpace.titleAr}</h2><p className="mt-1 font-english text-sm font-bold text-wayyak-deep/45" dir="ltr">{selectedSpace.titleEn}</p><p className="mt-4 leading-8 text-wayyak-deep/70">{selectedSpace.descriptionAr}</p><p className="mt-2 font-english text-sm leading-6 text-wayyak-deep/45" dir="ltr">{selectedSpace.descriptionEn}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-wayyak-sand p-4 text-sm font-bold">الموقع: {selectedSpace.addressAr}<br /><bdi dir="ltr" className="font-english text-wayyak-deep/50">{selectedSpace.addressEn}</bdi></div><div className="rounded-2xl bg-wayyak-sand p-4 text-sm font-bold">KSU/student notes:<br />{selectedSpace.ksuNotes}</div></div><div className="mt-4 flex flex-wrap gap-2">{selectedSpace.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-wayyak-mint px-3 py-2 font-english text-xs font-bold text-wayyak-green" dir="ltr">{amenityLabels[amenity]}</span>)}</div><div className="mt-4 grid gap-2 sm:grid-cols-3">{selectedSpace.photos.map((photo) => <div key={photo} className="rounded-2xl border border-dashed border-wayyak-green/25 bg-wayyak-sand p-4 text-center font-english text-xs font-bold text-wayyak-green" dir="ltr">photo slot: {photo}</div>)}</div></div><div className="rounded-[1.5rem] bg-wayyak-sand p-5"><p className="text-sm font-bold text-wayyak-deep/50">طلب حجز</p><div className="mt-3 grid grid-cols-2 gap-3"><label className="rounded-2xl bg-white p-3 text-sm font-bold">الوقت<select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)} className="mt-2 w-full rounded-xl border border-wayyak-green/10 p-2 font-english" dir="ltr">{slots.map((slot) => <option key={slot}>{slot}</option>)}</select></label><label className="rounded-2xl bg-white p-3 text-sm font-bold">الساعات<input type="number" min="1" max="8" value={hours} onChange={(event) => setHours(Math.max(1, Number(event.target.value)))} className="mt-2 w-full rounded-xl border border-wayyak-green/10 p-2 font-english" dir="ltr" /></label></div><div className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-wayyak-deep/75">ساعة: <bdi dir="ltr">{formatSar(selectedSpace.hourlyHalalas)}</bdi><br />يوم: <bdi dir="ltr">{formatSar(selectedSpace.dailyHalalas)}</bdi><br />الإجمالي: <bdi dir="ltr" className="font-english text-xl text-wayyak-green">{formatSar(bookingTotalHalalas)}</bdi><br />الحالة بعد الإرسال: manual payment pending</div><button type="button" onClick={createBooking} className="mt-5 w-full rounded-2xl bg-wayyak-gold px-4 py-3 font-black text-wayyak-deep">{signedIn ? 'إرسال طلب حجز' : 'سجّل دخول بالبريد لإرسال الحجز'}</button></div></div></div></section> : null}

      {false ? <>
      <section id="owner" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8"><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><form onSubmit={saveOwnerSpace} className="rounded-[2rem] bg-white p-5 shadow-card md:p-7"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Owner space management</p><h2 className="mt-2 text-3xl font-black">{editingSpaceId ? 'تعديل مساحة' : 'إنشاء مساحة'}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">العنوان عربي<input value={form.titleAr} onChange={(event) => setForm({ ...form, titleAr: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3" /></label><label className="text-sm font-bold">Title EN<input value={form.titleEn} onChange={(event) => setForm({ ...form, titleEn: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold sm:col-span-2">الوصف عربي<textarea value={form.descriptionAr} onChange={(event) => setForm({ ...form, descriptionAr: event.target.value })} className="mt-2 min-h-20 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3" /></label><label className="text-sm font-bold sm:col-span-2">Description EN<textarea value={form.descriptionEn} onChange={(event) => setForm({ ...form, descriptionEn: event.target.value })} className="mt-2 min-h-20 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold">النوع<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value, type: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3">{categories.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.ar}</option>)}</select></label><label className="text-sm font-bold">السعة<input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold">العنوان عربي<input value={form.addressAr} onChange={(event) => setForm({ ...form, addressAr: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3" /></label><label className="text-sm font-bold">Address EN<input value={form.addressEn} onChange={(event) => setForm({ ...form, addressEn: event.target.value })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold">Hourly halalas<input type="number" step="100" value={form.hourlyHalalas} onChange={(event) => setForm({ ...form, hourlyHalalas: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold">Daily halalas<input type="number" step="100" value={form.dailyHalalas} onChange={(event) => setForm({ ...form, dailyHalalas: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold sm:col-span-2">Photo placeholders<input value={form.photos.join(', ')} onChange={(event) => setForm({ ...form, photos: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} className="mt-2 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3 font-english" dir="ltr" /></label><label className="text-sm font-bold sm:col-span-2">KSU/student notes<textarea value={form.ksuNotes} onChange={(event) => setForm({ ...form, ksuNotes: event.target.value })} className="mt-2 min-h-16 w-full rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-3" /></label></div><div className="mt-4 flex flex-wrap gap-2">{amenityOptions.map((amenity) => <button type="button" key={amenity} onClick={() => setForm((current) => ({ ...current, amenities: current.amenities.includes(amenity) ? current.amenities.filter((item) => item !== amenity) : [...current.amenities, amenity] }))} className={`rounded-full px-3 py-2 font-english text-xs font-bold ${form.amenities.includes(amenity) ? 'bg-wayyak-green text-white' : 'bg-wayyak-sand text-wayyak-green'}`} dir="ltr">{amenityLabels[amenity]}</button>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2"><button className="rounded-2xl bg-wayyak-green px-4 py-3 font-black text-white">{editingSpaceId ? 'حفظ التعديل' : 'حفظ كمسودة'}</button>{editingSpaceId ? <button type="button" onClick={() => { setEditingSpaceId(null); setForm(emptyForm) }} className="rounded-2xl bg-wayyak-sand px-4 py-3 font-black text-wayyak-green">إلغاء التعديل</button> : null}</div></form>
          <div id="owner-list" className="rounded-[2rem] bg-white p-5 shadow-card md:p-7"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Owner spaces</p><h2 className="mt-2 text-3xl font-black">مساحات المالك</h2><div className="mt-5 space-y-3">{ownerSpaces.map((space) => <div key={space.id} className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{space.titleAr}</h3><p className="font-english text-xs text-wayyak-deep/45" dir="ltr">{space.titleEn}</p><p className="mt-1 text-xs font-bold text-wayyak-green">{statusLabel[space.status]} · {formatSar(space.hourlyHalalas)}/hr</p>{space.rejectionReason ? <p className="mt-1 text-xs font-bold text-red-700">سبب الرفض: {space.rejectionReason}</p> : null}</div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-wayyak-green">{statusLabel[space.status]}</span></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => loadForEdit(space)} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-wayyak-green">تعديل</button>{space.status === 'draft' || space.status === 'rejected' ? <button type="button" onClick={() => updateStatus(space.id, 'pending')} className="rounded-xl bg-wayyak-green px-3 py-2 text-xs font-black text-white">إرسال للموافقة</button> : null}<button type="button" onClick={() => { setSelectedSpaceId(space.id); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-wayyak-green">معاينة</button></div></div>)}</div></div></div></section>

      <section id="admin" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8"><div className="rounded-[2rem] bg-wayyak-deep p-5 text-white shadow-soft md:p-8"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Admin approval flow</p><h2 className="mt-3 text-3xl font-black">قائمة موافقة الأدمن</h2><p className="mt-2 text-sm font-bold text-white/60">الموافقة/الرفض تتطلب دخول admin أو ksu_admin. الحالات مدعومة: draft / pending / approved / rejected.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{pendingSpaces.length ? pendingSpaces.map((space) => <div key={space.id} className="rounded-2xl bg-white/10 p-4"><h3 className="text-xl font-black">{space.titleAr}</h3><p className="mt-2 font-english text-sm text-white/65" dir="ltr">{space.titleEn} · {formatSar(space.hourlyHalalas)}/hr · cap {space.capacity}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => isAdminRole && signedIn ? updateStatus(space.id, 'approved') : setMessage('موافقة الأدمن تتطلب role admin/ksu_admin.')} className="rounded-2xl bg-wayyak-gold px-5 py-3 font-black text-wayyak-deep">موافقة ونشر</button><button type="button" onClick={() => isAdminRole && signedIn ? updateStatus(space.id, 'rejected', 'بيانات أو صور ناقصة') : setMessage('رفض المساحة يتطلب role admin/ksu_admin.')} className="rounded-2xl bg-white/15 px-5 py-3 font-black text-white">رفض</button></div></div>) : <p className="rounded-2xl bg-white/10 p-4 text-white/70">لا توجد مساحات pending. أرسل مساحة من جدول المالك.</p>}</div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{['Schema aligned: spaces/title_ar/title_en/prices_halalas', 'No migration needed for Phase 3 fields', 'Payments: manual_internal pending only', 'Notifications: internal log placeholder only'].map((item) => <div key={item} className="rounded-2xl bg-white/10 p-4 font-english text-sm font-bold text-white/80" dir="ltr">{item}</div>)}</div></div></section>

      <section id="bookings" className="mx-auto w-full max-w-7xl overflow-hidden px-4 pb-14 sm:px-6 lg:px-8"><div className="rounded-[2rem] bg-white p-5 shadow-card md:p-7"><p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Booking drafts</p><h2 className="mt-2 text-3xl font-black">طلبات الحجز اليدوية</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{bookings.length ? bookings.map((booking) => <div key={booking.id} className="rounded-2xl border border-wayyak-green/10 bg-wayyak-sand p-4 text-sm font-bold leading-7"><bdi dir="ltr" className="font-english text-wayyak-green">{booking.id}</bdi> · {booking.spaceTitle}<br />{booking.slot} · {booking.hours} ساعة · <bdi dir="ltr">{formatSar(booking.totalHalalas)}</bdi><br />الحالة: manual payment pending · internal log placeholder · <bdi dir="ltr">{booking.userPhone}</bdi></div>) : <p className="rounded-2xl bg-wayyak-sand p-4 text-sm font-bold text-wayyak-deep/60">لا توجد طلبات بعد. سجّل دخول ثم أرسل طلب حجز من التفاصيل.</p>}</div></div></section>
      </> : null}
    </main>
  )
}
