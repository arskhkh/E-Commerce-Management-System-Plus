<template>
  <div class="login_container">
    <!-- 登录盒子 -->
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.jpg" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :rules="loginFormRules" label-width="0px" :model="loginForm" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <!-- 登录按钮 -->
          <el-button type="primary" @click="login">登录</el-button>
          <!-- 注册按钮 -->
          <el-button type="primary" @click="loginFormRest">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            //这是登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            //这是登录表单的校验规则对象
            loginFormRules: {
              username: [
                { required: true, message: '请输入登录名称', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
              ],
              password: [
                { required: true, message: '请输入登录密码', trigger: 'blur' },
                { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
              ]
            }
        }
    },

    methods: {
      //重置按钮点击事件，重置表单
      loginFormRest() {
        this.$refs.loginFormRef.resetFields()
      },
      //登录表单的预验证
      login() {
        this.$refs.loginFormRef.validate( async (valid) => {
          // console.log(valid);
          if (!true) return
          //发起请求
          // const data = await this.$http.post('login', this.loginForm)
          //解构赋值 过滤响应对象中中不需要的属性
          const { data: res } = await this.$http.post('login', this.loginForm)
          console.log(res);
          if (res.meta.status !== 200) return this.$message.error('登录失败！');
          this.$message.success('登录成功！')
          //1.将登录成功之后的token,保存到客户端的 sessionStorage 中
          //访问有权限页面需要携带token
          //保存token到sessionStorage
          window.sessionStorage.setItem('token', res.data.token)
          //页面跳转到主页
          this.$router.push('/home')
        })
      }
    },
};
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  position: relative;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  // css3实现盒子水平垂直居中
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    padding: 10px;
    width: 130px;
    height: 130px;
    border: 1px solid #ccc;
    border-radius: 50%;
    //阴影
    box-shadow: 0 0 10px #06c;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
}

.login_form {
    width: 100%;
    position: absolute;
    bottom: 0;
    padding: 0 20px;
    //改为IE盒子
    box-sizing: border-box;

}

.btns {
    //让按钮靠右对齐
    display: flex;
    justify-content: flex-end;
}
</style>