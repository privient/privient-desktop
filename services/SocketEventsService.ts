import { RequestService } from './RequestService';
import { DataService } from './DataService';

import * as Notifier from 'node-notifier'

// These are defined by the route they belong to.
export namespace SocketEventsService {
    export function RequestData(msg) {
        Notifier.notify({ title: 'Privient', sound: false, message: `${msg.data.appname} is requesting data.`});
        RequestService.GetInstance().PushRequest(msg);
    }

    export function SaveData(msg) {
        if (msg.data === undefined) {
            console.log('data is undefined');
            return;
        }

        if (msg.data.appname === undefined) {
            console.log('appname is undefined');
            return;
        }

        DataService.SetDataByAppName(msg.data.appname, JSON.stringify(msg.data));
    }
}