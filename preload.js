const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  carregarSenhas: () => ipcRenderer.invoke('senhas:carregar'),
  salvarSenha: (registro) => ipcRenderer.invoke('senhas:salvar', registro),
  excluirSenha: (id) => ipcRenderer.invoke('senhas:excluir', id),
  aoSolicitarNovo: (callback) => {
    ipcRenderer.on('senhas:novo', callback);
  }
});