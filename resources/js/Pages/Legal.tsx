import { PageLayout } from '@/components/PageLayout';

/** Юридическая страница. HTML собран на сервере из resources/legal/*.md с экранированием. */
export default function Legal({ title, html }: { title: string; html: string }) {
    return (
        <PageLayout title={title}>
            <h1 className="page-title">{title}</h1>
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </PageLayout>
    );
}
