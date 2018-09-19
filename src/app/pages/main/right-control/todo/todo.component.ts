import { Component, OnInit, OnDestroy } from '@angular/core';
import { Todo } from "../../../../domain/entities";
import { Subject, combineLatest } from "rxjs";
import { TodoService } from "../../../../services/todo/todo.service";
import { ListService } from "../../../../services/list/list.service";
import { takeUntil } from 'rxjs/operators';
import { floorToDate, getTodayTime } from '../../../../../utils/times';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.less']
})
export class TodoComponent implements OnInit, OnDestroy {

  ngOnDestroy(): void {
    this.destory$.next();
  }

  private destory$ = new Subject();

  todos: Todo[] = [];
  currentListUuid: string;

  constructor(
    private todoService: TodoService,
    private listService: ListService
  ) {

  }

  ngOnInit() {

    combineLatest(this.listService.currentUuid$, this.todoService.todo$)
      .pipe(takeUntil(this.destory$))
      .subscribe(sources => {
        this.processTodos(sources[0], sources[1]);
      });

    this.todoService.getAll();
  }

  private processTodos(listUUID: string, todos: Todo[]): void {
    const filteredTodos = todos
      .filter(todo => {
        // 1.today 显示今日及之前的任务
        // 2.todo 显示所有任务
        // 3.显示指定列表的任务
        return ((listUUID === 'today' && todo.planAt && floorToDate(todo.planAt) <= getTodayTime())
          || (listUUID === 'todo' && (!todo.listUUID || todo.listUUID === 'todo'))
          || (listUUID === todo.listUUID));
      })
      .map(todo => Object.assign({}, todo) as Todo);

    this.todos = [].concat(filteredTodos);
  }

  click(uuid: string): void {

  }

  toggle(todo: Todo): void {
    console.log(todo);
    todo.completedFlag = !todo.completedFlag;
    this.todoService.toggleTodoComplete(todo._id);
  }

  add(title: string): void {
    this.todoService.add(title);
  }
}
