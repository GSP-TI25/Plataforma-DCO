// Ubicación: DCO/apps/backend/src/api/generator/generator.service.js

const playwright = require("playwright");
const fs = require("fs");
const path = "path";
const http = require('http');
const https = "https";
const cloudinary = require('cloudinary').v2; // <<< ¡NUEVO! Importamos cloudinary

// --- HELPERS -- -
// ... (La función replacePlaceholders no cambia)
const replacePlaceholders = (text, dataRow) => {
  if (typeof text !== "string") return "";
  let newText = text;
  for (const key in dataRow) {
    const regex = new RegExp(`{{${key}}}`, "g");
    newText = newText.replace(regex, dataRow[key]);
  }
  return newText;
};

// ... (La función imageUrlToDataURI no cambia)
const imageUrlToDataURI = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return resolve(imageUrlToDataURI(response.headers.location));
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get image, status code: ${response.statusCode}`));
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = response.headers['content-type'];
        const base64 = buffer.toString('base64');
        resolve(`data:${contentType};base64,${base64}`);
      });
    });
    request.on('error', (err) => {
      reject(err);
    });
  });
};


// --- MAIN SERVICE FUNCTION -- -
const generateCreatives = async (generationData) => {
  // ... (Toda la lógica para preparar el HTML y lanzar Playwright se mantiene igual)
  // 1. Preparamos los datos
  const { template, dataRow } = generationData;
  if (!template) {
    throw new Error('Datos de plantilla no proporcionados.');
  }

  // --- ¡NUEVO! Calculamos el tamaño total del diseño ---
  let totalWidth = 0;
  let totalHeight = 0;
  template.content.forEach(el => {
    // Consideramos la posición y el tamaño de cada elemento
    const elRight = el.x + el.width;
    const elBottom = el.y + el.height;
    if (elRight > totalWidth) {
      totalWidth = elRight;
    }
    if (elBottom > totalHeight) {
      totalHeight = elBottom;
    }
  });

  // Nos aseguramos de que las dimensiones no sean cero
  totalWidth = Math.max(totalWidth, 1);
  totalHeight = Math.max(totalHeight, 1);

  const processedElements = await Promise.all(
    template.content.map(async (el) => {
      if (el.tipo === 'imagen') {
        const imageUrl = replacePlaceholders(el.contenido, dataRow);
        try {
          const dataUri = await imageUrlToDataURI(imageUrl);
          return { ...el, contenido: dataUri };
        } catch (error) {
          console.error(`Error al procesar la imagen ${imageUrl}:`, error);
          return { ...el, contenido: '' };
        }
      }
      return el;
    })
  );

  // 2. Serializamos los datos
  const elementsJson = JSON.stringify(processedElements);
  const dataRowJson = JSON.stringify(dataRow);

  // 3. Creamos el HTML esqueleto con el script de renderizado
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        strong { font-weight: bold; }
        em { font-style: italic; }
      </style>
    </head>
    <body>
      <div id="capture-area" style="display: inline-block; width: ${totalWidth}px; height: ${totalHeight}px; position: relative; overflow: hidden;"></div>
      <script>
        const elements = ${elementsJson};
        const dataRow = ${dataRowJson};
        const container = document.getElementById('capture-area');
        const replacePlaceholdersClient = (text, data) => {
          if (typeof text !== 'string') return '';
          let newText = text;
          for (const key in data) {
            const regex = new RegExp('{{' + key + '}}', 'g');
            newText = newText.replace(regex, data[key]);
          }
          return newText;
        };
        elements.forEach((el, index) => {
          const div = document.createElement('div');
          div.style.position = 'absolute';
          div.style.left = el.x + 'px';
          div.style.top = el.y + 'px';
          div.style.width = el.width + 'px';
          div.style.height = el.height + 'px';
          div.style.transform = 'rotate(' + (el.rotation || 0) + 'deg)';
          if (el.tipo === 'imagen') {
            const img = document.createElement('img');
            img.src = el.contenido;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            div.appendChild(img);
          } else if (el.tipo === 'texto') {
            div.style.fontSize = el.fontSize + 'px';
            div.style.textAlign = el.textAlign;
            div.style.color = el.color;
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = el.textAlign === 'center' ? 'center' : 'flex-start';
            div.style.wordWrap = 'break-word';
            div.style.lineHeight = '1.2';
            div.innerHTML = replacePlaceholdersClient(el.contenido, dataRow);
          }
          // Si este es el ÚLTIMO elemento, le ponemos nuestra bandera
          if (index === elements.length - 1) {
            div.setAttribute('data-last-element', 'true');
          }
          container.appendChild(div);
        });
      </script>
    </body>
    </html>
  `;
  // 4. Lanzamos Playwright
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'load' });
  // 5. Esperamos la señal de que nuestro script terminó de dibujar
  await page.waitForSelector('[data-last-element="true"]');
  // 6. Tomamos la foto
  const elementHandle = await page.locator('#capture-area');
  const screenshotBuffer = await elementHandle.screenshot({ type: 'png' });
  await browser.close();

  // <<< --- CAMBIO PRINCIPAL AQUÍ --- >>>
  // 7. Subimos la imagen a Cloudinary en lugar de guardarla localmente.
  const uploadResponse = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'dco_generated_creatives' }, // Carpeta en Cloudinary
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(screenshotBuffer);
  });
  
  // 8. Devolvemos la URL segura de Cloudinary.
  return { imageUrl: uploadResponse.secure_url };
};

module.exports = {
  generateCreatives,
};