interface TrustRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function TrustRing({
  score,
  size = 120,
  strokeWidth = 8,
  className = '',
}: TrustRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Outstanding - green
    if (score >= 75) return '#3b82f6'; // Excellent - blue
    if (score >= 60) return '#f59e0b'; // Good - yellow
    if (score >= 40) return '#f97316'; // Fair - orange
    return '#ef4444'; // Poor - red
  };

  const getLabel = (score: number) => {
    if (score >= 90) return 'Outstanding';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-500">{getLabel(score)}</span>
      </div>
    </div>
  );
}
