const express = require('express');
require('./db/mongoose');


const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});


const bcrypt = require('bcryptjs');

const hashTest = async () => { 
    const pass = "saDmvs03-";
    const hash = await bcrypt.hash(pass, 8);
    console.log(pass);
    console.log(hash);

    const isMatch = await bcrypt.compare(pass, hash);
    console.log(isMatch);
    
}

hashTest();

