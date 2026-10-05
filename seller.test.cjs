const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const profile = { name: 'Teste Recebedor', city: 'Sao Carlos', keyType: 'email', key: 'teste@example.com' };

function run({ saved = null, page = '', search = '', blocked = false } = {}) {
  let stored = saved === null ? null : JSON.stringify(saved);
  let destination;
  const fields = Object.fromEntries(Object.entries(profile).map(([name, value]) => [name, {
    value, selectionStart: null, listeners: {},
    addEventListener(event, handler) { this.listeners[event] = handler; },
    setSelectionRange(start) { this.selectionStart = start; }
  }]));
  const handlers = {};
  fields.keyType.addEventListener = (name, handler) => { handlers[name] = handler; };
  const form = {
    elements: { namedItem: (name) => fields[name] },
    addEventListener: (name, handler) => { handlers[name] = handler; }
  };
  const code = { value: '' };
  const button = { disabled: true, addEventListener() {} };
  const status = { textContent: '' };
  const quantity = { dataset: { unitPrice: '3' } };
  const total = {};
  const name = {};
  const selectors = {
    '[data-seller-form]': page === 'form' ? form : null,
    '#pix-key-help': {}, '[data-seller-status]': status,
    '[data-seller-dashboard]': page === 'dashboard' ? {} : null,
    '[data-pix-code]': page === 'payment' ? code : null,
    '[data-copy-pix]': page === 'payment' ? button : null,
    '[data-copy-status]': status,
    '[data-payment-quantity]': page === 'payment' ? quantity : null
  };
  const context = {
    TextEncoder, URLSearchParams,
    FormData: class { get(name) { return fields[name].value; } },
    localStorage: {
      getItem: () => stored,
      setItem: (key, value) => { if (blocked) throw new Error('Storage blocked'); stored = value; }
    },
    window: { location: {
      search, assign: (url) => { destination = url; }, replace: (url) => { destination = url; }
    } },
    document: {
      querySelector: (selector) => selectors[selector] || null,
      querySelectorAll: (selector) => selector === '[data-payment-total]' ? [total]
        : selector === '[data-seller-name]' ? [name] : []
    }
  };
  vm.createContext(context);
  for (const file of ['script.js', 'seller.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  return { context, fields, handlers, code, button, status, quantity, total, name,
    saved: () => JSON.parse(stored), destination: () => destination };
}

test('registration saves normalized key and opens dashboard', () => {
  const app = run({ page: 'form' });
  app.fields.key.value = ' TESTE@EXAMPLE.COM ';
  app.handlers.submit({ preventDefault() {} });
  assert.equal(app.saved().key, 'teste@example.com');
  assert.equal(app.destination(), 'vendedor.html');
  const edit = run({ page: 'form', saved: app.saved() });
  assert.equal(edit.fields.name.value, profile.name);
  assert.equal(edit.fields.key.value, 'teste@example.com');
});

test('invalid key and blocked storage keep user on registration', () => {
  for (const blocked of [false, true]) {
    const app = run({ page: 'form', blocked });
    if (!blocked) app.fields.key.value = 'invalid';
    app.handlers.submit({ preventDefault() {} });
    assert.equal(app.destination(), undefined);
    assert.equal(app.saved(), null);
    assert.ok(app.status.textContent.length > 0);
  }
});

test('dashboard requires valid seller data', () => {
  assert.equal(run({ page: 'dashboard' }).destination(), 'cadastro-vendedor.html');
  assert.equal(run({ page: 'dashboard', saved: { ...profile, key: 'invalid' } }).destination(), 'cadastro-vendedor.html');
  const app = run({ page: 'dashboard', saved: profile });
  assert.equal(app.destination(), undefined);
  assert.equal(app.name.textContent, profile.name);
});

test('payment uses registered recipient and selected quantity', () => {
  const app = run({ page: 'payment', saved: profile, search: '?quantidade=3' });
  assert.equal(app.button.disabled, false);
  assert.ok(app.code.value.includes(profile.key));
  assert.ok(app.code.value.includes('54049.00'));
  assert.ok(app.total.textContent.includes('9,00'));
  assert.equal(app.code.value.slice(-4), app.context.pixChecksum(app.code.value.slice(0, -4)));
  assert.equal(app.context.pixChecksum('123456789'), '29B1');
  assert.equal(run({ page: 'payment' }).button.disabled, true);
  assert.equal(run({ page: 'payment' }).code.value, '');
  assert.ok(run({ page: 'payment', saved: profile, search: '?quantidade=-1' }).code.value.includes('54043.00'));
});

test('CPF, CNPJ, phone and random keys follow Pix formats', () => {
  const { context } = run();
  assert.equal(context.normalizePixKey('123.456.789-01', 'cpf'), '12345678901');
  assert.equal(context.normalizePixKey('12.345.678/0001-90', 'cnpj'), '12345678000190');
  assert.equal(context.normalizePixKey('(11) 99999-9999', 'phone'), '+5511999999999');
  assert.equal(context.normalizePixKey('+5511999999999', 'phone'), '+5511999999999');
  assert.equal(context.normalizePixKey('123E4567-E12B-12D1-A456-426655440000', 'random'), '123e4567-e12b-12d1-a456-426655440000');
  assert.throws(() => context.normalizePixKey('123', 'cpf'));
});

test('key masks handle typing, pasted keys and stored phone values', () => {
  const { context } = run();
  assert.equal(context.maskPixKey('12345678901', 'cpf'), '123.456.789-01');
  assert.equal(context.maskPixKey('1234', 'cpf'), '123.4');
  assert.equal(context.maskPixKey('12345678000190', 'cnpj'), '12.345.678/0001-90');
  assert.equal(context.maskPixKey('+5511999999999', 'phone'), '(11) 99999-9999');
  assert.equal(context.maskPixKey('55999999999', 'phone'), '(55) 99999-9999');
  assert.equal(context.maskPixKey('5511999999999', 'phone'), '(11) 99999-9999');
  assert.equal(context.maskPixKey('123E4567E12B12D1A456426655440000', 'random'), '123e4567-e12b-12d1-a456-426655440000');
  assert.equal(context.maskPixKey(' TESTE@Example.com ', 'email'), 'teste@example.com');
});

test('form masks keys and cities while saving unmasked Pix data', () => {
  const app = run({ page: 'form' });
  app.fields.keyType.value = 'cpf';
  app.handlers.change();
  assert.equal(app.fields.key.value, '');
  app.fields.key.value = '12345678901';
  app.fields.key.listeners.input();
  assert.equal(app.fields.key.value, '123.456.789-01');
  app.fields.city.value = ' S\u00e3o  Carlos123! ';
  app.fields.city.listeners.input();
  app.fields.city.listeners.blur();
  assert.equal(app.fields.city.value, 'S\u00e3o Carlos');
  assert.equal(app.context.formatCity('Santa B\u00e1rbara-d\u2019Oeste'), 'Santa B\u00e1rbara-d\u2019Oeste');
  app.handlers.submit({ preventDefault() {} });
  assert.equal(app.saved().key, '12345678901');
  assert.equal(app.saved().city, 'S\u00e3o Carlos');
});
