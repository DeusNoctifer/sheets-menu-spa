import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {

  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    }
    setAnimate(false);
    const timer = setTimeout(() => setShouldRender(false), 300);
    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed top-5 md:top-5 left-1/2 -translate-x-1/2 z-[200] px-4 w-full max-w-sm 
                  transition-all duration-300 ease-out transform
                  ${animate 
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-12 scale-95 pointer-events-none'
                  }`}
    >
      <div className="toast-success bg-white/95 backdrop-blur-md text-brand-text px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3 border border-brand-accent/25">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-full bg-brand-accent/15 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-brand-accent" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold leading-tight truncate">
            {message}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-brand-text/35 hover:text-brand-text/60 transition-colors active:scale-90 p-1.5 shrink-0 bg-brand-accent/10 hover:bg-brand-accent/15 rounded-full"
          aria-label="Cerrar notificación"
        >
          <X size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}