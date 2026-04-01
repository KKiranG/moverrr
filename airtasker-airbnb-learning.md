# Airtasker + Airbnb Learning For moverrr

Last revised: 1 April 2026 (Sydney)

## What This Document Is

This is not a source dump.
This is a founder action brief for moverrr.

It takes useful patterns from Airtasker, Airbnb, marketplace ops playbooks, payment infrastructure docs, and Australia-specific trust/compliance guidance, then rewrites them into tasks that fit moverrr's actual shape:

- browse-first
- spare-capacity inventory
- awkward-middle Sydney moves
- mobile-first
- manual-first operations where that buys speed

## Product Truth We Must Protect

Before any task gets built, ask:

1. Does this help carriers post real spare capacity faster?
2. Does this make browse and booking clearer for customers?
3. Does this reduce founder ops pain without creating product bloat?
4. Does this keep moverrr out of quote-engine, bidding, dispatch, and removalist territory?
5. Is the smallest useful version obvious?

If the answer is no, do not build it yet.

## How To Use This File

Every task below follows one format:

- `What to do`: the smallest useful implementation
- `Why it matters`: the product reason
- `Done when`: the practical finish line

Priority labels:

- `Now`: should improve trust, clarity, supply, or ops in the next round
- `Soon`: valuable once the core loop is reliable
- `Later`: useful after the marketplace has more volume

## The Big Founder Moves

These are the main lessons worth stealing from Airtasker and Airbnb, translated for moverrr:

1. Great marketplaces explain the job before they explain the feature.
2. Trust comes from visible evidence, not brand claims.
3. Listing quality is a product system, not just user effort.
4. Messaging should reduce uncertainty, not create a shadow workflow.
5. Payments should feel safe, predictable, and boring.
6. Reviews should teach the market what good looks like.
7. Ops tools should help one founder survive before they help a large team scale.
8. The best UX often removes choices instead of adding them.
9. Every state change should answer "what happens next?"
10. Good ranking should reduce support pain, not just increase clicks.

## 100 Actionable Tasks

## A. Search, Browse, And First Impression

1. **Search card: why this trip fits** (`Now`)
What to do: Add a dedicated line on each result card that explains the fit in plain English: route, timing, spare capacity, and why the price is lower.
Why it matters: Airbnb and Airtasker both reduce uncertainty fast; moverrr needs to make the spare-capacity story legible before the tap.
Done when: Every trip card answers "why am I seeing this?" in one screenful.

2. **Search card: total price, not teaser price** (`Now`)
What to do: Show the full customer price on the result card, with a smaller breakdown available on tap.
Why it matters: Hidden-fee anxiety kills trust early.
Done when: A customer can compare two trips without opening either one to understand the likely total.

3. **Search card: timing certainty badge** (`Now`)
What to do: Add chips like `fixed pickup window`, `flexible dropoff`, `same-day route`, or `weekend run`.
Why it matters: Time confidence is one of the biggest filters in moving.
Done when: Timing confidence is visible without reading long descriptions.

4. **Search card: capacity made human** (`Now`)
What to do: Translate capacity into examples like `fits 1 fridge`, `fits 1 mattress`, `fits 8 boxes`, alongside any raw capacity metric.
Why it matters: Most customers do not think in percentages or cubic metres.
Done when: Search cards help users self-qualify without guessing.

5. **Search filters: item-shaped, not logistics-shaped** (`Now`)
What to do: Add filters like `single furniture`, `appliance`, `marketplace pickup`, `small business overflow`, `student move`.
Why it matters: moverrr should feel like browseable inventory for specific problems, not freight software.
Done when: The top filters match real customer language.

6. **Search filters: access constraints** (`Now`)
What to do: Add filters for stairs, lift, narrow access, loading dock, parking difficulty, and helper needed.
Why it matters: Accessibility and handling complexity are part of fit, not edge cases.
Done when: Customers can eliminate obviously wrong trips before checkout.

7. **Search results: route corridor shelf** (`Soon`)
What to do: Add featured shelves for common corridors like `Inner West`, `Eastern Suburbs pickups`, `Parramatta -> City`, `Sydney marketplace pickups`.
Why it matters: Airbnb uses curation to make supply feel real; moverrr can do the same with route corridors.
Done when: Browse has reusable shelves that make inventory density feel stronger.

