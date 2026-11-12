# Venustra - Transformando cuidado em confiança

O **Venustra** é um projeto acadêmico que facilita o acesso a informações sobre **cuidados com a pele**, com foco em **mulheres de baixa renda**.

A proposta é ser uma plataforma simples e acessível que ajude as usuárias a compreender as características da própria pele, organizar seus cuidados e encontrar produtos compatíveis com suas necessidades e com a sua realidade financeira.

> O Venustra possui caráter informativo e não substitui avaliação ou orientação de profissionais da área da saúde.

---

## Objetivo do projeto

Tornar o cuidado com a pele mais **acessível, compreensível e personalizado**, evitando que o skincare fique restrito a produtos caros ou rotinas complexas.

A plataforma pretende auxiliar a usuária a:

- Identificar características do seu tipo de pele;
- Conhecer cuidados adequados para sua pele;
- Encontrar produtos com preços mais acessíveis;
- Comparar produtos;
- Montar uma rotina de cuidados;
- Entender melhor a função dos produtos utilizados no dia a dia.

---

## Público-alvo

Mulheres de baixa renda que desejam cuidar da pele sem depender de produtos de alto custo. As informações são apresentadas de forma clara, ajudando na escolha de alternativas que conciliem:

- Custo;
- Necessidades da pele;
- Composição e finalidade dos produtos;
- Custo-benefício;
- Rotina de cuidados.

---

## Funcionalidades

| Página | Pasta | Descrição |
|--------|-------|-----------|
| Início | `inicioPI/` | Página inicial da plataforma |
| Questionário de pele | `questionarioPI/` | Identificação das características da pele |
| Produtos | `Produtos/` | Visualização de produtos por necessidade e faixa de preço |
| Comparar | `Comparar/` | Comparação de produtos |
| Minha rotina | `RotinaPI/` | Organização da rotina de skincare |
| Sobre | `Sobre/` | Informações sobre o projeto |

### Questionário de pele

Analisa a pele da usuária por meio de perguntas sobre:

- Oleosidade;
- Ressecamento;
- Aparência dos poros;
- Presença de cravos e espinhas;
- Sensibilidade;
- Reação ao clima;
- Sensação da pele durante o dia.

São 6 perguntas:

- **Perguntas 1 a 4** definem o tipo de pele (oleosa, seca, mista ou normal);
- **Pergunta 5** identifica espinhas e cravos;
- **Pergunta 6** identifica manchas e marcas escuras.

As perguntas 5 e 6 **não mudam o tipo de pele**: elas só ajustam a rotina recomendada.

### Produtos

Área para visualização de produtos de cuidados com a pele, com opções para diferentes necessidades e faixas de preço.

### Comparação de produtos

Permite comparar produtos considerando:

- Preço;
- Quantidade;
- Finalidade;
- Tipo de pele indicado;
- Ingredientes;
- Custo-benefício.

### Minha rotina

Ao terminar o questionário, a rotina de manhã e de noite é **montada automaticamente** com produtos de `Produtos/Produtos.json`, de acordo com o tipo de pele e com as queixas de espinhas, cravos e manchas. A pessoa pode adicionar produtos, remover e refazer a rotina recomendada.

**A rotina só aparece (e só pode ser alterada) para quem está com a conta aberta.** Sem login, a página mostra apenas um convite para entrar ou criar conta. Se a pessoa fizer o questionário sem conta, o resultado fica guardado e a rotina é criada assim que ela entrar.

> As contas e rotinas ficam no `localStorage` do navegador (não há servidor). Por isso o bloqueio é uma regra da interface, e não uma proteção de segurança: para isso seria preciso um back-end.

#### Como a rotina escolhe os produtos

Cada produto de `Produtos.json` tem estes campos (além dos que já existiam):

| Campo | Para que serve |
|-------|----------------|
| `tiposPele` | Só entram na rotina produtos indicados para o tipo de pele |
| `foco` | Queixas que o produto ajuda: `"acne"`, `"cravos"`, `"manchas"` (pode ser lista vazia) |
| `periodo` | (só séruns) `"manha"` e/ou `"noite"`. Ex.: vitamina C de manhã, ácido à noite |
| `comCor` | (só protetor colorido) só é indicado automaticamente para quem tem manchas |

Entre os produtos compatíveis, vence quem atende mais queixas; empatando, o mais barato. Cada período tem no máximo um sérum, e o mesmo sérum não se repete de manhã e à noite. Para mudar a recomendação de um produto, basta editar `foco`/`periodo` no JSON; a lógica fica em `js/venustra.js` (`gerarRotina`).

---

## Tecnologias utilizadas

- **HTML5**: estrutura das páginas;
- **CSS3**: estilização e interface;
- **JavaScript**: interatividade no projeto.

Novas tecnologias poderão ser incorporadas conforme o desenvolvimento avançar.

---

## Estrutura do projeto

```text
venustra/
│
├── inicioPI/          # Página inicial
├── questionarioPI/    # Questionário de pele
├── Produtos/          # Catálogo de produtos
├── Comparar/          # Comparação de produtos
├── RotinaPI/          # Minha rotina
├── Sobre/             # Sobre o projeto
├── portfolios/        # Portfólios da equipe
├── global.css         # Estilos globais compartilhados entre as páginas
└── README.md
```

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

### 3. Abra a página inicial

Abra o arquivo HTML da pasta `inicioPI/` em um navegador. As demais páginas podem ser abertas da mesma forma, dentro de suas respectivas pastas.

Durante o desenvolvimento, também é possível utilizar a extensão **Live Server** no Visual Studio Code.

---

## Contexto acadêmico

O Venustra é desenvolvido como **projeto acadêmico**, aplicando conceitos de desenvolvimento de sistemas na criação de soluções digitais para problemas reais.

O projeto parte da ideia de que o acesso à informação também faz parte do autocuidado, e por isso considera não apenas as necessidades da pele, mas também a **realidade econômica das usuárias**.

---

## Contribuição

Como o projeto é desenvolvido em grupo, as alterações são feitas em branches e integradas ao projeto principal por meio de Pull Request.

```bash
git pull
git checkout -b nome-da-branch

# realizar alterações

git add .
git commit -m "Descrição da alteração"
git push origin nome-da-branch
```

Depois, abra um **Pull Request** para revisão e integração.

---

## Status

> **Em desenvolvimento**

---

<p align="center">
  <strong>Venustra</strong><br>
  Transformando cuidado em confiança.
</p>
