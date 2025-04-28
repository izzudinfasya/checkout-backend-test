const authenticate = (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');

    if (username !== process.env.BASIC_USERNAME || password !== process.env.BASIC_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    return true;
};

module.exports = authenticate;
