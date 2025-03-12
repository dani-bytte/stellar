import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/lib/routes";
import { JWT_CONFIG } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware: Processando rota ${pathname}`);

  // Bypass para rotas de API - todas as validações de API devem ser tratadas pelos próprios endpoints
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Listas planas para checagem de rotas
  const protectedRoutes = Object.values(ROUTES.PROTECTED);
  const authRoutes = Object.values(ROUTES.AUTH);

  // Recupera token de autenticação dos cookies
  const token = request.cookies.get(JWT_CONFIG.COOKIE_NAME)?.value;
  
  console.log(`Middleware: Token encontrado: ${!!token}`);
  
  // Rotas de autenticação - permitir acesso sem token
  if (authRoutes.some(route => pathname.startsWith(route))) {
    // Se tiver token, apenas prosseguir, deixe a lógica de redirecionamento 
    // para o componente cliente que vai validar o token usando a API
    return NextResponse.next();
  }
  
  // Rotas protegidas - verificar apenas a presença do token
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Se não tiver token, redireciona para login
    if (!token) {
      console.log(`Middleware: Sem token, redirecionando para login`);
      return NextResponse.redirect(new URL(ROUTES.REDIRECT.LOGIN, request.url));
    }
    
    // Se tiver token, permite acesso e deixa a validação para o componente
    return NextResponse.next();
  }

  // Para outras rotas, apenas continua sem interferir
  return NextResponse.next();
}

// Configuração para especificar em quais rotas o middleware será executado
export const config = {
  matcher: [
    "/((?!_next|public|favicon.ico).*)",
  ],
};
