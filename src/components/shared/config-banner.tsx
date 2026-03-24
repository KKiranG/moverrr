interface ConfigBannerProps {
  message: string;
}

export function ConfigBanner({ message }: ConfigBannerProps) {
  return (
    <div className="surface-card border-warning/20 bg-warning/10 p-4">
      <p className="text-sm text-text">{message}</p>
    </div>
  );
}