8. **Search results: map plus list** (`Soon`)
What to do: Add a suburb-safe map view that shows route corridors, not exact addresses.
Why it matters: Maps create confidence, but privacy still matters.
Done when: A user can browse by geography without revealing private locations.

9. **Search ranking: support-risk aware ordering** (`Soon`)
What to do: Blend trust, completeness, response rate, proof quality, and route fit into ranking instead of using only relevance or price.
Why it matters: Airbnb's more mature systems optimize for lower support burden as well as conversion; moverrr should learn that early.
Done when: Weak, risky, incomplete listings stop floating to the top.

10. **Search ranking: hide weak inventory by default** (`Now`)
What to do: Downrank listings missing photos, rules, vehicle info, or reliable timing unless the user explicitly filters broadly.
Why it matters: Browse-first marketplaces live or die on perceived quality.
Done when: First-page inventory looks believable by default.

11. **Empty state: save this route** (`Now`)
What to do: Turn no-results pages into a route-demand capture flow with one-tap saved search and expected route frequency.
Why it matters: Dead ends waste demand and teach users that moverrr has no supply.
Done when: No-result sessions still produce reusable customer intent.

12. **Empty state: show nearby alternatives** (`Now`)
What to do: Suggest nearby suburbs, adjacent dates, and flexible timing options.
Why it matters: Customers often need help reframing the request, not leaving the product.
Done when: No-result pages always offer three next actions.

13. **Saved search digest** (`Soon`)
What to do: Send a route alert when matching or near-matching capacity appears.
Why it matters: Airbnb wishlists and saved browsing patterns create return loops; moverrr needs route alerts for low-density inventory.
Done when: Saved search users receive useful, low-noise reactivation messages.

14. **Browse card: trust stack preview** (`Now`)
What to do: Show a compact trust row: verified identity, proof history, response speed, completed jobs, and review score.
Why it matters: Trust must be legible before a user commits attention.
Done when: Cards display trust signals without needing a long profile visit.

15. **Browse card: route story headline** (`Later`)
What to do: Generate a short route headline like `Already driving Surry Hills -> Newtown after marketplace pickups`.
Why it matters: Great marketplaces make listings feel alive and specific.
Done when: Top listings feel like real trips, not database rows.

## B. Trip Detail And Conversion

16. **Hero section: real trip first** (`Now`)
What to do: Put route, date, pickup window, vehicle, capacity left, and trust above the fold.
Why it matters: The core question is "is this a real trip that can take my item?"
Done when: The first screen answers that clearly.

17. **Trip detail: one-line spare-capacity explanation** (`Now`)
What to do: Add a sentence explaining why the listing exists and why the price is lower.
Why it matters: moverrr's wedge should never be implicit.
Done when: Every trip detail page reinforces the product thesis.

18. **Pricing panel: full moverrr breakdown** (`Now`)
What to do: Show base price, stairs fee, helper fee, booking fee, and total, with short tooltips in plain language.
Why it matters: Transparent math reduces support and checkout drop-off.
Done when: The pricing box matches actual booking math everywhere.

19. **Trip detail: included vs not included** (`Now`)
What to do: Add a structured checklist for `included`, `not included`, and `needs add-on`.
Why it matters: Most move disputes come from unstated assumptions.
Done when: A user can tell what service they are actually buying.

20. **Trip detail: trip rules module** (`Now`)
What to do: Add rules like `ground-floor only`, `no dismantling`, `must fit through standard doorway`, `customer present at handoff`.
Why it matters: Airbnb's house-rules style discipline works because it prevents silent mismatch.
Done when: Each listing has explicit handling rules before booking.

21. **Trip detail: proof examples** (`Soon`)
What to do: Show a sample of pickup and delivery proof from the carrier's past completed work.
Why it matters: Trust grows when users can see how handoffs are actually documented.
Done when: Proof style is visible before payment.

22. **Trip detail: handling confidence** (`Soon`)
What to do: Add a block showing blankets, straps, tail-lift, helper availability, and weather protection.
Why it matters: Customers care about how their item will be handled, not just whether a van exists.
Done when: Handling readiness is obvious on detail pages.

23. **Trip detail: access compatibility summary** (`Now`)
What to do: Show whether the carrier accepts stairs, lift-only buildings, long carries, heavy items, and awkward access.
Why it matters: This filters out bad fits early.
Done when: Access assumptions are visible without sending a message.

