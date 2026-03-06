# Forum Platform – System Refactoring & Feature Expansion (v2)

## Overview

Forum Platform is a full-stack discussion system integrated with:

- AI-powered chatbot  
- Automated code judging system  
- Real-time discussion features  

Version 2 is an ongoing refactoring and feature expansion of the original group project.  
The goal of this upgrade is to improve architecture design, scalability, and system maintainability.

---

## Project Evolution

| Version | Description |
|----------|------------|
| v1 (Group Project) | Basic forum with judge system and AI integration |
| v2 (Personal Upgrade – In Progress) | Architecture refactoring and feature redesign |

Version 2 currently focuses on:

- Applying clean architecture principles  
- Improving service separation  
- Enhancing maintainability  
- Preparing for better scalability  

---

## System Architecture

### Core Modules

### 1️⃣ Forum Service
- Thread & discussion management  
- Post & comment system  
- Real-time chat (in development)  
- Video call integration (planned)  
- User authentication & role-based access  

### 2️⃣ Judge Worker Service
- Code submission processing  
- Queue-based execution handling  
- Result evaluation & storage  
- Isolated execution design (under refinement)  

### 3️⃣ AI Chatbot Module
- Context-aware conversation  
- Ongoing improvements to response logic  
- Prompt handling optimization  

---

## 🛠 Tech Stack

### Backend
- Node.js  
- Express  
- RESTful API
- Redis
- Socket.IO (real-time)
- Authentication
- Background worker design (refactoring phase)  

### Frontend
- Svelte
- SvelteKit
- Modular component architecture
- Server-side rendering (SSR)
- State management optimization

### Message Broker
- BullMQ

### Database
- PostgreSQL
- Relational database system  
- Schema normalization (partially applied)  
- Index optimization (planned improvements)  
- Transaction handling for submissions  

---

## Current Improvements (In Progress)

### Backend Refactoring
- Restructuring folder architecture  
- Moving toward service-layer pattern  
- Improving validation & error handling  

### Judge Worker Redesign
- Decoupling execution logic from main server  
- Designing queue-based submission workflow  
- Improving concurrency handling (research phase)  

### AI Logic Enhancement
- Refining response flow  
- Improving context tracking strategy  

### Database Optimization
- Reviewing relational schema  
- Reducing redundant queries  
- Planning index tuning for heavy operations  

---

## Database Design Focus (Advanced DB)

This project emphasizes:

- Entity relationship modeling  
- Transaction-safe submission flow  
- Concurrency considerations  
- Performance-aware query design  

---

## Academic Context

Developed as part of:

**Advanced Database Systems Seminar**

Focus areas:

- System refactoring  
- Service-based architecture  
- Database performance considerations  
- Concurrency & job scheduling concepts  

---

## My Role

Full-stack Developer (Personal Upgrade Phase)

- Refactoring system architecture  
- Redesigning judge-worker workflow  
- Improving AI integration logic  
- Enhancing database structure  

---

## Roadmap

- Complete service-layer refactor  
- Stabilize judge-worker execution pipeline  
- Improve AI context handling  
- Introduce Docker environment  
- Performance benchmarking  

---

## Status

🚧 In Progress – Active refactoring and architectural improvement.
