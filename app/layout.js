import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className} style={{ margin:0, background:'#141414' }}>
        {children}
      </body>
    </html>
  );
}
