import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: "Control sanitario Modepran",
  description: "Limpieza y cloración de depósitos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className} style={{ margin: 0, background: "#141414" }}>
        {children}
      </body>
    </html>
  );
}
