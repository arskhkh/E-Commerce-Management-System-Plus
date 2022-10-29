<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色 -->
      <el-button type="primary" @click="addDialogVisible = true"
        >添加角色</el-button
      >
      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
        <!-- 添加角色内容区域 -->
        <el-form
          :model="addRolesList"
          :rules="addRolesRules"
          ref="addRolesRef"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesList.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesList.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogClosed">取 消</el-button>
          <el-button type="primary" @click="addRoles()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 表格区域 -->
      <el-table :data="rolesList" stripe border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅栏布局 -->
            <el-row
              :class="['btborder', i1 === 0 ? 'tpborder' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightTag(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'tpborder', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightTag(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightTag(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogShow(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoles(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配权限" placement="top">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRightDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改角色对话框 -->
      <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%">
        <!-- 添加角色内容区域 -->
        <el-form
          :model="addRolesList"
          :rules="addRolesRules"
          ref="addRolesRef"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesList.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesList.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogClosed">取 消</el-button>
          <el-button type="primary" @click="editRolesInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改权限对话框 -->
      <el-dialog
        title="修改权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed"
      >
        <!-- 树形控件 -->
        <el-tree
          ref="treeRef"
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色列表数据
      rolesList: [],
      //是否显示添加对话框
      addDialogVisible: false,
      //是否显示修改对话框
      editDialogVisible: false,
      //是否显示修改权限对话框
      setRightDialogVisible: false,
      //添加角色数据
      addRolesList: {
        roleId: "",
        roleName: "",
        roleDesc: "",
      },
      //添加角色校验规则
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      //所有权限的数据
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName",
      },
      //默认选择的节点的ID数组
      defKeys: [],
      //保存请求用到的角色ID
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      // console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败！");
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    //添加角色
    addRoles() {
      //表单预校验
      this.$refs.addRolesRef.validate(async (valid) => {
        // console.log(valid); true or false
        const { data: res } = await this.$http.post("roles", this.addRolesList);
        // console.log(res);
        if (res.meta.status !== 201)
          return this.$message.error("添加角色失败!");
        this.$message.success("添加角色成功！");
        //刷新页面
        this.getRolesList();
        //关闭对话框
        this.addDialogVisible = false;
      });
    },
    //添加角色对话框关闭
    addDialogClosed() {
      //清空表单数据
      this.$refs.addRolesRef.resetFields();
      this.addDialogVisible = false;
    },
    //修改角色信息显示
    async editDialogShow(id) {
      //获取数据
      const { data: res } = await this.$http.get(`roles/${id}`);
      console.log(res);
      if (res.meta.status !== 200) return;
      this.addRolesList = res.data;
      // console.log(this.addRolesList);
      this.editDialogVisible = true;
    },
    //修改角色信息
    editRolesInfo() {
      this.$refs.addRolesRef.validate(async (valid) => {
        if (!valid) return;
        // 注意要把数据带上
        const { data: res } = await this.$http.put(
          "roles/" + this.addRolesList.roleId,
          {
            roleName: this.addRolesList.roleName,
            roleDesc: this.addRolesList.roleDesc,
          }
        );
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error("修改失败！");
        this.$message.success("修改成功！");
        this.getRolesList();
        this.editDialogVisible = false;
      });
    },
    //修改角色对话框关闭
    editDialogClosed() {
      //清空表单数据
      this.$refs.addRolesRef.resetFields();
      this.editDialogVisible = false;
    },
    //删除用户
    async deleteRoles(id) {
      //提示用户
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      //发起请求
      const { data: res } = await this.$http.delete(`roles/${id}`);
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("删除角色失败！");
      this.$message.success("删角色成功");
      this.getRolesList();
    },
    //移除权限的标签
    async removeRightTag(role, id) {
      //提示用户
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      // console.log(role);
      // console.log(id);
      //发起请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除权限失败！");
      //避免刷新页面，采用数据赋值
      role.children = res.data;
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      //获取权限数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }
      //把数据保存到rightList[]
      this.rightsList = res.data;
      // console.log(this.rightsList);
      //递归获取三级节点的ID
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    //递归获取方法
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    //监听修改权限对话框关闭
    setRightDialogClosed() {
      //清空保存ID节点的数组
      this.defKeys = [];
    },
    //点击确认为角色分配权限
    async allotRights() {
      //拿到ID，合并成新数组
      const keys = [
        //选中的
        ...this.$refs.treeRef.getCheckedKeys(),
        //半选(一级二级)
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      // console.log(keys);
      //用逗号拼接成新的字符串
      const idStr = keys.join(",");
      // console.log(idStr);
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.$message.success("分配权限成功！");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.btborder {
  border-bottom: 1px solid #eee;
}

.tpborder {
  border-top: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>