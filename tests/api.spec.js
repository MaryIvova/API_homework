import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { test } from '../src/helpers/index';
import { ToDosService } from '../src/services/index';
import { ToDoBuilder } from '../src/helpers/builder';

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

  test('05 GET /todos/{id} (200) - получить todo по id @GET', async ({ request }, testinfo) => {
    const todosService = new ToDosService(request);
    let r = await request.get(`${testinfo.project.use.apiURL}/todos`, {
      headers: { 'X-CHALLENGER': token },
    });
    expect(r.status()).toBe(200);
    const todos = await r.json(); //попытка сделать красиво с рандомным айди ,но не получилось
    let size = todos.todos.length;
    let index = Math.floor(Math.random() * (size - 1) + 1);
    let idTodo = todos.todos[index].id;
    r = await todosService.getById(idTodo, token, testinfo);
    expect(r.status()).toBe(200);
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
    const todoDone = new ToDosService(request);
    let resp = await todoDone.createDoneTodo(token, testinfo);
    const responseData = await resp.json();
    expect(resp.status()).toBe(201);
    expect(responseData.doneStatus).toBe(true);
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
});
