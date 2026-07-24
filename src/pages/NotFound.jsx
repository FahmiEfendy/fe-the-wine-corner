import { Link } from 'react-router-dom';
import { Wine } from 'lucide-react';

import Seo from '../components/Seo';

const NotFound = ({ title = 'Page Not Found', message = "We couldn't find the page you were looking for." }) => {
    return (
        <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
            <Seo title={title} description={message} />
            <Wine size={48} color="var(--accent)" style={{ marginBottom: '20px' }} />
            <h1 style={{ color: 'var(--primary)', marginBottom: '15px' }}>{title}</h1>
            <p style={{ color: 'var(--text-light)', maxWidth: '420px', margin: '0 auto 30px' }}>{message}</p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-block' }}>
                Back to Home
            </Link>
        </div>
    );
};

export default NotFound;
