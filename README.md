# Proyecto Web - I.E. Santa Rosa de Santo Domingo

Proyecto base para un colegio público ubicado en Santo Domingo, Huarmey - Áncash.

## Objetivo

Crear una plataforma institucional con módulo de elecciones escolares mediante voto digital por código QR.

## Páginas incluidas

- `index.html`: portada institucional.
- `nosotros.html`: misión, visión y equipo docente.
- `niveles.html`: niveles/servicios educativos.
- `elecciones.html`: módulo público de voto escolar digital.
- `noticias.html`: comunicados y actividades.
- `galeria.html`: galería institucional.
- `documentos.html`: documentos y formatos.
- `contacto.html`: formulario de contacto.
- `admin-login.html`: acceso al panel interno.
- `admin.html`: panel de administración.

## Acceso administrador de demostración

- Usuario: `SANTAROSA`
- Contraseña: `VOTO2026`

## Votantes de prueba

Puedes probar el voto manual usando estos códigos:

- `SRSD-2026-001`
- `SRSD-2026-002`
- `SRSD-2026-003`
- `SRSD-2026-004`

También puedes ingresar al panel administrador y ver los QR generados para cada votante.

## Funciones del módulo de elecciones

- Habilitar o deshabilitar votación escolar.
- Registrar candidatos o listas, máximo 5.
- Registrar votantes.
- Generar QR por votante desde el panel administrador.
- Escanear QR con la cámara del computador.
- Permitir voto único por estudiante.
- Guardar voto de manera anónima.
- Mostrar resultados por candidato.
- Descargar padrón de votantes en CSV.

## Importante

Esta primera versión funciona con `localStorage`, ideal para mostrar el prototipo y validar la idea. Para producción real se recomienda migrar a:

- GitHub Pages para hosting gratuito.
- Firebase Authentication para login del administrador.
- Firebase Firestore para docentes, candidatos, votantes y votos.
- Reglas de seguridad en Firebase para proteger el padrón y los resultados.

## Estructura recomendada

```text
/index.html
/nosotros.html
/niveles.html
/elecciones.html
/noticias.html
/galeria.html
/documentos.html
/contacto.html
/admin-login.html
/admin.html
/assets/css/styles.css
/assets/js/app.js
/assets/img/insignia-santa-rosa.jpg
/assets/img/colegio-santa-rosa.jpg
/README.md
```

## Actualización: carga masiva de alumnos

En el panel administrador, sección **Votantes / QR**, ahora existe el bloque **Subir alumnos desde Excel**.

Columnas aceptadas en el archivo Excel/CSV:

- DNI
- APELLIDOS Y NOMBRES
- GRADO
- SECCION
- CODIGO o CODIGO QR, opcional

Si no se coloca código, el sistema genera uno automáticamente con formato `SRSD-2026-XXXX`.

Botones agregados:

- **Subir alumnos**: importa el padrón desde Excel o CSV.
- **Descargar plantilla Excel/CSV**: genera una plantilla para llenar en Excel.
- **Imprimir carnets QR**: crea una hoja imprimible con QR más grandes para que la cámara los lea mejor.

## Recomendación para lectura QR

Si la cámara de la laptop es borrosa, imprimir los QR grandes. Evitar capturas pequeñas, brillo de celular o QR arrugado. El sistema conserva ingreso manual de código como respaldo.

## Ajuste lector QR v3

- El lector QR ahora intenta primero usar la cámara nativa del navegador con `BarcodeDetector`.
- Si el navegador no lo soporta, intenta usar `html5-qrcode` como respaldo.
- Para evitar problemas de permisos o pantalla negra, se recomienda abrir el proyecto con **Live Server** o en `localhost`, no directamente desde `file:///`.
- El ingreso manual del código se mantiene como respaldo operativo para el día de la votación.

## Ajuste v4 - Cámara continua

- La cámara ya no se detiene después de identificar a un estudiante.
- Después de registrar un voto, el sistema vuelve automáticamente a la pantalla de escaneo.
- El permiso de cámara se solicita una sola vez por sesión, siempre que se abra con Live Server, localhost o GitHub Pages.
- Se mantiene el ingreso manual como respaldo si la cámara o el QR fallan.
