
from flask import Flask, render_template, request, jsonify, send_file, redirect, session
import requests
import dns.resolver
import whois
import sqlite3
from datetime import datetime

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__)
app.secret_key = "intelx_secret_key"


# ================= DATABASE =================

def init_db():

    conn = sqlite3.connect('users.db')
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')

    conn.commit()
    conn.close()

init_db()


# ================= LOGIN =================

@app.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'POST':

        username = request.form['username']
        password = request.form['password']

        conn = sqlite3.connect('users.db')
        cur = conn.cursor()

        cur.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, password)
        )

        user = cur.fetchone()

        conn.close()

        if user:

            session['user'] = username

            return redirect('/')

        else:

            return "Invalid Username or Password"

    return render_template('login.html')


# ================= REGISTER =================

@app.route('/register', methods=['GET', 'POST'])
def register():

    if request.method == 'POST':

        username = request.form['username']
        password = request.form['password']

        try:

            conn = sqlite3.connect('users.db')
            cur = conn.cursor()

            cur.execute(
                "INSERT INTO users(username,password) VALUES (?,?)",
                (username, password)
            )

            conn.commit()
            conn.close()

            return redirect('/login')

        except:

            return "User already exists"

    return render_template('register.html')


# ================= LOGOUT =================

@app.route('/logout')
def logout():

    session.pop('user', None)

    return redirect('/login')


# ================= HOME =================

@app.route('/')
def home():

    if 'user' not in session:

        return redirect('/login')

    return render_template('index.html')


# ================= USERNAME SEARCH =================

SITES = {

    "GitHub": "https://github.com/{}",

    "Instagram": "https://www.instagram.com/{}/",

    "Reddit": "https://www.reddit.com/user/{}/",

    "Pinterest": "https://www.pinterest.com/{}/",

    "TikTok": "https://www.tiktok.com/@{}"
}


@app.route('/search', methods=['POST'])
def search():

    username = request.json.get('username')

    results = {}

    for site, url in SITES.items():

        try:

            response = requests.get(
                url.format(username),
                timeout=5
            )

            if response.status_code == 200:

                results[site] = {

                    "status": "Found",

                    "profile": url.format(username)
                }

            else:

                results[site] = {

                    "status": "Not Found"
                }

        except:

            results[site] = {

                "status": "Error"
            }

    return jsonify(results)


# ================= EMAIL INTELLIGENCE =================

@app.route('/email', methods=['POST'])
def email_lookup():

    email = request.json.get('email')

    try:

        domain = email.split('@')[1]

        mx_records = dns.resolver.resolve(domain, 'MX')

        mx_list = []

        for mx in mx_records:

            mx_list.append(str(mx.exchange))

        return jsonify({

            "email": email,

            "domain": domain,

            "mx_records": mx_list,

            "status": "Valid Domain"
        })

    except:

        return jsonify({

            "email": email,

            "status": "Invalid Domain"
        })


# ================= IP INTELLIGENCE =================

@app.route('/ip', methods=['POST'])
def ip_lookup():

    ip = request.json.get('ip')

    try:

        response = requests.get(
            f"http://ip-api.com/json/{ip}",
            timeout=5
        )

        data = response.json()

        if data.get("status") == "success":

            return jsonify({

                "ip": ip,

                "country": data.get("country", "Unknown"),

                "city": data.get("city", "Unknown"),

                "region": data.get("regionName", "Unknown"),

                "isp": data.get("isp", "Unknown"),

                "org": data.get("org", "Unknown"),

                "timezone": data.get("timezone", "Unknown"),

                "lat": data.get("lat", "Unknown"),

                "lon": data.get("lon", "Unknown"),

                "zip": data.get("zip", "Unknown"),

                "query_status": "Success"
            })

        else:

            return jsonify({

                "ip": ip,

                "country": "Private or Invalid IP",

                "city": "N/A",

                "region": "N/A",

                "isp": "N/A",

                "org": "N/A",

                "timezone": "N/A",

                "lat": "N/A",

                "lon": "N/A",

                "zip": "N/A",

                "query_status": "Failed"
            })

    except Exception as e:

        return jsonify({

            "status": "API Error",

            "error": str(e)
        })


