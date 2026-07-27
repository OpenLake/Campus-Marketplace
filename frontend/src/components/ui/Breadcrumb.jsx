import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumb Component
 * Navigation trail for user orientation
 */
const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 font-sans">
      <Link
        to="/"
        className="flex items-center hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => {
        if (!item || !item.label) return null;
        
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600 shrink-0" />
            {item.link && !isLast ? (
              <Link
                to={item.link}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 dark:text-gray-200 font-semibold truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
