# ML-Orientador — V2 Web

Aplicação web que ajuda pesquisadores a responder: **"Qual algoritmo ou método
de Machine Learning é mais adequado para o meu problema de pesquisa?"**

Baseada fielmente na skill `prescricao-algoritmo-ml`. O motor de decisão é
determinístico, roda inteiramente no navegador (sem backend, sem banco de
dados, sem IA generativa) e implementa as regras de
`references/checklist-selecao-algoritmo.md` (Fluxo A — prescrição) e
`references/mapa-diagnostico-otimizacao.md` (Fluxo B — diagnóstico).

## Novidades da V2

A V1 tinha dois itens deliberadamente fora de escopo e uma lacuna não
documentada; os três foram fechados nesta versão:

- **Geração de `.docx`** — o botão "Baixar relatório (.docx)", antes
  desabilitado, agora gera o relatório completo no navegador (biblioteca
  `docx`, carregada sob demanda via import dinâmico para não pesar o bundle
  inicial) espelhando exatamente as Seções 6A/6B da skill, com os mesmos
  títulos numerados e as mesmas tabelas que já apareciam na tela.
- **Pergunta 8 (desempate)** — o motor agora reconhece os dois empates
  técnicos reais que o próprio checklist já apontava em comentário: K-means
  × DBSCAN/HDBSCAN em clustering (quando a forma/densidade dos grupos não foi
  informada) e Gradient Boosting × Random Forest em dados tabulares de
  volume moderado/grande sem exigência de interpretabilidade. Quando um
  desses casos ocorre, a Pergunta 8 aparece dinamicamente como uma etapa a
  mais no questionário, com alternativas em A/B/C; a resposta reordena o
  candidato principal. Quando não há empate, a pergunta continua sendo
  pulada, como sempre.
- **Seção "2. Contexto do problema"** — a tela de resultado e o `.docx`
  agora mostram as respostas do aluno em texto legível (não só as letras
  internas), fechando uma lacuna da V1 em que essa seção da skill
  simplesmente não aparecia no relatório.
- **Biblioteca de referências bibliográficas** — corrigido um bug na busca
  aproximada de referências que deixava ~9 candidatos (Isolation Forest,
  One-Class SVM, HDBSCAN, UMAP, t-SNE, Fine-tuning de modelo de linguagem,
  fine-tuning de rede de imagem, Recomendação Baseada em Conteúdo, métodos de
  densidade) sem nenhuma referência exibida mesmo quando uma já existia na
  biblioteca sob uma chave composta (ex.: `"DBSCAN/HDBSCAN"`). A busca agora
  também considera as partes de chaves compostas, e as referências que ainda
  não existiam (Recomendação Baseada em Conteúdo, LOF, fine-tuning) foram
  adicionadas — reais, com autor/ano/veículo, nenhuma inventada.

**Nota de arquitetura, por transparência:** a skill pede busca *em tempo
real* na web para as referências bibliográficas. Isso é incompatível com a
decisão de arquitetura desta V2 (aplicação 100% estática, sem backend, sem
chamada a IA generativa) — adicionar isso exigiria um servidor. A adaptação
deliberada foi manter e ampliar a biblioteca curada local, com referências
reais e verificáveis, deixando a camada (`src/data/references.ts`) isolada
para, se um dia o projeto ganhar backend, ser substituída por busca real sem
tocar no resto do app.

## O que foi construído

- **Tela inicial** com as duas entradas: "Começar" (Fluxo A) e "Já tenho um
  modelo e quero diagnosticar um problema" (Fluxo B) — essa escolha já
  implementa a Pergunta 0 da skill.
- **Fluxo A**: questionário de até 8 perguntas (Perguntas 1–7 da skill, com a
  Pergunta 2 pulada automaticamente quando o objetivo já dispensa
  variável-alvo, e a Pergunta 8 de desempate aparecendo só quando o motor
  detecta um empate técnico real), uma por vez, com opções em cards
  clicáveis rotulados A/B/C…, barra de progresso e uma **trilha de decisão**
  no topo (o elemento visual de assinatura do app) que mostra a cascata
  Objetivo → Alvo → Dados → Amostra → Prioridade → Erro → Restrição
  (→ Desempate, quando aplicável) se preenchendo conforme o usuário avança.
