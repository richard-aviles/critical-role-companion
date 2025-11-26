'use client';

interface CardTypeToggleProps {
  cardType: 'simple' | 'enhanced';
  onChange: (type: 'simple' | 'enhanced') => void;
}

export default function CardTypeToggle({ cardType, onChange }: CardTypeToggleProps) {
  return (
    <div className="flex gap-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          name="cardType"
          value="simple"
          checked={cardType === 'simple'}
          onChange={(e) => onChange('simple')}
          className="w-4 h-4"
        />
        <div>
          <div className="font-medium text-gray-900">Simple</div>
          <div className="text-sm text-gray-600">Text-based character info</div>
        </div>
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          name="cardType"
          value="enhanced"
          checked={cardType === 'enhanced'}
          onChange={(e) => onChange('enhanced')}
          className="w-4 h-4"
        />
        <div>
          <div className="font-medium text-gray-900">Enhanced</div>
          <div className="text-sm text-gray-600">Visual badges with positioning</div>
        </div>
      </label>
    </div>
  );
}