24. **Trip detail: what happens next timeline** (`Now`)
What to do: Add a short operational timeline from booking request to completion.
Why it matters: Good marketplaces remove uncertainty after the click, not only before it.
Done when: Booking flow states are visible before checkout.

25. **Trip detail: pending request countdown** (`Soon`)
What to do: If a request needs confirmation, show a clear response deadline and fallback path.
Why it matters: Airbnb handles pending states explicitly; moverrr should avoid ghost requests.
Done when: No booking request sits in an ambiguous state.

26. **Trip detail: customer prep checklist** (`Now`)
What to do: Add a `prepare for pickup` checklist covering access, wrapping, dimensions, and handoff readiness.
Why it matters: Better-prepared customers create fewer disputes.
Done when: Customers see what they need to do before they pay.

27. **Trip detail: capacity confidence meter** (`Soon`)
What to do: Show capacity in a simple confidence format like `very likely fits`, `check dimensions`, or `unlikely fit`.
Why it matters: A binary yes or no is often too crude for awkward-middle items.
Done when: Customers understand fit uncertainty honestly.

28. **Trip detail: route flexibility box** (`Soon`)
What to do: Show how much date, time, and handoff flexibility the customer is buying.
Why it matters: moverrr saves money partly by trading speed for flexibility.
Done when: Flexibility is a visible product feature, not a hidden consequence.

29. **Trip detail: suburb privacy boundaries** (`Now`)
What to do: Keep exact addresses hidden pre-booking, but clearly show suburb and corridor confidence.
Why it matters: Privacy and trust can both be strong if boundaries are clear.
Done when: Location clarity increases without exposing private data too early.

30. **Trip detail: comparison drawer** (`Later`)
What to do: Let users compare two or three listings on timing, price, trust, handling, and flexibility.
Why it matters: Airbnb-style comparison thinking helps users pick confidently in a browse market.
Done when: Users can compare without tab chaos.

## C. Carrier Posting And Supply Creation

31. **Posting flow: compress to four decisions** (`Now`)
What to do: Keep posting focused on route, timing, space, and rules, with optional details tucked into secondary steps.
Why it matters: Supply speed matters more than feature depth.
Done when: A repeat carrier can post in under two minutes.

32. **Posting flow: duplicate last trip** (`Now`)
What to do: Add `post again` from an existing trip with editable date, price, and capacity.
Why it matters: Repeat supply is more important than novel supply.
Done when: Returning carriers can relist with almost no typing.

33. **Posting flow: route templates** (`Now`)
What to do: Allow reusable templates for common corridors and rule sets.
Why it matters: Templates help recurring supply without turning moverrr into dispatch software.
Done when: A carrier can create a templated trip in one tap plus small edits.

34. **Posting flow: listing readiness score** (`Soon`)
What to do: Show a simple completeness score based on photos, rules, vehicle, timing clarity, and handling details.
Why it matters: Airtasker and Airbnb both nudge quality through visible completion systems.
Done when: Carriers know exactly how to improve a weak listing.

35. **Posting flow: plain-language price guidance** (`Now`)
What to do: Show examples and price anchors for similar moverrr trips, not algorithmic black-box pricing.
Why it matters: Founders need price quality without pretending to know the whole market.
Done when: Carriers get better base prices with minimal support intervention.

36. **Posting flow: common item presets** (`Soon`)
What to do: Add presets for mattress, fridge, sofa, washing machine, marketplace pickup, boxes, and office overflow.
Why it matters: Presets reduce writing and standardize expectations.
Done when: Posting a common move type becomes much faster.

37. **Posting flow: handling presets** (`Soon`)
What to do: Add toggle presets for blankets, straps, trolley, tail-lift, helper, and rain protection.
Why it matters: Customers want visible handling competence.
Done when: Listings expose handling capability consistently.

38. **Posting flow: route-level default rules** (`Soon`)
What to do: Let carriers save default rules per recurring route.
Why it matters: Good defaults reduce repetitive setup work.
Done when: Frequent routes inherit the carrier's normal constraints automatically.

39. **Posting flow: publish gate for weak listings** (`Now`)
What to do: Block or warn on listings that are missing route, date, price, space, or core rules.
Why it matters: Inventory quality is a marketplace asset.
Done when: Obviously incomplete listings rarely reach browse.

