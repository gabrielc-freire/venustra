// ========================================
// CARROSSEL DA PÁGINA INICIAL
// ========================================

const trilho = document.querySelector('.carrossel-trilho');
const btnEsq = document.querySelector('.seta-esq');
const btnDir = document.querySelector('.seta-dir');

if (trilho) {
  let slides = [...trilho.querySelectorAll('.slide')];

  const MINIMO = 6;
  const originais = [...slides];

  // Evita duplicações desnecessárias e problemas com carrossel vazio.
  while (slides.length > 0 && slides.length < MINIMO) {
    originais.forEach((original) => {
      if (slides.length >= MINIMO) return;

      const copia = original.cloneNode(true);

      // Remove IDs duplicados da cópia.
      copia.removeAttribute('id');
      copia.querySelectorAll('[id]').forEach((elemento) => {
        elemento.removeAttribute('id');
      });

      // Identifica a cópia como conteúdo repetido.
      copia.setAttribute('aria-hidden', 'true');

      // Evita que elementos internos recebam foco pelo teclado.
      copia.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]'
      ).forEach((elemento) => {
        elemento.setAttribute('tabindex', '-1');
      });

      trilho.appendChild(copia);
      slides.push(copia);
    });
  }

  const total = slides.length;
  let atual = 0;

  function distancia(i) {
    let d = (i - atual) % total;

    if (d < 0) {
      d += total;
    }

    if (d > total / 2) {
      d -= total;
    }

    return d;
  }

  function mostrar(indice) {
    if (total === 0) return;

    atual = ((indice % total) + total) % total;

    slides.forEach((slide, i) => {
      const d = distancia(i);

      slide.style.setProperty('--pos', d);

      slide.classList.toggle('ativo', d === 0);
      slide.classList.toggle('antes', d === -1);
      slide.classList.toggle('depois', d === 1);
    });
  }

  // Navegação pelas setas.
  if (btnDir) {
    btnDir.addEventListener('click', () => {
      mostrar(atual + 1);
    });
  }

  if (btnEsq) {
    btnEsq.addEventListener('click', () => {
      mostrar(atual - 1);
    });
  }

  // Navegação ao clicar nos slides.
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      mostrar(i);
    });
  });

  mostrar(0);
}


// ========================================
// NOTIFICAÇÃO DE ENVIO
// ========================================

const botaoEnvio = document.querySelector('.botao-envio');
const overlay = document.getElementById('overlayNotificacao');
const botaoFechar = document.getElementById('fecharNotificacao');

function abrirNotificacao() {
  if (!overlay) return;

  overlay.classList.add('ativo');
  overlay.setAttribute('aria-hidden', 'false');

  if (botaoFechar) {
    botaoFechar.focus();
  }
}

function fecharNotificacao() {
  if (!overlay) return;

  overlay.classList.remove('ativo');
  overlay.setAttribute('aria-hidden', 'true');

  if (botaoEnvio) {
    botaoEnvio.focus();
  }
}

// Verifica se o botão de envio existe.
if (botaoEnvio) {
  botaoEnvio.addEventListener('click', (e) => {
    e.preventDefault();
    abrirNotificacao();
  });
}

// Verifica se o botão de fechar existe.
if (botaoFechar) {
  botaoFechar.addEventListener('click', fecharNotificacao);
}

// Fecha a notificação com a tecla ESC.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay?.classList.contains('ativo')) {
    fecharNotificacao();
  }
});

// Fecha ao clicar fora da caixa da notificação.
if (overlay) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      fecharNotificacao();
    }
  });
}