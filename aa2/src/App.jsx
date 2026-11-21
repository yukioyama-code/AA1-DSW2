import { Link, Route, Routes, useParams } from 'react-router-dom';


//Criando componentes bases para cada rota
function Home() {
  return (
    <>
      <h1 className="text-3xl font-bold">Vendinha por Confiança</h1>
      <Link className="mt-4 inline-block text-brand underline" to="/produto/exemplo">
        Abrir produto de exemplo
      </Link>
    </>
  );
}

function Product() {
  const { productId } = useParams();

  return (
    <>
      <h1 className="text-2xl font-bold">Produto</h1>
      <p className="mt-2 text-muted">Código do produto: {productId}</p>
      <Link className="mt-4 inline-block text-brand underline" to={`/pagamento/${encodeURIComponent(productId)}`}>
        Ir para pagamento
      </Link>
    </>
  );
}

function Payment() {
  const { productId } = useParams();

  return (
    <>
      <h1 className="text-2xl font-bold">Pagamento</h1>
      <p className="mt-2 text-muted">Código do produto: {productId}</p>
      <Link className="mt-4 inline-block text-brand underline" to={`/produto/${encodeURIComponent(productId)}`}>
        Voltar ao produto
      </Link>
    </>
  );
}

function SellerDashboard() {
  return <h1 className="text-2xl font-bold">Painel do vendedor</h1>;
}

function NotFound() {
  return <h1 className="text-2xl font-bold">Página não encontrada</h1>;
}

export default function App() {
  return (
    <>
      <header className="border-b border-line bg-white">
        <nav aria-label="Navegação principal" className="mx-auto flex max-w-5xl flex-wrap gap-4 px-4 py-4">
          <Link className="font-semibold text-brand-dark" to="/">Início</Link>
          <Link className="font-semibold text-brand-dark" to="/vendedor">Área do vendedor</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produto/:productId" element={<Product />} />
          <Route path="/pagamento/:productId" element={<Payment />} />
          <Route path="/vendedor" element={<SellerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
