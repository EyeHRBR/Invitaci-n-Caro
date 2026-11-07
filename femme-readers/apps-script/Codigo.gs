// Google Apps Script para guardar las confirmaciones del cierre de Femme Readers.
// Pégalo en Extensiones > Apps Script desde tu hoja de Google Sheets.

const NOMBRE_HOJA = "Confirmaciones";
const ENCABEZADOS = ["Fecha y hora", "Nombre", "Correo", "Género", "¿Cómo se enteró?", "¿Asiste?", "Lectura", "Pilar favorito", "Pregunta para José", "Persona invitada"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const datos = JSON.parse(e.postData.contents);
    const texto = (v) => String(v || "").trim();

    const nombre = texto(datos.nombre);
    if (!nombre) return responder({ estado: "error", mensaje: "Falta el nombre" });

    const asiste = datos.asiste === "Sí" ? "Sí" : "No";

    obtenerHoja().appendRow([
      new Date(),
      nombre,
      texto(datos.correo),
      texto(datos.genero),
      texto(datos.origen),
      asiste,
      texto(datos.lectura),
      texto(datos.pilar),
      texto(datos.pregunta),
      texto(datos.amiga)
    ]);

    return responder({ estado: "ok" });
  } catch (err) {
    return responder({ estado: "error", mensaje: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
    hoja.setFrozenRows(1);
  }
  hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]);
  return hoja;
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
