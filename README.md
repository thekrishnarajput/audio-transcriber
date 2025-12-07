# VoiceOwl Transcription API

A minimal API service that accepts audio file URLs, performs transcription (mock or Azure Speech-to-Text), and stores results in MongoDB.

## 🚀 Features

- **POST /transcription** - Creates a transcription using mock transcription service
- **GET /transcriptions** - Fetches transcriptions from the last 30 days
- **POST /azure-transcription** - Creates a transcription using Azure Speech-to-Text (with fallback to mock)
- Retry logic with exponential backoff
- Comprehensive error handling and validation
- TypeScript with full type safety
- MongoDB integration with optimized indexing
- Test suite with Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local instance, Atlas, or MongoMemoryServer for tests)
- Azure Speech Service credentials (optional, falls back to mock if not provided)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd VoiceOwl
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/voiceowl
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_speech_region_here
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=1000
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## 📚 API Documentation

Interactive Swagger/OpenAPI documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality to test endpoints directly
- Interactive examples

The Swagger JSON endpoint provides:
- Raw OpenAPI 3.0 specification in JSON format
- Can be imported into API testing tools (Postman, Insomnia, etc.)
- Can be used for code generation and API client generation

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Create Transcription (Mock)
```
POST /transcription
Content-Type: application/json

{
  "audioUrl": "https://example.com/sample.mp3"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "message": "Transcription created successfully"
}
```

### Get Recent Transcriptions
```
GET /transcriptions?days=30
```

**Response:**
```json
{
  "count": 2,
  "transcriptions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "audioUrl": "https://example.com/sample.mp3",
      "transcription": "transcribed text",
      "source": "default",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Create Azure Transcription
```
POST /azure-transcription
Content-Type: application/json

{
  "audioUrl": "https://example.com/sample.mp3",
  "language": "en-US"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "message": "Azure transcription created successfully",
  "source": "azure"
}
```

**Supported Languages:** `en-US`, `fr-FR`, `es-ES`, `de-DE`, etc. (Azure Speech SDK format)

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📁 Code Structure

```
src/
├── config/           # Configuration files (database, environment)
├── controllers/      # Request handlers
├── middleware/       # Express middleware (error handling, validation)
├── models/           # Mongoose models
├── repositories/     # Data access layer
├── routes/           # Route definitions
├── services/         # Business logic
├── types/            # TypeScript interfaces
├── utils/            # Utility functions (retry, audio download)
└── index.ts          # Application entry point

