/* Minha Rotina | Venustra
   O catálogo é carregado de Produtos.json. As escolhas ficam somente
   enquanto a página está aberta; não há salvamento permanente da rotina. */
(function () {
  "use strict";

  var CAMINHO_PRODUTOS = "../Produtos/Produtos.json";
  var produtos = [];
  var tipoPele = sessionStorage.getItem("venustra_tipo_pele");
  var rotinas = { manha: [], noite: [] };

  var elementos = {
    textoTipoPele: document.getElementById("texto-tipo-pele"),
    seletorManha: document.getElementById("produto-manha"),
    seletorNoite: document.getElementById("produto-noite"),
    botaoManha: document.getElementById("adicionar-manha"),
    botaoNoite: document.getElementById("adicionar-noite"),
    listaManha: document.getElementById("lista-rotina-manha"),
    listaNoite: document.getElementById("lista-rotina-noite")
  };

  function normalizar(texto) {
    return String(texto || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  function mostrarTipoPele() {
    if (!elementos.textoTipoPele) return;
    var nomes = { seca: "Seca", oleosa: "Oleosa", normal: "Normal", mista: "Mista" };
    elementos.textoTipoPele.textContent = tipoPele && nomes[normalizar(tipoPele)]
      ? "Seu tipo de pele identificado é: " + nomes[normalizar(tipoPele)] + "."
      : "Você ainda não identificou seu tipo de pele. Responda ao questionário para consultar a compatibilidade dos produtos.";
  }

  function buscarProduto(id) {
    return produtos.find(function (p) { return String(p.id) === String(id); });
  }

  function obterEtapa(categoria) {
    var nome = normalizar(categoria);
    if (nome.includes("limpeza") || nome.includes("sabonete") || nome.includes("demaquilante")) return "Limpeza";
    if (nome.includes("protetor") || nome.includes("solar")) return "Proteção solar";
    if (nome.includes("hidratante") || nome.includes("hidratacao")) return "Hidratação";
    if (nome.includes("tratamento") || nome.includes("serum") || nome.includes("esfoliante")) return "Tratamento";
    return categoria || "Cuidados com a pele";
  }

  function verificarCompatibilidade(produto) {
    if (!tipoPele || !Array.isArray(produto.tiposPele) || produto.tiposPele.length === 0) {
      return { classe: "compatibilidade-desconhecida", texto: "Compatibilidade não informada" };
    }
    var tipos = produto.tiposPele.map(normalizar);
    if (tipos.includes(normalizar(tipoPele))) {
      return { classe: "compatibilidade-positiva", texto: "Compatível com seu tipo de pele" };
    }
    return { classe: "compatibilidade-negativa", texto: "Não indicado no cadastro para seu tipo de pele" };
  }

  function formatarPreco(preco) {
    var valor = Number(preco);
    if (!Number.isFinite(valor) || valor <= 0) return "Preço não informado";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function preencherSeletores() {
    [elementos.seletorManha, elementos.seletorNoite].forEach(function (seletor) {
      if (!seletor) return;
      seletor.replaceChildren();
      var inicial = document.createElement("option");
      inicial.value = "";
      inicial.textContent = "Selecione um produto";
      seletor.appendChild(inicial);
      produtos.forEach(function (produto) {
        var opcao = document.createElement("option");
        opcao.value = produto.id;
        opcao.textContent = produto.nome + " (" + produto.categoria + ")";
        seletor.appendChild(opcao);
      });
    });
  }

  function criarCard(produto, periodo, indice) {
    var card = document.createElement("article");
    card.className = "produto-rotina";

    var etapa = document.createElement("span");
    etapa.className = "etapa";
    etapa.textContent = obterEtapa(produto.categoria);

    var numero = document.createElement("span");
    numero.className = "numero";
    numero.textContent = indice + 1;

    var imagem = document.createElement("img");
    imagem.className = "foto-produto";
    imagem.alt = produto.nome;
    if (produto.imagem) {
      /* Os caminhos do JSON partem da pasta Produtos. */
      imagem.src = "../Produtos/" + produto.imagem.replace(/^\.?\//, "");
      imagem.addEventListener("error", function () {
        imagem.hidden = true;
      }, { once: true });
    } else {
      imagem.hidden = true;
    }

    var titulo = document.createElement("h3");
    titulo.className = "titulo";
    titulo.textContent = produto.nome;

    var descricao = document.createElement("p");
    descricao.className = "descricao-produto";
    descricao.textContent = produto.descricao || "Descrição não informada.";

    var preco = document.createElement("p");
    preco.className = "preco-produto";
    preco.textContent = formatarPreco(produto.preco);

    var quantidade = document.createElement("p");
    quantidade.className = "tamanho-produto";
    quantidade.textContent = produto.quantidade && produto.unidade
      ? "Quantidade: " + produto.quantidade + " " + produto.unidade
      : "Quantidade não informada";

    var compatibilidade = verificarCompatibilidade(produto);
    var avaliacao = document.createElement("p");
    avaliacao.className = "avaliacao " + compatibilidade.classe;
    avaliacao.textContent = compatibilidade.texto;

    var remover = document.createElement("button");
    remover.type = "button";
    remover.className = "remover-produto";
    remover.textContent = "Remover";
    remover.addEventListener("click", function () {
      rotinas[periodo] = rotinas[periodo].filter(function (id) { return String(id) !== String(produto.id); });
      renderizarRotina(periodo);
    });

    card.append(etapa, numero, imagem, titulo, descricao, preco, quantidade, avaliacao, remover);
    return card;
  }

  function renderizarRotina(periodo) {
    var lista = periodo === "manha" ? elementos.listaManha : elementos.listaNoite;
    if (!lista) return;
    lista.replaceChildren();

    if (rotinas[periodo].length === 0) {
      var mensagem = document.createElement("p");
      mensagem.className = "mensagem-vazia";
      mensagem.textContent = periodo === "manha"
        ? "Você ainda não adicionou produtos à rotina da manhã."
        : "Você ainda não adicionou produtos à rotina da noite.";
      lista.appendChild(mensagem);
      return;
    }

    rotinas[periodo].forEach(function (id, indice) {
      var produto = buscarProduto(id);
      if (produto) lista.appendChild(criarCard(produto, periodo, indice));
    });
  }

  function adicionarProduto(periodo) {
    var seletor = periodo === "manha" ? elementos.seletorManha : elementos.seletorNoite;
    if (!seletor || !seletor.value) {
      alert("Selecione um produto antes de adicionar.");
      return;
    }
    if (rotinas[periodo].some(function (id) { return String(id) === String(seletor.value); })) {
      alert("Esse produto já está na sua rotina.");
      return;
    }
    rotinas[periodo].push(seletor.value);
    renderizarRotina(periodo);
    seletor.value = "";
  }

  async function carregarProdutos() {
    try {
      var resposta = await fetch(CAMINHO_PRODUTOS);
      if (!resposta.ok) throw new Error("Não foi possível carregar Produtos.json.");
      var dados = await resposta.json();
      if (!Array.isArray(dados)) throw new Error("O catálogo precisa ser uma lista de produtos.");
      produtos = dados;
      preencherSeletores();
      renderizarRotina("manha");
      renderizarRotina("noite");
    } catch (erro) {
      console.error("Erro ao carregar catálogo:", erro);
      [elementos.listaManha, elementos.listaNoite].forEach(function (lista) {
        if (lista) lista.textContent = "Não foi possível carregar os produtos. Confira Produtos.json e execute o site por um servidor local.";
      });
    }
  }

  function iniciar() {
    mostrarTipoPele();
    if (elementos.botaoManha) elementos.botaoManha.addEventListener("click", function () { adicionarProduto("manha"); });
    if (elementos.botaoNoite) elementos.botaoNoite.addEventListener("click", function () { adicionarProduto("noite"); });
    carregarProdutos();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
