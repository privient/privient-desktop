import { ipcMain } from "electron";
import { CryptoService } from './CryptoService';
import { MainProcess } from '../app';
import { SocketService } from './SocketService';
import { RequestService } from './RequestService';

export namespace IPCService {
    export function StartIPCService() {
        ipcMain.on('unlock-wallet', (event, arg) => {
            if (arg.result) {
                CryptoService.KillInstance();
            } else {
                CryptoService.GetInstance().SetupInstance(arg.password);
            }
        });
        
        ipcMain.on('restore-app', (event, arg) => {
            var main = MainProcess.GetInstance();
            main.WinMain.setMaximizable(true);
        
            main.WinMain.setMaximizable(true);
            if (!main.WinMain.isMaximized()) {
                main.WinMain.maximize();
            } else {
                main.WinMain.unmaximize();
            }
        });
        
        ipcMain.on('close-app', (event, arg) => {
            MainProcess.GetInstance().WinMain.close();
        });
        
        ipcMain.on('minimize-app', (event, arg) => {
            MainProcess.GetInstance().WinMain.minimize();
        });
        
        // Retrieve all the data requests that are currently in queue.
        // This is required store states for data requests.
        ipcMain.on('pull-data-requests', () => {
            var transactions = RequestService.GetInstance().Requests;
            MainProcess.GetInstance().WindowSend('request-data', transactions);
        });
        
          // Accept an existing data request.
        ipcMain.on('accept-data-request', (event, id) => {
            var requestService = RequestService.GetInstance();
            
            var result = requestService.Requests.find(x => x.id == id)
            
            if (result == undefined || result == null) {
                requestService.UpdateRequests();
                return;
            }
            
            var wasRemoved = requestService.RemoveRequest(id);

            if (!wasRemoved) {
                requestService.UpdateRequests();
                return;
            }

            console.log('Ready to retrieve data for:');
            console.log(result);
        });
        
          // Decline an existing data request.
        ipcMain.on('decline-data-request', (event, id) => {
            var wasRemoved = RequestService.GetInstance().RemoveRequest(id);
            console.log(wasRemoved);
        });
    }
}


