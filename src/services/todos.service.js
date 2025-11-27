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
}
