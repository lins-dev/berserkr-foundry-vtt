# AI Mandates - Project Berserkr

## Source of Truth
- **`docs/TASKS.md`**: É a fonte absoluta da verdade para o progresso do projeto. Nenhuma tarefa deve ser iniciada sem estar registrada aqui.

## Workflow & Communication
- **Idioma de Resposta**: Sempre Português (pt-br).
- **Código**: Todo o código (nomes de funções, variáveis, classes) deve ser em Inglês.
- **Comentários**: Devem ser em Português (pt-br) explicando o "porquê" da lógica.
- **Documentação**: Bilíngue (PT-BR/EN).
- **Docker**: Comandos de build/instalação devem ser executados via Docker (ex: `docker compose exec node npm install`).

## Engineering Standards
- **Stack**: Foundry VTT + TypeScript + Svelte + Vite + Data Models.
- **Normalization**: Campos normalizados (como IDs internos) devem ser em lowercase, removendo acentos.
- **Testing**: Cada nova funcionalidade de lógica de regras deve vir acompanhada de um teste unitário (Vitest sugerido).
