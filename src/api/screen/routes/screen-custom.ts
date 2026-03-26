export default {
  routes: [
    {
      method: "GET",
      path: "/screens/:screenId([a-zA-Z0-9_-]+)",
      handler: "api::screen.screen.findById",
    },
  ],
};
