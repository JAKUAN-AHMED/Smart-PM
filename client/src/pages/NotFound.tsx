import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="relative grid min-h-screen place-items-center p-6">
      <div className="app-mesh" />
      <div className="text-center">
        <div className="font-display text-[120px] font-bold leading-none gradient-text sm:text-[160px]">
          404
        </div>
        <p className="mt-2 text-ink-500 dark:text-ink-400">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
