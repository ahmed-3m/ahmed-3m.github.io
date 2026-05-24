'use client';

import { useI18n } from '@/lib/i18n';
import type { TranslationMap } from '@/lib/i18n';

const translations: Record<string, TranslationMap> = {
  backToHome: {
    en: 'Back to Home',
    de: 'Zuruck zur Startseite',
    fr: "Retour a l'accueil",
    es: 'Volver al inicio',
    ar: 'العودة إلى الصفحة الرئيسية',
  },
  backToBlog: {
    en: 'Back to Blog',
    de: 'Zuruck zum Blog',
    fr: 'Retour au blog',
    es: 'Volver al blog',
    ar: 'العودة إلى المدونة',
  },
  readMore: {
    en: 'Read more',
    de: 'Weiterlesen',
    fr: 'Lire la suite',
    es: 'Leer mas',
    ar: 'اقرأ المزيد',
  },
  viewAllPosts: {
    en: '<- View All Posts',
    de: '<- Alle Beitrage anzeigen',
    fr: '<- Voir tous les articles',
    es: '<- Ver todos los articulos',
    ar: 'عرض كل المقالات ->',
  },
  writtenBy: {
    en: 'Written by Ahmed Mohammed',
    de: 'Geschrieben von Ahmed Mohammed',
    fr: 'Ecrit par Ahmed Mohammed',
    es: 'Escrito por Ahmed Mohammed',
    ar: 'بقلم أحمد محمد',
  },
  blogSubtitle: {
    en: 'Insights and experiences from AI/ML research and production deployments',
    de: 'Einblicke und Erfahrungen aus KI/ML-Forschung und Produktionssystemen',
    fr: 'Idees et retours issus de la recherche IA/ML et de deploiements en production',
    es: 'Ideas y experiencias de investigacion IA/ML y despliegues en produccion',
    ar: 'رؤى وتجارب من أبحاث الذكاء الاصطناعي وتطبيقاته في الإنتاج',
  },
};

export function BlogTranslations({ textKey }: { textKey: string }) {
  const { t } = useI18n();
  const translation = translations[textKey];
  if (!translation) return <>{textKey}</>;
  return <>{t(translation)}</>;
}
