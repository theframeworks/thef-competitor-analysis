interface BackLinkProps {
  label: string;
  onClick: () => void;
}

export function BackLink({ label, onClick }: BackLinkProps) {
  return (
    <nav className="page-nav" aria-label="Page">
      <button type="button" className="back-link" onClick={onClick}>
        <i className="ti ti-arrow-left" aria-hidden="true" /> {label}
      </button>
    </nav>
  );
}
