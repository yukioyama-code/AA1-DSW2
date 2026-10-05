const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const quantity = document.querySelector('[data-quantity]');
const total = document.querySelector('[data-total]');

function updateProductTotal() {
  if (!quantity || !total) return;

  const unitPrice = Number(quantity.dataset.unitPrice);
  const amount = Number(quantity.textContent);
  total.textContent = currency.format(unitPrice * amount);
}

document.querySelectorAll('[data-quantity-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const current = Number(quantity.textContent);
    const next = button.dataset.quantityAction === 'increase'
      ? Math.min(current + 1, 9)
      : Math.max(current - 1, 1);

    quantity.textContent = next;
    updateProductTotal();
  });
});

const copyButton = document.querySelector('[data-copy-pix]');
const copyStatus = document.querySelector('[data-copy-status]');
const pixCode = document.querySelector('[data-pix-code]');

function pixField(id, value) {
  const length = new TextEncoder().encode(value).length;
  if (length > 99) throw new Error('Campo Pix muito longo.');
  return `${id}${String(length).padStart(2, '0')}${value}`;
}

function pixChecksum(payload) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePixCode({ key, name, city, amount, txid = '***' }) {
  const normalize = (value, max) => value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '').trim().slice(0, max);
  const receiverName = normalize(name, 25);
  const receiverCity = normalize(city, 15);
  if (!key || !receiverName || !receiverCity || !Number.isFinite(amount) || amount <= 0) {
    throw new Error('Dados do Pix inválidos.');
  }
  if (!/^(\*\*\*|[A-Za-z0-9]{1,25})$/.test(txid)) throw new Error('Identificador Pix inválido.');

  const payload = pixField('00', '01')
    + pixField('26', pixField('00', 'br.gov.bcb.pix') + pixField('01', key))
    + pixField('52', '0000') + pixField('53', '986')
    + pixField('54', amount.toFixed(2)) + pixField('58', 'BR')
    + pixField('59', receiverName) + pixField('60', receiverCity)
    + pixField('62', pixField('05', txid)) + '6304';
  return payload + pixChecksum(payload);
}

copyButton?.addEventListener('click', async () => {
  if (!pixCode?.value) return;

  try {
    await navigator.clipboard.writeText(pixCode.value);
    copyStatus.textContent = 'Código Pix copiado!';
  } catch {
    pixCode.focus();
    pixCode.select();
    copyStatus.textContent = 'Selecione e copie o código acima para colar no aplicativo do banco.';
  }
});

document.querySelectorAll('[data-demo-confirm]').forEach((button) => {
  button.addEventListener('click', () => {
    const feedback = document.querySelector(`[data-feedback="${button.dataset.demoConfirm}"]`);
    if (!feedback) return;

    feedback.classList.remove('hidden');
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

const imageInput = document.querySelector('#product-image');
const imagePreview = document.querySelector('#image-preview');

imageInput?.addEventListener('change', () => {
  const [file] = imageInput.files;
  if (!file || !imagePreview) return;

  imagePreview.src = URL.createObjectURL(file);
  imagePreview.classList.remove('hidden');
});
