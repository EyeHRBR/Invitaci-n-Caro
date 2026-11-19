// Google Apps Script: confirmaciones del encuentro con Jose Echeverri (Femme Readers).
// Pégalo en Extensiones > Apps Script desde tu hoja de Google Sheets.
//
// Qué hace:
// - Guarda cada confirmación en la pestaña "Confirmaciones" con fecha y hora.
// - Si el correo ya existe, actualiza esa fila en vez de crear una nueva (sin duplicados).
// - Envía un correo de confirmación (con el enlace de Zoom a quien asiste).
// - Devuelve el enlace de Zoom solo después de confirmar, para que no quede visible en la página.
// - Mantiene al día la pestaña "Resumen" con los conteos y las preguntas agrupadas por pilar.

const ZOOM = {
  url: "https://us02web.zoom.us/j/84548828919?pwd=YxmzVifjs8u6bMxO5mTk1I2comzLgr.1",
  id: "845 4882 8919",
  codigo: "084145"
};

const ENVIAR_CORREO = true;
const REMITENTE = "Femme Readers";

const HOJA_DATOS = "Confirmaciones";
const HOJA_RESUMEN = "Resumen";

// El orden de las columnas en la hoja
const COLUMNAS = [
  ["fecha", "Fecha y hora"],
  ["actualizado", "Última actualización"],
  ["nombre", "Nombre y apellido"],
  ["correo", "Correo"],
  ["whatsapp", "WhatsApp"],
  ["genero", "Género"],
  ["asiste", "¿Asiste?"],
  ["libro", "¿Terminó el libro?"],
  ["origen", "¿Cómo se enteró?"],
  ["invito", "¿Quién invitó / comunidad?"],
  ["ciudad", "Ciudad y país"],
  ["pilar", "Pilar que más le movió"],
  ["pregunta", "Pregunta para Jose"],
  ["negocio", "Tema de su negocio o equipo"],
  ["lectura", "Leer pregunta"],
  ["invitadoNombre", "Invita a (nombre)"],
  ["invitadoContacto", "Invita a (contacto)"],
  ["autorizo", "Autoriza tratamiento de datos"]
];
const COL = Object.fromEntries(COLUMNAS.map(([clave], i) => [clave, i]));

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  let datos, actualizado;
  try {
    datos = JSON.parse(e.postData.contents);
    const t = (v) => String(v || "").trim().slice(0, 3000);

    const fila = {};
    COLUMNAS.forEach(([clave]) => fila[clave] = t(datos[clave]));
    fila.correo = fila.correo.toLowerCase();

    if (!fila.nombre) return responder({ estado: "error", mensaje: "Falta el nombre" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fila.correo)) return responder({ estado: "error", mensaje: "Correo no válido" });
    if (!fila.whatsapp) return responder({ estado: "error", mensaje: "Falta el WhatsApp" });
    if (fila.autorizo !== "Sí") return responder({ estado: "error", mensaje: "Falta la autorización de datos" });
    fila.asiste = fila.asiste === "Sí" ? "Sí" : "No puedo, quiero la grabación";
    if (!fila.pregunta) fila.lectura = "";

    const hoja = obtenerHoja();
    const ahora = new Date();
    const existente = buscarCorreo(hoja, fila.correo);
    actualizado = existente > 0;

    if (actualizado) {
      // Conserva la fecha de la primera confirmación
      fila.fecha = hoja.getRange(existente, COL.fecha + 1).getValue();
      fila.actualizado = ahora;
    } else {
      fila.fecha = ahora;
      fila.actualizado = "";
    }

    const valores = [COLUMNAS.map(([clave]) => fila[clave])];
    if (actualizado) hoja.getRange(existente, 1, 1, COLUMNAS.length).setValues(valores);
    else hoja.appendRow(valores[0]);

    datos = fila;
  } catch (err) {
    lock.releaseLock();
    return responder({ estado: "error", mensaje: String(err) });
  }
  lock.releaseLock();

  // Lo que sigue no debe impedir la confirmación si falla
  try { if (ENVIAR_CORREO) enviarCorreo(datos, actualizado); } catch (err) { console.error("Correo: " + err); }
  try { actualizarResumen(); } catch (err) { console.error("Resumen: " + err); }

  const respuesta = { estado: "ok", actualizado };
  if (datos.asiste === "Sí") respuesta.zoom = ZOOM;
  return responder(respuesta);
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA_DATOS);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA_DATOS, 0);
    hoja.setFrozenRows(1);
  }
  hoja.getRange(1, 1, 1, COLUMNAS.length)
    .setValues([COLUMNAS.map(([, titulo]) => titulo)])
    .setFontWeight("bold");
  return hoja;
}

