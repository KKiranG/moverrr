Deno.serve(async (request) => {
  const payload = await request.json().catch(() => null);

  return Response.json({
    received: true,
    function: "on-booking-created",
    next_steps: [
      "notify carrier",
      "send confirmation email",
      "queue operational follow-up if needed"
    ],
    payload,
  });
});
