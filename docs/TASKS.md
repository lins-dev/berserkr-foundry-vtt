# Sprint 1: Infrastructure & Core Rules Extraction

## Status: 🏗️ In Progress

### [x] Task 1: Rulebook Extraction
- [x] Ler @docs/rules-reference/Berserkr_Barebones.pdf integralmente.
- [x] Gerar `docs/rules-reference/rules_summary.md`.
- [x] Gerar `docs/rules-reference/classes.md`.
- [x] Gerar `docs/rules-reference/equipment_and_magic.md`.

### [x] Task 2: Project Scaffolding
- [x] Configurar `package.json` com dependências (Vite, TypeScript, Svelte, Foundry Types).
- [x] Configurar `tsconfig.json`.
- [x] Configurar `vite.config.ts`.
- [x] Criar `system.json` inicial.
- [x] Criar `Dockerfile` com suporte a NVM.
- [x] Configurar `docker-compose.yml` para o ambiente de desenvolvimento.

### [x] Task 3: Core Data Models
- [x] Implementar `BerserkrActorData` (Attributes: Fortitude, Might, Guile, Swift, Wits).
- [x] Implementar `BerserkrItemData` base.

# Sprint 2: Documents & Logic

## Status: ✅ Complete

### [x] Task 1: Document Extensions
- [x] Implementar `BerserkrActor` (extends `Actor`).
- [x] Implementar `BerserkrItem` (extends `Item`).
- [x] Implementar lógica de cálculo de HP e Fates no `prepareDerivedData`.

### [x] Task 2: Dice Engine
- [x] Criar `src/module/logic/dice.ts`.
- [x] Implementar função de teste base (d20 + mod vs DR).
- [x] Implementar lógica de Crítico (Nat 20) e Fumble (Nat 1).

### [x] Task 3: Svelte Sheets (Base)
- [x] Configurar `ApplicationV2` para Actor.
- [x] Criar componente base `CharacterSheet.svelte`.

# Sprint 3: Items & UI Polish

## Status: 🏗️ In Progress

### [x] Task 1: Item Sheets
- [x] Implementar `BerserkrItemSheet` (ApplicationV2 + Svelte).
- [x] Criar componentes Svelte para Arma, Armadura e Runa.
- [x] Implementar suporte a múltiplos perfis de dano nas Armas (até 5 tipos).
- [x] Estruturar redução de armadura como dados de dados (dieCount/dieType).
- [x] Adicionar validação de limites, sincronização de inputs e acessibilidade (A11y).
- [x] Garantir conformidade com API v13 do Foundry (Math.clamp, modern FilePicker).

### [x] Task 2: Interactive Features
- [x] Adicionar botões de ataque e dano na aba Violence.
- [x] Implementar rolagens de ataque (d20 + Might/Guile) e dano estruturado.
- [x] Criar templates Handlebars (`test-card.hbs`, `damage-card.hbs`) para o chat.
- [x] Integrar expansão nativa de rolagens (dice-tooltip) no chat.
- [x] Transformar nomes de atributos no cabeçalho em botões de rolagem clicáveis.
- [x] Aplicar automaticamente penalidades de armadura em testes de Swift.
- [x] Corrigir avisos de acessibilidade (A11y) e conformidade V13 nas rolagens.


### [x] Task 3: Styling & Assets
- [x] Aplicar temas visuais (fontes, cores, backgrounds) baseados no Mörk Borg.
- [x] Integrar fonte Norse e Alegreya com suporte a PT-BR.
- [x] Reestruturar cabeçalho e layout de atributos na ficha de personagem.
- [x] Implementar paleta "Mystic Teal" para harmonia entre cabeçalho escuro e corpo claro.
- [x] Otimizar contraste e tamanho de fontes no cabeçalho (HP, Fates, Silver).
