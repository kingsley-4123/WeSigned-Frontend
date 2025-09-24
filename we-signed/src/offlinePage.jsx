import React from 'react';
import { Link } from 'react-router-dom';

const OfflinePage = () => {

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f8f8f8',
            color: '#333'
        }}>
            <h1>You are offline</h1>
            <p>Please check your internet connection and try again.</p>
            <Link to="/component-offline" style={{
                marginTop: '20px',
                padding: '10px 20px',   
                background: '#007bff',
                color: '#fff',
                borderRadius: '5px',
                textDecoration: 'none'
            }}>
                Continue offline.
            </Link>
        </div>
    );
}
export default OfflinePage;