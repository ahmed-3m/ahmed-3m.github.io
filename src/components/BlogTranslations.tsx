'use client';

import { useI18n } from '@/lib/i18n';

const translations: Record<string, { en: string; de: string }> = {
    backToHome: { en: 'Back to Home', de: 'Zurück zur Startseite' },
    backToBlog: { en: 'Back to Blog', de: 'Zurück zum Blog' },
    readMore: { en: 'Read more', de: 'Weiterlesen' },
    viewAllPosts: { en: '← View All Posts', de: '← Alle Beiträge anzeigen' },
    writtenBy: { en: 'Written by Ahmed Mohammed', de: 'Geschrieben von Ahmed Mohammed' },
    blogSubtitle: {
        en: 'Insights and experiences from AI/ML research and production deployments',
        de: 'Einblicke und Erfahrungen aus KI/ML-Forschung und Produktionsanwendungen',
    },
};

export function BlogTranslations({ textKey }: { textKey: string }) {
    const { t } = useI18n();
    const translation = translations[textKey];
    if (!translation) return <>{textKey}</>;
    return <>{t(translation.en, translation.de)}</>;
}
