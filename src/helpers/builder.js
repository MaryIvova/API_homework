import { faker } from '@faker-js/faker';

export class ToDoBuilder {
  constructor(title, doneStatus, description) {
    this.title = title;
    this.doneStatus = doneStatus;
    this.description = description;
  }

  generate() {
    return {
      title: this.title,
      doneStatus: this.doneStatus,
      description: this.description,
    };
  }
}
