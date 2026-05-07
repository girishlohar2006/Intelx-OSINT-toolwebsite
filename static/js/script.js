// ================= GLOBAL STORAGE =================

let usernameData = {};
let emailData = {};
let ipData = {};
let whoisData = {};
let riskData = {};
let footprintData = {};


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

        let output = "";

        for (let site in data) {

            output += `
                <div class="result-card">

                    <h3>${site}</h3>

                    <p>
                        <b>Status:</b>
                        ${data[site].status}
                    </p>
            `;

            if (data[site].profile) {

                output += `
                    <a href="${data[site].profile}"
                       target="_blank">

                       Visit Profile

                    </a>
                `;
            }

            output += `</div>`;
        }

        document.getElementById("userResult").innerHTML =
            output;

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

                <h2>Email Intelligence</h2>

                <p><b>Email:</b> ${data.email}</p>

                <p><b>Domain:</b> ${data.domain || "N/A"}</p>

                <p><b>Status:</b> ${data.status}</p>
        `;

        if (data.mx_records) {

            output += `<h3>MX Records</h3><ul>`;

            data.mx_records.forEach(mx => {

                output += `<li>${mx}</li>`;
            });

            output += `</ul>`;
        }

        output += `</div>`;

        document.getElementById("emailResult").innerHTML =
            output;

        updateDashboard();
    })

    .catch(error => {

        document.getElementById("emailResult").innerHTML =
            `<p class="error">Email intelligence failed</p>`;
    });
}


// ================= IP INTELLIGENCE =================

function checkIP() {

    let ip = document.getElementById("ip").value;

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

                <h2>IP Intelligence</h2>

                <p><b>IP:</b> ${data.ip}</p>

                <p><b>Country:</b> ${data.country}</p>

                <p><b>City:</b> ${data.city}</p>

                <p><b>Region:</b> ${data.region}</p>

                <p><b>ISP:</b> ${data.isp}</p>

                <p><b>Organization:</b> ${data.org}</p>

                <p><b>Timezone:</b> ${data.timezone}</p>

                <p><b>Latitude:</b> ${data.lat}</p>

                <p><b>Longitude:</b> ${data.lon}</p>

                <p><b>ZIP:</b> ${data.zip}</p>

                <p><b>Status:</b> ${data.query_status}</p>

            </div>
        `;

        document.getElementById("ipResult").innerHTML =
            output;

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

                <h2>WHOIS Intelligence</h2>

                <p><b>Domain:</b> ${data.domain}</p>

                <p><b>Registrar:</b> ${data.registrar}</p>

                <p><b>Creation Date:</b>
                    ${data.creation_date}
                </p>

                <p><b>Expiration Date:</b>
                    ${data.expiration_date}
                </p>

                <p><b>Name Servers:</b>
                    ${data.name_servers}
                </p>

                <p><b>Status:</b>
                    ${data.status}
                </p>

            </div>
        `;

        document.getElementById("whoisResult").innerHTML =
            output;

        updateDashboard();
    })

    .catch(error => {

        document.getElementById("whoisResult").innerHTML =
            `<p class="error">WHOIS lookup failed</p>`;
    });
}


// ================= THREAT ANALYSIS =================

function getRisk() {

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

        let output = `
            <div class="result-card">

                <h2>Threat Analysis</h2>

                <p><b>Risk Level:</b>
                    ${data.risk_level}
                </p>

                <p><b>Risk Score:</b>
                    ${data.risk_score}
                </p>

                <h3>Threat Indicators</h3>

                <ul>
        `;

        data.threats.forEach(threat => {

            output += `<li>${threat}</li>`;
        });

        output += `
                </ul>

                <h3>Recommendation</h3>

                <p>${data.recommendation}</p>

                <h3>AI Summary</h3>

                <p>${data.summary}</p>

            </div>
        `;

        document.getElementById("riskResult").innerHTML =
            output;

        updateDashboard();
    })

    .catch(error => {

        document.getElementById("riskResult").innerHTML =
            `<p class="error">Threat analysis failed</p>`;
    });
}


// ================= DIGITAL FOOTPRINT =================

function getFootprint() {

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

        let output = `
            <div class="result-card">

                <h2>Digital Footprint Analysis</h2>

                <p><b>Accounts Found:</b>
                    ${data.accounts_found}
                </p>

                <p><b>Footprint Level:</b>
                    ${data.footprint_level}
                </p>

            </div>
        `;

        document.getElementById("footprintResult").innerHTML =
            output;

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

            footprint: JSON.stringify(footprintData)

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

    showSection('data');
};
