# API Testing with Swagger UI

The application exposes interactive OpenAPI documentation through the Nginx entrypoint:

```text
http://localhost/swagger-ui/index.html
```

## Authentication flow

1. Open `POST /api/auth/login`.
2. Use an existing admin or student account and execute the request.
3. Copy `data.accessToken` from the response.
4. Scroll to the top of Swagger UI and select the **Authorize** button with the lock icon.
5. Paste only the raw token value, without the word `Bearer`:

	```text
	eyJhbGciOiJIUzI1NiJ9...
	```

6. Select **Authorize**, then **Close**.
7. Execute protected endpoints from the UI. Swagger will automatically send:

	```text
	Authorization: Bearer <accessToken>
	```

### Which token should be used?

- Student token: browse catalog, download/stream content, submit feedback.
- Admin token: access dashboard, user list, feedback admin list, and CRUD/upload endpoints.
- A student token correctly receives `403` on admin-only endpoints.

If the **Authorize** button is not visible, reload `http://localhost/swagger-ui/index.html` and scroll to the very top of the page. The lock icons beside operations only indicate that the operation has a security requirement; they are not the input field.

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