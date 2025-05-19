import { Worker } from 'worker_threads';

const areadata = [
  ['2','3'], 
  ['3','2'],
  ['3','4'],
  ['4','3'],
  ['4','5'],
  ['5','4'],
  // ['5','3'],
  // ['3','5'],
]

const type = process.env.TYPE_FOR_TEST
areadata.forEach(([startArea, returnArea]) => {
  console.log('push-message')
  new Worker('./tests/worker-test.mjs', { workerData: { startArea, returnArea, type } })
})