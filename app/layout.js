export const metadata = {
  title: "Modepran App",
  description: "Control de limpieza y cloración",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#111", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}
