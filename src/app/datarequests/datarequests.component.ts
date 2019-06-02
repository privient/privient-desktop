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
    this.requests = [];
    this.ipcEvents();
    this.es.ipcRenderer.send('pull-data-requests');
  }

  private ipcEvents() {
    this.es.ipcRenderer.on('request-data', (event, arg) => { this.requestData(event, arg); });
  }

  private requestData(event: any, arg: any) {
    this.requests = arg as Array<any>;
    this.newRequest = true;
    this.CheckForChanges();
  }

  DataRequestAction(event: any, request: any, accept: boolean) {
    if (accept)
      this.es.ipcRenderer.send('accept-data-request', request.id);
    else
      this.es.ipcRenderer.send('decline-data-request', request.id);
  }

  private CheckForChanges() {
    if (!this.cdr['destroyed']) {
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
  }

}
