// Login e cadastro | Venustra
(function () {
    "use strict";

    var abaEntrar = document.getElementById("aba-entrar");
    var abaCriar = document.getElementById("aba-criar");
    var formEntrar = document.getElementById("form-entrar");
    var formCriar = document.getElementById("form-criar");
    var msg = document.getElementById("msg");

    function mostrar(texto, tipo) {
        msg.textContent = texto;
        msg.className = "msg " + (tipo === "ok" ? "msg-ok" : "msg-erro");
        msg.hidden = false;
    }

    function trocarAba(criar) {
        abaEntrar.setAttribute("aria-selected", String(!criar));
        abaCriar.setAttribute("aria-selected", String(criar));
        abaEntrar.tabIndex = criar ? -1 : 0;
        abaCriar.tabIndex = criar ? 0 : -1;
        formEntrar.hidden = criar;
        formCriar.hidden = !criar;
        msg.hidden = true;
    }

    abaEntrar.addEventListener("click", function () { trocarAba(false); });
    abaCriar.addEventListener("click", function () { trocarAba(true); });
    [abaEntrar, abaCriar].forEach(function (aba) {
        aba.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                var criar = aba === abaEntrar;
                trocarAba(criar);
                (criar ? abaCriar : abaEntrar).focus();
            }
        });
    });
    if (location.hash === "#criar") trocarAba(true);

    // Para onde voltar depois de entrar (só endereços do próprio site)
    function destino() {
        var v = new URLSearchParams(location.search).get("voltar");
        try {
            if (v && new URL(v).origin === location.origin && v.indexOf("/login/") === -1) return v;
        } catch (e) {}
        return "../perfil/perfil.html";
    }

    function enviar(form, acao) {
        var botao = form.querySelector("button[type=submit]");
        var texto = botao.textContent;
        botao.disabled = true;
        botao.textContent = "Aguarde...";
        msg.hidden = true;
        acao().then(function () {
            mostrar("Pronto! Levando você para o site...", "ok");
            location.href = destino();
        }, function (e) {
            mostrar(e.message, "erro");
            botao.disabled = false;
            botao.textContent = texto;
        });
    }

    formEntrar.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = document.getElementById("entrar-email").value.trim();
        var senha = document.getElementById("entrar-senha").value;
        if (!email || !senha) return mostrar("Preencha e-mail e senha.", "erro");
        enviar(formEntrar, function () { return Venustra.entrar(email, senha); });
    });

    formCriar.addEventListener("submit", function (e) {
        e.preventDefault();
        var nome = document.getElementById("criar-nome").value.trim();
        var email = document.getElementById("criar-email").value.trim();
        var senha = document.getElementById("criar-senha").value;
        var senha2 = document.getElementById("criar-senha2").value;
        if (nome.length < 2) return mostrar("Informe seu nome.", "erro");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return mostrar("Informe um e-mail válido.", "erro");
        if (senha.length < 6) return mostrar("A senha precisa ter pelo menos 6 caracteres.", "erro");
        if (senha !== senha2) return mostrar("As senhas não são iguais.", "erro");
        enviar(formCriar, function () { return Venustra.criarConta(nome, email, senha); });
    });

    // Já está logada? Vai direto para a conta.
    Venustra.eu().then(function (d) { if (d) location.replace(destino()); }, function () {});
})();