40. **Posting flow: mobile camera-first photos** (`Now`)
What to do: Make vehicle, proof-style, and optional listing photos camera-first with HEIC support and clear capture prompts.
Why it matters: Carrier-side UX must respect iPhone reality.
Done when: Adding photos feels native and fast on mobile.

41. **Posting flow: live preview card** (`Soon`)
What to do: Show carriers exactly how the listing card will appear in search while they create it.
Why it matters: Airbnb-style preview thinking improves supply quality immediately.
Done when: Carriers can tune a listing before publishing.

42. **Posting flow: route frequency tracker** (`Later`)
What to do: Show how often the carrier has posted a similar corridor and how often it gets booked.
Why it matters: Repeat-route confidence can become a supply flywheel.
Done when: Carriers can see which routes are worth repeating.

43. **Posting flow: item-fit warnings** (`Now`)
What to do: Warn carriers when the listed capacity or rules conflict with common item types.
Why it matters: Quality systems should catch bad input before the market sees it.
Done when: Contradictions are flagged during creation, not after booking.

44. **Posting flow: route headline helper** (`Soon`)
What to do: Suggest a short, natural-language headline based on route, timing, and capacity.
Why it matters: Good listing language improves clicks without more complexity.
Done when: Most listings publish with a readable, specific title.

45. **Posting flow: operations checklist after publish** (`Now`)
What to do: After publish, show the carrier next actions: verify payout, review proof checklist, respond fast, update capacity after bookings.
Why it matters: Great marketplaces keep sellers operational, not just listed.
Done when: New carriers know how to succeed after publishing.

## D. Trust, Profiles, And Reputation

46. **Carrier profile: layered badges** (`Now`)
What to do: Split trust into meaningful badges like ID checked, business details added, payout ready, police check supplied, verified proof history.
Why it matters: One giant "verified" badge is too vague.
Done when: Users can see what is actually verified.

47. **Carrier profile: badge freshness** (`Soon`)
What to do: Show when verification was last checked and if anything needs renewal.
Why it matters: Old trust data becomes fake trust data.
Done when: Badges no longer imply permanent truth.

48. **Carrier profile: proof gallery** (`Now`)
What to do: Show selected before/after, pickup, and delivery proof examples from past work.
Why it matters: In moverrr, proof quality is part of the product.
Done when: Profiles show how the carrier documents real work.

49. **Carrier profile: route expertise section** (`Soon`)
What to do: Highlight repeated suburbs, common item types, and completion history for those patterns.
Why it matters: Airbnb hosts earn trust through specificity; carriers can too.
Done when: Users can tell what a carrier reliably does well.

50. **Carrier profile: response behavior** (`Soon`)
What to do: Show response speed and confirmation reliability in a customer-friendly way.
Why it matters: Operational behavior is trust, not just a backend metric.
Done when: Customers can distinguish reliable carriers before messaging.

51. **Carrier profile: not a brochure page** (`Now`)
What to do: Keep the profile concise and evidence-led instead of turning it into a long marketing page.
Why it matters: Proof beats self-description.
Done when: The profile highlights facts, not fluff.

52. **Review system: verified bookings only** (`Now`)
What to do: Allow reviews only after a real completed booking.
Why it matters: Marketplace trust collapses when review authenticity is questionable.
Done when: No manual or off-platform review entries exist.

53. **Review system: double-blind reviews** (`Soon`)
What to do: Hold both reviews until both sides submit or the review window expires.
Why it matters: This reduces retaliation behavior and encourages honest feedback.
Done when: Reviews reveal together or at expiry.

54. **Review system: useful subratings** (`Soon`)
What to do: Break feedback into communication, item care, punctuality, listing accuracy, and proof quality.
Why it matters: Generic stars do not teach the market what good looks like.
Done when: Review data can guide ranking and carrier improvement.

55. **Review system: one public carrier reply** (`Soon`)
What to do: Allow one calm factual response to a review.
Why it matters: Good marketplaces give providers a limited way to add context.
Done when: Review threads remain readable and bounded.

56. **Review system: moderation policy examples** (`Soon`)
What to do: Publish examples of removable reviews such as threats, hate, extortion, or irrelevant complaints.
Why it matters: Clear moderation rules reduce founder-by-founder judgment calls.
Done when: Support decisions follow written examples.

