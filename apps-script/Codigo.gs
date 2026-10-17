// Google Apps Script para guardar confirmaciones en la hoja de cálculo.
// Pégalo en Extensiones > Apps Script desde tu hoja de Google Sheets.

const CUPO = 15;              // Máximo de respuestas "Voy"
const NOMBRE_HOJA = "Respuestas";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // evita que dos envíos simultáneos superen el cupo

  try {
    const datos = JSON.parse(e.postData.contents);
    const nombre = String(datos.nombre || "").trim();
    const respuesta = datos.respuesta === "Voy" ? "Voy" : "No voy";
    const restricciones = String(datos.restricciones || "").trim();

    if (!nombre) return responder({ estado: "error", mensaje: "Falta el nombre" });

    const hoja = obtenerHoja();

    if (respuesta === "Voy" && contarVoy(hoja) >= CUPO) {
      return responder({ estado: "lleno" });
    }

    hoja.appendRow([nombre, respuesta, restricciones, new Date()]);
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
    hoja.appendRow(["Nombre", "Respuesta", "Restricciones", "Fecha y hora"]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function contarVoy(hoja) {
  const filas = hoja.getLastRow() - 1;
  if (filas < 1) return 0;
  return hoja.getRange(2, 2, filas, 1).getValues()
    .filter(fila => fila[0] === "Voy").length;
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
