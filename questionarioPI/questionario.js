/*
 * Questionário de tipo de pele | Venustra
 *
 * Como funciona:
 *  - As perguntas 1, 2, 3, 4, 5 e 7 "votam" em um tipo de pele
 *    (oleosa, seca, mista ou normal), pelo atributo value de cada opção.
 *  - A pergunta 6 mede a sensibilidade: quem responde
 *    "Sim, com frequência" vai direto para o resultado de pele sensível.
 *  - Nos demais casos vence o tipo com mais votos.
 *  - Em caso de empate vale a resposta da pergunta 1 (como a pele fica
 *    após lavar o rosto), se ela estiver entre os empatados; senão, a
 *    ordem de DESEMPATE abaixo.
 */
(function () {
    "use strict";

    var TOTAL_PERGUNTAS = 7;
    var PERGUNTA_SENSIBILIDADE = 6;
    var PERGUNTA_DESEMPATE = 1;
    var ORDEM_DESEMPATE = ["mista", "oleosa", "seca", "normal"];

    // Caminhos relativos a questionario.html
    var PAGINAS = {
        oleosa: "tiposPeles/peleOleosa.html",
        seca: "tiposPeles/peleSeca.html",
        mista: "tiposPeles/peleMista.html",
        normal: "tiposPeles/peleNormal.html",
        sensivel: "tiposPeles/peleSensivel.html"
    };

    /**
     * respostas: objeto { 1: "oleosa", 2: "seca", ..., 6: "nunca", ... }
     * Retorna: "oleosa" | "seca" | "mista" | "normal" | "sensivel"
     */
    function calcularTipo(respostas) {
        if (respostas[PERGUNTA_SENSIBILIDADE] === "frequente") {
            return "sensivel";
        }

        var votos = { oleosa: 0, seca: 0, mista: 0, normal: 0 };
        for (var n = 1; n <= TOTAL_PERGUNTAS; n++) {
            if (n === PERGUNTA_SENSIBILIDADE) continue;
            if (votos.hasOwnProperty(respostas[n])) {
                votos[respostas[n]]++;
            }
        }

        var maior = Math.max(votos.oleosa, votos.seca, votos.mista, votos.normal);
        var empatados = ORDEM_DESEMPATE.filter(function (tipo) {
            return votos[tipo] === maior;
        });

        if (empatados.length === 1) return empatados[0];

        var respostaChave = respostas[PERGUNTA_DESEMPATE];
        if (empatados.indexOf(respostaChave) !== -1) return respostaChave;

        return empatados[0];
    }

    function iniciar() {
        var form = document.getElementById("form-questionario");
        var erro = document.getElementById("erro-questionario");
        if (!form) return;

        function lerRespostas() {
            var respostas = {};
            var faltando = [];
            for (var n = 1; n <= TOTAL_PERGUNTAS; n++) {
                var marcada = form.querySelector('input[name="pergunta' + n + '"]:checked');
                if (marcada) {
                    respostas[n] = marcada.value;
                } else {
                    faltando.push(n);
                }
            }
            return { respostas: respostas, faltando: faltando };
        }

        function limparMarcacoes() {
            var marcadas = form.querySelectorAll(".pergunta.sem-resposta");
            for (var i = 0; i < marcadas.length; i++) {
                marcadas[i].classList.remove("sem-resposta");
            }
            erro.hidden = true;
            erro.textContent = "";
        }

        // Ao responder uma pergunta, tira o destaque de erro dela
        form.addEventListener("change", function (evento) {
            var pergunta = evento.target.closest(".pergunta");
            if (pergunta) pergunta.classList.remove("sem-resposta");
            if (!form.querySelector(".pergunta.sem-resposta")) {
                erro.hidden = true;
                erro.textContent = "";
            }
        });

        form.addEventListener("submit", function (evento) {
            evento.preventDefault();
            limparMarcacoes();

            var lido = lerRespostas();

            if (lido.faltando.length > 0) {
                lido.faltando.forEach(function (n) {
                    document.getElementById("pergunta-" + n).classList.add("sem-resposta");
                });

                erro.textContent = lido.faltando.length === 1
                    ? "Falta responder a pergunta " + lido.faltando[0] + "."
                    : "Faltam responder as perguntas: " + lido.faltando.join(", ") + ".";
                erro.hidden = false;

                var primeira = document.getElementById("pergunta-" + lido.faltando[0]);
                primeira.scrollIntoView({ behavior: "smooth", block: "center" });
                var radio = primeira.querySelector('input[type="radio"]');
                if (radio) radio.focus({ preventScroll: true });
                return;
            }

            window.location.href = PAGINAS[calcularTipo(lido.respostas)];
        });
    }

    // Permite testar a lógica isoladamente (não afeta o site)
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { calcularTipo: calcularTipo };
    }

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", iniciar);
        } else {
            iniciar();
        }
    }
})();
