const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('node:path');
const repositorio = require('./repositorio');

let janelaPrincipal;

function criarJanela() {
  janelaPrincipal = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 780,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  janelaPrincipal.loadFile(path.join(__dirname, 'src', 'index.html'));
}

function configurarMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo cadastro',
          accelerator: 'Ctrl+N',
          click: () => janelaPrincipal?.webContents.send('senhas:novo')
        },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => dialog.showMessageBox(janelaPrincipal, {
            type: 'info',
            title: 'Sobre',
            message: 'Gerenciador de Senhas',
            detail: 'Aplicativo desenvolvido com Electron, HTML, CSS e JavaScript.'
          })
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

function registrarHandlers() {
  ipcMain.handle('senhas:carregar', async () => {
    return repositorio.listar();
  });

  ipcMain.handle('senhas:salvar', async (_evento, registro) => {
    return repositorio.salvar(registro);
  });

  ipcMain.handle('senhas:excluir', async (evento, id) => {
    const janela = BrowserWindow.fromWebContents(evento.sender);
    const resposta = await dialog.showMessageBox(janela, {
      type: 'warning',
      buttons: ['Cancelar', 'Excluir'],
      defaultId: 0,
      cancelId: 0,
      title: 'Confirmar exclusão',
      message: 'Deseja realmente excluir este registro?',
      detail: 'Esta ação não poderá ser desfeita.'
    });

    if (resposta.response !== 1) {
      return { excluido: false };
    }

    await repositorio.excluir(id);
    return { excluido: true };
  });
}

app.whenReady().then(() => {
  repositorio.definirCaminho(app.getPath('userData'));
  registrarHandlers();
  configurarMenu();
  criarJanela();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) criarJanela();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});