tests/                # Test files
```

### Architecture Layers

1. **Controllers** - Handle HTTP requests/responses, delegate to services
2. **Services** - Business logic and orchestration
3. **Repositories** - Data access abstraction
4. **Models** - Database schema definitions
5. **Middleware** - Cross-cutting concerns (validation, error handling)
6. **Utils** - Reusable helper functions

## 🗄️ MongoDB Indexing Strategy

### Current Indexes

1. **`createdAt: -1`** - Single field index for date range queries
2. **`audioUrl: 1`** - Index for audio URL lookups
3. **`source: 1`** - Index for filtering by transcription source
4. **`{ source: 1, createdAt: -1 }`** - Compound index for source + date queries

### Indexing for 100M+ Records

For a dataset with 100M+ records, the following indexing strategy would be optimal:

**Primary Index:**
```javascript
{ createdAt: -1 }  // Already implemented
```

**Why this index:**
- The `GET /transcriptions` endpoint queries by date range (`createdAt >= threshold`)
- A descending index on `createdAt` allows MongoDB to efficiently:
  - Scan only documents within the date range
  - Return results in chronological order (newest first)
  - Avoid full collection scans

**Additional Considerations:**
- **TTL Index** (optional): If transcriptions have a retention policy, add:
  ```javascript
  { createdAt: 1 }, { expireAfterSeconds: 2592000 } // 30 days
  ```
- **Compound Index** (if filtering by source becomes common):
  ```javascript
  { source: 1, createdAt: -1 }
  ```
- **Partitioning**: For extremely large datasets, consider MongoDB sharding by `createdAt` or `source`

**Query Performance:**
- Without index: O(n) full collection scan
- With index: O(log n) index scan + O(k) where k = matching documents
- Expected query time for 30-day window: < 100ms even with 100M+ records

## 🚀 Scalability Design

To handle **10k+ concurrent requests**, the following changes would be implemented:

### 1. **Caching Layer**
- **Redis** for caching frequently accessed transcriptions
- Cache recent transcriptions (last 30 days) with TTL
- Cache audio file metadata to reduce download attempts
- **Impact**: Reduces database load by 60-80% for read-heavy workloads

### 2. **Message Queue (Job Processing)**
- **RabbitMQ or AWS SQS** for asynchronous transcription processing
- Decouple HTTP requests from transcription work
- Workers process transcriptions in background
- **Impact**: Handles 10k+ concurrent requests without blocking

### 3. **Containerization & Orchestration**
- **Docker** containers for consistent deployment
- **Kubernetes** for auto-scaling based on CPU/memory/queue depth
- Horizontal pod autoscaling (HPA) to scale from 2 to 20+ pods
- **Impact**: Automatic scaling based on load

### 4. **Database Optimization**
- **Read Replicas** for MongoDB to distribute read load
- Connection pooling (already using Mongoose default pool)
- **Impact**: Handles 5-10x more concurrent database queries

### 5. **Load Balancing**
- **NGINX** or cloud load balancer (AWS ALB, GCP LB)
- Round-robin or least-connections algorithm
- Health checks for pod availability
- **Impact**: Distributes traffic across multiple instances

### 6. **CDN for Audio Files**
- Cache audio files at edge locations
- Reduce download latency and origin server load
- **Impact**: Faster audio retrieval, reduced bandwidth costs

### Implementation Priority:
1. **Phase 1**: Containerization + Auto-scaling (Kubernetes)
2. **Phase 2**: Message Queue (RabbitMQ/SQS)
3. **Phase 3**: Caching (Redis)
4. **Phase 4**: Read Replicas + Load Balancer

**Expected Capacity:**
- Current: ~100 concurrent requests
- With Phase 1-2: ~2,000 concurrent requests
- With Phase 1-4: ~10,000+ concurrent requests

## 🔧 Assumptions Made

1. **Audio Download**: Currently mocked with a HEAD request to validate URL. In production, this would download and validate the actual audio file format.

2. **Azure Speech SDK**: The implementation includes Azure Speech SDK integration, but falls back to mock transcription if credentials are not provided or if the service fails.

3. **Transcription Format**: Mock transcriptions return a simple string. Real transcriptions would include timestamps, confidence scores, and speaker diarization.

4. **Error Handling**: All errors are caught and returned as JSON responses with appropriate HTTP status codes.

5. **Date Filtering**: The 30-day filter uses server time. For production, consider timezone handling.

6. **Retry Logic**: Exponential backoff is implemented for Azure transcription, linear backoff for audio downloads.

## 🎯 Production Improvements

### Security
- Add authentication/authorization (JWT, OAuth2)
- Rate limiting (express-rate-limit)
- Input sanitization for audio URLs
- HTTPS enforcement
- CORS configuration for specific origins

### Monitoring & Observability
- Structured logging (Winston, Pino)
- APM tools (New Relic, Datadog)
- Health check endpoints with dependency checks
- Metrics collection (Prometheus)

### Performance
- Database connection pooling optimization
- Query result pagination
- Compression middleware (gzip)
- Response caching headers

### Reliability
- Circuit breaker pattern for external APIs
- Dead letter queue for failed transcriptions
- Database transaction support
- Backup and disaster recovery strategy

### Code Quality
- ESLint + Prettier configuration
- Pre-commit hooks (Husky)
- CI/CD pipeline (GitHub Actions)
- API documentation (Swagger/OpenAPI)

## 📝 License

ISC

## 👤 Author

VoiceOwl Developer Evaluation Task

#   a u d i o - t r a n s c r i b e r  
 