57. **Trust center page** (`Soon`)
What to do: Create one simple page for trust basics: payments, verification, banned behavior, proof, disputes, privacy.
Why it matters: Users need one place that explains how moverrr works safely.
Done when: Support can link one canonical trust page.

58. **Off-platform leak prevention** (`Now`)
What to do: Hide direct contact details publicly and block obvious contact-sharing attempts before booking.
Why it matters: Airtasker learned this the hard way; moverrr should not relearn it.
Done when: Users cannot easily bypass platform payments before commitment.

59. **Scam reporting inside key surfaces** (`Now`)
What to do: Add simple report actions on messages, listings, and suspicious notifications.
Why it matters: Trust systems need visible safety exits.
Done when: Users can report something risky in one or two taps.

60. **Customer-facing trust language cleanup** (`Now`)
What to do: Rewrite vague promises like "safe and secure" into proof-led copy about payments, verification, and proof capture.
Why it matters: Founder-stage trust copy should be specific, not corporate.
Done when: Trust language points to evidence every time.

## E. Messaging, Notifications, And State Management

61. **Thread header tied to booking status** (`Now`)
What to do: Put the current booking state and next required action at the top of each thread.
Why it matters: Messaging should reduce ambiguity, not create side quests.
Done when: Every conversation shows what stage the booking is in.

62. **Message composer with structured prompts** (`Soon`)
What to do: Suggest prompt chips like `confirm dimensions`, `ask about stairs`, `share access photo`, `confirm pickup window`.
Why it matters: Structured prompts reduce missing information and awkward back-and-forth.
Done when: Common operational questions need fewer typed messages.

63. **Quick replies for carriers** (`Soon`)
What to do: Add reusable responses for stairs, access, dimensions, timing, and helper requirements.
Why it matters: Faster replies improve conversion and reduce ops load.
Done when: Carriers can answer common questions in one tap.

64. **Thread deadlines** (`Soon`)
What to do: Show visible response deadlines for booking confirmation, proof upload, dispute response, and customer confirmation.
Why it matters: Mature marketplaces reduce uncertainty with visible clocks.
Done when: No critical thread state lacks a deadline.

65. **24-hour response expectation** (`Now`)
What to do: Set and surface a clear response standard for important booking messages.
Why it matters: Users trust marketplaces that define responsiveness.
Done when: Response standards appear in the carrier experience and support copy.

66. **Automated nudges for missing next steps** (`Now`)
What to do: Trigger reminders for missing proof, unanswered requests, incomplete payout setup, and pending completion.
Why it matters: One founder should not manually chase obvious follow-ups.
Done when: Routine nudges are system-driven.

67. **Attachment labels in chat** (`Now`)
What to do: Let users label images as `item photo`, `pickup area`, `delivery proof`, `damage evidence`, or `access issue`.
Why it matters: Structured evidence is easier to review later.
Done when: Image uploads no longer become an unlabeled blob.

68. **Photo request prompts in-thread** (`Soon`)
What to do: Let either side request a specific kind of photo with one tap.
Why it matters: A lot of move uncertainty is solved by the right image at the right time.
Done when: Users can request missing visual context without typing long instructions.

69. **Day-of-move urgent contact mode** (`Soon`)
What to do: Unlock easier direct contact only after booking is confirmed and the move is time-sensitive.
Why it matters: Tight handoffs need speed, but early contact leaks hurt the marketplace.
Done when: Direct contact opens only where it adds operational value.

70. **Message risk detection** (`Later`)
What to do: Flag messages with external links, off-platform payment prompts, or suspicious wording for admin review.
Why it matters: Basic pattern detection reduces scam exposure without heavy moderation.
Done when: Risky threads surface in admin before damage spreads.

## F. Payments, Pricing, And Booking Safety

71. **Booking breakdown consistency** (`Now`)
What to do: Ensure the same price breakdown appears in search, trip detail, checkout, confirmation, and support views.
Why it matters: A consistent pricing system feels trustworthy and reduces confusion.
Done when: No screen invents its own version of the total.

72. **Hold funds until proper completion** (`Now`)
What to do: Keep customer funds secured until proof and completion logic are satisfied.
Why it matters: Payments are the marketplace's strongest trust lever.
Done when: Early release is exceptional, not default.

73. **Explain payout holds clearly** (`Now`)
What to do: When payout is blocked, show the missing step, the current balance, and what happens after it is resolved.
Why it matters: Hidden payout logic creates provider anxiety fast.
Done when: Carriers understand why money is waiting.

