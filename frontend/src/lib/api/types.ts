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
