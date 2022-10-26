<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 带搜索的输入框 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- {{ scope.row }} -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加用户对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 内容区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <!-- 手机 -->
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部确认区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <!-- 内容 -->
        <el-form
          :model="editForm"
          :rules="addFormRules"
          ref="editFormRef"
          label-width="70px"
          @close="editDialogClosed"
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    //邮箱的校验规则
    const checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    //手机号的校验规则
    const checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        //合法的手机号
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      queryInfo: {
        //查询关键字
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      //是否显示添加用户的对话框
      addDialogVisible: false,
      //是否显示修改用户对话框
      editDialogVisible: false,
      //添加用户
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //查询到的用户信息对象
      editForm: {},
      //添加用户表单的校验规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 10 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名的长度在6~15个字符之间",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //发起获取用户数据列表的请求
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户数据列表失败！");
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    //监听pagesize的改变
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      //重新发起请求
      this.getUserList();
    },
    //监听页码值的改变
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      //重新发起请求
      this.getUserList();
    },
    //监听用户状态改变事件
    async userStateChange(userinfo) {
      console.log(userinfo);
      //发起put请求
      //用模板字符串
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },
    //监听对话框关闭事件
    addDialogClosed() {
      //清空表单
      this.$refs.addFormRef.resetFields();
    },
    //添加用户
    addUser() {
      //表单预校验
      this.$refs.addFormRef.validate(async (valid) => {
        console.log(valid); //true or false
        if (!valid) return;
        //发起请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201)
          return this.$message.error("添加用户失败！");
        this.$message.success("添加用户成功！");
        //关闭对话框
        this.addDialogVisible = false;
        //重新获取用户数据
        this.getUserList();
      });
    },
    //修改对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      console.log(res);
      if (res.meta.status !== 200) return this.message.error(res.msg);
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //监听修改用户对话框关闭事件
    editDialogClosed() {
      //重置表单
      this.$refs.editFormRef.resetFields()
    },
    //修改表单预验证
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid); true or false
        if(!valid) return
        //发起put请求
        const {data: res} = await this.$http.put(`users/${this.editForm.id}`,
        {email: this.editForm.email, mobile: this.editForm.mobile})

        if(res.meta.status !== 200) return this.$message.error('更新用户信息失败！')

        //关闭对话框
        this.editDialogVisible = false
        //刷新数据列表
        this.getUserList()
        //成功提示
        this.$message.success('更新用户信息成功！')
      })
    },
    //通过ID删除用户
    async removeUserById(id) {
      //提示用户
     const confirmResult =await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult);
      if(confirmResult !== "confirm") {
        return this.$message.info('已取消删除')
      }
      // console.log("确认了删除");
      //TODO 发起delete请求删除用户
     const {data: res} = await this.$http.delete(`users/${id}`)
     if(res.meta.status !== 200) return this.$message.error('删除用户失败！')
     this.$message.success("删除用户成功")
     this.getUserList()
    }

  },
};
</script>

<style lang="less" scoped>
</style>