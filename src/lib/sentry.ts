import * as Sentry from "@sentry/nextjs";

export function captureAppError(
  error: unknown,
  context: { feature: string; action: string; tags?: Record<string, string> },
) {
  if (!(error instanceof Error)) {
    return;
  }

  Sentry.captureException(error, {
    tags: {
      feature: context.feature,
      action: context.action,
      ...context.tags,
    },
  });
}
