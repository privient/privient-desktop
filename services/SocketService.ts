import * as WebSocket from 'ws';
import { MainProcess } from '../app';
import { CryptoService } from './CryptoService';
import { DataService } from './DataService';
import * as Notifier from 'node-notifier'

/*
Simple Transaction:
{
  "route": "request-data",
  "display": true,
  "data": {
    "appname": "xyz"
  }
}

{
  "route": "save-data",
  "display": false,
  "data": {
    "appname": "xyz",
    "username": "stuyk"
  }
}
*/

const ValidRouteRequests: Array<string> = [
    'request-data'
]

// These don't go past a front-end request.
const HaltRouteRequests: Array<string> = [
    'request-data'
]

// Singleton
export class SocketService {
    private static Instance: SocketService;
    private static Socket: WebSocket.Server;

    private constructor() { }

    static GetInstance() {
        if (this.Instance === undefined) {
            this.Instance = new SocketService();
            this.Socket = new WebSocket.Server({port: 8112});
            this.StartSocketService();
        }
        return this.Instance;
    }

    static StartSocketService() {
        this.Socket.setMaxListeners(1);

        this.Socket.on('connection', (ws: any) => {
            if (ws._socket.remoteAddress !== "::1") {
                ws.close();
                return;
            }

            MainProcess.WindowSend('connection-status', true);

            ws.on('close', () => {
                MainProcess.WindowSend('connection-status', false);
            });

            // Recieve transaction information.
            ws.on('message', (msg) => { this.HandleSocketMessage(ws, msg); });
        });
    }

    private static HandleSocketMessage(ws, msg) {
        // Parse Data
        var result: any;

        try {
            result = JSON.parse(msg);
        } catch(err) {
            result = msg;
        }

        if (result.route === undefined || result.data === undefined) {
            ws.send(JSON.stringify({ success: false, message: 'Failed to parse json data.'}));
            return;
        }

        if (!ValidRouteRequests.includes(result.route)) {
            ws.send(JSON.stringify({ success: false, message: 'That is not a valid route.'}));
            return;
        }

        if (result.route == 'request-data') {
            console.log('testabc')
            
            Notifier.notify({ title: 'Privient', message: `${result.data.appname} is requesting data.`});
        }

        if (result.display !== undefined && result.display) {
            MainProcess.WindowSend(result.route, result.data);
        }
        
        if (HaltRouteRequests.includes(result.route)) {
            return;
        }

        // Rest of cases go here:
        if (result.route === 'save-data') {
            if (CryptoService.Status) {
                this.SaveData(result.data.appname, result.data);
            } else {

            }
        }
    }

    private static SaveData(appName: string, data: any) {
        DataService.SetDataByAppName(appName, data);
    }
}
