# Judge0 Integration Setup Guide

This guide will help you set up Judge0 for code execution in your AlgoMaster platform.

## Option 1: Local Judge0 (Recommended for Development)

### Prerequisites
- Docker and Docker Compose installed

### Setup Steps

1. **Clone Judge0**
   ```bash
   git clone https://github.com/judge0/judge0.git
   cd judge0
   ```

2. **Start Judge0 with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Verify Installation**
   ```bash
   curl http://localhost:2358/about
   ```

4. **Update your .env file**
   ```env
   JUDGE0_API_URL=http://localhost:2358
   JUDGE0_API_KEY=
   ```

### Default Ports
- Judge0 API: `http://localhost:2358`
- Judge0 Workers: Running in background

---

## Option 2: RapidAPI Judge0 (For Production)

### Setup Steps

1. **Get API Key**
   - Go to [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
   - Subscribe to a plan (Free tier available)
   - Copy your API key

2. **Update your .env file**
   ```env
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your_rapidapi_key_here
   ```

### Rate Limits
- Free tier: 50 requests/day
- Basic tier: 100 requests/day
- Pro tier: Unlimited

---

## Supported Languages

The platform currently supports:
- JavaScript (Node.js)
- Python 3
- Java
- C++ (GCC 9.2.0)
- C (GCC 9.2.0)
- TypeScript
- Go
- Rust

---

## API Endpoints

### Execute Code
```
POST /api/code/execute
Authorization: Bearer <token>

Body:
{
  "code": "console.log('Hello World');",
  "language": "javascript",
  "stdin": "" // optional
}
```

### Run Test Cases
```
POST /api/code/test
Authorization: Bearer <token>

Body:
{
  "code": "function solve(arr, target) { ... }",
  "language": "javascript",
  "testCases": [
    { "input": "1 2 3\n5", "expected": "2" },
    { "input": "4 5 6\n10", "expected": "-1" }
  ]
}
```

### Get Supported Languages
```
GET /api/code/languages
Authorization: Bearer <token>
```

---

## Testing the Integration

1. **Start your backend server**
   ```bash
   cd Coding_Platform/Model/backend
   npm start
   ```

2. **Test code execution**
   ```bash
   curl -X POST http://localhost:5000/api/code/execute \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "code": "console.log(\"Hello from Judge0!\");",
       "language": "javascript"
     }'
   ```

---

## Troubleshooting

### Judge0 not responding
- Check if Docker containers are running: `docker ps`
- Check Judge0 logs: `docker-compose logs -f`
- Restart Judge0: `docker-compose restart`

### API Key errors (RapidAPI)
- Verify your API key is correct
- Check your subscription status
- Ensure you haven't exceeded rate limits

### Language not supported
- Check the LANGUAGE_IDS mapping in `backend/services/judge0Service.js`
- Verify Judge0 version supports the language

---

## Monaco Editor Features

The platform now uses Monaco Editor (VS Code's editor) with:
- Syntax highlighting
- IntelliSense (code completion)
- Error detection
- Code formatting
- Multiple themes
- Font size adjustment
- Code upload/download
- Bracket pair colorization
- Smooth scrolling

---

## Next Steps

1. Set up Judge0 using one of the options above
2. Restart your backend server
3. Test code execution in the platform
4. (Optional) Implement plagiarism detection with MOSS
5. (Optional) Add Keycloak for advanced authentication

---

## Additional Resources

- [Judge0 Documentation](https://ce.judge0.com/)
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
