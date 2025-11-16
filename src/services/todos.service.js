import { test } from '@playwright/test';

export class ToDosService {
  constructor(request) {
    this.request = request;
  }

  async get(token, testinfo) {
    return test.step('GET /todos', async () => {
      const r = await this.request.get(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token },
      });
      const body = await r.json();
      return body;
    });
  }

  async getById(id, token, testinfo) {
    return test.step('GET /todos/${id}', async () => {
      const r = await this.request.get(`${testinfo.project.use.apiURL}/todos/${id}`, {
        headers: { 'X-CHALLENGER': token },
      });
      return r;
    });
  }

  async post(token, testinfo, todo) {
    return test.step('POST /todos', async () => {
      const r = await this.request.post(`${testinfo.project.use.apiURL}/todos`, {
        ignoreHTTPSErrors: true,
        headers: { 'X-CHALLENGER': token },
        data: todo,
      });
      //const resp = await r.json();
      return r;
    });
  }

  async createDoneTodo(token, testinfo) {
    return test.step('Create todo with doneStatus', async () => {
      const resp = await this.request.post(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token },
        data: {
          title: 'Done',
          description: 'some text',
          doneStatus: true,
        },
      });
      return resp;
    });
  }
}
