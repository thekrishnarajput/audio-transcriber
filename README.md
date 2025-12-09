# VoiceOwl Transcription API

A minimal API service that accepts audio file URLs, performs transcription (mock or Azure Speech-to-Text), and stores results in MongoDB.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [API Endpoints](#-api-endpoints)
- [Code Structure](#-code-structure)
- [Testing](#-testing)
- [MongoDB Indexing Strategy](#-mongodb-indexing-strategy)
- [Scalability Design](#-scalability-design)
- [Assumptions Made](#-assumptions-made)
- [Production Improvements](#-production-improvements)

## 🚀 Features

### Part 1 - Backend API (Required) ✅

- **POST /api/transcription** - Creates a transcription using mock transcription service
- **GET /api/transcriptions** - Fetches transcriptions from the last 30 days
- **POST /api/azure-transcription** - Creates a transcription using Azure Speech-to-Text (with fallback to mock)
- Retry logic with exponential backoff for Azure transcriptions
- Linear retry for audio downloads
- Comprehensive error handling and validation
- TypeScript with full type safety
- MongoDB integration with optimized indexing
- Test suite with Jest and MongoMemoryServer

### Part 2 - MongoDB Query & Indexing (Required) ✅

- GET /api/transcriptions endpoint with date filtering (default: last 30 days)
- Optimized indexes for efficient querying
- Indexing strategy documented for 100M+ records

### Part 3 - Scalability & System Design (Required) ✅

- Scalability design documented in README
- Architecture considerations for 10k+ concurrent requests

### Part 4 - API Integration (Required) ✅

- Azure Speech-to-Text integration with Microsoft Cognitive Services Speech SDK
- Graceful fallback to mock transcription if credentials unavailable
- Support for multiple languages (en-US, fr-FR, es-ES, de-DE, etc.)
- Exponential backoff retry for failed Azure API requests
- Environment variable configuration for API keys
- Error handling for API timeouts and failures

### Part 5 - Realtime Voice Streaming (Optional, Bonus) ✅

- **WebSocket endpoint** for real-time audio streaming transcription
- Accepts mocked audio chunks via WebSocket connection
- Streams back partial and final transcription events in real-time
- Stores streaming session metadata in MongoDB
- Session management with unique session IDs
- Automatic session cleanup on disconnect
- Support for multiple concurrent streaming sessions

### Bonus Features Implemented ✅

- Environment variables (dotenv) configuration
- TypeScript interfaces for all request/response types
- Comprehensive test suite using Jest
- Retry logic with exponential backoff for Azure transcriptions
- Multiple language support for Azure Speech-to-Text
- Swagger/OpenAPI documentation
- Rate limiting middleware
- Security headers (Helmet)
- HTTP Parameter Pollution protection (HPP)
- CORS support

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local instance, Atlas, or MongoMemoryServer for tests)
- Azure Speech Service credentials (optional, falls back to mock if not provided)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voiceOWL
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/voiceowl
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_speech_region_here
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=1000
```

4. Ensure MongoDB is running (or use MongoDB Atlas connection string)

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

## 📡 API Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "API is healthy",
  "database": {
    "connected": true,
    "host": "localhost:27017",
    "name": "voiceowl"
  }
}
```

### Create Transcription (Mock)
```
POST /api/transcription
Content-Type: application/json

{
  "audioUrl": "https://example.com/sample.mp3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transcription created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011"
  }
}
```

### Get Recent Transcriptions
```
GET /api/transcriptions?days=30
```

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "Data found",
  "data": {
    "count": 2,
    "transcriptions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "audioUrl": "https://example.com/sample.mp3",
        "transcription": "transcribed text",
        "source": "default",
        "language": "en-US",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Create Azure Transcription
```
POST /api/azure-transcription
Content-Type: application/json

{
  "audioUrl": "https://example.com/sample.mp3",
  "language": "en-US"
}
```

**Request Body:**
- `audioUrl` (required): URL of the audio file to transcribe
- `language` (optional): Language code (default: "en-US")

**Supported Languages:** `en-US`, `fr-FR`, `es-ES`, `de-DE`, `it-IT`, `pt-BR`, `ja-JP`, `ko-KR`, `zh-CN`, etc. (Azure Speech SDK format)

**Response:**
```json
{
  "success": true,
  "message": "Azure transcription created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "source": "azure"
  }
}
```

**Note:** If Azure credentials are not configured, the service will automatically fall back to mock transcription.

### WebSocket Streaming Transcription

The WebSocket endpoint enables real-time audio streaming and transcription. Connect to the WebSocket server and send audio chunks to receive partial and final transcriptions.

**Connection:**
```
ws://localhost:3000
```

**Client Events (Send to Server):**

1. **session:start** - Start a new streaming session
```json
{
  "audioUrl": "https://example.com/sample.mp3" // optional
}
```

2. **audio:chunk** - Send an audio chunk for transcription
```json
{
  "chunk": "base64_encoded_audio_data",
  "chunkIndex": 0,
  "sessionId": "optional_session_id",
  "timestamp": 1234567890
}
```

3. **session:end** - End the current streaming session
```json
{}
```

**Server Events (Receive from Server):**

1. **session:created** - Session ID assigned
```json
{
  "sessionId": "unique-session-id"
}
```

2. **session:started** - Session started successfully
```json
{
  "type": "status",
  "data": {
    "status": "active",
    "sessionId": "unique-session-id"
  }
}
```

3. **transcription:partial** - Partial transcription result
```json
{
  "type": "partial",
  "data": {
    "partial": "Hello world, this is",
    "sessionId": "unique-session-id"
  }
}
```

4. **transcription:final** - Final transcription result
```json
{
  "type": "final",
  "data": {
    "transcription": "Hello world, this is a test transcription",
    "sessionId": "unique-session-id"
  }
}
```

5. **session:ended** - Session completed
```json
{
  "type": "status",
  "data": {
    "status": "completed",
    "sessionId": "unique-session-id",
    "transcription": "Final transcription text"
  }
}
```

6. **transcription:error** - Error occurred
```json
{
  "type": "error",
  "data": {
    "message": "Error description",
    "sessionId": "unique-session-id"
  }
}
```

**Example Client Code (JavaScript):**
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('session:created', (data) => {
  console.log('Session ID:', data.sessionId);
  // Start the session
  socket.emit('session:start', { audioUrl: 'https://example.com/audio.mp3' });
});

socket.on('session:started', (data) => {
  console.log('Session started:', data);
  // Send audio chunks
  for (let i = 0; i < 10; i++) {
    socket.emit('audio:chunk', {
      chunk: `mock_audio_chunk_${i}`,
      chunkIndex: i
    });
  }
});

socket.on('transcription:partial', (event) => {
  console.log('Partial:', event.data.partial);
});

socket.on('transcription:final', (event) => {
  console.log('Final:', event.data.transcription);
  // End the session
  socket.emit('session:end');
});

socket.on('transcription:error', (event) => {
  console.error('Error:', event.data.message);
});
```

**Note:** All streaming sessions are stored in MongoDB with metadata including partial transcriptions, chunk counts, and session status.

## 📁 Code Structure

```
voiceOWL/
├── src/
│   ├── app.ts                          # Application entry point
│   ├── config/
│   │   ├── database.ts                 # MongoDB connection configuration
│   │   └── env.ts                      # Environment variable configuration
│   ├── transcription/
│   │   ├── controller/
│   │   │   └── transcription.controller.ts    # Request handlers
│   │   ├── interface/
│   │   │   └── transcription.interface.ts     # TypeScript interfaces
│   │   ├── model/
│   │   │   └── transcription.model.ts         # Mongoose schema and model
│   │   ├── repository/
│   │   │   └── transcription.repository.ts    # Data access layer
│   │   ├── router/
│   │   │   └── transcription.routes.ts        # Route definitions
│   │   └── service/
│   │       ├── transcription.service.ts       # Business logic (mock transcription)
│   │       └── azureSpeech.service.ts         # Azure Speech-to-Text integration
│   ├── streaming/
│   │   ├── interface/
│   │   │   └── streaming.interface.ts         # WebSocket event interfaces
│   │   ├── model/
│   │   │   └── streamingSession.model.ts     # Streaming session schema
│   │   ├── repository/
│   │   │   └── streamingSession.repository.ts # Data access for streaming sessions
│   │   └── service/
│   │       └── streaming.service.ts          # WebSocket streaming logic
│   └── utils/
│       ├── common/
│       │   ├── enums/
│       │   │   └── httpStatusCodes.ts         # HTTP status code constants
│       │   ├── functions/
│       │   │   ├── audioDownload.ts           # Audio download utility (mocked)
│       │   │   ├── logger.ts                  # Logging utility
│       │   │   ├── message.ts                  # Response message constants
│       │   │   ├── retry.ts                   # Retry logic with exponential backoff
│       │   │   └── swagger.ts                 # Swagger configuration
│       │   └── interfaces/
│       │       └── types.interface.ts          # Common TypeScript interfaces
│       └── middlewares/
│           ├── errorHandler.ts                # Global error handling middleware
│           ├── rateLimiter.ts                 # Rate limiting middleware
│           ├── response.ts                    # Standardized response helper
│           ├── urlNotFoundHandler.ts          # 404 handler
│           └── validationHandler.ts           # Request validation middleware
├── tests/
│   ├── transcription.test.ts                  # Transcription service tests
│   └── utils/
│       └── retry.test.ts                      # Retry utility tests
├── dist/                                      # Compiled JavaScript output
├── swagger.json                               # OpenAPI specification
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Architecture Layers

1. **Controllers** - Handle HTTP requests/responses, delegate to services
2. **Services** - Business logic and orchestration (transcription processing)
3. **Repositories** - Data access abstraction (MongoDB operations)
4. **Models** - Database schema definitions (Mongoose models)
5. **Middleware** - Cross-cutting concerns (validation, error handling, rate limiting)
6. **Utils** - Reusable helper functions (retry, audio download, logging)

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

### Test Coverage

The test suite includes:
- Mock transcription functionality
- Transcription document creation
- Recent transcriptions query (date filtering)
- Retry logic with exponential backoff
- Error handling scenarios

Tests use `mongodb-memory-server` for isolated database testing.

## 🗄️ MongoDB Indexing Strategy

### Current Indexes

The following indexes are implemented in the `Transcription` model:

1. **`createdAt: -1`** - Single field descending index for date range queries
2. **`audioUrl: 1`** - Index for audio URL lookups
3. **`source: 1`** - Index for filtering by transcription source
4. **`{ source: 1, createdAt: -1 }`** - Compound index for source + date queries

### Indexing for 100M+ Records

For a dataset with **100M+ records**, the following indexing strategy would be optimal:

**Primary Index:**
```javascript
{ createdAt: -1 }  // Already implemented
```

**Why this index:**
- The `GET /api/transcriptions` endpoint queries by date range (`createdAt >= threshold`)
- A descending index on `createdAt` allows MongoDB to efficiently:
  - Scan only documents within the date range
  - Return results in chronological order (newest first)
  - Avoid full collection scans
  - Leverage index-only queries when possible

**Query Performance:**
- **Without index**: O(n) full collection scan - would take minutes with 100M+ records
- **With index**: O(log n) index scan + O(k) where k = matching documents
- **Expected query time** for 30-day window: < 100ms even with 100M+ records

**Additional Considerations:**

1. **TTL Index** (optional): If transcriptions have a retention policy, add:
   ```javascript
   { createdAt: 1 }, { expireAfterSeconds: 2592000 } // 30 days
   ```
   This automatically deletes old documents, reducing collection size.

2. **Compound Index** (if filtering by source becomes common):
   ```javascript
   { source: 1, createdAt: -1 }
   ```
   Already implemented - supports queries filtering by both source and date.

3. **Partitioning/Sharding**: For extremely large datasets (1B+ records), consider:
   - MongoDB sharding by `createdAt` (time-based sharding)
   - Or sharding by `source` if source distribution is balanced
   - Reduces index size per shard and improves query parallelism

4. **Index Maintenance**:
   - Monitor index usage with `db.transcriptions.aggregate([{$indexStats: {}}])`
   - Consider partial indexes if queries always filter by specific conditions
   - Regular index rebuilds may be needed for write-heavy workloads

## 🚀 Scalability Design

To handle **10k+ concurrent requests**, the following changes would be implemented:

### 1. **Message Queue (Job Processing)** - Priority 1
- **Technology**: RabbitMQ, AWS SQS, or Apache Kafka
- **Implementation**: Decouple HTTP requests from transcription work
- **Architecture**:
  - API receives request → publishes job to queue → returns job ID immediately
  - Worker processes consume jobs from queue → perform transcription → update database
  - Client polls for status or uses webhooks for completion notification
- **Impact**: Handles 10k+ concurrent requests without blocking HTTP threads
- **Complexity**: Medium - requires queue infrastructure and worker processes
- **Risk**: Low - proven pattern, well-documented

### 2. **Containerization & Orchestration** - Priority 2
- **Technology**: Docker + Kubernetes
- **Implementation**:
  - Containerize application with Docker
  - Deploy to Kubernetes cluster
  - Configure Horizontal Pod Autoscaling (HPA) based on:
    - CPU utilization (target: 70%)
    - Memory utilization (target: 80%)
    - Queue depth (custom metric)
  - Auto-scale from 2 to 20+ pods based on load
- **Impact**: Automatic scaling based on load, handles traffic spikes
- **Complexity**: High - requires Kubernetes expertise
- **Risk**: Medium - configuration complexity, need monitoring

### 3. **Caching Layer** - Priority 3
- **Technology**: Redis
- **Implementation**:
  - Cache recent transcriptions (last 30 days) with TTL
  - Cache audio file metadata to reduce download attempts
  - Cache user session data if authentication is added
  - Use cache-aside pattern: check cache → if miss, query DB → store in cache
- **Impact**: Reduces database load by 60-80% for read-heavy workloads
- **Complexity**: Low - Redis is straightforward to integrate
- **Risk**: Low - well-understood caching patterns

### 4. **Load Balancing** - Priority 4
- **Technology**: NGINX, AWS ALB, or GCP Load Balancer
- **Implementation**:
  - Place load balancer in front of application pods
  - Use round-robin or least-connections algorithm
  - Configure health checks for pod availability
  - Enable SSL termination at load balancer
- **Impact**: Distributes traffic across multiple instances, improves availability
- **Complexity**: Low - standard load balancer configuration
- **Risk**: Low - mature technology

### 5. **Database Optimization** - Priority 5
- **Technology**: MongoDB Read Replicas, Connection Pooling
- **Implementation**:
  - Configure MongoDB replica set with read replicas
  - Route read queries to replicas, writes to primary
  - Optimize connection pool size (Mongoose default: 10, scale to 50-100)
  - Implement query result pagination (limit/skip or cursor-based)
- **Impact**: Handles 5-10x more concurrent database queries
- **Complexity**: Medium - requires MongoDB replica set setup
- **Risk**: Medium - need to handle replication lag

### 6. **CDN for Audio Files** - Priority 6
- **Technology**: CloudFront, Cloudflare, or similar
- **Implementation**:
  - Cache audio files at edge locations
  - Reduce download latency and origin server load
  - Use signed URLs for private audio files
- **Impact**: Faster audio retrieval, reduced bandwidth costs
- **Complexity**: Low - CDN configuration
- **Risk**: Low - standard CDN usage

### Implementation Priority & Timeline

**Phase 1 (Week 1-2)**: Containerization + Auto-scaling
- Dockerize application
- Deploy to Kubernetes
- Configure HPA
- **Expected Capacity**: ~2,000 concurrent requests

**Phase 2 (Week 3-4)**: Message Queue
- Set up RabbitMQ or AWS SQS
- Implement worker processes
- Update API to use async job pattern
- **Expected Capacity**: ~5,000 concurrent requests

**Phase 3 (Week 5-6)**: Caching + Load Balancing
- Integrate Redis caching
- Set up load balancer
- **Expected Capacity**: ~8,000 concurrent requests

**Phase 4 (Week 7-8)**: Database Optimization
- Configure MongoDB read replicas
- Optimize connection pooling
- **Expected Capacity**: ~10,000+ concurrent requests

### Expected Capacity Progression

- **Current**: ~100 concurrent requests (single instance, synchronous processing)
- **After Phase 1**: ~2,000 concurrent requests (auto-scaling, 2-5 pods)
- **After Phase 2**: ~5,000 concurrent requests (async job processing)
- **After Phase 3**: ~8,000 concurrent requests (caching reduces DB load)
- **After Phase 4**: ~10,000+ concurrent requests (read replicas, optimized queries)

### Monitoring & Observability

To support scalability, implement:
- **APM Tools**: New Relic, Datadog, or Application Insights
- **Metrics**: Prometheus + Grafana for custom metrics
- **Logging**: Centralized logging (ELK stack, CloudWatch, or similar)
- **Alerting**: Set up alerts for queue depth, error rates, response times

## 🔧 Assumptions Made

1. **Audio Download**: Currently mocked with a HEAD request to validate URL. In production, this would:
   - Download the actual audio file
   - Validate audio format (MP3, WAV, etc.)
   - Check file size limits
   - Stream to transcription service if file is large

2. **Azure Speech SDK**: The implementation includes Azure Speech SDK integration, but:
   - Falls back to mock transcription if credentials are not provided
   - Falls back to mock transcription if the service fails or times out
   - In production, would process actual audio files through Azure Speech-to-Text API

3. **Transcription Format**: Mock transcriptions return a simple string. Real transcriptions would include:
   - Timestamps for each word/phrase
   - Confidence scores
   - Speaker diarization (if multiple speakers)
   - Punctuation and formatting

4. **Error Handling**: All errors are caught and returned as JSON responses with appropriate HTTP status codes. Production would include:
   - Structured error logging
   - Error tracking (Sentry, Rollbar)
   - Retry strategies for transient failures

5. **Date Filtering**: The 30-day filter uses server time. For production, consider:
   - Timezone handling (UTC vs local time)
   - Daylight saving time adjustments
   - Configurable date ranges

6. **Retry Logic**: 
   - Exponential backoff is implemented for Azure transcription
   - Linear backoff for audio downloads
   - Configurable via environment variables

7. **Database Connection**: The application can start without database connection (for testing), but endpoints will fail if database is not available.

## 🎯 Production Improvements

### Security
- [ ] Add authentication/authorization (JWT, OAuth2)
- [ ] Rate limiting per user/IP (already implemented globally)
- [ ] Input sanitization for audio URLs (validate URL format, prevent SSRF)
- [ ] HTTPS enforcement
- [ ] CORS configuration for specific origins (currently allows all)
- [ ] API key authentication for external clients
- [ ] Request size limits (currently 1024MB, may need adjustment)

### Monitoring & Observability
- [ ] Structured logging (Winston, Pino) - replace console.log
- [ ] APM tools (New Relic, Datadog, Application Insights)
- [ ] Health check endpoints with dependency checks (partially implemented)
- [ ] Metrics collection (Prometheus)
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Error tracking (Sentry, Rollbar)

### Performance
- [ ] Database connection pooling optimization (currently using Mongoose default)
- [ ] Query result pagination (currently returns all results)
- [ ] Compression middleware (gzip)
- [ ] Response caching headers
- [ ] Database query optimization (explain plans)
- [ ] Background job processing (as mentioned in scalability section)

### Reliability
- [ ] Circuit breaker pattern for external APIs (Azure Speech)
- [ ] Dead letter queue for failed transcriptions
- [ ] Database transaction support for multi-step operations
- [ ] Backup and disaster recovery strategy
- [ ] Graceful degradation when services are unavailable
- [ ] Idempotency keys for transcription requests

### Code Quality
- [ ] ESLint + Prettier configuration (partially implemented)
- [ ] Pre-commit hooks (Husky - configured but may need setup)
- [ ] CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] API documentation (Swagger - already implemented)
- [ ] Code coverage thresholds (currently no minimum threshold)
- [ ] Dependency vulnerability scanning

### Additional Features
- [ ] Webhook support for transcription completion notifications
- [ ] Batch transcription processing
- [ ] Transcription editing/correction endpoints
- [ ] Export transcriptions (JSON, SRT, VTT formats)
- [ ] Audio file storage (S3, Azure Blob) instead of just URLs

## 📝 Submission Checklist

### Required Components ✅

- [x] **Part 1 - Backend API**: POST /transcription, GET /transcriptions, MongoDB integration
- [x] **Part 2 - MongoDB Query & Indexing**: GET /transcriptions with date filtering, indexing explanation
- [x] **Part 3 - Scalability Design**: Documented in README
- [x] **Part 4 - API Integration**: Azure Speech-to-Text integration with fallback
- [x] **Codebase**: Clean structure with services, controllers, repositories, models
- [x] **README.md**: Complete documentation with all required sections
- [x] **Tests**: Jest test suite with MongoMemoryServer
- [x] **TypeScript**: Full type safety with interfaces
- [x] **Environment Variables**: dotenv configuration
- [x] **Error Handling**: Comprehensive error handling
- [x] **Retry Logic**: Exponential backoff for Azure, linear for downloads

### Bonus Features Implemented ✅

- [x] Environment variables (dotenv)
- [x] TypeScript interfaces
- [x] Test cases (Jest)
- [x] Retry logic with exponential backoff
- [x] Multiple language support (Azure)
- [x] Swagger/OpenAPI documentation
- [x] Rate limiting
- [x] Security headers (Helmet)

### Optional Features

- [x] **Part 5 - Realtime/Workflow**: WebSocket streaming implemented (Option A)
- [ ] **Part 6 - Frontend**: React/Next.js frontend UI

## 📄 License

ISC

## 👤 Author

VoiceOwl Developer Evaluation Task
