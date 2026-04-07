
'use client'
export default function Page() {
  const trabajadores = ['Maria penades', 'Joana todo', 'Martina simova', 'Mireia soro', 'Elena Palau', 'Katya urias', 'Kenia urias', 'David Valls', 'Johana tavera', 'Xujey Suarez', 'Rafa Sales', 'Jenny Martinez', 'Trini'];

  return (
    <div style={{color:'white',padding:20}}>
      <img src="/logo.png" style={{width:120}}/>
      <h1>Control sanitario Modepran</h1>

      <select>
        <option>Seleccionar trabajador</option>
        {trabajadores.map(t=> <option key={t}>{t}</option>)}
      </select>
    </div>
  );
}
