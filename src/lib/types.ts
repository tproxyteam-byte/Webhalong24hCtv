export type BookingStatus = "booked" | "hold";

export interface BookingBlock {
  /** ISO date YYYY-MM-DD (inclusive) */
  start: string;
  /** ISO date YYYY-MM-DD (exclusive — checkout date) */
  end: string;
  status: BookingStatus;
  source?: string;
}

export interface PropertyPricing {
  /** VND per night — Sun→Thu */
  weekday: number;
  /** VND per night — Fri/Sat */
  weekend: number;
  /** Giảm % cho CTV (0.15 = giảm 15%) */
  ctvDiscount: number;
  /** Phụ thu lễ tết — optional */
  holiday?: number;
}

export interface Property {
  id: string;
  slug: string;
  /** Tên căn — VD "B1213 BIM 24 tầng" */
  name: string;
  /** Tòa nhà / cụm — VD "BIM Hạ Long" */
  building: string;
  /** Khu vực — VD "Bãi Cháy", "Tuần Châu", "Hồng Hải" */
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  /** Diện tích sàn (m²) */
  floorArea: number;
  maxGuests: number;
  standardGuests?: number;
  standardChildren?: number;
  amenities: string[];
  description: string;
  images: string[];
  pricing: PropertyPricing;
  bookings: BookingBlock[];
  ownerName: string;
  ownerNote?: string;
  ownerPhone?: string | null;
  /** ISO date — lần cập nhật cuối từ Manager app */
  updatedAt: string;
}

export type DayStatus = "avail" | "hold" | "booked";
