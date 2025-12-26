# Product Requirements Document (PRD)
## CredVerse Ecosystem (formerly Credity)

**Version:** 1.0  
**Status:** Active Development
**Date:** 2025-12-26

---

## 1. Executive Summary

**CredVerse** is a decentralized, blockchain-powered credentialing ecosystem designed to bridge the gap between traditional institutions (universities, employers) and the Web3 world. It aims to solve the problems of credential fraud, slow verification processes, and lack of user ownership over personal data. 

The ecosystem consists of four integrated pillars:
1.  **CredVerse Issuer**: For institutions to issue Verifiable Credentials (VCs).
2.  **CredVerse Recruiter**: For employers to instantly verify claims.
3.  **BlockWallet Digi**: A user-centric wallet for holding and sharing credentials.
4.  **CredVerse Gateway**: The public portal unifying the experience.

---

## 2. Problem Statement

-   **Fraud**: Physical degrees and simple PDFs are easily forged.
-   **Inefficiency**: Manual background checks take weeks and cost money.
-   **Data Silos**: Users do not own their achievements; they are locked in university databanks.
-   **Privacy**: Verification often requires sharing more data than necessary.

## 3. Solution Overview

CredVerse utilizes **DID (Decentralized Identifiers)** and **Verifiable Credentials (VCs)** anchored on-chain to provide:
-   **Tamper-proof Issuance**: Cryptographically signed credentials.
-   **Instant Verification**: Mathematical proof of validity in milliseconds.
-   **Self-Sovereign Identity (SSI)**: Users hold their credentials in a private wallet.

---

## 4. detailed Feature Requirements

### 4.1. CredVerse Issuer (The Institution)
*Target User: Universities, Training Centers, Certificate Authorities.*

-   **Dashboard**: Secure login for authorized staff.
-   **Student Management**: Ability to bulk upload student data (CSV/Excel).
-   **Credential Designer**: Visual editor to create custom certificate templates.
-   **Issuance Engine**: 
    -   Generate VCs based on W3C standards.
    -   Anchor issuance hashes to the blockchain (Polygon/Ethereum).
    -   Send notification emails to students with claim links.
-   **Analytics**: View total credentials issued, active claims, and revoked statuses.

### 4.2. BlockWallet Digi (The User)
*Target User: Students, Graduates, Job Seekers.*

-   **Onboarding**: Simple sign-up with optional biometrics (FaceID/TouchID).
-   **Credential Claiming**: 
    -   Deep-link support to claim credentials from email.
    -   QR code scanner for in-person claiming.
-   **Storage**: Encrypted local storage (generating/storing private keys on-device).
-   **AI Smart Assistant**:
    -   Analyze claimed credentials for skill extraction.
    -   Suggest potential job matches based on held credentials.
-   **Security**:
    -   Liveness detection for critical actions (claiming/sharing).
    -   **Trust Score**: Internal score based on activity and verification history.

### 4.3. CredVerse Recruiter (The Verifier)
*Target User: HR Managers, Recruiters.*

-   **Talent Dashboard**: Overview of candidate verifications.
-   **Instant Verify**: Drag-and-drop verification of VC files or QR code scanning.
-   **Link Verification**: Dedicated endpoint to verify "Share Links" sent by users.
-   **Bulk Processing**: Upload a batch of candidate claims for parallel verification.
-   **Fraud Detection**: Automated checks against:
    -   Revocation registries (is the cert still valid?).
    -   Issuer DID validity (is the issuer a trusted university?).
    -   Signature integrity (has the file been tampered with?).

### 4.4. CredVerse Gateway
*Target User: Public.*

-   **Landing Page**: Marketing overview of the ecosystem.
-   **Registry**: Public list of accredited Issuers (optional).
-   **Navigation**: Centralized routing to the other three applications.

---

## 5. Technical Architecture Requirements

### 5.1. Blockchain & Identity
-   **Standards**: W3C Verifiable Credentials (VC), Decentralized Identifiers (DID).
-   **Network**: Polygon (Testnet/Mainnet) for low-cost anchoring.
-   **Storage**: IPFS for off-chain metadata (optional), Local Storage for private keys.

### 5.2. Backend Services
-   **Runtime**: Node.js (v18+).
-   **Framework**: Express.js with TypeScript.
-   **Database**: PostgreSQL (relational data for users, organization profiles, logs).
-   **Security**: 
    -   `shared-auth` module for unified JWT handling.
    -   Standardized API response formats.

### 5.3. Frontend Applications
-   **Framework**: React (Vite) for fast performance.
-   **Styling**: Tailwind CSS (Dark mode default, glassmorphism aesthetics).
-   **Components**: Shared UI library for consistency.

### 5.4. Advanced Features (Phase 2)
-   **AI Integration**: OpenAI/LLM integration for "Evidence Analysis" in the Wallet.
-   **Biometrics**: Browser-based face detection (using `fake_face_detection` or specialized libs) to ensure liveness.

---

## 6. Non-Functional Requirements

-   **Performance**: Verification must complete in < 2 seconds.
-   **Security**: Private keys must **never** leave the user's device (Wallet). 
-   **Availability**: 99.9% uptime for the Verification API.
-   **Accessibility**: WCAG 2.1 compliant UI.

---

## 7. Future Roadmap

-   **Q1 2026**: Mobile App (React Native) for BlockWallet.
-   **Q2 2026**: Integration with LinkedIn for "Add to Profile".
-   **Q3 2026**: Zero-Knowledge Proof (ZKP) selective disclosure (e.g., prove "Over 18" without revealing birthdate).
