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

const stockReportsKey = 'vendinha:avisos-estoque:v1';

function readStockReports() {
  const stored = localStorage.getItem(stockReportsKey);
  const reports = stored === null ? [] : JSON.parse(stored);
  const validDate = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));
  if (!Array.isArray(reports) || !reports.every((report) =>
    report && typeof report.id === 'string' &&
    typeof report.productId === 'string' && typeof report.productName === 'string' &&
    typeof report.sellerId === 'string' &&
    Number.isSafeInteger(report.displayedStock) && report.displayedStock >= 0 &&
    Number.isSafeInteger(report.foundStock) && report.foundStock >= 0 &&
    typeof report.observation === 'string' && report.observation.length <= 500 &&
    validDate(report.createdAt) &&
    ((report.status === 'pendente' && report.checkedAt === null) ||
      (report.status === 'conferido' && validDate(report.checkedAt)))
  )) {
    throw new Error('Invalid stock reports');
  }
  return reports;
}

function saveStockReport(report) {
  const reports = readStockReports();
  reports.push(report);
  localStorage.setItem(stockReportsKey, JSON.stringify(reports));
}

function checkStockReport(id, sellerId) {
  const reports = readStockReports();
  const report = reports.find((item) => item.id === id && item.sellerId === sellerId);
  if (!report) throw new Error('Stock report not found');
  if (report.status === 'conferido') return;
  report.status = 'conferido';
  report.checkedAt = new Date().toISOString();
  localStorage.setItem(stockReportsKey, JSON.stringify(reports));
}

const reportForm = document.querySelector('[data-stock-report]');
const reportToggle = document.querySelector('[data-stock-report-toggle]');
const reportStatus = document.querySelector('[data-stock-report-status]');

if (reportForm && reportToggle) {
  const foundStock = reportForm.elements.foundStock;
  const observation = reportForm.elements.observation;
  const error = document.querySelector('#stock-report-error');
  const submit = reportForm.querySelector('[type="submit"]');
  let submitted = false;

  function closeReportForm() {
    reportForm.hidden = true;
    reportToggle.setAttribute('aria-expanded', 'false');
    reportForm.reset();
    error.textContent = '';
    foundStock.removeAttribute('aria-invalid');
    observation.removeAttribute('aria-invalid');
    reportToggle.focus();
  }

  reportToggle.addEventListener('click', () => {
    if (!reportForm.hidden) {
      closeReportForm();
      return;
    }
    submitted = false;
    submit.disabled = false;
    reportStatus.textContent = '';
    reportForm.hidden = false;
    reportToggle.setAttribute('aria-expanded', 'true');
    foundStock.focus();
  });

  document.querySelector('[data-stock-report-cancel]').addEventListener('click', closeReportForm);

  reportForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submitted || reportForm.hidden) return;
    error.textContent = '';
    foundStock.removeAttribute('aria-invalid');
    observation.removeAttribute('aria-invalid');
    const amount = foundStock.valueAsNumber;
    const displayedStock = Number(reportForm.dataset.displayedStock);

    if (!Number.isSafeInteger(amount) || amount < 0 || amount === displayedStock) {
      error.textContent = amount === displayedStock
        ? 'A quantidade encontrada deve ser diferente do estoque exibido.'
        : 'Informe uma quantidade inteira igual ou maior que zero.';
      foundStock.setAttribute('aria-invalid', 'true');
      foundStock.focus();
      return;
    }
    if (observation.value.length > 500) {
      error.textContent = 'A observação deve ter até 500 caracteres.';
      observation.setAttribute('aria-invalid', 'true');
      observation.focus();
      return;
    }

    submit.disabled = true;
    try {
      saveStockReport({
        id: crypto.randomUUID(),
        productId: reportForm.dataset.productId,
        productName: reportForm.dataset.productName,
        sellerId: reportForm.dataset.sellerId,
        displayedStock,
        foundStock: amount,
        observation: observation.value.trim(),
        createdAt: new Date().toISOString(),
        status: 'pendente',
        checkedAt: null
      });
      submitted = true;
      closeReportForm();
      reportStatus.textContent = 'Aviso registrado neste protótipo. Disponível no painel deste navegador.';
    } catch {
      error.textContent = 'Não foi possível salvar o aviso neste navegador. Verifique o armazenamento e tente novamente.';
      submit.disabled = false;
    }
  });
}

