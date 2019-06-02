import * as WebSocket from 'ws';
import { MainProcess } from '../app';
import { SocketEventsService } from './SocketEventsService';
import { machineId, machineIdSync } from 'node-machine-id';

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
            MainProcess.GetInstance().WindowSend('connection-status', true);
            
            ws.send(JSON.stringify({ route: "machine", data: machineIdSync() }));
            

            ws.on('close', () => {
                MainProcess.GetInstance().WindowSend('connection-status', false);
            });

            // Recieve transaction information.
            ws.on('message', (msg) => { this.HandleSocketMessage(ws, msg); });
        });
    }

    SendSocketMessage(msg) {
        this.Socket.clients.forEach((ws) => {
            ws.send(JSON.stringify(msg));
        });
    }

    private HandleSocketMessage(ws, msg) {
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

        // Append an id to this message.
        dataId += 1;
        result['id'] = dataId;

        // request-data
        if (result.route === 'request-data') {
            SocketEventsService.RequestData(result);
            return;
        }

        // save-data
        if (result.route === 'save-data') {
            SocketEventsService.SaveData(result);
            return;
        }
    }
}
