# IntelX – OSINT Intelligence Platform

A web-based OSINT tool built with Flask to analyze digital footprints using public data sources.

## 🔧 Features
- Username search across platforms
- Email MX (DNS) analysis
- IP lookup (geo + ISP)
- WHOIS lookup
- Risk scoring (LOW / MEDIUM / HIGH)
- Digital footprint score
- PDF report generation
- Login/Register system

## 🛠️ Tech Stack
- Python (Flask)
- HTML, CSS, JavaScript
- SQLite
- ReportLab (PDF)

## 📁 Project Structure

IntelX-OSINT/
├── app.py
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── register.html
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
├── users.db
├── requirements.txt

---

## 👤 Author

Girish Malviya

## 🚀 How to Run
```bash
git clone https://github.com/girishlohar2006/intelx-OSINT-web.git
cd Intelx-OSINT
python -m venv venv
source venv/bin/activate
window= venv\scripts\activate
pip install -r requirements.txt
python app.py
