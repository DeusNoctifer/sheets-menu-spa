import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  // shouldRender controla si existe en el DOM
  const [shouldRender, setShouldRender] = useState(isVisible);
  // animate controla las clases de Tailwind (la transición visual)
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Le damos 10ms a React para que monte el componente oculto
      // antes de activar la animación de entrada
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      // Iniciamos la animación de salida
      setAnimate(false);
      // Esperamos 300ms (lo que dura la transición) para quitarlo del DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Efecto para el auto-cierre tras 3 segundos
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
                    ? 'opacity-100 translate-y-0 scale-100' // Posición final (visible)
                    : 'opacity-0 -translate-y-12 scale-95 pointer-events-none' // Posición inicial/final (oculto hacia arriba)
                  }`}
    >
      <div className="bg-gray-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl shadow-black/30 flex items-center justify-between gap-3 border border-gray-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CheckCircle2 size={20} className="text-brand-primary shrink-0" />
          <span className="text-sm font-medium leading-tight truncate">
            {message}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors active:scale-90 p-1.5 shrink-0 bg-gray-800 rounded-full"
        >
          <X size={14} strokeWidth={4} />
        </button>
      </div>
    </div>
  );
}