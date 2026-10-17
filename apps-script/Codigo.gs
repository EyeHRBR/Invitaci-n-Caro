// Google Apps Script para guardar confirmaciones en la hoja de cálculo.
// Pégalo en Extensiones > Apps Script desde tu hoja de Google Sheets.

const CUPO = 15;              // Máximo de personas que van (cada acompañante cuenta)
const NOMBRE_HOJA = "Respuestas";
const ENCABEZADOS = ["Nombre", "Respuesta", "Restricciones", "Fecha y hora", "Acompañante"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // evita que dos envíos simultáneos superen el cupo

  try {
    const datos = JSON.parse(e.postData.contents);
    const nombre = String(datos.nombre || "").trim();
    const respuesta = datos.respuesta === "Voy" ? "Voy" : "No voy";
    const acompanante = respuesta === "Voy" ? String(datos.acompanante || "").trim() : "";
    const restricciones = String(datos.restricciones || "").trim();

    if (!nombre) return responder({ estado: "error", mensaje: "Falta el nombre" });

    const hoja = obtenerHoja();

    if (respuesta === "Voy") {
      const personas = acompanante ? 2 : 1;
      if (contarPersonas(hoja) + personas > CUPO) {
        return responder({ estado: "lleno" });
      }
    }

    hoja.appendRow([nombre, respuesta, restricciones, new Date(), acompanante]);
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

// Cuenta a cada persona que va, más su acompañante si lo trae
function contarPersonas(hoja) {
  const filas = hoja.getLastRow() - 1;
  if (filas < 1) return 0;
  return hoja.getRange(2, 1, filas, ENCABEZADOS.length).getValues()
    .filter(fila => fila[1] === "Voy")
    .reduce((total, fila) => total + (String(fila[4]).trim() ? 2 : 1), 0);
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
