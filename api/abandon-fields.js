const sgMail = require('@sendgrid/mail');
const allowCors = require('../utils/allowCors');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getEventKeyFromUrl = (url) => {
    try {
        if (!url) return null;

        const hostname = new URL(url).hostname.toLowerCase();
        const parts = hostname.split('.');
        const registerIndex = parts.indexOf('register');

        if (registerIndex !== -1 && parts[registerIndex + 1]) {
            return parts[registerIndex + 1];
        }

        return null;
    } catch {
        return null;
    }
};

const EVENT_CONFIG = {
    employeeexperiencesummit: {
        label: 'Employee Experience Summit',
        emails: ['daniel.f@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    financialdigitalmarketing: {
        label: 'Financial Digital Marketing Summit',
        emails: ['sam.caskey@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    bigdatacanada: {
        label: 'Big Data Canada Summit',
        emails: ['louis@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    datafinancialservicessummit: {
        label: 'Data & Financial Services Summit',
        emails: ['louis@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    peopleanalyticscanada: {
        label: 'People Analytics Canada',
        emails: ['daniel.f@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    foodsafetysummit: {
        label: 'Food Safety Summit',
        emails: ['anthony.ar@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    customerexperiencecanada: {
        label: 'Customer Experience Canada',
        emails: ['james.m@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    contactcentresummit: {
        label: 'Contact Centre Summit',
        emails: ['james.m@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
    foundationendowmentsummit: {
        label: 'Foundation & Endowment Summit',
        emails: ['anthony.ar@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    },
};

const DEFAULT_RECIPIENTS = [
    'strategyinstitutegtm@gmail.com',
    'arya.r@piumeno.co',
];

const handler = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const data = JSON.parse(req.body);

        const timestampCA = new Date().toLocaleString('en-CA', {
            timeZone: 'America/Toronto',
            dateStyle: 'full',
            timeStyle: 'long',
        });

        let fullEmails = [];

        if (Array.isArray(data.emailUsers) && Array.isArray(data.emailDomains)) {
            fullEmails = data.emailUsers
                .map((user, idx) => {
                    const domain = data.emailDomains[idx] || '';
                    return user && domain ? `${user}@${domain}` : '';
                })
                .filter(Boolean);
        } else if (Array.isArray(data.emailAddresses)) {
            fullEmails = data.emailAddresses.filter(Boolean);
        }

        const workPhones = Array.isArray(data.workPhones)
            ? data.workPhones.filter(Boolean)
            : [];

        const eventKey = getEventKeyFromUrl(data.eventWeb);
        const eventConfig = EVENT_CONFIG[eventKey];

        const recipients = eventConfig?.emails || DEFAULT_RECIPIENTS;
        const eventLabel = eventConfig?.label || 'Unknown Event';

        const msg = {
            to: recipients,
            from: 'masfess24@gmail.com',
            subject: `Abandoned Checkout Form - ${eventLabel}`,
            html: `
                <h3>Abandoned Form Data</h3>
                <p><strong>Event:</strong> ${eventLabel}</p>
                <p><strong>Names:</strong> ${data.userName?.join(', ') || 'N/A'}</p>
                <p><strong>Emails:</strong> ${fullEmails.join(', ') || 'N/A'}</p>
                <p><strong>Companies:</strong> ${data.compNames?.join(', ') || 'N/A'}</p>
                <p><strong>Job Titles:</strong> ${data.jobTitles.join(', ') || 'N/A'}</p>
                <p><strong>Work Phones:</strong> ${workPhones.join(', ') || 'N/A'}</p>
                <p><strong>Event Web:</strong> ${data.eventWeb || 'N/A'}</p>
                <p><strong>Time:</strong> ${timestampCA}</p>
            `,
        };

        await sgMail.send(msg);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending abandoned checkout email:', error);
        return res.status(500).json({ error: 'Failed to send email' });
    }
};

module.exports = allowCors(handler);
