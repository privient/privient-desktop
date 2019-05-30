import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { IpcMessageEvent } from 'electron';
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  // Forms:
  passwordRequest: FormGroup;
  newPasswordRequest: FormGroup;
  
  // From States
  passwordRequestSubmitted: boolean = false;


  // Wallet States
  locked: boolean = true;
  connection: boolean = false;
  audioState: boolean = true;

  // Wallet Data
  title: string = 'Privient Desktop';

  constructor(public es: ElectronService, public cdr: ChangeDetectorRef, public router: Router, private formBuilder: FormBuilder) {
    // Forms
    this.passwordRequest = this.formBuilder.group({
      password: ['', Validators.required]
    })
    
    es.ipcRenderer.on('connection-status', (event, arg) => { this.setConnectionState(event, arg); });
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

  lockWallet(event: IpcMessageEvent, arg: any) {
    this.locked = arg;
    this.cdr.detectChanges();
  }

  
  DataRequestAction(event: any, info: string, accept: boolean) {
    /*
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
    */
  }

  // Application Router
  route(event: any, location: string) {
    this.router.navigateByUrl("/" + location);
  }

  // Application Actions
  closeApp(event: any) {
    this.es.ipcRenderer.send('close-app');
  }

  minimizeApp(event: any) {
    this.es.ipcRenderer.send('minimize-app');
  }

  restoreApp(event: any) {
    this.es.ipcRenderer.send('restore-app');
  }

  // Application From Actions
  SubmitPassword() {
    this.passwordRequestSubmitted = true;
    
    if (!this.passwordRequest.valid) {
      this.passwordRequestSubmitted = false;
      return;
    }

    let password = this.passwordRequest.value;

    if (password == undefined || password == null) {
      this.passwordRequestSubmitted = false;
      return;
    }

    this.es.ipcRenderer.send('unlock-wallet', { result: false, password: password });
  }
}
