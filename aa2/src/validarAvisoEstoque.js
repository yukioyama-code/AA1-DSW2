export function validarAvisoEstoque(quantidadeEncontrada, estoqueExibido, observacao) {
  if (!Number.isSafeInteger(quantidadeEncontrada) || quantidadeEncontrada < 0) {
    return 'Informe uma quantidade inteira igual ou maior que zero.';
  }
  if (quantidadeEncontrada === estoqueExibido) {
    return 'A quantidade encontrada precisa ser diferente do estoque exibido.';
  }
  if (typeof observacao !== 'string' || observacao.length > 500) {
    return 'A observação deve ter até 500 caracteres.';
  }
  return '';
}
