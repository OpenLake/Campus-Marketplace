import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "default",
  closeOnOverlayClick = true,
  showCloseButton = true,
  fullScreen = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (fullScreen) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.margin = "0";
        document.body.style.padding = "0";
      }
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.margin = "";
      document.body.style.padding = "";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.margin = "";
      document.body.style.padding = "";
    };
  }, [isOpen, fullScreen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        fullScreen ? "overflow-hidden" : "overflow-y-auto"
      )}
      style={
        fullScreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              margin: 0,
              padding: 0,
            }
          : {}
      }
    >
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 transition-opacity",
          fullScreen && "pointer-events-none"
        )}
        onClick={closeOnOverlayClick && !fullScreen ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className={cn(
          "flex min-h-full items-center justify-center p-4",
          fullScreen ? "fixed inset-0 p-0 z-50" : ""
        )}
      >
        <div
          className={cn(
            "relative bg-white shadow-xl transform transition-all",
            fullScreen
              ? "w-screen h-screen max-w-none max-h-none rounded-none flex flex-col"
              : `w-full ${sizeClasses[size]} rounded-lg`
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-start justify-between px-6 py-4 border-b border-gray-200",
              fullScreen && "px-8 py-6"
            )}
          >
            <div className="flex-1">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {/* Body */}
          <div
            className={cn(
              "px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto",
              fullScreen && "flex-1 px-8 py-6 max-h-none overflow-auto"
            )}
          >
            {children}
          </div>
          {/* Footer */}
          {footer && (
            <div
              className={cn(
                "flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50",
                fullScreen && "px-8 py-2"
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
