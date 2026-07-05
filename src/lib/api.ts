import { addDays, todayISO } from "./format";
import type { BookingBlock, BookingStatus, Property, PropertyPricing } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.halong24h.com";

export interface ApiProperty {
  id: string;
  code: string;
  name: string;
  type: number;
  view: string | null;
  address: string | null;
  ownerPhone: string | null;
  days: {
    date: string;
    price: number;
    status: string;
    note?: string;
  }[];
}

const VILLA_IMAGES = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
  "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
];

const APARTMENT_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80",
];

const STUDIO_IMAGES = [
  "https://images.unsplash.com/photo-1522444195799-478538b28823?w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80",
];

const AMENITY_MAP: { [key: string]: string } = {
  "ac": "Điều hòa",
  "wifi": "Wi-Fi",
  "tv": "Smart TV",
  "kitchen": "Bếp đầy đủ",
  "fridge": "Tủ lạnh",
  "microwave": "Lò vi sóng",
  "induction-cooker": "Bếp từ",
  "dishware": "Bát đĩa",
  "free-water": "Nước uống miễn phí",
  "bathtub": "Bồn tắm",
  "shower": "Vòi hoa sen",
  "hot-water": "Nước nóng",
  "hair-dryer": "Máy sấy tóc",
  "towels": "Khăn tắm",
  "toiletries": "Đồ vệ sinh cá nhân",
  "pool": "Hồ bơi",
  "seaview": "View biển",
  "washing-machine": "Máy giặt",
  "wardrobe": "Tủ quần áo",
  "elevator": "Thang máy",
  "kids-area": "Khu vui chơi trẻ em",
  "bbq": "BBQ ngoài trời",
  "garden": "Sân vườn",
};

function getImages(name: string): string[] {
  const n = name.toLowerCase();
  if (n.includes("villa") || n.includes("feria") || n.includes("biệt thự")) {
    return VILLA_IMAGES;
  }
  if (n.includes("studio") || n.includes("alacarte") || n.includes("b1503")) {
    return STUDIO_IMAGES;
  }
  return APARTMENT_IMAGES;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function calculatePricing(days: ApiProperty["days"]): PropertyPricing {
  const weekdays: number[] = [];
  const weekends: number[] = [];

  for (const day of days) {
    const d = new Date(day.date + "T00:00:00");
    const dow = d.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    const isWeekend = dow === 5 || dow === 6;

    if (isWeekend) {
      weekends.push(day.price);
    } else {
      weekdays.push(day.price);
    }
  }

  const getMode = (arr: number[], fallback: number): number => {
    if (arr.length === 0) return fallback;
    const counts: { [val: number]: number } = {};
    let maxVal = arr[0];
    let maxCount = 0;
    for (const val of arr) {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        maxVal = val;
      }
    }
    return maxVal;
  };

  const weekdayPrice = getMode(weekdays, 1200000);
  const weekendPrice = getMode(weekends, 1800000);

  return {
    weekday: weekdayPrice,
    weekend: weekendPrice,
    ctvDiscount: 0, // Prices returned by public API are net CTV prices
  };
}

export function getBookingsFromDays(days: ApiProperty["days"]): BookingBlock[] {
  const bookings: BookingBlock[] = [];
  let currentBlock: BookingBlock | null = null;

  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

  for (const day of sortedDays) {
    const apiStatus = day.status.trim().toLowerCase();
    let status: BookingStatus | null = null;

    if (apiStatus !== "available") {
      status = apiStatus === "hold" ? "hold" : "booked";
    }

    if (status) {
      const dateStr = day.date;
      const nextDateStr = addDays(dateStr, 1);

      if (
        currentBlock &&
        currentBlock.status === status &&
        currentBlock.end === dateStr
      ) {
        currentBlock.end = nextDateStr;
        if (day.note && !currentBlock.source?.includes(day.note)) {
          currentBlock.source = currentBlock.source ? `${currentBlock.source}, ${day.note}` : day.note;
        }
      } else {
        currentBlock = {
          start: dateStr,
          end: nextDateStr,
          status,
          source:
            day.note || (status === "hold" ? "Đang giữ chỗ" : "Đã đặt"),
        };
        bookings.push(currentBlock);
      }
    } else {
      currentBlock = null;
    }
  }

  return bookings;
}

