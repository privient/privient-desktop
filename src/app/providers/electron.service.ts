import { Injectable } from "@angular/core";
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    ipcRenderer: typeof ipcRenderer;
    webFrame: typeof webFrame;
    childProcess: typeof childProcess;
    remote: typeof remote;
    fs: typeof fs;

    constructor() {
        if (this.isElectron()) {
            this.ipcRenderer = window.require('electron').ipcRenderer;
            this.webFrame = window.require('electron').webFrame;
            this.remote = window.require('electron').remote;
            this.childProcess = window.require('child_process');
            this.fs = window.require('fs');
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }
}