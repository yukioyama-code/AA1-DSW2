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