// Devuelve el número de fila con ese correo, o 0 si no existe
function buscarCorreo(hoja, correo) {
  const filas = hoja.getLastRow() - 1;
  if (filas < 1) return 0;
  const correos = hoja.getRange(2, COL.correo + 1, filas, 1).getValues();
  for (let i = 0; i < correos.length; i++) {
    if (String(correos[i][0]).trim().toLowerCase() === correo) return i + 2;
  }
  return 0;
}

function enviarCorreo(d, actualizado) {
  const nombre = d.nombre.split(/\s+/)[0];
  const va = d.asiste === "Sí";
  const asunto = va
    ? "Tu lugar está confirmado · Conversemos con Jose Echeverri (19 de noviembre)"
    : "Te enviaremos la grabación · Conversemos con Jose Echeverri";

  const estilo = "font-family:Arial,Helvetica,sans-serif;color:#3C3C3B;font-size:16px;line-height:1.6";
  const boton = "display:inline-block;background:#9D3DC1;color:#ffffff;padding:14px 22px;font-weight:bold;text-decoration:none;text-transform:uppercase;letter-spacing:1px";

  let cuerpo = `<div style="${estilo}">
    <div style="border-top:8px solid #F9197F;padding-top:16px">
    <p>Hola, ${escapar(nombre)}:</p>`;

  if (va) {
    cuerpo += `
    <p>${actualizado ? "Actualizamos tus respuestas. " : ""}Te esperamos en el encuentro de cierre de <strong>Liderazgo Imperfecto</strong> con su autor, Jose Echeverri.</p>
    <p><strong>Jueves 19 de noviembre · 5:00 p. m. (hora Colombia) · Por Zoom</strong></p>
    <p><a href="${ZOOM.url}" style="${boton}">Entrar a Zoom</a></p>
    <p>ID de la reunión: <strong>${ZOOM.id}</strong><br>Código: <strong>${ZOOM.codigo}</strong></p>
    <p>Si aún no enviaste tu pregunta para Jose, puedes hacerlo hasta el lunes 16 de noviembre volviendo a llenar el formulario con este mismo correo.</p>`;
  } else {
    cuerpo += `
    <p>${actualizado ? "Actualizamos tus respuestas. " : ""}Gracias por avisarnos. Cuando esté lista, te enviaremos a este correo la grabación del encuentro con Jose Echeverri.</p>`;
  }

  cuerpo += `
    <p>Un abrazo,<br>Femme Readers · Femme Bizz</p>
    </div></div>`;

  MailApp.sendEmail({ to: d.correo, subject: asunto, htmlBody: cuerpo, name: REMITENTE });
}

function escapar(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// ---------- Resumen ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Femme Readers")
    .addItem("Actualizar resumen", "actualizarResumen")
    .addItem("Probar envío de correo (a mí)", "probarCorreo")
    .addSeparator()
    .addItem("Recordatorio: probar (a mí)", "probarRecordatorio")
    .addItem("Recordatorio: enviar a inscritos", "enviarRecordatorio")
    .addItem("Recordatorio: enviar a Jose", "enviarCorreoJose")
    .addToUi();
}

function actualizarResumen() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const datos = obtenerHoja();
  let hoja = libro.getSheetByName(HOJA_RESUMEN);
  if (!hoja) hoja = libro.insertSheet(HOJA_RESUMEN, 1);
  hoja.clear();

  const n = datos.getLastRow() - 1;
  const filas = n > 0 ? datos.getRange(2, 1, n, COLUMNAS.length).getValues() : [];
  const asisten = filas.filter(f => f[COL.asiste] === "Sí");

  const salida = [];
  const titulos = [];
  const agregar = (fila) => salida.push(fila.concat(Array(3 - fila.length).fill("")));
  const titulo = (texto) => { titulos.push(salida.length + 1); agregar([texto]); };

  titulo("Totales");
  agregar(["Respuestas", filas.length]);
  agregar(["Confirmados (asisten)", asisten.length]);
  agregar(["Piden la grabación", filas.length - asisten.length]);
  agregar(["Con pregunta para Jose", filas.filter(f => f[COL.pregunta]).length]);
  agregar([""]);

  const conteo = (nombre, col, normalizar) => {
    titulo(nombre);
    agregar(["", "Respuestas", "Asisten"]);
    const mapa = {};
    filas.forEach(f => {
      let valor = String(f[col]).trim();
      if (normalizar) valor = normalizar(valor);
      if (!valor) valor = "(sin respuesta)";
      mapa[valor] = mapa[valor] || [0, 0];
      mapa[valor][0]++;
      if (f[COL.asiste] === "Sí") mapa[valor][1]++;
    });
    Object.entries(mapa).sort((a, b) => b[1][0] - a[1][0]).forEach(([k, [t, a]]) => agregar([k, t, a]));
    agregar([""]);
  };

  // Para agrupar textos escritos distinto ("bogotá", "Bogota ") en uno solo
  const normalizarTexto = (s) => s.replace(/\s+/g, " ").toLowerCase()
    .replace(/(^|[\s,(/-])\p{L}/gu, m => m.toUpperCase());

  conteo("Por género", COL.genero);
  conteo("Por cómo se enteró", COL.origen);
  conteo("Por quién invitó / comunidad", COL.invito, normalizarTexto);
  conteo("Por ciudad y país", COL.ciudad, normalizarTexto);
  conteo("¿Terminó el libro?", COL.libro);

  titulo("Preguntas para Jose por pilar");
  agregar(["Pilar", "Pregunta", "Se lee como"]);
  filas.filter(f => f[COL.pregunta])
    .sort((a, b) => (!a[COL.pilar] - !b[COL.pilar]) || String(a[COL.pilar]).localeCompare(String(b[COL.pilar])))
    .forEach(f => agregar([
      f[COL.pilar] || "(sin pilar)",
      f[COL.pregunta],
      f[COL.lectura] === "Anónima" ? "Anónima" : f[COL.nombre]
    ]));

  hoja.getRange(1, 1, salida.length, 3).setValues(salida).setVerticalAlignment("top");
  titulos.forEach(r => hoja.getRange(r, 1).setFontWeight("bold").setFontColor("#9D3DC1").setFontSize(12));
  hoja.setColumnWidth(1, 280);
  hoja.setColumnWidth(2, 420);
  hoja.setColumnWidth(3, 180);
  hoja.getRange(1, 2, salida.length, 1).setWrap(true);
}

