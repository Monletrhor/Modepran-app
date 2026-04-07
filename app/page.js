'use client'
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lhkxoyrlxdozcmrhejuq.supabase.co",
  "sb_publishable_K-UdDxlQvt1y7kYuhF4MCw_71MhuQ5f"
);

const trabajadores = Array.from({ length: 15 }, (_, i) => `Trabajador ${i + 1}`);

const zonasPerros = {
  "Zona principal": ["INVERNADERO", "RESIDENCIA", "FASE 1", "FASE 2", "FASE 3"],
  "Campo Nuevo": ["FASE 4", "FASE 5", "FASE 6", "FASE 7"],
};

const zonasGatos = {
  "Cuarentenas": ["Cuarentena 1", "Cuarentena 2"],
  "Jaulones": ["Jaulón 1", "Jaulón 2", "Jaulón 3", "Jaulón 4", "Jaulón 5", "Jaulón 6"],
};

const depositos = Array.from({ length: 12 }, (_, i) => `Depósito ${i + 1}`);

function ahora() {
  const d = new Date();
  return {
    fecha: d.toLocaleDateString("es-ES"),
    hora: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timestamp: d.toISOString(),
  };
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function abrirVentanaImpresion(titulo, contenido) {
  const win = window.open("", "_blank", "width=1000,height=800");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(titulo)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1 { margin: 0 0 8px; color: #e84d57; }
          p { margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
          th { background: #f4f4f4; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #e84d57; color: white; font-size: 12px; }
        </style>
      </head>
      <body>${contenido}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

function EstadoBadge({ hecho, alerta = false }) {
  const style = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: hecho ? "#10b981" : alerta ? "#dc2626" : "#fbbf24",
    color: hecho || alerta ? "#fff" : "#111",
  };
  return <span style={style}>{hecho ? "✔ Hecho" : alerta ? "⚠ Crítico" : "Pendiente"}</span>;
}

function Card({ children, style = {} }) {
  return <div style={{ borderRadius: 24, background: "#f8f8f8", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", ...style }}>{children}</div>;
}

export default function Page() {
  const [limpieza, setLimpieza] = useState({});
  const [cloracion, setCloracion] = useState({});
  const [infecciososGatos, setInfecciososGatos] = useState(false);
  const [infecciososPerros, setInfecciososPerros] = useState(false);
  const [estadoConexion, setEstadoConexion] = useState("Conectando con Supabase...");
  const [tab, setTab] = useState("perros");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: limpias, error: e1 } = await supabase.from("registros_limpieza").select("*").order("created_at", { ascending: false });
        const { data: cloros, error: e2 } = await supabase.from("registros_cloracion").select("*").order("created_at", { ascending: false });
        if (e1) throw e1;
        if (e2) throw e2;

        const limpiezaMap = {};
        (limpias || []).forEach((item) => {
          if (!limpiezaMap[item.zona]) {
            limpiezaMap[item.zona] = {
              trabajador: item.trabajador,
              fecha: item.fecha,
              hora: item.hora,
              timestamp: item.created_at,
            };
          }
        });

        const cloracionMap = {};
        (cloros || []).forEach((item) => {
          if (!cloracionMap[item.deposito]) {
            cloracionMap[item.deposito] = {
              trabajador: item.trabajador,
              fecha: item.fecha,
              hora: item.hora,
              timestamp: item.created_at,
            };
          }
        });

        setLimpieza(limpiezaMap);
        setCloracion(cloracionMap);
        setEstadoConexion("Supabase conectado");
      } catch (error) {
        console.error(error);
        setEstadoConexion("No se pudo conectar con Supabase");
      }
    };
    cargarDatos();
  }, []);

  const registrar = async (zona, trabajador) => {
    const tiempo = ahora();
    let categoria = "perros";
    let grupo = "Zona principal";

    if (Object.values(zonasGatos).flat().includes(zona) || zona === "Infecciosos Gatos") {
      categoria = "gatos";
      if (zona.startsWith("Cuarentena")) grupo = "Cuarentenas";
      else if (zona.startsWith("Jaulón")) grupo = "Jaulones";
      else if (zona === "Infecciosos Gatos") grupo = "Infecciosos";
    } else {
      if (zonasPerros["Campo Nuevo"].includes(zona)) grupo = "Campo Nuevo";
      if (zona === "Infecciosos Perros") grupo = "Infecciosos";
    }

    setLimpieza((prev) => ({ ...prev, [zona]: { trabajador, ...tiempo } }));

    const { error } = await supabase.from("registros_limpieza").insert([{
      categoria, grupo, zona, trabajador, fecha: tiempo.fecha, hora: tiempo.hora,
    }]);

    if (error) {
      console.error(error);
      alert("No se ha podido guardar en Supabase");
    }
  };

  const registrarCloro = async (deposito, trabajador) => {
    const tiempo = ahora();
    setCloracion((prev) => ({ ...prev, [deposito]: { trabajador, ...tiempo } }));
    const { error } = await supabase.from("registros_cloracion").insert([{
      deposito, trabajador, fecha: tiempo.fecha, hora: tiempo.hora,
    }]);
    if (error) {
      console.error(error);
      alert("No se ha podido guardar en Supabase");
    }
  };

  const exportarLimpiezaSemanal = () => {
    const hoy = new Date();
    const inicio = getStartOfWeek(hoy);
    const fin = getEndOfWeek(hoy);

    const filas = Object.entries(limpieza)
      .filter(([, data]) => {
        const fecha = new Date(data.timestamp || hoy.toISOString());
        return fecha >= inicio && fecha <= fin;
      })
      .sort((a, b) => new Date(a[1].timestamp || hoy.toISOString()) - new Date(b[1].timestamp || hoy.toISOString()));

    const tabla = filas.length ? filas.map(([zona, data]) => `
      <tr><td>${escapeHtml(zona)}</td><td>${escapeHtml(data.trabajador)}</td><td>${escapeHtml(data.fecha)}</td><td>${escapeHtml(data.hora)}</td></tr>
    `).join("") : `<tr><td colspan="4">No hay registros de limpieza esta semana.</td></tr>`;

    abrirVentanaImpresion("Registro semanal de limpieza", `
      <h1>Registro semanal de limpieza</h1>
      <p><span class="badge">Modepran</span></p>
      <p><strong>Semana:</strong> ${inicio.toLocaleDateString("es-ES")} - ${fin.toLocaleDateString("es-ES")}</p>
      <table><thead><tr><th>Zona</th><th>Trabajador</th><th>Fecha</th><th>Hora</th></tr></thead><tbody>${tabla}</tbody></table>
    `);
  };

  const exportarCloracionMensual = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const filas = Object.entries(cloracion)
      .filter(([, data]) => {
        const fecha = new Date(data.timestamp || hoy.toISOString());
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
      })
      .sort((a, b) => new Date(a[1].timestamp || hoy.toISOString()) - new Date(b[1].timestamp || hoy.toISOString()));

    const tabla = filas.length ? filas.map(([deposito, data]) => `
      <tr><td>${escapeHtml(deposito)}</td><td>${escapeHtml(data.trabajador)}</td><td>${escapeHtml(data.fecha)}</td><td>${escapeHtml(data.hora)}</td></tr>
    `).join("") : `<tr><td colspan="4">No hay registros de cloración este mes.</td></tr>`;

    abrirVentanaImpresion("Registro mensual de cloración", `
      <h1>Control mensual de cloración</h1>
      <p><span class="badge">Modepran</span></p>
      <p><strong>Mes:</strong> ${hoy.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</p>
      <table><thead><tr><th>Depósito</th><th>Trabajador</th><th>Fecha</th><th>Hora</th></tr></thead><tbody>${tabla}</tbody></table>
    `);
  };

  const selectStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #ddd", background: "#fff", fontSize: 15
  };

  const renderSelect = (onChange) => (
    <select defaultValue="" onChange={(e) => e.target.value && onChange(e.target.value)} style={selectStyle}>
      <option value="" disabled>Seleccionar trabajador</option>
      {trabajadores.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1b1b1b,#2a2a2a,#111)", padding: 16 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 20 }}>
        <div style={{ borderRadius: 28, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(90deg,#111,#232323)", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", padding: 24 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ borderRadius: 24, background: "rgba(0,0,0,0.3)", padding: 12 }}>
                <div style={{ width: 96, height: 96, borderRadius: 18, background: "#e84d57", display: "grid", placeItems: "center", fontWeight: 700, color: "#fff" }}>MODEPRAN</div>
              </div>
              <div>
                <h1 style={{ margin: 0, color: "#fff", fontSize: 42, lineHeight: 1.1 }}>Control sanitario Modepran</h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.7)" }}>Limpieza diaria y cloración de depósitos</p>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{estadoConexion}</p>
              </div>
            </div>
            <div style={{ borderRadius: 16, background: "#e84d57", color: "#fff", padding: "10px 16px", fontWeight: 700 }}>Registro interno</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          <button onClick={exportarLimpiezaSemanal} style={{ padding: "14px 18px", borderRadius: 16, border: 0, background: "#e84d57", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Exportar PDF semanal de limpieza
          </button>
          <button onClick={exportarCloracionMensual} style={{ padding: "14px 18px", borderRadius: 16, border: 0, background: "#fff", color: "#111", fontWeight: 700, cursor: "pointer" }}>
            Exportar PDF mensual de cloración
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, background: "#171717", padding: 8, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
          {[
            ["perros", "🐶 Perros"],
            ["gatos", "🐱 Gatos"],
            ["cloro", "💧 Cloración"],
          ].map(([value, label]) => (
            <button key={value} onClick={() => setTab(value)} style={{
              padding: "12px 14px", borderRadius: 12, border: 0, cursor: "pointer",
              background: tab === value ? "#e84d57" : "transparent",
              color: "#fff", fontWeight: 700
            }}>{label}</button>
          ))}
        </div>

        {tab === "perros" && (
          <div style={{ display: "grid", gap: 16 }}>
            <Card style={{ background: "linear-gradient(90deg,#e84d57,#ff6b73)", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
                <div><p style={{ margin: 0, opacity: .8, fontSize: 14 }}>Control variable</p><p style={{ margin: "4px 0 0", fontWeight: 700 }}>¿Hay infecciosos perros?</p></div>
                <input type="checkbox" checked={infecciososPerros} onChange={(e) => setInfecciososPerros(e.target.checked)} />
              </div>
            </Card>

            {Object.entries(zonasPerros).map(([grupo, lista]) => (
              <Card key={grupo}>
                <div style={{ padding: 20 }}>
                  <h2 style={{ margin: "0 0 16px", color: "#e84d57" }}>{grupo}</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {lista.map((zona) => {
                      const hecho = limpieza[zona];
                      return (
                        <div key={zona} style={{ border: "1px solid #e5e5e5", borderRadius: 18, padding: 16, background: hecho ? "#ecfdf5" : "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <span style={{ fontWeight: 700 }}>{zona}</span>
                            <EstadoBadge hecho={!!hecho} />
                          </div>
                          {renderSelect((v) => registrar(zona, v))}
                          {hecho && <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
                            <div><strong>Trabajador:</strong> {hecho.trabajador}</div>
                            <div><strong>Fecha:</strong> {hecho.fecha}</div>
                            <div><strong>Hora:</strong> {hecho.hora}</div>
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}

            {infecciososPerros && (
              <Card style={{ background: "linear-gradient(90deg,#dc2626,#ef4444)", color: "#fff" }}>
                <div style={{ padding: 20 }}>
                  <h2 style={{ margin: "0 0 16px" }}>🚨 Infecciosos Perros</h2>
                  {renderSelect((v) => registrar("Infecciosos Perros", v))}
                  {limpieza["Infecciosos Perros"] && <div style={{ marginTop: 10, fontSize: 14 }}>
                    <div><strong>Trabajador:</strong> {limpieza["Infecciosos Perros"].trabajador}</div>
                    <div><strong>Fecha:</strong> {limpieza["Infecciosos Perros"].fecha}</div>
                    <div><strong>Hora:</strong> {limpieza["Infecciosos Perros"].hora}</div>
                  </div>}
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "gatos" && (
          <div style={{ display: "grid", gap: 16 }}>
            <Card style={{ background: "linear-gradient(90deg,#e84d57,#ff6b73)", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
                <div><p style={{ margin: 0, opacity: .8, fontSize: 14 }}>Control variable</p><p style={{ margin: "4px 0 0", fontWeight: 700 }}>¿Hay infecciosos gatos?</p></div>
                <input type="checkbox" checked={infecciososGatos} onChange={(e) => setInfecciososGatos(e.target.checked)} />
              </div>
            </Card>

            {Object.entries(zonasGatos).map(([grupo, lista]) => (
              <Card key={grupo}>
                <div style={{ padding: 20 }}>
                  <h2 style={{ margin: "0 0 16px", color: "#e84d57" }}>{grupo}</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {lista.map((zona) => {
                      const hecho = limpieza[zona];
                      return (
                        <div key={zona} style={{ border: "1px solid #e5e5e5", borderRadius: 18, padding: 16, background: hecho ? "#ecfdf5" : "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <span style={{ fontWeight: 700 }}>{zona}</span>
                            <EstadoBadge hecho={!!hecho} />
                          </div>
                          {renderSelect((v) => registrar(zona, v))}
                          {hecho && <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
                            <div><strong>Trabajador:</strong> {hecho.trabajador}</div>
                            <div><strong>Fecha:</strong> {hecho.fecha}</div>
                            <div><strong>Hora:</strong> {hecho.hora}</div>
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}

            {infecciososGatos && (
              <Card style={{ background: "linear-gradient(90deg,#dc2626,#ef4444)", color: "#fff" }}>
                <div style={{ padding: 20 }}>
                  <h2 style={{ margin: "0 0 16px" }}>🚨 Infecciosos Gatos</h2>
                  {renderSelect((v) => registrar("Infecciosos Gatos", v))}
                  {limpieza["Infecciosos Gatos"] && <div style={{ marginTop: 10, fontSize: 14 }}>
                    <div><strong>Trabajador:</strong> {limpieza["Infecciosos Gatos"].trabajador}</div>
                    <div><strong>Fecha:</strong> {limpieza["Infecciosos Gatos"].fecha}</div>
                    <div><strong>Hora:</strong> {limpieza["Infecciosos Gatos"].hora}</div>
                  </div>}
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "cloro" && (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {depositos.map((d) => {
              const hecho = cloracion[d];
              return (
                <Card key={d} style={{ background: hecho ? "#ecfdf5" : "#f8f8f8" }}>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontWeight: 700 }}>{d}</span>
                      <EstadoBadge hecho={!!hecho} />
                    </div>
                    {renderSelect((v) => registrarCloro(d, v))}
                    {hecho && <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
                      <div><strong>Trabajador:</strong> {hecho.trabajador}</div>
                      <div><strong>Fecha:</strong> {hecho.fecha}</div>
                      <div><strong>Hora:</strong> {hecho.hora}</div>
                    </div>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
