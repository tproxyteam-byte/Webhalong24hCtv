import { NextResponse } from "next/server";
import { getProperties } from "@/lib/api";
import { addDays, todayISO } from "@/lib/format";

export async function GET() {
  const today = todayISO();
  const properties = await getProperties(today, addDays(today, 90));

  return NextResponse.json({ success: true, data: properties });
}
