# CredVerse Backend API

Backend API service for the CredVerse identity verification and trust scoring platform.

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Queue**: Celery
- **Email**: Mailhog (development)

## Setup

### Prerequisites

- Python 3.11 or higher
- Poetry (optional) or pip
- Docker and Docker Compose (for local services)

### Installation

#### Using Poetry
```bash
cd backend-api
poetry install
```

#### Using pip
```bash
cd backend-api
pip install -r requirements.txt
```

### Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://credverse:credverse@localhost:5432/credverse` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `JWT_SECRET_KEY` | Secret for JWT signing | (required in production) |
| `OTP_MOCK` | Enable mock OTP (always 123456) | `true` |
| `S3_ENDPOINT_URL` | MinIO/S3 endpoint | `http://localhost:9000` |

## Running

### Start Local Services

Start PostgreSQL, Redis, MinIO, and Mailhog:
```bash
docker-compose -f docker-compose.dev.yaml up -d postgres redis minio mailhog
```

### Run API Server

```bash
# Using uvicorn directly
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m src.main
```

API will be available at: http://localhost:8000

### Run Celery Worker

```bash
celery -A src.workers.tasks worker -l info
```

### Run All Services with Docker

```bash
docker-compose -f docker-compose.dev.yaml up
```

## API Endpoints

### Health
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Authentication
- `POST /auth/email/otp` - Send email OTP
- `POST /auth/email/verify` - Verify email OTP
- `POST /auth/phone/otp` - Send phone OTP
- `POST /auth/phone/verify` - Verify phone OTP
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/pin` - Set/verify PIN
- `GET /me` - Get current user

### Verification
- `POST /verification/sessions` - Create verification session
- `GET /verification/sessions/{id}` - Get session status
- `POST /verification/sessions/{id}/liveness` - Submit liveness check
- `POST /verification/sessions/{id}/document` - Submit document
- `POST /verification/sessions/{id}/digilocker` - Connect DigiLocker
- `POST /verification/sessions/{id}/submit` - Submit for review

### Trust Score
- `GET /trust-score` - Get trust score with breakdown

### Credentials
- `GET /credentials` - List credentials
- `GET /credentials/{id}` - Get credential details
- `POST /credentials/{id}/share` - Generate share token (5-min TTL)
- `POST /credentials/{id}/revoke` - Revoke credential

### Connections
- `GET /connections` - List active connections
- `GET /connections/pending` - List pending requests
- `POST /connections/{id}/approve` - Approve connection
- `POST /connections/{id}/deny` - Deny connection
- `POST /connections/webhooks` - Webhook receiver

### Notifications
- `GET /notifications` - List notifications
- `POST /notifications/{id}/read` - Mark as read

## Testing

Run tests with pytest:
```bash
pytest

# With coverage
pytest --cov=src

# Specific test file
pytest tests/test_auth.py
```

## Linting

Using ruff:
```bash
ruff check src/
ruff format src/
```

## API Documentation

When the server is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Mock Mode

When `OTP_MOCK=true`:
- All OTP codes are `123456`
- Email and SMS are logged to console
- No external service calls

## Trust Score Algorithm

Weighted scoring:
- **Identity (40%)**: Liveness check, document verification, biometric match
- **Activity (30%)**: Verification count, platform connections, credential count
- **Reputation (30%)**: No suspicious activity, endorsements, feedback

Score labels:
- 90+: Outstanding
- 75-89: Excellent
- 60-74: Good
- 40-59: Fair
- 0-39: Poor

## Credential Sharing

- Share tokens are stored in Redis with 5-minute TTL
- QR payload format: `credverse://share/{credential_id}/{share_id}`
- Revocation immediately deletes the share token

## License

UNLICENSED - CredVerse Inc.
