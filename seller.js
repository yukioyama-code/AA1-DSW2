const sellerStorageKey = 'vendinha.seller';

function maskPixKey(value, type) {
  if (type === 'email') return value.replace(/\s/g, '').toLowerCase().slice(0, 77);
  let digits = value.replace(/\D/g, '');
  let template;
  if (type === 'cpf') template = '###.###.###-##';
  if (type === 'cnpj') template = '##.###.###/####-##';
  if (type === 'phone') {
    if (value.startsWith('+55') || (digits.length === 13 && digits.startsWith('55'))) digits = digits.slice(2);
    template = '(##) #####-####';
  }
  if (type === 'random') {
    digits = value.replace(/[^0-9a-f]/gi, '').toLowerCase();
    template = '########-####-####-####-############';
  }
  if (!template) return value;
  let result = '';
  let index = 0;
  for (const char of template) {
    if (index >= digits.length) break;
    result += char === '#' ? digits[index++] : char;
  }
  return result;
}

function formatCity(value) {
  return value.normalize('NFC').replace(/[^\p{L}\p{M} '\u2019-]/gu, '').replace(/ +/g, ' ');
}

function applyInputMask(input, formatter) {
  const cursor = input.selectionStart;
  const prefix = cursor === null ? null : formatter(input.value.slice(0, cursor));
  input.value = formatter(input.value);
  if (prefix !== null && input.type !== 'email') input.setSelectionRange(prefix.length, prefix.length);
}

function normalizePixKey(key, type) {
  const value = key.trim();
  if (type === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 77) return value.toLowerCase();
  if (type === 'cpf' || type === 'cnpj') {
    const digits = value.replace(/[.\-\/\s]/g, '');
    if (new RegExp(`^\\d{${type === 'cpf' ? 11 : 14}}$`).test(digits)) return digits;
  }
  if (type === 'phone') {
    let digits = value.replace(/[()\-\s+]/g, '');
    if (/^\d{11}$/.test(digits)) digits = `55${digits}`;
    if (/^55\d{11}$/.test(digits)) return `+${digits}`;
  }
  if (type === 'random' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return value.toLowerCase();
  throw new Error('Confira o formato da chave Pix e o tipo selecionado.');
}

function readSeller() {
  try {
    const profile = JSON.parse(localStorage.getItem(sellerStorageKey));
    if (!profile || typeof profile.name !== 'string' || typeof profile.city !== 'string') return null;
    profile.key = normalizePixKey(profile.key, profile.keyType);
    generatePixCode({ ...profile, amount: 3 });
    return profile;
  } catch {
    return null;
  }
}

const seller = readSeller();
const sellerForm = document.querySelector('[data-seller-form]');
if (sellerForm) {
  const keyInput = sellerForm.elements.namedItem('key');
  const keyType = sellerForm.elements.namedItem('keyType');
  const cityInput = sellerForm.elements.namedItem('city');
  const help = document.querySelector('#pix-key-help');
  const updateKeyInput = () => {
    keyInput.type = keyType.value === 'email' ? 'email' : 'text';
    keyInput.inputMode = ['cpf', 'cnpj', 'phone'].includes(keyType.value) ? 'tel' : keyType.value === 'email' ? 'email' : 'text';
    keyInput.maxLength = { email: 77, cpf: 14, cnpj: 18, phone: 20, random: 36 }[keyType.value];
    keyInput.placeholder = {
      email: 'voce@exemplo.com', cpf: '000.000.000-00', cnpj: '00.000.000/0000-00',
      phone: '(11) 99999-9999', random: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    }[keyType.value];
    keyInput.value = maskPixKey(keyInput.value, keyType.value);
    help.textContent = {
      email: 'Informe o e-mail cadastrado como chave Pix no seu banco.',
      cpf: 'Informe os 11 dígitos do CPF cadastrado como chave Pix.',
      cnpj: 'Informe os 14 dígitos do CNPJ cadastrado como chave Pix.',
      phone: 'Informe o celular com DDD. Exemplo: (11) 99999-9999 ou +5511999999999.',
      random: 'Copie a chave aleatória completa do aplicativo do seu banco.'
    }[keyType.value];
  };
  if (seller) {
    for (const field of ['name', 'city', 'key', 'keyType']) sellerForm.elements.namedItem(field).value = seller[field];
  }
  updateKeyInput();
  keyType.addEventListener('change', () => {
    keyInput.value = '';
    updateKeyInput();
  });
  keyInput.addEventListener('input', () => applyInputMask(keyInput, (value) => maskPixKey(value, keyType.value)));
  // Do not rewrite the value while typing: dead keys and IMEs compose accents
  // across multiple input events. Normalize only after editing or on submit.
  cityInput.addEventListener('blur', () => { cityInput.value = formatCity(cityInput.value).trim(); });
  sellerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = document.querySelector('[data-seller-status]');
    try {
      const data = new FormData(sellerForm);
      const profile = {
        name: data.get('name').trim(), city: formatCity(data.get('city')).trim(),
        keyType: data.get('keyType'), key: normalizePixKey(data.get('key'), data.get('keyType'))
      };
      generatePixCode({ ...profile, amount: 3 });
      try {
        localStorage.setItem(sellerStorageKey, JSON.stringify(profile));
      } catch {
        throw new Error('Não foi possível salvar. Permita o armazenamento de dados neste navegador.');
      }
      window.location.assign('vendedor.html');
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

if (document.querySelector('[data-seller-dashboard]') && !seller) window.location.replace('cadastro-vendedor.html');
if (seller) {
  document.querySelectorAll('[data-seller-name]').forEach((element) => { element.textContent = seller.name; });
  document.querySelectorAll('[data-seller-initial]').forEach((element) => { element.textContent = seller.name.charAt(0).toUpperCase(); });
}

const checkoutLink = document.querySelector('[data-checkout-link]');
checkoutLink?.addEventListener('click', () => {
  checkoutLink.href = `pagamento.html?quantidade=${Number(quantity.textContent)}`;
});

const paymentQuantity = document.querySelector('[data-payment-quantity]');
if (pixCode && copyButton && paymentQuantity) {
  const requested = Number(new URLSearchParams(window.location.search).get('quantidade') || 1);
  const units = Number.isInteger(requested) && requested >= 1 && requested <= 9 ? requested : 1;
  const amount = units * Number(paymentQuantity.dataset.unitPrice);
  paymentQuantity.textContent = `${units} ${units === 1 ? 'unidade' : 'unidades'}`;
  document.querySelectorAll('[data-payment-total]').forEach((element) => { element.textContent = currency.format(amount); });
  try {
    if (!seller) throw new Error('Cadastre os dados Pix do vendedor para gerar o código de pagamento.');
    pixCode.value = generatePixCode({ ...seller, amount });
    copyButton.disabled = false;
  } catch (error) {
    copyStatus.textContent = error.message;
  }
}
