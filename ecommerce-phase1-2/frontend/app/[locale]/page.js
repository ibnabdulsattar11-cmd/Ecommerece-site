import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main>
      <Navbar />
      <section className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-bold text-primary">{t("heroTitle")}</h1>
        <p className="text-lg text-gray-600">{t("heroSubtitle")}</p>
        <button className="mt-4 rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary-dark">
          {t("shopNow")}
        </button>
      </section>
    </main>
  );
}
