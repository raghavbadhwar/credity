import { Check } from 'lucide-react';

interface StepperProps {
  steps: { name: string; status: 'pending' | 'in_progress' | 'completed' | 'failed' }[];
  currentStep?: number;
}

export function Stepper({ steps }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.name} className="md:flex-1">
            <div
              className={`flex flex-col border-l-4 md:border-l-0 md:border-t-4 py-2 pl-4 md:pl-0 md:pt-4 md:pb-0 ${
                step.status === 'completed'
                  ? 'border-green-500'
                  : step.status === 'in_progress'
                  ? 'border-blue-500'
                  : step.status === 'failed'
                  ? 'border-red-500'
                  : 'border-gray-200'
              }`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  step.status === 'completed'
                    ? 'text-green-600'
                    : step.status === 'in_progress'
                    ? 'text-blue-600'
                    : step.status === 'failed'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                Step {index + 1}
              </span>
              <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                {step.name}
                {step.status === 'completed' && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
