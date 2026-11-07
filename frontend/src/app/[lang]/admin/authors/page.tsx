import { Suspense } from "react";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { listAuthors } from "@/lib/services/features";
import { getCapabilities } from "@/lib/pending/capabilities";
import { examples } from "@/lib/pending/examples";
import { FeatureGate, PendingNotice } from "@/components/pending/feature-gate";
import { AuthorManager } from "@/components/admin/author-manager";
import { AdminSearchBar } from "@/components/admin/search-bar";
import { PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.adminAuthors.title };
}

export default async function AdminAuthorsPage({ searchParams }: PageProps<"/[lang]/admin/authors">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={dict.adminAuthors.title} />
      <Suspense fallback={<Skeleton className="h-80 rounded-[var(--radius-card)]" />}>
        <Authors searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function Authors({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/admin/authors">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const search = param(sp.search)?.trim() || undefined;
  const page = pageParam(sp.page);
  const caps = await getCapabilities();

  return (
    <>
      <AdminSearchBar action={`/${locale}/admin/authors`} defaultValue={search} placeholder={dict.authors.searchPlaceholder} label={dict.common.search} submitLabel={dict.common.search} />
      {caps.authors && !caps.adminAuthors ? <PendingNotice feature="adminAuthors" dict={dict} compact /> : null}
      <FeatureGate feature="authors" dict={dict} load={() => listAuthors({ search, page, per_page: 30 })} example={examples.authors}>
        {(data) => (
          <>
            <AuthorManager authors={data.data} canEdit={caps.adminAuthors} />
            <Pagination meta={data} basePath={`/${locale}/admin/authors`} query={{ search }} locale={locale} dict={dict} />
          </>
        )}
      </FeatureGate>
    </>
  );
}
