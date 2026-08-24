export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const units = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.secs);
    if (value >= 1) return `${value}${unit.label} ago`;
  }
  return "just now";
}

export function getInitials(fullName = "") {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// budgetType 2 == "Hourly rate" per the BUDGET_TYPES guess in
// constants/lookups.js 
export function formatPrice(price, budgetType) {
  const amount = Number(price).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  return Number(budgetType) === 2 ? `$${amount}/hr` : `$${amount}`;
}

export function formatReference(jobPostId) {
  return `#KH-${1000 + Number(jobPostId)}`;
}