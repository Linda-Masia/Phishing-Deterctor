# 🛡️ Phishing Detection Web Application

This project is a full-stack web application designed to detect and explain phishing attempts in email content. It integrates a powerful **natural language processing (NLP)** model with a responsive and secure **frontend interface**, making it a practical tool for users to identify suspicious messages before interacting with them.

---

## 🎯 Project Goal

To provide users with a simple and intelligent platform that can detect phishing content in real time, explain why the content is suspicious, and help users make safer decisions when reading or handling emails.

---

## 🧱 Architecture Overview

- **Frontend**: Built with **React / Next.js**, offering a clean and interactive UI where users can paste or type email content and receive results instantly.  
- **Backend**: Developed using **FastAPI**, serving a RESTful API that leverages a pre-trained transformer model to analyze and classify the text as either **Phishing** or **Legitimate**.  
- **AI Model**: Uses Hugging Face’s `pipeline` to perform text classification, and custom logic to highlight risky phrases in the email content.

---

## 🔐 Security Measures

### Backend

- ✅ **Rate Limiting**: Limits requests to prevent abuse and brute-force attacks using `slowapi`.  
- ✅ **CORS Policies**: Only allows trusted origins to interact with the API.  
- ✅ **Security Headers**: Custom middleware sets strict HTTP headers (`X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`) to prevent clickjacking, XSS, and other web-based attacks.  
- ✅ **Exception Handling**: Gracefully manages failed predictions and rate-limit violations.  

### Frontend

- ✅ **Input Sanitization**: Prevents code injection or malicious input from affecting the system.  
- ✅ **Rate-limit Aware**: Provides user feedback when usage limits are exceeded.  
- ✅ **HTTPS Enforced**: Designed to work securely over HTTPS in production.  
- ✅ **Frontend CORS Enforcement**: Only communicates with the backend via secure, defined endpoints.  

---

## ⚙️ Features

- 🔍 **Paste or type any email message**  
- 🧠 **Real-time classification**: Displays whether an email is phishing or legitimate  
- 🎨 **Explanation & highlighting**: Suspicious words or phrases are visually marked to improve user understanding  
- 📊 **Confidence score**: Users are shown how confident the system is in its decision  
- 📋 **Clean and responsive UI**: Works across devices with a sleek interface  

---

## 🛠 Tech Stack

| Layer      | Technology                             |
|------------|-----------------------------------------|
| Frontend   | React / Next.js, Tailwind CSS           |
| Backend    | FastAPI, Pydantic, Uvicorn              |
| AI Model   | Hugging Face Transformers (`pipeline`)  |
| Security   | slowapi, Starlette Middleware           |
| Deployment | Ready for Docker / Vercel / Render      |
