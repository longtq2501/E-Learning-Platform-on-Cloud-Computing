# System Testing Guide

## 1. Fast validation

Run these checks after a code change:

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm ci
npm test -- --run
npm run build
```

Expected result: Maven tests pass, all Vitest tests pass, and Vite produces `dist/`.

## 2. Start the integrated stack

Docker Desktop must be running and `infra/.env` must exist.

```powershell
cd ..
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build
```

Check services:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml ps
```

Expected services: PostgreSQL healthy, MinIO healthy, `backend-1/2/3` healthy, frontend running, and Nginx running.

## 3. Endpoint smoke test

```powershell
Invoke-WebRequest http://localhost/ -UseBasicParsing
Invoke-WebRequest http://localhost/admin/login -UseBasicParsing
Invoke-WebRequest http://localhost/api/health -UseBasicParsing
Invoke-WebRequest http://localhost/swagger-ui/index.html -UseBasicParsing
Invoke-WebRequest http://localhost/v3/api-docs -UseBasicParsing
```

Every request should return HTTP 200. The API health response should expose `X-Instance-Id`.

## 4. Swagger API test

Open `http://localhost/swagger-ui/index.html`.

1. Execute `POST /api/auth/login`.
2. Copy `data.accessToken`.
3. Select `Authorize` and enter `Bearer <accessToken>`.
4. Test public catalog endpoints.
5. Test `POST /api/feedbacks` with a student token.
6. Test `GET /api/feedbacks/admin` with an admin token.
7. Test admin CRUD and multipart upload endpoints with an admin token.
8. Test signed URL endpoints for books and videos.

A student token must receive `403` from admin endpoints. An admin token must be accepted.

## 5. Load balancing and fault tolerance

```powershell
.\infra\scale-demo.ps1
```

The script verifies that requests rotate among the three backend instances, stops `backend-2`, and verifies that requests still return HTTP 200 through the remaining instances.

## 6. Browser acceptance checklist

Student flow:

- Register a student account.
- Log in and confirm redirect to `/student`.
- Search books and videos.
- Filter by category.
- Open a book and download its signed URL.
- Open a video and play its signed URL.
- Submit feedback and confirm success.
- Log out and confirm protected routes redirect to login.

Admin flow:

- Log in at `/admin/login` with an admin account.
- Confirm dashboard metrics load.
- Create, edit, and delete a category.
- Create a book and upload a PDF.
- Create a video and upload an MP4.
- Open feedback list.
- Open users and roles.
- Refresh and confirm the instance telemetry changes over repeated API calls.

## 7. Failure-path checks

- Invalid login returns an error and does not enter the portal.
- Student opening `/admin` is denied.
- Student calling admin endpoints receives `403`.
- Missing or expired JWT returns `401` and clears the frontend session.
- Invalid file upload shows an error without breaking the page.
- Missing catalog item shows a useful error state.
- Stop one backend and verify the browser remains usable.

## 8. Dependency audit

```powershell
cd frontend
npm audit
```

Review vulnerabilities individually. Do not run `npm audit fix --force` without checking the resulting major-version changes.
