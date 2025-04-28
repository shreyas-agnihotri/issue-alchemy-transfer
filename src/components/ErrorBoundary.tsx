
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, info } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      showDetails: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = window.location.origin + window.location.pathname + '#/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'An unexpected error occurred'}
              
              <Collapsible className="mt-4">
                <CollapsibleTrigger className="flex items-center text-sm text-destructive-foreground/70 hover:text-destructive-foreground">
                  <info className="h-4 w-4 mr-2" />
                  Show Details
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="text-xs space-y-2">
                    <div>
                      <strong>Error Name:</strong> {this.state.error?.name}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error?.message}
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-2 p-2 bg-destructive/10 rounded overflow-auto max-h-[200px] whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    {process.env.NODE_ENV === 'development' && (
                      <div>
                        <strong>Console Logs:</strong>
                        <pre className="mt-2 p-2 bg-destructive/10 rounded overflow-auto max-h-[200px] whitespace-pre-wrap">
                          {/* This will capture the last 50 console logs */}
                          {console.logs?.slice(-50).join('\n')}
                        </pre>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={this.handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
