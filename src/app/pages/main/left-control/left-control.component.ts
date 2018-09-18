import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LocalStorageService } from '../../../services/local-storage.service';
import { USERNAME } from '../../../services/local-storage.namespace';
import { ListComponent } from "./list/list.component";

@Component({
  selector: 'app-left-control',
  templateUrl: './left-control.component.html',
  styleUrls: ['./left-control.component.less']
})
export class LeftControlComponent implements OnInit {

  @Input()
  isCollapsed: boolean;

  @ViewChild(ListComponent)
  listComponent: ListComponent;

  username: String;

  constructor(
    private local: LocalStorageService
  ) { }

  ngOnInit() {
    this.username = this.local.get(USERNAME);
  }

  
  openAddListModal(): void {
    // 在 Angular 中调用子组件
    this.listComponent.openAddListModal();
  } 

}
