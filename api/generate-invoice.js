const puppeteer = require('puppeteer');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { htmlContent, fileName } = req.body;

    if (!htmlContent || !fileName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent);

        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        const safeFileName = encodeURIComponent(fileName);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFileName}"`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while generating the PDF.',
        });
    }
};

module.exports = allowCors(handler);
