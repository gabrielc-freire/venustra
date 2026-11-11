
const form = document.getElementById("form-comparar");
const saida = document.getElementById("saida");

const campoCategoria = document.getElementById("categoria-comparar");

const seletores = [
    document.getElementById("produto-1"),
    document.getElementById("produto-2"),
    document.getElementById("produto-3")
];

let produtos = [];

/* Formatação de valores */

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarNumero(valor) {
    return valor.toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    });
}

/* Normaliza textos para comparar categorias */

function normalizarTexto(texto) {
    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

/* Carrega os produtos cadastrados no JSON */

async function carregarProdutos() {
    try {
        const resposta = await fetch("../Produtos/Produtos.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível acessar o catálogo.");
        }

        produtos = await resposta.json();

        if (!Array.isArray(produtos)) {
            throw new Error("O arquivo de produtos possui um formato inválido.");
        }

        preencherCategorias();

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        mostrarErro([
            "Não foi possível carregar os produtos do catálogo.",
            "Confira se o arquivo Produtos.json existe e se a página está sendo executada por um servidor local."
        ]);
    }
}

/* Preenche o seletor de categorias */

function preencherCategorias() {
    campoCategoria.replaceChildren();

    adicionarOpcao(
        campoCategoria,
        "",
        "Selecione uma categoria"
    );

    const categorias = [
        ...new Set(
            produtos
                .filter(produto => produto.categoria)
                .map(produto => produto.categoria.trim())
        )
    ];

    categorias.sort((a, b) => a.localeCompare(b, "pt-BR"));

    categorias.forEach(categoria => {
        adicionarOpcao(campoCategoria, categoria, categoria);
    });
}

/* Cria opções dos seletores */

function adicionarOpcao(seletor, valor, texto) {
    const opcao = document.createElement("option");

    opcao.value = valor;
    opcao.textContent = texto;

    seletor.appendChild(opcao);
}

/* Atualiza os produtos disponíveis conforme a categoria */

function atualizarSeletores() {
    const categoriaSelecionada = campoCategoria.value;

    const produtosCategoria = produtos.filter(produto =>
        normalizarTexto(produto.categoria) ===
        normalizarTexto(categoriaSelecionada)
    );

    seletores.forEach((seletor, indice) => {
        const valorAnterior = seletor.value;

        seletor.replaceChildren();

        if (indice === 2) {
            adicionarOpcao(
                seletor,
                "",
                "Nenhum produto selecionado"
            );
        } else {
            adicionarOpcao(
                seletor,
                "",
                "Selecione um produto"
            );
        }

        produtosCategoria.forEach(produto => {
            adicionarOpcao(
                seletor,
                String(produto.id),
                produto.nome
            );
        });

        seletor.disabled = !categoriaSelecionada;

        const produtoAindaExiste = produtosCategoria.some(
            produto => String(produto.id) === valorAnterior
        );

        if (produtoAindaExiste) {
            seletor.value = valorAnterior;
        }
    });

    atualizarProdutosDuplicados();
}

/* Impede selecionar o mesmo produto mais de uma vez */

function atualizarProdutosDuplicados() {
    const selecionados = seletores
        .map(seletor => seletor.value)
        .filter(valor => valor !== "");

    seletores.forEach(seletor => {
        Array.from(seletor.options).forEach(opcao => {
            if (!opcao.value) return;

            opcao.disabled =
                selecionados.includes(opcao.value) &&
                opcao.value !== seletor.value;
        });
    });
}

/* Localiza os produtos selecionados */

function obterProdutosSelecionados() {
    return seletores
        .map(seletor => {
            if (!seletor.value) return null;

            return produtos.find(
                produto => String(produto.id) === seletor.value
            );
        })
        .filter(Boolean);
}

/* Mostra mensagens de erro */

function mostrarErro(mensagens) {
    saida.replaceChildren();
    saida.hidden = false;
    saida.classList.add("saida-erro");

    const resumo = document.createElement("div");
    resumo.className = "resumo";

    const titulo = document.createElement("strong");
    titulo.textContent = "Não foi possível realizar a comparação.";

    const lista = document.createElement("ul");
    lista.className = "lista-erros";

    mensagens.forEach(mensagem => {
        const item = document.createElement("li");
        item.textContent = mensagem;
        lista.appendChild(item);
    });

    resumo.append(titulo, lista);
    saida.appendChild(resumo);
}

