// ================= GLOBAL STORAGE =================

let usernameData = {};
let emailData = {};
let ipData = {};
let whoisData = {};
let riskData = {};
let footprintData = {};
let phoneData = {};


// ================= CLEAR DATA =================

function clearAllData() {
    if (confirm("Are you sure you want to clear all investigation data?")) {
        localStorage.clear();
        window.location.reload();
    }
}


// ================= SECTION CONTROL =================

function showSection(id) {

    document.querySelectorAll('.section').forEach(section => {

        section.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}


// ================= DASHBOARD UPDATE =================

function updateDashboard() {

    let scans = 0;

    if (Object.keys(usernameData).length > 0) scans++;
    if (Object.keys(emailData).length > 0) scans++;
    if (Object.keys(ipData).length > 0) scans++;
    if (Object.keys(whoisData).length > 0) scans++;
    if (Object.keys(phoneData).length > 0) scans++;

    document.getElementById("totalScans").innerText = scans;

    if (riskData.risk_level) {

        document.getElementById("riskLevelCard").innerText =
            riskData.risk_level;
    }

    if (footprintData.accounts_found !== undefined) {

        document.getElementById("accountsFoundCard").innerText =
            footprintData.accounts_found;
    }
}


// ================= USERNAME INTELLIGENCE =================

function searchUser() {

    let username = document.getElementById("username").value;

    document.getElementById("userResult").innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Analyzing the data...</p>
        </div>
    `;

    fetch('/search', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            username: username
        })

    })

        .then(response => response.json())

        .then(data => {

            usernameData = data;

            let output = `
            <div class="result-card">
                <h2>👤 Username Intelligence</h2>
                <div class="info-grid">
        `;

            for (let site in data) {
                let statusColor = data[site].status === "Found" ? "#00ffcc" : "#ff3355";
                let linkHtml = data[site].profile ? `<a href="${data[site].profile}" target="_blank" style="display:block; margin-top:10px; font-size:12px; color:#ffcc00; text-decoration:none;">🔗 Visit Profile</a>` : "";

                output += `
                <div class="info-item" style="border-color: rgba(255,255,255,0.1);">
                    <h4 style="color: #fff;">${site}</h4>
                    <p style="color: ${statusColor};">${data[site].status}</p>
                    ${linkHtml}
                </div>
            `;
            }

            output += `
                </div>
            </div>
        `;

            document.getElementById("userResult").innerHTML = output;
            localStorage.setItem('userResultHtml', output);
            localStorage.setItem('usernameData', JSON.stringify(data));
            updateDashboard();
        })

        .catch(error => {

            document.getElementById("userResult").innerHTML =
                `<p class="error">Username intelligence failed</p>`;
        });
}


// ================= EMAIL INTELLIGENCE =================

function checkEmail() {

    let email = document.getElementById("email").value;

    document.getElementById("emailResult").innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Analyzing the data...</p>
        </div>
    `;

    fetch('/email', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            email: email
        })

    })

        .then(response => response.json())

        .then(data => {

            emailData = data;

            let output = `
            <div class="result-card">
                <h2>✉️ Email Intelligence</h2>
                <div class="info-grid">
                    <div class="info-item"><h4>Email</h4><p>${data.email}</p></div>
                    <div class="info-item"><h4>Domain</h4><p>${data.domain || "N/A"}</p></div>
                    <div class="info-item ${data.status.includes('Valid') ? '' : 'highlight'}">
                        <h4>Status</h4><p>${data.status}</p>
                    </div>
                </div>
        `;

            if (data.mx_records) {
                output += `<div class="threat-info-box"><h3>📡 MX Records</h3><ul class="threat-list">`;
                data.mx_records.forEach(mx => {
                    output += `<li><span class="threat-bullet" style="background:#00ffcc; box-shadow: 0 0 10px rgba(0,255,204,0.5);"></span>${mx}</li>`;
                });
                output += `</ul></div>`;
            }

            output += `</div>`;

            document.getElementById("emailResult").innerHTML = output;
            localStorage.setItem('emailResultHtml', output);
            localStorage.setItem('emailData', JSON.stringify(data));
            updateDashboard();
        })

        .catch(error => {

            document.getElementById("emailResult").innerHTML =
                `<p class="error">Email intelligence failed</p>`;
        });
}


