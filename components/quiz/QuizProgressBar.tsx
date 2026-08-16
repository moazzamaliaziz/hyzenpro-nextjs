'use client';

interface QuizProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function QuizProgressBar({
  currentStep,
  totalSteps,
}: QuizProgressBarProps) {
  const progress = totalSteps > 0 ? Math.min((currentStep / totalSteps) * 100, 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-gray-500">
        <span>Question {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
