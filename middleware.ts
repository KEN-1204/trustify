import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // レスポンスを作成し、それをsupabaseクライアントに渡すことで、レスポンスヘッダーを変更できるようにする
  const res = NextResponse.next();
  // 認証されたSupabaseクライアントを作成する
  const supabase = createMiddlewareClient({ req, res });

  // // ====================== 🌟パターン1 ======================
  // // セッションがあるかどうか確認する
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // // if user is signed in and the current path is / redirect the user to /account
  // // もしユーザーがサインイン済みで現在のパスが「/」なら「/account」にリダイレクト
  // if (user && req.nextUrl.pathname === "/") {
  //   return NextResponse.redirect(new URL("/account", req.url));
  // }

  // // if user is not signed in and the current path is not / redirect the user to /
  // // もしユーザーがサインインしておらず、現在のパスが「/」でないなら「/」にリダイレクト
  // if (!user && req.nextUrl.pathname !== "/") {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  return res;

  // ====================== 🌟パターン2 ======================
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth condition
  if (session?.user.email?.endsWith("@gmail.com")) {
    // Authentication successful, forward request to protected route.
    // 認証に成功し、保護されたルートにリクエストを転送します。
    return res;
  }

  // Auth condition not met, redirect to home page.
  // Auth条件が満たされていないため、ホームページへリダイレクトします。
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = "/";
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/", "/account"],
};

// ============== パターン2 =================
// export const config = {
//   matcher: "/middleware-protected/:path*",
// };
