<template>
  <el-container class="home-container">
    <el-header>
      <div class="header-left">
        <img src="../assets/logo.jpg" alt="" />
        E-Commerce-Management-System
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边导航栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠栏 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          text-color="#fff"
          background-color="#96A7F4"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <el-submenu :index="item.id" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
        </el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      //每个一级菜单对应的图标是不一样的
      iconsObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollapse: false,
      //选中的菜单高亮
      activePath: '',
    };
  },
  created() {
    this.getMenuList();
    //获取
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      // this.$router.push('/login')
      //用replace比较好，没有历史记录
      this.$router.replace("/login");
    },
    //获取左侧菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      // console.log(res);
      console.log(this.menulist);
    },
    //折叠菜单
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //实现高亮通过保存url
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      //保持高亮状态
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  font-weight: 700;
  background-color: rgba(83, 139, 241, 0.8);
  .header-left {
    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      vertical-align: middle;
    }
  }
}

.iconfont {
  margin-right: 10px;
}

.el-aside {
  background-color: rgba(72, 102, 236, 0.577);
  .el-menu {
    border-right: none;
  }
}

.toggle-button {
  font-size: 10px;
  line-height: 30px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
  background-color: #9fa7f4;
}

.el-main {
  background-color: rgba(253, 253, 255, 0.8);
}

.el-footer {
  background-color: rgba(186, 186, 247, 0.577);
}
</style>