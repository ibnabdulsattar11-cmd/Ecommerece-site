const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-success-light text-success",
  cancelled: "bg-gray-100 text-gray-600",
  return_requested: "bg-orange-100 text-orange-700",
  returned: "bg-orange-100 text-orange-700",
  refunded: "bg-gray-100 text-gray-600",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