/* Limpa o resultado */

function limparResultado() {
    saida.replaceChildren();
    saida.hidden = true;
    saida.classList.remove("saida-erro");
}

/* Calcula o preço proporcional a 100 g ou 100 ml */

function calcularPrecoPor100(produto) {
    return (Number(produto.preco) / Number(produto.quantidade)) * 100;
}

/* Identifica os produtos com menor preço dentro de cada unidade */

function encontrarMelhores(produtosSelecionados) {
    const grupos = {};

    produtosSelecionados.forEach(produto => {
        if (!grupos[produto.unidade]) {
            grupos[produto.unidade] = [];
        }

        grupos[produto.unidade].push(produto);
    });

    const melhores = new Set();

    Object.values(grupos).forEach(grupo => {
        if (grupo.length < 2) return;

        const menorPreco = Math.min(
            ...grupo.map(calcularPrecoPor100)
        );

        grupo.forEach(produto => {
            const diferenca = Math.abs(
                calcularPrecoPor100(produto) - menorPreco
            );

            if (diferenca < 0.000001) {
                melhores.add(String(produto.id));
            }
        });
    });

    return melhores;
}

/* Cria uma célula da tabela */

function criarCelula(linha, texto, tag = "td", classe = "") {
    const celula = document.createElement(tag);

    celula.textContent = texto;

    if (classe) {
        celula.className = classe;
    }

    linha.appendChild(celula);

    return celula;
}

/* Monta a tabela de comparação */

function montarTabela(produtosSelecionados, melhores) {
    const container = document.createElement("div");
    container.className = "tabela-scroll";
    container.tabIndex = 0;
    container.setAttribute(
        "aria-label",
        "Tabela de comparação dos produtos"
    );

    const tabela = document.createElement("table");

    const cabecalho = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");

    criarCelula(linhaCabecalho, "Informação", "th");

    produtosSelecionados.forEach(produto => {
        criarCelula(linhaCabecalho, produto.nome, "th", "");
    });

    cabecalho.appendChild(linhaCabecalho);
    tabela.appendChild(cabecalho);

    const corpo = document.createElement("tbody");

    function adicionarLinha(titulo, valores, destaque = false) {
        const linha = document.createElement("tr");

        if (destaque) {
            linha.classList.add("destaque");
        }

        criarCelula(linha, titulo, "th");

        valores.forEach(valor => {
            criarCelula(linha, valor);
        });

        corpo.appendChild(linha);

        return linha;
    }

    adicionarLinha(
        "Preço",
        produtosSelecionados.map(produto =>
            formatarMoeda(Number(produto.preco))
        )
    );

    adicionarLinha(
        "Quantidade",
        produtosSelecionados.map(produto =>
            `${formatarNumero(Number(produto.quantidade))} ${produto.unidade}`
        )
    );

    adicionarLinha(
        "Preço por 100",
        produtosSelecionados.map(produto => {
            const unidade = produto.unidade === "g" ? "g" : "ml";

            return `${formatarMoeda(calcularPrecoPor100(produto))} / 100 ${unidade}`;
        }),
        true
    );

    adicionarLinha(
        "Tipos de pele indicados",
        produtosSelecionados.map(produto => {
            if (Array.isArray(produto.tiposPele)) {
                return produto.tiposPele.join(", ") || "Não informado";
            }

            return produto.tiposPele || "Não informado";
        })
    );

    adicionarLinha(
        "Não testado em animais",
        produtosSelecionados.map(produto =>
            produto.semTeste === true ? "Sim" :
            produto.semTeste === false ? "Não" :
            "Não informado"
        )
    );

    tabela.appendChild(corpo);
    container.appendChild(tabela);

    /* Destaca os melhores preços */

    const linhaPreco = corpo.querySelectorAll("tr")[2];

    produtosSelecionados.forEach((produto, indice) => {
        if (!melhores.has(String(produto.id))) return;

        const celula = linhaPreco.children[indice + 1];
        celula.classList.add("melhor");

        const selo = document.createElement("span");
        selo.className = "selo";
        selo.textContent = "Menor preço";

        celula.appendChild(selo);
    });

    return container;
}

