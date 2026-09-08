'use client'

import Link from 'next/link';
import { useI18n, type TranslationMap } from '@/lib/i18n';

const copy = {
    heading: {
        en: 'Page Not Found',
        de: 'Seite nicht gefunden',
        fr: 'Page introuvable',
        es: 'Página no encontrada',
        ar: 'الصفحة غير موجودة',
    },
    body: {
        en: "The page you're looking for doesn't exist or has been moved. Let's get you back on track.",
        de: 'Die gesuchte Seite existiert nicht oder wurde verschoben. Hier geht es zurück.',
        fr: "La page que vous cherchez n'existe pas ou a été déplacée. Retournons sur le bon chemin.",
        es: 'La página que buscas no existe o fue movida. Volvamos al camino correcto.',
        ar: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لنعد إلى المسار الصحيح.',
    },
    backHome: {
        en: '← Back Home',
        de: '← Zur Startseite',
        fr: '← Retour à l’accueil',
        es: '← Volver al inicio',
        ar: '← العودة إلى الرئيسية',
    },
    readBlog: {
        en: 'Read the Blog',
        de: 'Blog lesen',
        fr: 'Lire le blog',
        es: 'Leer el blog',
        ar: 'اقرأ المدونة',
    },
} satisfies Record<string, TranslationMap>;

export default function NotFound() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-5">
            <div className="text-center max-w-lg">
                {/* Animated gradient 404 */}
                <h1
                    className="text-[8rem] font-black leading-none mb-4"
                    style={{
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed, #2563eb)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradient-shift 3s ease-in-out infinite',
                    }}
                >
                    404
                </h1>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                    {t(copy.heading)}
                </h2>

                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                    {t(copy.body)}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        {t(copy.backHome)}
                    </Link>
                    <Link
                        href="/blog"
                        className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
                    >
                        {t(copy.readBlog)}
                    </Link>
                </div>

                {/* Decorative floating orbs */}
                <div className="relative mt-16">
                    <div
                        className="absolute -top-8 left-1/4 w-32 h-32 rounded-full opacity-20 blur-3xl"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    />
                    <div
                        className="absolute -top-4 right-1/4 w-24 h-24 rounded-full opacity-15 blur-2xl"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                    />
                </div>
            </div>
        </div>
    );
}
