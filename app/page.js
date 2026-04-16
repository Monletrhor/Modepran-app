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
function normalizeEsDate(str) {
  if (!str) return "";
  const parts = str.split("/");
  if (parts.length !== 3) return str;
  const [d,m,y] = parts;
  return `${Number(d)}/${Number(m)}/${Number(y)}`;
}
function esFromParts(y,m,d){
  return normalizeEsDate(`${d}/${m}/${y}`);
}
function getDaysInMonth(year, monthIndex){
  return new Date(year, monthIndex + 1, 0).getDate();
}
function escapeHtml(text) {
  return String(text ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function workerShort(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1]}`;
}
function abrirVentanaImpresion(titulo, contenido) {
  const win = window.open("", "_blank", "width=1200,height=900");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(titulo)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
          body {
            font-family: Arial, sans-serif;
            color: #222;
            padding: 6mm;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-wrap {
            transform-origin: top left;
            width: 100%;
          }
          h1 {
            margin: 0 0 4px;
            color: #e84d57;
            font-size: 15px;
            line-height: 1.1;
          }
          p {
            margin: 3px 0;
            font-size: 10px;
            line-height: 1.15;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 3px 4px;
            text-align: left;
            font-size: 9px;
            line-height: 1.1;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            vertical-align: top;
          }
          th {
            background: #f4f4f4;
            font-size: 9px;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 999px;
            background: #e84d57;
            color: white;
            font-size: 9px;
            font-weight: 700;
          }
          @media print {
            body {
              zoom: 0.78;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-wrap">
          ${contenido}
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #ddd",
  background: "#fff",
  fontSize: 16,
  outline: "none"
};

function Card({ children, style = {} }) {
  return <div style={{ borderRadius: 24, background: "#f8f8f8", boxShadow: "0 14px 40px rgba(0,0,0,0.18)", overflow: "hidden", ...style }}>{children}</div>;
}
function SectionTitle({ children }) {
  return <h2 style={{ margin: "0 0 18px", color: "#e84d57", fontSize: 28, lineHeight: 1.1, fontWeight: 800 }}>{children}</h2>;
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
function RegistroRow({ title, registro, onSelect, disabled = false, bloqueado = false }) {
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
          {registro.retroactivo && <div style={{ color: "#b45309", fontWeight: 700 }}>Registro retroactivo</div>}
        </div>
      )}
    </div>
  );
}

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

function MesGrid({ titulo, items, registros, anio, mes, isMobile, onAdd }) {
  const daysInMonth = getDaysInMonth(anio, mes);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function buscarRegistro(nombre, day) {
    const fecha = esFromParts(anio, String(mes + 1).padStart(2,"0"), String(day).padStart(2,"0"));
    return registros.find((r) => (r.zona === nombre || r.deposito === nombre) && normalizeEsDate(r.fecha) === fecha);
  }

  return (
    <Card>
      <div style={{ padding: isMobile ? 12 : 18, display: "grid", gap: 14 }}>
        <SectionTitle>{titulo}</SectionTitle>
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #e7e7e7", background: "#fff" }}>
          <div style={{ minWidth: isMobile ? 1550 : 2400 }}>
            <div style={{ display: "grid", gridTemplateColumns: "220px repeat(" + daysInMonth + ", minmax(72px, 1fr))", background: "#f8fafc", borderBottom: "1px solid #e7e7e7", position: "sticky", top: 0, zIndex: 2 }}>
              <div style={{ padding: 10, fontWeight: 800, borderRight: "1px solid #e7e7e7" }}>Zona / Depósito</div>
              {days.map((d) => (
                <div key={d} style={{ padding: 10, textAlign: "center", fontWeight: 800, borderRight: "1px solid #eef2f7", fontSize: 13 }}>{d}</div>
              ))}
            </div>
            {items.map((item, idx) => (
              <div key={item} style={{ display: "grid", gridTemplateColumns: "220px repeat(" + daysInMonth + ", minmax(72px, 1fr))", borderBottom: idx === items.length - 1 ? "0" : "1px solid #f1f5f9" }}>
                <div style={{ padding: "10px 12px", borderRight: "1px solid #e7e7e7", fontWeight: 700, display: "flex", alignItems: "center" }}>{item}</div>
                {days.map((d) => {
                  const reg = buscarRegistro(item, d);
                  const fecha = esFromParts(anio, String(mes + 1).padStart(2,"0"), String(d).padStart(2,"0"));
                  return (
                    <button
                      key={d}
                      title={reg ? `${item}\n${reg.trabajador}\n${reg.fecha} ${reg.hora}${reg.retroactivo ? '\nRetroactivo' : ''}` : `Añadir ${item} - ${fecha}`}
                      onClick={() => { if (!reg) { onAdd(item, fecha); } }}
                      style={{
                        border: 0,
                        borderRight: "1px solid #eef2f7",
                        background: reg ? (reg.retroactivo ? "#fff7ed" : "#dcfce7") : "#fff",
                        color: reg ? (reg.retroactivo ? "#1f2937" : "#166534") : "#94a3b8",
                        minHeight: 64,
                        cursor: reg ? "default" : "pointer",
                        padding: 4,
                        display: "grid",
                        alignContent: "center",
                        justifyItems: "center",
                        gap: 2
                      }}
                    >
                      {reg ? (
                        <>
                          <div style={{ fontWeight: 800, fontSize: 11, lineHeight: 1, color: reg.retroactivo ? "#b45309" : "#166534" }}>
                            {reg.retroactivo ? "R" : "✔"}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.1, textAlign: "center", color: "#111827" }}>
                            {workerShort(reg.trabajador)}
                          </div>
                          <div style={{ fontSize: 9, lineHeight: 1.1, textAlign: "center", color: "#475569" }}>
                            {normalizeEsDate(reg.fecha)}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1, color: "#94a3b8" }}>·</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#555", fontWeight: 700 }}>
          Verde = hecho · Naranja = retroactivo · En cada celda se ve trabajador y fecha. Pulsa una celda pendiente para completar ese día.
        </div>
      </div>
    </Card>
  );
}

export default function Page() {
  const today = new Date();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState("perros");
  const [historicoTab, setHistoricoTab] = useState("perros");
  const [isMobile, setIsMobile] = useState(false);
  const [estadoConexion, setEstadoConexion] = useState("Conectando con Supabase...");
  const [infecciososGatos, setInfecciososGatos] = useState(false);
  const [infecciososPerros, setInfecciososPerros] = useState(false);
  const [mesHist, setMesHist] = useState(today.getMonth());
  const [anioHist, setAnioHist] = useState(today.getFullYear());
  const [limpiezaHoy, setLimpiezaHoy] = useState({});
  const [cloracionHoy, setCloracionHoy] = useState({});
  const [histPerros, setHistPerros] = useState([]);
  const [histGatos, setHistGatos] = useState([]);
  const [histCloro, setHistCloro] = useState([]);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [selectorTrabajador, setSelectorTrabajador] = useState("");
  const [selectorTrabajadorManual, setSelectorTrabajadorManual] = useState("");
  const [selectorItem, setSelectorItem] = useState("");
  const [selectorFecha, setSelectorFecha] = useState("");
  const [selectorTipo, setSelectorTipo] = useState("limpieza");
  const [protocoloPerros, setProtocoloPerros] = useState("");
  const [protocoloGatos, setProtocoloGatos] = useState("");
  const [protocoloCloro, setProtocoloCloro] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error(error);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      console.error(error);
      setLoginError("Correo o contraseña incorrectos.");
    }
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProtocoloPerros(localStorage.getItem("modepran_protocolo_perros") || "");
    setProtocoloGatos(localStorage.getItem("modepran_protocolo_gatos") || "");
    setProtocoloCloro(localStorage.getItem("modepran_protocolo_cloro") || "");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("modepran_protocolo_perros", protocoloPerros);
  }, [protocoloPerros]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("modepran_protocolo_gatos", protocoloGatos);
  }, [protocoloGatos]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("modepran_protocolo_cloro", protocoloCloro);
  }, [protocoloCloro]);

  async function cargarTodo() {
    try {
      const { data: limpias, error: e1 } = await supabase.from("registros_limpieza").select("*").order("created_at", { ascending: false });
      const { data: cloros, error: e2 } = await supabase.from("registros_cloracion").select("*").order("created_at", { ascending: false });
      if (e1) throw e1;
      if (e2) throw e2;

      const hoyEs = normalizeEsDate(new Date().toLocaleDateString("es-ES"));
      const mapHoyL = {};
      const mapHoyC = {};
      (limpias || []).forEach((item) => {
        if (normalizeEsDate(item.fecha) === hoyEs && !mapHoyL[item.zona]) {
          mapHoyL[item.zona] = { trabajador: item.trabajador, fecha: item.fecha, hora: item.hora, retroactivo: !!item.retroactivo, created_at: item.created_at };
        }
      });
      (cloros || []).forEach((item) => {
        if (normalizeEsDate(item.fecha) === hoyEs && !mapHoyC[item.deposito]) {
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
    const retroactivo = normalizeEsDate(fechaElegida) !== normalizeEsDate(tiempo.fecha);
    const { error } = await supabase.from("registros_limpieza").insert([{ categoria, grupo, zona, trabajador, fecha: fechaElegida, hora: tiempo.hora, retroactivo }]);
    if (error) { console.error(error); alert("No se ha podido guardar en Supabase"); return; }
    await cargarTodo();
  }

  async function registrarCloro(deposito, trabajador, fechaTrabajo=null) {
    if (!trabajador) return;
    const tiempo = ahora();
    const fechaElegida = fechaTrabajo || tiempo.fecha;
    const retroactivo = normalizeEsDate(fechaElegida) !== normalizeEsDate(tiempo.fecha);
    const { error } = await supabase.from("registros_cloracion").insert([{ deposito, trabajador, fecha: fechaElegida, hora: tiempo.hora, retroactivo }]);
    if (error) { console.error(error); alert("No se ha podido guardar en Supabase"); return; }
    await cargarTodo();
  }

  function abrirSelector(item, fecha, tipo) {
    setSelectorItem(item);
    setSelectorFecha(fecha);
    setSelectorTipo(tipo);
    setSelectorTrabajador("");
    setSelectorTrabajadorManual("");
    setSelectorAbierto(true);
  }

  async function confirmarSelector() {
    const trabajadorFinal = (selectorTrabajadorManual || selectorTrabajador || "").trim();
    if (!trabajadorFinal || !selectorItem || !selectorFecha) return;
    if (selectorTipo === "cloro") {
      await registrarCloro(selectorItem, trabajadorFinal, selectorFecha);
    } else {
      await registrar(selectorItem, trabajadorFinal, selectorFecha);
    }
    setSelectorAbierto(false);
    setSelectorTrabajador("");
    setSelectorTrabajadorManual("");
    setSelectorItem("");
    setSelectorFecha("");
    setSelectorTipo("limpieza");
  }

  const totalPendientes = useMemo(() => {
    const perros = Object.values(zonasPerros).flat().filter((z) => !limpiezaHoy[z]).length;
    const gatos = Object.values(zonasGatos).flat().filter((z) => !limpiezaHoy[z]).length;
    return perros + gatos + (infecciososPerros && !limpiezaHoy["Infecciosos Perros"] ? 1 : 0) + (infecciososGatos && !limpiezaHoy["Infecciosos Gatos"] ? 1 : 0);
  }, [limpiezaHoy, infecciososPerros, infecciososGatos]);

  const cloracionMesActual = useMemo(() => {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    const map = {};
    histCloro.forEach((item) => {
      const partes = String(item.fecha || "").split("/");
      if (partes.length !== 3) return;
      const m = Number(partes[1]);
      const y = Number(partes[2]);
      if (m === mes && y === anio && !map[item.deposito]) {
        map[item.deposito] = item;
      }
    });
    return map;
  }, [histCloro]);

  const pendientesCloracionMes = useMemo(() => {
    return depositos.filter((d) => !cloracionMesActual[d]).length;
  }, [cloracionMesActual]);

  function filtrarMes(list) {
    return list.filter((r) => {
      const [_, m, y] = normalizeEsDate(r.fecha).split("/");
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
    if (tipo === "perros") exportarListado("Histórico limpieza perros", perrosMes, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Día"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "gatos") exportarListado("Histórico limpieza gatos", gatosMes, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Día"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "cloro") exportarListado("Histórico cloración", cloroMes, [{key:"deposito",label:"Depósito"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Día"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
  }
  function exportarAnio(tipo) {
    const periodo = `Año ${anioHist}`;
    const perrosAnio = histPerros.filter((r) => Number(normalizeEsDate(r.fecha).split("/")[2]) === anioHist);
    const gatosAnio = histGatos.filter((r) => Number(normalizeEsDate(r.fecha).split("/")[2]) === anioHist);
    const cloroAnio = histCloro.filter((r) => Number(normalizeEsDate(r.fecha).split("/")[2]) === anioHist);
    if (tipo === "perros") exportarListado("Histórico anual limpieza perros", perrosAnio, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Día"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "gatos") exportarListado("Histórico anual limpieza gatos", gatosAnio, [{key:"grupo",label:"Grupo"},{key:"zona",label:"Zona"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Día"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
    if (tipo === "cloro") exportarListado("Histórico anual cloración", cloroAnio, [{key:"deposito",label:"Depósito"},{key:"trabajador",label:"Trabajador"},{key:"fecha",label:"Día"},{key:"hora",label:"Hora"},{key:"retroactivo",label:"Retroactivo"}], periodo);
  }

  const topCardStyle = { padding: isMobile ? "16px 18px" : "16px 20px", borderRadius: 18, border: 0, fontWeight: 800, fontSize: 16, cursor: "pointer" };
  const zonasPerrosOrdenadas = [...zonasPerros["Zona principal"], ...zonasPerros["Campo Nuevo"]];
  const zonasGatosOrdenadas = [...zonasGatos["Cuarentenas"], ...zonasGatos["Jaulones"]];

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#141414,#1d1d1d,#111)", padding: 20 }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>Cargando acceso…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#141414,#1d1d1d,#111)", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 430, background: "#f8f8f8", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg,#111,#232323)", color: "#fff", padding: 24, display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <img src="/logo.png" alt="Modepran" style={{ width: 74, height: 74, objectFit: "contain", borderRadius: 16, background: "rgba(255,255,255,0.04)", padding: 6 }} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>Acceso privado</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>Control sanitario Modepran</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
              Solo usuarios autorizados pueden entrar.
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ padding: 22, display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 700, color: "#222" }}>Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 700, color: "#222" }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={inputStyle}
                required
              />
            </div>

            {loginError && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 14 }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                padding: "15px 18px",
                borderRadius: 16,
                border: 0,
                background: "#e84d57",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                opacity: loginLoading ? 0.8 : 1
              }}
            >
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ borderRadius: 18, background: "#e84d57", color: "#fff", padding: isMobile ? "10px 14px" : "12px 18px", fontWeight: 800 }}>Registro interno</div>
              <button
                onClick={handleLogout}
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#111",
                  color: "#fff",
                  padding: isMobile ? "10px 14px" : "12px 18px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 8, background: "#171717", padding: 8, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 8, zIndex: 5 }}>
          {[["perros","🐶 Perros"],["gatos","🐱 Gatos"],["cloro","💧 Cloración"],["historico","📊 Histórico"]].map(([value, label]) => (
            <button key={value} onClick={() => setTab(value)} style={{ padding: isMobile ? "15px 8px" : "14px 16px", borderRadius: 14, border: 0, cursor: "pointer", background: tab === value ? "#e84d57" : "transparent", color: "#fff", fontWeight: 800, fontSize: isMobile ? 14 : 16 }}>{label}</button>
          ))}
        </div>

        {tab !== "historico" && (
          <div style={{ borderRadius: 20, background: totalPendientes === 0 ? "#064e3b" : "#3a2d00", color: "#fff", padding: isMobile ? "14px 16px" : "14px 18px", fontWeight: 800, fontSize: isMobile ? 15 : 16 }}>
            {totalPendientes === 0 ? "Limpieza al día. No quedan tareas pendientes." : `Pendientes actuales de limpieza: ${totalPendientes}`}
          </div>
        )}

        {tab === "perros" && (
          <div style={{ display: "grid", gap: 18 }}>
            <Card>
              <div style={{ padding: isMobile ? 16 : 22, display: "grid", gap: 10 }}>
                <SectionTitle>Protocolo de limpieza perros</SectionTitle>
                <textarea
                  value={protocoloPerros}
                  onChange={(e) => setProtocoloPerros(e.target.value)}
                  placeholder="Escribe aquí el protocolo o descripción de limpieza de perros e infecciosos..."
                  style={{ ...inputStyle, minHeight: 110, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </Card>
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

            {infecciososPerros && (
              <Card style={{ background: "linear-gradient(90deg,#dc2626,#ef4444)", color: "#fff" }}>
                <div style={{ padding: isMobile ? 16 : 24 }}>
                  <SectionTitle>Infecciosos Perros</SectionTitle>
                  <RegistroRow
                    title="Limpieza infecciosos perros"
                    registro={limpiezaHoy["Infecciosos Perros"]}
                    onSelect={(v) => registrar("Infecciosos Perros", v)}
                    disabled={!!limpiezaHoy["Infecciosos Perros"]}
                    bloqueado={!!limpiezaHoy["Infecciosos Perros"]}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "gatos" && (
          <div style={{ display: "grid", gap: 18 }}>
            <Card>
              <div style={{ padding: isMobile ? 16 : 22, display: "grid", gap: 10 }}>
                <SectionTitle>Protocolo de limpieza gatos</SectionTitle>
                <textarea
                  value={protocoloGatos}
                  onChange={(e) => setProtocoloGatos(e.target.value)}
                  placeholder="Escribe aquí el protocolo o descripción de limpieza de gatos e infecciosos..."
                  style={{ ...inputStyle, minHeight: 110, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </Card>
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

            {infecciososGatos && (
              <Card style={{ background: "linear-gradient(90deg,#dc2626,#ef4444)", color: "#fff" }}>
                <div style={{ padding: isMobile ? 16 : 24 }}>
                  <SectionTitle>Infecciosos Gatos</SectionTitle>
                  <RegistroRow
                    title="Limpieza infecciosos gatos"
                    registro={limpiezaHoy["Infecciosos Gatos"]}
                    onSelect={(v) => registrar("Infecciosos Gatos", v)}
                    disabled={!!limpiezaHoy["Infecciosos Gatos"]}
                    bloqueado={!!limpiezaHoy["Infecciosos Gatos"]}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "cloro" && (
          <div style={{ display: "grid", gap: 14 }}>
            <Card>
              <div style={{ padding: isMobile ? 16 : 22, display: "grid", gap: 10 }}>
                <SectionTitle>Protocolo de cloración</SectionTitle>
                <textarea
                  value={protocoloCloro}
                  onChange={(e) => setProtocoloCloro(e.target.value)}
                  placeholder="Escribe aquí el protocolo o descripción de cloración..."
                  style={{ ...inputStyle, minHeight: 110, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </Card>
            <div style={{
              borderRadius: 20,
              background: pendientesCloracionMes === 0 ? "#064e3b" : "#3a2d00",
              color: "#fff",
              padding: isMobile ? "14px 16px" : "14px 18px",
              fontWeight: 800,
              fontSize: isMobile ? 15 : 16
            }}>
              {pendientesCloracionMes === 0
                ? "Cloración del mes al día. Todos los depósitos están marcados este mes."
                : `Pendientes de cloración del mes actual: ${pendientesCloracionMes}`}
            </div>

            <div style={{ display: "grid", gap: 14, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(280px,1fr))" }}>
              {depositos.map((d) => {
                const registroMes = cloracionMesActual[d];
                return (
                  <RegistroRow
                    key={d}
                    title={d}
                    registro={registroMes ? {
                      trabajador: registroMes.trabajador,
                      fecha: registroMes.fecha,
                      hora: registroMes.hora,
                      retroactivo: !!registroMes.retroactivo
                    } : null}
                    onSelect={(v) => registrarCloro(d, v)}
                    disabled={!!registroMes}
                    bloqueado={!!registroMes}
                  />
                );
              })}
            </div>
          </div>
        )}

        {tab === "historico" && (
          <div style={{ display: "grid", gap: 18 }}>
            <Card>
              <div style={{ padding: isMobile ? 16 : 22, display: "grid", gap: 16 }}>
                <SectionTitle>Histórico mensual completo</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 12 }}>
                  <MonthYearPicker mes={mesHist} setMes={setMesHist} anio={anioHist} setAnio={setAnioHist} />
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <button onClick={() => exportarMes(historicoTab)} style={{ ...topCardStyle, background: "#e84d57", color: "#fff" }}>Exportar mes</button>
                    <button onClick={() => exportarAnio(historicoTab)} style={{ ...topCardStyle, background: "#111", color: "#fff" }}>Exportar año</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, background: "#efefef", padding: 8, borderRadius: 18 }}>
                  {[["perros","🐶 Perros"],["gatos","🐱 Gatos"],["cloro","💧 Cloración"]].map(([value, label]) => (
                    <button key={value} onClick={() => setHistoricoTab(value)} style={{ padding: "14px 10px", borderRadius: 14, border: 0, cursor: "pointer", background: historicoTab === value ? "#e84d57" : "transparent", color: historicoTab === value ? "#fff" : "#111", fontWeight: 800 }}>{label}</button>
                  ))}
                </div>
                <div style={{ fontSize: 14, color: "#555", fontWeight: 700 }}>
                  Aquí ves el mes entero de golpe. Pulsa una celda pendiente para completar ese día. Verde = hecho, naranja = retroactivo.
                </div>
              </div>
            </Card>

            {historicoTab === "perros" && (
              <MesGrid
                titulo={`Perros · ${meses[mesHist]} ${anioHist}`}
                items={zonasPerrosOrdenadas}
                registros={perrosMes}
                anio={anioHist}
                mes={mesHist}
                isMobile={isMobile}
                onAdd={(item, fecha) => abrirSelector(item, fecha, "limpieza")}
              />
            )}

            {historicoTab === "gatos" && (
              <MesGrid
                titulo={`Gatos · ${meses[mesHist]} ${anioHist}`}
                items={zonasGatosOrdenadas}
                registros={gatosMes}
                anio={anioHist}
                mes={mesHist}
                isMobile={isMobile}
                onAdd={(item, fecha) => abrirSelector(item, fecha, "limpieza")}
              />
            )}

            {historicoTab === "cloro" && (
              <MesGrid
                titulo={`Cloración · ${meses[mesHist]} ${anioHist}`}
                items={depositos}
                registros={cloroMes}
                anio={anioHist}
                mes={mesHist}
                isMobile={isMobile}
                onAdd={(item, fecha) => abrirSelector(item, fecha, "cloro")}
              />
            )}
          </div>
        )}
        {selectorAbierto && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "grid",
              placeItems: "center",
              padding: 20,
              zIndex: 1000
            }}
            onClick={() => setSelectorAbierto(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 420,
                background: "#fff",
                borderRadius: 24,
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                overflow: "hidden"
              }}
            >
              <div style={{ background: "linear-gradient(90deg,#111,#232323)", color: "#fff", padding: 20 }}>
                <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.05 }}>Completar registro</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 6 }}>
                  {selectorItem} · {selectorFecha}
                </div>
              </div>

              <div style={{ padding: 18, display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontWeight: 700, color: "#222" }}>Trabajador prefijado</label>
                  <select
                    value={selectorTrabajador}
                    onChange={(e) => setSelectorTrabajador(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Seleccionar trabajador</option>
                    {trabajadores.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontWeight: 700, color: "#222" }}>O escribir trabajador manualmente</label>
                  <input
                    type="text"
                    list="trabajadores-historico"
                    value={selectorTrabajadorManual}
                    onChange={(e) => setSelectorTrabajadorManual(e.target.value)}
                    placeholder="Escribe aquí el nombre si no está en la lista"
                    style={inputStyle}
                  />
                  <datalist id="trabajadores-historico">
                    {trabajadores.map((t) => (
                      <option key={`manual-${t}`} value={t} />
                    ))}
                  </datalist>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    onClick={() => setSelectorAbierto(false)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: "1px solid #ddd",
                      background: "#fff",
                      color: "#111",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarSelector}
                    disabled={!(selectorTrabajador || selectorTrabajadorManual.trim())}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: 0,
                      background: "#e84d57",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                      opacity: (selectorTrabajador || selectorTrabajadorManual.trim()) ? 1 : 0.7
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
