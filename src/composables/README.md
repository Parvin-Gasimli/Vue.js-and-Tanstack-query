# Request Composables

Bu modül, Vue uygulamanızda HTTP istekleri için yeniden kullanılabilir composable'lar sağlar.

## useRequest (GET İstekleri)

### Temel Kullanım

```typescript
import { useGetRequest } from "./composables";

// Basit GET isteği
const { data, isPending, isError, error, refetch } = useGetRequest<User[]>(
  "https://api.example.com/users"
);
```

### Gelişmiş Kullanım

```typescript
import { useRequest } from "./composables";

// Özelleştirilmiş seçeneklerle
const { data, isPending, isError, error, refetch } = useRequest<User[]>({
  queryKey: ["users", userId.value],
  queryFn: async () => {
    const response = await fetch(
      `https://api.example.com/users/${userId.value}`
    );
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },
  enabled: computed(() => !!userId.value), // Sadece userId varsa çalışır
  staleTime: 5 * 60 * 1000, // 5 dakika
  retry: 3,
});
```

### useRequest Seçenekleri

- `queryKey`: Cache key (zorunlu)
- `queryFn`: İstek fonksiyonu (zorunlu)
- `enabled`: İsteğin aktif olup olmadığı (opsiyonel)
- `staleTime`: Verinin ne kadar süre taze kalacağı (varsayılan: 5 dakika)
- `cacheTime`: Cache'de ne kadar kalacağı (varsayılan: 10 dakika)
- `refetchOnWindowFocus`: Pencere odaklandığında yeniden yükle (varsayılan: false)
- `retry`: Hata durumunda kaç kez deneyeceği (varsayılan: 3)

## useRequestMutation (POST/PUT/DELETE İstekleri)

### Temel Kullanım

```typescript
import { usePostRequest, usePutRequest, useDeleteRequest } from "./composables";

// POST isteği
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
  invalidateQueries: [["users"]], // Cache'i temizle
});

// PUT isteği
const { mutate: updateUser } = usePutRequest<User, UpdateUserData>(
  "https://api.example.com/users",
  {
    onSuccess: () => {
      console.log("User updated");
    },
  }
);

// DELETE isteği
const { mutate: deleteUser } = useDeleteRequest<void, { id: number }>(
  "https://api.example.com/users",
  {
    onSuccess: () => {
      console.log("User deleted");
    },
  }
);
```

### Gelişmiş Kullanım

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

### Mutation Seçenekleri

- `mutationFn`: Mutation fonksiyonu (zorunlu)
- `onSuccess`: Başarılı olduğunda çalışacak fonksiyon (opsiyonel)
- `onError`: Hata durumunda çalışacak fonksiyon (opsiyonel)
- `invalidateQueries`: Başarılı olduğunda temizlenecek cache key'leri (opsiyonel)

## Dönüş Değerleri

### useRequest / useGetRequest

```typescript
{
  data: Ref<T | undefined>,      // API'den dönen veri
  error: Ref<Error | null>,      // Hata objesi
  isPending: Ref<boolean>,       // İlk yükleme durumu
  isFetching: Ref<boolean>,      // Yeniden yükleme durumu
  isError: Ref<boolean>,         // Hata durumu
  isSuccess: Ref<boolean>,       // Başarılı durum
  refetch: () => void           // Manuel yeniden yükleme
}
```

### useRequestMutation

```typescript
{
  mutate: (variables: TVariables) => void,                    // Fire-and-forget mutation
  mutateAsync: (variables: TVariables) => Promise<TData>,    // Async mutation
  data: Ref<TData | undefined>,                              // Response data
  error: Ref<Error | null>,                                  // Error object
  isPending: Ref<boolean>,                                   // Loading state
  isError: Ref<boolean>,                                     // Error state
  isSuccess: Ref<boolean>,                                   // Success state
  reset: () => void                                         // Reset mutation state
}
```

## Örnek Kullanım Senaryoları

### 1. Kullanıcı Listesi

```typescript
// Component içinde
const { data: users, isPending, isError, error } = useGetRequest<User[]>('/api/users')

// Template'de
<div v-if="isPending">Yükleniyor...</div>
<div v-if="isError">Hata: {{ error.message }}</div>
<div v-if="users">
  <div v-for="user in users" :key="user.id">
    {{ user.name }}
  </div>
</div>
```

### 2. Form Gönderimi

```typescript
// Component içinde
const formData = ref({ name: '', email: '' })

const { mutate: createUser, isPending, isSuccess } = usePostRequest<User, CreateUserData>(
  '/api/users',
  {
    onSuccess: () => {
      formData.value = { name: '', email: '' }
      alert('Kullanıcı oluşturuldu!')
    }
  }
)

const handleSubmit = () => {
  createUser(formData.value)
}

// Template'de
<form @submit.prevent="handleSubmit">
  <input v-model="formData.name" placeholder="İsim" />
  <input v-model="formData.email" placeholder="Email" />
  <button type="submit" :disabled="isPending">
    {{ isPending ? 'Gönderiliyor...' : 'Gönder' }}
  </button>
</form>
```

### 3. Koşullu İstekler

```typescript
const userId = ref<number | null>(null);

const { data: user } = useRequest<User>({
  queryKey: ["user", userId],
  queryFn: async () => {
    const response = await fetch(`/api/users/${userId.value}`);
    return response.json();
  },
  enabled: computed(() => !!userId.value), // Sadece userId varsa çalışır
});
```

Bu composable'lar, uygulamanızın her yerinde tutarlı ve yeniden kullanılabilir HTTP istekleri yapmanızı sağlar.
