'use client'

import { useMemo, useState } from 'react'

const Logo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 shrink-0" aria-label="WAYYAK logo">
    <rect x="10" y="18" width="80" height="64" rx="18" fill="#1B6B3A" />
    <path d="M29 36h42M29 51h42M29 66h24" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    <circle cx="72" cy="66" r="7" fill="#F5A623" />
  </svg>
)

const categories = [
  { id: 'all', ar: 'الكل', en: 'All' },
  { id: 'office', ar: 'مكاتب', en: 'Office' },
  { id: 'meeting', ar: 'اجتماعات', en: 'Boardroom' },
  { id: 'restaurant', ar: 'مطاعم', en: 'Restaurant' },
  { id: 'studio', ar: 'استوديو', en: 'Studio' },
  { id: 'event', ar: 'فعاليات', en: 'Event Hall' },
]

const ksuSpaces = [
  {
    id: 'incubation-boardroom',
    category: 'meeting',
    title: 'قاعة اجتماعات الحاضنة',
    en: 'Incubation Boardroom',
    type: 'قاعة اجتماعات',
    price: '120',
    capacity: '12',
    tone: 'from-[#1B6B3A] to-[#2F8D55]',
    location: 'مركز حاضنة الأعمال - جامعة الملك سعود',
    amenities: ['WiFi', 'Projector', 'Parking', 'Prayer room'],
    availability: 'اليوم 09:00–15:00',
    status: 'قابل للعرض الآن · الحجز الفعلي في Phase 3',
  },
  {
    id: 'ksu-training-room',
    category: 'event',
    title: 'قاعة تدريب KSU',
    en: 'KSU Training Room',
    type: 'قاعة تدريب',
    price: '180',
    capacity: '30',
    tone: 'from-[#123621] to-[#1B6B3A]',
    location: 'مبنى ريادة الأعمال - جامعة الملك سعود',
    amenities: ['WiFi', 'Screens', 'Flexible seating', 'Coffee setup'],
    availability: 'الأحد–الخميس 10:00–16:00',
    status: 'جاهزة كبيانات تجريبية · موافقة المالك في Phase 3',
  },
  {
    id: 'campus-content-studio',
    category: 'studio',
    title: 'استوديو محتوى جامعي',
    en: 'Campus Content Studio',
    type: 'استوديو',
    price: '90',
    capacity: '6',
    tone: 'from-[#2B5E49] to-[#F5A623]',
    location: 'منطقة الإعلام الطلابي - جامعة الملك سعود',
    amenities: ['Lighting', 'Backdrop', 'WiFi', 'Quiet zone'],
    availability: 'غداً 11:00–17:00',
    status: 'تفاصيل العرض تعمل · الدفع/التأكيد في Phase 3',
  },
]

const stats = [
  ['3', 'مساحات KSU جاهزة'],
  ['13', 'خدمة ومرفق'],
  ['50%', 'خصم طلاب الجامعة'],
  ['18%', 'عمولة المنصة'],
]

