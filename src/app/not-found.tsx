import type { Metadata } from 'next';
import NotFoundContent from '@/components/NotFoundContent';

// Static export writes this page to out/404.html. A server component can export
// metadata, so the 404 gets its own <title> instead of the root layout default;
// the localized UI lives in the client child (useI18n).
export const metadata: Metadata = {
    title: 'Page Not Found',
};

export default function NotFound() {
    return <NotFoundContent />;
}
