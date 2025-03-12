import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define rotas protegidas que precisam de autenticação
const protectedRoutes = ["/dashboard", "/admin", "/config"];
// Rotas que são acessíveis apenas para visitantes (não logados)
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Recupera token de autenticação dos cookies
  const token = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!token;

  // Redireciona usuários autenticados para longe das páginas de login
  if (
    isAuthenticated &&
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redireciona usuários não autenticados para o login
  if (
    !isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configuração para especificar em quais rotas o middleware será executado
export const config = {
  matcher: [
    /*
     * Combina todas as rotas de solicitação exceto:
     * - _next (arquivos estáticos do Next.js)
     * - public (arquivos na pasta public)
     * - favicon.ico (arquivo favicon)
     */
    "/((?!_next|public|favicon.ico).*)",
  ],
};
