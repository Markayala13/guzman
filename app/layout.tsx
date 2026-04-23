import type { Metadata } from 'next'
import { Inter, Poppins, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
})

export const metadata: Metadata = {
  title: 'GUZMAN AUTODETAILING | Detailing Premium',
  description: 'Detallado profesional que transforma, protege y hace brillar cada vehiculo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} ${bebas.variable} bg-background`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
