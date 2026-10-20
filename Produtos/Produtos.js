// ==================================================================
// Dados dos produtos. Usado por Produtos.html (listas) e produto.html
// (detalhe). Para cadastrar um produto real, troque um placeholder por
// um objeto completo (veja o exemplo abaixo) ou adicione em PRODUTOS.
// ==================================================================

const IMG_PLACEHOLDER = "../inicioPI/img/placeholder/placeholder-400x300.png";
const POR_LISTA = 8;

// Ordem em que as listas aparecem na página
const CATEGORIAS = [
  "Hidratantes",
  "Protetores solares",
  "Esfoliantes",
  "Máscaras faciais",
  "Séruns",
  "Limpeza facial",
  "Tônicos",
  "Em promoção",
];

function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Cria os produtos placeholder de cada lista.
// "overrides" troca dados de um produto específico pelo número dele (1, 2, ...).
function criarPlaceholders(categoria, { promocao = false, overrides = {} } = {}) {
  const lista = [];
  for (let i = 1; i <= POR_LISTA; i++) {
    lista.push({
      id: slug(categoria) + "-" + i,
      categoria: categoria,
      nome: "Placeholder de produto",
      tamanho: "",
      descricao: "Descrição do produto",
      precoAntigo: promocao || i === 1 ? "R$ 00,00" : "",
      preco: "R$ 00,00",
      imagem: IMG_PLACEHOLDER,
      ...(overrides[i] || {}),
    });
  }
  return lista;
}

const PRODUTOS = [
  ...criarPlaceholders("Hidratantes", {
    overrides: { 1: { tamanho: "0g" } },
  }),
  ...criarPlaceholders("Protetores solares", {
    overrides: {
      1: { tamanho: "850g", precoAntigo: "R$ 234,99", preco: "R$ 182,99" },
    },
  }),
  ...criarPlaceholders("Esfoliantes"),
  ...criarPlaceholders("Máscaras faciais"),
  ...criarPlaceholders("Séruns"),
  ...criarPlaceholders("Limpeza facial"),
  ...criarPlaceholders("Tônicos"),
  ...criarPlaceholders("Em promoção", { promocao: true }),

  // Exemplo de produto real (descomente e preencha):
  // {
  //   id: "hidratantes-9",
  //   categoria: "Hidratantes",
  //   nome: "Nome do produto",
  //   tamanho: "50g",
  //   descricao: "Descrição do produto",
  //   precoAntigo: "",
  //   preco: "R$ 00,00",
  //   imagem: "img/produto.png",
  // },
];

// Cria um elemento com classe e texto (textContent evita injetar HTML)
function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto) e.textContent = texto;
  return e;
}

// Monta um card de produto
function criarCard(p) {
  const card = el("article", "produto");

  const imagem = el("div", "imagem");
  const img = document.createElement("img");
  img.src = p.imagem;
  img.alt = p.nome;
  imagem.appendChild(img);
  card.appendChild(imagem);

  const botao = el("button", "adicionar", "+");
  botao.type = "button";
  botao.setAttribute("aria-label", "Adicionar produto");
  card.appendChild(botao);

  const titulo = el("h3");
  const link = el("a", "", p.nome);
  link.href = "produto.html?id=" + encodeURIComponent(p.id);
  titulo.appendChild(link);
  card.appendChild(titulo);

  card.appendChild(el("p", "descricao", p.tamanho || p.descricao));
  if (p.precoAntigo) card.appendChild(el("p", "preco-antigo", p.precoAntigo));
  card.appendChild(el("p", "preco", p.preco));

  return card;
}

// Monta uma lista (título + produtos rolando na horizontal)
function criarCategoria(titulo, produtos, n) {
  const idTitulo = "categoria-" + n;

  const secao = el("section", "categoria");
  secao.setAttribute("aria-labelledby", idTitulo);

  const h2 = el("h2", "titulo-categoria", titulo);
  h2.id = idTitulo;
  secao.appendChild(h2);

  const lista = el("div", "lista-produtos");
  lista.setAttribute("role", "region");
  lista.setAttribute("aria-labelledby", idTitulo);
  lista.tabIndex = 0;
  produtos.forEach(function (p) {
    lista.appendChild(criarCard(p));
  });
  secao.appendChild(lista);

  return secao;
}

// Deixa o texto em minúsculas e sem acento, para a busca
function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Verdadeiro se o produto combina com o termo pesquisado
function combinaComBusca(p, termo) {
  if (!termo) return true;
  const alvo = normalizar(
    [p.nome, p.categoria, p.descricao, p.tamanho].join(" ")
  );
  return alvo.indexOf(termo) !== -1;
}

// Desenha as listas dentro do elemento informado.
// Com "busca", mostra só os produtos que combinam (nome, lista, descrição).
function renderizarListas(container, busca) {
  const termo = normalizar(busca).trim();
  container.replaceChildren();

  let total = 0;
  CATEGORIAS.forEach(function (nome, indice) {
    const doGrupo = PRODUTOS.filter(function (p) {
      return p.categoria === nome && combinaComBusca(p, termo);
    });
    if (doGrupo.length) {
      container.appendChild(criarCategoria(nome, doGrupo, indice + 1));
      total += doGrupo.length;
    }
  });

  if (total === 0) {
    container.appendChild(el("p", "mensagem-vazia", "Nenhum produto encontrado."));
  }
}