- **Fluxo B**: pergunta aberta sobre a divisão treino/validação/teste e
  métricas obtidas, seguida da pergunta de sintoma (A–G), mapeando direto
  para diagnóstico + intervenção.
- **Motor de decisão** (`src/engine/`), inteiramente separado da interface,
  implementando os Passos 1–3 do checklist: classe da tarefa, filtragem de
  candidatos por tipo de dado/volume/interpretabilidade/custo de
  erro/restrições, a regra de "amostra pequena sempre puxa para o candidato
  mais simples", e a detecção dos dois empates técnicos reais que acionam a
  Pergunta 8.
- **Telas de resultado** seguindo exatamente a estrutura das Seções 6A/6B da
  skill: resumo, contexto do problema, alternativas comparadas em tabela,
  justificativa, estratégia de validação, referências, outras informações
  que o aluno pode fornecer para refinar, e o que ainda precisa ser validado
  empiricamente.
- **Biblioteca local de referências reais** (`src/data/references.ts`) por
  algoritmo/técnica — nenhuma foi inventada (ver nota de arquitetura acima).
- **Exportação em `.docx`** (`src/utils/generateDocx.ts`), com a mesma
  estrutura de seções e tabelas do relatório em tela, carregada via import
  dinâmico.

## Como executar localmente

Pré-requisito: Node.js 20+.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (geralmente `http://localhost:5173/ml-orientador/`).

## Como gerar a build de produção

```bash
npm run build
```

Os arquivos finais ficam em `dist/`. Para conferir localmente antes de
publicar:

```bash
npm run preview
```

## Como publicar no GitHub Pages

O repositório já inclui um workflow (`.github/workflows/deploy.yml`) que
builda e publica automaticamente a cada push na branch `main`.

1. Crie um repositório no GitHub chamado `ml-orientador` (ou ajuste o campo
   `base` em `vite.config.ts` para bater com o nome do seu repositório —
   ele precisa ser `/nome-do-repositorio/`).
2. Suba o projeto:
   ```bash
   git init
   git add .
   git commit -m "ML-Orientador V2"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/ml-orientador.git
   git push -u origin main
   ```
3. No GitHub, vá em **Settings → Pages** e, em "Build and deployment",
   selecione **Source: GitHub Actions**.
4. O workflow roda automaticamente. Em alguns minutos o app estará em
   `https://SEU-USUARIO.github.io/ml-orientador/`.

Se preferir publicar sem Actions (deploy manual), instale `gh-pages` e rode:

```bash
npm install -D gh-pages
npx gh-pages -d dist
```

(nesse caso, configure a branch `gh-pages` como fonte em Settings → Pages).

## Funcionalidades deliberadamente fora desta V2

Conforme o escopo definido:

- Login, cadastro, painel administrativo, pagamento.
- Backend, banco de dados, API de IA generativa, chatbot.
- Upload de datasets, treinamento real de modelos, comparação automática de
  modelos, geração automática de código Python.
- Integração com CRM ou sistema de analytics.
- Busca automática de referências bibliográficas *em tempo real* na web —
  exigiria backend; ver "Nota de arquitetura" acima sobre a adaptação
  deliberada mantendo uma biblioteca curada local.

## Estrutura do projeto

```
src/
├── components/     # TrilhaDecisao (elemento-assinatura) e OpcaoCard
├── data/           # questions.ts (perguntas) e references.ts (bibliografia)
├── engine/         # decision.ts (Fluxo A) e diagnosis.ts (Fluxo B) — types.ts
├── pages/          # Home, FluxoA, FluxoB, ResultadoA, ResultadoB
├── utils/          # generateDocx.ts (exportação do relatório em Word)
└── index.css       # design tokens (Tailwind v4 @theme)
```

O motor de decisão (`engine/`) não importa nada de `components/` ou
`pages/` — pode ser reaproveitado por qualquer interface futura (ex.: uma
versão CLI ou uma API) sem alteração.
