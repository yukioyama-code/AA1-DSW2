import { useRef, useState } from 'react';
import { validarAvisoEstoque } from './validarAvisoEstoque.js';

export default function AvisoEstoque({ produto }) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const botao = useRef(null);

  function fechar() {
    setAberto(false);
    setErro('');
    botao.current?.focus();
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando || enviado) return;

    const dados = new FormData(evento.currentTarget);
    const quantidade = dados.get('quantidade').trim();
    const quantidadeEncontrada = quantidade === '' ? NaN : Number(quantidade);
    const observacao = dados.get('observacao');
    const mensagem = validarAvisoEstoque(quantidadeEncontrada, produto.estoque, observacao);

    setErro(mensagem);
    if (mensagem) return;
    setEnviando(true);

    try {
      const resposta = await fetch('/api/avisosEstoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: produto.id,
          estoqueExibido: produto.estoque,
          quantidadeEncontrada,
          observacao,
        }),
      });
      if (resposta.status !== 201) {
        const problema = await resposta.json().catch(() => null);
        throw new Error(problema?.mensagem || 'Não foi possível enviar o aviso. Tente novamente.');
      }
      fechar();
      setEnviado(true);
    } catch (error) {
      setErro(error instanceof TypeError ? 'Não foi possível conectar à API. Tente novamente.' : error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-4">
      {!enviado && (
        <button
          ref={botao}
          className="min-h-11 text-left text-sm font-bold text-brand underline underline-offset-4"
          type="button"
          aria-expanded={aberto}
          aria-controls="stock-report-form"
          disabled={enviando}
          onClick={() => aberto ? fechar() : setAberto(true)}
        >
          Informar diferença no estoque
        </button>
      )}
      {aberto && (
        <form id="stock-report-form" className="mt-3 rounded-2xl border border-line bg-surface p-4" noValidate onSubmit={enviar}>
          <h2 className="text-lg font-extrabold">Avisar sobre o estoque</h2>
          <p className="mt-2 text-sm text-muted">
            Estoque exibido: {produto.estoque} unidades. Informe a quantidade total encontrada antes de retirar seus produtos.
          </p>
          <label className="mt-4 block text-sm font-bold" htmlFor="found-stock">Quantidade encontrada</label>
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-3 focus:ring-2 focus:ring-brand"
            id="found-stock" name="quantidade" type="number" min="0" step="1" required
            aria-describedby="stock-report-error"
          />
          <label className="mt-4 block text-sm font-bold" htmlFor="stock-observation">Observação (opcional)</label>
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-line bg-white p-3 focus:ring-2 focus:ring-brand"
            id="stock-observation" name="observacao" maxLength={500} aria-describedby="stock-observation-help"
          />
          <p className="mt-1 text-xs text-muted" id="stock-observation-help">
            Até 500 caracteres. O aviso não altera o estoque automaticamente.
          </p>
          <p className="mt-3 text-sm font-bold text-red-700" id="stock-report-error" role="alert">{erro}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="min-h-11 rounded-xl bg-brand px-4 font-bold text-white disabled:opacity-50" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar aviso'}
            </button>
            <button
              className="min-h-11 rounded-xl border border-line bg-white px-4 font-bold text-brand disabled:opacity-50"
              type="button" disabled={enviando} onClick={fechar}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      <p className="mt-2 text-sm font-bold text-success" role="status">{enviado && 'Aviso enviado ao vendedor.'}</p>
    </div>
  );
}
