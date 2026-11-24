# Gerenciador de Senhas

Aplicativo desktop desenvolvido com Electron, HTML, CSS e JavaScript puro.

## Requisitos

- Node.js instalado
- npm instalado

## Instalação

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

## Executar

```bash
npm start
```

## Funcionalidades

- Cadastrar registros de senhas.
- Listar e pesquisar registros.
- Editar registros existentes.
- Excluir com confirmação nativa do Electron.
- Gerar senhas com tamanho configurável e grupos de caracteres.
- Persistir os dados em `senhas.json` na pasta `app.getPath('userData')`.
- Atalho `Ctrl+N` para iniciar um novo cadastro.

## Organização

- `main.js`: janela, menu e handlers IPC.
- `preload.js`: API limitada exposta com `contextBridge`.
- `repositorio.js`: leitura e gravação do JSON.
- `src/index.html`: estrutura da interface.
- `src/style.css`: estilos.
- `src/renderer.js`: lógica da interface.

## Observação de segurança

Este projeto didático armazena as senhas em texto simples no arquivo JSON, conforme os requisitos propostos. Isso não é adequado para guardar senhas reais em um ambiente de produção. Para uso real, implemente criptografia em repouso, proteção por senha mestra e uma estratégia segura de gerenciamento de chaves. Não compartilhe o arquivo `senhas.json`.

O gerador utiliza a API Web Crypto para obter valores aleatórios, mas esta versão é um ponto de partida didático e deve passar por revisão de segurança antes de armazenar credenciais importantes.
