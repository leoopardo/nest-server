export default () => ({
  database: {
    host: process.env.MONGODB_URI,
    global: {
      uri: `${process.env.DATABASE_HOST}/global?authSource=admin`,
    },
  },
});
