import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.halong24h.com";
const LOGIN_URL = `${API_URL}/auth/login`;
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function findValue(value: unknown, keys: string[]): unknown {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }

  for (const child of Object.values(record)) {
    const found = findValue(child, keys);
    if (found !== undefined) return found;
  }

  return undefined;
}

function getJwtRole(token: string): unknown {
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return findValue(decoded, ["role"]);
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  let credentials: unknown;

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Dữ liệu đăng nhập không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    const result = await upstreamResponse.json();
    const accessToken = findValue(result, ["accessToken", "access_token"]);
    const refreshToken = findValue(result, ["refreshToken", "refresh_token"]);
    const responseRole = findValue(result, ["role"]);
    const role = Number(
      responseRole ??
        (typeof accessToken === "string" ? getJwtRole(accessToken) : undefined),
    );
    const loginSucceeded =
      upstreamResponse.ok &&
      result.success !== false &&
      typeof accessToken === "string";

    const normalizedResult = loginSucceeded
      ? {
          ...result,
          success: true,
          data: {
            ...(result.data && typeof result.data === "object"
              ? result.data
              : {}),
            role,
          },
        }
      : result;
    const response = NextResponse.json(normalizedResult, {
      status: upstreamResponse.status,
    });

    if (loginSucceeded && role === 2) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      };

      response.cookies.set(
        "accessToken",
        accessToken,
        cookieOptions,
      );
      response.cookies.set(
        "refreshToken",
        typeof refreshToken === "string" ? refreshToken : "",
        cookieOptions,
      );
    }

    return response;
  } catch (error) {
    console.error("Login API proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
      },
      { status: 502 },
    );
  }
}
