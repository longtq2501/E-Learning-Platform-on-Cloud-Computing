# API Testing with Swagger UI

The application exposes interactive OpenAPI documentation through the Nginx entrypoint:

```text
http://localhost/swagger-ui/index.html
```

## Authentication flow

1. Open `POST /api/auth/login`.
2. Use an existing admin or student account and execute the request.
3. Copy `data.accessToken` from the response.
4. Select **Authorize** in Swagger UI.
5. Enter the token as `Bearer <accessToken>` and select **Authorize**.
6. Execute protected endpoints from the UI.

## Recommended smoke test

1. `GET /api/health`
2. `POST /api/auth/login`
3. `GET /api/categories`
4. `GET /api/books`
5. `GET /api/videos`
6. `POST /api/feedbacks` as a student
7. `GET /api/feedbacks/admin` as an admin
8. `POST /api/categories` as an admin
9. `GET /api/books/{id}/download-url`
10. `GET /api/videos/{id}/stream-url`

The response header `X-Instance-Id` shows which backend instance handled the request. Repeat requests through `http://localhost` to observe Nginx round-robin behavior.