// ================= PHONE INTELLIGENCE =================

function checkPhone() {

    let phone = document.getElementById("phone").value;

    document.getElementById("phoneResult").innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Analyzing the data...</p>
        </div>
    `;

    fetch('/phone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone: phone
        })
    })
        .then(response => response.json())
        .then(data => {

            phoneData = data;

            let output = `
            <div class="result-card">
                <h2>📱 Phone Intelligence</h2>
                <div class="info-grid">
                    <div class="info-item"><h4>Phone Number</h4><p>${data.phone}</p></div>
                    <div class="info-item ${data.status === 'Valid' ? '' : 'highlight'}">
                        <h4>Status</h4><p>${data.status}</p>
                    </div>
                    <div class="info-item"><h4>Region / Country</h4><p>${data.region}</p></div>
                    <div class="info-item"><h4>Carrier Network</h4><p>${data.carrier}</p></div>
                    <div class="info-item highlight"><h4>Line Type</h4><p>${data.line_type}</p></div>
                </div>
        `;

            if (data.timezones && data.timezones.length > 0) {
                output += `<div class="threat-info-box"><h3>🌍 Timezones</h3><ul class="threat-list">`;
                data.timezones.forEach(tz => {
                    output += `<li><span class="threat-bullet" style="background:#00ffcc; box-shadow: 0 0 10px rgba(0,255,204,0.5);"></span>${tz}</li>`;
                });
                output += `</ul></div>`;
            }

            output += `</div>`;

            document.getElementById("phoneResult").innerHTML = output;
            localStorage.setItem('phoneResultHtml', output);
            localStorage.setItem('phoneData', JSON.stringify(data));

            updateDashboard();
        })
        .catch(error => {

            document.getElementById("phoneResult").innerHTML =
                `<p class="error">Phone intelligence failed</p>`;
        });
}


// ================= IP INTELLIGENCE =================

function checkIP() {

    let ip = document.getElementById("ip").value;

    document.getElementById("ipResult").innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Analyzing the data...</p>
        </div>
    `;

    fetch('/ip', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            ip: ip
        })

    })

        .then(response => response.json())

        .then(data => {

            ipData = data;

            let output = `
            <div class="result-card">
                <h2>🌐 IP Intelligence</h2>
                <div class="info-grid">
                    <div class="info-item"><h4>IP Address</h4><p>${data.ip}</p></div>
                    <div class="info-item highlight"><h4>Status</h4><p>${data.query_status}</p></div>
                    <div class="info-item"><h4>Country</h4><p>${data.country}</p></div>
                    <div class="info-item"><h4>City / Region</h4><p>${data.city}, ${data.region}</p></div>
                    <div class="info-item"><h4>ISP</h4><p>${data.isp}</p></div>
                    <div class="info-item"><h4>Organization</h4><p>${data.org}</p></div>
                </div>
                <div class="info-grid" style="margin-top: 0;">
                    <div class="info-item"><h4>Timezone</h4><p>${data.timezone}</p></div>
                    <div class="info-item"><h4>Coordinates</h4><p>${data.lat}, ${data.lon}</p></div>
                    <div class="info-item"><h4>ZIP</h4><p>${data.zip}</p></div>
                </div>
            </div>
        `;

            document.getElementById("ipResult").innerHTML = output;
            localStorage.setItem('ipResultHtml', output);
            localStorage.setItem('ipData', JSON.stringify(data));
            updateDashboard();
        })

        .catch(error => {

            document.getElementById("ipResult").innerHTML =
                `<p class="error">IP intelligence failed</p>`;
        });
}


// ================= WHOIS LOOKUP =================

