# Venustra

O **Venustra** é um projeto acadêmico desenvolvido com o objetivo de facilitar o acesso a informações sobre **cuidados com a pele**, com foco principalmente em **mulheres de baixa renda**.

A proposta é criar uma plataforma simples e acessível que ajude as usuárias a compreender melhor as características da própria pele, organizar seus cuidados e encontrar alternativas de produtos compatíveis com suas necessidades e realidade financeira.

---

## Objetivo do projeto

O Venustra busca tornar o cuidado com a pele mais **acessível, compreensível e personalizado**, evitando que informações sobre skincare fiquem restritas a produtos caros ou rotinas complexas.

A plataforma pretende auxiliar a usuária a:

- Identificar características do seu tipo de pele;
- Conhecer cuidados adequados para sua pele;
- Encontrar produtos com preços mais acessíveis;
- Comparar produtos;
- Montar uma rotina de cuidados;
- Entender melhor a função dos produtos utilizados no dia a dia.

> O Venustra possui caráter informativo e não substitui avaliação ou orientação de profissionais da área da saúde.

---

## Público-alvo

O projeto é direcionado principalmente para **mulheres de baixa renda que desejam cuidar da pele sem depender de produtos de alto custo**.

A ideia é apresentar informações de maneira clara e ajudar na escolha de alternativas que conciliem:

- Custo;
- Necessidades da pele;
- Composição e finalidade dos produtos;
- Custo-benefício;
- Rotina de cuidados.

---

## Funcionalidades

O projeto está em desenvolvimento. Entre as funcionalidades propostas estão:

### Questionário de pele

Questionário para analisar características da pele da usuária por meio de perguntas relacionadas a:

- Oleosidade;
- Ressecamento;
- Aparência dos poros;
- Presença de cravos e espinhas;
- Sensibilidade;
- Reação ao clima;
- Sensação da pele durante o dia.

A partir das respostas, a plataforma poderá auxiliar na identificação de características associadas a peles:

- Oleosas;
- Secas;
- Mistas;
- Normais;
- Sensíveis.

### Produtos

Área destinada à visualização de produtos para cuidados com a pele, permitindo encontrar opções adequadas para diferentes necessidades e faixas de preço.

### Comparação de produtos

Possibilidade de comparar produtos considerando características como:

- Preço;
- Quantidade;
- Finalidade;
- Tipo de pele indicado;
- Ingredientes;
- Custo-benefício.

### Minha rotina

Área destinada à organização da rotina de skincare da usuária, facilitando a visualização dos produtos e das etapas utilizadas durante os cuidados diários.

---

## Tecnologias utilizadas

Atualmente, o projeto utiliza:

- **HTML5** — estrutura das páginas;
- **CSS3** — estilização e desenvolvimento da interface.

Novas tecnologias poderão ser incorporadas conforme o desenvolvimento do projeto avançar.

---

## Estrutura atual

```text
venustra/
│
└── questionarioPI/
    ├── questionario.html
    └── styleQuestionario.css
```

### `questionario.html`

Responsável pela estrutura do questionário de identificação das características da pele.

### `styleQuestionario.css`

Responsável pela estilização da página do questionário.

---

## Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/gabrielc-freire/venustra.git
```

### 2. Entre na pasta do projeto

```bash
cd venustra
```

### 3. Acesse o questionário

```bash
cd questionarioPI
```

### 4. Execute

Abra o arquivo:

```text
questionario.html
```

em um navegador.

Também é possível utilizar extensões como o **Live Server** no Visual Studio Code durante o desenvolvimento.

---

## Próximas etapas

O projeto ainda está em desenvolvimento. Entre as próximas etapas planejadas estão:

- [ ] Finalizar o design da plataforma;
- [ ] Tornar as páginas responsivas;
- [ ] Implementar a lógica do questionário;
- [ ] Exibir o resultado do tipo de pele;
- [ ] Criar página inicial;
- [ ] Criar catálogo de produtos;
- [ ] Implementar sistema de comparação;
- [ ] Desenvolver a área **Minha Rotina**;
- [ ] Criar sistema de recomendação de produtos;
- [ ] Melhorar acessibilidade e experiência do usuário.

---

## Contexto acadêmico

O Venustra está sendo desenvolvido como um **projeto acadêmico**, aplicando conceitos relacionados ao desenvolvimento de sistemas e à criação de soluções digitais voltadas para problemas reais.

O projeto parte da ideia de que o acesso à informação também é uma parte importante do autocuidado. Dessa forma, busca-se desenvolver uma solução que considere não apenas as necessidades relacionadas à pele, mas também a **realidade econômica das usuárias**.

---

## Contribuição

Como o projeto está sendo desenvolvido em grupo, alterações podem ser realizadas por meio de branches e posteriormente integradas ao projeto principal.

Fluxo básico:

```bash
git pull
git checkout -b nome-da-branch

# realizar alterações

git add .
git commit -m "Descrição da alteração"
git push origin nome-da-branch
```

Depois disso, as alterações podem ser revisadas e integradas por meio de um **Pull Request**.

---

## Status

> **Em desenvolvimento**

O Venustra ainda está em suas etapas iniciais e novas funcionalidades serão adicionadas ao longo do desenvolvimento.

---

<p align="center">
  <strong>Venustra</strong><br>
  Tecnologia, acessibilidade e autocuidado.
</p>
