interface NoticeProps {
  readonly text: string;
  readonly onDismiss?: () => void;
}

export function Notice({ text, onDismiss }: NoticeProps) {
  return (
    <div className="notice" role="alert">
      <span>{text}</span>
      {onDismiss && (
        <button type="button" className="link" onClick={onDismiss} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}
