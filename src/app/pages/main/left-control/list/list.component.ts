import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { takeUntil } from "rxjs/operators";
import { List } from "../../../../domain/entities";
import { Subject } from 'rxjs';
import { ListService } from "../../../../services/list/list.service";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit, OnDestroy {


  @Input()
  isCollapsed: boolean;

  @ViewChild('listInput')
  private listInput: ElementRef;

  currentListUuid: string;
  lists: List[];
  addListModalVisible: boolean;

  private destroy$ = new Subject();

  constructor(
    private listService: ListService
  ) { }

  click(uuid: string): void {
    this.currentListUuid = uuid;
  }

  openAddListModal(): void {
    this.addListModalVisible = true;
    setTimeout(() => {
      this.listInput.nativeElement.focus();
    });
  }

  closeAddListModal(): void {
    this.addListModalVisible = false;
  }

  add(title: string): void {
    this.listService.add(title);
    this.closeAddListModal();
  }

  ngOnInit(): void {
    this.listService.lists$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lists => {
        this.lists = lists;
      })

    this.listService.currentUuid$
      .pipe(takeUntil(this.destroy$))
      .subscribe(uuid => {
        this.currentListUuid = uuid;
      });

    this.listService.getAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

}
