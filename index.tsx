/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Informa TypeScript della variabile globale 'L' fornita dalla libreria Leaflet
declare const L: any;

document.addEventListener('DOMContentLoaded', () => {
  // --- Elementi DOM ---
  const mapElement = document.getElementById('map');
  const appStatusElement = document.getElementById('app-status');
  const notificationElement = document.getElementById('notification');
  const notificationMessageElement = document.getElementById('notification-message');
  const notificationCloseButton = document.getElementById('notification-close');
  const centerMapButton = document.getElementById('center-map-btn');
  const addSpotButton = document.getElementById('add-spot-btn');
  const spotModalBackdrop = document.getElementById('spot-modal-backdrop');
  const spotModal = document.getElementById('spot-modal');
  // FIX: Cast spotForm to HTMLFormElement to access the reset() method.
  const spotForm = document.getElementById('spot-form') as HTMLFormElement;
  const cancelSpotButton = document.getElementById('cancel-spot-btn');
  const spotPhotoInput = document.getElementById('spot-photo') as HTMLInputElement;
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreview = document.getElementById('image-preview') as HTMLImageElement;

  // Verifica la presenza degli elementi essenziali
  if (!mapElement || !notificationElement || !spotModalBackdrop || !spotForm) {
    console.error("Elementi UI essenziali non trovati nel DOM!");
  appStatusElement?.classList.remove('hidden');
  if (appStatusElement) appStatusElement.textContent = 'Errore: elementi UI mancanti nel DOM.';
    return;
  }

  // --- Stato dell'Applicazione ---
  let userMarker: any = null;
  let isAddingSpotMode = false;
  // FIX: Use 'any' for Leaflet LatLng type as 'L' namespace is not defined.
  let newSpotCoords: any | null = null;
  const spots: any[] = []; // Array in memoria per contenere le segnalazioni
  // Mappa (definita a livello superiore per uso nei listener)
  let map: any;

  // --- Funzioni di Utilità UI ---
  function showNotification(message: string, temporary: boolean = false) {
    notificationMessageElement!.textContent = message;
    notificationElement!.classList.remove('hidden');
    if (temporary) {
        setTimeout(hideNotification, 3000);
    }
  }

  function hideNotification() {
    notificationElement!.classList.add('hidden');
  }

  // --- Status helpers ---
  function showStatus(msg: string) {
    if (!appStatusElement) return;
    appStatusElement.textContent = msg;
    appStatusElement.classList.remove('hidden');
  }
  function hideStatus() { appStatusElement?.classList.add('hidden'); }

  // --- Inizializzazione Mappa ---
  try {
    if (typeof L === 'undefined') {
      showStatus('Errore: libreria Leaflet non caricata. Ricarica la pagina (CTRL+F5).');
      return;
    }
    showStatus('Inizializzazione mappa…');
    map = L.map(mapElement).setView([41.9028, 12.4964], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    hideStatus();

  // --- Logica di Geolocalizzazione ---
  function centerOnUserLocation() {
    // ... (codice invariato)
    if (!('geolocation' in navigator)) {
      showNotification("Il tuo browser non supporta la geolocalizzazione.");
      return;
    }
    showNotification("Sto cercando la tua posizione...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        hideNotification();
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
        if (userMarker) {
            map.removeLayer(userMarker);
        }
        userMarker = L.marker([latitude, longitude]).addTo(map)
          .bindPopup('<b>Tu sei qui!</b>')
          .openPopup();
      },
      (error) => {
        let userMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            userMessage = "Hai negato il permesso di accedere alla tua posizione."; break;
          case error.POSITION_UNAVAILABLE:
            userMessage = "Non è stato possibile determinare la tua posizione."; break;
          case error.TIMEOUT:
            userMessage = "La richiesta per ottenere la tua posizione ha impiegato troppo tempo."; break;
          default:
            userMessage = "Si è verificato un errore sconosciuto."; break;
        }
        showNotification(userMessage);
      }
    );
  }

  // --- Logica di Creazione Segnalazioni (Spot) ---

  function toggleAddSpotMode() {
    isAddingSpotMode = !isAddingSpotMode;
    if (isAddingSpotMode) {
      mapElement?.classList.add('add-spot-mode');
      showNotification("Clicca sulla mappa per posizionare la tua segnalazione.", true);
    } else {
      mapElement?.classList.remove('add-spot-mode');
      hideNotification();
    }
  }
  
  // FIX: Use 'any' for Leaflet LatLng type as 'L' namespace is not defined.
  function openSpotModal(coords: any) {
    newSpotCoords = coords;
    spotModalBackdrop?.classList.remove('hidden');
  }
  
  function closeSpotModal() {
    spotForm?.reset(); // Pulisce il form
    imagePreviewContainer?.classList.add('hidden'); // Nasconde l'anteprima
    spotModalBackdrop?.classList.add('hidden');
  }

  // FIX: Use 'any' for Leaflet LeafletMouseEvent type as 'L' namespace is not defined.
  function handleMapClick(e: any) {
    if (isAddingSpotMode) {
      openSpotModal(e.latlng);
      toggleAddSpotMode(); // Esce dalla modalità aggiunta dopo il click
    }
  }

  function handleImagePreview(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target?.result as string;
        imagePreviewContainer?.classList.remove('hidden');
      }
      reader.readAsDataURL(input.files[0]);
    }
  }

  function getCategoryIcon(category: string): string {
      switch (category) {
          case 'evento': return '🎉';
          case 'incidente': return '⚠️';
          case 'traffico': return '🚦';
          default: return '📍';
      }
  }

  function renderSpotOnMap(spot: any) {
    const iconHtml = `<div class="spot-marker-icon">${getCategoryIcon(spot.category)}</div>`;
    const customIcon = L.divIcon({
        html: iconHtml,
        className: '', // Leaflet aggiunge 'leaflet-div-icon' di default
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    const popupContent = `
      <div class="spot-popup-content">
        <h3>${spot.title}</h3>
        <p><strong>Categoria:</strong> ${spot.category}</p>
        <img src="${spot.photoDataUrl}" alt="${spot.title}">
        <div class="spot-popup-score">Affidabilità: <strong>N/D</strong></div>
        <div class="spot-popup-actions">
           <button class="confirm" disabled>✔️ Conferma</button>
           <button class="deny" disabled>❌ Smentisci</button>
        </div>
      </div>
    `;

    L.marker(spot.coords, { icon: customIcon })
      .addTo(map)
      .bindPopup(popupContent);
  }

  function handleFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    
    const spot = {
      title: formData.get('title'),
      category: formData.get('category'),
      coords: newSpotCoords,
      photoDataUrl: imagePreview.src,
      timestamp: new Date()
    };
    
    spots.push(spot);
    renderSpotOnMap(spot);
    
    closeSpotModal();
    showNotification("Segnalazione creata con successo!", true);
  }

  // --- Event Listener ---
  centerMapButton?.addEventListener('click', centerOnUserLocation);
  notificationCloseButton?.addEventListener('click', hideNotification);
  addSpotButton?.addEventListener('click', toggleAddSpotMode);
  map.on('click', handleMapClick);
  cancelSpotButton?.addEventListener('click', closeSpotModal);
  spotForm?.addEventListener('submit', handleFormSubmit);
  spotPhotoInput?.addEventListener('change', handleImagePreview);

  // Mostra errori JS in overlay
  window.addEventListener('error', (e) => {
    showStatus('Errore runtime: ' + (e.error?.message || e.message));
  });
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const msg = (e.reason && (e.reason.message || String(e.reason))) || 'Promise rifiutata';
    showStatus('Errore async: ' + msg);
  });
  } catch (err: any) {
    console.error(err);
    showStatus('Errore durante l\'inizializzazione: ' + (err?.message || String(err)));
    return;
  }
});
