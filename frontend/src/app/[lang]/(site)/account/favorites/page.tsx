import { Suspense } from "react";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Book, Paginated } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/dal";
import { listFavorites } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { BookCard, BookGrid, BookGridSkeleton } from "@/components/books/book-card";
import { FavoriteToggle } from "@/components/books/library-control";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { pageParam } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.favorites.title, robots: { index: false } };
}

export default async function FavoritesPage({ searchParams }: PageProps<"/[lang]/account/favorites">) {
  const { locale, dict } = await getI18n();
  return (
    <>
      <PageHeader title={dict.favorites.title} description={dict.favorites.subtitle} />
      <div className="mt-8">
        <Suspense fallback={<BookGridSkeleton count={5} />}>
          <Favorites searchParams={searchParams} locale={locale} dict={dict} />
        </Suspense>
      </div>
    </>
  );
}

async function Favorites({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/account/favorites">["searchParams"]; locale: Locale; dict: Dictionary }) {
  await requireUser(locale, "/account/favorites");
  const page = pageParam((await searchParams).page);
  return (
    <FeatureGate feature="favorites" dict={dict} load={() => listFavorites(page)} example={examples.favorites}>
      {(data) => <FavoritesGrid data={data} locale={locale} dict={dict} />}
    </FeatureGate>
  );
}

function FavoritesGrid({ data, locale, dict }: { data: Paginated<Book>; locale: Locale; dict: Dictionary }) {
  if (!data.data.length) return <EmptyState icon={<Heart className="size-6" aria-hidden />} title={dict.favorites.empty} />;
  return (
    <>
      <BookGrid>
        {data.data.map((book) => (
          <div key={book.id} className="relative">
            <BookCard book={book} locale={locale} dict={dict} />
            {/* الزر فوق الغلاف ويعلو رابط البطاقة */}
            <div className="absolute end-2 top-2 z-10">
              <FavoriteToggle bookId={book.id} isFavorite />
            </div>
          </div>
        ))}
      </BookGrid>
      <Pagination meta={data} basePath={`/${locale}/account/favorites`} query={{}} locale={locale} dict={dict} />
    </>
  );
}
