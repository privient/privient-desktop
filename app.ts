import { app, BrowserWindow, ipcMain } from 'electron';
import { SocketService } from './services/SocketService';
import { CryptoService } from './services/CryptoService';
import * as path from 'path';
import * as url from 'url';
import { DataService } from './services/DataService';
import { IPCService } from './services/IPCService';

const defaultPage = url.format({
  pathname: path.join(__dirname, `./index.html`),
  protocol: "file:",
  slashes: true
});

// Singleton
export class MainProcess {
  private static Instance: MainProcess;
  WinMain: BrowserWindow;
  private SocketService: SocketService;
  private CryptoService: CryptoService;

  private constructor() { }

  CreateWindow() {
    if (this.WinMain !== undefined)
      return;

    this.WinMain = new BrowserWindow({ minWidth:800, width: 800, frame: false, height: 600, minHeight: 600, fullscreenable: true, autoHideMenuBar: true, webPreferences: { nodeIntegration: true } });
    this.WinMain.loadURL(defaultPage);
    this.WinMain.on('closed', () => {
      this.WinMain = null;
    })
    
    this.WinMain.webContents.openDevTools();
  }

  GetWindow(): BrowserWindow {
    if (this.WinMain === undefined)
      this.CreateWindow();

    return this.WinMain;
  }

  static GetInstance(): MainProcess {
    if (this.Instance === undefined) {
      this.Instance = new MainProcess();
      this.Instance.SocketService = SocketService.GetInstance();
      this.Instance.WindowSend('lock-wallet', true);
      this.Instance.CreateWindow();
      IPCService.StartIPCService();
    }
      
    return this.Instance;
  }

  WindowSend(route: string, args: any) {
    if (this.WinMain === undefined)
      return;
    
    this.WinMain.webContents.send(route, args);
  }

  HideWindow() {
    if (this.WinMain === undefined)
      return;

    this.WinMain.hide();
  }

  ShowWindow() {
    if (this.WinMain === undefined)
      return;

    this.WinMain.show();
  }
}

app.on('ready', () => { MainProcess.GetInstance(); });
app.on('activate', () => { MainProcess.GetInstance().GetWindow(); });
app.on('window-all-closed', () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
