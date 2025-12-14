import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onDismiss?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

/**
 * Error boundary specifically for Gemini API failures
 * Provides user-friendly error messages and recovery options
 */
export class GeminiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: error.message || 'Unknown error occurred',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GeminiErrorBoundary] Caught error:', error, errorInfo);
    
    // Check if it's a Gemini-specific error
    const isGeminiError = 
      error.message.includes('Gemini') ||
      error.message.includes('API key') ||
      error.message.includes('extract bill data');

    if (isGeminiError) {
      this.setState({
        errorInfo: error.message || 'Failed to process bill image. Please try manual entry.',
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  };

  render() {
    if (this.state.hasError) {
      const isApiKeyError = this.state.errorInfo.includes('API key');
      const isNetworkError = this.state.errorInfo.includes('network') || 
                            this.state.errorInfo.includes('fetch');

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Bill Image Processing Failed</h3>
              <p className="text-sm text-red-700 mb-3">
                {isApiKeyError
                  ? 'Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.'
                  : isNetworkError
                  ? 'Network error occurred. Please check your connection and try again.'
                  : this.state.errorInfo || 'Failed to extract data from bill image. Please try manual entry.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={this.handleRetry}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
                <button
                  onClick={this.handleDismiss}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <X size={14} />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