/* Monta o resumo dos resultados */

function montarResumo(produtosSelecionados, melhores) {
    const resumo = document.createElement("div");
    resumo.className = "resumo";

    const titulo = document.createElement("strong");
    titulo.textContent = "Resultado da comparação";

    resumo.appendChild(titulo);

    const grupos = {};

    produtosSelecionados.forEach(produto => {
        if (!grupos[produto.unidade]) {
            grupos[produto.unidade] = [];
        }

        grupos[produto.unidade].push(produto);
    });

    Object.entries(grupos).forEach(([unidade, grupo]) => {
        const paragrafo = document.createElement("p");

        if (grupo.length < 2) {
            paragrafo.textContent =
                `Não há outro produto em ${unidade} para comparar diretamente.`;

        } else {
            const vencedores = grupo.filter(produto =>
                melhores.has(String(produto.id))
            );

            const nomes = vencedores
                .map(produto => produto.nome)
                .join(" e ");

            if (vencedores.length === 1) {
                paragrafo.textContent =
                    `${nomes} apresenta o menor preço por 100 ${unidade}.`;
            } else {
                paragrafo.textContent =
                    `${nomes} apresentam empate no menor preço por 100 ${unidade}.`;
            }
        }

        resumo.appendChild(paragrafo);
    });

    return resumo;
}

/* Executa a comparação */

form.addEventListener("submit", function(evento) {
    evento.preventDefault();

    limparResultado();

    const mensagens = [];

    if (!campoCategoria.value) {
        mensagens.push("Selecione uma categoria.");
    }

    const selecionados = obterProdutosSelecionados();

    if (selecionados.length < 2) {
        mensagens.push("Selecione pelo menos dois produtos.");
    }

    if (selecionados.some(produto =>
        !Number.isFinite(Number(produto.preco)) ||
        Number(produto.preco) <= 0 ||
        !Number.isFinite(Number(produto.quantidade)) ||
        Number(produto.quantidade) <= 0 ||
        !["g", "ml"].includes(produto.unidade)
    )) {
        mensagens.push(
            "Um ou mais produtos possuem preço, quantidade ou unidade inválidos no catálogo."
        );
    }

    if (selecionados.some(produto =>
        normalizarTexto(produto.categoria) !==
        normalizarTexto(campoCategoria.value)
    )) {
        mensagens.push(
            "Todos os produtos precisam pertencer à mesma categoria."
        );
    }

    if (mensagens.length > 0) {
        mostrarErro(mensagens);
        return;
    }

    const melhores = encontrarMelhores(selecionados);

    const titulo = document.createElement("h3");
    titulo.className = "resultado-titulo";
    titulo.textContent = "Comparação dos produtos";

    const categoria = document.createElement("p");
    categoria.className = "resultado-categoria";
    categoria.textContent =
        `Categoria: ${campoCategoria.value}`;

    const resumo = montarResumo(selecionados, melhores);
    const tabela = montarTabela(selecionados, melhores);

    const nota = document.createElement("p");
    nota.className = "nota";
    nota.textContent =
        "A comparação considera somente o preço proporcional à quantidade. Ela não avalia qualidade, composição, rendimento real ou adequação dermatológica. Produtos em gramas e mililitros não são diretamente comparáveis.";

    saida.replaceChildren(
        titulo,
        categoria,
        resumo,
        tabela,
        nota
    );

    saida.classList.remove("saida-erro");
    saida.hidden = false;
});

/* Atualiza os produtos quando a categoria muda */

campoCategoria.addEventListener("change", function() {
    atualizarSeletores();
    limparResultado();
});

/* Evita produtos repetidos */

seletores.forEach(seletor => {
    seletor.addEventListener("change", function() {
        atualizarProdutosDuplicados();
        limparResultado();
    });
});

/* Limpa a página */

form.addEventListener("reset", function() {
    limparResultado();

    seletores.forEach(seletor => {
        seletor.replaceChildren();

        adicionarOpcao(
            seletor,
            "",
            seletor.id === "produto-3"
                ? "Nenhum produto selecionado"
                : "Selecione a categoria primeiro"
        );

        seletor.disabled = true;
    });
});

/* Inicialização */

carregarProdutos();
