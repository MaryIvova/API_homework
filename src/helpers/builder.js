import { faker } from '@faker-js/faker';

export class ToDoBuilder {
  constructor(title, doneStatus, description, priority) {
    this.title = title;
    this.doneStatus = doneStatus;
    this.description = description;
    this.priority = priority;
  }

  generate() {
    return {
      title: this.title,
      doneStatus: this.doneStatus,
      description: this.description,
      priority: this.priority,
    };
  }
}
