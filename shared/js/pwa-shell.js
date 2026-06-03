/* MindCraft Games - Shared PWA Registration & Install Banner Helper */

let deferredInstallPrompt = null;

// Initialize PWA features
function initPWA(swPath = './sw.js') {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swPath)
        .then(reg => console.log('ServiceWorker registration successful with scope: ', reg.scope))
        .catch(err => console.error('ServiceWorker registration failed: ', err));
    });
  }

  // 2. Capture Install Prompt Event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredInstallPrompt = e;
    
    // Show custom install UI
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
      installBtn.addEventListener('click', presentInstallPrompt);
    }
  });

  // 3. Track Successful Installation
  window.addEventListener('appinstalled', (evt) => {
    console.log('MindCraft app was successfully installed!');
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    deferredInstallPrompt = null;
  });
}

// Present standard installation prompt
function presentInstallPrompt() {
  if (!deferredInstallPrompt) return;
  
  // Show prompt
  deferredInstallPrompt.prompt();
  
  // Wait for user outcome
  deferredInstallPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredInstallPrompt = null;
    
    // Hide custom button
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  });
}
