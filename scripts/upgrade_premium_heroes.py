from pathlib import Path

p = Path(r"C:\Users\Cavadov\Desktop\travellab\frontend\src\components\premium-pages.tsx")
t = p.read_text(encoding="utf-8")

repls = [
    (
        '      <PageHero title="İnteraktiv dünya xəritəsi" body="Ölkələri kəşf edin, qiymət və mövsüm məlumatlarına baxın." image="/images/destinations/dubai.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="map" title="İnteraktiv dünya xəritəsi" body="Ölkələri kəşf edin — cinematic pinlər, parallax və hover zoom ilə premium kəşf." badge="Explore · Live map" />\n      <ParallaxStrip images={STRIP} />\n      <section className="section premium-stage">\n        <FloatingOrbs />',
    ),
    (
        '      <PageHero title="Səyahət büdcəsi kalkulyatoru" body="Uçuş, otel, yemək, aktivlik və sığorta üzrə demo qiymətləndirmə." image="/images/destinations/paris.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="budget" title="Səyahət büdcəsi kalkulyatoru" body="Uçuş, otel, yemək və sığorta — canlı vizual breakdown ilə." badge="Finance · Smart estimate" />\n      <section className="section premium-stage">\n        <FloatingOrbs />',
    ),
    (
        '      <PageHero title="Tur & Otel müqayisəsi" body="2–4 seçimi yan-yana müqayisə edin. Nəticə database-də saxlanır." image="/images/destinations/istanbul.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="compare" title="Tur & Otel müqayisəsi" body="2–4 seçimi cinematic kartlarla müqayisə edin — hover zoom və scroll reveal." badge="Compare · Side by side" />\n      <ParallaxStrip images={STRIP} />\n      <section className="section premium-stage">',
    ),
    (
        '      <PageHero title="360° məkan görüntüləri" body="Panorama demo — real WebXR/Street View inteqrasiyası olmadan interaktiv baxış." image="/images/hotels/hero-pool.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="venue" title="360° məkan görüntüləri" body="Cinematic panorama panning — soft motion, hotspots və immersive stage." badge="Immersive · 360 demo" />\n      <section className="section premium-stage">\n        <FloatingOrbs />',
    ),
    (
        '      <PageHero title="Smart Travel Dashboard" body="Bronlar, Labpoint, wishlist və smart deals — bir ekranda." image="/images/stories/labpoint-001.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="dashboard" title="Smart Travel Dashboard" body="Bronlar, Labpoint və deals — motion cards ilə premium analitika." badge="Insight · Personal hub" />\n      <section className="section premium-stage">\n        <FloatingOrbs />',
    ),
    (
        '      <PageHero title="My Trip" body="Şəxsi səyahət idarəetməsi — günbəgün plan, xərclər və status." image="/images/destinations/tokyo.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="trip" title="My Trip" body="Günbəgün plan və xərclər — cinematic timeline ilə idarə edin." badge="Journey · My Trip" />\n      <ParallaxStrip images={STRIP} />\n      <section className="section premium-stage">',
    ),
    (
        '      <PageHero title="Smart Deals" body="Xüsusi təkliflər — endirim, Labpoint və mövsümi kampaniyalar." image="/images/destinations/phuket.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="deals" title="Smart Deals" body="Endirimlər cinematic kartlarda — hover zoom, badge pulse və scroll reveal." badge="Offers · Flash deals" />\n      <ParallaxStrip images={STRIP} />\n      <section className="section premium-stage">',
    ),
    (
        '      <PageHero title="AI Travel Assistant" body="Ağıllı çat köməkçisi — demo cavablar database thread-lərində saxlanır." image="/images/stories/reviews-001.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="assistant" title="AI Travel Assistant" body="Ağıllı çat — soft motion bubbles və cinematic backdrop." badge="Assistant · Demo AI" />\n      <section className="section premium-stage">\n        <FloatingOrbs />',
    ),
    (
        '      <PageHero title="Wishlist" body="Sevimli istiqamət, tur və smart deal-lər — hesabınıza bağlı." image="/images/destinations/bali.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="wishlist" title="Wishlist" body="Sevimli istiqamətlər — ürək animasiyası və media hover kartlar." badge="Saved · Wishlist" />\n      <ParallaxStrip images={STRIP} />\n      <section className="section premium-stage">',
    ),
    (
        '      <PageHero title="Travellab Premium" body="Orijinal saytda olmayan innovativ funksiyalar — real API və database ilə." image="/images/hero/mosque.jpg" />\n      <section className="section">',
        '      <CinematicHero theme="hub" title="Travellab Premium" body="Innovativ funksiyalar — cinematic video, parallax və interaktiv vizual dil." badge="Premium Suite" actions={<PremiumQuickLinks />} />\n      <ParallaxStrip images={STRIP} />\n      <section className="section premium-stage">\n        <FloatingOrbs />',
    ),
]

for a, b in repls:
    if a not in t:
        print("MISS", a[:70])
    else:
        t = t.replace(a, b)
        print("OK", a.split("title=")[1][:40])

# enhance compare cards and deals cards with ZoomImage / MotionCard lightly
t = t.replace(
    'className={`premium-card text-left ${active ? "ring-2 ring-[var(--tl-green)]" : ""}`}',
    'className={`premium-card media-hover text-left ${active ? "ring-2 ring-[var(--tl-green)]" : ""}`}',
)
t = t.replace(
    'className="premium-card overflow-hidden !p-0"',
    'className="premium-card media-hover overflow-hidden !p-0 deal-pulse"',
)
t = t.replace(
    'className="premium-card hover:-translate-y-1 transition"',
    'className="premium-card media-hover hover:-translate-y-1 transition hub-glow"',
)

p.write_text(t, encoding="utf-8")
print("remaining PageHero", t.count("PageHero"))
