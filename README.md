# Nivasa – Roommate Compatibility AI

Nivasa is an AI-driven platform that helps users find compatible roommates based on lifestyle preferences, habits, and personality traits. Users complete a survey, review their profile, and receive roommate match suggestions.

---

## Features

- **Interactive Survey:** Users answer questions about lifestyle, habits, and preferences via a chat-like interface.
- **Profile Review:** Users can review and edit their profile before generating matches.
- **Roommate Matching:** ML model predicts compatibility scores for potential roommates.
- **Admin Panel:** Allows admins to manage users and view predictions.
- **Firebase Integration:** Stores user profiles, survey responses, and predictions in Firestore.
- **Authentication:** Email/password authentication using Firebase Auth.

---

## Tech Stack

- **Frontend:** React + TypeScript  
- **Backend:** FastAPI + Python  
- **Database:** Firebase Firestore  
- **Machine Learning:** Scikit-learn (ML model trained separately)

---

## Team

- **ML Model:** Priti  
- **Frontend & Backend:** Richa & Mudita  

---

## Installation

### Backend

1. Clone the repo:

```bash
git clone <repo-url>
cd roommate-ai-backend
````

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Add Firebase credentials:

Place your Firebase service account key as `firebase_key.json` in the project root.

4. Run the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. Navigate to frontend directory:

```bash
cd roommate-ai-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

4. Open in browser: `http://localhost:5173`

---

## API Endpoints

### Authentication

* `POST /signup` – Sign up a new user
* `POST /login` – Login existing user
* `GET /check-admin` – Check if user is admin

### Survey & Profile

* `POST /survey-response` – Save survey responses
* `GET /user-profile?uid=<user-id>` – Get user profile
* `POST /update-profile` – Update profile info

### Matching & Predictions

* `POST /predict` – Predict compatibility score
* `GET /matches` – Fetch all predictions

---

## Notes

* Firebase Admin SDK is initialized only once to prevent `default app already exists` errors.
* All user survey responses are stored in a **single Firestore document per user** for easier access and ML integration.

---

## Contributing

Feel free to open issues or pull requests for improvements.

---

## License

This project is licensed under MIT License.

```

