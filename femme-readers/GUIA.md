# Guía: confirmación · Conversemos con Jose Echeverri

## Archivos

- `index.html`: la página.
- `assets/`: logo, portada, foto de Jose, flyer y la tipografía Wild Mango (ver `assets/LEEME.md`).
- `apps-script/Codigo.gs`: guarda las respuestas en Google Sheets, evita duplicados, envía el correo con el Zoom y arma el resumen.

## 1. Crear la hoja y el script

1. Entra a [sheets.new](https://sheets.new) y nombra la hoja, por ejemplo "Femme Readers · Jose Echeverri".
2. Abre **Extensiones › Apps Script**, borra lo que hay en `Código.gs` y pega todo `apps-script/Codigo.gs`. Guarda.
3. Arriba, elige la función `probarCorreo` y haz clic en **Ejecutar**. Google te pedirá permisos (hoja y correo): acéptalos.
   Si aparece "Google no verificó esta app": **Configuración avanzada › Ir a … › Permitir**. Te debe llegar un correo de prueba.

## 2. Publicar el script

1. **Implementar › Nueva implementación** › tipo **Aplicación web**.
2. **Ejecutar como:** Yo. **Quién tiene acceso:** Cualquier usuario. **Implementar**.
3. Copia la URL (termina en `/exec`) y pégala en `index.html` en lugar de `PEGA_AQUI_LA_URL_DEL_SCRIPT`.

> Si cambias el script después: **Implementar › Administrar implementaciones › lápiz › Versión: Nueva versión**. Así la URL no cambia.

## 3. Publicar la página

[app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta `femme-readers` completa (con `assets`).
Luego, en `index.html`, cambia `og:image` por la URL completa del flyer (por ejemplo `https://tu-sitio.netlify.app/assets/Femme-Readers-Invitacion-Jose-Echeverri.png`) y vuelve a subir la carpeta. Así se ve el flyer al compartir el enlace.

## 4. Ver los datos

- **Confirmaciones:** una fila por persona. Si alguien llena el formulario otra vez con el mismo correo, se actualiza su fila (no se duplica) y la columna "Última actualización" muestra cuándo.
- **Resumen:** se actualiza sola con cada respuesta (o desde el menú **Femme Readers › Actualizar resumen**). Muestra el total de confirmados y los conteos por género, cómo se enteró, quién invitó / comunidad, ciudad y país, si terminó el libro, y las preguntas para Jose agrupadas por pilar (con el nombre o "Anónima").
- **Exportar:** **Archivo › Descargar › Valores separados por comas (.csv)** descarga la pestaña que tengas abierta.

## Privacidad del Zoom

El enlace y el código de Zoom no están en la página: solo los conoce el script. Se muestran en la pantalla de gracias y se envían por correo a quien confirma que asiste.

## Antes de compartir

- Reemplaza el texto de autorización de datos en `index.html` (busca `TEXTO LEGAL PENDIENTE`).
- Desde el celular, envía una prueba "Sí" y otra "No puedo", revisa los correos y la hoja, y borra esas filas.
