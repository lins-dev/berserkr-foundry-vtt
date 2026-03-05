# Architecture - Berserkr VTT

## Core Principles
1. **Separation of Concerns**: Lógica de regras (Domain) separada da API do Foundry (Infrastructure) e da interface (UI).
2. **Data-Driven**: O estado do sistema é definido por `DataModels`.
3. **Reactive UI**: Svelte gerencia o estado da interface de forma granular.

## Layers

### 1. Domain (Rules Engine)
- Localizado em `src/module/logic/`.
- Contém funções puras para calcular bônus, verificar sucessos e aplicar danos.
- *Independente da UI.*

### 2. Infrastructure (Foundry Integration)
- **Data Models**: Em `src/module/data/`. Define o esquema do `template.json` em código TS.
- **Documents**: Em `src/module/documents/`. Extensões de `Actor` e `Item` para integrar a lógica do domínio ao Foundry.
- **Applications**: Em `src/module/applications/`. Gerencia a renderização dos componentes Svelte dentro do `ApplicationV2`.

### 3. Presentation (Svelte)
- Componentes em `src/svelte/`.
- Comunica-se com os `Documents` do Foundry através de *stores* ou *props*.

## Data Flow
`User Action (UI)` -> `Document Method (Infra)` -> `Logic Function (Domain)` -> `Update DataModel (Infra)` -> `Reactive Update (UI)`
