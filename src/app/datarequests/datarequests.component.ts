import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from '../providers/electron.service';

@Component({
  selector: 'app-datarequests',
  templateUrl: './datarequests.component.html',
  styleUrls: ['./datarequests.component.sass']
})
export class DatarequestsComponent implements OnInit {
  requests: Array<any> = [];
  newRequest: boolean = false;
  audioState: boolean = true;

  constructor(public es: ElectronService, public cdr: ChangeDetectorRef) { 
    es.ipcRenderer.on('request-data', (event, arg) => { this.requestData(event, arg); });
  }

  private requestData(event: any, arg: any) {
    this.newRequest = true;

    if (this.audioState) {
      var audio = new Audio('./assets/notify.ogg');
      audio.play();
    }

    this.requests.push(JSON.stringify(arg));
    this.cdr.detectChanges();
    console.log(arg);
  }

  ngOnInit() {
  }

}
