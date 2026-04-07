export default {
  routes: [
    {
      method: "GET",
      path: "/journeys/:flowId([a-zA-Z0-9_-]+)",
      handler: "api::journey.journey.findBySlug",
    },
  ],
};
