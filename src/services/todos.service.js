import { test } from '@playwright/test';

export class ToDosService {
  constructor(request) {
    this.request = request;
  }

  async get(token, testinfo) {
    return test.step('GET /todos', async () => {
      const response = await this.request.get(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token },
      });
      return response;
    });
  }

  async getById(token, testinfo, id) {
    return test.step('GET /todos/${id}', async () => {
      const r = await this.request.get(`${testinfo.project.use.apiURL}/todos/${id}`, {
        ignoreHTTPSErrors: true,
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
      return r;
    });
  }

  async postById(token, testinfo, id, todo) {
    return test.step('POST /todos/{id}', async () => {
      const r = await this.request.post(`${testinfo.project.use.apiURL}/todos/${id}`, {
        ignoreHTTPSErrors: true,
        headers: { 'X-CHALLENGER': token },
        data: todo,
      });
      return r;
    });
  }

  async filterTodos(token, testinfo) {
    return test.step('GET /todos?doneStatus=true', async () => {
      const response = await this.request.get(
        `${testinfo.project.use.apiURL}/todos?doneStatus=true`,
        {
          headers: { 'X-CHALLENGER': token },
        },
      );
      return response;
    });
  }

  async getApplication(token, testinfo, applicationtype) {
    return test.step('GET /todos', async () => {
      const resp = await this.request.get(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token, Accept: applicationtype },
      });
      return resp;
    });
  }

  async getApplicationPrefer(token, testinfo) {
    return test.step('GET /todos', async () => {
      const resp = await this.request.get(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token, Accept: 'application/xml,application/json' },
      });
      return resp;
    });
  }

  async deleteTodo(token, testinfo, id) {
    return test.step('DELETE /todos/{id})', async () => {
      const response = await this.request.delete(`${testinfo.project.use.apiURL}/todos/${id}`, {
        headers: { 'X-CHALLENGER': token },
      });
      return response;
    });
  }

  async deleteHeartbeat(token, testinfo) {
    return test.step('DELETE /heatbeat)', async () => {
      const response = await this.request.delete(`${testinfo.project.use.apiURL}/heartbeat`, {
        headers: { 'X-CHALLENGER': token },
      });
      return response;
    });
  }

  async patchHeartbeat(token, testinfo) {
    return test.step('PATCH /heatbeat)', async () => {
      const response = await this.request.patch(`${testinfo.project.use.apiURL}/heartbeat`, {
        headers: { 'X-CHALLENGER': token },
      });
      return response;
    });
  }

  async heartbeat(type, token, testinfo, todo) {
    return test.step('POST /heartbeat', async () => {
      const r = await this.request.post(`${testinfo.project.use.apiURL}/heartbeat`, {
        ignoreHTTPSErrors: true,
        headers: { 'X-CHALLENGER': token, 'X-HTTP-Method-Override': type.toUpperCase() },
      });
      return r;
    });
  }

  async putError(token, testinfo, id, todo) {
    return test.step('PUT /todos{id}', async () => {
      const r = await this.request.put(`${testinfo.project.use.apiURL}/todos/${id}`, {
        ignoreHTTPSErrors: true,
        headers: { 'X-CHALLENGER': token },
      });
      return r;
    });
  }

  async putTodo(token, testinfo, id, todo) {
    return test.step('PUT /todos/{id}', async () => {
      const r = await this.request.put(`${testinfo.project.use.apiURL}/todos/${id}`, {
        headers: {
          'X-CHALLENGER': token,
          'Content-Type': 'application/json',
        },
        data: todo,
        ignoreHTTPSErrors: true,
      });
      return r;
    });
  }
}
