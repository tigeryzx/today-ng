import { Component, OnInit, OnDestroy } from '@angular/core';
import { TodoService } from '../../../../services/todo/todo.service';
import { ListService } from '../../../../services/list/list.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit, OnDestroy {

  ngOnDestroy(): void {
    this.currentList$.unsubscribe();
  }

  private currentList$: Subscription;

  listTitle: string = '';

  constructor(
    private todoService: TodoService,
    private listService: ListService
  ) { }

  ngOnInit() {
    this.currentList$ = this.listService.current$.subscribe(list => {
      this.listTitle = list ? list.title : '';
    });
  }

  switchRankType(rank: string): void {
    this.todoService.toggleRank(rank);
  }
}
