import {NextIntlClientProvider, hasLocale} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
import {CookieConsent, Footer, Header} from "@/components/site";
import {NightStarfield, ThemeProvider} from "@/components/theme";

export function generateStaticParams() {
  return routing.locales.map(locale => ({locale}));
}

export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
  const {locale}=await params;
  if(!hasLocale(routing.locales,locale)) notFound();
  setRequestLocale(locale);
  const messages=await getMessages();
  return <NextIntlClientProvider messages={messages}>
    <ThemeProvider>
      <NightStarfield />
      <Header/>
      <main>{children}</main>
      <Footer/>
      <CookieConsent/>
    </ThemeProvider>
  </NextIntlClientProvider>;
}
