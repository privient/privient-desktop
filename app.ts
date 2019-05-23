import { app, BrowserWindow, ipcMain } from 'electron';
import { SocketService } from './services/SocketService';
import { CryptoService } from './services/CryptoService';
import * as path from 'path';
import * as url from 'url';
import { DataService } from './services/DataService';

const defaultPage = url.format({
  pathname: path.join(__dirname, `./index.html`),
  protocol: "file:",
  slashes: true
});

// Singleton
export class MainProcess {
  private static Instance: MainProcess;
  private static WinMain: BrowserWindow;
  private static SocketService: SocketService;
  private static CryptoService: CryptoService;

  private constructor() { }

  static CreateWindow() {
    if (this.WinMain !== undefined)
      return;

    this.WinMain = new BrowserWindow({ width: 800, height: 600, autoHideMenuBar: true, webPreferences: { nodeIntegration: true } });
    this.WinMain.loadURL(defaultPage);
    this.WinMain.on('closed', () => {
      this.WinMain = null;
    })
    
    this.WinMain.webContents.openDevTools();
    this.IPCEvents();
  }

  static GetWindow(): BrowserWindow {
    if (this.WinMain === undefined)
      this.CreateWindow();

    return this.WinMain;
  }

  static GetInstance(): MainProcess {
    if (this.Instance === undefined) {
      this.Instance = new MainProcess();
      this.SocketService = SocketService.GetInstance();
      this.WindowSend('lock-wallet', true);
      this.CreateWindow();
    }
      
    return this.Instance;
  }

  public static WindowSend(route: string, args: any) {
    if (this.WinMain === undefined)
      return;
    
    this.WinMain.webContents.send(route, args);
  }

  static HideWindow() {
    if (this.WinMain === undefined)
      return;

    this.WinMain.hide();
  }

  static ShowWindow() {
    if (this.WinMain === undefined)
      return;

    this.WinMain.show();
  }

  private static IPCEvents() {
    ipcMain.on('unlock-wallet', (event, arg) => {
      if (arg.result) {
        CryptoService.KillInstance();
      } else {
        this.CryptoService = CryptoService.GetInstance(arg.password);
      }
    });
  }
}

app.on('ready', () => { MainProcess.GetInstance(); });
app.on('activate', () => { MainProcess.GetWindow(); });
app.on('window-all-closed', () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
