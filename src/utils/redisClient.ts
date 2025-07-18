import { createClient } from "redis";

const client = createClient({
  username: "default",
  password: "djUZ8jBGbNJmjvAHuLdm9qX2rMNOMxOl",
  socket: {
    host: "redis-11353.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 11353,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

client.connect();

export default client;