function checkWhois() {

    let domain = document.getElementById("domain").value;

    document.getElementById("whoisResult").innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Analyzing the data...</p>
        </div>
    `;

    fetch('/whois', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            domain: domain
        })

    })

        .then(response => response.json())

        .then(data => {

            whoisData = data;

            let output = `
            <div class="result-card">
                <h2>🌍 WHOIS Intelligence</h2>
                <div class="info-grid">
                    <div class="info-item"><h4>Domain</h4><p>${data.domain}</p></div>
                    <div class="info-item highlight"><h4>Status</h4><p>${data.status}</p></div>
                    <div class="info-item"><h4>Registrar</h4><p>${data.registrar}</p></div>
                    <div class="info-item"><h4>Creation Date</h4><p>${data.creation_date}</p></div>
                    <div class="info-item"><h4>Expiration Date</h4><p>${data.expiration_date}</p></div>
                </div>
                <div class="threat-info-box">
                    <h3>🖥️ Name Servers</h3>
                    <p style="color: #d1d5db; word-break: break-all; font-family: monospace;">${data.name_servers}</p>
                </div>
            </div>
        `;

            document.getElementById("whoisResult").innerHTML = output;
            localStorage.setItem('whoisResultHtml', output);
            localStorage.setItem('whoisData', JSON.stringify(data));
            updateDashboard();
        })

        .catch(error => {

            document.getElementById("whoisResult").innerHTML =
                `<p class="error">WHOIS lookup failed</p>`;
        });
}


// ================= THREAT ANALYSIS =================

function getRisk() {

    document.getElementById("riskResult").innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Analyzing the data...</p>
        </div>
    `;

    fetch('/risk', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            username_result: usernameData,

            email_status: emailData.status || ""

        })

    })

        .then(response => response.json())

        .then(data => {

            riskData = data;

            let maxScore = 5; // Max possible score based on app.py logic
            let percentage = (data.risk_score / maxScore) * 100;
            if (percentage > 100) percentage = 100;

            let levelClass = "level-low";
            if (data.risk_level === "HIGH") {
                levelClass = "level-high";
            } else if (data.risk_level === "MEDIUM") {
                levelClass = "level-moderate";
            }

            let threatsHtml = "";
            data.threats.forEach(threat => {
                threatsHtml += `<li><span class="threat-bullet"></span>${threat}</li>`;
            });

            let output = `
            <div class="result-card threat-card">
                <h2>Threat Analysis</h2>
                
                <div class="footprint-stats">
                    <div class="stat-box">
                        <h3>Risk Score</h3>
                        <span class="stat-number">${data.risk_score} / ${maxScore}</span>
                    </div>
                    <div class="stat-box">
                        <h3>Risk Level</h3>
                        <span class="stat-level ${levelClass}">${data.risk_level}</span>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${levelClass}" style="width: ${percentage}%"></div>
                    </div>
                    <p class="progress-text">${Math.round(percentage)}% Threat Exposure</p>
                </div>

                <div class="threat-info-box">
                    <h3>⚠️ Threat Indicators</h3>
                    <ul class="threat-list">
                        ${threatsHtml}
                    </ul>
                </div>

                <div class="threat-info-box">
                    <h3>🛡️ Recommendation</h3>
                    <p>${data.recommendation}</p>
                </div>

                <div class="threat-info-box ai-summary-box">
                    <h3>🤖 AI Summary</h3>
                    <p>${data.summary}</p>
                </div>
            </div>
        `;

            document.getElementById("riskResult").innerHTML = output;
            localStorage.setItem('riskResultHtml', output);
            localStorage.setItem('riskData', JSON.stringify(data));
            updateDashboard();
        })

        .catch(error => {

            document.getElementById("riskResult").innerHTML =
                `<p class="error">Threat analysis failed</p>`;
        });
}


// ================= DIGITAL FOOTPRINT =================

