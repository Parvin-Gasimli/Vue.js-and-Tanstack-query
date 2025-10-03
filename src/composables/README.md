# Request Composables

This module provides reusable composables for handling HTTP requests in your Vue application.

## useRequest (GET Requests)

### Basic Usage

```typescript
import { useGetRequest } from "./composables";

// Simple GET request
const { data, isPending, isError, error, refetch } = useGetRequest<User[]>(
  "https://api.example.com/users"
);
```

### Advanced Usage

```typescript
import { useRequest } from "./composables";

const { data, isPending, isError, error, refetch } = useRequest<User[]>({
  queryKey: ["users", userId.value],
  queryFn: async () => {
    const response = await fetch(
      `https://api.example.com/users/${userId.value}`
    );
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },
  enabled: computed(() => !!userId.value), // Only runs if userId exists
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 3,
});
```

### useRequest Options

- `queryKey`: Cache key (required)
- `queryFn`: Request function (required)
- `enabled`: Whether the request is active (optional)
- `staleTime`: How long the data remains fresh (default: 5 minutes)
- `cacheTime`: How long the data stays in cache (default: 10 minutes)
- `refetchOnWindowFocus`: Refetch when window gains focus (default: false)
- `retry`: Number of retries on failure (default: 3)

## useRequestMutation (POST/PUT/DELETE Requests)

### Basic Usage

```typescript
import { usePostRequest, usePutRequest, useDeleteRequest } from "./composables";

// POST request
const {
  mutate: createUser,
  isPending,
  isError,
  error,
} = usePostRequest<User, CreateUserData>("https://api.example.com/users", {
  onSuccess: (data) => {
    console.log("User created:", data);
  },
  onError: (error) => {
    console.error("Failed to create user:", error);
  },
  invalidateQueries: [["users"]], // Invalidate cache
});

// PUT request(Method)
const { mutate: updateUser } = usePutRequest<User, UpdateUserData>(
  "https://api.example.com/users",
  {
    onSuccess: () => {
      console.log("User updated");
    },
  }
);

// DELETE request(method)
const { mutate: deleteUser } = useDeleteRequest<void, { id: number }>(
  "https://api.example.com/users",
  {
    onSuccess: () => {
      console.log("User deleted");
    },
  }
);
```

### Advanced Usage

```typescript
import { useRequestMutation } from "./composables";

const { mutate, mutateAsync, isPending, isError, error, reset } =
  useRequestMutation<Response, FormData>({
    mutationFn: async (formData) => {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("Upload successful:", data);
    },
    onError: (error, variables) => {
      console.error("Upload failed:", error);
    },
    invalidateQueries: [["files"], ["uploads"]],
  });
```

### Mutation Options

- `mutationFn`: Mutation function (required)
- `onSuccess`: Callback when successful (optional)
- `onError`: Callback on error (optional)
- `invalidateQueries`: Cache keys to invalidate on success (optional)

## Return Values

### useRequest / useGetRequest

```typescript
{
  data: Ref<T | undefined>, // Response data
  error: Ref<Error | null>, // Error object
  isPending: Ref<boolean>, // Initial loading state
  isFetching: Ref<boolean>, // Refetching state
  isError: Ref<boolean>, // Error state
  isSuccess: Ref<boolean>, // Success state
  refetch: () => void // Manually trigger refetch
}
```

### useRequestMutation

```typescript
{
  mutate: (variables: TVariables) => void, // Fire-and-forget mutation
  mutateAsync: (variables: TVariables) => Promise<TData>, // Async mutation
  data: Ref<TData | undefined>, // Response data
  error: Ref<Error | null>, // Error object
  isPending: Ref<boolean>, // Loading state
  isError: Ref<boolean>, // Error state
  isSuccess: Ref<boolean>, // Success state
  reset: () => void // Reset mutation state
}
```

## Example Use Cases

### 1. User List

```typescript
const { data: users, isPending, isError, error } = useGetRequest<User[]>('/api/users')

<div v-if="isPending">Loading...</div>
<div v-if="isError">Error: {{ error.message }}</div>
<div v-if="users">
  <div v-for="user in users" :key="user.id">
    {{ user.name }}
  </div>