// ---------- Recordatorio del día del evento ----------

// true: el correo a Jose incluye las preguntas (las anónimas van sin nombre)
const INCLUIR_PREGUNTAS_A_JOSE = true;
const IMAGEN_RECORDATORIO = "https://femme-readers-jose-echeverri.vercel.app/assets/recordatorio-hoy.jpg";

function cuerpoRecordatorio(nombre) {
  const boton = "display:inline-block;background:#9D3DC1;color:#ffffff;padding:14px 22px;font-weight:bold;text-decoration:none;text-transform:uppercase;letter-spacing:1px";
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#3C3C3B;font-size:16px;line-height:1.6">
    <p style="margin:0 0 16px"><img src="${IMAGEN_RECORDATORIO}" width="540" alt="Hoy, 5:00 p. m. hora Colombia, por Zoom. Conversamos con Jose Echeverri, autor de Liderazgo Imperfecto." style="display:block;width:100%;max-width:540px;height:auto;border:0"></p>
    <div style="border-top:8px solid #F9197F;padding-top:16px">
    <p>Hola, ${escapar(nombre)}:</p>
    <p><strong>Hoy es el encuentro.</strong> Te esperamos a las <strong>5:00 p. m. (hora Colombia)</strong> para conversar con Jose Echeverri, autor de <strong>Liderazgo Imperfecto</strong>.</p>
    <p><a href="${ZOOM.url}" style="${boton}">Entrar a Zoom</a></p>
    <p>ID de la reunión: <strong>${ZOOM.id}</strong><br>Código: <strong>${ZOOM.codigo}</strong></p>
    <p>Te recomendamos conectarte unos minutos antes. Si no terminaste el libro, ven igual.</p>
    <p>Nos vemos en un rato,<br>Femme Readers · Femme Bizz</p>
    </div></div>`;
}

function probarRecordatorio() {
  const correo = Session.getActiveUser().getEmail();
  MailApp.sendEmail({ to: correo, subject: "Hoy a las 5:00 p. m. · Conversemos con Jose Echeverri", htmlBody: cuerpoRecordatorio("Prueba"), name: REMITENTE });
  SpreadsheetApp.getUi().alert("Recordatorio de prueba enviado a " + correo);
}

// Envía el recordatorio a todas las personas que respondieron "Sí". No se envía dos veces.
function enviarRecordatorio() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty("recordatorioEnviado")) {
    ui.alert("El recordatorio ya se envió (" + props.getProperty("recordatorioEnviado") + "). No se envió de nuevo.");
    return;
  }
  const hoja = obtenerHoja();
  const n = hoja.getLastRow() - 1;
  const filas = n > 0 ? hoja.getRange(2, 1, n, COLUMNAS.length).getValues() : [];
  const vistos = {};
  const destinatarios = filas
    .filter(f => f[COL.asiste] === "Sí")
    .map(f => ({ nombre: String(f[COL.nombre]).trim(), correo: String(f[COL.correo]).trim().toLowerCase() }))
    .filter(d => d.correo && !vistos[d.correo] && (vistos[d.correo] = true));

  const restantes = MailApp.getRemainingDailyQuota();
  const ok = ui.alert("Enviar recordatorio",
    `Se enviará a ${destinatarios.length} personas que confirmaron. Correos disponibles hoy: ${restantes}. ¿Enviar?`,
    ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;

  let enviados = 0;
  const fallidos = [];
  destinatarios.forEach(d => {
    try {
      MailApp.sendEmail({ to: d.correo, subject: "Hoy a las 5:00 p. m. · Conversemos con Jose Echeverri", htmlBody: cuerpoRecordatorio(d.nombre.split(/\s+/)[0]), name: REMITENTE });
      enviados++;
    } catch (err) {
      fallidos.push(d.correo);
    }
  });
  props.setProperty("recordatorioEnviado", new Date().toLocaleString("es-CO"));
  ui.alert(`Recordatorio enviado a ${enviados} personas.` + (fallidos.length ? `\nNo se pudo enviar a: ${fallidos.join(", ")}` : ""));
}

// Correo para Jose: logística, número de inscritos y (opcional) las preguntas por pilar
function enviarCorreoJose() {
  const ui = SpreadsheetApp.getUi();
  const pedido = ui.prompt("Enviar a Jose", "Escribe el correo de Jose Echeverri:", ui.ButtonSet.OK_CANCEL);
  if (pedido.getSelectedButton() !== ui.Button.OK) return;
  const CORREO_JOSE = pedido.getResponseText().trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(CORREO_JOSE)) { ui.alert("Ese correo no parece válido. Vuelve a intentarlo."); return; }

  const hoja = obtenerHoja();
  const n = hoja.getLastRow() - 1;
  const filas = n > 0 ? hoja.getRange(2, 1, n, COLUMNAS.length).getValues() : [];
  const confirmados = filas.filter(f => f[COL.asiste] === "Sí").length;

  let preguntas = "";
  if (INCLUIR_PREGUNTAS_A_JOSE) {
    const porPilar = {};
    filas.filter(f => String(f[COL.pregunta]).trim()).forEach(f => {
      const pilar = f[COL.pilar] || "Sin pilar";
      const autor = f[COL.lectura] === "Anónima" ? "Anónima" : String(f[COL.nombre]).trim();
      (porPilar[pilar] = porPilar[pilar] || []).push(`<li>${escapar(f[COL.pregunta])} <span style="color:#6B6B69">— ${escapar(autor)}</span></li>`);
    });
    const bloques = Object.keys(porPilar).sort((a, b) => (a === "Sin pilar") - (b === "Sin pilar") || a.localeCompare(b))
      .map(p => `<p style="margin:18px 0 6px"><strong style="color:#9D3DC1">${escapar(p)}</strong></p><ul style="margin:0;padding-left:20px">${porPilar[p].join("")}</ul>`);
    preguntas = bloques.length
      ? `<p>Estas son las preguntas que nos enviaron, agrupadas por el pilar que más les movió:</p>${bloques.join("")}`
      : "";
  }

  const boton = "display:inline-block;background:#9D3DC1;color:#ffffff;padding:14px 22px;font-weight:bold;text-decoration:none;text-transform:uppercase;letter-spacing:1px";
  const cuerpo = `<div style="font-family:Arial,Helvetica,sans-serif;color:#3C3C3B;font-size:16px;line-height:1.6">
    <div style="border-top:8px solid #F9197F;padding-top:16px">
    <p>Hola, Jose:</p>
    <p>Gracias de nuevo por acompañarnos. Te recordamos que hoy es el encuentro de cierre de <strong>Liderazgo Imperfecto</strong> con Femme Readers.</p>
    <p><strong>Hoy, jueves 19 de noviembre · 5:00 p. m. (hora Colombia) · Por Zoom</strong></p>
    <p><a href="${ZOOM.url}" style="${boton}">Entrar a Zoom</a></p>
    <p>ID de la reunión: <strong>${ZOOM.id}</strong><br>Código: <strong>${ZOOM.codigo}</strong></p>
    <p>Hasta ahora hay <strong>${confirmados} personas</strong> confirmadas.</p>
    ${preguntas}
    <p>Un abrazo,<br>Femme Readers · Femme Bizz</p>
    </div></div>`;

  const ok = ui.alert("Enviar a Jose", `Se enviará a ${CORREO_JOSE} con ${confirmados} confirmados${INCLUIR_PREGUNTAS_A_JOSE ? " y las preguntas" : ""}. ¿Enviar?`, ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;
  MailApp.sendEmail({ to: CORREO_JOSE, subject: "Hoy 5:00 p. m. · Encuentro Femme Readers · Liderazgo Imperfecto", htmlBody: cuerpo, name: REMITENTE });
  ui.alert("Correo enviado a Jose (" + CORREO_JOSE + ").");
}

function probarCorreo() {
  const correo = Session.getActiveUser().getEmail();
  enviarCorreo({ nombre: "Prueba", correo, asiste: "Sí" }, false);
  SpreadsheetApp.getUi().alert("Enviado a " + correo);
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
