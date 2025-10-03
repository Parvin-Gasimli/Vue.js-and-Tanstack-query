Request Composables

This module provides reusable composables for handling HTTP requests in your Vue application.

useRequest (GET Requests)
Basic Usage
import { useGetRequest } from "./composables";

// Simple GET request
const { data, isPending, isError, error, refetch } = useGetRequest<User[]>(
"https://api.example.com/users"
);

Advanced Usage
import { useRequest } from "./composables";

// With custom options
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
staleTime: 5 _ 60 _ 1000, // 5 minutes
retry: 3,
});

useRequest Options

queryKey: Cache key (required)

queryFn: Request function (required)

enabled: Whether the request is active (optional)

staleTime: How long the data remains fresh (default: 5 minutes)

cacheTime: How long the data stays in cache (default: 10 minutes)

refetchOnWindowFocus: Refetch when window gains focus (default: false)

retry: Number of retries on failure (default: 3)

useRequestMutation (POST/PUT/DELETE Requests)
Basic Usage
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

// PUT request
const { mutate: updateUser } = usePutRequest<User, UpdateUserData>(
"https://api.example.com/users",
{
onSuccess: () => {
console.log("User updated");
},
}
);

// DELETE request
const { mutate: deleteUser } = useDeleteRequest<void, { id: number }>(
"https://api.example.com/users",
{
onSuccess: () => {
console.log("User deleted");
},
}
);

Advanced Usage
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

Mutation Options

mutationFn: Mutation function (required)

onSuccess: Callback when successful (optional)

onError: Callback on error (optional)

invalidateQueries: Cache keys to invalidate on success (optional)

Return Values
useRequest / useGetRequest
{
data: Ref<T | undefined>, // Response data
error: Ref<Error | null>, // Error object
isPending: Ref<boolean>, // Initial loading state
isFetching: Ref<boolean>, // Refetching state
isError: Ref<boolean>, // Error state
isSuccess: Ref<boolean>, // Success state
refetch: () => void // Manually trigger refetch
}

useRequestMutation
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

Example Use Cases

1. User List
   // Inside a component
   const { data: users, isPending, isError, error } = useGetRequest<User[]>('/api/users')

// Template

<div v-if="isPending">Loading...</div>
<div v-if="isError">Error: {{ error.message }}</div>
<div v-if="users">
  <div v-for="user in users" :key="user.id">
    {{ user.name }}
  </div>
</div>

2. Form Submission
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

// Template

<form @submit.prevent="handleSubmit">
  <input v-model="formData.name" placeholder="Name" />
  <input v-model="formData.email" placeholder="Email" />
  <button type="submit" :disabled="isPending">
    {{ isPending ? 'Submitting...' : 'Submit' }}
  </button>
</form>

3. Conditional Requests
   const userId = ref<number | null>(null);

const { data: user } = useRequest<User>({
queryKey: ["user", userId],
queryFn: async () => {
const response = await fetch(`/api/users/${userId.value}`);
return response.json();
},
enabled: computed(() => !!userId.value), // Only runs if userId exists
});

👉 These composables provide a consistent and reusable way to handle HTTP requests across your application.
