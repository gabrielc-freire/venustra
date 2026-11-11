
const CATEGORIAS = [
  "Hidratantes",
  "Protetores solares",
  "Esfoliantes",
  "Máscaras faciais",
  "Séruns",
  "Limpeza facial",
  "Tônicos",
  "Em promoção"
];

let PRODUTOS = [];

// Carrega os produtos do arquivo JSON
async function carregarProdutos() {
  const resposta = await fetch("Produtos.json");

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os produtos.");
  }

  PRODUTOS = await resposta.json();

  return PRODUTOS;
}

// Cria um elemento HTML
function el(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  if (texto) {
    elemento.textContent = texto;
  }

  return elemento;
}

// Cria um card de produto
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

  card.appendChild(
    el("p", "descricao", p.tamanho || p.descricao)
  );

  if (p.precoAntigo) {
    card.appendChild(
      el("p", "preco-antigo", p.precoAntigo)
    );
  }

  card.appendChild(
    el("p", "preco", p.preco)
  );

  return card;
}

// Cria uma categoria e seus produtos
function criarCategoria(titulo, produtos, numero) {
  const secao = el("section", "categoria");

  const idTitulo = "categoria-" + numero;

  const h2 = el("h2", "titulo-categoria", titulo);
  h2.id = idTitulo;

  secao.setAttribute("aria-labelledby", idTitulo);
  secao.appendChild(h2);

  const lista = el("div", "lista-produtos");

  lista.setAttribute("role", "region");
  lista.setAttribute("aria-labelledby", idTitulo);
  lista.tabIndex = 0;

  produtos.forEach(function (produto) {
    lista.appendChild(criarCard(produto));
  });

  secao.appendChild(lista);

  return secao;
}

// Normaliza o texto para facilitar a pesquisa
function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Verifica se o produto corresponde à pesquisa
function combinaComBusca(produto, termo) {
  if (!termo) {
    return true;
  }

  const conteudo = normalizar([
    produto.nome,
    produto.categoria,
    produto.descricao,
    produto.tamanho
  ].join(" "));

  return conteudo.includes(termo);
}

// Exibe as categorias e os produtos
function renderizarListas(container, busca = "") {
  const termo = normalizar(busca).trim();

  container.replaceChildren();

  let total = 0;

  CATEGORIAS.forEach(function (categoria, indice) {
    const produtosCategoria = PRODUTOS.filter(function (produto) {
      return produto.categoria === categoria &&
        combinaComBusca(produto, termo);
    });

    if (produtosCategoria.length > 0) {
      container.appendChild(
        criarCategoria(categoria, produtosCategoria, indice + 1)
      );

      total += produtosCategoria.length;
    }
  });

  if (total === 0) {
    container.appendChild(
      el("p", "mensagem-vazia", "Nenhum produto encontrado.")
    );
  }
}

// Inicializa o catálogo
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("listas-produtos");
  const campoPesquisa = document.querySelector(
    ".barra-pesquisa input"
  );

  
  if (!container) {
    return;
  }

  try {
    await carregarProdutos();

    renderizarListas(container);

    campoPesquisa.addEventListener("input", function () {
      renderizarListas(container, campoPesquisa.value);
    });

  } catch (erro) {
    console.error(erro);

    container.replaceChildren();

    container.appendChild(
      el("p", "mensagem-vazia", "Não foi possível carregar os produtos.")
    );
  }
});
