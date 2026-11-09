
/*
 * Questionário de tipo de pele | Venustra
 *
 * São 4 perguntas.
 * Cada resposta contabiliza um voto para um tipo de pele.
 * O tipo com mais votos será o resultado.
 *
 * Em caso de empate:
 * 1. A resposta da primeira pergunta será priorizada.
 * 2. Se ela não resolver o empate, será utilizada
 *    a ordem definida em ORDEM_DESEMPATE.
 */

(function () {
    "use strict";

    var TOTAL_PERGUNTAS = 4;
    var PERGUNTA_DESEMPATE = 1;

    var ORDEM_DESEMPATE = ["mista", "oleosa", "seca", "normal"];

    // Caminhos relativos ao questionario.html
    var PAGINAS = {
        oleosa: "tiposPeles/peleOleosa.html",
        seca: "tiposPeles/peleSeca.html",
        mista: "tiposPeles/peleMista.html",
        normal: "tiposPeles/peleNormal.html"
    };

    /*
     * Calcula qual tipo de pele recebeu mais votos.
     */
    function calcularTipo(respostas) {
        var votos = {
            oleosa: 0,
            seca: 0,
            mista: 0,
            normal: 0
        };

        for (var n = 1; n <= TOTAL_PERGUNTAS; n++) {
            if (Object.prototype.hasOwnProperty.call(votos, respostas[n])) {
                votos[respostas[n]]++;
            }
        }

        var maior = Math.max(
            votos.oleosa,
            votos.seca,
            votos.mista,
            votos.normal
        );

        var empatados = ORDEM_DESEMPATE.filter(function (tipo) {
            return votos[tipo] === maior;
        });

        // Se não houver empate, retorna o vencedor
        if (empatados.length === 1) {
            return empatados[0];
        }

        // Tenta desempatar usando a primeira resposta
        var respostaChave = respostas[PERGUNTA_DESEMPATE];

        if (empatados.indexOf(respostaChave) !== -1) {
            return respostaChave;
        }

        // Desempate final pela ordem definida
        return empatados[0];
    }

    /*
     * Inicializa os eventos do formulário.
     */
    function iniciar() {
        var form = document.getElementById("form-questionario");
        var erro = document.getElementById("erro-questionario");

        if (!form || !erro) {
            return;
        }

        /*
         * Lê as respostas selecionadas.
         */
        function lerRespostas() {
            var respostas = {};
            var faltando = [];

            for (var n = 1; n <= TOTAL_PERGUNTAS; n++) {
                var marcada = form.querySelector(
                    'input[name="pergunta' + n + '"]:checked'
                );

                if (marcada) {
                    respostas[n] = marcada.value;
                } else {
                    faltando.push(n);
                }
            }

            return {
                respostas: respostas,
                faltando: faltando
            };
        }

        /*
         * Remove os avisos de perguntas incompletas.
         */
        function limparMarcacoes() {
            var marcadas = form.querySelectorAll(
                ".pergunta.sem-resposta"
            );

            for (var i = 0; i < marcadas.length; i++) {
                marcadas[i].classList.remove("sem-resposta");
            }

            erro.hidden = true;
            erro.textContent = "";
        }

        /*
         * Remove o destaque de erro quando uma pergunta
         * é respondida.
         */
        form.addEventListener("change", function (evento) {
            if (!evento.target.matches('input[type="radio"]')) {
                return;
            }

            var pergunta = evento.target.closest(".pergunta");

            if (pergunta) {
                pergunta.classList.remove("sem-resposta");
            }

            if (!form.querySelector(".pergunta.sem-resposta")) {
                erro.hidden = true;
                erro.textContent = "";
            }
        });

        /*
         * Evento de envio do formulário.
         */
        form.addEventListener("submit", function (evento) {
            evento.preventDefault();

            limparMarcacoes();

            var lido = lerRespostas();

            // Verifica se existem perguntas sem resposta
            if (lido.faltando.length > 0) {

                lido.faltando.forEach(function (n) {
                    var pergunta = document.getElementById(
                        "pergunta-" + n
                    );

                    if (pergunta) {
                        pergunta.classList.add("sem-resposta");
                    }
                });

                // Exibe a mensagem de erro
                erro.textContent = lido.faltando.length === 1
                    ? "Falta responder a pergunta " +
                      lido.faltando[0] + "."
                    : "Faltam responder as perguntas: " +
                      lido.faltando.join(", ") + ".";

                erro.hidden = false;

                // Leva o usuário até a primeira pergunta pendente
                var primeira = document.getElementById(
                    "pergunta-" + lido.faltando[0]
                );

                if (primeira) {
                    primeira.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                    var radio = primeira.querySelector(
                        'input[type="radio"]'
                    );

                    if (radio) {
                        radio.focus({ preventScroll: true });
                    }
                }

                return;
            }

            // Calcula o tipo de pele
            var tipo = calcularTipo(lido.respostas);

            // Salva o resultado no navegador
            localStorage.setItem("venustra_tipo_pele", tipo);

            // Redireciona para a página correspondente
            window.location.href = PAGINAS[tipo];
        });
    }

    // Permite testar a função de cálculo isoladamente
    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            calcularTipo: calcularTipo
        };
    }

    // Inicializa o formulário
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", iniciar);
        } else {
            iniciar();
        }
    }

})();
