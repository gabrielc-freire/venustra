const CATEGORIAS = [
  "Limpeza facial",
  "Hidratantes",
  "Séruns",
  "Protetores solares"
];

let PRODUTOS = [];

async function carregarProdutos() {
  const resposta = await fetch("Produtos.json");
  if (!resposta.ok) throw new Error("Não foi possível carregar Produtos.json.");

  const dados = await resposta.json();
  if (!Array.isArray(dados)) throw new Error("O catálogo precisa ser uma lista.");

  PRODUTOS = dados;
  return PRODUTOS;
}

function el(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined && texto !== null) elemento.textContent = texto;
  return elemento;
}

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return "Preço não informado";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function criarCard(p) {
  const card = el("article", "produto");

  const imagem = el("div", "imagem");
  const img = document.createElement("img");
  img.src = p.imagem || "../inicioPI/img/placeholder/placeholder-400x300.png";
  img.alt = p.nome || "Imagem do produto";
  img.loading = "lazy";
  img.addEventListener("error", function () {
    img.src = "../inicioPI/img/placeholder/placeholder-400x300.png";
  }, { once: true });
  imagem.appendChild(img);
  card.appendChild(imagem);

  const titulo = el("h3");
  const linkDetalhe = el("a", "", p.nome || "Produto sem nome");
  linkDetalhe.href = "Produto.html?id=" + encodeURIComponent(p.id);
  titulo.appendChild(linkDetalhe);
  card.appendChild(titulo);

  card.appendChild(el("p", "marca-produto", p.marca || "Marca não informada"));
  card.appendChild(el("p", "descricao", p.descricao || "Descrição não informada."));
  card.appendChild(el("p", "quantidade-produto",
    p.quantidade && p.unidade ? `Quantidade: ${p.quantidade} ${p.unidade}` : "Quantidade não informada"
  ));

  const areaPrecos = el("div", "area-precos");
  if (Number(p.precoAntigo) > 0) {
    areaPrecos.appendChild(el("span", "preco-antigo",
      `De: ${formatarMoeda(p.precoAntigo)}`
    ));
  }
  areaPrecos.appendChild(el("span", "preco",
    Number(p.preco) > 0 ? `Preço atual: ${formatarMoeda(p.preco)}` : "Preço não informado"
  ));
  card.appendChild(areaPrecos);

  const acoes = el("div", "acoes-produto");

  const botaoComparar = el("button", "adicionar", "＋ Comparar");
  botaoComparar.type = "button";
  botaoComparar.setAttribute("aria-label", `Adicionar ${p.nome} à comparação`);
  botaoComparar.addEventListener("click", function () {
    const chave = "venustra_comparar";
    let ids = [];
    try {
      ids = JSON.parse(sessionStorage.getItem(chave) || "[]");
      if (!Array.isArray(ids)) ids = [];
    } catch (_) {
      ids = [];
    }

    if (ids.includes(String(p.id))) {
      alert("Este produto já foi selecionado para comparação.");
      return;
    }
    if (ids.length >= 3) {
      alert("Você pode comparar até três produtos por vez. Abra a página Comparar para continuar.");
      return;
    }
    ids.push(String(p.id));
    sessionStorage.setItem(chave, JSON.stringify(ids));
    window.location.href = "../Comparar/Comparar.html";
  });
  acoes.appendChild(botaoComparar);

  const linkCompra = el("a", "link-compra", "Encontrar para comprar");
  if (p.linkCompra) {
    linkCompra.href = p.linkCompra;
    linkCompra.target = "_blank";
    linkCompra.rel = "noopener noreferrer";
  } else {
    linkCompra.href = `https://www.google.com/search?q=${encodeURIComponent((p.marca || "") + " " + (p.nome || "") + " comprar")}`;
    linkCompra.target = "_blank";
    linkCompra.rel = "noopener noreferrer";
  }
  acoes.appendChild(linkCompra);
  card.appendChild(acoes);

  return card;
}

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function combinaComBusca(produto, termo) {
  if (!termo) return true;
  const conteudo = normalizar([
    produto.nome, produto.marca, produto.categoria,
    produto.descricao, produto.tamanho, produto.ingredientes
  ].join(" "));
  return conteudo.includes(termo);
}

function renderizarListas(container, busca = "") {
  const termo = normalizar(busca);
  container.replaceChildren();
  let total = 0;

  CATEGORIAS.forEach(function (categoria, indice) {
    const encontrados = PRODUTOS.filter(function (produto) {
      return normalizar(produto.categoria) === normalizar(categoria) &&
        combinaComBusca(produto, termo);
    });

    if (encontrados.length) {
      const secao = el("section", "categoria");
      const titulo = el("h2", "titulo-categoria", categoria);
      titulo.id = "categoria-" + indice;
      secao.setAttribute("aria-labelledby", titulo.id);
      secao.appendChild(titulo);

      const lista = el("div", "lista-produtos");
      lista.setAttribute("role", "region");
      lista.setAttribute("aria-label", `Produtos de ${categoria}`);
      encontrados.forEach(produto => lista.appendChild(criarCard(produto)));
      secao.appendChild(lista);
      container.appendChild(secao);
      total += encontrados.length;
    }
  });

  if (!total) {
    container.appendChild(el("p", "mensagem-vazia", "Nenhum produto encontrado."));
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("listas-produtos");
  const campoPesquisa = document.getElementById("campo-pesquisa");
  const formularioPesquisa = document.getElementById("form-pesquisa");
  if (!container) return;

  try {
    await carregarProdutos();
    renderizarListas(container);

    if (campoPesquisa) {
      campoPesquisa.addEventListener("input", () => renderizarListas(container, campoPesquisa.value));
    }
    if (formularioPesquisa) {
      formularioPesquisa.addEventListener("submit", evento => {
        evento.preventDefault();
        renderizarListas(container, campoPesquisa ? campoPesquisa.value : "");
      });
    }
  } catch (erro) {
    console.error(erro);
    container.replaceChildren(el("p", "mensagem-vazia",
      "Não foi possível carregar os produtos. Abra o projeto por um servidor local e confira Produtos.json."
    ));
  }
})