function getFootprint() {

    document.getElementById("footprintResult").innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Analyzing the data...</p>
        </div>
    `;

    fetch('/footprint', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            username_result: usernameData

        })

    })

        .then(response => response.json())

        .then(data => {

            footprintData = data;

            let percentage = (data.accounts_found / 5) * 100;
            let levelClass = "level-low";

            if (data.footprint_level === "Very High") {
                levelClass = "level-high";
            } else if (data.footprint_level === "Moderate") {
                levelClass = "level-moderate";
            }

            let output = `
            <div class="result-card footprint-card">
                <h2>Digital Footprint Analysis</h2>
                
                <div class="footprint-stats">
                    <div class="stat-box">
                        <h3>Accounts Found</h3>
                        <span class="stat-number">${data.accounts_found} / 5</span>
                    </div>
                    <div class="stat-box">
                        <h3>Exposure Level</h3>
                        <span class="stat-level ${levelClass}">${data.footprint_level}</span>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${levelClass}" style="width: ${percentage}%"></div>
                    </div>
                    <p class="progress-text">${percentage}% Exposure Risk</p>
                </div>
            </div>
        `;

            document.getElementById("footprintResult").innerHTML = output;
            localStorage.setItem('footprintResultHtml', output);
            localStorage.setItem('footprintData', JSON.stringify(data));
            updateDashboard();
        })

        .catch(error => {

            document.getElementById("footprintResult").innerHTML =
                `<p class="error">Footprint analysis failed</p>`;
        });
}


// ================= PDF REPORT =================

function downloadReport() {

    fetch('/report', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            username: JSON.stringify(usernameData),

            email: JSON.stringify(emailData),

            ip: JSON.stringify(ipData),

            whois: JSON.stringify(whoisData),

            risk: JSON.stringify(riskData),

            footprint: JSON.stringify(footprintData),

            phone: JSON.stringify(phoneData)

        })

    })

        .then(response => response.blob())

        .then(blob => {

            let url = window.URL.createObjectURL(blob);

            let a = document.createElement('a');

            a.href = url;

            a.download = "intelx_report.pdf";

            document.body.appendChild(a);

            a.click();

            a.remove();
        })

        .catch(error => {

            alert("PDF generation failed");
        });
}


// ================= MATRIX EFFECT =================

const canvas = document.getElementById("matrix");

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters =
    "01INTELXCYBEROSINTHACKERSECURITY";

const matrix = letters.split("");

const fontSize = 14;

const columns = canvas.width / fontSize;

const drops = [];

for (let x = 0; x < columns; x++) {

    drops[x] = 1;
}

function drawMatrix() {

    ctx.fillStyle = "rgba(5,7,13,0.08)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "#00ffcc";

    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {

        const text =
            matrix[Math.floor(Math.random() * matrix.length)];

        ctx.fillText(
            text,
            i * fontSize,
            drops[i] * fontSize
        );

        if (
            drops[i] * fontSize > canvas.height &&
            Math.random() > 0.975
        ) {

            drops[i] = 0;
        }

        drops[i]++;
    }
}

setInterval(drawMatrix, 35);


// ================= RESPONSIVE MATRIX =================

window.addEventListener('resize', () => {

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;
});


// ================= DEFAULT SECTION =================

window.onload = function () {

    if (localStorage.getItem('usernameData')) usernameData = JSON.parse(localStorage.getItem('usernameData'));
    if (localStorage.getItem('emailData')) emailData = JSON.parse(localStorage.getItem('emailData'));
    if (localStorage.getItem('ipData')) ipData = JSON.parse(localStorage.getItem('ipData'));
    if (localStorage.getItem('whoisData')) whoisData = JSON.parse(localStorage.getItem('whoisData'));
    if (localStorage.getItem('riskData')) riskData = JSON.parse(localStorage.getItem('riskData'));
    if (localStorage.getItem('footprintData')) footprintData = JSON.parse(localStorage.getItem('footprintData'));
    if (localStorage.getItem('phoneData')) phoneData = JSON.parse(localStorage.getItem('phoneData'));

    if (localStorage.getItem('userResultHtml')) document.getElementById('userResult').innerHTML = localStorage.getItem('userResultHtml');
    if (localStorage.getItem('emailResultHtml')) document.getElementById('emailResult').innerHTML = localStorage.getItem('emailResultHtml');
    if (localStorage.getItem('ipResultHtml')) document.getElementById('ipResult').innerHTML = localStorage.getItem('ipResultHtml');
    if (localStorage.getItem('whoisResultHtml')) document.getElementById('whoisResult').innerHTML = localStorage.getItem('whoisResultHtml');
    if (localStorage.getItem('riskResultHtml')) document.getElementById('riskResult').innerHTML = localStorage.getItem('riskResultHtml');
    if (localStorage.getItem('footprintResultHtml')) document.getElementById('footprintResult').innerHTML = localStorage.getItem('footprintResultHtml');
    if (localStorage.getItem('phoneResultHtml')) document.getElementById('phoneResult').innerHTML = localStorage.getItem('phoneResultHtml');

    updateDashboard();
    showSection('data');
};

