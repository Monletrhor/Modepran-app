'use client'

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 700, width: "100%", background: "#1f1f1f", borderRadius: 24, padding: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, display: "grid", placeItems: "center", background: "#e84d57", fontWeight: 700 }}>MODEPRAN</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 32 }}>Control sanitario Modepran</h1>
            <p style={{ margin: "8px 0 0", color: "#bbb" }}>Proyecto corregido para desplegar en Vercel</p>
          </div>
        </div>
        <p style={{ lineHeight: 1.6, color: "#ddd" }}>
          Este ZIP ya incluye el archivo <strong>app/layout.js</strong>, que era lo que faltaba y por eso Vercel fallaba con el error
          <strong> page.js doesn't have a root layout</strong>.
        </p>
        <p style={{ lineHeight: 1.6, color: "#ddd" }}>
          Sube este proyecto a GitHub sustituyendo el anterior, y vuelve a desplegar.
        </p>
      </div>
    </main>
  );
}
