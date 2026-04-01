export default {
  routes: [
    {
      method: "GET",
      path: "/static-screens/:screenId",
      handler: "api::static-screen.static-screen.findBySlug",
    },
  ],
};
