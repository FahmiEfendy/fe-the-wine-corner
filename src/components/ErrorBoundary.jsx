import { Component } from 'react';
import { Wine } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error in component tree:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
                    <Wine size={48} color="var(--accent)" style={{ marginBottom: '20px' }} />
                    <h1 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Something went wrong</h1>
                    <p style={{ color: 'var(--text-light)', maxWidth: '420px', margin: '0 auto 30px' }}>
                        We hit an unexpected error. Please try reloading the page.
                    </p>
                    <button onClick={this.handleReload} className="btn-primary" style={{ border: 'none' }}>
                        Back to Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
