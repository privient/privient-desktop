import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { IpcMessageEvent } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  locked: boolean = true;
  connection: boolean = false;
  newRequest: boolean = false;
  audioState: boolean = true;
  title: string = 'Privient Desktop';

  requests: Array<any> = [];

  constructor(public es: ElectronService, public cdr: ChangeDetectorRef) {
    es.ipcRenderer.on('connection-status', (event, arg) => { this.setConnectionState(event, arg); });
    es.ipcRenderer.on('request-data', (event, arg) => { this.requestData(cdr, event, arg); });
    es.ipcRenderer.on('lock-wallet', (event, arg) => { this.lockWallet(event, arg); });
  }

  private setConnectionState(event: IpcMessageEvent, arg: any) {
    this.connection = arg;

    if (this.connection && this.audioState) {
      var audio = new Audio('./assets/on.ogg');
      audio.play();
    }
    
    if (!this.connection && this.audioState) {
      var audio = new Audio('./assets/off.ogg');
      audio.play();
    }

    this.cdr.detectChanges();
    console.log(arg);
  }

  private requestData(detector: ChangeDetectorRef, event: IpcMessageEvent, arg: any) {
    this.newRequest = true;

    if (this.audioState) {
      var audio = new Audio('./assets/notify.ogg');
      audio.play();
    }

    this.requests.push(JSON.stringify(arg));
    this.cdr.detectChanges();
    console.log(arg);
  }

  lockWallet(event: IpcMessageEvent, arg: any) {
    this.locked = arg;
    this.cdr.detectChanges();
  }

  DataRequestAction(event: any, info: string, accept: boolean) {
    var result = this.requests.indexOf(info);

    if (result == -1) {
      return;
    }

    var acceptedRequest = this.requests.splice(result, 1);
    this.cdr.detectChanges();

    if (!accept)
      return;

    console.log('accepted');
    this.es.ipcRenderer.send('accept-request', acceptedRequest);
  }
  
  UnlockWallet(event: any, pass: string) {
    this.es.ipcRenderer.send('unlock-wallet', { result: false, password: pass });
  }
}
