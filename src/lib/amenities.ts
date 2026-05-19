/**
 * Quick amenity filter — bộ tiện ích hay được khách hỏi nhất khi đặt villa.
 * Match qua substring (lowercase, không phân biệt dấu) trong array amenities của căn.
 */

export type AmenityCategory = "view" | "feature";

export interface QuickAmenity {
  /** Key dùng trong filter state */
  id: string;
  /** Label hiển thị trên chip + dropdown */
  label: string;
  /** Phân loại — "view" cho dropdown View, "feature" cho dropdown Tiện ích */
  category: AmenityCategory;
  /** Substring patterns — căn match nếu CÓ ÍT NHẤT 1 amenity chứa 1 trong các pattern này */
  patterns: string[];
}

export const QUICK_AMENITIES: QuickAmenity[] = [
  { id: "sea-view", label: "View biển", category: "view", patterns: ["view biển", "view vịnh", "biển", "vịnh"] },
  { id: "marina-view", label: "View marina", category: "view", patterns: ["view marina", "marina"] },
  { id: "city-view", label: "View thành phố", category: "view", patterns: ["view thành phố", "thành phố"] },
  { id: "private-pool", label: "Hồ bơi riêng", category: "feature", patterns: ["bể bơi riêng", "hồ bơi riêng"] },
  { id: "bbq", label: "BBQ", category: "feature", patterns: ["bbq"] },
  { id: "karaoke", label: "Karaoke", category: "feature", patterns: ["karaoke"] },
  { id: "parking", label: "Bãi đỗ xe", category: "feature", patterns: ["đỗ xe", "bãi đỗ"] },
  { id: "kitchen", label: "Bếp đầy đủ", category: "feature", patterns: ["bếp đầy đủ", "bếp lớn"] },
];

/** Lowercase + strip Vietnamese accents — for fuzzy match */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

export function propertyMatchesAmenities(
  amenities: readonly string[],
  selectedIds: readonly string[],
): boolean {
  if (selectedIds.length === 0) return true;
  const normalizedAmenities = amenities.map(normalize);
  return selectedIds.every((id) => {
    const def = QUICK_AMENITIES.find((a) => a.id === id);
    if (!def) return true;
    const normalizedPatterns = def.patterns.map(normalize);
    return normalizedAmenities.some((a) =>
      normalizedPatterns.some((p) => a.includes(p)),
    );
  });
}

/** Lấy primary view label cho 1 căn — hiển thị badge dưới tên */
export function getPrimaryViewLabel(amenities: readonly string[]): string | null {
  const normalizedAmenities = amenities.map(normalize);
  for (const def of QUICK_AMENITIES.filter((a) => a.category === "view")) {
    const normalizedPatterns = def.patterns.map(normalize);
    if (normalizedAmenities.some((a) => normalizedPatterns.some((p) => a.includes(p)))) {
      return def.label;
    }
  }
  return null;
}
