import Link from 'next/link';

export default function NotFound() {
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
                    Page Not Found
                </h2>

                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Let&apos;s get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        ← Back Home
                    </Link>
                    <Link
                        href="/blog"
                        className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
                    >
                        Read the Blog
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