# ================= WHOIS LOOKUP =================

@app.route('/whois', methods=['POST'])
def whois_lookup():

    domain = request.json.get('domain')

    try:

        data = whois.whois(domain)

        creation_date = data.creation_date
        expiration_date = data.expiration_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        if creation_date:
            creation_date = creation_date.strftime("%d-%m-%Y")

        if expiration_date:
            expiration_date = expiration_date.strftime("%d-%m-%Y")

        return jsonify({

            "domain": domain,

            "registrar": str(data.registrar),

            "creation_date": creation_date,

            "expiration_date": expiration_date,

            "name_servers": str(data.name_servers),

            "status": "Success"
        })

    except Exception as e:

        return jsonify({

            "domain": domain,

            "status": "WHOIS Lookup Failed",

            "error": str(e)
        })


# ================= THREAT ANALYSIS =================

@app.route('/risk', methods=['POST'])
def risk_analysis():

    data = request.json

    username_result = data.get('username_result', {})
    email_status = data.get('email_status', "")

    found_accounts = 0

    for value in username_result.values():

        if isinstance(value, dict):

            if value.get("status") == "Found":

                found_accounts += 1

    score = 0

    threats = []

    # USERNAME ANALYSIS

    if found_accounts >= 3:

        score += 3

        threats.append(
            "Username found on multiple public platforms"
        )

    elif found_accounts == 2:

        score += 2

        threats.append(
            "Moderate public exposure detected"
        )

    elif found_accounts == 1:

        score += 1

        threats.append(
            "Limited online presence detected"
        )

    else:

        threats.append(
            "No major username exposure detected"
        )

    # EMAIL ANALYSIS

    if "Valid" in email_status:

        score += 2

        threats.append(
            "Email domain appears active and reachable"
        )

    else:

        threats.append(
            "Email validation failed"
        )

    # RISK LEVEL

    if score >= 5:

        level = "HIGH"

    elif score >= 3:

        level = "MEDIUM"

    else:

        level = "LOW"

    # RECOMMENDATION

    if level == "HIGH":

        recommendation = (
            "Enable 2FA and reduce public exposure."
        )

    elif level == "MEDIUM":

        recommendation = (
            "Monitor exposed accounts and improve privacy."
        )

    else:

        recommendation = (
            "Minimal risk detected."
        )

    # AI STYLE SUMMARY

    summary = (
        f"Target has {level.lower()} cybersecurity exposure "
        f"with {found_accounts} discovered public accounts."
    )

    return jsonify({

        "risk_level": level,

        "risk_score": score,

        "threats": threats,

        "recommendation": recommendation,

        "summary": summary
    })


# ================= DIGITAL FOOTPRINT =================

@app.route('/footprint', methods=['POST'])
def footprint():

    data = request.json

    username_result = data.get('username_result', {})

    found_accounts = 0

    for value in username_result.values():

        if isinstance(value, dict):

            if value.get("status") == "Found":

                found_accounts += 1

    if found_accounts >= 4:

        level = "Very High"

    elif found_accounts >= 2:

        level = "Moderate"

    else:

        level = "Low"

    return jsonify({

        "accounts_found": found_accounts,

        "footprint_level": level
    })


# ================= PDF REPORT =================

@app.route('/report', methods=['POST'])
def report():

    data = request.json

    file_path = "intelx_report.pdf"

    doc = SimpleDocTemplate(file_path)

    styles = getSampleStyleSheet()

    elements = []

    elements.append(

        Paragraph(
            "IntelX OSINT Intelligence Report",
            styles['Title']
        )
    )

    elements.append(Spacer(1, 20))

    current_time = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    elements.append(

        Paragraph(
            f"<b>Generated:</b> {current_time}",
            styles['BodyText']
        )
    )

    elements.append(Spacer(1, 20))

    for key, value in data.items():

        elements.append(

            Paragraph(
                f"<b>{key}</b>: {value}",
                styles['BodyText']
            )
        )

        elements.append(Spacer(1, 10))

    doc.build(elements)

    return send_file(
        file_path,
        as_attachment=True
    )


# ================= MAIN =================
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
