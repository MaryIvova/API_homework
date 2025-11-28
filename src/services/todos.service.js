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
      //const resp = await r.json();
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
      //const resp = await r.json();
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

  async getApplicationXML(token, testinfo) {
    return test.step('GET /todos', async () => {
      const resp = await this.request.get(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token, Accept: 'application/xml' },
      });
      const body = await resp.text();
      return body;
      //return resp;
    });
  }

  async getApplicationJSON(token, testinfo) {
    return test.step('GET /todos', async () => {
      const resp = await this.request.get(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token, Accept: 'application/json' },
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

  async getApplicationGzip(token, testinfo) {
    return test.step('GET /todos', async () => {
      const resp = await this.request.get(`${testinfo.project.use.apiURL}/todos`, {
        headers: { 'X-CHALLENGER': token, Accept: 'application/gzip' },
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

  async overrideDelete(token, testinfo, todo) {
    return test.step('POST /heartbeat', async () => {
      const r = await this.request.post(`${testinfo.project.use.apiURL}/heartbeat`, {
        ignoreHTTPSErrors: true,
        headers: { 'X-CHALLENGER': token, 'X-HTTP-Method-Override': 'DELETE' },
      });
      //const resp = await r.json();
      return r;
    });
  }

  async overridePATCH(token, testinfo, todo) {
    return test.step('POST /heartbeat', async () => {
      const r = await this.request.post(`${testinfo.project.use.apiURL}/heartbeat`, {
        ignoreHTTPSErrors: true,
        headers: { 'X-CHALLENGER': token, 'X-HTTP-Method-Override': 'PATCH' },
      });
      //const resp = await r.json();
      return r;
    });
  }

  async overrideTRACE(token, testinfo, todo) {
    return test.step('POST /heartbeat', async () => {
      const r = await this.request.post(`${testinfo.project.use.apiURL}/heartbeat`, {
        ignoreHTTPSErrors: true,
        headers: { 'X-CHALLENGER': token, 'X-HTTP-Method-Override': 'TRACE' },
      });
      //const resp = await r.json();
      return r;
    });
  }
}
