import React from "react";

const getBarColor = (percent) => {
  if (percent === 100) return "bg-green-500";
  if (percent >= 70) return "bg-green-300";
  if (percent >= 40) return "bg-yellow-200";
  if (percent > 0) return "bg-red-200";
  return "bg-gray-700";
};

const ProgressBar = ({ label, used, added = 0, max, unit }) => {
  const total = used + added;
  const percent = Math.round((total / max) * 100);
  return (
    <div className="text-left text-sm text-gray-700">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span>{total}{unit} / {max}{unit}</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded">
        <div
          className={`h-3 rounded transition-all duration-300 ${getBarColor(percent)}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const MonthlyUsageSummary = ({
  usage,
  subscriptionTier,
  cart = [],
  showTitle = true,
  title = "📦 이번 달 사용량",
}) => {
  if (!usage || !subscriptionTier) return null;

  const totalByType = {
    SAND: 0,
    BAG: 0,
    LITTERBOX: 0,
    SCOOP: 0,
  };

  cart.forEach(item => {
    const { type, capacity } = item.product;
    const quantity = item.quantity;
    if (type === "SAND" || type === "BAG") {
      totalByType[type] += (capacity || 0) * quantity;
    } else if (type === "LITTERBOX" || type === "SCOOP") {
      totalByType[type] += quantity;
    }
  });

  return (
    <div className="space-y-4 text-sm text-gray-700 mt-8">
      {showTitle && (
        <h3 className="text-base font-bold text-green-700 mb-2">{title}</h3>
      )}
      <ProgressBar label="화장실" used={usage.totalLitterboxes} added={totalByType.LITTERBOX} max={subscriptionTier.maxLitterboxesPerOrder} unit="개" />
      <ProgressBar label="삽" used={usage.totalScoops} added={totalByType.SCOOP} max={subscriptionTier.maxScoopsPerOrder} unit="개" />
      <ProgressBar label="모래" used={usage.totalSand} added={totalByType.SAND} max={subscriptionTier.monthlySandLimitLitre} unit="L" />
      <ProgressBar label="봉투" used={usage.totalBag} added={totalByType.BAG} max={subscriptionTier.monthlyBagLimitLitre} unit="L" />
    </div>
  );
};

export default MonthlyUsageSummary;