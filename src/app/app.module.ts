import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';

import { DataService } from './data.service';
import { LogDebugger } from './log-debugger.service'
import { ConsoleService } from './console.service';

export function consoleFactory(consoleService) {
  return new LogDebugger(consoleService, true);
}

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    DataService,
    ConsoleService,
    {
      provide: LogDebugger,
      useFactory: consoleFactory,
      deps: [ConsoleService]
    },
    {
      provide: 'apiUrl',
      useValue: './src/api'
    }
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
