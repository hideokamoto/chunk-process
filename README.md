# Sequential Promise
Simply async task runnner as sequential

## API Docs
https://hideokamoto.github.io/sequential-promise/

## Why Sequential Promise?

When using `Promise.all()`, all async tasks execute in parallel, which can cause issues in certain scenarios. This library provides a simple way to execute async tasks sequentially, giving you better control over execution flow and resource usage.

## Use Cases

### 1. API Rate Limiting
Prevent hitting rate limits when making multiple API calls to external services.

```typescript
// Avoid overwhelming APIs with parallel requests
await sequentialPromise(userIds, async (userId) => {
  return await fetchUserDataFromAPI(userId)
})
```

### 2. Execution Order Guarantee
Ensure operations execute in a specific order, crucial for database updates or dependent operations.

### 3. Resource Management
Control memory and CPU usage by preventing too many parallel operations.

### 4. Controlled Parallel Execution
Use `sequentialPromiseWithChunk` to batch operations - execute N items in parallel, then move to the next batch.

```typescript
// Process 5 items at a time, sequentially batch by batch
await sequentialPromiseWithChunk(items, async (item) => {
  return await processItem(item)
}, { chunkSize: 5 })
```

## Benefits

- **Simple API**: Drop-in replacement for `Promise.all()` with sequential execution
- **Type-Safe**: Full TypeScript support with generics
- **Lightweight**: Zero dependencies, minimal footprint
- **Flexible**: Choose between fully sequential or chunked parallel execution
- **Predictable**: Guaranteed execution order and result order

## Common Scenarios

- External payment API calls (Stripe, PayPal, etc.)
- Bulk file uploads to cloud storage
- Database migrations with dependencies
- Web scraping with request throttling
- Resource-constrained environments (AWS Lambda, edge functions)

## Before the package (Async style)
We have to run the task as asynchronous

```typescript
import * as moment from 'moment'

const dummy = async () => {
  return new Promise(resolve => setTimeout(resolve, 1000))
}

const asyncFunc = async () => {

  const arr = [1,2,3,4,5]
  const result = await Promise.all(arr.map(async i => {
    const start = moment()
    console.log(`Number: ${i}`)
    console.log(`Start: ${start.toISOString()}`)
    await dummy()
    console.log(`End ${moment().toISOString()}`)
    console.log(`${moment().diff(start, 'seconds')} sec`)
    console.log(' ')
    return i + 1
  }))
  return result
})

asyncFunc().then(result => console.log(result))
```

The function will run async.

```bash
Number: 1
Start: 2019-08-30T07:52:43.862Z
Number: 2
Start: 2019-08-30T07:52:43.862Z
Number: 3
Start: 2019-08-30T07:52:43.863Z
Number: 4
Start: 2019-08-30T07:52:43.863Z
Number: 5
Start: 2019-08-30T07:52:43.863Z
End 2019-08-30T07:52:44.866Z
1 sec
 
End 2019-08-30T07:52:44.866Z
1 sec
 
End 2019-08-30T07:52:44.867Z
1 sec
 
End 2019-08-30T07:52:44.867Z
1 sec
 
End 2019-08-30T07:52:44.867Z
1 sec
 
[ 2, 3, 4, 5, 6 ]
```

## Use the package
To use the package, we can run sequential

### Typescript
```typescript
import * as moment from 'moment'
import sequentialPromise from '@hideokamoto/sequential-promise'

sequentialPromise<number, string>([1,2,3,4,5], async (i) => {
  const start = moment()
  console.log(`Number: ${i}`)
  console.log(`Start: ${start.toISOString()}`)
  await dummy()
  console.log(`End ${moment().toISOString()}`)
  console.log(`${moment().diff(start, 'seconds')} sec`)
  console.log(' ')
  return `${i} + 2 = ${i + 2}`
}).then(r => console.log(r))
```

### JavaScript
```javascript
const moment = require('moment')
const sequentialPromise = require('@hideokamoto/sequential-promise')

sequentialPromise([1,2,3,4,5], async (i) => {
  const start = moment()
  console.log(`Number: ${i}`)
  console.log(`Start: ${start.toISOString()}`)
  await dummy()
  console.log(`End ${moment().toISOString()}`)
  console.log(`${moment().diff(start, 'seconds')} sec`)
  console.log(' ')
  return `${i} + 2 = ${i + 2}`
}).then(r => console.log(r))
```

### Result

This is the result.

```bash
 Number: 1
 Start: 2019-08-30T07:35:00.175Z
 End 2019-08-30T07:35:01.182Z
 1 sec

 Number: 2
 Start: 2019-08-30T07:35:01.184Z
 End 2019-08-30T07:35:02.188Z
 1 sec

 Number: 3
 Start: 2019-08-30T07:35:02.188Z
 End 2019-08-30T07:35:03.194Z
 1 sec

 Number: 4
 Start: 2019-08-30T07:35:03.194Z
 End 2019-08-30T07:35:04.200Z
 1 sec

 Number: 5
 Start: 2019-08-30T07:35:04.200Z
 End 2019-08-30T07:35:05.206Z
 1 sec

 [ '1 + 2 = 3', '2 + 2 = 4', '3 + 2 = 5', '4 + 2 = 6', '5 + 2 = 7' ]
```

## contribution

```bash
// clone
$ git clone git@github.com:hideokamoto/sequential-promise.git
$ cd sequential-promise

// setup
$ yarn

// Unit test
$ yarn test
or
$ yarn run test:watch

// Lint
$ yarn run lint
or
$ yarn run lint --fix

// Build
$ yarn run build

// Rebuild docs
$ yarn run doc
```