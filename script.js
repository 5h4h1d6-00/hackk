// script.js

let scannedData = {};

// Start QR Scanner (Page 1)
function startScanner() {
    const reader = document.getElementById('reader');
    if (!reader) return;

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 300 } },
        (decodedText) => {
            processQRData(decodedText);
            html5QrCode.stop();
        }
    ).catch(err => {
        console.error(err);
        alert("Camera permission required!");
    });
}

function processQRData(qrText) {
    try {
        const url = new URL(qrText.startsWith('upi') ? qrText : 'https://dummy?' + (qrText.split('?')[1] || ''));
        const params = new URLSearchParams(url.search);

        scannedData = {
            name: decodeURIComponent(params.get('pn') || 'Unknown Recipient'),
            upi: params.get('pa') || 'Not Found',
            app: detectPaymentApp(params.get('pa'))
        };

        localStorage.setItem('scannedData', JSON.stringify(scannedData));
        window.location.href = 'amount.html';
    } catch (e) {
        alert("Invalid UPI QR Code. Please try again.");
    }
}

function detectPaymentApp(upi) {
    if (!upi) return "UPI";
    if (upi.includes('@ybl') || upi.includes('@axl')) return "PhonePe";
    if (upi.includes('@oksbi')) return "SBI";
    if (upi.includes('@okaxis') || upi.includes('@okhdfcbank')) return "Google Pay";
    return "UPI App";
}

// Page 2 - Proceed
function proceedToSuccess() {
    const amount = document.getElementById('amountInput').value || "10.00";
    localStorage.setItem('paymentAmount', parseFloat(amount).toFixed(2));
    window.location.href = 'success.html';
}

// Page 3 - Load Success Data
function loadSuccessPage() {
    const data = JSON.parse(localStorage.getItem('scannedData') || '{}');
    const amount = localStorage.getItem('paymentAmount') || "150.00";

    document.getElementById('displayAmount').textContent = `₹${amount}`;
    document.getElementById('displayName').textContent = data.name || "Unknown";

    const app = data.app || "UPI";
    document.getElementById('displayUPI').innerHTML = `${app} • ${data.upi || 'Not Available'}`;

    // Current Date & Time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    const timeStr = `${dateStr}, ${hours}:${minutes} ${ampm}`;
    document.getElementById('displayTime').textContent = timeStr;
}

// Auto Run
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    window.onload = startScanner;
}

if (window.location.pathname.endsWith('success.html')) {
    window.onload = loadSuccessPage;
}