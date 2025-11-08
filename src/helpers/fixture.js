import { test as base } from '@playwright/test';
import { App } from '../../pagesFacade/app.page';
import { Api } from '../../services/api.service';
import { UserBuilder } from '../builders';

export const test = base.extend({
  app: async ({ page }, use) => {
    let application = new App(page);
    await use(application);
  },
  api: async ({ request }, use) => {
    let api = new Api(request);
    await use(api);
  },
  registerUser: async ({ page }, use) => {
    let app = new App(page);
    const user = new UserBuilder().addEmail().addName().addPassword().generate();
    //	console.log(app);
    await app.main.open();
    await app.main.gotoRegister();
    await app.register.register(user);
    await use(app);
  },
});
