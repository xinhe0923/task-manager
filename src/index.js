const express = require("express");
require("./db/mongoose"); //just to make sure mongoose runs and connect to database
const userRouter = require("./routers/user");
const taskRouter = require("./routers/tasks");

const app = express();
const port = process.env.PORT ;

app.use(express.json()); //automatically parse incoming joson object
//and access it in request handler
app.use(userRouter);
app.use(taskRouter);

//without middleware : new request =>run route handler
//with middleware: new request=>dosomething =>run route handler

app.listen(port, () => {
  console.log("serer is up on port", port);
});
