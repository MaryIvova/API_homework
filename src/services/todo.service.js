import { test } from '@playwright/test';

export class ToDoService {
  constructor(request) {
    this.request = request;
  }

  async getToDo(token, testinfo) {
    return test.step('GET /todo', async () => {
      const response = await this.request.get(`${testinfo.project.use.apiURL}/todo`, {
        headers: { 'X-CHALLENGER': token },
      });
      return response;
    });
  }
}
