'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  LogOut,
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  BarChart3,
  Users,
  Upload,
  Settings,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { GlobalSearch } from '@/components/global-search'

const operaciones = [
  { href: '/armado', label: 'Armado', icon: Package },
  { href: '/entradas', label: 'Entradas', icon: ArrowDownLeft },
  { href: '/salidas', label: 'Salidas', icon: ArrowUpRight },
  { href: '/inventario', label: 'Inventario', icon: FileText },
]

const reportes = [
  { href: '/reportes/armado', label: 'Armado' },
  { href: '/reportes/tacon', label: 'Tacón' },
  { href: '/reportes/lena', label: 'Leña' },
]

const adminItems = [
  { href: '/proveedores', label: 'Proveedores', icon: FileText },
  { href: '/importar', label: 'Importar', icon: Upload },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function Navbar({
  user,
}: {
  user: { name?: string | null; email?: string | null; role?: string }
}) {
  const pathname = usePathname()
  const isAdmin = user.role === 'ADMIN'
  const isOperacionesActive = operaciones.some((item) => isActive(pathname, item.href))
  const isReportesActive = reportes.some((item) => isActive(pathname, item.href))
  const isAdminActive = adminItems.some((item) => isActive(pathname, item.href))

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Left: Logo + Mobile menu */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-64">
              <nav className="grid gap-1 py-4">
                <Link
                  href="/"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent ${
                    pathname === '/' ? 'bg-accent' : ''
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <div className="px-3 pt-4 pb-1 text-xs font-medium text-muted-foreground">
                  Operaciones
                </div>
                {operaciones.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 pl-6 text-sm font-medium hover:bg-accent ${
                      isActive(pathname, item.href) ? 'bg-accent' : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}

                <div className="px-3 pt-4 pb-1 text-xs font-medium text-muted-foreground">
                  Reportes
                </div>
                {reportes.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 pl-6 text-sm font-medium hover:bg-accent ${
                      isActive(pathname, item.href) ? 'bg-accent' : ''
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}

                {isAdmin && (
                  <>
                    <div className="px-3 pt-4 pb-1 text-xs font-medium text-muted-foreground">
                      Administración
                    </div>
                    {adminItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 pl-6 text-sm font-medium hover:bg-accent ${
                          isActive(pathname, item.href) ? 'bg-accent' : ''
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-lg font-bold hover:opacity-80 transition-opacity">
            San Lorenzo
          </Link>
        </div>

        {/* Center: Desktop nav — grouped into dropdowns */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-accent ${
              pathname === '/' ? 'bg-accent' : ''
            }`}
          >
            Dashboard
          </Link>

          {/* Operaciones dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className={`gap-1 px-3 py-2 text-sm font-medium hover:bg-accent ${
                    isOperacionesActive ? 'bg-accent' : ''
                  }`}
                >
                  Operaciones
                  <ChevronDown className="h-3 w-3" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              {operaciones.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="flex items-center gap-2 w-full cursor-pointer">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reportes dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className={`gap-1 px-3 py-2 text-sm font-medium hover:bg-accent ${
                    isReportesActive ? 'bg-accent' : ''
                  }`}
                >
                  Reportes
                  <ChevronDown className="h-3 w-3" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              {reportes.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin dropdown */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className={`gap-1 px-3 py-2 text-sm font-medium hover:bg-accent ${
                      isAdminActive ? 'bg-accent' : ''
                    }`}
                  >
                    Admin
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                {adminItems.map((item) => (
                  <DropdownMenuItem key={item.href}>
                    <Link href={item.href} className="flex items-center gap-2 w-full cursor-pointer">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right: Search, user info, theme, logout */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <GlobalSearch />
          <div className="hidden text-sm md:block">
            <p className="font-medium leading-none">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
