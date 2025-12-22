// typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Разрешаем статические и публичные пути (не обрабатываем их здесь)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Определяем защищённые области
  const employeeRoutes = ["/Empdashboard", "/empdashboard", "/empjob", "/empboarding"];
  const userRoutes = ["/dashboard", "/userjob", "/boarding", "/appbar/profile"];

  const isEmployeeRoute = employeeRoutes.some((r) => pathname.startsWith(r));
  const isUserRoute = userRoutes.some((r) => pathname.startsWith(r));

  // Получаем токен next-auth (настройте секрет в ENV: NEXTAUTH_SECRET)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Если нет токена — редирект на соответствующую страницу входа
  if (!token) {
    const dest = isEmployeeRoute ? "/Employeeauth" : "/auth";
    const url = req.nextUrl.clone();
    url.pathname = dest;
    // Передаём исходный путь в качестве callbackUrl
    url.search = `callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  // Простейшая проверка роли для employee-райтов.
  // Подгоните поле под ваш токен (например token.role, token.user?.role и т.д.)
  if (isEmployeeRoute) {
    const role = (token as any).role ?? (token as any).user?.role;
    if (!role || role !== "employee") {
      const url = req.nextUrl.clone();
      url.pathname = "/Employeeauth";
      url.search = `callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  // Для других защищённых маршрутов — пропускаем (токен уже есть)
  return NextResponse.next();
}

/*
 Конфигурация: применяем middleware только к потенциально защищённым маршрутам,
 чтобы избежать лишних вызовов на все запросы.
*/
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/Empdashboard/:path*",
    "/empdashboard/:path*",
    "/empjob/:path*",
    "/userjob/:path*",
    "/boarding/:path*",
    "/empboarding/:path*",
    "/appbar/profile/:path*",
  ],
};
