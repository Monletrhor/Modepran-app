import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400','500','600','700','800'],
  display: 'swap',
});

export const metadata = {
  title: 'Control sanitario Modepran',
  description: 'Limpieza diaria, cloración e histórico'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className} style={{ margin: 0, background: '#121212' }}>
        {children}
      </body>
    </html>
  );
}