74. **Cancellation policy matrix by stage** (`Soon`)
What to do: Define outcomes for pre-confirmation cancel, post-confirmation cancel, carrier cancel, failed access, and mid-service interruption.
Why it matters: Cancellations become chaos when policy is vague.
Done when: Support can point to one matrix instead of improvising.

75. **No unstructured day-of-job extras** (`Now`)
What to do: Only allow extra charges through defined add-on paths or admin-reviewed exception flows.
Why it matters: Surprise price changes destroy trust.
Done when: Chat cannot casually rewrite the transaction.

76. **Partial refund rules tied to evidence** (`Soon`)
What to do: Base partial refunds on proof, timeline, and completed portion of the job.
Why it matters: Real move scenarios are messy; policy needs a fair middle ground.
Done when: Partial outcomes are explainable and repeatable.

77. **Carrier payout ledger** (`Soon`)
What to do: Give carriers a clean ledger with booking ID, earnings, fees, payout status, and export.
Why it matters: Airtasker-style payout clarity helps providers trust the platform.
Done when: A carrier can reconcile earnings without asking support.

78. **Price guidance based on route and item patterns** (`Soon`)
What to do: Show historical ranges and examples, not a black-box recommended price.
Why it matters: Founders need pricing support that stays explainable.
Done when: Carriers can price more consistently without losing agency.

79. **Customer payment reassurance panel** (`Now`)
What to do: Explain in checkout that payment is held, when it gets released, and how disputes work.
Why it matters: Payment trust is conversion trust.
Done when: Checkout directly answers "what happens to my money?"

80. **Booking request expiry** (`Soon`)
What to do: Expire unconfirmed booking requests after a visible timeframe.
Why it matters: Pending forever feels broken.
Done when: Request lifecycle is finite and explicit.

## G. Proof, Safety, And Dispute Operations

81. **Pickup proof pack** (`Now`)
What to do: Require pickup photos, item condition, item count, and pickup confirmation before status moves to in-transit.
Why it matters: The dispute story should start before the dispute.
Done when: Every in-transit booking has a complete pickup record.

82. **Delivery proof pack** (`Now`)
What to do: Require delivery photos, recipient confirmation, and exception notes before payout completion.
Why it matters: Delivery should be documented, not assumed.
Done when: Every completed booking has a minimum delivery proof set.

83. **Exception logging in the moment** (`Now`)
What to do: Add fast-report flows for access blocked, item mismatch, damage spotted, or no-show.
Why it matters: Evidence captured live is far better than memory later.
Done when: Users can log exceptions during the event, not after.

84. **Dispute center with reason codes** (`Soon`)
What to do: Centralize disputes into structured categories with evidence upload and deadline tracking.
Why it matters: Support becomes scalable when disputes are structured.
Done when: Every dispute has reason code, evidence, and timeline.

85. **Response deadline for claims** (`Soon`)
What to do: Give both sides a clear response window once a claim is opened.
Why it matters: Timeboxing keeps disputes moving.
Done when: Claims stop stalling in open-ended silence.

86. **Damage storytelling template** (`Soon`)
What to do: Guide users to document `before`, `during`, `after`, `where damage happened`, and `what result is requested`.
Why it matters: Better evidence makes better resolutions.
Done when: Damage claims arrive with enough structure to review quickly.

87. **Prohibited item policy** (`Now`)
What to do: Publish and enforce a clear banned-items list for dangerous goods, unlawful transport, unsafe chemicals, and other excluded cargo.
Why it matters: Not every moving request belongs in moverrr.
Done when: Carriers and customers can see what is out of scope.

88. **Asbestos and regulated waste ban** (`Now`)
What to do: Explicitly ban asbestos, contaminated waste, and similar regulated disposal jobs.
Why it matters: Sydney move requests can drift into risky territory quickly.
Done when: Support and users have a clear no-go rule.

89. **Manual handling risk prompts** (`Now`)
What to do: Trigger risk prompts for heavy, awkward, bulky, or one-person-dangerous items.
Why it matters: Safety belongs in the product, not just in common sense.
Done when: Risky jobs force clearer handling expectations.

