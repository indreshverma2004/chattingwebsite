import React, { useState } from 'react';
import axios from 'axios';

function LoginSignup({ setUserDetails }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignup, setIsSignup] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isSignup
            ? 'http://localhost:5000/api/users/register'
            : 'http://localhost:5000/api/users/login';

        const payload = isSignup
            ? { username, email, password }
            : { email, password };

        try {
            const response = await axios.post(url, payload);
            console.log(response);

            if (response && response.data) {
                alert(response.data.message);

                if (!isSignup) {
                    setUserDetails({
                        userId: response.data.userId,
                        username: response.data.username,
                    });
                }
            } else {
                alert('Unexpected response from server');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.header}>{isSignup ? 'Sign Up' : 'Login'}</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {isSignup && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>
                        {isSignup ? 'Sign Up' : 'Login'}
                    </button>
                </form>
                <p style={styles.switchText}>
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span
                        onClick={() => setIsSignup(!isSignup)}
                        style={styles.switchLink}
                    >
                        {isSignup ? 'Login' : 'Sign Up'}
                    </span>
                </p>
            </div>
        </div>
    );
}


const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '400px',
    },
    header: {
        marginBottom: '20px',
        fontSize: '24px',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        margin: '10px 0',
        fontSize: '16px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    },
    switchText: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#555',
    },
    switchLink: {
        color: '#007BFF',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};

export default LoginSignup;