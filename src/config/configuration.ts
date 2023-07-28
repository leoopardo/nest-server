export default () => ({
  database: {
    host: `${process.env.MONGODB_URI}`,
    global: {
      uri: `${process.env.DATABASE_HOST}/global?authSource=admin`,
    },
  },
  frontEnd: {
    protocol: process.env.FRONT_END_PROTOCOL,
    host: process.env.FRONT_END_HOST,
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    confirmationTokenSecret: process.env.JWT_CONFIRMATION_TOKEN_SECRET,
  },
  smtp: {
    keyId: process.env.SMTP_KEY_ID,
    keySecret: process.env.SMTP_KEY_SECRET,
    region: process.env.SMTP_REGION,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    domain: process.env.SMTP_DOMAIN,
  },
});
