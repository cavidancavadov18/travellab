import re
import urllib.request

URLS = [
    "https://www.travellab.az/endirimler",
    "https://www.travellab.az/events",
    "https://www.travellab.az/viza",
    "https://www.travellab.az/viza/almaniya",
    "https://www.travellab.az/ucuslar/baki-istanbul",
    "https://www.travellab.az/shop/elektronika",
    "https://www.travellab.az/about",
    "https://www.travellab.az/hediyye-karti",
    "https://www.travellab.az/korporativ",
    "https://www.travellab.az/labpoint",
    "https://www.travellab.az/search",
    "https://www.travellab.az/blog",
    "https://www.travellab.az/contact",
    "https://www.travellab.az/faq",
    "https://www.travellab.az/transfer",
    "https://www.travellab.az/sigorta",
    "https://www.travellab.az/login",
    "https://www.travellab.az/account",
    "https://www.travellab.az/cookies-policy",
    "https://www.travellab.az/mexfilik-siyaseti",
]

for u in URLS:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "ignore")
        title = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
        h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
        og = re.search(r'property="og:url" content="(.*?)"', html, re.I)
        t = re.sub(r"<[^>]+>", "", title.group(1) if title else "").strip()[:90]
        hs = [re.sub(r"<[^>]+>", "", h).strip()[:70] for h in h1s[:3]]
        print(u.split(".az", 1)[-1], "|", t, "| h1:", " || ".join(hs), "| og:", (og.group(1) if og else "")[-50:])
    except Exception as e:
        print("FAIL", u, e)
