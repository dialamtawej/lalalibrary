import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenText, UserCheck, UserPlus } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Author, Book } from "@/lib/api/types";
import { isApiError } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/dal";
import { getAuthor, listAuthorBooks } from "@/lib/services/features";
import { getCapabilities } from "@/lib/pending/capabilities";
import { examples } from "@/lib/pending/examples";
import { followAuthorAction } from "@/actions/features";
import { FeatureGate, PendingNotice } from "@/components/pending/feature-gate";
import { BookCard, BookGrid } from "@/components/books/book-card";
import { ActionButton } from "@/components/ui/action-button";
import { ButtonLink } from "@/components/ui/button";
import { Avatar, Badge, EmptyState, Skeleton } from "@/components/ui/misc";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[lang]/authors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const author = await getAuthor(slug);
    return { title: author.name, description: author.biography?.slice(0, 160) };
  } catch {
    return {};
  }
}

export default async function AuthorPage({ params }: PageProps<"/[lang]/authors/[slug]">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page py-10 sm:py-14">
      <Suspense fallback={<Skeleton className="h-64 rounded-[var(--radius-card)]" />}>
        <AuthorContent params={params} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function AuthorContent({ params, locale, dict }: { params: PageProps<"/[lang]/authors/[slug]">["params"]; locale: Locale; dict: Dictionary }) {
  const { slug } = await params;
  return (
    <FeatureGate
      feature="authors"
      dict={dict}
      example={{ author: examples.author, books: examples.favorites.data }}
      load={async () => {
        try {
          const [author, books] = await Promise.all([getAuthor(slug), listAuthorBooks(slug)]);
          return { author, books: books.data };
        } catch (error) {
          if (isApiError(error) && error.isNotFound && !error.isMissingRoute) notFound();
          throw error;
        }
      }}
    >
      {({ author, books }) => <AuthorView author={author} books={books} locale={locale} dict={dict} />}
    </FeatureGate>
  );
}

function AuthorView({ author, books, locale, dict }: { author: Author; books: Book[]; locale: Locale; dict: Dictionary }) {
  return (
    <>
      <header className="flex flex-col items-center gap-6 rounded-[2rem] bg-gradient-to-b from-plum-50 to-surface p-8 text-center ring-1 ring-line sm:flex-row sm:text-start">
        <Avatar name={author.name} src={author.image_url} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl font-bold text-ink-900">{author.name}</h1>
          <p className="mt-2 text-muted">{format(dict.authors.booksCount, { count: formatNumber(author.books_count, locale) })}</p>
          {author.categories?.length ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              <span className="text-sm text-muted">{dict.authors.writesIn}:</span>
              {author.categories.map((c) => (
                <Link key={c.id} href={`/${locale}/books?category=${encodeURIComponent(c.slug)}`}>
                  <Badge tone="plum">{c.name}</Badge>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <Suspense fallback={null}>
          <FollowControl author={author} locale={locale} dict={dict} />
        </Suspense>
      </header>

      <section className="mt-10 max-w-3xl" aria-labelledby="about-author">
        <h2 id="about-author" className="text-lg font-bold text-ink-900">
          {dict.authors.about}
        </h2>
        <p className="mt-3 whitespace-pre-line leading-loose text-ink-800">{author.biography || dict.authors.noBio}</p>
      </section>

      <section className="mt-14" aria-labelledby="author-books">
        <span className="ornament" aria-hidden />
        <h2 id="author-books" className="mb-8 mt-2 font-display text-2xl font-bold text-ink-900">
          {dict.authors.books}
        </h2>
        {books.length ? (
          <BookGrid>
            {books.map((book) => (
              <BookCard key={book.id} book={book} locale={locale} dict={dict} />
            ))}
          </BookGrid>
        ) : (
          <EmptyState icon={<BookOpenText className="size-6" aria-hidden />} title={dict.authors.noBooks} />
        )}
      </section>
    </>
  );
}

/** زر المتابعة: يظهر فقط إذا كانت خدمة المتابعة (§10) متاحة */
async function FollowControl({ author, locale, dict }: { author: Author; locale: Locale; dict: Dictionary }) {
  const caps = await getCapabilities();
  if (!caps.follow) return <PendingNotice feature="follow" dict={dict} compact className="max-w-xs text-start" />;

  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return (
      <ButtonLink href={`/${locale}/login?next=${encodeURIComponent(`/authors/${author.slug}`)}`} variant="secondary" icon={<UserPlus className="size-4" aria-hidden />}>
        {dict.authors.loginToFollow}
      </ButtonLink>
    );
  }
  const following = !!author.viewer?.is_following;
  return (
    <ActionButton
      action={followAuthorAction.bind(null, author.id, !following)}
      variant={following ? "secondary" : "accent"}
      icon={following ? <UserCheck className="size-4" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}
      ariaPressed={following}
    >
      {following ? dict.authors.following : dict.authors.follow}
    </ActionButton>
  );
}
