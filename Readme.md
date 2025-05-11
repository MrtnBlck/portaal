# Portaal

## What is Portaal?

Portaal is a platform that aims to ease the process of graphic design for professionals and amateurs alike. It provides the necessary tools to create design templates, using which other users can create their own, customized designs without needing to have any prior knowledge of graphic design.

## Table of contents

- [Demo](#demo)
- [Usage](#usage)
- [Development](#development)
- [Planned features](#planned-features)

## Demo

Visit [portaal-chi.vercel.app](https://portaal-chi.vercel.app/) to see the application in action.

## Usage

### For average users

**1. Sign in and create a new project.**\
**2. Choose a template.**

![Template-selector](./Readme%20pictures/newProject.png)

> [!WARNING]
> Portaal is still in development. The shown designs were created with different tools and they are not yet available.

**3. Add your own text to the template.**

![normal mode](./Readme%20pictures/normal.png)

> [!NOTE]
> Portaal's "linked elements" feature enables synchronization of elements across multiple instances, allowing simultaneous updates to various design formats. Currently, this feature supports text elements only.

**4. Export and enjoy!**

### For professionals

**1. Sign in and create a new project or a new template.**

> [!TIP]
> You can make a template from an existing project, if the selected template for the project is editable.

**2. Make something awesome!**

![design mode](./Readme%20pictures/designer.png)

> [!WARNING]
> Portaal is still in development. The shown design was created with a different tool, and it is not yet achievable.

**3. Set up linked elements.**

In the properties panel there is an option to link different elements together, which will make their values synchronize. The parent elements will appear in the linked elements panel for the template users.

![linked elements](./Readme%20pictures/linkedElements.png)

**4. Save & share with others!**

## Development

### Technology stack

- **Frontend**: Next.js, React, Tailwind, Zustand, Tanstack Query, Konva.js
- **Backend**: Drizzle ORM, Hono, Zod
- **Services**: Neon Postgres, Clerk, Uploadthing

### Set up

The project uses the [Bun](https://bun.sh/) package manager. To install the dependencies, run:

```bash
bun install
```

> [!WARNING]
> The use of other package managers is possible, but not recommended. The project was not tested with other package managers.

### Environment variables

To run the project locally a `.env` file is required with the following variables:

```dotenv
# Clerk API keys
CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL="/projects"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/projects"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""

# Database connection strings
DATABASE_POSTGRES_URL=""

# Only for development
PUBLIC_URL_DEV="http://localhost:3000"
# Only for deployment
PUBLIC_URL_PROD=""

# Uploadthing token
UPLOADTHING_TOKEN=""
```

To get the necessary keys visit the following websites:

- [Clerk](https://clerk.dev/)
- [Neon Postgres](https://neon.tech/)
- [Uploadthing](https://uploadthing.com/)

## Planned features

Portaal is still in development, therefore it's features are quite limited.

### Editor

- Basic UX improvements (shortcuts, drag and drop, etc.)
- More element types (shapes, vectors, adjusment layers, etc.)
- More element properties (fonts, alignments, strokes, effects, etc.)
- Better layer management & grouping
- Async actions notifications (project saving, photo uploading)

### Other

- Integrated messaging between template creators and users
- Project sharing
- Responsiveness improvements
