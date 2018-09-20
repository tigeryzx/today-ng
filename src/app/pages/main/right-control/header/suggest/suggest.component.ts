import { Component, OnInit, OnDestroy } from '@angular/core';
import { Todo } from '../../../../../domain/entities';
import { TodoService } from '../../../../../services/todo/todo.service';
import { Subscription } from 'rxjs';
import { floorToDate, getTodayTime, ONE_DAY } from '../../../../../../utils/times';

@Component({
  selector: 'app-suggest',
  templateUrl: './suggest.component.html',
  styleUrls: ['./suggest.component.less']
})
export class SuggestComponent implements OnInit,OnDestroy {

  ngOnDestroy(): void {
    this.todo$.unsubscribe();
  }

  suggestedTodo: Todo[] = [];

  private todo$: Subscription;

  constructor(private todoService: TodoService) {

  }

  ngOnInit() {
    this.todo$ = this.todoService.todo$
      .subscribe(todos => {
        const filtered = todos.filter(t => {
          if (t.planAt && floorToDate(t.planAt) <= getTodayTime()) { return false; }
          if (t.dueAt && t.dueAt - getTodayTime() <= ONE_DAY * 2) { return true; }
          return false;
        });
        this.suggestedTodo = [].concat(filtered);
      });
  }
  setTodoToday(todo: Todo): void { 
    this.todoService.setTodoToday(todo._id);
  }
}
