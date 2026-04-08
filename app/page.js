'use client'
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lhkxoyrlxdozcmrhejuq.supabase.co",
  "sb_publishable_K-UdDxlQvt1y7kYuhF4MCw_71MhuQ5f"
);

const trabajadores = [
  "Maria penades","Joana todo","Martina simova","Mireia soro","Elena Palau",
  "Katya urias","Kenia urias","David Valls","Johana tavera","Xujey Suarez",
  "Rafa Sales","Jenny Martinez","Trini"
];
const zonasPerros = {
  "Zona principal": ["INVERNADERO", "RESIDENCIA", "FASE 1", "FASE 2", "FASE 3"],
  "Campo Nuevo": ["FASE 4", "FASE 5", "FASE 6", "FASE 7"],
};
const zonasGatos = {
  "Cuarentenas": ["Cuarentena 1", "Cuarentena 2"],
  "Jaulones": ["Jaulón 1", "Jaulón 2", "Jaulón 3", "Jaulón 4", "Jaulón 5", "Jaulón 6"],
};
const depositos = Array.from({ length: 12 }, (_, i) => `Depósito ${i + 1}`);
const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function ahora() {
  const d = new Date();
  return {
    fecha: d.toLocaleDateString("es-ES"),
    hora: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timestamp: d.toISOString(),
  };
}
function dateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function esFromInput(isoDate) {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("es-ES");
}
function escapeHtml(text) {
  return String(text ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function abrirVentanaImpresion(titulo, contenido) {
  const win = window.open("", "_blank", "width=1100,height=850");
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
  setTimeout(() => win.print(), 250);
}
function EstadoBadge({ hecho, alerta = false }) {
  const style = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 10px",
    borderRadius: 999, fontSize: 11, fontWeight: 800,
    background: hecho ? "#10b981" : alerta ? "#dc2626" : "#fbbf24",
    color: hecho || alerta ? "#fff" : "#111"
  };
  return <span style={style}>{hecho ? "✔ Hecho" : alerta ? "⚠" : "Pendiente"}</span>;
}
function Card({ children, style = {} }) {
  return <div style={{ borderRadius: 24, background: "#f8f8f8", boxShadow: "0 14px 40px rgba(0,0,0,0.18)", overflow: "hidden", ...style }}>{children}</div>;
}
function SectionTitle({ children }) {
  return <h2 style={{ margin: "0 0 18px", color: "#e84d57", fontSize: 28, lineHeight: 1.1, fontWeight: 800 }}>{children}</h2>;
}
const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid #ddd", background: "#fff", fontSize: 16, outline: "none" };

function MonthYearPicker({ mes, setMes, anio, setAnio }) {
  const years = [];
  const actual = new Date().getFullYear();
  for (let y = actual - 3; y <= actual + 2; y++) years.push(y);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
      <select value={mes} onChange={(e) => setMes(Number(e.target.value))} style={inputStyle}>
        {meses.map((m, i) => <option key={m} value={i}>{m}</option>)}
      </select>
      <select value={anio} onChange={(e) => setAnio(Number(e.target.value))} style={inputStyle}>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

function RegistroRow({ title, registro, onSelect, disabled = false, bloqueado = false, retroInfo = false }) {
  return (
    <div style={{ border: "1px solid #ececec", borderRadius: 20, padding: 16, background: registro ? "#ecfdf5" : "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#1f1f1f" }}>{title}</span>
        <EstadoBadge hecho={!!registro} />
      </div>
      <select disabled={disabled} defaultValue="" onChange={(e) => e.target.value && onSelect(e.target.value)} style={{ ...inputStyle, opacity: disabled ? .65 : 1 }}>
        <option value="">{bloqueado ? "Ya registrado hoy" : "Seleccionar trabajador"}</option>
        {!disabled && trabajadores.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      {registro && (
        <div style={{ marginTop: 10, fontSize: 14, color: "#555", lineHeight: 1.6 }}>
          <div><strong>Trabajador:</strong> {registro.trabajador}</div>
          <div><strong>Fecha trabajo:</strong> {registro.fecha}</div>
          <div><strong>Hora:</strong> {registro.hora}</div>
          {(retroInfo || registro.retroactivo) && <div style={{ color: "#b45309", fontWeight: 700 }}>Registro retroactivo</div>}
        </div>
      )}
    </div>
  );
}

function CompactItem({ nombre, registro, onSelect, isMobile }) {
  return (
    <div style={{
      border: "1px solid #e7e7e7",
      background: registro ? "#ecfdf5" : "#fff",
      borderRadius: 16,
      padding: isMobile ? 10 : 12,
      display: "grid",
      gap: 8
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 800, fontSize: isMobile ? 15 : 16, color: "#1b1b1b" }}>{nombre}</div>
        <EstadoBadge hecho={!!registro} />
      </div>
      {registro ? (
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{registro.trabajador}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, background: "#f1f5f9", padding: "4px 8px", borderRadius: 999, color: "#334155" }}>{registro.fecha}</span>
            <span style={{ fontSize: 12, background: "#f1f5f9", padding: "4px 8px", borderRadius: 999, color: "#334155" }}>{registro.hora}</span>
            {(registro.retroactivo) && <span style={{ fontSize: 12, background: "#fff7ed", padding: "4px 8px", borderRadius: 999, color: "#b45309", fontWeight: 700 }}>Retroactivo</span>}
          </div>
        </div>
      ) : (
        <select defaultValue="" onChange={(e)=>e.target.value && onSelect(e.target.value)} style={{
          width: "100%", padding: isMobile ? "10px 12px" : "9px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", fontSize: 14, outline: "none"
        }}>
          <option value="">Seleccionar trabajador</option>
          {trabajadores.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
    </div>
  );
}

export default function Page() {
  const today = new Date();
  const [tab, setTab] = useState("perros");
  const [historicoTab, setHistoricoTab] = useState("perros");
  const [isMobile, setIsMobile] = useState(false);
  const [estadoConexion, setEstadoConexion] = useState("Conectando con Supabase...");
  const [infecciososGatos, setInfecciososGatos] = useState(false);
  const [infecciososPerros, setInfecciososPerros] = useState(false);
  const [mesHist, setMesHist] = useState(today.getMonth());
  const [anioHist, setAnioHist] = useState(today.getFullYear());
  const [fechaRetro, setFechaRetro] = useState(dateInputValue(today));
  const [limpiezaHoy, setLimpiezaHoy] = useState({});
  const [cloracionHoy, setCloracionHoy] = useState({});
  const [histPerros, setHistPerros] = useState([]);
  const [histGatos, setHistGatos] = useState([]);
  const [histCloro, setHistCloro] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function cargarTodo() {
    try {
      const { data: limpias, error: e1 } = await supabase.from("registros_limpieza").select("*").order("created_at", { ascending: false });
      const { data: cloros, error: e2 } = await supabase.from("registros_cloracion").select("*").order("created_at", { ascending: false });
      if (e1) throw e1;
      if (e2) throw e2;

      const hoyEs = new Date().toLocaleDateString("es-ES");
      const mapHoyL = {};
      const mapHoyC = {};
      (limpias || []).forEach((item) => {
        if (item.fecha === hoyEs && !mapHoyL[item.zona]) {
          mapHoyL[item.zona] = { trabajador: item.trabajador, fecha: item.fecha, hora: item.hora, retroactivo: !!item.retroactivo, created_at: item.created_at };
        }
      });
      (cloros || []).forEach((item) => {
        if (item.fecha === hoyEs && !mapHoyC[item.deposito]) {
          mapHoyC[item.deposito] = { trabajador: item.trabajador, fecha: item.fecha, hora: item.hora, retroactivo: !!item.retroactivo, created_at: item.created_at };
        }
      });

      setLimpiezaHoy(mapHoyL);
      setCloracionHoy(mapHoyC);
      setHistPerros((limpias || []).filter(x => x.categoria === "perros"));
      setHistGatos((limpias || []).filter(x => x.categoria === "gatos"));
      setHistCloro(cloros || []);
      setEstadoConexion("Supabase conectado");
    } catch (error) {
      console.error(error);
      setEstadoConexion("No se pudo conectar con Supabase");
    }
  }
  useEffect(() => { cargarTodo(); }, []);

  async function registrar(zona, trabajador, fechaTrabajo=null) {
    if (!trabajador) return;
    const tiempo = ahora();
    const fechaElegida = fechaTrabajo || tiempo.fecha;
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
    const retroactivo = fechaElegida !== tiempo.fecha;
    const { error } = await supabase.from("registros_limpieza").insert([{ categoria, grupo, zona, trabajador, fecha: fechaElegida, hora: tiempo.hora, retroactivo }]);
    if (error) { console.error(error); alert("No se ha podido guardar en Supabase"); return; }
    await cargarTodo();
  }

  async function registrarCloro(deposito, trabajador, fechaTrabajo=null) {
    if (!trabajador) return;
    const tiempo = ahora();
    const fechaElegida = fechaTrabajo || tiempo.fecha;
    const retroactivo = fechaElegida !== tiempo.fecha;
    const { error } = await supabase.from("registros_cloracion").insert([{ deposito, trabajador, fecha: fechaElegida, hora: tiempo.hora, retroactivo }]);
    if (error) { console.error(error); alert("No se ha podido guardar en Supabase"); return; }
    await cargarTodo();
  }

  const totalPendientes = useMemo(() => {
    const perros = Object.values(zonasPerros).flat().filter((z) => !limpiezaHoy[z]).length;
    const gatos = Object.values(zonasGatos).flat().filter((z) => !limpiezaHoy[z]).length;
    const deps = depositos.filter((d) => !cloracionHoy[d]).length;
    return perros + gatos + deps + (infecciososPerros && !limpiezaHoy["Infecciosos Perros"] ? 1 : 0) + (infecciososGatos && !limpiezaHoy["Infecciosos Gatos"] ? 1 : 0);
  }, [limpiezaHoy, cloracionHoy, infecciososPerros, infecciososGatos]);

  function filtrarMes(list) {
    return list.filter((r) => {
      const [_, m, y] = r.fecha.split("/");
      return Number(m) - 1 === mesHist && Number(y) === anioHist;
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  const perrosMes = filtrarMes(histPerros);
  const gatosMes = filtrarMes(histGatos);
  const cloroMes = filtrarMes(histCloro);

  function exportarListado(titulo, filas, columnas, periodo) {
    const body = filas.length
      ? filas.map((row) => `<tr>${columnas.map((c) => `<td>${escapeHtml(String(row[c.key] ?? ""))}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${columnas.length}">No hay registros.</td></tr>`;
    abrirVentanaImpresion(titulo, `
      <h1>${escapeHtml(titulo)}</h1>
      <p><span class="badge">Modepran</span></p>
      <p><strong>Periodo:</strong> ${escapeHtml(periodo)}</p>
      <table><thead><tr>${columnas.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>
    `);
  }

  function exportarMes(tipo) {
    const periodo = `${meses[mesHist]} ${anioHist}`;
    if (tipo === "perros") exportarListado("Histórico limpieza perros", perrosMes, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Fecha"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "gatos") exportarListado("Histórico limpieza gatos", gatosMes, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Fecha"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "cloro") exportarListado("Histórico cloración", cloroMes, [{key:"deposito",label:"Depósito"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Fecha"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
  }
  function exportarAnio(tipo) {
    const periodo = `Año ${anioHist}`;
    const perrosAnio = histPerros.filter((r) => Number(r.fecha.split("/")[2]) === anioHist);
    const gatosAnio = histGatos.filter((r) => Number(r.fecha.split("/")[2]) === anioHist);
    const cloroAnio = histCloro.filter((r) => Number(r.fecha.split("/")[2]) === anioHist);
    if (tipo === "perros") exportarListado("Histórico anual limpieza perros", perrosAnio, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Fecha"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "gatos") exportarListado("Histórico anual limpieza gatos", gatosAnio, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Fecha"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "cloro") exportarListado("Histórico anual cloración", cloroAnio, [{key:"deposito",label:"Depósito"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Fecha"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
  }

  const topCardStyle = { padding: isMobile ? "16px 18px" : "16px 20px", borderRadius: 18, border: 0, fontWeight: 800, fontSize: 16, cursor: "pointer" };
  const fechaObjetivo = esFromInput(fechaRetro);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#141414,#1d1d1d,#111)", padding: isMobile ? 12 : 18 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gap: isMobile ? 14 : 22 }}>
        <div style={{ borderRadius: 30, border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(90deg,#111,#232323)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexWrap: "wrap", padding: isMobile ? 16 : 24 }}>
            <div style={{ display: "flex", gap: isMobile ? 12 : 18, alignItems: isMobile ? "flex-start" : "center", flexWrap: "wrap" }}>
              <div style={{ borderRadius: 22, background: "rgba(0,0,0,0.28)", padding: 10 }}>
                <img src="/logo.png" alt="Protectora Modepran" style={{ width: isMobile ? 76 : 110, height: isMobile ? 76 : 110, objectFit: "contain", display: "block", borderRadius: 18 }} />
              </div>
              <div style={{ flex: 1, minWidth: isMobile ? "100%" : "auto" }}>
                <h1 style={{ margin: 0, color: "#fff", fontSize: isMobile ? 32 : 44, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.03em" }}>Control sanitario Modepran</h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.74)", fontSize: isMobile ? 15 : 18, fontWeight: 500 }}>Limpieza diaria, cloración e histórico</p>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.64)", fontSize: 13, fontWeight: 700 }}>{estadoConexion}</p>
              </div>
            </div>
            <div style={{ borderRadius: 18, background: "#e84d57", color: "#fff", padding: isMobile ? "10px 14px" : "12px 18px", fontWeight: 800 }}>Registro interno</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 8, background: "#171717", padding: 8, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 8, zIndex: 5 }}>
          {[["perros","🐶 Perros"],["gatos","🐱 Gatos"],["cloro","💧 Cloración"],["historico","📊 Histórico"]].map(([value, label]) => (
            <button key={value} onClick={() => setTab(value)} style={{ padding: isMobile ? "15px 8px" : "14px 16px", borderRadius: 14, border: 0, cursor: "pointer", background: tab === value ? "#e84d57" : "transparent", color: "#fff", fontWeight: 800, fontSize: isMobile ? 14 : 16 }}>{label}</button>
          ))}
        </div>

        {tab !== "historico" && (
          <div style={{ borderRadius: 20, background: totalPendientes === 0 ? "#064e3b" : "#3a2d00", color: "#fff", padding: isMobile ? "14px 16px" : "14px 18px", fontWeight: 800, fontSize: isMobile ? 15 : 16 }}>
            {totalPendientes === 0 ? "Todo al día. No quedan tareas pendientes." : `Pendientes actuales: ${totalPendientes}`}
          </div>
        )}

        {tab === "perros" && (
          <div style={{ display: "grid", gap: 18 }}>
            <Card style={{ background: "linear-gradient(90deg,#e84d57,#ff6b73)", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? 16 : 18, gap: 12 }}>
                <div><p style={{ margin: 0, opacity: .82, fontSize: 14, fontWeight: 700 }}>Control variable</p><p style={{ margin: "6px 0 0", fontWeight: 800, fontSize: isMobile ? 20 : 22 }}>¿Hay infecciosos perros?</p></div>
                <input style={{ width: 24, height: 24 }} type="checkbox" checked={infecciososPerros} onChange={(e) => setInfecciososPerros(e.target.checked)} />
              </div>
            </Card>
            {Object.entries(zonasPerros).map(([grupo, lista]) => (
              <Card key={grupo}><div style={{ padding: isMobile ? 16 : 24 }}>
                <SectionTitle>{grupo}</SectionTitle>
                <div style={{ display: "grid", gap: 14 }}>
                  {lista.map((zona) => <RegistroRow key={zona} title={zona} registro={limpiezaHoy[zona]} onSelect={(v) => registrar(zona, v)} disabled={!!limpiezaHoy[zona]} bloqueado={!!limpiezaHoy[zona]} />)}
                </div>
              </div></Card>
            ))}
            {infecciososPerros && <Card style={{ background: "linear-gradient(90deg,#dc2626,#ef4444)", color: "#fff" }}><div style={{ padding: isMobile ? 16 : 24 }}>
              <SectionTitle>🚨 Infecciosos Perros</SectionTitle>
              <RegistroRow title="Infecciosos Perros" registro={limpiezaHoy["Infecciosos Perros"]} onSelect={(v) => registrar("Infecciosos Perros", v)} disabled={!!limpiezaHoy["Infecciosos Perros"]} bloqueado={!!limpiezaHoy["Infecciosos Perros"]} />
            </div></Card>}
          </div>
        )}

        {tab === "gatos" && (
          <div style={{ display: "grid", gap: 18 }}>
            <Card style={{ background: "linear-gradient(90deg,#e84d57,#ff6b73)", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? 16 : 18, gap: 12 }}>
                <div><p style={{ margin: 0, opacity: .82, fontSize: 14, fontWeight: 700 }}>Control variable</p><p style={{ margin: "6px 0 0", fontWeight: 800, fontSize: isMobile ? 20 : 22 }}>¿Hay infecciosos gatos?</p></div>
                <input style={{ width: 24, height: 24 }} type="checkbox" checked={infecciososGatos} onChange={(e) => setInfecciososGatos(e.target.checked)} />
              </div>
            </Card>
            {Object.entries(zonasGatos).map(([grupo, lista]) => (
              <Card key={grupo}><div style={{ padding: isMobile ? 16 : 24 }}>
                <SectionTitle>{grupo}</SectionTitle>
                <div style={{ display: "grid", gap: 14 }}>
                  {lista.map((zona) => <RegistroRow key={zona} title={zona} registro={limpiezaHoy[zona]} onSelect={(v) => registrar(zona, v)} disabled={!!limpiezaHoy[zona]} bloqueado={!!limpiezaHoy[zona]} />)}
                </div>
              </div></Card>
            ))}
            {infecciososGatos && <Card style={{ background: "linear-gradient(90deg,#dc2626,#ef4444)", color: "#fff" }}><div style={{ padding: isMobile ? 16 : 24 }}>
              <SectionTitle>🚨 Infecciosos Gatos</SectionTitle>
              <RegistroRow title="Infecciosos Gatos" registro={limpiezaHoy["Infecciosos Gatos"]} onSelect={(v) => registrar("Infecciosos Gatos", v)} disabled={!!limpiezaHoy["Infecciosos Gatos"]} bloqueado={!!limpiezaHoy["Infecciosos Gatos"]} />
            </div></Card>}
          </div>
        )}

        {tab === "cloro" && (
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(280px,1fr))" }}>
            {depositos.map((d) => <RegistroRow key={d} title={d} registro={cloracionHoy[d]} onSelect={(v) => registrarCloro(d, v)} disabled={!!cloracionHoy[d]} bloqueado={!!cloracionHoy[d]} />)}
          </div>
        )}

        {tab === "historico" && (
          <div style={{ display: "grid", gap: 18 }}>
            <Card><div style={{ padding: isMobile ? 16 : 22, display: "grid", gap: 16 }}>
              <SectionTitle>Histórico</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 12 }}>
                <MonthYearPicker mes={mesHist} setMes={setMesHist} anio={anioHist} setAnio={setAnioHist} />
                <input type="date" value={fechaRetro} onChange={(e) => setFechaRetro(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, background: "#efefef", padding: 8, borderRadius: 18 }}>
                {[["perros","🐶 Perros"],["gatos","🐱 Gatos"],["cloro","💧 Cloración"]].map(([value, label]) => (
                  <button key={value} onClick={() => setHistoricoTab(value)} style={{ padding: "14px 10px", borderRadius: 14, border: 0, cursor: "pointer", background: historicoTab === value ? "#e84d57" : "transparent", color: historicoTab === value ? "#fff" : "#111", fontWeight: 800 }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                <button onClick={() => exportarMes(historicoTab)} style={{ ...topCardStyle, background: "#e84d57", color: "#fff" }}>Exportar mes</button>
                <button onClick={() => exportarAnio(historicoTab)} style={{ ...topCardStyle, background: "#111", color: "#fff" }}>Exportar año</button>
              </div>
              <div style={{ fontSize: 14, color: "#555", fontWeight: 700 }}>Vista compacta para revisar y completar rápido. Fecha seleccionada: <strong>{fechaObjetivo}</strong></div>
            </div></Card>

            {historicoTab === "perros" && (
              <Card><div style={{ padding: isMobile ? 14 : 18, display: "grid", gap: 14 }}>
                <SectionTitle>Limpieza perros · {meses[mesHist]} {anioHist}</SectionTitle>
                {Object.entries(zonasPerros).map(([grupo, lista]) => (
                  <div key={grupo} style={{ display: "grid", gap: 10 }}>
                    <div style={{ fontWeight: 800, color: "#222", fontSize: 16 }}>{grupo}</div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,minmax(0,1fr))", gap: 10 }}>
                      {lista.map((zona) => {
                        const registro = perrosMes.find((r) => r.zona === zona && r.fecha === fechaObjetivo);
                        return <CompactItem key={zona} nombre={zona} registro={registro} onSelect={(v) => registrar(zona, v, fechaObjetivo)} isMobile={isMobile} />
                      })}
                    </div>
                  </div>
                ))}
              </div></Card>
            )}

            {historicoTab === "gatos" && (
              <Card><div style={{ padding: isMobile ? 14 : 18, display: "grid", gap: 14 }}>
                <SectionTitle>Limpieza gatos · {meses[mesHist]} {anioHist}</SectionTitle>
                {Object.entries(zonasGatos).map(([grupo, lista]) => (
                  <div key={grupo} style={{ display: "grid", gap: 10 }}>
                    <div style={{ fontWeight: 800, color: "#222", fontSize: 16 }}>{grupo}</div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,minmax(0,1fr))", gap: 10 }}>
                      {lista.map((zona) => {
                        const registro = gatosMes.find((r) => r.zona === zona && r.fecha === fechaObjetivo);
                        return <CompactItem key={zona} nombre={zona} registro={registro} onSelect={(v) => registrar(zona, v, fechaObjetivo)} isMobile={isMobile} />
                      })}
                    </div>
                  </div>
                ))}
              </div></Card>
            )}

            {historicoTab === "cloro" && (
              <Card><div style={{ padding: isMobile ? 14 : 18, display: "grid", gap: 14 }}>
                <SectionTitle>Cloración · {meses[mesHist]} {anioHist}</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,minmax(0,1fr))", gap: 10 }}>
                  {depositos.map((dep) => {
                    const registro = cloroMes.find((r) => r.deposito === dep && r.fecha === fechaObjetivo);
                    return <CompactItem key={dep} nombre={dep} registro={registro} onSelect={(v) => registrarCloro(dep, v, fechaObjetivo)} isMobile={isMobile} />
                  })}
                </div>
              </div></Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
