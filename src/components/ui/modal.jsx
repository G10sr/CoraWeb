import { useEffect } from "react";

const Modal = ({
  children,
  isOpen,
  onClose,
  size = "md",
  closeOnOverlayClick = true,
}) => {
  /*
  |--------------------------------------------------------------------------
  | ESCAPE KEY SUPPORT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, onClose]);

  /*
  |--------------------------------------------------------------------------
  | PREVENT BODY SCROLL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  /*
  |--------------------------------------------------------------------------
  | SIZE CLASSES
  |--------------------------------------------------------------------------
  */

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE HANDLER
  |--------------------------------------------------------------------------
  */

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
        animate-fadeIn
      "
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      {/* MODAL CONTENT */}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative
          w-full
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
          animate-modalPop
          ${sizeClasses[size]}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

