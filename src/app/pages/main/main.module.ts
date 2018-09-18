import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { MainRoutingModule } from "./main-routing.module";
import { LeftControlComponent } from './left-control/left-control.component';
import { ListComponent } from './left-control/list/list.component';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    MainRoutingModule
  ],
  declarations: [MainComponent, LeftControlComponent, ListComponent]
})
export class MainModule { }
