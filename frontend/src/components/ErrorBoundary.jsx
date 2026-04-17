import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-8">
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Reload Application
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 text-sm text-gray-500 hover:text-primary transition-colors font-medium border-b border-transparent hover:border-primary"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
