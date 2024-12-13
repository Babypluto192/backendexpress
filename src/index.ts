import { app } from "./app";
import { runDb } from "./db";
import { performance } from "perf_hooks"; 

const port = process.env.PORT || 3000;

const startApp = async () => {
  await runDb();

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return server;
};

startApp();






