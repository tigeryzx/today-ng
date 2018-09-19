import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../../../services/todo/todo.service';

@Component({
  selector: 'app-quick-add',
  templateUrl: './quick-add.component.html',
  styleUrls: ['./quick-add.component.less']
})
export class QuickAddComponent implements OnInit {

  constructor(
    private todoService: TodoService
  ) { }

  ngOnInit() {
  }

  addTodo(title: string): void {
    if(title)
      this.todoService.add(title);
  }
}