90. **Departure safety checklist** (`Soon`)
What to do: Require a carrier confirmation step for load restraint, visibility, straps, and secure packing on relevant trips.
Why it matters: Good marketplaces help providers avoid predictable failures.
Done when: Relevant bookings include a pre-departure safety check.

## H. Carrier Operations And Repeat Supply

91. **Carrier Today screen** (`Soon`)
What to do: Build a simple "today" view showing upcoming handoffs, proof needed, messages waiting, and payout blockers.
Why it matters: Airbnb invests heavily in host operations surfaces; moverrr needs a lightweight version for carriers.
Done when: A carrier can open the app and know what to do next in ten seconds.

92. **Trip health score** (`Soon`)
What to do: Score active trips based on missing proof, unanswered messages, timing uncertainty, and unresolved access questions.
Why it matters: Ops teams should see risk before a booking fails.
Done when: Risky trips stand out before the day goes wrong.

93. **Remaining capacity auto-update** (`Now`)
What to do: Recalculate and display remaining capacity immediately after booking changes.
Why it matters: Spare-capacity inventory breaks if available space lies.
Done when: Capacity stays correct after create, cancel, and adjustment flows.

94. **Rebook from completed trip** (`Soon`)
What to do: Let carriers create a new listing from a successfully completed route with one tap.
Why it matters: Repeatable wins should turn into repeatable supply.
Done when: High-performing trips can be relaunched quickly.

95. **Route performance insights** (`Later`)
What to do: Show carriers which routes convert, which item types get booked, and where drop-off happens.
Why it matters: Better supply follows better feedback loops.
Done when: Carriers can see what inventory the market actually wants.

96. **Proof quality coaching** (`Later`)
What to do: Highlight proof issues like blurry photos, missing angles, or missing recipient confirmation.
Why it matters: Proof quality is an operational skill that can be improved.
Done when: The product teaches carriers what strong proof looks like.

97. **Carrier streaks for reliability** (`Later`)
What to do: Add positive reinforcement for completed jobs with fast responses, clean proof, and no disputes.
Why it matters: Quality markets reward good behavior visibly.
Done when: Reliable carriers can see momentum-building signals.

98. **Repeat customer path** (`Soon`)
What to do: Let previous customers rebook a trusted carrier on similar corridors without turning moverrr into private off-platform logistics.
Why it matters: Repeat trust is one of the strongest marketplace assets.
Done when: Repeat bookings happen in-platform with minimal friction.

99. **Saved trip templates for customers** (`Later`)
What to do: Let customers save recurring move details like office overflow or marketplace pickups.
Why it matters: Repeat demand can be made easier without inventing quote workflows.
Done when: Returning customers can reuse structured request details quickly.

100. **Founder ops cockpit** (`Now`)
What to do: Build one admin view showing new listings, weak listings, pending payouts, disputes, saved-search demand, risky threads, and top supply gaps.
Why it matters: A solo founder needs one place to run the market day to day.
Done when: The founder can start the day, scan the market, and know the top five actions immediately.

## First 15 To Actually Build

If we want the strongest next move, build these first:

1. Search card: why this trip fits
2. Search card: total price, not teaser price
3. Empty state: save this route
4. Hero section: real trip first
5. Pricing panel: full moverrr breakdown
6. Trip detail: included vs not included
7. Posting flow: duplicate last trip
8. Posting flow: publish gate for weak listings
9. Carrier profile: layered badges
10. Off-platform leak prevention
11. Thread header tied to booking status
12. Automated nudges for missing next steps
13. Booking breakdown consistency
14. Pickup proof pack
15. Founder ops cockpit

## What Not To Build By Accident

Do not let these tasks drift into:

- quote requests from customers to many carriers
- bidding wars
- hidden ranking logic that cannot be explained
- live dispatch and route optimization
- bespoke removalist service packages
- unlimited message-based price negotiation
- complicated enterprise compliance theater

## Research Basis

This document was informed by patterns repeatedly visible across:

- Airtasker trust, contact privacy, badges, payment release, payout, and communication rules
- Airbnb listing clarity, total-price visibility, response expectations, pending states, reviews, accessibility thinking, and host operations patterns
- marketplace operations playbooks for payments, messaging, and notifications
- Australia-specific privacy, consumer, safety, and reporting guidance

The important move was not to copy those products literally.
The important move was to translate what makes them legible, trustworthy, and operationally resilient into moverrr's much narrower spare-capacity marketplace.
