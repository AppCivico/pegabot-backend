import app from './app';

const port = process.env.PORT || 1337;

// Sets server port and logs message on success
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.timeout = 0;
