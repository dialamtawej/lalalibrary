/**
 * أنواع البيانات كما يعيدها Laravel API.
 * أي تغيير في استجابات الباك إند يجب أن ينعكس هنا.
 */

export type Role = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
};

export type BanInfo = {
  is_banned: boolean;
  ban_until: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  image: string | null;
  image_url: string | null;
  ban_info: BanInfo | null;
  created_at: string | null;
  roles?: Role[];
};

export type UserProfile = {
  user_id: number;
  display_name: string | null;
  bio: string | null;
};

export type UserDetails = User & { profile: UserProfile | null };

export type CategoryStatus = "active" | "inactive";

export type Category = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  books_count?: number;
  parent?: { id: number; name: string } | null;
  created_at?: string | null;
};

export type Book = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  cover_url: string | null;
  has_ebook: boolean;
  created_at: string | null;
  updated_at: string | null;
  categories: Category[];
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type BookSort = "latest" | "oldest" | "title";

export type BookQuery = {
  search?: string;
  category?: string;
  sort?: BookSort;
  page?: number;
  per_page?: number;
};

export type UserStatusFilter = "all" | "active" | "banned";

export type UserQuery = {
  search?: string;
  status?: UserStatusFilter;
  page?: number;
  per_page?: number;
};

/* =========================================================================
 * أنواع الميزات بانتظار الباك إند — مطابقة لـ docs/BACKEND_PENDING.md
 * ========================================================================= */

export type PublicUser = { id: number; name: string; image_url: string | null };

/* ---- §2 Editions & Authors ---- */

export type AuthorRef = { id: number; name: string; slug: string; role?: string };

export type Author = {
  id: number;
  name: string;
  slug: string;
  biography: string | null;
  image_url: string | null;
  books_count: number;
  categories?: Pick<Category, "id" | "name" | "slug">[];
  /** موجود فقط عند إرسال توكن (§10) */
  viewer?: { is_following: boolean } | null;
};

export type Product = {
  id: number;
  price: string;
  currency: string;
  stock: number;
  in_stock: boolean;
  shipping_info?: string | null;
  status?: "active" | "hidden";
};

export type Edition = {
  id: number;
  format: "ebook" | "paperback";
  language: { code: string; name: string } | null;
  publisher: { id: number; name: string } | null;
  publication_date: string | null;
  page_count: number | null;
  product?: Product | null;
};

export type Rating = { average: number; count: number };

export type LibraryStatus = "want_to_read" | "reading" | "finished";

export type BookViewer = {
  library_status: LibraryStatus | null;
  is_favorite: boolean;
  my_review_id: number | null;
};

/** الكتاب بعد اكتمال §2 و §4 و §5 — كل الحقول الجديدة اختيارية حتى تعمل الواجهة قبلها وبعدها */
export type BookFull = Book & {
  authors?: AuthorRef[];
  editions?: Edition[];
  rating?: Rating | null;
  viewer?: BookViewer | null;
};

/* ---- §3 Reading ---- */

export type ReadingProgress = { page: number; total_pages: number; percent: number; updated_at: string | null };

/* ---- §4 Library & Favorites ---- */

export type LibraryItem = {
  book: Book;
  status: LibraryStatus;
  added_at: string;
  progress?: ReadingProgress | null;
};

/* ---- §5 Reviews ---- */

export type Review = {
  id: number;
  rating: number;
  body: string | null;
  user: PublicUser;
  created_at: string;
  updated_at: string;
  /** في قوائم الأدمن فقط */
  book?: Pick<Book, "id" | "title" | "slug">;
  reports_count?: number;
};

export type ReportReason = "spam" | "offensive" | "spoiler" | "other";

export type ReviewReport = {
  id: number;
  reason: ReportReason;
  note: string | null;
  status: "open" | "resolved";
  review: Review;
  reporter: PublicUser;
  created_at: string;
};

/* ---- §6 Store ---- */

export type StoreProduct = Product & {
  book: Pick<Book, "id" | "title" | "slug" | "cover_url"> & { authors?: AuthorRef[] };
};

/* ---- §7 Cart ---- */

export type CartItem = {
  id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  available: boolean;
  product: { id: number; stock: number; book: Pick<Book, "id" | "title" | "slug" | "cover_url"> };
};

export type Cart = {
  items: CartItem[];
  subtotal: string;
  shipping: string;
  total: string;
  currency: string;
  count: number;
};

/* ---- §8 Orders ---- */

export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: number;
  number: string;
  status: OrderStatus;
  payment_method: "cod";
  items: { title: string; quantity: number; unit_price: string; line_total: string; book_slug: string | null }[];
  subtotal: string;
  shipping: string;
  total: string;
  currency: string;
  shipping_address: { name: string; phone: string; city: string; address: string; notes?: string | null };
  history: { status: OrderStatus; at: string }[];
  created_at: string;
  /** في قوائم الأدمن */
  user?: PublicUser & { email?: string };
};

/* ---- §10 Notifications ---- */

export type NotificationType = "new_book" | "author_new_book" | "book_updated" | "order_status_changed" | "back_in_stock" | "promotion";

export type AppNotification = {
  id: string;
  type: NotificationType;
  data: { type: NotificationType; title: string; body: string; url: string | null };
  read_at: string | null;
  created_at: string;
};

/* ---- §11 Recommendations ---- */

export type Recommendations = { for_reading: Book[]; for_buying: StoreProduct[] };

/* ---- §12 Admin stats ---- */

export type AdminStats = {
  books: number;
  users: number;
  users_banned: number;
  orders: { total: number; pending: number; revenue: string; currency: string };
  reading: { active_readers_30d: number };
  reviews: { total: number; reported_open: number };
  top_books: { id: number; title: string; reads: number }[];
  low_stock: { product_id: number; title: string; stock: number }[];
};
