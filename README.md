# Berserkr VTT System

[![Foundry VTT Version](https://img.shields.io/badge/Foundry-v13-orange)](https://foundryvtt.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.MIT)

This is an **unofficial** development of the **Berserkr** character sheet and system for Foundry VTT. This project is **non-profit** and was developed by a fan for the community.

> **Legal Notice:** *Berserkr VTT* is an independent production and is not officially affiliated with **Slightly Reckless Games** or **Ockult Örtmästare Games / Stockholm Kartell**. It is published under the **MÖRK BORG Third Party License**.

---

## ⚔️ The System
From the creators of *Rōnin TTRPG*, **Berserkr** is an epic journey where Norse mythology meets the gritty mechanics of **MÖRK BORG** and **Old School Renaissance (OSR)**. 

As Ragnarök looms, you won't just play a character—you will craft your own saga and shape the fate of the Nine Realms. In this brutal dance with destiny, every decision sends shockwaves through the cosmos. You will invoke runic magic, clash with iconic monsters, forge alliances, and even challenge the gods themselves to steer the course of the impending apocalypse.

## 🏢 The Publishers

### Slightly Reckless Games
The creators and owners of **Berserkr**. Slightly Reckless Games is an independent studio known for evocative and atmospheric tabletop RPGs, focusing on immersive storytelling and high-stakes gameplay.
*   **Official Website:** [slightlyrecklessgames.com](https://slightlyrecklessgames.com/pages/berserkr)

### MÖRK BORG
The engine powering Berserkr was created by **Ockult Örtmästare Games** and **Stockholm Kartell**. MÖRK BORG is a pitch-black, art-punk apocalyptic fantasy RPG that has redefined the OSR scene.
*   **License & Info:** [morkborg.com/license](https://morkborg.com/license/)

---

## 🚀 Developed Features

### Characters and Attributes
- **Core Data Models**: Implementation of the 5 base attributes (Fortitude, Might, Guile, Swift, Wits).
- **Automatic Calculations**: HP and Fates calculated dynamically based on class and attributes.
- **Get Better**: Automated "Improve" mechanic with chat logging and improvement counter.

### Combat and Dice
- **Dice Engine**: d20 ± Attribute vs. DR rolls with automatic detection of Critical (Nat 20) and Fumble (Nat 1).
- **Dynamic Attacks**: Support for multiple damage profiles per weapon (up to 5 types).
- **Defense and Armor**: Integrated defense rolls and damage reduction based on dice (e.g., d2, d4, d6).
- **Initiative**: Individual initiative system (Swift + d6) fully integrated into the Combat Tracker.

### Magic and Specialties
- **Runic Magic**: Automation of daily pool (d4 + Guile), casting tests (Wits DR12), and automatic HP loss on failure.
- **Special Tab**: Management of Feats (class abilities) and Runes.
- **Saga Tab**: Character mechanical history, record of deeds, and a toggle to prevent attribute regression.

### Interface and Experience (UI/UX)
- **Svelte Sheets**: Modern, fast, and reactive interface based on Svelte and ApplicationV2.
- **Mystic Teal Theme**: Visual identity inspired by Mörk Borg with custom fonts (Norse and Alegreya).
- **Chat Cards**: Custom templates for attacks, damage, tests, and items.
- **Persistence**: Absolute memory of tabs and scroll position on sheets.

### Compendiums and Organization
- **Complete Packs**: Basic/Special Weapons, Armors, Gear, Legendary Items, Runes, and Feats for all 10 classes.
- **Realm Tables**: Organized roll tables for all realms (Midgard, Asgard, Helheim, etc.).
- **Zero Setup**: Automatic scripts (Hooks) to create folders and organize the world upon system load.
- **Bilingual**: Full localization in Portuguese (PT-BR) and English (EN).

---

## 📸 Screenshots

### Character Sheet (Main Tab)
![Character Sheet](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-15-58.png)
*The Mystic Teal interface combining dark aesthetics with Svelte clarity.*

### Inventory and Items
![Inventory](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-28-52.png)
*Load management and equipment categories with quick-roll buttons.*

### Sagas and Progression
![Sagas](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-18-06.png)
*A dedicated space for your character's journey and mechanical improvements.*

### Compendiums and Tables
![Compendiums](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-19-31.png)
*Complete library of items and rules ready for use, automatically organized.*

---

## 🎨 Credits and Assets

### Fonts
- **Norse**: The system's main font is available at [Dafont](https://www.dafont.com/norse.font). All property and creation rights belong to its respective author.

---

## 🛠️ Installation (Developers)
1. Clone this repository into your `Data/systems/berserkr` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the build to compile files:
   ```bash
   npm run build
   ```

---

<details>
<summary><b>Clique aqui para a versão em Português (PT-BR)</b></summary>

# Sistema Berserkr VTT

[![Foundry VTT Version](https://img.shields.io/badge/Foundry-v13-orange)](https://foundryvtt.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.MIT)

Este é um desenvolvimento **não oficial** da ficha e sistema **Berserkr** para o Foundry VTT. Este projeto **não possui fins lucrativos** e é um trabalho desenvolvido por um fã para a comunidade.

> **Aviso Legal:** *Berserkr VTT* é uma produção independente e não possui afiliação oficial com a **Slightly Reckless Games** ou **Ockult Örtmästare Games / Stockholm Kartell**. Ele é publicado sob a **MÖRK BORG Third Party License**.

---

## ⚔️ O Sistema
Dos mesmos criadores de *Rōnin TTRPG*, **Berserkr** é uma jornada épica onde a mitologia nórdica colide com as mecânicas brutais de **MÖRK BORG** e **Old School Renaissance (OSR)**.

Com o Ragnarök se aproximando, você não apenas jogará com um personagem — você criará sua própria saga e moldará o destino dos Nove Reinos. Nesta dança brutal com o destino, cada decisão envia ondas de choque através do cosmos. Você invocará magia rúnica, enfrentará monstros icônicos, forjará alianças e poderá até desafiar os próprios deuses para guiar o curso do apocalipse iminente.

## 🏢 As Produtoras

### Slightly Reckless Games
Criadora e proprietária de **Berserkr**. A Slightly Reckless Games é um estúdio independente conhecido por seus RPGs de mesa evocativos e atmosféricos, focando em narrativa imersiva e jogabilidade de alto risco.
*   **Site Oficial:** [slightlyrecklessgames.com](https://slightlyrecklessgames.com/pages/berserkr)

### MÖRK BORG
O motor que alimenta o Berserkr foi criado pela **Ockult Örtmästare Games** e **Stockholm Kartell**. MÖRK BORG é um RPG de fantasia apocalíptica art-punk e sombrio que redefiniu a cena OSR.
*   **Licença e Informações:** [morkborg.com/license](https://morkborg.com/license/)

---

## 🚀 Funcionalidades Desenvolvidas

### Personagens e Atributos
- **Data Models Core**: Implementação dos 5 atributos base (Fortitude, Might, Guile, Swift, Wits).
- **Cálculos Automáticos**: HP e Fatos calculados dinamicamente com base na classe e atributos.
- **Get Better**: Mecânica de evolução ("Melhorar") automatizada com log no chat e contador de melhorias.

### Combate e Dados
- **Dice Engine**: Rolagens de d20 ± Atributo vs. DR com detecção automática de Crítico (Nat 20) e Fumble (Nat 1).
- **Ataques Dinâmicos**: Suporte a múltiplos perfis de dano por arma (até 5 tipos).
- **Defesa e Armadura**: Rolagens de defesa integradas e redução de dano baseada em dados (ex: d2, d4, d6).
- **Iniciativa**: Sistema de iniciativa individual (Swift + d6) totalmente integrado ao Combat Tracker.

### Magia e Especialidades
- **Runic Magic**: Automação de pool diário (d4 + Guile), testes de conjuração (Wits DR12) e perda automática de HP em falhas.
- **Aba Special**: Gerenciamento de Feats (habilidades de classe) e Runas.
- **Aba Saga**: Histórico mecânico do personagem, registro de feitos e toggle para evitar regressão de atributos.

### Interface e Experiência (UI/UX)
- **Fichas Svelte**: Interface moderna, rápida e reativa baseada em Svelte e ApplicationV2.
- **Tema Mystic Teal**: Identidade visual inspirada em Mörk Borg com fontes customizadas (Norse e Alegreya).
- **Cards de Chat**: Templates customizados para ataques, danos, testes e itens.
- **Persistência**: Memória absoluta de abas e posição de scroll nas fichas.

### Compêndios e Organização
- **Packs Completos**: Armas Básicas/Especiais, Armaduras, Equipamentos, Itens Lendários, Runas e Feats para todas as 10 classes.
- **Tabelas de Reinos**: Tabelas de rolagens organizadas para todos os reinos (Midgard, Asgard, Helheim, etc.).
- **Zero Setup**: Scripts automáticos (Hooks) para criar pastas e organizar o mundo ao carregar o sistema.
- **Bilíngue**: Localização completa em Português (PT-BR) e Inglês (EN).

---

## 📸 Capturas de Tela

### Ficha de Personagem (Aba Principal)
![Ficha de Personagem](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-15-58.png)
*A interface Mystic Teal unindo a estética sombria com a clareza do Svelte.*

### Inventário e Itens
![Inventário](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-28-52.png)
*Gestão de carga e categorias de equipamentos com botões de rolagem rápida.*

### Sagas e Progressão
![Sagas](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-18-06.png)
*Um espaço dedicado para a jornada do seu personagem e melhorias mecânicas.*

### Compêndios e Tabelas
![Compêndios](docs/rules-reference/images/Captura%20de%20tela%20de%202026-03-08%2003-19-31.png)
*Biblioteca completa de itens e regras pronta para uso, organizada automaticamente.*

---

## 🎨 Créditos e Ativos

### Fontes
- **Norse**: A fonte principal do sistema está disponível no [Dafont](https://www.dafont.com/norse.font). Todos os direitos de propriedade e criação pertencem ao seu respectivo autor.

---

## 🛠️ Instalação (Desenvolvedores)
1. Clone este repositório no seu diretório `Data/systems/berserkr`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o build para compilar os arquivos:
   ```bash
   npm run build
   ```

</details>

---
*This system is a work in progress. Follow the detailed progress in `docs/TASKS.md`.*
