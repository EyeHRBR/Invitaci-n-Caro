# Guía: confirmación de asistencia

## Archivos

- `index.html`: la página (todo en un solo archivo).
- `foto_invitacion.jpg`: la foto del arco (debe estar junto a `index.html`).
- `apps-script/Codigo.gs`: el script que guarda las respuestas en Google Sheets.

## 1. Crear la hoja y el script

1. Entra a [sheets.new](https://sheets.new) y ponle un nombre a la hoja, por ejemplo "Confirmaciones Caro".
2. En el menú, abre **Extensiones › Apps Script**.
3. Borra lo que aparece en `Código.gs` y pega todo el contenido de `apps-script/Codigo.gs`.
4. Guarda con el ícono del disquete.

La pestaña "Respuestas", con sus encabezados, se crea sola con la primera confirmación.

## 2. Publicar el script como aplicación web

1. Arriba a la derecha, haz clic en **Implementar › Nueva implementación**.
2. En el engrane junto a "Seleccionar tipo", elige **Aplicación web**.
3. Llena así:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. Haz clic en **Implementar** y luego en **Autorizar acceso**. Elige tu cuenta.
   Si aparece "Google no verificó esta app", haz clic en **Configuración avanzada › Ir a (nombre del proyecto)** y luego en **Permitir**.
5. Copia la **URL de la aplicación web** (termina en `/exec`).
6. En `index.html`, busca `PEGA_AQUI_LA_URL_DEL_SCRIPT` y reemplázalo por esa URL (deja las comillas).

> Si después cambias el script, ve a **Implementar › Administrar implementaciones**, haz clic en el lápiz, elige **Versión: Nueva versión** y vuelve a implementar. Así la URL no cambia.

### Probarlo

Abre `index.html` en tu navegador, envía una respuesta de prueba y comprueba que aparezca en la hoja. Luego borra esa fila.

## 3. Publicar la página

Elige **una** de las dos opciones.

### Opción A: Netlify (la más fácil, sin cuenta de GitHub)

1. Entra a [app.netlify.com/drop](https://app.netlify.com/drop) e inicia sesión o crea una cuenta gratis.
2. Arrastra a la página la **carpeta** que contiene `index.html` y `foto_invitacion.jpg`.
3. En unos segundos te da un enlace como `https://algo-raro-123.netlify.app`.
4. Para cambiar el nombre: **Site configuration › Change site name** (por ejemplo `cumple-caro`, que da `cumple-caro.netlify.app`).
5. Para actualizar la página después, ve a la pestaña **Deploys** y vuelve a arrastrar la carpeta.

### Opción B: Vercel (conectado a este repositorio de GitHub)

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con **Continue with GitHub**.
2. Haz clic en **Add New… › Project**.
3. Busca el repositorio `Invitaci-n-Caro` y haz clic en **Import** (si no aparece, usa **Adjust GitHub App Permissions** para darle acceso).
4. En **Framework Preset**, deja **Other**. No cambies nada más.
5. Haz clic en **Deploy**. Al terminar, te da un enlace como `invitaci-n-caro.vercel.app`.
6. Cada vez que se suba un cambio a la rama publicada, Vercel actualiza la página sola.
   (En **Settings › Git › Production Branch** puedes elegir qué rama se publica.)

## 4. Antes de compartir el enlace

- Abre el enlace desde tu celular y envía una prueba con "Voy" y otra con "No voy".
- Revisa que lleguen a la hoja y bórralas.
- Para cambiar el cupo, edita `CUPO` en el script y publica una **nueva versión** (paso 2). El número solo vive en el script, así que nunca aparece en la página.
