import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ElectronService } from './providers/electron.service';
import { DataComponent } from './data/data.component';
import { BackupComponent } from './backup/backup.component';
import { SettingsComponent } from './settings/settings.component';
import { AboutComponent } from './about/about.component';
import { DatarequestsComponent } from './datarequests/datarequests.component';

@NgModule({
  declarations: [
    AppComponent,
    DataComponent,
    BackupComponent,
    SettingsComponent,
    AboutComponent,
    DatarequestsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
