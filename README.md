# 🌉 Samadhan Setu (AI-Powered Grievance Redressal)

#

Bridging the gap between Citizens and Administration using Artificial Intelligence.

Samadhan Setu is a smart governance platform designed for the Uttarakhand Administration. It eliminates the friction of manual complaint routing by using Large Language Models (LLMs) to automatically classify, prioritize, and route citizen grievances to the exact department (e.g., PWD, Jal Sansthan, UPCL) and sub-department.

## 🚀 Key Features

#

- 🤖 AI-Powered Routing: No need for citizens to select categories. Just type "My road is broken," and the AI routes it to PWD > Road Maintenance.
- 🔐 RBAC Hierarchy: Strict Role-Based Access Control for Citizens, Sub-Dept Heads (L3), Dept Heads (L2), and the Chief Minister (L1).
- 📊 Real-time Analytics: Interactive dashboards for officials to monitor resolution rates, critical issues, and department performance.
- 📱 Zero-UI Friction: Minimalist interface designed for ease of use by citizens of all digital literacy levels.

## 📸 Screenshots & Workflow

### 1\. Authentication

#

Secure access points for Citizens and Officials.

![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/1.png)
![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/2.png)

### 2\. Chief Minister's Control Room (L1)

#

High-level oversight of the entire state's governance performance.

![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/3.png)
![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/4.png)

### 3\. Department Head Dashboard (L2)

#

Focused view for heads of specific departments (e.g., Head of PWD).

![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/5.png)
![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/6.png)
![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/7.png)

### 4\. Citizen Panel (L3)

![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/8.png)

### 5\. Resolution Workflow (L3)

#

The ground-level action center where issues get resolved.

![](https://github.com/buildwithadi/samadhan-setu-frontend/blob/main/public/flow.png)

## 🛠️ Tech Stack

#

Frontend:

- Framework: React.js (Vite)
- Styling: Tailwind CSS (Professional "Clean Slate" Design)
- State Management: React Context API
- Visualization: Recharts (Data Analytics)
- Icons: Lucide React

Backend:

- Framework: NestJS (TypeScript)
- Database: MongoDB (Mongoose)
- AI Engine: OpenAI / DeepSeek API (for Text Classification)
- Security: JWT Authentication & Guard-based Authorization

## ⚙️ Installation & Setup

### Prerequisites

#

- Node.js (v18+)
- MongoDB Instance (Local or Atlas)

### 1\. Clone the Repository

#

git clone \[https://github.com/buildwithadi/samadhan-setu-frontend\](https://github.com/buildwithadi/samadhan-setu-frontend)  
cd samadhan-setu

### 2\. Backend Setup

#

cd backend  
npm install

\# Create .env file  
echo "MONGO_URI=mongodb://localhost:27017/samadhan" > .env  
echo "JWT_SECRET=your_secret_key" >> .env  
echo "OPENAI_API_KEY=your_ai_key" >> .env

\# Run Server  
npm run start:dev

### 3\. Frontend Setup

#

cd frontend  
npm install

\# Run Client  
npm run dev
