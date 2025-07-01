# GitHub Workflows

## Build e Release Manual

Este workflow permite buildar o projeto GalaxyControl para Linux e criar uma release automaticamente.

### Como usar:

1. **Acesse o GitHub Actions**: Vá para a aba "Actions" no seu repositório
2. **Selecione o workflow**: Clique em "Build and Release for Linux"
3. **Execute manualmente**: Clique no botão "Run workflow"
4. **Preencha os campos**:
   - **Version**: A versão que será lançada (ex: 1.0.0, 1.1.0, etc.)
   - **Release notes**: Notas da release (opcional)

### O que o workflow faz:

1. **Build Job**:

   - Faz checkout do código
   - Configura Bun (última versão)
   - Instala dependências com `bun install`
   - Executa o build com `bun run build`
   - Faz upload dos artefatos de build

2. **Release Job**:
   - Baixa os artefatos de build
   - Cria uma nova release no GitHub
   - Faz upload do arquivo AppImage como asset da release

### Artefatos gerados:

- **AppImage**: Arquivo executável para Linux
- **Release**: Tag e release no GitHub com o arquivo anexado

### Requisitos:

- O repositório deve ter permissões para criar releases
- O `GITHUB_TOKEN` é automaticamente fornecido pelo GitHub Actions

### Notas:

- O workflow só builda para Linux (AppImage)
- Os artefatos são mantidos por 30 dias
- A release é criada automaticamente sem ser draft ou prerelease
