# Sistema de Vendinhas por Confiança

> Nome provisório do projeto. A aplicação não será limitada à Vendinha do DC e poderá ser utilizada por diferentes vendedores e pontos de venda autônomos.

## Visão geral

O Sistema de Vendinhas por Confiança é uma aplicação web destinada a apoiar vendedores que disponibilizam produtos em pontos de venda autônomos. Nesses espaços, os compradores retiram os produtos e realizam o pagamento diretamente ao vendedor por Pix, sem a presença constante de um atendente.

A aplicação preserva esse modelo de confiança e não atua como intermediadora financeira. Seu objetivo principal é facilitar o acesso ao pagamento e oferecer aos vendedores uma forma simples de cadastrar produtos, acompanhar o estoque e visualizar informações sobre as vendas registradas.

Cada produto poderá possuir um QR Code físico. Ao apontar a câmera do celular para esse código, o comprador será direcionado diretamente à página do produto, onde poderá consultar o preço e acessar as informações de pagamento do vendedor.

## Objetivos

O sistema deverá:

- facilitar o pagamento de produtos disponíveis em vendinhas autônomas;
- permitir que vendedores cadastrem e organizem seus produtos;
- associar cada produto ao respectivo vendedor e às suas informações de pagamento;
- gerar um QR Code identificador para cada produto cadastrado;
- auxiliar no acompanhamento das quantidades disponíveis;
- registrar as vendas informadas pelos compradores;
- apresentar relatórios simples de estoque e vendas ao vendedor;
- manter o princípio de confiança existente nesse tipo de comércio.

## Perfis de usuário

### Comprador

O comprador terá uma experiência direta e simplificada. Não será necessário navegar por uma loja virtual completa nem montar um carrinho com diversos produtos.

Seu fluxo principal será:

1. encontrar o produto no espaço físico;
2. ler o QR Code fixado no produto ou em sua etiqueta;
3. acessar a página do produto;
4. conferir nome, imagem, preço, vendedor e disponibilidade;
5. indicar a quantidade retirada;
6. visualizar o QR Code Pix ou a chave Pix do vendedor;
7. realizar o pagamento diretamente ao vendedor;
8. informar no sistema que realizou o pagamento;
9. retirar o produto.

A informação de pagamento será uma declaração do comprador. O sistema não consultará a instituição bancária e não garantirá que a transferência foi efetivamente realizada.

### Vendedor

O vendedor será o principal usuário da aplicação. Ele poderá administrar os produtos que disponibiliza e acompanhar as movimentações informadas no sistema.

Seu fluxo principal será:

1. acessar sua área de gerenciamento;
2. cadastrar ou editar suas informações de pagamento via Pix;
3. cadastrar produtos e suas quantidades;
4. gerar o QR Code de cada produto;
5. imprimir ou baixar o QR Code para utilização no ponto de venda;
6. acompanhar o estoque disponível;
7. consultar as vendas registradas;
8. visualizar relatórios por produto e por período.

## Cadastro de produtos

Cada produto deverá estar associado a um vendedor e poderá conter:

- nome;
- descrição;
- imagem;
- categoria;
- preço unitário;
- quantidade disponível;
- quantidade mínima desejada em estoque;
- situação, como disponível, estoque baixo ou indisponível;
- data de cadastro e de última atualização.

Após o cadastro, o sistema deverá gerar um QR Code que identifique o produto e direcione o comprador à sua página. O código poderá ser baixado ou impresso pelo vendedor para ser colocado fisicamente próximo ao item.

## Página do produto e pagamento

A página acessada pelo QR Code deverá apresentar somente as informações necessárias para uma compra rápida:

- imagem e nome do produto;
- descrição curta;
- preço;
- nome ou identificação do vendedor;
- quantidade disponível;
- seletor da quantidade retirada;
- valor total calculado;
- QR Code Pix ou chave Pix do vendedor;
- instruções de pagamento;
- ação para informar que o pagamento foi realizado.

O pagamento continuará sendo realizado diretamente para a conta do vendedor. A aplicação não receberá, armazenará ou redistribuirá valores.

## Controle de estoque

O vendedor poderá visualizar todos os seus produtos e suas quantidades atuais. Os produtos deverão ser apresentados com indicações visuais de estado:

- **disponível:** quantidade adequada;
- **estoque baixo:** quantidade igual ou inferior ao limite definido pelo vendedor;
- **indisponível:** quantidade igual a zero ou produto desativado.

Quando o comprador informar uma retirada e um pagamento, o sistema poderá reduzir a quantidade disponível. O vendedor também poderá realizar ajustes manuais para registrar reposições, perdas ou correções.

Como o sistema se baseia em confiança, o estoque apresentado corresponderá às movimentações registradas pelos usuários e poderá apresentar diferenças em relação ao estoque físico.

## Painel do vendedor

O painel deverá fornecer uma visão resumida da operação do vendedor, podendo apresentar:

