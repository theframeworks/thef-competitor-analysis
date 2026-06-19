import { btnBack } from "../../lib/ui";

interface BackLinkProps {
  label: string;
  onClick: () => void;
}

export function BackLink({ label, onClick }: BackLinkProps) {
  return (
    <nav className="mb-6" aria-label="Page">
      <button type="button" className={btnBack} onClick={onClick}>
        <i className="ti ti-arrow-left" aria-hidden="true" />
        {label}
      </button>
    </nav>
  );
}
