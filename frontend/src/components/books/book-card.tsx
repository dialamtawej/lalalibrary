import Link from "next/link";
import { BookOpenText } from "lucide-react";
import type { Book } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { Badge, Skeleton } from "@/components/ui/misc";
import { BookCover } from "./book-cover";

export function BookCard({ book, locale, dict, priority }: { book: Book; locale: Locale; dict: Dictionary; priority?: boolean }) {
  const category = book.categories[0];
  return (
    <article className="group relative flex flex-col">
      <div className="transition-transform duration-300 group-hover:-translate-y-1.5">
        <BookCover title={book.title} src={book.cover_url} seed={book.id} priority={priority} />
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-1.5">
        {category ? <p className="truncate text-xs font-semibold text-plum-600">{category.name}</p> : null}
        <h3 className="line-clamp-2 font-semibold leading-snug text-ink-900">
          <Link href={`/${locale}/books/${book.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none group-focus-within:underline">
            {book.title}
          </Link>
        </h3>
        {book.has_ebook ? (
          <div>
            <Badge tone="saffron" icon={<BookOpenText className="size-3.5" aria-hidden />}>
              {dict.books.ebook}
            </Badge>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function BookGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}

export function BookGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <BookGrid>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] rounded-e-lg rounded-s-sm" />
          <Skeleton className="mt-3 h-3 w-1/3" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </BookGrid>
  );
}
