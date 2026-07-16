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
  FileText,
  BarChart3,
  Users,
  Upload,
  Settings,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/proveedores', label: 'Proveedores', icon: FileText },
  { href: '/entradas', label: 'Entradas', icon: ArrowDownLeft },
  { href: '/salidas', label: 'Salidas', icon: ArrowUpRight },
  { href: '/inventario', label: 'Inventario', icon: Package },
  { href: '/importar', label: 'Importar', icon: Upload },
]

const adminItems = [
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

const reportItems = [
  { href: '/reportes/armado', label: 'Armado' },
  { href: '/reportes/tacon', label: 'Tacón' },
  { href: '/reportes/lena', label: 'Leña' },
]

function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-accent ${
        active ? 'bg-accent' : ''
      }`}
    >
      {label}
    </Link>
  )
}

export function Navbar({ user }: { user: { name?: string | null; email?: string | null; role?: string } }) {
  const pathname = usePathname()
  const isReportActive = reportItems.some((item) => pathname === item.href)
  const isAdmin = user.role === 'ADMIN'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-64">
              <nav className="grid gap-2 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent ${
                      pathname === item.href ? 'bg-accent' : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Reportes</div>
                {reportItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 pl-6 text-sm font-medium hover:bg-accent ${
                      pathname === item.href ? 'bg-accent' : ''
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                {isAdmin &&
                  adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent ${
                        pathname === item.href ? 'bg-accent' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="text-lg font-bold">San Lorenzo</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className={`gap-1 px-3 py-2 text-sm font-medium hover:bg-accent ${
                    isReportActive ? 'bg-accent' : ''
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              {reportItems.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {isAdmin &&
            adminItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
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
