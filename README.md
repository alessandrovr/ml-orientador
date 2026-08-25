# ML-Orientador — V1 Web

Aplicação web que ajuda pesquisadores a responder: **"Qual algoritmo ou método
de Machine Learning é mais adequado para o meu problema de pesquisa?"**

Baseada fielmente na skill `prescricao-algoritmo-ml`. O motor de decisão é
determinístico, roda inteiramente no navegador (sem backend, sem banco de
dados, sem IA generativa) e implementa as regras de
`references/checklist-selecao-algoritmo.md` (Fluxo A — prescrição) e
`references/mapa-diagnostico-otimizacao.md` (Fluxo B — diagnóstico).

## O que foi construído

- **Tela inicial** com as duas entradas: "Começar" (Fluxo A) e "Já tenho um
  modelo e quero diagnosticar um problema" (Fluxo B) — essa escolha já
  implementa a Pergunta 0 da skill.
- **Fluxo A**: questionário de até 7 perguntas (Perguntas 1–7 da skill, com a
  Pergunta 2 pulada automaticamente quando o objetivo já dispensa variável-alvo),
  uma por vez, com opções em cards clicáveis rotulados A/B/C…, barra de
  progresso e uma **trilha de decisão** no topo (o elemento visual de
  assinatura do app) que mostra a cascata Objetivo → Alvo → Dados → Amostra →
  Prioridade → Erro → Restrição se preenchendo conforme o usuário avança.
- **Fluxo B**: pergunta aberta sobre a divisão treino/validação/teste e
  métricas obtidas, seguida da pergunta de sintoma (A–G), mapeando direto
  para diagnóstico + intervenção.
- **Motor de decisão** (`src/engine/`), inteiramente separado da interface,
  implementando os Passos 1–3 do checklist: classe da tarefa, filtragem de
  candidatos por tipo de dado/volume/interpretabilidade/custo de
  erro/restrições, e a regra de "amostra pequena sempre puxa para o
  candidato mais simples".
- **Telas de resultado** seguindo exatamente a estrutura das Seções 6A/6B da
  skill: resumo, contexto, alternativas comparadas em tabela, justificativa,
  estratégia de validação, referências, premissas assumidas e o que ainda
  precisa ser validado empiricamente.
- **Biblioteca local de referências reais** (`src/data/references.ts`) por
  algoritmo/técnica — nenhuma foi inventada. Como a V1 não faz busca
  automática na web (item fora de escopo, ver abaixo), a arquitetura já
  isola essa camada para ser substituída por busca em tempo real numa
  versão futura sem tocar no resto do app.
- Botão "Baixar relatório (.docx)" presente, mas desabilitado/"Em breve",
  conforme especificado.

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
   git commit -m "ML-Orientador V1"
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

## Funcionalidades deliberadamente fora desta V1

Conforme o escopo definido:

- Login, cadastro, painel administrativo, pagamento.
- Backend, banco de dados, API de IA generativa, chatbot.
- Upload de datasets, treinamento real de modelos, comparação automática de
  modelos, geração automática de código Python.
- Integração com CRM ou sistema de analytics.
- Busca automática de referências bibliográficas na web (a arquitetura de
  dados já está isolada em `src/data/references.ts` para receber isso depois).
- Geração de `.docx` (botão presente na tela de resultado, marcado como "Em
  breve").
- Pergunta 8 de desempate (Fluxo A): o motor desta V1 é baseado em regras
  determinísticas por ramo, sem pontuação comparável entre candidatos, então
  não produz empates técnicos reais — por isso a Pergunta 8 não tem UI própria
  nesta versão. Fica pronta para ser adicionada quando o motor evoluir para
  um sistema de pontuação que possa gerar empates genuínos.

## Estrutura do projeto

```
src/
├── components/     # TrilhaDecisao (elemento-assinatura) e OpcaoCard
├── data/           # questions.ts (perguntas) e references.ts (bibliografia)
├── engine/         # decision.ts (Fluxo A) e diagnosis.ts (Fluxo B) — types.ts
├── pages/          # Home, FluxoA, FluxoB, ResultadoA, ResultadoB
└── index.css       # design tokens (Tailwind v4 @theme)
```

O motor de decisão (`engine/`) não importa nada de `components/` ou
`pages/` — pode ser reaproveitado por qualquer interface futura (ex.: uma
versão CLI ou uma API) sem alteração.
