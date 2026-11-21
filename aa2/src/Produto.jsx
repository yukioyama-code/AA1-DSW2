import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AvisoEstoque from './AvisoEstoque.jsx';

const imagens = import.meta.glob('../../imgs/*', { eager: true, query: '?url', import: 'default' });
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function SeletorQuantidade({ quantidade, estoque, alterar }) {
  const estilo = 'size-11 text-xl font-bold text-brand disabled:opacity-40';

  return (
    <div>
      <p className="text-sm font-bold text-muted">Quantidade retirada</p>
      <div className="mt-2 inline-grid grid-cols-3 items-center overflow-hidden rounded-xl border border-line">
        <button className={estilo} type="button" aria-label="Diminuir quantidade" disabled={quantidade <= 1} onClick={() => alterar(-1)}>−</button>
        <strong className="grid size-11 place-items-center border-x border-line">{quantidade}</strong>
        <button className={estilo} type="button" aria-label="Aumentar quantidade" disabled={quantidade >= estoque} onClick={() => alterar(1)}>+</button>
      </div>
    </div>
  );
}

function DetalhesProduto({ produto, vendedor }) {
  const { id, nome, descricao, categoria, imagem, imagemAlt, precoCentavos, estoque } = produto;
  const [quantidade, setQuantidade] = useState(estoque > 0 ? 1 : 0);
  const foto = imagens[`../../imgs/${imagem}`];
  const pagamento = `/pagamento/${encodeURIComponent(id)}?quantidade=${quantidade}`;
  const classePagamento = 'mt-7 flex min-h-13 w-full items-center justify-center rounded-xl bg-brand px-5 font-extrabold text-white shadow-lg shadow-brand/20';

  function alterar(variacao) {
    setQuantidade(atual => Math.min(estoque, Math.max(1, atual + variacao)));
  }

  return (
    <section className="mt-4 overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-card">
      {foto && <img className="aspect-[4/3] w-full object-cover" src={foto} alt={imagemAlt || nome} />}
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-soft px-3 py-1 text-xs font-extrabold uppercase text-brand-dark">{categoria}</span>
          <span className={estoque > 0 ? 'text-sm font-bold text-success' : 'text-sm font-bold text-red-700'}>
            {estoque > 0 ? `${estoque} ${estoque === 1 ? 'disponível' : 'disponíveis'}` : 'Sem estoque'}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">{nome}</h1>
        <AvisoEstoque produto={produto} />
        <p className="mt-2 leading-6 text-muted">{descricao}</p>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface p-3">
          <span className="grid size-10 place-items-center rounded-full bg-brand-dark font-black text-white" aria-hidden="true">
            {vendedor.nome.charAt(0).toUpperCase()}
          </span>
          <div>
            <small className="text-muted">Vendido por</small>
            <p className="font-extrabold">{vendedor.nome}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <SeletorQuantidade quantidade={quantidade} estoque={estoque} alterar={alterar} />
          <div className="text-right">
            <small className="text-muted">Total</small>
            <p className="text-3xl font-black text-brand" aria-live="polite">{moeda.format(precoCentavos * quantidade / 100)}</p>
          </div>
        </div>
        {estoque > 0
          ? <Link className={classePagamento} to={pagamento}>Ver pagamento via Pix</Link>
          : <button className={classePagamento + ' opacity-50'} type="button" disabled>Produto indisponível</button>}
        <p className="mt-3 text-center text-xs leading-5 text-muted">
          O pagamento será feito diretamente para a conta indicada pelo vendedor.
        </p>
      </div>
    </section>
  );
}

function ConsultaProduto({ productId }) {
  const [resultado, setResultado] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        const resposta = await fetch(`/api/produtos/${encodeURIComponent(productId)}`, { signal: controller.signal });
        if (resposta.status === 404) {
          setResultado({ inexistente: true });
          return;
        }
        if (!resposta.ok) throw new Error();
        const produto = await resposta.json();
        const vendedorResposta = await fetch(`/api/vendedores/${encodeURIComponent(produto.vendedorId)}`, { signal: controller.signal });
        if (!vendedorResposta.ok) throw new Error();
        const vendedor = await vendedorResposta.json();
        if (!controller.signal.aborted) setResultado({ produto, vendedor });
      } catch {
        if (!controller.signal.aborted) setResultado({ erro: true });
      }
    }

    carregar();
    return () => controller.abort();
  }, [productId, tentativa]);

  if (!resultado) return <p className="mt-4 text-muted" role="status">Carregando produto…</p>;
  if (resultado.inexistente) return <h1 className="mt-4 text-2xl font-bold">Produto não encontrado</h1>;
  if (resultado.erro) {
    return (
      <div className="mt-4">
        <p role="alert">Não foi possível carregar o produto.</p>
        <button className="mt-2 font-bold text-brand underline" type="button" onClick={() => {
          setResultado(null);
          setTentativa(anterior => anterior + 1);
        }}>Tentar novamente</button>
      </div>
    );
  }
  return <DetalhesProduto produto={resultado.produto} vendedor={resultado.vendedor} />;
}

export default function Produto() {
  const { productId } = useParams();

  return (
    <>
      <header className="border-b border-line bg-white">
        <nav aria-label="Navegação principal" className="mx-auto flex h-16 max-w-md items-center px-4">
          <Link className="flex items-center gap-2 font-extrabold" to="/">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-white" aria-hidden="true">V</span>
            Vendinha
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-md px-4 pb-10 pt-5">
        <Link className="text-sm font-bold text-brand" to="/">← Voltar</Link>
        <ConsultaProduto key={productId} productId={productId} />
      </main>
    </>
  );
}
