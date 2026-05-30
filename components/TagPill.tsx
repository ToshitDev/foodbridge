const styles: Record<string, string> = {
  "veg":           "bg-green-50  text-green-700  border-green-200",
  "non-veg":       "bg-red-50    text-red-600    border-red-200",
  "allergen-free": "bg-blue-50   text-blue-600   border-blue-200",
};

const labels: Record<string, string> = {
  "veg":           "🥦 Veg",
  "non-veg":       "🍗 Non-Veg",
  "allergen-free": "✓ Allergen-Free",
};

export default function TagPill({ tag }: { tag: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[tag] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
      {labels[tag] ?? tag}
    </span>
  );
}
