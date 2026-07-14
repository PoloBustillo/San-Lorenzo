import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-full flex-col">
      <Navbar user={session.user} />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
