/* Minha Rotina | Venustra

   - A rotina só é exibida e só pode ser alterada com a conta aberta.
     Sem login, aparece apenas o painel "Entre ou crie sua conta".
   - A rotina recomendada é montada automaticamente (js/venustra.js) com os
     produtos de Produtos.json, a partir do questionário. Aqui a pessoa
     vê, adiciona e remove produtos; tudo é guardado na conta. */
(function () {
  "use strict";

  var V = window.Venustra;
  var CAMINHO_PRODUTOS = "../Produtos/Produtos.json";

  var produtos = [];
  var itens = [];          // rotina da conta: { periodo, etapa, recomendado, dica, produtoId, opcional }
  var usuario = null;
  var tipoPele = "";

  function $(id) { return document.getElementById(id); }

  var elementos = {
    acessoRestrito: $("acesso-restrito"),
    introducao: $("introducao-rotina"),
    rotinas: $("rotinas"),
    textoTipoPele: $("texto-tipo-pele"),
    textoFoco: $("texto-foco"),
    avisoSaude: $("aviso-saude"),
    restaurar: $("restaurar-rotina"),
    mensagem: $("msg-rotina"),
    seletor: { manha: $("produto-manha"), noite: $("produto-noite") },
    botao: { manha: $("adicionar-manha"), noite: $("adicionar-noite") },
    lista: { manha: $("lista-rotina-manha"), noite: $("lista-rotina-noite") }
  };

  function normalizar(texto) {
    return String(texto || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  // ---------------- Acesso: sem conta, nada da rotina aparece ----------------

  function bloquear() {
    usuario = null;
    itens = [];
    if (elementos.introducao) elementos.introducao.hidden = true;
    if (elementos.rotinas) elementos.rotinas.hidden = true;
    ["manha", "noite"].forEach(function (p) {
      if (elementos.lista[p]) elementos.lista[p].replaceChildren();
    });

    var voltar = encodeURIComponent(location.href.split("#")[0]);
    var entrar = $("acesso-entrar");
    var criar = $("acesso-criar");
    if (entrar && V) entrar.href = V.RAIZ + "login/login.html?voltar=" + voltar;
    if (criar && V) criar.href = V.RAIZ + "login/login.html?voltar=" + voltar + "#criar";
    if (elementos.acessoRestrito) elementos.acessoRestrito.hidden = false;
  }

  function liberar() {
    if (elementos.acessoRestrito) elementos.acessoRestrito.hidden = true;
    if (elementos.introducao) elementos.introducao.hidden = false;
    if (elementos.rotinas) elementos.rotinas.hidden = false;
  }

  // ---------------- Informações do topo ----------------

  function dicaDeSaude(foco) {
    var temAcne = foco.indexOf("acne") !== -1 || foco.indexOf("cravos") !== -1;
    var temManchas = foco.indexOf("manchas") !== -1;
    var partes = [];
    if (temAcne) {
      partes.push("Se as espinhas forem doloridas, deixarem cicatrizes ou não melhorarem em algumas semanas, procure um dermatologista.");
    }
    if (temManchas) {
      partes.push("Manchas que crescem, mudam de cor ou de formato também devem ser avaliadas por um dermatologista.");
    }
    if (partes.length) {
      partes.push("O Venustra tem caráter informativo e não substitui orientação profissional.");
    }
    return partes.join(" ");
  }

  function mostrarTipoPele() {
    var tipo = V.TIPOS[tipoPele];
    var foco = (usuario && usuario.preocupacoes) || [];
    var respostas = usuario && usuario.respostas;

    var nomeTipo = tipo ? tipo.nome.replace(/^Pele /, "") : "";
    nomeTipo = nomeTipo.charAt(0).toUpperCase() + nomeTipo.slice(1);
    elementos.textoTipoPele.textContent = tipo
      ? "Seu tipo de pele identificado é: " + nomeTipo + "."
      : "Você ainda não identificou seu tipo de pele. Responda ao questionário para receber uma rotina recomendada.";

    var textoFoco = "";
    if (tipo && foco.length) {
      textoFoco = "Sua rotina foi montada considerando suas queixas de " + V.listaEmTexto(foco) + ".";
    } else if (tipo && respostas && respostas[5] === undefined) {
      textoFoco = "Refaça o questionário para incluir suas queixas de espinhas, cravos e manchas na rotina.";
    }
    elementos.textoFoco.textContent = textoFoco;
    elementos.textoFoco.hidden = !textoFoco;

    var aviso = dicaDeSaude(foco);
    elementos.avisoSaude.textContent = aviso;
    elementos.avisoSaude.hidden = !aviso;

    elementos.restaurar.hidden = !tipo;
  }

  function mostrarMensagem(texto, erro) {
    var el = elementos.mensagem;
    if (!el) return;
    el.textContent = texto || "";
    el.classList.toggle("erro", !!erro);
    el.hidden = !texto;
  }

  // ---------------- Produtos ----------------

  function buscarProduto(id) {
    if (!id) return null;
    return produtos.find(function (p) { return String(p.id) === String(id); }) || null;
  }

  function verificarCompatibilidade(produto) {
    if (!tipoPele || !Array.isArray(produto.tiposPele) || produto.tiposPele.length === 0) {
      return { classe: "compatibilidade-desconhecida", texto: "Compatibilidade não informada" };
    }
    if (produto.tiposPele.map(normalizar).includes(normalizar(tipoPele))) {
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
    ["manha", "noite"].forEach(function (periodo) {
      var seletor = elementos.seletor[periodo];
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

  // ---------------- Cards ----------------

  function criarBotaoRemover(item) {
    var remover = document.createElement("button");
    remover.type = "button";
    remover.className = "remover-produto";
    remover.textContent = "Remover";
    remover.addEventListener("click", function () {
      salvar(itens.filter(function (x) { return x !== item; }));
    });
    return remover;
  }

  function criarEtapa(item) {
    var etapa = document.createElement("span");
    etapa.className = "etapa";
    etapa.textContent = item.etapa;
    if (item.opcional) {
      var selo = document.createElement("span");
      selo.className = "selo-opcional";
      selo.textContent = "Opcional";
      etapa.appendChild(selo);
    }
    return etapa;
  }

  function criarNumero(indice) {
    var numero = document.createElement("span");
    numero.className = "numero";
    numero.textContent = indice + 1;
    return numero;
  }

  // Etapa com produto do catálogo
  function criarCard(item, produto, indice) {
    var card = document.createElement("article");
    card.className = "produto-rotina";

    var imagem = document.createElement("img");
    imagem.className = "foto-produto";
    imagem.alt = produto.nome;
    if (produto.imagem) {
      /* Os caminhos do JSON partem da pasta Produtos. */
      imagem.src = "../Produtos/" + produto.imagem.replace(/^\.?\//, "");
      imagem.addEventListener("error", function () { imagem.hidden = true; }, { once: true });
    } else {
      imagem.hidden = true;
    }

    var titulo = document.createElement("h3");
    titulo.className = "titulo";
    titulo.textContent = produto.nome + (produto.marca ? " — " + produto.marca : "");

    var dica = document.createElement("p");
    dica.className = "dica-etapa";
    dica.textContent = item.dica || "";
    dica.hidden = !item.dica;

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

    var compat = verificarCompatibilidade(produto);
    var avaliacao = document.createElement("p");
    avaliacao.className = "avaliacao " + compat.classe;
    avaliacao.textContent = compat.texto;

    card.append(criarEtapa(item), criarNumero(indice), imagem, titulo, dica, descricao, preco, quantidade, avaliacao);

    if (/^https?:\/\//.test(produto.linkCompra || "")) {
      var link = document.createElement("a");
      link.className = "produto-link";
      link.href = produto.linkCompra;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ver onde comprar";
      card.appendChild(link);
    }

    card.appendChild(criarBotaoRemover(item));
    return card;
  }

  // Etapa sem produto (sugestão opcional ou catálogo indisponível)
  function criarCardSugestao(item, indice) {
    var card = document.createElement("article");
    card.className = "produto-rotina sugestao";

    var titulo = document.createElement("h3");
    titulo.className = "titulo";
    titulo.textContent = item.recomendado || "Etapa sem produto escolhido";

    var dica = document.createElement("p");
    dica.className = "dica-etapa";
    dica.textContent = item.dica || "";
    dica.hidden = !item.dica;

    card.append(criarEtapa(item), criarNumero(indice), titulo, dica, criarBotaoRemover(item));
    return card;
  }

  function renderizar(periodo) {
    var lista = elementos.lista[periodo];
    if (!lista) return;
    lista.replaceChildren();

    var doPeriodo = itens.filter(function (i) { return i.periodo === periodo; });

    if (doPeriodo.length === 0) {
      var vazio = document.createElement("p");
      vazio.className = "mensagem-vazia";
      vazio.textContent = tipoPele
        ? "Nenhum produto na rotina da " + (periodo === "manha" ? "manhã" : "noite") + ". Escolha um acima."
        : "Responda ao questionário para receber uma rotina recomendada ou escolha produtos acima.";
      lista.appendChild(vazio);
      return;
    }

    doPeriodo.forEach(function (item, indice) {
      var produto = buscarProduto(item.produtoId);
      lista.appendChild(produto ? criarCard(item, produto, indice) : criarCardSugestao(item, indice));
    });
  }

  function renderizarTudo() {
    renderizar("manha");
    renderizar("noite");
  }

  // ---------------- Salvar na conta ----------------

  function tratarErro(erro) {
    if (erro && erro.status === 401) {   // saiu da conta em outra aba
      bloquear();
      return;
    }
    mostrarMensagem((erro && erro.message) || "Não foi possível salvar.", true);
  }

  // Grava a rotina na conta e só então atualiza a tela
  function salvar(novosItens) {
    mostrarMensagem("");
    return V.api("PUT", "/api/rotina", { itens: novosItens }).then(function (r) {
      itens = r.rotina;
      renderizarTudo();
      return true;
    }, function (erro) {
      tratarErro(erro);
      return false;
    });
  }

  // Mantém a ordem Limpeza > Tratamento > Hidratação > Protetor em cada período
  function ordenar(lista) {
    function peso(i) {
      return (i.periodo === "manha" ? 0 : 100) + V.ETAPAS.indexOf(i.etapa);
    }
    return lista.slice().sort(function (a, b) { return peso(a) - peso(b); });
  }

  function adicionarProduto(periodo) {
    var seletor = elementos.seletor[periodo];
    if (!seletor || !seletor.value) {
      mostrarMensagem("Selecione um produto antes de adicionar.", true);
      return;
    }
    var produto = buscarProduto(seletor.value);
    if (!produto) return;
    var repetido = itens.some(function (i) {
      return i.periodo === periodo && String(i.produtoId) === String(produto.id);
    });
    if (repetido) {
      mostrarMensagem("Esse produto já está na sua rotina.", true);
      return;
    }
    var novo = {
      periodo: periodo, etapa: V.etapaDaCategoria(produto.categoria),
      recomendado: "", dica: "", produtoId: String(produto.id), opcional: false
    };
    salvar(ordenar(itens.concat([novo]))).then(function (ok) {
      if (ok) seletor.value = "";
    });
  }

  function refazerRecomendada() {
    if (!window.confirm("Isso troca a sua rotina atual pela rotina recomendada para o seu tipo de pele. Continuar?")) return;
    mostrarMensagem("");
    V.api("POST", "/api/rotina/recomendada").then(function (r) {
      itens = r.rotina;
      renderizarTudo();
      mostrarMensagem("Rotina recomendada atualizada.");
    }, tratarErro);
  }

  // ---------------- Início ----------------

  async function carregarProdutos() {
    try {
      var resposta = await fetch(CAMINHO_PRODUTOS);
      if (!resposta.ok) throw new Error("Não foi possível carregar Produtos.json.");
      var dados = await resposta.json();
      if (!Array.isArray(dados)) throw new Error("O catálogo precisa ser uma lista de produtos.");
      produtos = dados;
    } catch (erro) {
      console.error("Erro ao carregar catálogo:", erro);
      produtos = [];
      mostrarMensagem("Não foi possível carregar os produtos. Execute o site por um servidor local (ex.: Live Server).", true);
    }
  }

  function mostrarRotina(dados) {
    usuario = dados.usuario;
    tipoPele = usuario.tipo_pele || "";
    itens = Array.isArray(dados.rotina) ? dados.rotina : [];
    liberar();
    mostrarTipoPele();
    carregarProdutos().then(function () {
      preencherSeletores();
      renderizarTudo();
    });
  }

  function iniciar() {
    if (!V) {            // sem o módulo de contas, nunca mostra a rotina
      bloquear();
      return;
    }
    V.eu().then(function (dados) {
      if (!dados) bloquear();
      else mostrarRotina(dados);
    }, bloquear);

    ["manha", "noite"].forEach(function (periodo) {
      if (elementos.botao[periodo]) {
        elementos.botao[periodo].addEventListener("click", function () { adicionarProduto(periodo); });
      }
    });
    if (elementos.restaurar) elementos.restaurar.addEventListener("click", refazerRecomendada);

    // Saiu da conta (ou entrou) em outra aba: atualiza esta
    window.addEventListener("storage", function (e) {
      if (e.key === "venustra_sessao") location.reload();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
