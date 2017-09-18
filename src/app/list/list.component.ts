import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { LogDebugger } from '../log-debugger.service';

@Component({
  selector: 'list-component',
  template: `
    <ul>
      <li *ngFor="let item of items">
        {{item.id}}: {{item.name}} lives in {{item.country}}
      </li>
    </ul>
  `,
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  items:Array<any>;

  constructor(private dataService: DataService, private log: LogDebugger) { }

  ngOnInit() {
    this.log.debug('Getting items...');
    this.items = this.dataService.getItems();
    this.log.debug('Got items!');
  }

}
