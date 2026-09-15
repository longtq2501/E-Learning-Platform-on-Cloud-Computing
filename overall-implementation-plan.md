# Overall Implementation Plan - Phase 4 Frontend

## 1. Overview and Architecture

Phase 4 delivers the single-page application frontend for the E-Learning Platform on Cloud Computing. To enable parallel development and maintain clean domain boundaries, Phase 4 is partitioned into two independent branches:

- **Branch A (Nhanh A - Student / Client Portal)**: Public catalog browsing, search, book reading/downloading with MinIO presigned URLs, video streaming player with MinIO presigned URLs, user authentication (login/register), and feedback submission form.
- **Branch B (Nhanh B - Admin & Content Management Portal)**: Protected administration back-office for administrators (`ROLE_ADMIN`), including dashboard analytics, category CRUD, book management with PDF file upload, video management with MP4 file upload, student feedback inspection, and user list monitoring.

```
Frontend Architecture (Modular Structure)
+---------------------------------------------------------------+
|                      Shared Core & API                        |
|  - apiClient (Axios with Bearer JWT interceptor)             |
|  - authStore / authContext (Role-based access state)         |
|  - UI Tokens, Icons (SVG Lucide), Toast Notifications         |
+-------------------------------+-------------------------------+
                                |
        +-----------------------+-----------------------+
        |                                               |
+-------v-----------------------+       +---------------v---------------+
|     Branch A (Student Portal) |       |  Branch B (Admin Portal)      |
| - Login / Register            |       | - Admin Layout & Auth Guard   |
| - Public Catalog Browse       |       | - Dashboard & Stats Overview  |
| - Full-text Search            |       | - Category Management (CRUD)  |
| - Book Download (Presigned)   |       | - Book CRUD + MinIO Upload    |
| - Video Player (Streaming)    |       | - Video CRUD + MinIO Upload   |
| - Submit Feedback             |       | - Feedback Inspection         |
+-------------------------------+       | - User Management             |
                                        +-------------------------------+
```

---

## 2. Phase 4 Branch Breakdown

### Branch A: Student / Client Portal (Nhanh A)
*Status: Deferred / Independent Branch (Will not be touched during Branch B implementation)*
- **Step 4.1.A**: Student Layout, Navigation Header, Auth State & Login/Register modal/pages.
- **Step 4.2.A**: Public Catalog listing with Category filtering and PostgreSQL full-text search.
- **Step 4.3.A**: Book Details View, view counter trigger (`POST /api/books/{id}/view`), and secure download trigger (`GET /api/books/{id}/download-url` + `POST /api/books/{id}/download`).
- **Step 4.4.A**: Video Details View, view counter trigger (`POST /api/videos/{id}/view`), and streaming HTML5 video player with presigned URL (`GET /api/videos/{id}/stream-url`).
- **Step 4.5.A**: Student Feedback submission form (`POST /api/feedbacks`).

---

### Branch B: Admin & Content Management Portal (Nhanh B - Current Target)
*Branch Name*: `phase/4-branch-b-admin`

#### B.1 - Core Infrastructure & Admin Shell
- API Service Layer (`src/services/api.js`): Axios client with base URL `/api`, Bearer token interceptor, standardized error handler mapping to backend `ApiResponse<T>`.
- Auth & RBAC State (`src/context/AuthContext.jsx` or state store): Session storage of JWT token, user claims (`email`, `fullName`, `role`), login handler, logout handler, role validation guard (`ROLE_ADMIN`).
- Design System & UI Shell (`src/components/admin/AdminLayout.jsx`): Responsive admin layout with collapsible sidebar navigation, top bar with current user info & logout, breadcrumb, active route indicator, notification toasts, and clean dark/light UI palette adhering to `ui-ux-pro-max` guidelines without emojis.

#### B.2 - Admin Dashboard & System Analytics (`src/pages/admin/DashboardPage.jsx`)
- Overview KPI summary cards: Total Books, Total Videos, Total Categories, Total Views & Downloads.
- Quick system status card: Active backend instance info (via `X-Instance-Id`), MinIO storage status indicator, Database connectivity.
- Recent activities and quick action shortcuts to Category, Book, Video, and Feedback management.

#### B.3 - Category Management (`src/pages/admin/CategoriesPage.jsx`)
- Category data table: Name, Description, Book count, Created timestamp, Actions.
- Create Category modal / form with validation (`POST /api/categories`).
- Edit Category modal / form (`PUT /api/categories/{id}`).
- Delete Category confirmation dialog with warning (`DELETE /api/categories/{id}`).

#### B.4 - Book Management & Binary Upload (`src/pages/admin/BooksPage.jsx`)
- Books data table: Title, Author, Category, Description, File Status (Uploaded/Missing), File Size, View/Download counters, Actions.
- Search and Category filter for fast lookup.
- Create Book Metadata form (`POST /api/books`).
- Edit Book Metadata form (`PUT /api/books/{id}`).
- Upload PDF file to MinIO Object Storage (`POST /api/books/{id}/upload` via multipart/form-data) with upload progress indicator, mime validation, and file size formatting.
- Delete Book action with confirmation (`DELETE /api/books/{id}`).

#### B.5 - Video Management & Binary Upload (`src/pages/admin/VideosPage.jsx`)
- Videos data table: Title, Description, Duration, Category, File Status, File Size, View counters, Actions.
- Search and Category filter.
- Create Video Metadata form (`POST /api/videos`).
- Edit Video Metadata form (`PUT /api/videos/{id}`).
- Upload MP4 file to MinIO Object Storage (`POST /api/videos/{id}/upload` via multipart/form-data) with progress bar.
- Video preview player modal utilizing presigned streaming URL (`GET /api/videos/{id}/stream-url`).
- Delete Video action (`DELETE /api/videos/{id}`).

#### B.6 - Feedback Inspection (`src/pages/admin/FeedbackPage.jsx`)
- Student feedback list table: Title, Content, Target Type (`BOOK`, `VIDEO`, `SYSTEM`), Target ID, Submitter Name/Email, Created timestamp (`GET /api/feedbacks`).
- Filter by target type.
- Feedback detail modal for reviewing extensive feedback content.

#### B.7 - User Management (`src/pages/admin/UsersPage.jsx`)
- Users list table: Full Name, Email, Role (`ROLE_ADMIN`, `ROLE_STUDENT`), Created Date (`GET /api/admin/users`).
- Role filter and search.

---

## 3. Git Workflow & Execution Rules

1. **Branch Isolation**: Work strictly on `phase/4-branch-b-admin`. Do not touch Branch A components.
2. **Commit Standard**: Follow conventional commits:
   - `feat(admin): bootstrap admin shell, router, and auth guard`
   - `feat(admin): implement dashboard overview and metrics`
   - `feat(admin): implement category crud management`
   - `feat(admin): implement book metadata crud and pdf upload to minio`
   - `feat(admin): implement video metadata crud and mp4 upload with preview`
   - `feat(admin): implement feedback inspection and user list management`
   - `docs(progress): update ledger and progress tracking for phase 4 branch b`
3. **Merge & Return**:
   - Merge `phase/4-branch-b-admin` into `main` with `merge(phase/4-b): admin portal and management complete`.
   - Push and return to `main`.
