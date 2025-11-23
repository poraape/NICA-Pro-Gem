import React, { useState } from 'react';
import { Plus, Camera, Droplet, Utensils, X } from 'lucide-react';

interface FABMenuProps {
  onAction: (action: string) => void;
}

export const FABMenu: React.FC<FABMenuProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const actions = [
    { id: 'water', label: 'Log Water', icon: Droplet, color: 'bg-secondary-500' },
    { id: 'scan', label: 'Scan Meal', icon: Camera, color: 'bg-neutral-800' },
    { id: 'meal', label: 'Add Meal', icon: Utensils, color: 'bg-primary-500' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className={`flex flex-col items-end gap-3 transition-all duration-300 z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              onAction(action.id);
              setIsOpen(false);
            }}
            style={{ transitionDelay: `${index * 50}ms` }}
            className="group flex items-center gap-3"
          >
            <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-700 shadow-sm border border-neutral-100 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              {action.label}
            </span>
            <div className={`${action.color} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-neutral-500/20 hover:scale-110 transition-transform`}>
              <action.icon size={18} />
            </div>
          </button>
        ))}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={toggle}
        className={`
          w-14 h-14 rounded-full shadow-glow flex items-center justify-center text-white z-50 transition-all duration-300
          bg-gradient-to-r from-primary-500 to-primary-600
          hover:shadow-lg hover:scale-105 active:scale-95
        `}
        aria-label="Quick Actions"
        aria-expanded={isOpen}
      >
        <Plus size={28} className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
      </button>
    </div>
  );
};