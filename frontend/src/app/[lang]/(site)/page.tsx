import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookMarked, BookOpenText, Library, MessageSquareText, Search, Truck } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Book } from "@/lib/api/types";
import { getCategories, getLatestBooks } from "@/lib/services/catalog";
import { BookCard, BookGrid, BookGridSkeleton } from "@/components/books/book-card";
import { BookCover } from "@/components/books/book-cover";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { LoadError } from "@/components/ui/load-error";
import { formatNumber } from "@/lib/utils";

export default async function HomePage() {
  const { locale, dict } = await getI18n();
  const Arrow = localeMeta[locale].dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="paper-texture absolute inset-0 opacity-70" />
        <div aria-hidden className="absolute -top-32 end-[-10%] size-[28rem] rounded-full bg-saffron-200/50 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-plum-600 shadow-soft ring-1 ring-line">
              <BookMarked className="size-4" aria-hidden />
              {dict.home.eyebrow}
            </p>
            <h1 className="mt-6 font-display text-[2.1rem] font-bold leading-[1.3] text-ink-900 sm:text-5xl lg:text-[3.6rem]">
              {dict.home.heroTitle}
              <br />
              <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,var(--color-saffron-300)_62%,var(--color-saffron-300)_90%,transparent_90%)] px-1">
                {dict.home.heroTitleAccent}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{dict.home.heroSubtitle}</p>

            <form action={`/${locale}/books`} method="get" role="search" className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-surface p-1.5 shadow-lift ring-1 ring-line focus-within:ring-2 focus-within:ring-ink-500">
              <Search className="ms-3 size-5 shrink-0 text-subtle" aria-hidden />
              <label htmlFor="hero-search" className="sr-only">
                {dict.common.search}
              </label>
              <input
                id="hero-search"
                name="search"
                type="search"
                placeholder={dict.home.heroSearchPlaceholder}
                className="h-11 min-w-0 flex-1 bg-transparent text-base placeholder:text-subtle focus:outline-none"
              />
              <button type="submit" className="h-11 shrink-0 rounded-full bg-ink-700 px-5 font-semibold text-white hover:bg-ink-800">
                {dict.common.search}
              </button>
            </form>

            <Link href={`/${locale}/books`} className="mt-5 inline-flex items-center gap-2 font-semibold text-ink-700 hover:text-ink-900">
              {dict.home.browseAll}
              <Arrow className="size-4" aria-hidden />
            </Link>
          </div>

          <Suspense fallback={<HeroShelfSkeleton />}>
            <HeroShelf locale={locale} />
          </Suspense>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="container-page py-12" aria-labelledby="home-categories">
        <SectionHeading id="home-categories" title={dict.home.categoriesTitle} subtitle={dict.home.categoriesSubtitle} href={`/${locale}/categories`} linkLabel={dict.common.viewAll} Arrow={Arrow} />
        <Suspense fallback={<CategoryChipsSkeleton />}>
          <CategoryChips locale={locale} dict={dict} />
        </Suspense>
      </section>

      {/* ---------------- Latest books ---------------- */}
      <section className="container-page py-12" aria-labelledby="home-latest">
        <SectionHeading id="home-latest" title={dict.home.latestTitle} subtitle={dict.home.latestSubtitle} href={`/${locale}/books`} linkLabel={dict.common.viewAll} Arrow={Arrow} />
        <Suspense fallback={<BookGridSkeleton count={10} />}>
          <LatestBooks locale={locale} dict={dict} />
        </Suspense>
      </section>

      {/* ---------------- Roadmap (ميزات قيد التطوير) ---------------- */}
      <section className="container-page py-12" aria-labelledby="home-roadmap">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-800 px-6 py-10 text-white sm:px-10 sm:py-14">
          <div aria-hidden className="absolute -bottom-24 -start-24 size-72 rounded-full bg-plum-500/30 blur-3xl" />
          <div aria-hidden className="absolute -top-20 end-0 size-60 rounded-full bg-saffron-400/20 blur-3xl" />
          <div className="relative">
            <span className="ornament" aria-hidden />
            <h2 id="home-roadmap" className="mt-3 font-display text-3xl font-bold">
              {dict.home.roadmapTitle}
            </h2>
            <p className="mt-2 text-ink-100">{dict.home.roadmapSubtitle}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Icon: BookOpenText, text: dict.home.roadmap.reading },
                { Icon: Library, text: dict.home.roadmap.library },
                { Icon: MessageSquareText, text: dict.home.roadmap.reviews },
                { Icon: Truck, text: dict.home.roadmap.store },
              ].map(({ Icon, text }) => (
                <li key={text} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <span className="grid size-11 place-items-center rounded-xl bg-saffron-400 text-ink-900">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-4 font-semibold leading-relaxed">{text}</p>
                  <p className="mt-2 text-xs font-bold text-saffron-300">{dict.pending.badge}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ id, title, subtitle, href, linkLabel, Arrow }: { id: string; title: string; subtitle: string; href: string; linkLabel: string; Arrow: typeof ArrowLeft }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <span className="ornament" aria-hidden />
        <h2 id={id} className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>
      <Link href={href} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-ink-900 sm:inline-flex">
        {linkLabel}
        <Arrow className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

async function HeroShelf({ locale }: { locale: Locale }) {
  let books: Book[];
  try {
    books = (await getLatestBooks(10)).data.slice(0, 3);
  } catch {
    books = [];
  }
  // بدون كتب نعرض أغلفة زخرفية بعناوين عامة
  const items = books.length
    ? books.map((b) => ({ key: b.id, title: b.title, src: b.cover_url, seed: b.id, href: `/${locale}/books/${b.slug}` }))
    : [1, 2, 3].map((n) => ({ key: n, title: "", src: null, seed: n, href: null as string | null }));

  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]" aria-hidden={!books.length}>
      <div aria-hidden className="absolute inset-x-6 bottom-6 h-4 rounded-full bg-ink-900/15 blur-md" />
      <div aria-hidden className="absolute inset-x-0 bottom-8 h-3 rounded-full bg-gradient-to-r from-[#c9a87a] via-[#dcc39c] to-[#c9a87a]" />
      {items.map((item, i) => {
        const pos = [
          "start-[6%] bottom-11 w-[36%] -rotate-6 z-10",
          "start-[32%] bottom-11 w-[40%] z-20",
          "end-[4%] bottom-11 w-[34%] rotate-6 z-10",
        ][i];
        const cover = <BookCover title={item.title} src={item.src} seed={item.seed} sizes="200px" priority />;
        return (
          <div key={item.key} className={`absolute transition-transform duration-500 hover:-translate-y-2 ${pos}`}>
            {item.href ? (
              <Link href={item.href} className="block rounded-lg">
                {cover}
              </Link>
            ) : (
              cover
            )}
          </div>
        );
      })}
    </div>
  );
}

