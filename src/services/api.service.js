import { ChallengerService, ChallengesService, ToDosService, ToDoService } from './index';

export class Api {
  constructor(request) {
    this.request = request;
    this.challenger = new ChallengerService(request);
    this.challenges = new ChallengesService(request);
    this.todos = new ToDosService(request);
    this.todo = new ToDoService(request);
  }
}