</div>
```

### 2. Form Submission

```typescript
// Inside a component
const formData = ref({ name: '', email: '' })

const { mutate: createUser, isPending, isSuccess } = usePostRequest<User, CreateUserData>(
  '/api/users',
  {
    onSuccess: () => {
      formData.value = { name: '', email: '' }
      alert('User created!')
    }
  }
)

const handleSubmit = () => {
  createUser(formData.value)
}

// Template(UI)
<form @submit.prevent="handleSubmit">
  <input v-model="formData.name" placeholder="Name" />
  <input v-model="formData.email" placeholder="Email" />
  <button type="submit" :disabled="isPending">
    {{ isPending ? 'Submitting...' : 'Submit' }}
  </button>
</form>
```

### 3. Conditional Requests

```typescript
const userId = ref<number | null>(null);

const { data: user } = useRequest<User>({
  queryKey: ["user", userId],
  queryFn: async () => {
    const response = await fetch(`/api/users/${userId.value}`);
    return response.json();
  },
  enabled: computed(() => !!userId.value), // Only runs if userId exists
});
```

### 4. File Upload

```typescript
const { mutate: uploadFile, isPending } = useRequestMutation<
  UploadResponse,
  FormData
>({
  mutationFn: async (formData) => {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },
  onSuccess: (data) => {
    console.log("File uploaded:", data.url);
  },
});

const handleFileUpload = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  uploadFile(formData);
};
```

### 5. Optimistic Updates

```typescript
const { mutate: updateUser } = usePutRequest<User, UpdateUserData>(
  "/api/users",
  {
    onSuccess: (data, variables) => {
      // Update cache(QUERY)
      queryClient.setQueryData(["user", variables.id], data);
    },
    invalidateQueries: [["users"]],
  }
);
```

## Cache Management

### Manual Cache Clearing

```typescript
import { useQueryClient } from "@tanstack/vue-query";

const queryClient = useQueryClient();

// Clear specific query
queryClient.invalidateQueries({ queryKey: ["users"] });

// Clear all cache
queryClient.clear();

// Read data from cache
const userData = queryClient.getQueryData(["user", userId]);

// Write data to cache
queryClient.setQueryData(["user", userId], newUserData);
```

### Cache Key Strategies

```typescript
// Simple key
["users"][
  // Parameterized key
  ("users", userId)
][
  // Nested key
  ("users", userId, "posts")
][
  // Filtered key
  ("users", { status: "active", page: 1 })
];
```

## Error Handling

### Global Error Handler

```typescript
// In main.ts or a plugin file
import { useRequestMutation } from "./composables";

const { mutate: createUser } = useRequestMutation({
  mutationFn: async (data) => {
    // API call
  },
  onError: (error) => {
    // Global error handling
    if (error.message.includes("401")) {
      // Unauthorized - redirect to login
      router.push("/login");
    } else if (error.message.includes("500")) {
      // Server error - notify user
      showNotification("Server error. Please try again later.");
    }
  },
});
```

### Retry Strategy

```typescript
const { data } = useRequest({
  queryKey: ["important-data"],
  queryFn: fetchImportantData,
  retry: (failureCount, error) => {
    // Only retry 3 times for 5xx errors
    if (error.status >= 500 && failureCount < 3) {
      return true;
    }
    return false;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

## TypeScript Support

### Type Definitions

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserData {
  name: string;
  email: string;
}

// Typed GET request
const { data: users } = useGetRequest<User[]>("/api/users");

// Typed POST request
const { mutate: createUser } = usePostRequest<User, CreateUserData>(
  "/api/users",
  {
    onSuccess: (newUser) => {
      // newUser is typed as User
      console.log(newUser.id);
    },
  }
);
```

### Generic Types

```typescript
// Custom response type
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

const { data } = useGetRequest<ApiResponse<User[]>>("/api/users");
// data.value.data is User[]
// data.value.message is string
```

These composables provide a consistent and reusable way to handle HTTP requests across your application. With TypeScript support for type safety, Vue Query integration for performance optimization, and flexible configuration options.
