import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DataService } from '../data.service';
import { LogDebugger } from '../log-debugger.service';

@Component({
  selector: 'list-component',
  template: `
    <ul>
      <li *ngFor="let item of items | async">
        {{item.id}}: {{item.name}} lives in {{item.country}}
      </li>  
    </ul>
  `
})
export class ListComponent implements OnInit {
  
  items:Observable<Array<any>>;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.items = this.dataService.getItems();
  }

}