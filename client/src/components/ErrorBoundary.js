import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="mt-3 text-gray-700">
              The app hit a runtime error while loading. Please refresh the page.
              If the problem continues, clear site data and redeploy the latest commit.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
