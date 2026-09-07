# Consulta de red de prestadores — Sucre

Directorio FOMAG organizado en cuatro pestañas: Servicios por prestador, Operadores farmacéuticos, Hospitalarios y PGP. Incluye búsqueda sin distinción de tildes, filtros por sección, paginación, impresión de todos los resultados filtrados y navegación por teclado.

## Fuente

[Consulta de servicios en Google Sheets](https://docs.google.com/spreadsheets/d/1jJseGFsbLr52BJ79ohkOYXXLiC27G_e___2-_2aPYg4/edit).

La API de Vercel consulta las cuatro hojas mediante CSV y almacena temporalmente la respuesta durante cinco minutos. El archivo debe conservar acceso de lectura mediante enlace. No se necesitan credenciales. Si la consulta falla, la página utiliza la copia incluida del 7 de septiembre de 2026 e informa claramente que no pudo comprobar actualizaciones.

La copia contiene 456 filas de servicios, 7 de operadores farmacéuticos, 9 hospitalarias y 2 de PGP. Las filas vacías se omiten; los contactos se preservan como texto. Las coberturas se separan por comas, punto y coma o salto de línea para filtrar. No se corrigen ni infieren municipios cuando la fuente tiene texto ambiguo o notas de cobertura.

## Desarrollo y despliegue

Node.js 24. Sin dependencias externas. `npm test` valida lectura CSV, filtros y recuentos. `npm run build` genera `dist`. `npm run dev` sirve una vista local en el puerto 4173 usando la copia del directorio.

Importar este repositorio en Vercel con preset Other. `vercel.json` define el comando de compilación, salida estática y función `/api/data`. Cada cambio en main dispara el despliegue mediante la integración GitHub–Vercel.

El logo se carga desde la URL oficial proporcionada de fomag.gov.co. La página no utiliza Apps Script ni modifica la hoja fuente.
