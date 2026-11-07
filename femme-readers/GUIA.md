# Guía: confirmación Femme Readers (cierre con José Echeverri)

## Archivos

- `index.html`: la página (todo en un solo archivo).
- `apps-script/Codigo.gs`: el script que guarda las respuestas en Google Sheets.

## 1. Crear la hoja y el script

1. Entra a [sheets.new](https://sheets.new) y nombra la hoja, por ejemplo "Femme Readers · Cierre".
2. Abre **Extensiones › Apps Script**.
3. Borra lo que aparece en `Código.gs` y pega todo el contenido de `apps-script/Codigo.gs`.
4. Guarda con el ícono del disquete.

La pestaña "Confirmaciones" con sus encabezados se crea sola con la primera respuesta.
Ahí verás en una columna todas las preguntas para José, listas para llevar al encuentro.

## 2. Publicar el script como aplicación web

1. **Implementar › Nueva implementación** › tipo **Aplicación web**.
2. **Ejecutar como:** Yo. **Quién tiene acceso:** Cualquier usuario.
3. **Implementar** y **Autorizar acceso** (si aparece "Google no verificó esta app": **Configuración avanzada › Ir a … › Permitir**).
4. Copia la **URL de la aplicación web** (termina en `/exec`).
5. En `index.html`, reemplaza `PEGA_AQUI_LA_URL_DEL_SCRIPT` por esa URL (deja las comillas).

## 3. Publicar la página

La forma más fácil: [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta `femme-readers`.
Puedes cambiar el nombre del sitio en **Site configuration › Change site name** (por ejemplo `femme-readers-cierre`).

## 4. Antes de compartir

Abre el enlace desde el celular, envía una respuesta "Sí" y otra "No", revisa que lleguen a la hoja y bórralas.
