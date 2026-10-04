const trilho = document.querySelector('.carrossel-trilho');
const btnEsq = document.querySelector('.seta-esq');
const btnDir = document.querySelector('.seta-dir');

let slides = [...document.querySelectorAll('.slide')];

// NOVO: o ciclo só fica perfeito com pelo menos 6 slides. Motivo: precisamos de slides
// "de reserva" invisíveis para dar a volta sem aparecer nenhum salto na tela.
// Se houver menos, duplicamos a lista (com 4 slides vira 8). Na tela ninguém percebe,
// porque as cópias só aparecem na vez em que o original apareceria.
const MINIMO = 6;
const originais = [...slides];
while (slides.length < MINIMO) {
  originais.forEach(original => {
    const copia = original.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');  // leitores de tela ignoram as cópias
    trilho.appendChild(copia);
    slides.push(copia);
  });
}

const total = slides.length;
let atual = 0;

// NOVO: calcula a distância de um slide até o atual, "dando a volta" no ciclo.
// Exemplo com 8 slides e atual = 0: o slide 7 tem distância -1 (vizinho da esquerda),
// o slide 1 tem +1 (vizinho da direita), o slide 4 está do outro lado (+4, invisível).
function distancia(i) {
  let d = (i - atual) % total;     // resto da divisão: vai de -(total-1) até total-1
  if (d < 0) d += total;           // joga tudo para 0...total-1
  if (d > total / 2) d -= total;   // acima da metade, é mais perto pelo outro lado (negativo)
  return d;
}

function mostrar(indice) {
  // ALTERADO: antes parava nas pontas (Math.max/Math.min). Agora dá a volta com módulo.
  // O "+ total" antes do "%" evita resultado negativo ao voltar do slide 0.
  atual = ((indice % total) + total) % total;

  slides.forEach((slide, i) => {
    const d = distancia(i);
    slide.style.setProperty('--pos', d);   // NOVO: o CSS usa --pos para posicionar o slide
    slide.classList.toggle('ativo', d === 0);
    slide.classList.toggle('antes', d === -1);
    slide.classList.toggle('depois', d === 1);
  });
}

btnDir.addEventListener('click', () => mostrar(atual + 1));
btnEsq.addEventListener('click', () => mostrar(atual - 1));

// MANTIDO: clicar num preview leva até ele
slides.forEach((slide, i) => slide.addEventListener('click', () => mostrar(i)));

// REMOVIDO: as linhas que desativavam as setas nas pontas (agora não há pontas)

mostrar(0);