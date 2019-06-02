import { ipcMain } from "electron";
import { CryptoService } from './CryptoService';
import { MainProcess } from '../app';
import { SocketService } from './SocketService';
import { RequestService } from './RequestService';
import { DataService } from './DataService';

export namespace IPCService {
    export function StartIPCService() {
        ipcMain.on('unlock-wallet', (event, arg) => {
            if (arg.result) {
                CryptoService.GetInstance().KillInstance();
            } else {
                console.log(arg);
                CryptoService.GetInstance().SetupInstance(arg.password);
            }
        });
        
        ipcMain.on('restore-app', (event, arg) => {
            let main = MainProcess.GetInstance();
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
            let transactions = RequestService.GetInstance().Requests;
            MainProcess.GetInstance().WindowSend('request-data', transactions);
        });
        
        // Accept an existing data request.
        ipcMain.on('accept-data-request', (event, id) => {
            let requestService = RequestService.GetInstance();
            
            let result = requestService.Requests.find(x => x.id == id)
            
            if (result == undefined || result == null) {
                requestService.UpdateRequests();
                return;
            }
            
            let wasRemoved = requestService.RemoveRequest(id);

            if (!wasRemoved) {
                requestService.UpdateRequests();
                return;
            }

            let promiseData = DataService.GetDataByAppName(result.data.appname);

            promiseData.then(
                (data) => {
                    let decrypt = CryptoService.GetInstance().DecryptBySession(data);
                    if (decrypt == undefined) {
                        console.log('failed to decrypt');
                        return;
                    }
                    
                    console.log(result);
                    SocketService.GetInstance().SendSocketMessage({ route: 'use-data', data: result });
                },
                (error) => {
                    console.log(error);
                    SocketService.GetInstance().SendSocketMessage({ route: 'no-data' });
                    return;
                }
            );

            
        });
        
          // Decline an existing data request.
        ipcMain.on('decline-data-request', (event, id) => {
            let wasRemoved = RequestService.GetInstance().RemoveRequest(id);

            if (!wasRemoved)
                return;

            SocketService.GetInstance().SendSocketMessage({ route: 'declined' });
        });

        ipcMain.on('lock-wallet', (event) => {
            CryptoService.GetInstance().KillInstance();
        });
    }
}


