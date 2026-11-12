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
        if (u.preocupacoes && u.preocupacoes.length) {
            var foco = document.createElement("p");
            foco.className = "vazio";
            foco.textContent = "Queixas informadas: " + Venustra.listaEmTexto(u.preocupacoes) + ".";
            box.appendChild(foco);
        }
        $("refazer").hidden = false;
        $("ver-tipo").textContent = "Ver detalhes do meu tipo";
        $("ver-tipo").href = Venustra.paginaDoTipo(u.tipo_pele);
    }

    // A rotina fica guardada na conta: itens com o id do produto (ou só a recomendação, se não houver produto)
    function desenharRotina(rotina) {
        var box = $("resumo-rotina");
        box.textContent = "";
        rotina = Array.isArray(rotina) ? rotina : [];
        if (!rotina.length) {
            var p = document.createElement("p");
            p.className = "vazio";
            p.textContent = Venustra.TIPOS[(box.dataset.tipo || "")]
                ? "Sua rotina está vazia. Abra \"Minha rotina\" para refazer a recomendada ou escolher produtos."
                : "Você ainda não tem rotina. Responda ao questionário para receber uma rotina recomendada.";
            box.appendChild(p);
            return;
        }
        // Busca os nomes no catálogo; se não conseguir, mostra a recomendação em texto
        Venustra.catalogo().then(function (catalogo) {
            var grade = document.createElement("div");
            grade.className = "resumo-rotina";
            [["manha", "Manhã"], ["noite", "Noite"]].forEach(function (par) {
                var col = document.createElement("div");
                var h = document.createElement("h3");
                h.textContent = par[1];
                col.appendChild(h);
                var doPeriodo = rotina.filter(function (i) { return i.periodo === par[0]; });
                if (!doPeriodo.length) {
                    var v = document.createElement("p");
                    v.className = "vazio";
                    v.textContent = "Sem produtos.";
                    col.appendChild(v);
                } else {
                    var ol = document.createElement("ol");
                    doPeriodo.forEach(function (item) {
                        var achado = catalogo.filter(function (x) { return String(x.id) === String(item.produtoId); })[0];
                        var li = document.createElement("li");
                        li.textContent = achado
                            ? achado.nome + " (" + item.etapa + ")"
                            : item.etapa + (item.recomendado ? ": " + item.recomendado : "");
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
        $("resumo-rotina").dataset.tipo = d.usuario.tipo_pele || "";
        desenharRotina(d.rotina);

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
