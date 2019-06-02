import { RequestService } from './RequestService';
import { DataService } from './DataService';

import * as Notifier from 'node-notifier'
import { SocketService } from './SocketService';
import { CryptoService } from './CryptoService';

import { MainProcess } from '../app';

// These are defined by the route they belong to.
export namespace SocketEventsService {
    export function RequestData(msg) {
        Notifier.notify({ 
            title: 'Privient', 
            sound: false, 
            message: `${msg.data.appname} is requesting data.`,
            wait: true,
            actions: ['Accept', 'Decline']
        });

        Notifier.on('click', (notifierObject, options) => {
            MainProcess.GetInstance().WindowSend('route', '/requests');
        });
        
        RequestService.GetInstance().PushRequest(msg);
    }

    export function SaveData(msg) {
        if (msg.data === undefined) {
            SocketService.GetInstance().SendSocketMessage(JSON.stringify({route: 'bad-data'}))
            return;
        }

        if (msg.data.appname === undefined) {
            SocketService.GetInstance().SendSocketMessage(JSON.stringify({route: 'bad-data'}))
            return;
        }

        if (!CryptoService.GetInstance().Status) {
            SocketService.GetInstance().SendSocketMessage(JSON.stringify({route: 'locked-wallet'}))
            return;
        }

        delete msg.id;
        DataService.SetDataByAppName(msg.data.appname, JSON.stringify(msg.data));
    }
}