function findGridProperty(
  properties: ApiProperty[],
  details: { id?: unknown; code?: unknown },
): ApiProperty | undefined {
  const propertyId = String(details.id ?? "").trim();
  const propertyCode = String(details.code ?? "").trim().toLowerCase();

  return properties.find((property) => {
    const gridId = String(property.id ?? "").trim();
    const gridCode = String(property.code ?? "").trim().toLowerCase();

    return (
      (propertyId !== "" && gridId === propertyId) ||
      (propertyCode !== "" && gridCode === propertyCode)
    );
  });
}

function parsePropertyMetadata(p: any) {
  const nameLower = p.name.toLowerCase();
  const addressStr = p.address || "";
  const addressLower = addressStr.toLowerCase();

  let building = p.address || "Hạ Long";
  if (addressLower.includes("alacarte")) building = "Tòa Alacarte";
  else if (addressLower.includes("bim")) building = "BIM Hạ Long";
  else if (addressLower.includes("citadines")) building = "Citadines Marina";
  else if (addressLower.includes("royal")) building = "Royal Park Hạ Long";
  else if (addressLower.includes("vinhomes")) building = "Vinhomes Dragon Bay";
  else if (addressLower.includes("feria") || addressLower.includes("grand city")) building = "Sun Grand City Feria";
  else if (addressLower.includes("sun premier")) building = "Sun Premier Village";

  let area = "Bãi Cháy";
  if (addressLower.includes("hùng thắng") || addressLower.includes("hung thang") || addressLower.includes("bim") || addressLower.includes("citadines")) {
    area = "Hùng Thắng";
  } else if (addressLower.includes("tuần châu") || addressLower.includes("tuan chau")) {
    area = "Tuần Châu";
  } else if (addressLower.includes("hồng hải") || addressLower.includes("hong hai") || addressLower.includes("cột 5") || addressLower.includes("cot 5")) {
    area = "Hồng Hải";
  }

  let bedrooms = 2;
  let bathrooms = 2;
  let floorArea = 75;
  let maxGuests = 6;
  let amenities = ["Bếp đầy đủ", "Máy giặt", "Wi-Fi", "Smart TV", "Điều hòa"];
  let description = "Căn hộ homestay đẹp, đầy đủ tiện nghi tại Hạ Long. Vị trí thuận lợi di chuyển đến các khu du lịch, thích hợp cho gia đình hoặc nhóm bạn nghỉ ngơi.";

  if (nameLower.includes("villa") || nameLower.includes("feria") || p.type === 2) {
    if (nameLower.includes("villa")) {
      bedrooms = 5;
      bathrooms = 5;
      floorArea = 320;
      maxGuests = 14;
      amenities = ["Villa biển", "Hồ bơi riêng", "BBQ ngoài trời", "Bếp lớn", "Bãi đỗ xe", "Wi-Fi"];
      description = "Biệt thự nghỉ dưỡng cao cấp với thiết kế sang trọng, hồ bơi riêng biệt lập, không gian sân vườn nướng BBQ lý tưởng cho các buổi tụ họp gia đình, cơ quan.";
    } else {
      bedrooms = 4;
      bathrooms = 4;
      floorArea = 250;
      maxGuests = 12;
      amenities = ["View biển", "Sân vườn", "BBQ ngoài trời", "Bếp đầy đủ", "Wi-Fi", "Smart TV"];
      description = "Căn biệt thự Feria thuộc quần thể Sun Group, gần sát bãi biển Bãi Cháy. Tiện ích hiện đại, không gian riêng tư, đầy đủ trang thiết bị gia đình.";
    }
  } else if (nameLower.includes("studio") || nameLower.includes("b1503") || nameLower.includes("alacarte")) {
    bedrooms = 0;
    bathrooms = 1;
    floorArea = 35;
    maxGuests = 2;
    amenities = ["Studio", "View biển", "Mini bar", "Wi-Fi", "Smart TV", "Bồn tắm"];
    description = "Căn hộ Studio tầng cao tại tòa tháp Alacarte view trực diện Vịnh Hạ Long cực kỳ lãng mạn. Phù hợp cho cặp đôi đi du lịch hoặc công tác.";
  } else if (nameLower.includes("1pn") || nameLower.includes("1 phòng ngủ")) {
    bedrooms = 1;
    bathrooms = 1;
    floorArea = 48;
    maxGuests = 3;
    description = "Căn hộ 1 phòng ngủ ấm cúng, thiết kế hiện đại. Gần trung tâm du lịch Bãi Cháy, an ninh 24/7.";
  }

  if (p.view === "sea" && !amenities.includes("View biển") && !amenities.includes("Villa biển")) {
    amenities.unshift("View biển");
  } else if (p.view === "city" && !amenities.includes("View thành phố")) {
    amenities.unshift("View thành phố");
  }

  return {
    building,
    area,
    bedrooms,
    bathrooms,
    floorArea,
    maxGuests,
    amenities,
    description,
  };
}

