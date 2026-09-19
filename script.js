const cart = new Map();
let draggedProduct = null;

const cartScreen = document.querySelector('#carrinho');
const countElement = document.querySelector('.count');
const pixValue = document.querySelector('.pix-value');

function productFromCard(card) {
  const priceText = card.querySelector('.bottom b').textContent;

  return {
    name: card.querySelector('h3').textContent,
    emoji: card.querySelector('.picture').textContent,
    price: Number(priceText.replace('R$', '').trim().replace(',', '.'))
  };
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function addProduct(product) {
  const item = cart.get(product.name) ?? { ...product, quantity: 0 };
  item.quantity += 1;
  cart.set(product.name, item);
  renderCart();
}

function removeProduct(name) {
  const item = cart.get(name);
  if (!item) return;

  if (item.quantity === 1) cart.delete(name);
  else item.quantity -= 1;

  renderCart();
}

function renderCart() {
  const items = [...cart.values()];
  const quantity = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  countElement.textContent = quantity;
  pixValue.textContent = formatCurrency(total);

  const content = items.length
    ? items.map((item) => `
        <div class="item">
          <span class="mini">${item.emoji}</span>
          <div><b>${item.name}</b><small>${item.quantity} unidade${item.quantity > 1 ? 's' : ''} · ${formatCurrency(item.price)}</small></div>
          <button class="remove" type="button" data-product="${item.name}" aria-label="Remover ${item.name}">−</button>
        </div>
      `).join('')
    : '<p class="empty-cart">Seu carrinho está vazio. Arraste um produto aqui.</p>';

  cartScreen.querySelector('.screen-body').innerHTML = `
    <h3>Seu carrinho</h3>
    <p class="cart-hint">Arraste produtos para esta área</p>
    <div class="drop-zone" aria-label="Área para soltar produtos">Solte aqui</div>
    <div class="cart-items">${content}</div>
    <div class="total"><span>Total</span><span>${formatCurrency(total)}</span></div>
    <a class="button primary wide" href="#pix">Ir para pagamento</a>
  `;

  cartScreen.querySelectorAll('.remove').forEach((button) => {
    button.addEventListener('click', () => removeProduct(button.dataset.product));
  });
}

document.querySelectorAll('.product').forEach((card) => {
  const product = productFromCard(card);
  card.draggable = true;
  card.classList.add('draggable-product');

  card.addEventListener('dragstart', (event) => {
    draggedProduct = product;
    card.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', product.name);
  });

  card.addEventListener('dragend', () => card.classList.remove('dragging'));

  card.querySelector('.add').addEventListener('click', (event) => {
    event.preventDefault();
    addProduct(product);
  });
});

cartScreen.addEventListener('dragover', (event) => {
  event.preventDefault();
  cartScreen.classList.add('drop-active');
  event.dataTransfer.dropEffect = 'copy';
});

cartScreen.addEventListener('dragleave', (event) => {
  if (!cartScreen.contains(event.relatedTarget)) cartScreen.classList.remove('drop-active');
});

cartScreen.addEventListener('drop', (event) => {
  event.preventDefault();
  cartScreen.classList.remove('drop-active');
  if (draggedProduct) addProduct(draggedProduct);
  draggedProduct = null;
});

renderCart();

const dcLocation = { lat: -21.9798, lng: -47.88043 };
const locationStatus = document.querySelector('#location-status');
const locationButton = document.querySelector('#locate-user');

function distanceInKm(origin, destination) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const earthRadius = 6371;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const value = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat))
    * Math.sin(deltaLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function initializeMap() {
  if (!window.L) {
    locationStatus.textContent = 'Não foi possível carregar o mapa. Verifique sua conexão.';
    return;
  }

  const map = L.map('dc-map', { scrollWheelZoom: false }).setView([dcLocation.lat, dcLocation.lng], 16);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  L.marker([dcLocation.lat, dcLocation.lng])
    .addTo(map)
    .bindPopup('<strong>Vendinhas do DC</strong><br>Departamento de Computação · UFSCar')
    .openPopup();

  locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Geolocalização não é suportada por este navegador.';
      return;
    }

    locationStatus.textContent = 'Buscando sua localização...';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        const distance = distanceInKm(userLocation, dcLocation);

        L.marker([userLocation.lat, userLocation.lng])
          .addTo(map)
          .bindPopup('Você está aqui')
          .openPopup();
        map.fitBounds([[dcLocation.lat, dcLocation.lng], [userLocation.lat, userLocation.lng]], { padding: [35, 35] });
        locationStatus.textContent = `Você está a aproximadamente ${distance.toFixed(1)} km da vendinha.`;
      },
      (error) => {
        const messages = {
          1: 'Permissão de localização negada.',
          2: 'Sua localização não está disponível.',
          3: 'A busca pela sua localização expirou.'
        };
        locationStatus.textContent = messages[error.code] ?? 'Não foi possível obter sua localização.';
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

initializeMap();
