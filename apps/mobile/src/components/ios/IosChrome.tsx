import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function IosPage({ children }: { children: ReactNode }) {
  return <div className="ios-page">{children}</div>;
}

export function IosLargeTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="ios-large-title-wrap">
      <h1 className="ios-large-title">{title}</h1>
      {subtitle && <p className="ios-large-subtitle">{subtitle}</p>}
    </div>
  );
}

export function IosSection({
  header,
  footer,
  children,
}: {
  header?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <section className="ios-section">
      {header && <p className="ios-section-header">{header}</p>}
      <div className="ios-group">{children}</div>
      {footer && <p className="ios-section-footer">{footer}</p>}
    </section>
  );
}

export function IosChevron() {
  return (
    <svg className="ios-row__chevron" viewBox="0 0 8 13" fill="none" aria-hidden>
      <path
        d="M1.5 1.5L6.5 6.5L1.5 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IosNavBar({
  title,
  backLabel = "Back",
  onBack,
}: {
  title: string;
  backLabel?: string;
  onBack: () => void;
}) {
  return (
    <header className="ios-navbar">
      <button type="button" className="ios-navbar__back" onClick={onBack}>
        <svg viewBox="0 0 12 20" fill="none" aria-hidden>
          <path
            d="M10 2L3 10L10 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {backLabel}
      </button>
      <span className="ios-navbar__title">{title}</span>
      <span className="ios-navbar__side" aria-hidden />
    </header>
  );
}

export function IosEmptyState({
  title,
  body,
  actionLabel,
  actionTo,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="ios-empty">
      <p className="ios-empty__title">{title}</p>
      <p className="ios-empty__body">{body}</p>
      {actionLabel && actionTo && (
        <Link className="ios-empty__action" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function IosBanner({
  tone,
  children,
}: {
  tone: "info" | "success" | "error" | "warning";
  children: ReactNode;
}) {
  return <div className={`ios-banner ios-banner--${tone}`}>{children}</div>;
}
