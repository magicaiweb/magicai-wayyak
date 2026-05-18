const Logo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 shrink-0" aria-label="WAYYAK logo">
    <rect x="10" y="18" width="80" height="64" rx="18" fill="#1B6B3A" />
    <path d="M29 36h42M29 51h42M29 66h24" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    <circle cx="72" cy="66" r="7" fill="#F5A623" />
  </svg>
)

const categories = [
  ['مكاتب', 'Office'],
  ['اجتماعات', 'Boardroom'],
  ['مطاعم', 'Restaurant'],
  ['استوديو', 'Studio'],
  ['فعاليات', 'Event Hall'],
]

const ksuSpaces = [
  { title: 'قاعة اجتماعات الحاضنة', en: 'Incubation Boardroom', type: 'قاعة اجتماعات', price: '120', capacity: '12', tone: 'from-[#1B6B3A] to-[#2F8D55]' },
  { title: 'قاعة تدريب KSU', en: 'KSU Training Room', type: 'قاعة تدريب', price: '180', capacity: '30', tone: 'from-[#123621] to-[#1B6B3A]' },
  { title: 'استوديو محتوى جامعي', en: 'Campus Content Studio', type: 'استوديو', price: '90', capacity: '6', tone: 'from-[#2B5E49] to-[#F5A623]' },
]

const stats = [
  ['3', 'مساحات KSU جاهزة'],
  ['13', 'خدمة ومرفق'],
  ['50%', 'خصم طلاب الجامعة'],
  ['18%', 'عمولة المنصة'],
]

const slots = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00']

export default function Home() {
  return (
    <main className="min-h-screen font-arabic text-wayyak-deep">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <nav className="sticky top-3 z-20 flex items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/90 px-3 py-3 shadow-soft backdrop-blur md:px-5">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <p className="text-xl font-black tracking-tight text-wayyak-green">وياك</p>
              <p className="font-english text-[11px] font-bold uppercase tracking-[0.22em] text-wayyak-deep/50">WAYYAK</p>
            </div>
          </div>
          <div className="hidden rounded-full bg-wayyak-sand p-1 text-sm font-black text-wayyak-green sm:flex" dir="ltr">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">AR</span>
            <span className="px-4 py-2 text-wayyak-green/45">EN</span>
          </div>
          <a href="#spaces" className="rounded-full bg-wayyak-green px-4 py-3 text-sm font-black text-white shadow-lg shadow-wayyak-green/20 md:px-6">استكشف</a>
        </nav>

        <div className="grid items-center gap-10 py-10 lg:grid-cols-[1.02fr_.98fr] lg:py-16">
          <div className="text-center lg:text-right">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-wayyak-green/10 bg-white px-3 py-2 text-xs font-black text-wayyak-green shadow-sm lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-wayyak-gold" />
              حجز مساحات بالساعة · تجربة KSU
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-wayyak-deep sm:text-6xl lg:mx-0 lg:text-7xl">
              منصة سعودية لحجز المساحات غير المستغلة
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-wayyak-deep/70 lg:mx-0">
              وياك يربط أصحاب المساحات بالباحثين عن مكاتب، قاعات اجتماعات، استوديوهات ومواقع فعاليات — بتجربة بسيطة شبيهة Airbnb وPeerspace.
            </p>

            <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 rounded-[2rem] border border-wayyak-green/10 bg-white p-3 shadow-card lg:mx-0" dir="rtl">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <div className="rounded-2xl bg-wayyak-sand px-5 py-4 text-right">
                  <p className="text-xs font-bold text-wayyak-deep/45">أين تبحث؟</p>
                  <p className="mt-1 font-black text-wayyak-deep">جامعة الملك سعود، الرياض</p>
                </div>
                <button className="rounded-2xl bg-wayyak-gold px-7 py-4 font-black text-wayyak-deep transition hover:scale-[1.01]">ابحث الآن</button>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              {categories.map(([ar, en]) => (
                <span key={en} className="rounded-full border border-wayyak-green/10 bg-white px-4 py-2 text-sm font-black text-wayyak-green shadow-sm">
                  {ar} <span className="font-english text-wayyak-deep/35" dir="ltr">/ {en}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[27rem] lg:max-w-none">
            <div className="absolute -left-4 top-10 hidden h-28 w-28 rounded-full bg-wayyak-gold/30 blur-2xl md:block" />
            <div className="rounded-[2.2rem] border border-white bg-white p-3 shadow-soft">
              <div className="overflow-hidden rounded-[1.8rem] bg-wayyak-deep text-white">
                <div className="bg-gradient-to-br from-wayyak-green via-[#237747] to-wayyak-deep p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-english text-xs font-bold uppercase tracking-[0.2em] text-white/55" dir="ltr">Featured space</p>
                      <h2 className="mt-2 text-2xl font-black">قاعة اجتماعات الحاضنة</h2>
                      <p className="mt-2 text-sm leading-6 text-white/70">متاحة اليوم · 12 شخص · بروجكتور وواي فاي</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur">
                      <p className="font-english text-2xl font-black" dir="ltr">120</p>
                      <p className="text-[10px] font-bold text-white/65">ر.س/ساعة</p>
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-2" dir="ltr">
                    {slots.map((slot, index) => (
                      <div key={slot} className={`rounded-2xl px-2 py-3 text-center font-english text-sm font-black ${index === 2 ? 'bg-wayyak-gold text-wayyak-deep' : index === 4 ? 'border border-dashed border-white/35 text-white/45' : 'bg-white text-wayyak-green'}`}>
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/10 border-t border-white/10 bg-white/5 text-center">
                  {['WiFi', 'Parking', 'Prayer'].map((item) => (
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

      <section id="spaces" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">KSU seed data</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-wayyak-deep md:text-4xl">مساحات تجريبية جاهزة للحجز</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-wayyak-deep/60">هذه واجهة Phase 0/1 فقط لعرض البراند والبيانات المزروعة. وظائف الحجز تبدأ بعد اعتماد UI baseline.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {ksuSpaces.map((space) => (
            <article key={space.en} className="group overflow-hidden rounded-[2rem] border border-wayyak-green/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
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
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-[2rem] bg-wayyak-deep p-5 text-white shadow-soft md:grid-cols-[.9fr_1.1fr] md:p-8">
          <div>
            <p className="font-english text-xs font-black uppercase tracking-[0.24em] text-wayyak-gold" dir="ltr">Phase 1 database</p>
            <h2 className="mt-3 text-3xl font-black">الأساس التقني جاهز</h2>
            <p className="mt-3 leading-8 text-white/70">Postgres schema + KSU seed data + internal payment/notification placeholders are ready. No Phase 2 work starts before UI approval.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['+966 phone auth structure', 'KSU email verification', 'Manual payment pending', 'Internal notification log'].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4 font-english text-sm font-bold text-white/80" dir="ltr">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
