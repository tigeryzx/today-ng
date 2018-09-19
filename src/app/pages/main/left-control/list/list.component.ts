import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { takeUntil } from "rxjs/operators";
import { List } from "../../../../domain/entities";
import { Subject } from 'rxjs';
import { ListService } from "../../../../services/list/list.service";
import { TodoService } from "../../../../services/todo/todo.service";
import { NzDropdownService, NzDropdownContextComponent, NzModalService, ModalOptionsForService } from "ng-zorro-antd";

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

  @ViewChild('listRenameInput')
  private listRenameInput: ElementRef;

  currentListUuid: string;
  lists: List[];
  addListModalVisible: boolean;
  renameListModalVisible: boolean;
  contextListUuid: string;

  private dropdown: NzDropdownContextComponent;
  private destroy$ = new Subject();

  constructor(
    private listService: ListService,
    private dropdownService: NzDropdownService,
    private modal: NzModalService,
    private todoService: TodoService
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

  openRenameListModal(): void {
    this.renameListModalVisible = true;
    setTimeout(() => {
      const title = this.lists.find(l => l._id === this.contextListUuid).title;
      this.listRenameInput.nativeElement.value = title;
      this.listRenameInput.nativeElement.focus();
    });
  }

  closeRenameListModal(): void {
    this.renameListModalVisible = false;
  }

  rename(title: string): void {
    this.listService.rename(this.contextListUuid, title);
    this.listRenameInput.nativeElement.value = '';
    this.closeRenameListModal();
  }

  add(title: string): void {
    this.listService.add(title);
    this.listInput.nativeElement.value = '';
    this.closeAddListModal();
  }

  close(): void {
    this.dropdown.close();
    this.dropdown = null;
  }

  delete(): void {
    const uuid = this.contextListUuid;
    this.modal.confirm({
      nzTitle: '确认删除列表',
      nzContent: '列表下的所有待办事项也会同时被删除',
      nzOnOk: () => {
        new Promise((res, rej) => {
          this.todoService.deleteInList(uuid)
          this.listService.delete(uuid);
          res();
        }).catch(() => {
          console.error('Delete list failed');
        });
      }
    });

  }

  contextMenu($event: MouseEvent, contextTemplate: TemplateRef<void>, uuid: string): void {
    this.dropdown = this.dropdownService.create($event, contextTemplate);
    this.contextListUuid = uuid;
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
