import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Todo } from '../../../domain/entities';
import { TodoService } from '../../../services/todo/todo.service';
import { first } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { lessThanADay, floorToDate, getTodayTime, floorToMinute, getCurrentTime } from '../../../../utils/times';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.less']
})
export class DetailComponent implements OnInit {

  private trueSource: Todo;
  currentTodo: Todo;
  dueDate: Date;
  planDate: Date;
  visible: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todoService: TodoService,
    private message: NzMessageService
  ) {

  }

  ngOnInit() {

    // 在路由中获取参数并初始化显示信息
    this.route.paramMap
      .pipe(first())
      .subscribe((paramsMap: ParamMap) => {
        const id = paramsMap.get('id');
        const todo = this.todoService.getByUUID(id);
        this.trueSource = todo;
        this.currentTodo = Object.assign({}, todo) as Todo;
        if (todo.dueAt) {
          this.dueDate = new Date(todo.dueAt);
        }
        if (todo.planAt) {
          this.planDate = new Date(todo.planAt);
        }
      });
  }

  handlePlanDateChange(date: Date): void {
    const t = date ? date.getTime() : undefined;
    if (!t) {
      this.currentTodo.notifyMe = false;
    }
    this.currentTodo.planAt = t;
    this.checkDate();
  }

  handleDueDateChange(date: Date): void {
    const dueAt = date ? date.getTime() : undefined;
    this.currentTodo.dueAt = dueAt;
    if (dueAt && lessThanADay(dueAt)) {
      this.message.warning('项目将会在 24 小时内到期', {
        nzDuration: 6000
      });
    }
    this.checkDate();
  }

  private checkDate(): void {
    const { dueAt, planAt } = this.currentTodo;
    if (dueAt && planAt && floorToDate(planAt) > dueAt) {
      this.message.warning('你确定要在到期之后才开始做这个项目吗？', {
        nzDuration: 6000
      });
    }
  }

  dueDisabledDate = (d: Date): boolean => floorToDate(d) < getTodayTime();
  planDisabledDate = (d: Date): boolean => floorToMinute(d) < getCurrentTime();


  close(): void {
    this.visible = false;
    setTimeout(() => {
      this.router.navigateByUrl('main');
    }, 500);
  }

  clickSwitch(): void {
    if (this.currentTodo.completedFlag) { return; }
    if (!this.currentTodo.planAt) {
      this.message.warning('尚未设置计划日期');
      return;
    }
    this.currentTodo.notifyMe = !this.currentTodo.notifyMe;
  }

  confirm(): void {
    this.todoService.update(this.currentTodo);
    this.close();
  }

  delete(): void {
    this.todoService.delete(this.currentTodo._id);
    this.close();
  }
}
