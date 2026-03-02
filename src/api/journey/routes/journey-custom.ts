export default {
  routes: [
    {
      method: "GET",
      path: "/journeys/:slug([a-zA-Z0-9-]+)", // only match string slugs, e.g. apply-ca
      handler: "api::journey.journey.findBySlug",
    },
  ],
};