const reportsPanel = document.querySelector('[data-stock-reports]');

if (reportsPanel) {
  const list = reportsPanel.querySelector('[data-stock-reports-list]');
  const count = reportsPanel.querySelector('[data-stock-reports-count]');
  const empty = reportsPanel.querySelector('[data-stock-reports-empty]');
  const error = reportsPanel.querySelector('[data-stock-reports-error]');
  const status = reportsPanel.querySelector('[data-stock-reports-status]');
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  function appendText(parent, tag, classes, value) {
    const element = document.createElement(tag);
    element.className = classes;
    element.textContent = value;
    parent.append(element);
    return element;
  }

  function renderStockReports() {
    error.textContent = '';
    list.replaceChildren();
    empty.hidden = true;
    try {
      const reports = readStockReports()
        .filter((report) => report.sellerId === reportsPanel.dataset.sellerId)
        .sort((a, b) => Number(a.status === 'conferido') - Number(b.status === 'conferido') ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt));
      const pending = reports.filter((report) => report.status === 'pendente').length;
      count.textContent = `${pending} ${pending === 1 ? 'pendente' : 'pendentes'}`;
      empty.hidden = reports.length !== 0;

      reports.forEach((report) => {
        const article = document.createElement('article');
        article.className = 'rounded-xl border border-line bg-surface p-4';
        appendText(article, 'h3', 'font-extrabold break-words', report.productName);
        appendText(article, 'p', 'mt-1 text-sm font-bold text-brand', report.status === 'pendente' ? 'Pendente' : 'Conferido');
        appendText(article, 'p', 'mt-2 text-sm', `Estoque exibido no envio: ${report.displayedStock} unidades · Quantidade encontrada: ${report.foundStock} unidades`);
        if (report.observation) appendText(article, 'p', 'mt-2 whitespace-pre-wrap break-words text-sm text-muted', report.observation);
        appendText(article, 'p', 'mt-2 text-xs text-muted', `Enviado em ${dateFormat.format(new Date(report.createdAt))}`);
        if (report.checkedAt) appendText(article, 'p', 'mt-1 text-xs text-muted', `Conferido em ${dateFormat.format(new Date(report.checkedAt))}`);
        if (report.status === 'pendente') {
          const button = appendText(article, 'button', 'mt-3 min-h-11 rounded-xl bg-brand px-4 text-sm font-bold text-white disabled:opacity-50', 'Marcar como conferido');
          button.type = 'button';
          button.setAttribute('aria-label', `Marcar aviso de ${report.productName} como conferido`);
          button.addEventListener('click', () => {
            button.disabled = true;
            status.textContent = '';
            try {
              checkStockReport(report.id, reportsPanel.dataset.sellerId);
              renderStockReports();
              status.textContent = 'Aviso marcado como conferido. O estoque não foi alterado.';
              const nextButton = list.querySelector('button');
              if (nextButton) nextButton.focus();
              else {
                status.tabIndex = -1;
                status.focus();
              }
            } catch {
              error.textContent = 'Não foi possível conferir o aviso. Verifique o armazenamento e tente novamente.';
              button.disabled = false;
            }
          });
        }
        list.append(article);
      });
    } catch {
      count.textContent = 'Indisponível';
      error.textContent = 'Não foi possível carregar os avisos deste navegador. Verifique o armazenamento e recarregue a página.';
    }
  }

  renderStockReports();
  window.addEventListener('storage', (event) => {
    if (event.key === stockReportsKey || event.key === null) {
      status.textContent = '';
      renderStockReports();
    }
  });
  window.addEventListener('pageshow', renderStockReports);
}
