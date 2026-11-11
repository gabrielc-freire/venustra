/*
 * Venustra | contas, tipo de pele e rotina SEM banco de dados.
 * Tudo fica guardado no navegador (localStorage), então funciona também no GitHub Pages.
 *
 * Carregue em qualquer página:  <script src="../js/venustra.js"></script>
 * Também troca o item "Entrar" do menu por "Olá, [nome]" quando a pessoa está logada.
 *
 * O que fica no localStorage:
 *   venustra_contas        lista de contas (cada uma com seu tipo de pele e sua rotina)
 *   venustra_sessao        id da conta que está logada
 *   venustra_pele_pendente resultado do questionário feito antes de entrar na conta
 */
(function () {
    "use strict";

    var script = document.currentScript;
    var RAIZ = script.src.replace(/js\/venustra\.js.*$/, "");
    var K_CONTAS = "venustra_contas";
    var K_SESSAO = "venustra_sessao";
    var K_PENDENTE = "venustra_pele_pendente";
    var ETAPAS = ["Limpeza", "Tratamento", "Hidratação", "Protetor Solar", "Outro"];

    var TIPOS = {
        oleosa: { nome: "Pele oleosa", pagina: "peleOleosa.html" },
        seca: { nome: "Pele seca", pagina: "peleSeca.html" },
        mista: { nome: "Pele mista", pagina: "peleMista.html" },
        normal: { nome: "Pele normal", pagina: "peleNormal.html" },
        sensivel: { nome: "Pele sensível", pagina: "peleSensivel.html" }
    };

    // ------------------------------------------------------------------
    // Rotinas recomendadas por tipo de pele: [etapa, produto recomendado, dica]
    // Baseadas nas páginas de resultado do questionário. Para mudar uma
    // recomendação, edite só esta tabela.
    // ------------------------------------------------------------------
    var ROTINAS = {
        oleosa: {
            manha: [
                ["Limpeza", "Sabonete facial suave, em gel ou espuma", "Evite lavar o rosto mais de 2 ou 3 vezes ao dia."],
                ["Hidratação", "Hidratante leve, em gel ou \"oil free\"", "Pele oleosa também precisa hidratar. Procure glicerina e ácido hialurônico."],
                ["Protetor Solar", "Protetor solar FPS 30 ou mais, de toque seco ou \"oil free\"", ""]
            ],
            noite: [
                ["Limpeza", "Sabonete facial suave, em gel ou espuma", "Lave de novo para tirar protetor, maquiagem e poluição."],
                ["Tratamento", "Opcional: ativo para oleosidade e cravos", "Procure niacinamida ou ácido salicílico, poucas vezes por semana no começo."],
                ["Hidratação", "Hidratante leve em gel", ""]
            ]
        },
        seca: {
            manha: [
                ["Limpeza", "Água ou sabonete facial bem suave, de textura cremosa", "Evite água muito quente e sabonetes que deixam a pele repuxando."],
                ["Hidratação", "Hidratante com ativos que retêm água", "Procure ureia, glicerina, ácido hialurônico ou ceramidas. Aplique com a pele ainda levemente úmida."],
                ["Protetor Solar", "Protetor solar FPS 30 ou mais, de preferência hidratante", ""]
            ],
            noite: [
                ["Limpeza", "Sabonete facial suave", "Lave sem esfregar."],
                ["Hidratação", "Hidratante mais rico (creme)", "Procure ceramidas e manteiga de karité. Nas áreas muito ressecadas, passe uma camada fina extra."]
            ]
        },
        mista: {
            manha: [
                ["Limpeza", "Sabonete facial suave, que limpe sem ressecar", ""],
                ["Hidratação", "Hidratante leve, em gel ou gel-creme, no rosto todo", "Procure glicerina, ácido hialurônico ou niacinamida."],
                ["Protetor Solar", "Protetor solar FPS 30 ou mais, de toque seco", ""]
            ],
            noite: [
                ["Limpeza", "Sabonete facial suave", "Lave para remover protetor e sujeira do dia."],
                ["Tratamento", "Se precisar, ativo para oleosidade só na zona T", "Ácido salicílico, usado apenas na zona T (testa, nariz e queixo)."],
                ["Hidratação", "Hidratante leve", "Nas bochechas secas, uma camada um pouco maior."]
            ]
        },
        normal: {
            manha: [
                ["Limpeza", "Sabonete facial suave", ""],
                ["Tratamento", "Opcional: antioxidante, como vitamina C", ""],
                ["Hidratação", "Hidratante de textura leve", "Procure glicerina e ácido hialurônico."],
                ["Protetor Solar", "Protetor solar FPS 30 ou mais", "Use até em dias nublados."]
            ],
            noite: [
                ["Limpeza", "Sabonete facial suave", "Limpe para remover protetor e sujeira."],
                ["Hidratação", "Hidratante leve", ""]
            ]
        },
        sensivel: {
            manha: [
                ["Limpeza", "Água ou sabonete facial muito suave, sem fragrância", ""],
                ["Hidratação", "Hidratante simples, sem perfume", "Procure glicerina, pantenol, alantoína ou aveia coloidal."],
                ["Protetor Solar", "Protetor solar FPS 30 ou mais, sem fragrância", "Aplique com cuidado."]
            ],
            noite: [
                ["Limpeza", "Limpeza suave, com água morna ou fria", "Sem esfregar."],
                ["Hidratação", "Hidratante calmante, sem perfume", "Procure ceramidas e aveia coloidal. Introduza qualquer produto novo sozinho, um de cada vez."]
            ]
        }
    };

    function gerarRotina(tipo) {
        var itens = [];
        var modelo = ROTINAS[tipo];
        if (!modelo) return itens;
        ["manha", "noite"].forEach(function (periodo) {
            modelo[periodo].forEach(function (e) {
                itens.push({ periodo: periodo, etapa: e[0], recomendado: e[1], dica: e[2], produto: "", marca: "", preco: "" });
            });
        });
        return itens;
    }

    // ---------------- localStorage ----------------
    function ler(chave, padrao) {
        try {
            var v = localStorage.getItem(chave);
            return v === null ? padrao : JSON.parse(v);
        } catch (e) { return padrao; }
    }
    function gravar(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)); }
        catch (e) { throw erro("Seu navegador bloqueou o armazenamento. Libere os dados do site para usar a conta.", 500); }
    }
    function remover(chave) { try { localStorage.removeItem(chave); } catch (e) {} }

    function erro(msg, status) {
        var e = new Error(msg);
        e.status = status || 400;
        return e;
    }
    var cortar = function (v, n) { return String(v == null ? "" : v).trim().slice(0, n); };
    function agora() { return new Date().toISOString().slice(0, 19).replace("T", " "); }

    // ---------------- Senha (nunca guardada em texto) ----------------
    function sorteio() {
        var b = new Uint8Array(16);
        if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(b);
        else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
        return Array.prototype.map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    }
    function hashSenha(senha, sal) {
        if (window.crypto && crypto.subtle && window.TextEncoder) {
            var enc = new TextEncoder();
            return crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]).then(function (k) {
                return crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(sal), iterations: 100000, hash: "SHA-256" }, k, 256);
            }).then(function (buf) {
                return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
            });
        }
        // Navegador sem Web Crypto: hash simples (só para demonstração)
        var h = 5381, t = sal + senha;
        for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
        return Promise.resolve("s" + h);
    }

    // ---------------- Contas ----------------
    function contas() { return ler(K_CONTAS, []); }

    function contaAtual() {
        var id = Number(ler(K_SESSAO, 0));
        if (!id) return null;
        return contas().filter(function (c) { return c.id === id; })[0] || null;
    }

    // Aplica uma alteração na conta logada e grava
    function alterar(fn) {
        var lista = contas(), id = Number(ler(K_SESSAO, 0));
        var c = lista.filter(function (x) { return x.id === id; })[0];
        if (!c) throw erro("Entre na sua conta para continuar.", 401);
        fn(c);
        gravar(K_CONTAS, lista);
        return c;
    }

    function publico(c) {
        return {
            id: c.id, nome: c.nome, email: c.email, telefone: c.telefone, nascimento: c.nascimento,
            observacoes: c.observacoes, tipo_pele: c.tipo_pele, respostas: c.respostas,
            pele_em: c.pele_em, criado_em: c.criado_em
        };
    }

    function criarConta(nome, email, senha) {
        nome = cortar(nome, 80); email = cortar(email, 120).toLowerCase(); senha = String(senha || "");
        if (nome.length < 2) return Promise.reject(erro("Informe seu nome."));
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Promise.reject(erro("Informe um e-mail válido."));
        if (senha.length < 6) return Promise.reject(erro("A senha precisa ter pelo menos 6 caracteres."));
        var lista = contas();
        if (lista.some(function (c) { return c.email === email; })) return Promise.reject(erro("Já existe uma conta com esse e-mail.", 409));
        var sal = sorteio();
        return hashSenha(senha, sal).then(function (hash) {
            var id = lista.reduce(function (m, c) { return Math.max(m, c.id); }, 0) + 1;
            var c = {
                id: id, nome: nome, email: email, senha_hash: hash, senha_sal: sal,
                telefone: "", nascimento: "", observacoes: "",
                tipo_pele: "", respostas: null, pele_em: "", criado_em: agora(), rotina: []
            };
            lista.push(c);
            gravar(K_CONTAS, lista);
            gravar(K_SESSAO, id);
            return c;
        });
    }

    function entrar(email, senha) {
        email = cortar(email, 120).toLowerCase();
        var c = contas().filter(function (x) { return x.email === email; })[0];
        if (!c) return Promise.reject(erro("E-mail ou senha incorretos.", 401));
        return hashSenha(String(senha || ""), c.senha_sal).then(function (hash) {
            if (hash !== c.senha_hash) throw erro("E-mail ou senha incorretos.", 401);
            gravar(K_SESSAO, c.id);
            return c;
        });
    }

    function sair() { remover(K_SESSAO); return Promise.resolve(); }

    // ---------------- "API" local (mesmo formato usado pelas páginas) ----------------
    function api(metodo, rota, corpo) {
        return new Promise(function (ok) {
            var b = corpo || {}, r = metodo + " " + rota;

            if (r === "PUT /api/perfil") {
                var nome = cortar(b.nome, 80), nasc = cortar(b.nascimento, 10);
                if (nome.length < 2) throw erro("Informe seu nome.");
                if (nasc && !/^\d{4}-\d{2}-\d{2}$/.test(nasc)) throw erro("Data de nascimento inválida.");
                var c = alterar(function (c) {
                    c.nome = nome; c.telefone = cortar(b.telefone, 20);
                    c.nascimento = nasc; c.observacoes = cortar(b.observacoes, 500);
                });
                return ok({ usuario: publico(c) });
            }

            if (r === "PUT /api/rotina") {
                if (!Array.isArray(b.itens) || b.itens.length > 40) throw erro("Rotina inválida.");
                var itens = b.itens.map(function (i) {
                    if (i.periodo !== "manha" && i.periodo !== "noite") throw erro("Período inválido.");
                    return {
                        periodo: i.periodo, etapa: ETAPAS.indexOf(i.etapa) !== -1 ? i.etapa : "Outro",
                        recomendado: cortar(i.recomendado, 150), dica: cortar(i.dica, 250),
                        produto: cortar(i.produto, 80), marca: cortar(i.marca, 60), preco: cortar(i.preco, 20)
                    };
                });
                alterar(function (c) { c.rotina = itens; });
                return ok({ rotina: itens });
            }

            if (r === "POST /api/rotina/recomendada") {
                var rot;
                alterar(function (c) {
                    if (!TIPOS[c.tipo_pele]) throw erro("Faça o questionário para gerar sua rotina.");
                    rot = c.rotina = gerarRotina(c.tipo_pele);
                });
                return ok({ rotina: rot });
            }

            if (r === "DELETE /api/conta") {
                var id = Number(ler(K_SESSAO, 0));
                gravar(K_CONTAS, contas().filter(function (c) { return c.id !== id; }));
                remover(K_SESSAO);
                return ok({ ok: true });
            }

            throw erro("Rota não encontrada.", 404);
        });
    }

    // Dados da pessoa logada ({usuario, rotina}) ou null
    function eu() {
        var c = contaAtual();
        return Promise.resolve(c ? { usuario: publico(c), rotina: c.rotina || [] } : null);
    }

    // Guarda o tipo de pele e gera a rotina recomendada.
    // Sem login, deixa pendente e conclui depois que a pessoa entrar.
    function salvarPele(tipo, respostas) {
        if (!TIPOS[tipo]) return Promise.resolve(false);
        if (!contaAtual()) {
            gravar(K_PENDENTE, { tipo: tipo, respostas: respostas });
            return Promise.resolve(false);
        }
        try {
            alterar(function (c) {
                var mudou = c.tipo_pele !== tipo;
                c.tipo_pele = tipo;
                c.respostas = respostas || null;
                c.pele_em = agora();
                // Mesmo tipo de pele: mantém a rotina que ela já editou
                if (mudou || !c.rotina || !c.rotina.length) c.rotina = gerarRotina(tipo);
            });
            return Promise.resolve(true);
        } catch (e) { return Promise.resolve(false); }
    }

    function aplicarPendente() {
        var p = ler(K_PENDENTE, null);
        if (!p || !p.tipo) return Promise.resolve(false);
        remover(K_PENDENTE);
        return salvarPele(p.tipo, p.respostas);
    }

    function entrarEAplicar(promessa) {
        return promessa.then(function (c) {
            return aplicarPendente().then(function () { return publico(c); });
        });
    }

    function paginaDoTipo(tipo) {
        return TIPOS[tipo] ? RAIZ + "questionarioPI/tiposPeles/" + TIPOS[tipo].pagina : RAIZ + "questionarioPI/questionario.html";
    }

    function irParaLogin() {
        location.href = RAIZ + "login/login.html?voltar=" + encodeURIComponent(location.href);
    }

    // ----- Menu: botão "Entrar" / "Olá, nome" (canto direito do cabeçalho) -----
    function menu() {
        var area = document.querySelector("#menuVenustra .menu-conta");
        if (!area) return;
        var a = document.createElement("a");
        a.className = "botao-conta";
        a.href = RAIZ + "login/login.html?voltar=" + encodeURIComponent(location.href);
        a.textContent = "Entrar";
        area.appendChild(a);
        eu().then(function (d) {
            if (!d) return;
            a.href = RAIZ + "perfil/perfil.html";
            a.textContent = "Olá, " + d.usuario.nome.split(" ")[0];
            if (location.pathname.indexOf("/perfil/") !== -1) a.setAttribute("aria-current", "page");
        });
    }

    // ----- Páginas de resultado do questionário: avisa o que foi salvo -----
    function avisoResultado() {
        var acoes = document.querySelector("body.tipo-pele .acoes");
        if (!acoes) return;
        var p = document.createElement("p");
        p.className = "aviso-conta";
        acoes.parentNode.insertBefore(p, acoes);
        var voltar = encodeURIComponent(location.href);
        eu().then(function (d) {
            if (d) {
                p.innerHTML = "Resultado salvo na sua conta. Agora você pode " +
                    "<a href=\"" + RAIZ + "RotinaPI/rotina.html\">montar sua rotina</a>.";
            } else {
                p.innerHTML = "Quer guardar este resultado na sua conta? " +
                    "<a href=\"" + RAIZ + "login/login.html?voltar=" + voltar + "#criar\">Crie sua conta</a> ou " +
                    "<a href=\"" + RAIZ + "login/login.html?voltar=" + voltar + "\">entre</a>.";
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () { menu(); avisoResultado(); });

    window.Venustra = {
        RAIZ: RAIZ, TIPOS: TIPOS, api: api, eu: eu, sair: sair, salvarPele: salvarPele,
        entrar: function (email, senha) { return entrarEAplicar(entrar(email, senha)); },
        criarConta: function (nome, email, senha) { return entrarEAplicar(criarConta(nome, email, senha)); },
        paginaDoTipo: paginaDoTipo, irParaLogin: irParaLogin
    };
})();