const slots = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00']

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedSpaceId, setSelectedSpaceId] = useState(ksuSpaces[0].id)
  const [demoMessage, setDemoMessage] = useState('')

  const visibleSpaces = useMemo(
    () => ksuSpaces.filter((space) => activeCategory === 'all' || space.category === activeCategory),
    [activeCategory]
  )
  const selectedSpace = ksuSpaces.find((space) => space.id === selectedSpaceId) ?? visibleSpaces[0] ?? ksuSpaces[0]

  const focusSpaces = () => {
    setActiveCategory('all')
    setSelectedSpaceId(ksuSpaces[0].id)
    setDemoMessage('تم عرض مساحات KSU التجريبية. الحجز الحقيقي يبدأ في Phase 3 بعد اعتماد المصادقة.')
    document.getElementById('spaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const applyCategory = (categoryId: string) => {
    const nextSpaces = ksuSpaces.filter((space) => categoryId === 'all' || space.category === categoryId)
    setActiveCategory(categoryId)
    setSelectedSpaceId(nextSpaces[0]?.id ?? ksuSpaces[0].id)
    setDemoMessage(nextSpaces.length ? `تم تطبيق الفلتر: ${categories.find((c) => c.id === categoryId)?.ar}` : 'لا توجد مساحة ضمن هذا التصنيف في بيانات KSU التجريبية.')
    document.getElementById('spaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden font-arabic text-wayyak-deep">
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <nav className="sticky top-3 z-20 flex items-center justify-between rounded-[1.4rem] border border-white/70 bg-white/95 px-3 py-3 shadow-soft backdrop-blur md:rounded-[1.75rem] md:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Logo />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-lg font-black tracking-tight text-wayyak-green sm:text-xl">وياك</p>
              <p className="font-english text-[11px] font-bold uppercase tracking-[0.22em] text-wayyak-deep/50">WAYYAK</p>
            </div>
          </div>
          <div className="hidden rounded-full border border-wayyak-green/10 bg-wayyak-sand p-1 text-sm font-black text-wayyak-green sm:flex" dir="ltr" aria-label="Language toggle coming soon">
            <span className="rounded-full bg-wayyak-green px-4 py-2 text-white shadow-sm">AR</span>
            <span className="px-4 py-2 text-wayyak-green/35">EN soon</span>
          </div>
          <button type="button" onClick={focusSpaces} className="shrink-0 rounded-full bg-wayyak-green px-4 py-3 text-sm font-black text-white shadow-lg shadow-wayyak-green/20 md:px-6">استكشف</button>
        </nav>

        <div className="mt-5 rounded-[1.5rem] border border-wayyak-gold/35 bg-white/90 p-4 text-sm font-bold leading-7 text-wayyak-deep shadow-sm">
          <span className="text-wayyak-green">حالة النسخة:</span> هذا Preview تفاعلي لمرحلة Phase 0/1. الفلاتر وعرض التفاصيل تعمل الآن؛ التسجيل، الحجز، الدفع، ولوحة المالك قادمة في المراحل التالية.
        </div>

        <div className="grid min-w-0 items-center gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.85fr)] lg:gap-10 lg:py-14">
          <div className="min-w-0 text-center lg:text-right">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-wayyak-green/10 bg-white px-3 py-2 text-xs font-black text-wayyak-green shadow-sm lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-wayyak-gold" />
              حجز مساحات بالساعة · تجربة KSU
            </div>
            <h1 className="mx-auto max-w-4xl text-[2.45rem] font-black leading-[1.12] tracking-tight text-wayyak-deep sm:text-6xl lg:mx-0 lg:text-6xl xl:text-7xl">
              منصة سعودية لحجز المساحات غير المستغلة
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-wayyak-deep/70 sm:text-lg lg:mx-0">
              وياك يربط أصحاب المساحات بالباحثين عن مكاتب، قاعات اجتماعات، استوديوهات ومواقع فعاليات — بتجربة بسيطة شبيهة <bdi dir="ltr">Airbnb</bdi> و <bdi dir="ltr">Peerspace</bdi>.
            </p>

            <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 rounded-[2rem] border border-wayyak-green/10 bg-white p-3 shadow-card lg:mx-0" dir="rtl">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <div className="rounded-2xl bg-wayyak-sand px-5 py-4 text-right">
                  <p className="text-xs font-bold text-wayyak-deep/45">أين تبحث؟</p>
                  <p className="mt-1 font-black text-wayyak-deep">جامعة الملك سعود، الرياض</p>
                </div>
                <button type="button" onClick={focusSpaces} className="rounded-2xl bg-wayyak-gold px-7 py-4 text-center font-black text-wayyak-deep transition hover:scale-[1.01]">ابحث الآن</button>
              </div>
              {demoMessage ? <p className="px-2 pb-1 text-right text-xs font-bold text-wayyak-green">{demoMessage}</p> : null}
            </div>

            <div className="mt-7 flex max-w-full flex-wrap justify-center gap-2 overflow-visible pb-2 lg:justify-start" aria-label="Space category filters">
              {categories.map((category) => {
                const isActive = activeCategory === category.id
                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => applyCategory(category.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black shadow-sm transition ${isActive ? 'border-wayyak-green bg-wayyak-green text-white' : 'border-wayyak-green/10 bg-white text-wayyak-green hover:border-wayyak-green/30'}`}
                  >
                    {category.ar} <bdi className={`${isActive ? 'text-white/70' : 'text-wayyak-deep/35'} font-english`} dir="ltr">/ {category.en}</bdi>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[27rem] min-w-0 lg:max-w-[30rem]">
            <div className="absolute left-0 top-10 hidden h-28 w-28 rounded-full bg-wayyak-gold/30 blur-2xl md:block" />
            <div className="rounded-[2.2rem] border border-white bg-white p-3 shadow-soft">
              <div className="overflow-hidden rounded-[1.8rem] bg-wayyak-deep text-white">
                <div className="bg-gradient-to-br from-wayyak-green via-[#237747] to-wayyak-deep p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-english text-xs font-bold uppercase tracking-[0.2em] text-white/55" dir="ltr">Interactive preview</p>
                      <h2 className="mt-2 text-2xl font-black">{selectedSpace.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/70">{selectedSpace.availability} · {selectedSpace.capacity} شخص</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur">
                      <p className="font-english text-2xl font-black" dir="ltr">{selectedSpace.price}</p>
                      <p className="text-[10px] font-bold text-white/65">ر.س/ساعة</p>
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-2" dir="ltr">
                    {slots.map((slot, index) => (
                      <button type="button" key={slot} onClick={() => setDemoMessage(`تم اختيار وقت تجريبي ${slot}. تأكيد الحجز قادم في Phase 3.`)} className={`rounded-2xl px-2 py-3 text-center font-english text-sm font-black ${index === 2 ? 'bg-wayyak-gold text-wayyak-deep' : index === 4 ? 'border border-dashed border-white/35 text-white/45' : 'bg-white text-wayyak-green'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/10 border-t border-white/10 bg-white/5 text-center">
                  {selectedSpace.amenities.slice(0, 3).map((item) => (
                    <div key={item} className="px-2 py-4 font-english text-xs font-bold text-white/75" dir="ltr">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-[1.6rem] border border-wayyak-green/10 bg-white p-5 shadow-card">
              <p className="font-english text-3xl font-black text-wayyak-gold" dir="ltr">{value}</p>
              <p className="mt-1 font-black text-wayyak-green">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="spaces" className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">KSU interactive seed data</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-wayyak-deep md:text-4xl">مساحات تجريبية قابلة للتصفية والعرض</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-wayyak-deep/60">المتاح حالياً: فلترة التصنيفات، عرض التفاصيل، واختيار وقت تجريبي. الحجز والدفع الحقيقيان في Phase 3.</p>
        </div>

        <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-wayyak-green shadow-sm">
          التصنيف الحالي: {categories.find((category) => category.id === activeCategory)?.ar} · النتائج: {visibleSpaces.length}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {visibleSpaces.map((space) => (
            <article key={space.en} className={`group overflow-hidden rounded-[2rem] border bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft ${selectedSpaceId === space.id ? 'border-wayyak-green ring-2 ring-wayyak-green/10' : 'border-wayyak-green/10'}`}>
              <div className={`relative h-48 bg-gradient-to-br ${space.tone}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.30),transparent_14rem)]" />
                <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-wayyak-green backdrop-blur">{space.type}</div>
              </div>
              <div className="p-5">
                <p className="font-english text-xs font-black uppercase tracking-[0.18em] text-wayyak-deep/40" dir="ltr">{space.en}</p>
                <h3 className="mt-2 text-2xl font-black text-wayyak-deep">{space.title}</h3>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-wayyak-sand px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-wayyak-deep/45">السعر</p>
                    <p className="font-english text-xl font-black text-wayyak-green" dir="ltr">{space.price} SAR/hr</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-wayyak-deep/45">السعة</p>
                    <p className="font-english text-xl font-black text-wayyak-green" dir="ltr">{space.capacity}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedSpaceId(space.id); setDemoMessage(`تم فتح تفاصيل ${space.title}`); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="mt-4 w-full rounded-2xl bg-wayyak-green px-4 py-3 font-black text-white transition hover:bg-wayyak-deep">
                  عرض التفاصيل
                </button>
              </div>
            </article>
          ))}
        </div>

        <div id="details" className="mt-6 scroll-mt-24 rounded-[2rem] border border-wayyak-green/10 bg-white p-5 shadow-card md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
            <div>
              <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Selected space details</p>
              <h3 className="mt-2 text-3xl font-black text-wayyak-deep">{selectedSpace.title}</h3>
              <p className="mt-2 font-english text-sm font-bold text-wayyak-deep/45" dir="ltr">{selectedSpace.en}</p>
              <p className="mt-4 leading-8 text-wayyak-deep/70">{selectedSpace.location} · {selectedSpace.availability}. هذه التفاصيل تعمل كـ MVP demo، أما طلب الحجز وربطه بالمستخدم/المالك فيأتي في Phase 3.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSpace.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-wayyak-mint px-3 py-2 font-english text-xs font-bold text-wayyak-green" dir="ltr">{amenity}</span>)}
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-wayyak-sand p-5">
              <p className="text-sm font-bold text-wayyak-deep/50">حالة الوظائف</p>
              <ul className="mt-3 space-y-2 text-sm font-bold leading-7 text-wayyak-deep/75">
                <li>✅ فلترة التصنيفات تعمل</li>
                <li>✅ عرض تفاصيل المساحة يعمل</li>
                <li>✅ اختيار وقت تجريبي يعرض رسالة</li>
                <li>⏳ تسجيل/OTP: Phase 2</li>
                <li>⏳ الحجز والدفع: Phase 3</li>
              </ul>
              <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-2xl bg-wayyak-deep/25 px-4 py-3 font-black text-wayyak-deep/55">طلب الحجز — قادم في Phase 3</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-[2rem] bg-wayyak-deep p-5 text-white shadow-soft md:grid-cols-[.9fr_1.1fr] md:p-8">
          <div>
            <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Recommended next phases</p>
            <h2 className="mt-3 text-3xl font-black">ما هو العامل وما هو القادم؟</h2>
            <p className="mt-3 leading-8 text-white/70">هذه النسخة لم تعد Static فقط: الفلاتر، التفاصيل، واختيار الوقت التجريبي تعمل. الوظائف التجارية الكاملة تحتاج المراحل التالية.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Phase 2: Phone OTP + roles + KSU email verification', 'Phase 3: Owner creates spaces + admin approval + listing details', 'Phase 3: Booking request + manual payment pending', 'Later: Moyasar + Unifonic/SMS after keys'].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4 font-english text-sm font-bold text-white/80" dir="ltr">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
