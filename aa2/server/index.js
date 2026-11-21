import { randomUUID } from 'node:crypto';
import { constants, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';
import { validarAvisoEstoque } from '../src/validarAvisoEstoque.js';

const seed = fileURLToPath(new URL('./seed.json', import.meta.url));
const database = process.env.VENDINHA_DB_FILE || fileURLToPath(new URL('./db.json', import.meta.url));

try {
  copyFileSync(seed, database, constants.COPYFILE_EXCL);
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}

const server = jsonServer.create();
const router = jsonServer.router(database);
server.disable('jsonp callback');
server.use(jsonServer.bodyParser);
server.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');

  if (req.method === 'GET') return next();
  if (req.method !== 'POST' || req.path !== '/avisosEstoque') {
    return res.status(405).json({ mensagem: 'Operação indisponível.' });
  }

  const { produtoId, estoqueExibido, quantidadeEncontrada, observacao = '' } = req.body ?? {};
  const produto = router.db.get('produtos').find({ id: produtoId }).value();

  if (!produto) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }
  if (estoqueExibido !== produto.estoque) {
    return res.status(409).json({ mensagem: 'O estoque mudou. Recarregue a página para consultar a quantidade atual.' });
  }
  const mensagem = validarAvisoEstoque(quantidadeEncontrada, estoqueExibido, observacao);
  if (mensagem) return res.status(422).json({ mensagem });

  req.body = {
    id: randomUUID(),
    produtoId: produto.id,
    produtoNome: produto.nome,
    vendedorId: produto.vendedorId,
    estoqueExibido,
    quantidadeEncontrada,
    observacao: observacao.trim(),
    criadoEm: new Date().toISOString(),
    situacao: 'pendente',
  };
  next();
});

server.use('/api', router);
const listener = server.listen(Number(process.env.VENDINHA_API_PORT || 3001), '127.0.0.1', () => {
  console.log(`API da Vendinha disponível em http://127.0.0.1:${listener.address().port}/api`);
});
