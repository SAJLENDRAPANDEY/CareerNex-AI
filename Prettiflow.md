TYPE READY
CONTEXT
SUMMARY: AI-powered career guidance platform with chatbot, resume analysis, skill gap detection, roadmap generation, and admin panel
GOAL: Create a full-featured career guidance platform with modern dark UI and authentication
TECH
FRONTEND: React
BACKEND: FastAPI
DATABASE_REQUIRED: true
FEATURES
- AI chatbot for career guidance
- Resume analyzer
- Skill gap analysis
- Personalized roadmap generator
- Dashboard for tracking progress
- Modern dark UI
- Authentication system
- PostgreSQL database
- Admin panel
TODOS
[1] TITLE: Build main dashboard with authentication and dark UI
    DESC: Create the main dashboard in /workspace/frontend/src/App.js. Implement dark mode using Tailwind CSS. Add authentication system with login and registration pages. Ensure the layout includes navigation to other features.
    DEPS: []
[2] TITLE: Implement AI chatbot for career guidance
    DESC: Integrate an AI chatbot in /workspace/frontend/src/components/Chatbot.js. Use a pre-trained model or API (e.g., Hugging Face) for career-related queries. Connect it to the FastAPI backend for handling user interactions.
    DEPS: [1]
[3] TITLE: Develop resume analyzer feature
    DESC: Create a resume analyzer in /workspace/frontend/src/components/ResumeAnalyzer.js. Allow users to upload resumes and get feedback. Connect to FastAPI endpoint for processing and analysis.
    DEPS: [1]
[4] TITLE: Add skill gap analysis functionality
    DESC: Implement skill gap analysis in /workspace/frontend/src/components/SkillGapAnalysis.js. Allow users to input their skills and compare them against desired careers. Connect to FastAPI for data processing.
    DEPS: [1]
[5] TITLE: Create personalized roadmap generator
    DESC: Build a roadmap generator in /workspace/frontend/src/components/RoadmapGenerator.js. Allow users to select a career path and generate a step-by-step learning plan. Connect to FastAPI for generating roadmaps.
    DEPS: [1]
[6] TITLE: Set up PostgreSQL database and admin panel
    DESC: Configure PostgreSQL database in /workspace/backend/database.py. Create admin panel in /workspace/backend/admin.py for managing users, resumes, and career data. Implement CRUD operations for admin use.
    DEPS: []