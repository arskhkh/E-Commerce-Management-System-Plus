<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            style="color: lightgreen"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: red" class="el-icon-error" v-else></i>
        </template>
        <!-- 一级二级三级 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="danger" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加商品分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
      >
        <!-- 添加内容 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="商品名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <!-- 级联选择器 -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改分类对话框 -->
      <el-dialog
        title="添加商品分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="editCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate(addCateForm.cat_id)"
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
    return {
      //请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //接收商品分类数据列表
      cateList: [],
      //接收总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          //将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          //将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "opt",
        },
      ],
      //是否显示添加商品分类对话框
      addCateDialogVisible: false,
      //是否显示修改商品分类对话框
      editCateDialogVisible: false,
      //添加商品分类对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      //添加商品分类校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入商品分类", trigger: "blur" },
        ],
      },
      //父级分类列表数据
      parentCateList: [],
      //级联选择器props配置对象
      cascaderProps: {
        expandTrigger: "hover",
        checkStrictly: true,
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //选中的父级分类的ID数组
      selectedKeys: [],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类信息
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("商品分类获取失败！");
      }
      console.log(res.data);
      //保存商品分类列表
      this.cateList = res.data.result;
      console.log(this.cateList);
      //保存总数
      this.total = res.data.total;
    },
    //监听每页显示信息条数的改变
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getCateList();
    },
    //监听页码的改变
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getCateList();
    },
    //点击按钮，显示添加分类对话框
    showAddCateDialog() {
      //先获取数据
      this.getParentCateList();
      //再显示对话框
      this.addCateDialogVisible = true;
    },
    //获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！");
      }
      // console.log(res.data);
      this.parentCateList = res.data;
      console.log(this.parentCateList);
    },
    //级联选择器选择项发生改变触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys);
      //判断是否选中
      //如果seslectedKeys数组中的length大于0，说明父级分类被选中
      //否则，说明没有选中任何父级分类
      //有选中父级分类，就要重置当前商品分类的ID和level
      //没有选中父级分类，当前商品分类的Id和level都是=0
      if (this.selectedKeys.length > 0) {
        //父级分类id,是selectedKeys数组的最后一项
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        //当前分类的等级,数组长度
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        //父级分类id,为0
        this.addCateForm.cat_pid = 0;
        //当前分类的等级,为0
        this.addCateForm.cat_level = 0;
        return;
      }
    },
    //点击确认，发起请求，添加商品分类
    async addCate() {
      console.log(this.addCateForm);
      const { data: res } = await this.$http.post(
        "categories",
        this.addCateForm
      );
      if (res.meta.status !== 201) {
        return this.$message.error("添加商品分类失败！");
      }
      this.$message.success("添加商品分类成功！");
      this.getCateList();
      this.addCateDialogVisible = false;
    },
    //取消，清空表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      (this.selectedKeys = []), (this.addCateForm.cat_level = 0);
      this.addCateForm.cat_pid = 0;
    },
    //显示修改分类对话框
    async showEditDialog(id) {
      //获取数据
      const { data: res } = await this.$http.get(`categories/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      console.log(res);
      this.addCateForm = res.data;
      this.editCateDialogVisible = true;
    },
    editCate(id) {
      console.log(id);
      //表单校验
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(`categories/${id}`, {
          cat_name: this.addCateForm.cat_name,
        });
        if (res.meta.status !== 200) {
          return this.$message.error("修改商品分类失败！");
        }
        this.$message.success("修改商品分类成功！");
        this.getCateList();
        this.editCateDialogVisible = false;
      });
    },
    //删除分类
    async removeCate(id) {
      //询问是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除！");
      }
      //删除
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.getCateList()
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>