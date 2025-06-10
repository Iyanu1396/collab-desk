# Tech Decision Log - CollabDeck

This document captures the key technical decisions made during the development of CollabDeck.

## Decision 1: TanStack Query for Caching and Session Management

**Status:** Accepted  
**Context:** We were experiencing session updating issues and needed better client-side caching.

**Decision:** Added TanStack Query to handle caching and fix session updating issues.

**Alternatives Considered:**

- Redux/Zustand for state management
- SWR for data fetching
- Custom caching solution

**Rationale:**

- Fixed session updating issues we were experiencing
- Provides automatic cache invalidation and background refetching
- Reduced complexity compared to full state management libraries
- Built-in error handling and retry logic

---

## Decision 2: No External State Management Library

**Status:** Accepted  
**Context:** Application needed local state management for UI components and forms.

**Decision:** Use React's built-in state management (useState, useContext) instead of external libraries like Redux or Zustand.

**Alternatives Considered:**

- Redux Toolkit for global state
- Zustand for lightweight state management
- Jotai for atomic state

**Rationale:**

- React's built-in state management is sufficient for our needs
- Keeps the application simple and lightweight
- Team already familiar with React patterns
- TanStack Query handles server state, React handles UI state

---

## Decision 3: Session-Based Messaging (No Database Persistence)

**Status:** Accepted  
**Context:** Collaborative editing needed a quick chat feature for real-time communication.

**Decision:** Store chat messages only in session/memory using Supabase real-time channels, without database persistence.

**Alternatives Considered:**

- Store messages in database with dedicated messages table
- Add messages to playbook records
- Use external chat service

**Rationale:**

- Messages are meant for quick, temporary communication during active sessions
- Simpler implementation without database complexity
- Reduces storage costs and database load
- Real-time focus using Supabase channels
- Messages don't need to persist beyond collaboration session

---

## Summary

| Decision                     | Impact                                          |
| ---------------------------- | ----------------------------------------------- |
| TanStack Query for caching   | Solved session issues, improved data management |
| No external state management | Kept complexity low, maintained simplicity      |
| Session-based messaging      | Simple real-time chat without persistence       |
