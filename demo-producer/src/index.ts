// src/index.ts
import express from 'express';
import weatherRouter from './weather';

const app = express();
const PORT = 3000;

let shouldFail = false;

app.use('/weather', weatherRouter);

app.listen(PORT, () => {
    console.log(`Producer running on http://localhost:${PORT}`);
});


setInterval(() => {
    shouldFail = !shouldFail;
    console.log(`Producer will ${shouldFail ? 'fail' : 'succeed'} on next request`);
}, 15000);