// Minha conta | Venustra
(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var ETAPA_POR_PERIODO = { manha: "Manhã", noite: "Noite" };

    function aviso(id, texto, erro) {
        var el = $(id);
        el.textContent = texto;
        el.className = "msg " + (erro ? "msg-erro" : "msg-ok");
        el.hidden = false;
    }

    function dataBR(s) {
        // "2026-11-08 22:38:28" (UTC) -> dd/mm/aaaa
        var d = new Date(s.replace(" ", "T") + "Z");
        return isNaN(d) ? "" : d.toLocaleDateString("pt-BR");
    }

    function desenharPele(u) {
        var box = $("pele-atual");
        box.textContent = "";
        var tipo = Venustra.TIPOS[u.tipo_pele];
        if (!tipo) {
            var p = document.createElement("p");
            p.className = "vazio";
            p.textContent = "Você ainda não descobriu seu tipo de pele. Responda ao questionário para salvar o resultado aqui e receber uma rotina recomendada.";
            box.appendChild(p);
            $("refazer").hidden = true;
            $("ver-tipo").textContent = "Descobrir meu tipo de pele";
            $("ver-tipo").href = Venustra.RAIZ + "questionarioPI/questionario.html";
            return;
        }
        var linha = document.createElement("div");
        linha.className = "tipo-atual";
        var forte = document.createElement("strong");
        forte.textContent = tipo.nome;
        linha.appendChild(forte);
        if (u.pele_em) {
            var quando = document.createElement("span");
            quando.textContent = "salvo em " + dataBR(u.pele_em);
            linha.appendChild(quando);
        }
        box.appendChild(linha);
        $("refazer").hidden = false;
        $("ver-tipo").textContent = "Ver detalhes do meu tipo";
        $("ver-tipo").href = Venustra.paginaDoTipo(u.tipo_pele);
    }

    // A rotina é montada na página "Minha rotina" e guardada no navegador (ids dos produtos).
    function lerLista(chave) {
        try {
            var v = JSON.parse(localStorage.getItem(chave));
            return Array.isArray(v) ? v : [];
        } catch (e) { return []; }
    }

    function desenharRotina() {
        var box = $("resumo-rotina");
        box.textContent = "";
        var rotina = { manha: lerLista("venustra_rotina_manha"), noite: lerLista("venustra_rotina_noite") };
        if (!rotina.manha.length && !rotina.noite.length) {
            var p = document.createElement("p");
            p.className = "vazio";
            p.textContent = "Você ainda não montou sua rotina. Escolha os produtos que usa de manhã e à noite.";
            box.appendChild(p);
            return;
        }
        // Busca os nomes no catálogo; se não conseguir, mostra os códigos
        fetch(Venustra.RAIZ + "Produtos/Produtos.json")
            .then(function (r) { return r.json(); })
            .catch(function () { return []; })
            .then(function (catalogo) {
                var grade = document.createElement("div");
                grade.className = "resumo-rotina";
                [["manha", "Manhã"], ["noite", "Noite"]].forEach(function (par) {
                    var col = document.createElement("div");
                    var h = document.createElement("h3");
                    h.textContent = par[1];
                    col.appendChild(h);
                    if (!rotina[par[0]].length) {
                        var v = document.createElement("p");
                        v.className = "vazio";
                        v.textContent = "Sem produtos.";
                        col.appendChild(v);
                    } else {
                        var ol = document.createElement("ol");
                        rotina[par[0]].forEach(function (id) {
                            var achado = catalogo.filter(function (x) { return String(x.id) === String(id); })[0];
                            var li = document.createElement("li");
                            li.textContent = achado ? achado.nome + (achado.categoria ? " (" + achado.categoria + ")" : "") : String(id);
                            ol.appendChild(li);
                        });
                        col.appendChild(ol);
                    }
                    grade.appendChild(col);
                });
                box.appendChild(grade);
                box.style.marginBottom = "1rem";
            });
    }

    function preencher(u) {
        $("boas-vindas").textContent = "Olá, " + u.nome.split(" ")[0] + "! Aqui ficam seus dados, seu tipo de pele e sua rotina.";
        $("nome").value = u.nome;
        $("email").value = u.email;
        $("telefone").value = u.telefone || "";
        $("nascimento").value = u.nascimento || "";
        $("observacoes").value = u.observacoes || "";
        desenharPele(u);
    }

    Venustra.eu(true).then(function (d) {
        if (!d) return Venustra.irParaLogin();
        preencher(d.usuario);
        desenharRotina();

        $("form-info").addEventListener("submit", function (e) {
            e.preventDefault();
            Venustra.api("PUT", "/api/perfil", {
                nome: $("nome").value, telefone: $("telefone").value,
                nascimento: $("nascimento").value, observacoes: $("observacoes").value
            }).then(function (r) {
                preencher(r.usuario);
                aviso("msg-info", "Informações salvas.");
            }, function (err) { aviso("msg-info", err.message, true); });
        });

        $("sair").addEventListener("click", function () {
            Venustra.sair().then(function () { location.href = Venustra.RAIZ + "inicioPI/pi_inicio.html"; });
        });

        $("excluir").addEventListener("click", function () {
            if (!confirm("Excluir sua conta, seu tipo de pele e sua rotina? Isso não pode ser desfeito.")) return;
            Venustra.api("DELETE", "/api/conta").then(function () {
                return Venustra.sair(true);
            }).then(function () { location.href = Venustra.RAIZ + "inicioPI/pi_inicio.html"; },
                function (err) { aviso("msg-info", err.message, true); });
        });
    }, function (err) {
        $("boas-vindas").textContent = err.message;
    });
})();