function HeroShelfSkeleton() {
  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]" aria-hidden>
      <Skeleton className="absolute bottom-11 start-[32%] aspect-[2/3] w-[40%]" />
    </div>
  );
}

async function CategoryChips({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  let categories;
  try {
    categories = await getCategories();
  } catch (error) {
    return <LoadError error={error} dict={dict} title={dict.categories.loadError} />;
  }
  if (!categories.length) return <p className="text-muted">{dict.categories.empty}</p>;

  const tones = ["bg-saffron-100 hover:bg-saffron-200", "bg-plum-50 hover:bg-plum-100", "bg-ink-50 hover:bg-ink-100"];
  return (
    <ul className="flex flex-wrap gap-3">
      {categories.map((category, i) => (
        <li key={category.id}>
          <Link
            href={`/${locale}/books?category=${encodeURIComponent(category.slug)}`}
            className={`inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold text-ink-900 transition-colors ${tones[i % tones.length]}`}
          >
            {category.name}
            {typeof category.books_count === "number" ? (
              <span className="rounded-full bg-surface/80 px-2 py-0.5 text-xs text-muted">{formatNumber(category.books_count, locale)}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CategoryChipsSkeleton() {
  return (
    <div className="flex flex-wrap gap-3" aria-hidden>
      {["w-32", "w-40", "w-28", "w-36", "w-24"].map((w) => (
        <Skeleton key={w} className={`h-12 rounded-full ${w}`} />
      ))}
    </div>
  );
}

async function LatestBooks({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  let page;
  try {
    page = await getLatestBooks(10);
  } catch (error) {
    return <LoadError error={error} dict={dict} title={dict.books.loadError} />;
  }
  if (!page.data.length) {
    return <EmptyState icon={<BookOpenText className="size-6" aria-hidden />} title={dict.home.emptyLatest} />;
  }
  return (
    <>
      <BookGrid>
        {page.data.map((book) => (
          <BookCard key={book.id} book={book} locale={locale} dict={dict} />
        ))}
      </BookGrid>
      {page.total > page.data.length ? (
        <div className="mt-10 text-center">
          <ButtonLink href={`/${locale}/books`} variant="secondary">
            {format(dict.books.resultsCount, { count: formatNumber(page.total, locale) })} · {dict.common.viewAll}
          </ButtonLink>
        </div>
      ) : null}
    </>
  );
}