/**
 * Hợp nhất 1 căn từ grid lịch (`ApiProperty`, có `days`) với phần chi tiết
 * (`details` — `PropertyCardDto` từ endpoint properties public) thành `Property`
 * cho UI. Dùng chung cho cả danh sách tất cả căn lẫn danh sách theo owner.
 *
 * Lưu ý: `PropertyCardDto` KHÔNG có field `host` — thông tin chủ nhà nằm ở
 * `data.owner` (cùng cấp với `items`). Vì vậy `ownerName` được truyền vào.
 */
function buildProperty(p: ApiProperty, details: any, ownerName?: string): Property {
  const meta = parsePropertyMetadata(p);
  const pricing = calculatePricing(p.days);
  const bookings = getBookingsFromDays(p.days);

  const rawAmenities = details?.amenities || [];
  const mappedAmenities = rawAmenities.map((a: string) => AMENITY_MAP[a] || a);

  let images = getImages(p.name);
  if (details?.images && details.images.length > 0) {
    const sortedImages = [...details.images].sort((a: any, b: any) => a.order - b.order);
    images = sortedImages.map((img: any) => img.imageUrl);
  }

  return {
    id: p.id,
    slug: details?.slug || `${slugify(p.name)}-${p.id.substring(0, 4)}`,
    name: p.name,
    building: details?.address || meta.building,
    area: meta.area,
    address: details?.address || p.address || "Hạ Long, Quảng Ninh",
    bedrooms: details?.bedrooms !== undefined ? details.bedrooms : meta.bedrooms,
    bathrooms: details?.bathrooms !== undefined ? details.bathrooms : meta.bathrooms,
    floorArea: details?.floorArea || meta.floorArea,
    maxGuests: details?.maxGuests !== undefined ? details.maxGuests : meta.maxGuests,
    amenities: mappedAmenities.length > 0 ? mappedAmenities : meta.amenities,
    description: details?.description || meta.description,
    images,
    pricing: {
      weekday: details?.weekdayPrice || pricing.weekday,
      weekend: details?.weekendPrice || pricing.weekend,
      ctvDiscount: 0,
      holiday: details?.holidayPrice || undefined,
    },
    bookings,
    ownerName: ownerName || details?.host?.name || "Anh Tuấn",
    ownerNote: details?.rules || (p.ownerPhone ? `Liên hệ sđt: ${p.ownerPhone}` : "Nhận khách từ 14:00, trả phòng trước 12:00."),
    ownerPhone: p.ownerPhone || null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getProperties(
  startDate?: string,
  endDate?: string,
  ownerId?: string
): Promise<{
  properties: Property[];
  owner?: {
    id: string;
    name: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  error?: string;
}> {
  const start = startDate || todayISO();
  const end = endDate || addDays(start, 90);

  let publicPropsList: any[] = [];
  let ownerInfo: any = undefined;

  try {
    if (ownerId) {
      try {
        const ownerRes = await fetch(`${API_URL}/properties/public/by-owner/${ownerId}`, {
          next: { revalidate: 60 },
        });
        if (!ownerRes.ok) {
          return {
            properties: [],
            error: "Link không hợp lệ hoặc đã bị thu hồi",
          };
        }
        const ownerJson = await ownerRes.json();
        if (ownerJson.success && ownerJson.data) {
          publicPropsList = ownerJson.data.items || [];
          ownerInfo = ownerJson.data.owner || undefined;
        } else {
          return {
            properties: [],
            error: ownerJson.message || "Link không hợp lệ hoặc đã bị thu hồi",
          };
        }
      } catch (err: any) {
        console.error("Error loading properties by owner:", err);
        return {
          properties: [],
          error: "Link không hợp lệ hoặc đã bị thu hồi",
        };
      }
    } else {
      const propsRes = await fetch(`${API_URL}/properties/public`, {
        next: { revalidate: 60 },
      });
      if (!propsRes.ok) {
        throw new Error(`Failed to fetch public properties: ${propsRes.statusText}`);
      }
      const propsJson = await propsRes.json();
      publicPropsList = propsJson.data || [];
    }

    const gridRes = await fetch(
      `${API_URL}/calendar/public-grid?startDate=${start}&endDate=${end}`,
      {
        cache: "no-store",
      }
    );

    if (!gridRes.ok) {
      throw new Error(`Failed to fetch calendar grid: ${gridRes.statusText}`);
    }

    const gridJson = await gridRes.json();
    if (!gridJson.success || !gridJson.data || !gridJson.data.properties) {
      throw new Error(gridJson.message || "Invalid API response structure");
    }

    const gridProps: ApiProperty[] = gridJson.data.properties;

    const mappedProperties = gridProps
      .filter((p) => {
        if (ownerId) {
          // Only show properties that match the owner's items list
          return publicPropsList.some((item) => item.id === p.id);
        }
        return true;
      })
      .map((p) => {
        const details = publicPropsList.find((item) => item.id === p.id);
        return buildProperty(p, details, ownerInfo?.name);
      });

    return {
      properties: mappedProperties,
      owner: ownerInfo,
      error: undefined,
    };
  } catch (error: any) {
    console.error("Error in getProperties API fetch:", error);
    return {
      properties: [],
      error: error?.message || "Lỗi hệ thống khi tải danh sách căn.",
    };
  }
}

/** Chủ nhà (OWNER) trả về từ endpoint public by-owner. */
export interface PublicOwner {
  id: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface OwnerPropertiesResult {
  owner: PublicOwner;
  properties: Property[];
}

/**
 * Lấy danh sách phòng công khai của 1 OWNER cho trang share Zalo
 * (`/zalo-cal/:ownerId`). Consume 2 endpoint public BE:
 *   - GET /properties/public/by-owner/:ownerId  → { owner, items, total }
 *   - GET /calendar/public-grid?propertyIds=…&startDate=…&endDate=…
 *
 * Trả `null` khi owner không tồn tại / không còn entitlement (BE trả 404,
 * theo visibility rule §4.1) hoặc khi gọi API lỗi — page sẽ render notFound.
 */
export async function getPropertiesByOwner(
  ownerId: string,
  startDate?: string,
  endDate?: string
): Promise<OwnerPropertiesResult | null> {
  const start = startDate || todayISO();
  const end = endDate || addDays(start, 90);

  try {
    const ownerRes = await fetch(
      `${API_URL}/properties/public/by-owner/${encodeURIComponent(ownerId)}`,
      { next: { revalidate: 60 } }
    );
    if (ownerRes.status === 404) return null;
    if (!ownerRes.ok) {
      throw new Error(`Failed to fetch owner properties: ${ownerRes.statusText}`);
    }

    // Mọi endpoint Halong24h đều bọc qua global ResponseInterceptor:
    // { success, message, data: { owner, items, total } }.
    const ownerJson = await ownerRes.json();
    const owner: PublicOwner | undefined = ownerJson.data?.owner;
    const items: any[] = ownerJson.data?.items || [];

    if (!owner) {
      throw new Error("Invalid by-owner response structure");
    }

    if (items.length === 0) {
      return { owner, properties: [] };
    }

    const propertyIds = items.map((it) => it.id).join(",");
    const gridRes = await fetch(
      `${API_URL}/calendar/public-grid?propertyIds=${encodeURIComponent(
        propertyIds
      )}&startDate=${start}&endDate=${end}`,
      { next: { revalidate: 60 } }
    );
    if (!gridRes.ok) {
      throw new Error(`Failed to fetch calendar grid: ${gridRes.statusText}`);
    }

    const gridJson = await gridRes.json();
    const gridProps: ApiProperty[] = gridJson.data?.properties || [];

    const properties = items.map((details) => {
      const gridProp = gridProps.find((g) => g.id === details.id);
      // Căn chưa có ô lịch nào trong khoảng query → vẫn hiển thị, days rỗng.
      const apiProp: ApiProperty = gridProp ?? {
        id: details.id,
        code: details.code ?? "",
        name: details.name,
        type: details.type ?? 1,
        view: details.view ?? null,
        address: details.address ?? null,
        ownerPhone: owner.phone,
        days: [],
      };
      return buildProperty(apiProp, details, owner.name);
    });

    return { owner, properties };
  } catch (error) {
    console.error(`Error in getPropertiesByOwner for ${ownerId}:`, error);
    return null;
  }
}

export async function getPropertyDetail(
  slug: string
): Promise<Property | null> {
  const today = todayISO();
  const start = today;
  const end = addDays(start, 90);

  try {
    const res = await fetch(`${API_URL}/properties/public/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch property detail: ${res.statusText}`);
    }
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || "Invalid API response");
    }
    const details = json.data;
    const gridRes = await fetch(
      `${API_URL}/calendar/public-grid?startDate=${start}&endDate=${end}`,
      {
        cache: "no-store",
      }
    );
    if (!gridRes.ok) {
      throw new Error(`Failed to fetch grid for bookings: ${gridRes.statusText}`);
    }
    const gridJson = await gridRes.json();
    const gridProps: ApiProperty[] = gridJson.data?.properties || [];
    const gridProp = findGridProperty(gridProps, details);

    const bookings = gridProp ? getBookingsFromDays(gridProp.days) : [];

    const rawAmenities = details.amenities || [];
    const mappedAmenities = rawAmenities.map((a: string) => AMENITY_MAP[a] || a);

    let images = getImages(details.name);
    if (details.images && details.images.length > 0) {
      const sortedImages = [...details.images].sort((a: any, b: any) => a.order - b.order);
      images = sortedImages.map((img: any) => img.imageUrl);
    }

    const meta = parsePropertyMetadata({
      id: details.id,
      code: details.code,
      name: details.name,
      type: details.type,
      view: details.view,
      address: details.address,
    });

    return {
      id: details.id,
      slug: details.slug,
      name: details.name,
      building: details.address || meta.building,
      area: meta.area,
      address: details.address || "Hạ Long, Quảng Ninh",
      bedrooms: details.bedrooms !== undefined ? details.bedrooms : meta.bedrooms,
      bathrooms: details.bathrooms !== undefined ? details.bathrooms : meta.bathrooms,
      floorArea: details.floorArea || meta.floorArea,
      maxGuests: details.maxGuests !== undefined ? details.maxGuests : meta.maxGuests,
      amenities: mappedAmenities.length > 0 ? mappedAmenities : meta.amenities,
      description: details.description || meta.description,
      images,
      pricing: {
        weekday: details.weekdayPrice || 1200000,
        weekend: details.weekendPrice || 1800000,
        ctvDiscount: 0,
        holiday: details.holidayPrice || undefined,
      },
      bookings,
      ownerName: details.host?.name || "Anh Tuấn",
      ownerNote: details.rules || "Nhận khách từ 14:00, trả phòng trước 12:00.",
      ownerPhone: gridProp?.ownerPhone || null,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error in getPropertyDetail for slug ${slug}:`, error);
    return null;
  }
}
