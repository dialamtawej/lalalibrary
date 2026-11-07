import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { Skeleton } from "@/components/ui/misc";

export default function AccountLayout({ children }: LayoutProps<"/[lang]/account">) {
  return (
    <div className="container-page max-w-6xl py-8 sm:py-12">
      <Suspense fallback={<Skeleton className="h-14 rounded-full" />}>
        <AccountNav />
      </Suspense>
      <div className="mt-8">{children}</div>
    </div>
  );
}
