# Sentinel Security Journal

## 2025-02-19 - Timing Attack on Login
**Vulnerability:** Username enumeration via timing difference in `/auth/login` endpoint.
**Learning:** `bcrypt.compare` is computationally expensive (~100-300ms). When a user was not found, the endpoint returned immediately (~2ms), allowing an attacker to distinguish between valid and invalid usernames.
**Prevention:** Always perform a hash comparison, even if the user is not found. Use a pre-calculated dummy hash (`getDummyHash()`) to simulate the workload when no user exists.
