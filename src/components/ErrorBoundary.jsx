import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '2rem', textAlign: 'center', direction: 'rtl', fontFamily: 'sans-serif' }}>
                    <h1 style={{ color: 'red' }}>משהו השתבש...</h1>
                    <p>האתר נתקל בשגיאה לא צפויה.</p>
                    <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', textAlign: 'left', direction: 'ltr', overflow: 'auto', margin: '2rem' }}>
                        <h3 style={{ marginTop: 0 }}>Technical Details:</h3>
                        <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                        <pre style={{ fontSize: '0.8rem' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '10px 20px', fontSize: '1rem', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        רענן את העמוד
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
