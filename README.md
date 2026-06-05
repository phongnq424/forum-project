
# Forum Platform – Feature Expansion and System Improvement v2

## Overview

Forum Platform is a full-stack programming discussion platform that integrates forum-based discussion, AI support, an automated judge system, and real-time communication features.

Version 2 is a personal upgrade phase developed from the original group project. Instead of focusing on a complete backend architecture refactor, this version focuses on expanding core features, improving the user experience, enhancing AI-assisted functions, redesigning the frontend, and strengthening the judge system.

The main goal of this version is to make the platform more practical for programming learning, discussion, code submission, and AI-supported error analysis.

---

## Project Evolution

| Version | Description |
|---|---|
| v1 – Group Project | Basic forum platform with discussion features, real-time chat, AI chatbot, and initial judge system |
| v2 – Personal Upgrade | Feature expansion, frontend redesign, improved AI functions, enhanced judge system, and better user learning support |

Version 2 continues from the previous project and improves the system by adding more complete learning-oriented and user-oriented features.

---

## Main Features

The platform includes the following major feature groups:

- Programming discussion through posts and comments
- AI-powered chatbot for Q&A and programming support
- AI-based content moderation for posts and comments
- Basic user personalization
- Automated judge system for programming submissions
- SQL judging with result comparison and transaction rollback
- Backend logic judging for Node.js-based tasks
- Docker-based sandbox mechanism for safer code execution
- Detailed submission result tracking
- Leaderboard and personal progress tracking
- Real-time chat features inherited from the previous version
- Fully redesigned frontend interface

---

## Core Modules

### 1. Forum and Discussion Module

The forum module allows users to create posts, write comments, interact with discussion content, and participate in programming-related conversations.

Main responsibilities:

- Post creation and management
- Comment and reply support
- User interaction features
- Topic-based discussion
- AI-assisted content moderation
- Real-time discussion and chat support

---

### 2. AI Content Moderation

The system applies AI to support automatic content moderation for user-generated content.

This feature is used to detect and filter inappropriate content such as:

- Spam posts
- Spam comments
- Toxic or harmful content
- Low-quality or irrelevant content
- Potentially unsafe discussion content

The purpose of this feature is to improve discussion quality and reduce the need for manual moderation.

---

### 3. Basic User Personalization

The platform supports basic personalization to improve the user experience.

Personalization may include:

- Recommending relevant discussion content
- Prioritizing content based on user interests
- Tracking user activity and learning progress
- Supporting a more personalized learning environment

This feature is currently implemented at a basic level and can be expanded in future versions.

---

### 4. Judge System

The Judge System is one of the main technical features of the platform. It supports automatic evaluation of different types of programming-related submissions.

Supported submission types include:

- Traditional algorithm problems
- SQL query problems
- Backend logic tasks using Node.js

The judge system is designed to automatically process submissions, evaluate results, and return detailed feedback to users.

Main responsibilities:

- Receiving user submissions
- Running submitted code or queries
- Comparing actual output with expected output
- Returning judge results
- Storing submission history
- Supporting leaderboard calculation
- Tracking user progress

---

### 5. Docker-based Sandbox Execution

To improve safety during code execution, the judge system uses Docker-based sandboxing to isolate the runtime environment.

The sandbox mechanism helps reduce security risks such as:

- Remote Code Execution (RCE)
- Unauthorized access to the host system
- Unsafe code execution
- SQL Injection in SQL judging scenarios

By running submissions inside isolated environments, the system can control execution more safely and limit the impact of malicious or incorrect code.

---

### 6. SQL Judging

For SQL problems, the system evaluates user-submitted queries by comparing the returned result with the expected result.

The SQL judging process includes:

- Running the submitted SQL query
- Comparing the query result with the expected output
- Detecting wrong answers or query errors
- Rolling back database changes after each judging attempt

The rollback mechanism is important because it prevents submitted SQL queries from permanently modifying the judging database.

---

### 7. AI Chatbot and Error Analysis

The AI chatbot is improved to provide better support for programming learning and debugging.

Main functions include:

- Answering programming-related questions
- Supporting users during problem solving
- Explaining common mistakes
- Analyzing submission errors
- Helping users understand wrong answers, compilation errors, runtime errors, and time limit exceeded cases

This feature aims to make the platform more useful as a learning assistant, not only a discussion forum.

---

### 8. Frontend Redesign

Version 2 includes a full frontend restructuring and redesign.

The frontend is improved to provide a cleaner, more consistent, and more user-friendly experience.

Main improvements include:

- Redesigning user interfaces
- Improving page layout and component structure
- Enhancing usability for discussion and submission flows
- Improving the display of judge results
- Improving leaderboard and progress tracking screens
- Making the platform easier to use for learners

---

### 9. User Learning Features

The platform provides several features to support the learning process of users.

Main user features include:

- Automatic code submission
- Detailed judge result display
- Status tracking for accepted, wrong answer, error, and time limit exceeded submissions
- Submission history
- Leaderboard tracking
- Personal progress tracking
- Real-time chat and discussion support

These features help users practice programming, review their mistakes, and follow their improvement over time.

---

## Technology Stack

### Backend

- Node.js
- Express.js
- RESTful API
- Redis
- BullMQ
- Socket.IO
- JWT-based authentication
- Docker-based sandbox execution

### Frontend

- Svelte
- SvelteKit
- Modular component architecture
- Server-side rendering
- Frontend state management
- Redesigned user interface

### Database

- PostgreSQL
- Relational database design
- Transaction handling for SQL judging
- Submission history storage
- User progress and leaderboard data management

### Background Processing

- BullMQ
- Redis-based queue processing
- Judge worker processing for code submissions

---

## Database Design Focus

This project is also developed in the context of an Advanced Database Systems seminar. Therefore, the system places emphasis on database design and data consistency, especially in the judge system and user progress tracking.

Main database-related focus areas include:

- Entity relationship modeling
- Relational schema design
- Submission history management
- Transaction handling for SQL judging
- Rollback mechanism after SQL execution
- Leaderboard data calculation
- User progress tracking
- Query performance considerations

---

## My Role

In version 2, I am responsible for upgrading and expanding the system from the original group project.

Main responsibilities:

- Redesigning and restructuring the frontend
- Improving AI chatbot behavior
- Implementing AI-based content moderation
- Enhancing the judge system
- Supporting algorithm, SQL, and Node.js backend judging
- Designing Docker-based sandbox execution
- Improving submission result display
- Implementing leaderboard and personal progress tracking
- Maintaining real-time chat features from the previous version
- Improving database handling for submissions and judging workflows

---

## Roadmap

Planned improvements include:

- Completing the frontend redesign
- Improving AI content moderation accuracy
- Enhancing chatbot error analysis
- Stabilizing the judge system
- Improving Docker sandbox safety
- Expanding SQL judging support
- Improving leaderboard and progress tracking
- Optimizing database queries for heavy operations
- Enhancing real-time discussion features
- Preparing the system for deployment and performance testing

---

## Project Status

The project is currently in progress. Version 2 focuses on feature expansion, AI-assisted learning support, frontend redesign, judge system improvement, Docker-based sandbox execution, and database-related enhancements for programming education scenarios.
```
