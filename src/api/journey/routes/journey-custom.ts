export default {
  routes: [
    {
      method: "GET",
      path: "/journeys/:journeyId([a-zA-Z0-9_-]+)",
      handler: "api::journey.journey.findBySlug",
    },
  ],
};
