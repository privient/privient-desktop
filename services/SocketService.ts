import * as WebSocket from 'ws';
import { MainProcess } from '../app';
import { CryptoService } from './CryptoService';
import { DataService } from './DataService';
import * as Notifier from 'node-notifier'
import { RequestService } from './RequestService';

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

var dataId = 0;

// Singleton
export class SocketService {
    private static Instance: SocketService;
    private Socket: WebSocket.Server;
    private constructor() { }

    static GetInstance() {
        if (this.Instance === undefined) {
            this.Instance = new SocketService();
            this.Instance.Socket = new WebSocket.Server({port: 8112});
            this.Instance.StartSocketService();
        }
        return this.Instance;
    }

    StartSocketService() {
        this.Socket.setMaxListeners(1);

        this.Socket.on('connection', (ws: any) => {
            if (ws._socket.remoteAddress !== "::1") {
                ws.close();
                return;
            }

            MainProcess.GetInstance().WindowSend('connection-status', true);

            ws.on('close', () => {
                MainProcess.GetInstance().WindowSend('connection-status', false);
            });

            // Recieve transaction information.
            ws.on('message', (msg) => { this.HandleSocketMessage(ws, msg); });
        });
    }

    private HandleSocketMessage(ws, msg) {
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

        // Increase data id for each transaction recieved.
        dataId += 1;
        result['id'] = dataId;

        if (result.route == 'request-data') {
            Notifier.notify({ title: 'Privient', message: `${result.data.appname} is requesting data.`});
            RequestService.GetInstance().PushRequest(result);
        }
        
        if (HaltRouteRequests.includes(result.route)) {
            return;
        }

        // Rest of cases go here:
        if (result.route === 'save-data') {
            if (CryptoService.GetInstance().Status) {
                this.SaveData(result.data.appname, result.data);
            } else {

            }
        }
    }

    private SaveData(appName: string, data: any) {
        DataService.SetDataByAppName(appName, data);
    }
}