- quantidade total de produtos cadastrados;
- quantidade de itens disponíveis;
- produtos com estoque baixo;
- produtos indisponíveis;
- número de vendas registradas no período;
- valor estimado das vendas registradas;
- produtos mais vendidos;
- movimentações recentes.

O valor apresentado será uma estimativa baseada nas vendas informadas no sistema, e não uma confirmação de valores recebidos na conta bancária.

## Relatórios

O vendedor poderá consultar relatórios simples, com filtros por período e produto. Os relatórios poderão apresentar:

- quantidade vendida por produto;
- valor estimado vendido por produto;
- total de vendas registradas;
- produtos mais vendidos;
- produtos com poucas ou nenhuma venda;
- situação atual do estoque;
- histórico de retiradas e ajustes de estoque.

Na etapa inicial, esses relatórios poderão ser representados por cartões, tabelas e gráficos estáticos. Na etapa funcional, os dados poderão ser simulados e calculados a partir dos registros mantidos pela aplicação.

## Organização de vendedores e pontos de venda

A aplicação não será vinculada exclusivamente ao Departamento de Computação. Diferentes vendedores poderão utilizar o sistema para administrar seus próprios produtos em um ou mais pontos de venda autônomos.

Cada produto continuará pertencendo a um único vendedor. Dessa forma, o QR Code do produto sempre apresentará as informações corretas de pagamento e evitará a necessidade de dividir uma compra entre várias pessoas.

Inicialmente, não será necessário implementar uma administração complexa de múltiplas lojas. Para o protótipo, será suficiente demonstrar que a solução pode ser utilizada fora do DC e que os produtos são organizados por vendedor.

## Princípio de confiança e limitações

O sistema não pretende eliminar completamente divergências entre produtos retirados, estoque físico, pagamentos recebidos e informações registradas.

A aplicação:

- não confirmará transações bancárias;
- não intermediará pagamentos;
- não funcionará como carteira digital;
- não emitirá documentos fiscais;
- não garantirá que toda retirada foi registrada;
- não substituirá a conferência eventual realizada pelo vendedor.

Os relatórios e valores exibidos representarão os registros realizados pelos usuários dentro de um modelo de confiança.

## Escopo da primeira etapa - AA1

Na primeira etapa, o foco será a criação da interface utilizando HTML e CSS, com identidade visual definida, múltiplas páginas e layout responsivo. Não será necessário implementar toda a lógica da aplicação.

O protótipo deverá priorizar as seguintes telas:

1. **Apresentação da plataforma:** explicação do funcionamento e acesso às áreas principais.
2. **Página do produto:** tela que seria acessada por meio do QR Code físico.
3. **Pagamento:** apresentação do valor, dados Pix e confirmação declarativa.
4. **Painel do vendedor:** resumo de produtos, estoque e vendas.
5. **Cadastro ou edição de produto:** formulário visual com os dados do produto e geração do QR Code.
6. **Estoque e relatórios:** tabela de produtos, indicadores e gráficos de vendas.

O QR Code, os formulários, os indicadores e os gráficos poderão ser apresentados inicialmente como componentes estáticos. O objetivo será demonstrar com clareza a experiência do comprador e, principalmente, a experiência de gestão do vendedor.

## Escopo da segunda etapa

Na segunda etapa, utilizando React, as telas poderão receber comportamento e dados simulados. Entre as funcionalidades previstas estão:

- cadastro, edição e exclusão de produtos;
- atualização de estoque;
- registro de vendas informadas;
- geração do QR Code de cada produto;
- persistência local ou consumo de um backend simulado;
- filtros por produto e período;
- cálculo de indicadores;
- geração de gráficos e relatórios;
- navegação entre a página pública do produto e o painel do vendedor.

O acesso à rede poderá ser realizado por meio de um backend falso ou serviço de dados simulado. APIs adicionais poderão ser utilizadas para armazenamento local, geração de QR Codes, gráficos ou outros recursos compatíveis com os requisitos da disciplina.

## Funcionalidades fora do escopo inicial

Para manter o projeto adequado ao tempo da disciplina, não farão parte do escopo inicial:

- carrinho de compras com produtos de diferentes vendedores;
- agrupamento ou divisão de pagamentos;
- processamento ou confirmação bancária de Pix;
- entrega de produtos;
- cálculo de frete;
- emissão de notas fiscais;
- conciliação bancária;
- controle contábil completo;
- garantia automática de correspondência entre estoque físico e digital.

## Resumo da proposta

O projeto será uma plataforma simples para apoiar vendinhas autônomas baseadas em confiança. O comprador utilizará o QR Code físico do produto para acessar rapidamente as informações e realizar o pagamento diretamente ao vendedor. O vendedor utilizará a aplicação para cadastrar produtos, gerar QR Codes, acompanhar o estoque e analisar as vendas registradas.

Essa abordagem reduz a complexidade da experiência de compra e concentra o valor da aplicação no controle e na organização oferecidos ao vendedor.
