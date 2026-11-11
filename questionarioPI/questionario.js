
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

        // ---- Uma pergunta por tela (sem JavaScript, todas aparecem juntas) ----
        var perguntas = form.querySelectorAll(".pergunta");
        var atual = 0;
        var botaoVoltar = document.getElementById("botao-voltar");
        var botaoContinuar = document.getElementById("botao-continuar");
        var botaoEnviar = document.getElementById("botao-enviar");
        var progresso = document.getElementById("progresso");
        var progressoTexto = document.getElementById("progresso-texto");
        var progressoCheia = document.getElementById("progresso-cheia");

        function respondida(n) {
            return !!form.querySelector('input[name="pergunta' + (n + 1) + '"]:checked');
        }

        function mostrar(n, focar) {
            atual = n;
            for (var i = 0; i < perguntas.length; i++) {
                perguntas[i].classList.toggle("ativa", i === n);
            }
            var ultima = n === perguntas.length - 1;
            progressoTexto.textContent = "Pergunta " + (n + 1) + " de " + perguntas.length;
            progressoCheia.style.width = ((n + 1) / perguntas.length * 100) + "%";
            botaoVoltar.hidden = n === 0;
            botaoContinuar.hidden = ultima;
            botaoEnviar.hidden = !ultima;
            botaoContinuar.disabled = !respondida(n);
            botaoEnviar.disabled = !respondida(n);
            if (focar) {
                var titulo = perguntas[n].querySelector("legend");
                titulo.setAttribute("tabindex", "-1");
                titulo.focus({ preventScroll: true });
            }
        }

        function avancar() {
            if (!respondida(atual) || atual >= perguntas.length - 1) return;
            mostrar(atual + 1, true);
        }

        form.classList.add("passo-a-passo");
        progresso.hidden = false;
        mostrar(0, false);

        botaoVoltar.addEventListener("click", function () { if (atual > 0) mostrar(atual - 1, true); });
        botaoContinuar.addEventListener("click", avancar);

        // Responder libera o botão. Com mouse ou toque já passa para a próxima;
        // com teclado (setas) quem usa decide quando clicar em Continuar.
        form.addEventListener("change", function () {
            botaoContinuar.disabled = !respondida(atual);
            botaoEnviar.disabled = !respondida(atual);
        });
        form.addEventListener("click", function (evento) {
            var alvo = evento.target;
            var ehOpcao = alvo.matches('input[type="radio"]') || alvo.closest("label");
            if (ehOpcao && evento.detail > 0 && atual < perguntas.length - 1) {
                setTimeout(avancar, 220);
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
            var ir = function () { window.location.href = PAGINAS[tipo]; };

            // Guarda o tipo de pele na conta (ou deixa pendente se ainda não entrou)
            if (window.Venustra) {
                window.Venustra.salvarPele(tipo, lido.respostas).then(ir, ir);
            } else {
                ir();
            }
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
