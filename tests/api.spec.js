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
    //console.log(token);
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

  test('05 GET /todos/{id} (200) - получить todo по id @GET', async ({ request }, testinfo) => {
    const todosService = new ToDosService(request);
    let r = await request.get(`${testinfo.project.use.apiURL}/todos`, {
      headers: { 'X-CHALLENGER': token },
    });
    expect(r.status()).toBe(200);
    const todos = await r.json();
    let size = todos.todos.length;
    let index = Math.floor(Math.random() * (size - 1) + 1);
    let idTodo = todos.todos[index].id;
    r = await todosService.getById(idTodo, token, testinfo);
    expect(r.status()).toBe(200);
  });

  test('07 GET/todos ? (200) -  filter todos', async ({ api }, testinfo) => {
    const doneTodo = new ToDoBuilder(faker.string.alpha(10), true, faker.lorem.words()).generate();
    const notDoneTodo = new ToDoBuilder(
      faker.string.alpha(10),
      true,
      faker.lorem.words(),
    ).generate();
    let a = await api.todos.post(token, testinfo, doneTodo);
    const resp1 = await a.json();
    console.log(resp1);
    await api.todos.post(token, testinfo, notDoneTodo);
    let respFilter = await api.todos.filterTodos(token, testinfo);
    const response = await respFilter.json();
    const todos = response.todos[10];
    expect(respFilter.status()).toBe(200);
    expect(todos.doneStatus()).toBe(true); //!!! error??
  });

  test('25 GET/todos (200) -  XML', async ({ api }, testinfo) => {
    const response = await api.todos.getApplicationXML(token, testinfo);
    //console.log(api.todos.getApplicationXML.body);
    //expect(response.status()).toBe(200);
    expect(response).toContain('<todos>'); //не понимаю различий с боди и просто респонсом ,хочу и статус проверить и боди
  });

  test('26 GET/todos (200) -  JSON', async ({ api }, testinfo) => {
    const response = await api.todos.getApplicationJSON(token, testinfo);
    const headers = response.headers(); // это метод?
    console.log(`${testinfo.project.use.apiURL}${headers.location}`); // кто такой тут локейшн?
    const json = headers['content-type']; // почему квадратные скобки
    console.log(json);
    expect(json).toContain('application/json'); //хочу проверку по хедерам в респонсу, есть такое поле
  });

  test('28 GET/todos (200) -  preferXML', async ({ api }, testinfo) => {
    const response = await api.todos.getApplicationPrefer(token, testinfo);
    const headers = response.headers();
    console.log(`${testinfo.project.use.apiURL}${headers.location}`);
    const xml = headers['content-type'];
    console.log(xml);
    expect(xml).toContain('application/xml');
  });

  test('30 GET/todos (406) -  header NOT ACCEPTABLE', async ({ api }, testinfo) => {
    const response = await api.todos.getApplicationGzip(token, testinfo);
    expect(response.status()).toBe(406);
    expect(response.statusText()).toBe('Not Acceptable');
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
    const wrongDescriotion = new ToDosService(request);
    const todoData = new ToDoBuilder(
      faker.lorem.sentence(3),
      true,
      faker.string.alpha(202),
    ).generate();
    let response = await wrongDescriotion.post(token, testinfo, todoData, false);
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
});
