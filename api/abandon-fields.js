const sgMail = require('@sendgrid/mail');
const allowCors = require('../utils/allowCors');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getEventKeyFromUrl = (url) => {
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split('.');
        const registerIndex = parts.indexOf('register');

        if (registerIndex !== -1 && parts[registerIndex + 1]) {
            return parts[registerIndex + 1].toLowerCase();
        }

        return null;
    } catch {
        return null;
    }
};

const EVENT_EMAIL_MAP = {
    employeeexperiencesummit: ['daniel.f@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    financialdigitalmarketing: ['sam.caskey@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    bigdatacanada: ['louis@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    datafinancialservicessummit: ['louis@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    peopleanalyticscanada: ['daniel.f@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    foodsafetysummit: ['anthony.ar@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    customerexperiencecanada: ['james.m@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    contactcentresummit: ['james.m@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
    foundationendowmentsummit: ['anthony.ar@strategyinstitute.com', 'strategyinstitutegtm@gmail.com'],
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

        const timestampCA = new Date().toLocaleString("en-CA", {
            timeZone: "America/Toronto",
            dateStyle: "full",
            timeStyle: "long",
        });

        let fullEmails = [];

        if (Array.isArray(data.emailUsers) && Array.isArray(data.emailDomains)) {
            fullEmails = data.emailUsers
                .map((user, idx) => {
                    const domain = data.emailDomains[idx] || "";
                    return user && domain ? `${user}@${domain}` : user || domain || "";
                })
                .filter(Boolean);
        } else if (Array.isArray(data.emailAddresses)) {
            fullEmails = data.emailAddresses;
        }

        const eventKey = getEventKeyFromUrl(data.eventWeb);
        const recipients = EVENT_EMAIL_MAP[eventKey] || DEFAULT_RECIPIENTS;

        const msg = {
            to: recipients,
            from: 'masfess24@gmail.com',
            subject: `Abandoned Checkout Form${eventKey ? ` - ${eventKey}` : ''}`,
            html: `
                <h3>Abandoned Form Data</h3>
                <p><strong>Names:</strong> ${data.userName?.join(", ") || "N/A"}</p>
                <p><strong>Emails:</strong> ${fullEmails.join(", ") || "N/A"}</p>
                <p><strong>Companies:</strong> ${data.compNames?.join(", ") || "N/A"}</p>
                <p><strong>Event Web:</strong> ${data.eventWeb || "N/A"}</p>
                <p><strong>Time:</strong> ${timestampCA}</p>
            `,
        };

        await sgMail.send(msg);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending abandon email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
};

module.exports = allowCors(handler);
