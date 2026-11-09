/*
Minha Rotina | Venustra

Carrega os produtos do produtos.json.
Permite montar rotinas para manhã e noite.
Identifica a compatibilidade usando o tipo de pele
salvo pelo questionário.
Salva as escolhas no localStorage.
*/

(function () {
    "use strict";

    // Arquivo que contém os produtos cadastrados.
    var CAMINHO_PRODUTOS = "../Produtos/produtos.json";

    // Chaves utilizadas para salvar as rotinas.
    var CHAVE_MANHA = "venustra_rotina_manha";
    var CHAVE_NOITE = "venustra_rotina_noite";

    // Tipo de pele salvo pelo questionário.
    var CHAVE_TIPO_PELE = "venustra_tipo_pele";

    var produtos = [];

    var tipoPele = localStorage.getItem(CHAVE_TIPO_PELE);

    var rotinas = {
        manha: [],
        noite: []
    };

    // Elementos da página.
    var elementos = {
        textoTipoPele: document.getElementById("texto-tipo-pele"),

        seletorManha: document.getElementById("produto-manha"),
        seletorNoite: document.getElementById("produto-noite"),

        botaoManha: document.getElementById("adicionar-manha"),
        botaoNoite: document.getElementById("adicionar-noite"),

        listaManha: document.getElementById("lista-rotina-manha"),
        listaNoite: document.getElementById("lista-rotina-noite")
    };

    /*
    Converte textos para minúsculas e remove acentos.
    Isso facilita a comparação entre categorias e tipos de pele.
    */
    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    //Exibe o tipo de pele identificado pelo questionário.
    function mostrarTipoPele() {
        if (!elementos.textoTipoPele) {
            return;
        }

        if (!tipoPele) {
            elementos.textoTipoPele.textContent =
                "Você ainda não identificou seu tipo de pele. " +
                "Responda ao questionário para consultar a compatibilidade dos produtos.";

            return;
        }

        var nomes = {
            seca: "Seca",
            oleosa: "Oleosa",
            normal: "Normal",
            mista: "Mista"
        };

        var nome = nomes[normalizar(tipoPele)];

        if (!nome) {
            elementos.textoTipoPele.textContent =
                "Não foi possível identificar seu tipo de pele. " +
                "Responda novamente ao questionário.";

            return;
        }

        elementos.textoTipoPele.textContent =
            "Seu tipo de pele identificado é: " + nome + ".";
    }

    // Carrega as rotinas que foram salvas anteriormente.
    function carregarRotinas() {
        try {
            rotinas.manha = JSON.parse(
                localStorage.getItem(CHAVE_MANHA)
            ) || [];

            rotinas.noite = JSON.parse(
                localStorage.getItem(CHAVE_NOITE)
            ) || [];

            if (!Array.isArray(rotinas.manha)) {
                rotinas.manha = [];
            }

            if (!Array.isArray(rotinas.noite)) {
                rotinas.noite = [];
            }
        } catch (erro) {
            rotinas.manha = [];
            rotinas.noite = [];
        }
    }

    // Salva as duas rotinas no navegador.
    function salvarRotinas() {
        localStorage.setItem(
            CHAVE_MANHA,
            JSON.stringify(rotinas.manha)
        );

        localStorage.setItem(
            CHAVE_NOITE,
            JSON.stringify(rotinas.noite)
        );
    }

    // Procura um produto pelo seu ID.
    function buscarProduto(id) {
        return produtos.find(function (produto) {
            return String(produto.id) === String(id);
        });
    }

    // Retorna o nome da etapa conforme a categoria.
    function obterEtapa(categoria) {
        var nome = normalizar(categoria);

        if (
            nome.includes("limpeza") ||
            nome.includes("sabonete") ||
            nome.includes("demaquilante")
        ) {
            return "Limpeza";
        }

        if (
            nome.includes("protetor") ||
            nome.includes("solar")
        ) {
            return "Proteção solar";
        }

        if (
            nome.includes("hidratante") ||
            nome.includes("hidratacao")
        ) {
            return "Hidratação";
        }

        if (
            nome.includes("tratamento") ||
            nome.includes("serum") ||
            nome.includes("esfoliante")
        ) {
            return "Tratamento";
        }

        return categoria || "Cuidados com a pele";
    }

    // Verifica se o produto é compatível com o tipo de pele.
    function verificarCompatibilidade(produto) {
        if (!tipoPele) {
            return {
                classe: "compatibilidade-desconhecida",
                texto: "Responda ao questionário para verificar"
            };
        }

        if (!Array.isArray(produto.tiposPele)) {
            return {
                classe: "compatibilidade-desconhecida",
                texto: "Compatibilidade não informada"
            };
        }

        var tipos = produto.tiposPele.map(normalizar);
        var tipoAtual = normalizar(tipoPele);

        if (tipos.includes(tipoAtual)) {
            return {
                classe: "compatibilidade-positiva",
                texto: "Compatível com seu tipo de pele"
            };
        }

        return {
            classe: "compatibilidade-negativa",
            texto: "Não indicado no cadastro para seu tipo de pele"
        };
    }

    // Formata o preço para o padrão brasileiro.
    function formatarPreco(preco) {
        var valor = Number(preco);

        if (!Number.isFinite(valor)) {
            return "Preço não informado";
        }

        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // Preenche os seletores com os produtos cadastrados.
    function preencherSeletores() {
        var seletores = [
            elementos.seletorManha,
            elementos.seletorNoite
        ];

        seletores.forEach(function (seletor) {
            if (!seletor) {
                return;
            }

            seletor.innerHTML = "";

            var opcaoInicial = document.createElement("option");

            opcaoInicial.value = "";
            opcaoInicial.textContent = "Selecione um produto";

            seletor.appendChild(opcaoInicial);

            produtos.forEach(function (produto) {
                var opcao = document.createElement("option");

                opcao.value = produto.id;
                opcao.textContent =
                    produto.nome + " (" + produto.categoria + ")";

                seletor.appendChild(opcao);
            });
        });
    }

    // Cria visualmente um card de produto.
    function criarCard(produto, periodo, indice) {
        var card = document.createElement("article");

        card.className = "produto-rotina";

        var etapa = document.createElement("span");
        etapa.className = "etapa";
        etapa.textContent = obterEtapa(produto.categoria);

        var numero = document.createElement("span");
        numero.className = "numero";
        numero.textContent = indice + 1;

        var titulo = document.createElement("h3");
        titulo.className = "titulo";
        titulo.textContent = produto.nome;

        var imagem = document.createElement("img");
        imagem.className = "foto-produto";
        imagem.alt = produto.nome;

        if (produto.imagem) {
            imagem.src = produto.imagem;

            imagem.addEventListener("error", function () {
                imagem.hidden = true;
            });
        } else {
            imagem.hidden = true;
        }

        var descricao = document.createElement("p");
        descricao.className = "descricao-produto";
        descricao.textContent =
            produto.descricao || "Descrição não informada.";

        var preco = document.createElement("p");
        preco.className = "preco-produto";
        preco.textContent = formatarPreco(produto.preco);

        var tamanho = document.createElement("p");
        tamanho.className = "tamanho-produto";

        if (produto.tamanho) {
            tamanho.textContent = "Quantidade: " + produto.tamanho;
        } else {
            tamanho.textContent = "Quantidade não informada";
        }

        var compatibilidade = verificarCompatibilidade(produto);

        var avaliacao = document.createElement("p");
        avaliacao.className =
            "avaliacao " + compatibilidade.classe;

        avaliacao.textContent = compatibilidade.texto;

        var botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.className = "remover-produto";
        botaoRemover.textContent = "Remover";

        botaoRemover.addEventListener("click", function () {
            removerProduto(periodo, produto.id);
        });

        card.appendChild(etapa);
        card.appendChild(numero);
        card.appendChild(imagem);
        card.appendChild(titulo);
        card.appendChild(descricao);
        card.appendChild(preco);
        card.appendChild(tamanho);
        card.appendChild(avaliacao);
        card.appendChild(botaoRemover);

        return card;
    }

    // Exibe os produtos de uma rotina.
    function renderizarRotina(periodo) {
        var lista = periodo === "manha"
            ? elementos.listaManha
            : elementos.listaNoite;

        if (!lista) {
            return;
        }

        lista.innerHTML = "";

        var ids = rotinas[periodo];

        if (ids.length === 0) {
            var mensagem = document.createElement("p");

            mensagem.className = "mensagem-vazia";

            mensagem.textContent = periodo === "manha"
                ? "Você ainda não adicionou produtos à rotina da manhã."
                : "Você ainda não adicionou produtos à rotina da noite.";

            lista.appendChild(mensagem);

            return;
        }

        ids.forEach(function (id, indice) {
            var produto = buscarProduto(id);

            // Ignora produtos que não existem mais no catálogo.
            if (!produto) {
                return;
            }

            lista.appendChild(
                criarCard(produto, periodo, indice)
            );
        });
    }

    // Adiciona um produto à rotina escolhida
    function adicionarProduto(periodo) {
        var seletor = periodo === "manha"
            ? elementos.seletorManha
            : elementos.seletorNoite;

        if (!seletor || !seletor.value) {
            alert("Selecione um produto antes de adicionar.");
            return;
        }

        var id = seletor.value;

        if (
            rotinas[periodo].some(function (produtoId) {
                return String(produtoId) === String(id);
            })
        ) {
            alert("Esse produto já está na sua rotina.");
            return;
        }

        rotinas[periodo].push(id);

        salvarRotinas();
        renderizarRotina(periodo);

        seletor.value = "";
    }

    // Remove um produto da rotina.
    function removerProduto(periodo, id) {
        rotinas[periodo] = rotinas[periodo].filter(
            function (produtoId) {
                return String(produtoId) !== String(id);
            }
        );

        salvarRotinas();
        renderizarRotina(periodo);
    }

    // Carrega os produtos do arquivo JSON.
    async function carregarProdutos() {
        try {
            var resposta = await fetch(CAMINHO_PRODUTOS);

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o catálogo.");
            }

            var dados = await resposta.json();

            if (!Array.isArray(dados)) {
                throw new Error("O catálogo precisa ser uma lista de produtos.");
            }

            produtos = dados;

            preencherSeletores();

            renderizarRotina("manha");
            renderizarRotina("noite");

        } catch (erro) {
            console.error("Erro ao carregar produtos:", erro);

            if (elementos.listaManha) {
                elementos.listaManha.textContent =
                    "Não foi possível carregar os produtos do catálogo.";
            }

            if (elementos.listaNoite) {
                elementos.listaNoite.textContent =
                    "Não foi possível carregar os produtos do catálogo.";
            }
        }
    }

    // Inicializa a página.
    function iniciar() {
        mostrarTipoPele();

        carregarRotinas();

        if (elementos.botaoManha) {
            elementos.botaoManha.addEventListener("click", function () {
                adicionarProduto("manha");
            });
        }

        if (elementos.botaoNoite) {
            elementos.botaoNoite.addEventListener("click", function () {
                adicionarProduto("noite");
            });
        }

        carregarProdutos();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();