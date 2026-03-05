# Engineering Standards - Berserkr

## Language & Formatting
- **Code**: English.
- **Comments**: Portuguese (pt-br).
- **Naming**: 
  - Classes: `PascalCase`.
  - Functions/Variables: `camelCase`.
  - Constants: `SCREAMING_SNAKE_CASE`.
- **Linter**: ESLint + Prettier.

## Foundry Specifics
- **Localization**: Nunca use strings literais na UI. Use sempre `game.i18n.localize("MB.Key")`.
- **Data Models**: Use `foundry.abstract.DataModel` para toda a estrutura de Actor/Item.
- **Paths**: Use caminhos relativos ao sistema (ex: `systems/berserkr/assets/...`).

## Git/Commits
- Siga o padrão de **Commits Semânticos**:
  - `feat:` Nova funcionalidade.
  - `fix:` Correção de bug.
  - `docs:` Alterações na documentação.
  - `refactor:` Mudança no código que não altera comportamento.
  - `chore:` Atualização de build, dependências, etc.
