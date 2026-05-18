const Logo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" aria-label="WAYYAK logo">
    <rect x="8" y="18" width="84" height="64" rx="9" fill="none" stroke="#1B6B3A" strokeWidth="5" />
    <line x1="36" y1="18" x2="36" y2="82" stroke="#1B6B3A" strokeWidth="3.5" />
    <line x1="64" y1="18" x2="64" y2="82" stroke="#1B6B3A" strokeWidth="3.5" />
    <line x1="8" y1="50" x2="92" y2="50" stroke="#1B6B3A" strokeWidth="3.5" />
    <rect x="11" y="21" width="22" height="26" rx="5" fill="#1B6B3A" />
    <rect x="67" y="21" width="22" height="26" rx="5" fill="#1B6B3A" />
    <rect x="39" y="53" width="22" height="26" rx="5" fill="#1B6B3A" />
    <rect x="39" y="21" width="22" height="26" rx="5" fill="none" stroke="#1B6B3A" strokeWidth="2" strokeDasharray="4,3" opacity="0.35" />
    <rect x="11" y="53" width="22" height="26" rx="5" fill="none" stroke="#1B6B3A" strokeWidth="2" strokeDasharray="4,3" opacity="0.35" />
    <rect x="67" y="53" width="22" height="26" rx="5" fill="none" stroke="#1B6B3A" strokeWidth="2" strokeDasharray="4,3" opacity="0.35" />
  </svg>
)

const spaceTypes = [
  ['Office', 'مكتب'],
  ['Boardroom', 'قاعة اجتماعات'],
  ['Restaurant', 'مطعم'],
  ['Gym', 'صالة رياضية'],
  ['Studio', 'استوديو'],
  ['Event Hall', 'قاعة فعاليات'],
  ['Rooftop', 'سطح'],
  ['Training Room', 'قاعة تدريب'],
  ['Wellness', 'صحة وعافية'],
]

const amenities = ['WiFi', 'Projector', 'Whiteboard', 'Parking', 'Prayer room', 'Coffee machine']

const ksuSpaces = [
  { title: 'قاعة اجتماعات الحاضنة', type: 'Boardroom', price: '120 SAR/hr', capacity: '12' },
  { title: 'قاعة تدريب KSU', type: 'Training Room', price: '180 SAR/hr', capacity: '30' },
  { title: 'استوديو محتوى جامعي', type: 'Studio', price: '90 SAR/hr', capacity: '6' },
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf2] text-[#173523]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6">
        <nav className="flex items-center justify-between rounded-full border border-[#1B6B3A]/10 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-2xl font-black text-[#1B6B3A]">WAYYAK وياك</p>
              <p className="text-xs font-semibold text-[#1B6B3A]/70" dir="ltr">Saudi spaces by the hour</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm font-bold text-[#1B6B3A] sm:flex">
            <span>AR</span>
            <span className="h-5 w-px bg-[#1B6B3A]/20" />
            <span dir="ltr">EN</span>
          </div>
          <span className="rounded-full bg-[#F5A623]/15 px-4 py-2 text-sm font-bold text-[#8a5900]">KSU Pilot</span>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.04fr_.96fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-[#1B6B3A]/10 px-4 py-2 text-sm font-bold text-[#1B6B3A]">السعودية · حجز بالساعة · سوق مساحات</p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight text-[#123621] md:text-7xl">
              احجز أي مساحة بالساعة مع <span className="text-[#1B6B3A]">وياك</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-[#31513f]">
              منصة سعودية تربط أصحاب المساحات غير المستخدمة بالباحثين عن مكاتب، قاعات، استوديوهات ومواقع فعاليات — ابتداءً من حاضنة جامعة الملك سعود.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#587261]" dir="ltr">
              A Peerspace-style marketplace for Saudi Arabia. Owners list idle hours. Seekers book instantly. Payments and notifications are staged as internal placeholders for Phase 1.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#ksu" className="rounded-full bg-[#1B6B3A] px-7 py-4 font-bold text-white shadow-lg shadow-[#1B6B3A]/20">استكشف مساحات KSU</a>
              <a href="#owners" className="rounded-full border border-[#1B6B3A]/20 bg-white px-7 py-4 font-bold text-[#1B6B3A]">أضف مساحتك</a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#1B6B3A]/10 bg-white p-5 shadow-2xl shadow-[#1B6B3A]/10">
            <div className="rounded-[1.5rem] bg-[#1B6B3A] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80">قاعة اجتماعات · KSU</p>
                  <h2 className="mt-1 text-2xl font-black">متاحة اليوم</h2>
                </div>
                <span className="rounded-full bg-[#F5A623] px-3 py-1 text-sm font-black text-[#173523]">SAR 120/hr</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm font-bold" dir="ltr">
                {['6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'].map((slot, i) => (
                  <div key={slot} className={`rounded-2xl p-4 ${i === 1 || i === 4 ? 'border border-dashed border-white/40 text-white/55' : 'bg-white text-[#1B6B3A]'}`}>{slot}</div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {amenities.map((item) => <div key={item} className="rounded-2xl bg-[#fffaf2] p-4 text-sm font-bold text-[#1B6B3A]" dir="ltr">{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="ksu" className="mx-auto max-w-7xl px-5 pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bold text-[#F5A623]">Phase 1 seed</p>
            <h2 className="text-3xl font-black text-[#123621]">KSU demo spaces جاهزة في قاعدة البيانات</h2>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1B6B3A] shadow-sm">Postgres · 3 spaces · 13 amenities</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ksuSpaces.map((space) => (
            <article key={space.title} className="rounded-[2rem] border border-[#1B6B3A]/10 bg-white p-6 shadow-sm">
              <div className="mb-8 h-36 rounded-[1.5rem] bg-gradient-to-br from-[#1B6B3A] to-[#2f8d55]" />
              <p className="text-sm font-bold text-[#F5A623]" dir="ltr">{space.type}</p>
              <h3 className="mt-2 text-2xl font-black text-[#1B6B3A]">{space.title}</h3>
              <div className="mt-5 flex items-center justify-between text-sm font-bold text-[#31513f]" dir="ltr">
                <span>{space.price}</span>
                <span>{space.capacity} guests</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="rounded-[2rem] bg-[#123621] p-6 text-white md:p-8">
          <div className="grid gap-6 md:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="font-bold text-[#F5A623]">Marketplace scope</p>
              <h2 className="mt-2 text-3xl font-black">أنواع المساحات</h2>
              <p className="mt-3 leading-8 text-white/75">Bilingual taxonomy is already represented in Phase 1 and ready for owner listings.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {spaceTypes.map(([en, ar]) => (
                <div key={en} className="rounded-2xl bg-white/10 p-4">
                  <p className="font-black">{ar}</p>
                  <p className="text-sm text-white/65" dir="ltr">{en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="owners" className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 md:grid-cols-4">
        {[
          ['18%', 'عمولة WAYYAK من كل حجز'],
          ['+966', 'تسجيل برقم جوال سعودي'],
          ['50%', 'خصم طلاب KSU بعد التحقق'],
          ['24h', 'جدولة دفع المالك بعد اكتمال الحجز'],
        ].map(([num, text]) => (
          <div key={num} className="rounded-3xl border border-[#1B6B3A]/10 bg-white p-6 shadow-sm">
            <p className="text-4xl font-black text-[#F5A623]" dir="ltr">{num}</p>
            <p className="mt-2 font-bold text-[#1B6B3A]">{text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
