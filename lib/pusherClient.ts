import Pusher from "pusher-js";

export const pusher = new Pusher("29d34799d3404412e4e7", {
  cluster: "mt1",
  forceTLS: true,
});
