export default function StatCard({ label, value, hint, tone = "primary" }) {
  const toneClasses = {
    primary: "text-primary-700 bg-primary-50",
    success: "text-success bg-success-light",
    warning: "text-warning bg-warning-light",
    danger: "text-danger bg-danger-light",
  };

  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <span className={`badge mt-2 ${toneClasses[tone]}`}>{hint}</span>}
    </div>
  );
}
