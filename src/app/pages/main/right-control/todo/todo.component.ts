import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Todo, List } from "../../../../domain/entities";
import { Subject, combineLatest } from "rxjs";
import { TodoService } from "../../../../services/todo/todo.service";
import { ListService } from "../../../../services/list/list.service";
import { takeUntil } from 'rxjs/operators';
import { floorToDate, getTodayTime } from '../../../../../utils/times';
import { NzDropdownService, NzDropdownContextComponent } from 'ng-zorro-antd';
import { Router } from '@angular/router';

const rankerGenerator = (rank: string = 'title'): any => {
  if (rank === 'completeFlag') {
    return (t1: Todo, t2: Todo) => t1.completedFlag && !t2.completedFlag;
  }
  return (t1: Todo, t2: Todo) => t1[rank] > t2[rank];
};

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
  private todoMenu: NzDropdownContextComponent;

  todos: Todo[] = [];
  currentListUuid: string;
  currentContextTodo: Todo;
  lists: List[] = [];


  constructor(
    private todoService: TodoService,
    private listService: ListService,
    private dropdownService: NzDropdownService,
    private router: Router
  ) {

  }

  ngOnInit() {

    this.listService.lists$
      .pipe(takeUntil(this.destory$))
      .subscribe(lists => {
        this.lists = lists;
      });

    combineLatest(this.listService.currentUuid$, this.todoService.todo$, this.todoService.rank$)
      .pipe(takeUntil(this.destory$))
      .subscribe(sources => {
        this.currentListUuid = sources[0];
        this.processTodos(sources[0], sources[1], sources[2]);
      });

    this.todoService.getAll();
    this.listService.getAll();
  }

  private processTodos(listUUID: string, todos: Todo[], rank: string): void {
    const filteredTodos = todos
      .filter(todo => {
        // 1.today 显示今日及之前的任务
        // 2.todo 显示所有任务
        // 3.显示指定列表的任务
        return ((listUUID === 'today' && todo.planAt && floorToDate(todo.planAt) <= getTodayTime())
          || (listUUID === 'todo' && (!todo.listUUID || todo.listUUID === 'todo'))
          || (listUUID === todo.listUUID));
      })
      .map(todo => Object.assign({}, todo) as Todo)
      .sort(rankerGenerator(rank));

    this.todos = [].concat(filteredTodos);
  }

  click(uuid: string): void {

  }

  toggle(todo: Todo): void {
    const isChecked = this.todoService.toggleTodoComplete(todo._id);
    todo.completedFlag = isChecked;
  }

  showItemMenu($event: MouseEvent, template: TemplateRef<void>, todo: Todo): void {
    this.currentContextTodo = todo;
    this.todoMenu = this.dropdownService.create($event, template);
  }

  add(title: string): void {
    this.todoService.add(title);
  }

  close(): void {
    this.todoMenu.close();
    this.todoMenu = null;
  }

  setToday(): void {
    this.todoService.setTodoToday(this.currentContextTodo._id);
  }

  listsExcept(uuid: string): List[] {
    return this.lists.filter(list => list._id != uuid);
  }

  moveToList(targetListUUID: string): void {
    this.todoService.moveToList(this.currentContextTodo._id, targetListUUID);
  }

  delete(): void {
    this.todoService.delete(this.currentContextTodo._id);
  }

  showDetail(uuid: string): void {
    this.router.navigateByUrl(`/main/${uuid}`);
  }
}
