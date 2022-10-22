<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
    methods: {
        logout() {
            window.sessionStorage.clear()
            // this.$router.push('/login')
            //用replace比较好，没有历史记录
            this.$router.replace('/login')
        }
    },
    
}
</script>

<style lang="less" scoped>

</style>