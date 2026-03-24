Deno.serve(() => {
  return Response.json({
    received: true,
    function: "daily-expire-trips",
    next_steps: [
      "mark past-date listings as expired",
      "close stale inventory",
      "keep search fresh"
    ],
  });
});
