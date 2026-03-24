Deno.serve(async (request) => {
  const payload = await request.json().catch(() => null);

  return Response.json({
    received: true,
    function: "on-trip-posted",
    next_steps: [
      "notify interested customers later",
      "surface listing to search",
      "record ops analytics"
    ],
    payload,
  });
});
