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
  /** カードのアイコン絵文字（フォールバック用） */
  readonly icon: string;
  /** サムネ背景色（ダーク） */
  readonly thumbBg: string;
  /** サムネ背景色（ライト） */
  readonly thumbBgLight: string;
  /** サムネテキスト色 */
  readonly thumbText: string;
  /** サムネアクセント色（SVGモチーフ用） */
  readonly thumbAccent: string;
  /** サムネアクセント色（ライト用） */
  readonly thumbAccentLight: string;
  /** eyebrow色 */
  readonly eyebrowColor: string;
  /** eyebrowラベル */
  readonly eyebrowLabel: string;
}

export const categories = [
  { label: 'ゲーム', id: 'game', icon: '🎮', thumbBg: '#243656', thumbBgLight: '#a8c8e8', thumbText: '#c8d8f8', thumbAccent: '#6B9EF7', thumbAccentLight: '#1d4ed8', eyebrowColor: '#8db4f0', eyebrowLabel: 'GAME' },
  { label: 'IT',     id: 'it',   icon: '💻', thumbBg: '#223830', thumbBgLight: '#8edcac', thumbText: '#c0e8d0', thumbAccent: '#5CE896', thumbAccentLight: '#166534', eyebrowColor: '#7ad4a0', eyebrowLabel: 'TECH' },
  // FX: 記事を掲載しない方針にしたため一旦外している（2026-08-13）。
  //     再開するときはこの行を戻すだけでよい（global.css の badge-fx / card-thumb-fx は残してある）。
  // { label: 'FX',     id: 'fx',   icon: '📈', thumbBg: '#2e2820', thumbBgLight: '#f9d06a', thumbText: '#e8d8c0', thumbAccent: '#F7B02E', thumbAccentLight: '#92400e', eyebrowColor: '#d4a050', eyebrowLabel: 'TRADE' },
  { label: 'その他', id: 'other', icon: '📝', thumbBg: '#252525', thumbBgLight: '#d1d5db', thumbText: '#c8c8c8', thumbAccent: '#B0B8C4', thumbAccentLight: '#374151', eyebrowColor: '#999', eyebrowLabel: 'ETC' },
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
