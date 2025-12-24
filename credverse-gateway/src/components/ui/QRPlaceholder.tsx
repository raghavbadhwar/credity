interface QRPlaceholderProps {
  size?: number;
  className?: string;
}

export function QRPlaceholder({ size = 200, className = '' }: QRPlaceholderProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <span className="text-sm text-gray-500">QR Code</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        ⏱️ QR valid for 5 minutes
      </p>
    </div>
  );
}
