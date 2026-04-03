/**
 * カテゴリ定義（単一ソース）
 *
 * 新しいカテゴリを追加するには:
 * 1. ここに定義を追加
 * 2. global.css に badge-<id> / card-thumb-<id> / CSS変数を追加
 */

export interface CategoryDef {
  /** 表示名（記事の frontmatter で使う値） */
  readonly label: string;
  /** CSS クラス用 ID（英小文字） */
  readonly id: string;
  /** カードのアイコン絵文字 */
  readonly icon: string;
}

export const categories = [
  { label: 'ゲーム', id: 'game', icon: '🎮' },
  { label: 'IT',     id: 'it',   icon: '💻' },
  { label: 'FX',     id: 'fx',   icon: '📈' },
  { label: 'その他', id: 'other', icon: '📝' },
] as const satisfies readonly CategoryDef[];

/** カテゴリの表示名一覧（スキーマ用） */
export const categoryLabels = categories.map((c) => c.label);

/** 表示名 → 定義 の lookup */
export const categoryByLabel = Object.fromEntries(
  categories.map((c) => [c.label, c])
) as Record<string, CategoryDef>;

/** フォールバック定義（未知カテゴリ用） */
export const fallbackCategory: CategoryDef = { label: 'その他', id: 'other', icon: '📝' };

/** 表示名から CSS クラス名を取得 */
export function thumbClass(label: string): string {
  return `card-thumb-${(categoryByLabel[label] ?? fallbackCategory).id}`;
}

export function badgeClass(label: string): string {
  return `badge-${(categoryByLabel[label] ?? fallbackCategory).id}`;
}

export function categoryIcon(label: string): string {
  return (categoryByLabel[label] ?? fallbackCategory).icon;
}
