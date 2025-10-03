<script setup lang="ts">
import { useGetRequest } from './composables'
import Loading from "./components/Loading/index.vue"
import PostForm from "./components/PostForm.vue"

// Using the new useGetRequest composable
const { isPending, isFetching, isError, data, error, isSuccess, refetch } = useGetRequest<any[]>(
  'https://jsonplaceholder.typicode.com/posts'
)
</script>

<template>
  <div class="container mx-auto">
    <Loading :isLoading="isPending" />
    <div v-if="isError && !isPending" class="error">
      <h3>Hata Oluştu!</h3>
      <p>{{ error?.message || 'Bilinmeyen bir hata oluştu.' }}</p>
      <button @click="refetch()" class="retry-btn">Tekrar Dene</button>
    </div>

    <div v-if="isSuccess" class="content">
      <div v-if="isFetching" class="fetching-indicator">
        Güncelleniyor...
      </div>

      <h2 class="text-2xl font-bold mb-4">Gönderiler</h2>
      <div class="grid grid-cols-3 gap-4 mb-4 ">
        <div v-for="post in data" :key="post.id">
          <div class="post-item">
            <h3>{{ post.title }}</h3>
            <p>{{ post.body }}</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Post Form Component Example -->
    <PostForm />

  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #c33;
}

.error h3 {
  margin-top: 0;
  color: #a00;
}

.retry-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 14px;
}

.retry-btn:hover {
  background-color: #369870;
}

.fetching-indicator {
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 20px;
  color: #1976d2;
  text-align: center;
  font-size: 14px;
}

.content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.post-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.post-item h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 18px;
}

.post-item p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 0;
}
</style>
