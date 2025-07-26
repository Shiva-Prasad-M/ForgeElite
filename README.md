
# ⚡ ForgeElite

**ForgeElite** is an AI-powered career-building platform that empowers fresh graduates to enhance their employability. It offers resume analysis, AI interview simulations, proctored coding exams, job listings, and personalized feedback — all integrated into a single platform.

---

## 🧠 Powered by AI

This platform integrates a **Large Language Model (LLM)** to:
- Analyze resumes for job-readiness
- Simulate mock interviews with scoring
- Match resumes with job descriptions
- Act as a chatbot for career-related queries

---

## 🚀 Features

### 🎓 For Freshers
- 📄 Upload your resume and get instant keyword-based analysis
- 🤖 AI-powered mock interviews (LLM-driven)
- 💼 Job listings with skill-based filtering
- 🧪 One-time proctored coding test (weekly retry)
- 📊 Performance analytics by topic and domain
- 📺 YouTube course recommendations
- 💬 Chatbot for career Q&A

### 🏢 For Companies
- 📌 Post job openings
- 🔍 AI-based resume matching
- 📈 Candidate dashboard and shortlisting tools

---

## 🛠️ Tech Stack

| Layer        | Tech Used                     |
| ------------ | ----------------------------- |
| **Frontend** | React.js, HTML, CSS, JS       |
| **Backend**  | Python, Flask, Flask-CORS     |
| **Database** | MongoDB (with PyMongo)        |
| **AI/LLM**   | OpenAI / Gemini / DeepSeek APIs |
| **Proctoring & Testing** | Custom logic + webcam (planned) |
| **Emailing** | Brevo (SMTP for notifications) |

---

## 📂 Project Structure

ForgeElite/
├── client/ # React Frontend
│ ├── src/
│ ├── public/
│ └── .env
├── server/ # Flask Backend
│ ├── app.py
│ ├── routes/
│ ├── services/
│ ├── models/
│ └── .env
├── README.md
└── requirements.txt

🔒 Security Notes

.env files are excluded via .gitignore
Secrets and API keys should never be committed
Inputs sanitized server-side to prevent injection attacks

🧠 Future Enhancements

Google/LinkedIn OAuth login

Resume builder tool

Video-based mock interviews

Gamified learning paths

Admin panel for platform management

📧 Contact
Developer: M. Shiva Prasad
Email: medashivaprasad123@gmail.com
LinkedIn: linkedin.com/in/shiva-prasad-m
GitHub: github.com/Shiva-Prasad-M
