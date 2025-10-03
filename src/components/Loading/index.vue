<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ isLoading: boolean }>()

</script>

<template>
    <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Yükleniyor...</p>
    </div>

</template>

<style>
.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #42b883;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
