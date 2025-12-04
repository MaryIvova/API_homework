import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { test } from '../src/helpers/index';
import { ToDosService } from '../src/services/index';
import { ToDoBuilder } from '../src/helpers/builder';
import { json } from 'stream/consumers';

let token;

test.describe('Challenge', () => {
  test.beforeAll(async ({ api }, testinfo) => {
    let r = await api.challenger.post(testinfo);
    const headers = r.headers();
    console.log(`${testinfo.project.use.apiURL}${headers.location}`);
    token = headers['x-challenger'];
  });

  test('получить токен', async ({ request }, testinfo) => {
    let r = await request.get(`${testinfo.project.use.apiURL}/challenges`, {
      headers: { 'X-CHALLENGER': token },
    });
    const body = await r.json();
    expect(body.challenges.length).toBe(59);
    console.log(body.challenges);
  });

  test('3. Get/todos 200 @GET', async ({ request }, testinfo) => {
    let r = await request.get(`${testinfo.project.use.apiURL}/todos`, {
      headers: { 'X-CHALLENGER': token },
    });
    const body = await r.json();
    expect(body.todos.length).toBe(10);
    console.log(body.todos);
  });

  test('04 GET /todo (404) - wrong url @GET', async ({ request }, testinfo) => {
    let r = await request.get(`${testinfo.project.use.apiURL}/todo`, {
      headers: { 'X-CHALLENGER': token },
    });
    expect(r.status()).toBe(404);
  });

  test('05 GET /todos/{id} (200) - получить todo по id @GET', async ({ api }, testinfo) => {
    const todosService = new ToDosService(api.request);
    let r = await api.todos.get(token, testinfo);
    expect(r.status()).toBe(200);
    const todos = await r.json();
    let size = todos.todos.length;
    let index = Math.floor(Math.random() * (size - 1) + 1);
    let idTodo = todos.todos[index].id;
    r = await todosService.getById(token, testinfo, idTodo);
    expect(r.status()).toBe(200);
  });

  test('07 GET/todos ? (200) -  filter todos', async ({ api }, testinfo) => {
    const doneTodo = new ToDoBuilder(faker.string.alpha(10), true, faker.lorem.words()).generate();
    const notDoneTodo = new ToDoBuilder(
      faker.string.alpha(10),
      false,
      faker.lorem.words(),
    ).generate();
    let a = await api.todos.post(token, testinfo, doneTodo);
    const resp1 = await a.json();
    console.log(resp1);
    await api.todos.post(token, testinfo, notDoneTodo);
    let response = await api.todos.filterTodos(token, testinfo);
    const json = await response.json();
    const todos = json.todos[0];
    expect(response.status()).toBe(200);
    expect(todos.doneStatus).toBe(true);
  });

  test('10. POST/todos 400 - no doneStatus @POST', async ({ request }, testinfo) => {
    let r = await request.post(`${testinfo.project.use.apiURL}/todos`, {
      headers: { 'X-CHALLENGER': token },
      data: new ToDoBuilder(faker.lorem.word, faker.number.int(), faker.lorem.word).generate(),
    });
    expect.soft(r.status()).toBe(400);

    r = await request.post(`${testinfo.project.use.apiURL}/todos`, {
      headers: { 'X-CHALLENGER': token },
      data: new ToDoBuilder(faker.lorem.word, faker.lorem.word, faker.lorem.word).generate(),
    });
    expect.soft(r.status()).toBe(400);
    expect(test.info().errors).toHaveLength(0);
  });

  test('09. POST/todos 201 -  create ToDO @POST', async ({ request }, testinfo) => {
    const task = new ToDosService(request);
    const todoData = new ToDoBuilder(faker.string.alpha(10), true, faker.lorem.words()).generate();
    let response = await task.post(token, testinfo, todoData, false);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(201);
  });

  test('11. POST/todos 400 - title too long  @POST', async ({ request }, testinfo) => {
    let r = await request.post(`${testinfo.project.use.apiURL}/todos`, {
      headers: { 'X-CHALLENGER': token },
      data: new ToDoBuilder(faker.lorem.sentence(13), true, faker.lorem.words()).generate(),
    });
    const body = await r.json();
    console.log('Error response:', body);
    expect(r.status()).toBe(400);
  });

  test('12. POST/todos 400 - description too long  @POST', async ({ request }, testinfo) => {
    const wrongDescription = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.lorem.sentence(3),
      true,
      faker.string.alpha(202),
    ).generate();
    let response = await wrongDescription.post(token, testinfo, todoData, false);
    const body = await response.json();
    console.log('Error response:', body);
    expect(response.status()).toBe(400);
  });

  test('13. POST/todos 201 - max out content  @POST', async ({ request }, testinfo) => {
    const boundaryValues = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.string.alpha(50),
      true,
      faker.string.alpha(200),
    ).generate();
    let response = await boundaryValues.post(token, testinfo, todoData, false);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(201);
  });

  test('14. POST/todos 413 - content too long @POST', async ({ request }, testinfo) => {
    const boundaryValues = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.string.alpha(50),
      true,
      faker.string.alpha(5000),
    ).generate();
    let response = await boundaryValues.post(token, testinfo, todoData, false);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(413);
  });

  test('15. POST/todos 400 - non existing field  @POST', async ({ request }, testinfo) => {
    const boundaryValues = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.string.alpha(50),
      true,
      faker.string.alpha(200),
      'high',
    ).generate();
    let response = await boundaryValues.post(token, testinfo, todoData, false);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(400);
  });

  test('17. POST/todos{id} 200 -  update ToDO  by id @POST', async ({ api }, testinfo) => {
    const doneTodo = new ToDoBuilder(faker.string.alpha(10), true, faker.lorem.words()).generate();
    let createTodo = await api.todos.post(token, testinfo, doneTodo);
    const createdTodo = await createTodo.json();
    console.log(createTodo);
    expect(createTodo.status()).toBe(201);
    let getResponse = await api.todos.getById(token, testinfo, createdTodo.id);
    console.log('GET response status:', getResponse.status());
    const updatedTodo = new ToDoBuilder(
      `UPDATED-${faker.string.alpha(5)}`,
      true,
      `UPDATED-${faker.lorem.words()}`,
    ).generate();
    let updateResponse = await api.todos.postById(token, testinfo, createdTodo.id, updatedTodo);
    expect(updateResponse.status()).toBe(200);
  });

  test('16 PUT /todos/{id} (400)  - @PUT ', async ({ api }, testinfo) => {
    const putToDo = await api.todos.putError(token, testinfo, 33);
    expect(putToDo.status()).toBe(400);
  });

  test('19 PUT /todos/{id} (200)  - full update @PUT ', async ({ api }, testinfo) => {
    const notDoneTodo = new ToDoBuilder(
      faker.string.alpha(10),
      false,
      faker.lorem.words(),
    ).generate();
    let createTodo = await api.todos.post(token, testinfo, notDoneTodo);
    const createdTodo = await createTodo.json();
    console.log(createTodo);
    expect(createTodo.status()).toBe(201);
    const putUpdate = new ToDoBuilder(
      `UPDATED-${faker.string.alpha(5)}`,
      true,
      `UPDATED-${faker.lorem.words()}`,
    ).generate();
    let response = await api.todos.putTodo(token, testinfo, createdTodo.id, putUpdate);
    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log(body);
  });

  test('21 PUT /todos/{id} (400)  - erroe update @PUT ', async ({ api }, testinfo) => {
    const notDoneTodo = new ToDoBuilder(
      faker.string.alpha(10),
      false,
      faker.lorem.words(),
    ).generate();
    let createTodo = await api.todos.post(token, testinfo, notDoneTodo);
    const createdTodo = await createTodo.json();
    console.log(createTodo);
    expect(createTodo.status()).toBe(201);
    const putUpdate = new ToDoBuilder(
      `UPDATED-${faker.string.alpha(5)}`,
      true,
      `UPDATED-${faker.lorem.words()}`,
    ).generate();
    let response = await api.todos.putTodo(token, testinfo, 44, putUpdate);
    expect(response.status()).toBe(400);
  });

  test('23 DELETE/todos {id} @DELETE ', async ({ api }, testinfo) => {
    const doneTodo = new ToDoBuilder(faker.string.alpha(10), true, faker.lorem.words()).generate();
    let createTodo = await api.todos.post(token, testinfo, doneTodo);
    const createdTodo = await createTodo.json();
    console.log(createTodo);
    expect(createTodo.status()).toBe(201);
    let getResponse = await api.todos.deleteTodo(token, testinfo, createdTodo.id);
    expect(getResponse.status()).toBe(200);
  });

  test('25 GET/todos (200) -  XML', async ({ api }, testinfo) => {
    const response = await api.todos.getApplication(token, testinfo, 'application/xml');
    console.log(api.todos.getApplication.body);
    expect(response.status()).toBe(200);
    let xml = await response.text();
    expect(xml).toContain('<todos>');
  });

  test('26 GET/todos (200) -  JSON', async ({ api }, testinfo) => {
    const response = await api.todos.getApplication(token, testinfo, 'application/json');
    const headers = response.headers();
    console.log(`${testinfo.project.use.apiURL}${headers.location}`);
    const contentType = headers['content-type'];
    console.log(contentType);
    expect(contentType).toContain('application/json');
  });

  test('28 GET/todos (200) -  preferXML', async ({ api }, testinfo) => {
    const response = await api.todos.getApplicationPrefer(token, testinfo);
    const headers = response.headers();
    console.log(`${testinfo.project.use.apiURL}${headers.location}`);
    const xml = headers['content-type'];
    console.log(xml);
    expect(xml).toContain('application/xml');
  });

  test('30 GET/todos (406) -  header NOT ACCEPTABLE @GET', async ({ api }, testinfo) => {
    const response = await api.todos.getApplication(token, testinfo, 'application/gzip');
    expect(response.status()).toBe(406);
    expect(response.statusText()).toBe('Not Acceptable');
  });

  test('31 POST/todos  -  xml @POST', async ({ api }, testinfo) => {
    const doneTodo = new ToDoBuilder(faker.string.alpha(10), true, faker.lorem.words()).generate();
    const response = await api.todos.postContentType(token, testinfo, doneTodo, 'application/xml');
    const headers = response.headers();
    console.log(`${testinfo.project.use.apiURL}${headers.location}`);
    const contentType = headers['content-type'];
    console.log(contentType);
    expect(response.status()).toBe(201);
    expect(contentType).toContain('application/xml');
  });

  test('32 POST/todos  - json  @POST', async ({ api }, testinfo) => {
    const doneTodo = new ToDoBuilder(faker.string.alpha(10), true, faker.lorem.words()).generate();
    const response = await api.todos.postContentType(token, testinfo, doneTodo, 'application/json');
    const headers = response.headers();
    console.log(`${testinfo.project.use.apiURL}${headers.location}`);
    const contentType = headers['content-type'];
    console.log(contentType);
    expect(response.status()).toBe(201);
    expect(contentType).toContain('application/json');
  });

  test('41 DELETE/heartbeat (405) - @DELETE ', async ({ api }, testinfo) => {
    let getResponse = await api.todos.deleteHeartbeat(token, testinfo);
    expect(getResponse.status()).toBe(405);
  });

  test('42 PATCH/heartbeat (500) - @PATCH ', async ({ api }, testinfo) => {
    let getResponse = await api.todos.patchHeartbeat(token, testinfo);
    expect(getResponse.status()).toBe(500);
  });

  test('45. POST/todos 405 - override Delete @POST', async ({ request }, testinfo) => {
    const overrideDelete = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.string.alpha(50),
      true,
      faker.string.alpha(200),
      'high',
    ).generate();
    let response = await overrideDelete.heartbeat('delete', token, testinfo, todoData, false);
    expect(response.status()).toBe(405);
  });

  test('46. POST/todos 500 - override PATCH @POST', async ({ request }, testinfo) => {
    const overridePatch = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.string.alpha(50),
      true,
      faker.string.alpha(200),
      'high',
    ).generate();
    let response = await overridePatch.heartbeat('PATCH', token, testinfo, todoData, false);
    expect(response.status()).toBe(500);
  });

  test('47. POST/todos 501 - override TRACE @POST', async ({ request }, testinfo) => {
    const overrideTrace = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.string.alpha(50),
      true,
      faker.string.alpha(200),
      'high',
    ).generate();
    let response = await overrideTrace.heartbeat('TRACE', token, testinfo, todoData, false);
    expect(response.status()).toBe(501);
  });

  test('58 DELETE /todos/{id} (200) all - @DELETE ', async ({ api }, testinfo) => {
    const getAllTodos = await api.todos.get(token, testinfo);
    const body = await getAllTodos.json();
    const todos = body.todos;
    if (todos && todos.length > 0) {
      for (const todo of todos) {
        let deleteResponse = await api.todos.deleteTodo(token, testinfo, todo.id);
        expect(deleteResponse.status()).toBe(200);
      }
    }
    const deletedTodos = await api.todos.get(token, testinfo);
    expect(deletedTodos.status()).toBe(200);
    const deleteTodosBody = await deletedTodos.json();
    expect(deleteTodosBody.todos.length).toBe(0);
    console.log(deleteTodosBody.todos);
  });

  //еще 2 на пост,
});
