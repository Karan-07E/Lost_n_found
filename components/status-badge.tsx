const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: 'Submitted', className: 'status-submitted' },
  UNDER_REVIEW: { label: 'Under Review', className: 'status-under-review' },
  MATCHED: { label: 'Matched', className: 'status-matched' },
  VERIFICATION: { label: 'Verification', className: 'status-verification' },
  RETURNED: { label: 'Returned', className: 'status-returned' },
  CLOSED: { label: 'Closed', className: 'status-closed' },
  PENDING: { label: 'Pending', className: 'status-under-review' },
  APPROVED: { label: 'Approved', className: 'status-returned' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  MORE_INFO_NEEDED: { label: 'More Info Needed', className: 'status-verification' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'status-closed' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className} shrink-0`}>
      {config.label}
    </span>
  );
}
