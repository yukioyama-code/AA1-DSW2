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

copyButton?.addEventListener('click', async () => {
  const pixKey = copyButton.dataset.copyPix;

  try {
    await navigator.clipboard.writeText(pixKey);
    copyStatus.textContent = 'Chave copiada!';
  } catch {
    copyStatus.textContent = `Chave Pix: ${pixKey}`;
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
