<script setup lang="ts">
import { ref } from 'vue'
import { usePostRequest } from '../composables'

interface PostData {
    title: string
    body: string
    userId: number
}

const { mutate: createPost, isPending: isCreating, isSuccess, error } = usePostRequest<PostData, PostData>(
    'https://jsonplaceholder.typicode.com/posts',
    {
        onSuccess: (data) => {
            console.log('Post created successfully:', data)
            formData.value = {
                title: '',
                body: '',
                userId: 1
            }
        },
        onError: (error) => {
            console.error('Failed to create post:', error)
        },
        invalidateQueries: [['get', 'https://jsonplaceholder.typicode.com/posts']]
    }
)

const formData = ref<PostData>({
    title: '',
    body: '',
    userId: 1
})

const handleSubmit = () => {
    createPost(formData.value)
}
</script>

<template>
    <div class="post-form">
        <h3>Yeni Gönderi Oluştur</h3>

        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="title">Başlık:</label>
                <input id="title" v-model="formData.title" type="text" required :disabled="isCreating" />
            </div>

            <div class="form-group">
                <label for="body">İçerik:</label>
                <textarea id="body" v-model="formData.body" required :disabled="isCreating"></textarea>
            </div>

            <div class="form-group">
                <label for="userId">Kullanıcı ID:</label>
                <input id="userId" v-model.number="formData.userId" type="number" required :disabled="isCreating" />
            </div>

            <button type="submit" :disabled="isCreating" class="submit-btn">
                {{ isCreating ? 'Oluşturuluyor...' : 'Gönderi Oluştur' }}
            </button>
        </form>

        <div v-if="error" class="error">
            Error: {{ error.message }}
        </div>

        <div v-if="isSuccess" class="success">
            Gönderi başarıyla oluşturuldu!
        </div>
    </div>
</template>

<style scoped>
.post-form {
    max-width: 500px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
    color: #333;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.form-group textarea {
    height: 100px;
    resize: vertical;
}

.form-group input:disabled,
.form-group textarea:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.submit-btn {
    background-color: #42b883;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    width: 100%;
}

.submit-btn:hover:not(:disabled) {
    background-color: #369870;
}

.submit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.error {
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    padding: 12px;
    margin-top: 16px;
    color: #c33;
}

.success {
    background-color: #efe;
    border: 1px solid #cfc;
    border-radius: 4px;
    padding: 12px;
    margin-top: 16px;
    color: #363;
}
</style>
