# Creation Job

## For Notifications

### 1 - Adding to NotificationTypeEnum new type of notification 

```ts
export enum NotificationTypeEnum {
  ANSWER_RESPONSE_ACCEPTED = 'ANSWER_RESPONSE_ACCEPTED',
  ANSWER_RESPONSE_REFUSED = 'ANSWER_RESPONSE_REFUSED',
  ANSWER_RESPONSE = 'ANSWER_RESPONSE',
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_COMPLETED = 'EVENT_COMPLETED',
  EVENT_CLOSED = 'EVENT_CLOSED',
  EMPLOYEE_CREATED = 'EMPLOYEE_CREATED',
  // MY_NEW_ONE = 'MY_NEW_ONE',
}
```

### 2 - Create new job in job queue folder

```ts
export class MyNewNotificationsJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    type: NotificationTypeEnum
    userId: number
    data: MyType
  }) {
    super()
  }

  handle = async () => {
    const {
      data,
      // implements payload,
    } = this.payoad

    // Do things here
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
```

### 3 - Add job to list of authorized jobs

in jobs/queue/jobs/provider/.ts

```ts
export const JobDictonary = new Map([
  [UpdateEventStatusJob.name, UpdateEventStatusJob],
  [SendMailAnswerCreationjob.name, SendMailAnswerCreationjob],
  [CreateEventNotificationsJob.name, CreateEventNotificationsJob],
  [CreateEmployeeNotificationsJob.name, CreateEmployeeNotificationsJob],
  [MyNewNotificationsJob.name, MyNewNotificationsJob],
])
```

### 4 - Add queue Name to generate job name function

```ts
export function generateQueueName(type?: NotificationTypeEnum) {
  const name = Date.now().toString()

  switch (type) {
    case NotificationTypeEnum.ANSWER_RESPONSE:
      return `answer-response-notif-${name}`

    case NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED:
      return `answer-response-accepted-notif-${name}`

    case NotificationTypeEnum.ANSWER_RESPONSE_REFUSED:
      return `answer-response-refused-notif-${name}`

    case NotificationTypeEnum.EVENT_CREATED:
      return `create-event-notif-${name}`

    case NotificationTypeEnum.EVENT_CLOSED:
      return `close-event-notif-${name}`

    case NotificationTypeEnum.EVENT_COMPLETED:
      return `complete-event-notif-${name}`

    case NotificationTypeEnum.EMPLOYEE_CREATED:
      return `create-employee-notif-${name}`

    // add new one
    case NotificationTypeEnum.MY_NEW_ONE:
      return `create-employee-notif-${name}`

    default:
      return name
  }
}
```

### 5 - Use the created Job
```ts
await defaultQueue.add(
  generateQueueName(NotificationTypeEnum.MY_NEW_ONE),
  new CreateEmployeeNotificationsJob({
    type: NotificationTypeEnum.MY_NEW_ONE,
    userId,
    data
  }))
```
