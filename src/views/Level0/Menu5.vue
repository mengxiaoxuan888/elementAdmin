<script setup lang="ts">
import { ElInput } from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'

defineOptions({
  name: 'Menu2'
})

const { t } = useI18n()

const text = ref('')
</script>

<template>
  <ContentWrap :title="t('level0Demo.menu5')">
    <div class="flex items-center"> Menu2: <ElInput v-model="text" class="pl-20px" /> </div>
  </ContentWrap>
</template>
