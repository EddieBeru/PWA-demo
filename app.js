// Registrar el Service Worker necesario para capacidades offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registrado exitosamente:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Manejar la promoción de instalación de PWA
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  // Mostrar el prompt de instalación estándar
  deferredPrompt.prompt();

  // Esperar la elección del usuario
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Resultado de la elección de instalación: ${outcome}`);

  // Restablecer el prompt diferido
  deferredPrompt = null;
  // Ocultar el botón de nuevo
  installBtn.style.display = 'none';
});

// Ocultar el botón de instalación cuando la aplicación se instala exitosamente
window.addEventListener('appinstalled', () => {
  console.log('PWA fue instalada exitosamente!');
  installBtn.style.display = 'none';
});
