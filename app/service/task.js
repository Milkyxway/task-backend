const Service = require('egg').Service;

const statusWeightMap = {
  1: -1, // 待确认权重5
  2: 0, // 待调整
  3: 3, // 进行中
  4: 7, // 已完成
  5: 1, // 已延期
  6: 6, // 已提交
  7: 2, // 延期后再进行
};
class TaskService extends Service {
  async index() {
    const result = await this.app.mysql.select('category');
    return result;
  }

  isEmptyObj(obj) {
    for (const key in obj) {
      if (key) {
        return false;
      }
    }
    return true;
  }

  handleQueryToSqlStr(rest, assistOrg, createTime, keyword) {
    const notEmptyParams = {};
    let whereStr = '';
    Object.keys(rest).map(i => {
      if (rest[i] !== null) {
        notEmptyParams[i] = rest[i];
      }
    });
    Object.keys(notEmptyParams).map((i, index) => {
      if (index !== 0) {
        whereStr = whereStr + ` && ${i} = '${notEmptyParams[i]}'`;
      } else {
        whereStr = `WHERE ${i} = '${notEmptyParams[i]}'`;
      }
    });
    const commonSql = (key, val) => {
      return this.isEmptyObj(notEmptyParams)
        ? `where ${key} like '%${val}%'`
        : `${whereStr} and ${key} like '%${val}%'`;
    };

    if (assistOrg) {
      whereStr = commonSql('assistOrg', assistOrg);
    }
    if (createTime) {
      whereStr = this.isEmptyObj(notEmptyParams)
        ? `where createTime between '${createTime[0]}' and '${createTime[1]}'`
        : `${whereStr} and createTime between '${createTime[0]}' and '${createTime[1]}'`;
    }
    if (keyword) {
      whereStr = this.isEmptyObj(notEmptyParams)
        ? `where (taskContent like '%${keyword}%' or sourceDesc like '%${keyword}%)'`
        : `${whereStr} and (taskContent like '%${keyword}%' or sourceDesc like '%${keyword}%')`;
    }
    return whereStr;
  }

  // 获取任务列表
  async getTasksByQuery(params) {
    const { pageNum, pageSize, keyword, assistOrg, createTime, role, ...rest } =
			params;
    let whereStr = this.handleQueryToSqlStr(
      rest,
      assistOrg,
      createTime,
      keyword
    );

    let sqlStr = `select * from task_list ${whereStr} order by updateTime desc limit ${
      pageNum * pageSize
    },${pageSize}`;
    if (['leader', 'section', 'admin'].includes(role)) {
      // 领导视角按照任务状态优先排序
      sqlStr = `select * from task_list ${whereStr} order by statusWeight asc, updateTime desc limit ${
        pageNum * pageSize
      },${pageSize}`;
    }
    if (role === 'employee') {
      whereStr = whereStr
        ? `${whereStr} and taskSource = 1 or taskSource = 2`
        : 'where taskSource = 1 or taskSource = 2';
      sqlStr = `select * from task_list ${whereStr} order by updateTime desc limit ${
        pageNum * pageSize
      },${pageSize}`;
    }
    const list = await this.app.mysql.query(sqlStr);

    const [{ 'COUNT(*)': total }] = await this.app.mysql.query(
      `SELECT COUNT(*) from task_list ${whereStr}`
    );
    return this.setData(list).then(res => {
      return {
        total,
        list,
      };
    });
  }

  setData(list) {
    return new Promise((resolve, reject) => {
      let count = 0;
      if (list.length) {
        list.map(async i => {
          const children = await this.getChildTasks(i.taskId);
          const leadComment = await this.getLeadComment(i.taskId);
          i.children = children;
          i.leadComment = leadComment;
          count === list.length - 1 && resolve();
          count++;
        });
      } else {
        resolve();
      }
    });
  }

  getLeadComment(taskId) {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await this.app.mysql.query(
          `select * from comment_list where taskId = ${taskId}`
        );
        resolve(
          list
            .filter(i => i.comment)
            .map(i => `${i.username}: ${i.comment}`)
            .join('；')
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
	 * 获取关注列表
	 * @param {*} query
	 * @return
	 */
  getFocusList(query) {
    const { pageNum, pageSize } = query;
    return new Promise(async (resolve, reject) => {
      try {
        const sqlStr = `select * from task_list where focusBy like '%${
          query.username
        }%' order by updateTime desc limit ${pageNum * pageSize},${pageSize}`;
        const list = await this.app.mysql.query(sqlStr);
        const [{ 'COUNT(*)': total }] = await this.app.mysql.query(
          `SELECT COUNT(*) from task_list where focusBy like '%${query.username}%'`
        );
        this.setData(list).then(res => {
          resolve({
            list,
            total,
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  getChildTasks(parentId) {
    return new Promise(async (resolve, reject) => {
      const childTasks = this.selectByCondition(
        { where: { parentId } },
        'subtask_list'
      );
      resolve(childTasks);
    });
  }

  /**
	 * 增加任务
	 * @param {*} query
	 */
  async addTask(query) {
    await this.app.mysql.insert('task_list', {
      ...query,
      status: 1,
      createTime: new Date(),
      updateTime: new Date(),
    });
  }

  async addBatchTasks(list) {
    return new Promise((resolve, reject) => {
      let counter = 0;
      list.map(async i => {
        try {
          await this.app.mysql.insert('task_list', {
            ...i,
            status: 1,
            createTime: new Date(),
            updateTime: new Date(),
          });
          counter === list.length - 1 && resolve();
          counter++;
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  /**
	 * 获取任务详情
	 * @param {*} taskId
	 * @param query
	 */
  async detail(query) {
    const detail = await this.app.mysql.select('task_list', {
      where: query,
    });

    return new Promise(async (resolve, reject) => {
      if (detail.length) {
        this.setData(detail).then(res => {
          resolve(detail[0]);
        });
      } else {
        reject();
      }
    });
  }

  /**
	 * 修改任务
	 * @param {*} query
	 */
  async updateTask(query) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.app.mysql.update(
          'task_list',
          {
            ...query,
            updateTime: new Date(),
            statusWeight: statusWeightMap[query.status],
          },
          {
            where: {
              taskId: query.taskId,
            },
          }
        );
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
	 * 删除任务
	 * @param {*} query
	 */
  async deleteTask(query) {
    await this.app.mysql.delete('task_list', { taskId: query.taskId });
    if (query.children) {
      await this.app.mysql.delete('subtask_list', { parentId: query.taskId });
    }
  }

  /**
	 * 子任务置为完成
	 * @param {*} query
	 */
  async subTaskSetFinish(query) {
    // 操作的是子任务 每一条子任务修改状态 所有子任务都完成后把父任务置为完成
    await this.app.mysql.update(
      'subtask_list',
      { status: 4, updateTime: new Date(), statusWeight: statusWeightMap[4] },
      { where: { subtaskId: query.subtaskId } }
    );

    const sqlStr = `select * from task_list where parentId = ${query.parentId} order by statusWeight asc`;
    const subtasks = await this.app.mysql.query(sqlStr);
    this.updateTask({ status: subtasks[0].status, taskId: query.parentId });
  }

  /**
	 * 父任务置为完成
	 * @param {*} query
	 */
  async setMainTaskFinish(query) {
    await this.updateTaskStatus(query.taskId, 4);
    if (query.children.length) {
      query.children.map(async i => {
        await this.app.mysql.update(
          'subtask_list',
          {
            status: 4,
            updateTime: new Date(),
            statusWeight: statusWeightMap[4],
          },
          {
            where: {
              parentId: query.taskId,
            },
          }
        );
      });
    }
  }
  /**
	 * 置为完成
	 * @param {*} query
	 */
  async finishTask(query) {
    if (query.parentId) {
      this.subTaskSetFinish(query);
    } else {
      this.setMainTaskFinish(query);
    }
  }

  /**
	 * 更新任务
	 * @param {*} taskId
	 * @param {*} status
	 */
  async updateTaskStatus(taskId, status) {
    await this.app.mysql.update(
      'task_list',
      { status, updateTime: new Date(), statusWeight: statusWeightMap[status] },
      { where: { taskId } }
    );
  }

  /**
	 * 任务申诉 状态置为 待调整
	 * @param {*} query
	 */
  async appeal(query) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.updateTask(query);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
	 * 查询跟我相关的任务
	 * @param {*} query
	 * @return
	 */
  async queryMyTask(query) {
    const {
      orgnizationId,
      pageNum,
      pageSize,
      assistOrg,
      createTime,
      keyword,
      role,
      manageParts,
      ...rest
    } = query;
    let whereStr = this.handleQueryToSqlStr(
      rest,
      assistOrg,
      createTime,
      keyword
    );

    if (role === 'sub-leader') {
      // 分管领导看到自己管辖的部门
      whereStr = whereStr
        ? `${whereStr} and (leadOrg in (${manageParts}) or assistOrg in (${manageParts}))`
        : `where (leadOrg in (${manageParts}) or assistOrg in (${manageParts}))`;
    } else {
      // 部门角色看到自己牵头或者协办
      whereStr = whereStr
        ? `${whereStr} and leadOrg = ${query.orgnizationId} or CONCAT(",",assistOrg,",") like '%,${query.orgnizationId},%'`
        : `where leadOrg = ${query.orgnizationId} or CONCAT(",",assistOrg,",") like '%,${query.orgnizationId},%'`;
    }

    const sqlList = `SELECT * from task_list ${whereStr} order by updateTime desc limit ${
      pageNum * pageSize
    },${pageSize}`;
    const sqlTotal = `SELECT COUNT(*) from task_list ${whereStr}`;

    const list = await this.app.mysql.query(sqlList);
    const [{ 'COUNT(*)': total }] = await this.app.mysql.query(sqlTotal);

    return this.setData(list).then(res => {
      return {
        total,
        list,
        
      };
    });
  }

  async addChildTask(query) {
    const { list, taskId } = query;
    list.sort((a,b) => b.finishTime -a.finishTime)
    const maxDate = list[0].finishTime
    await this.app.mysql.insert('subtask_list', list);
    await this.updateTask({
      status: 3,
      finishTime: maxDate,
      taskId,
    });
  }

  async updateSubTask(query) {
    const { subtaskId, parentId, status } = query;
    await this.app.mysql.update(
      'subtask_list',
      {
        ...query,
        updateTime: new Date(),
        statusWeight: statusWeightMap[query.status],
      },
      {
        where: { subtaskId },
      }
    );
    
    const list = await this.app.mysql.query(`select * from subtask_list where parentId = ${parentId} order by statusWeight asc`);
    if (list.length) {
      const parentStatus = list[0].status
      this.updateTaskStatus(parentId, parentStatus);
    }
  }

  async deleteSubTask(query) {
    await this.app.mysql.delete('subtask_list', { ...query });
  }


  async setFocus(query) {
    await this.app.mysql.update(
      'task_list',
      {
        focusBy: query.focusBy,
      },
      {
        where: {
          taskId: query.taskId,
        },
      }
    );
  }

  /**
	 * 增加领导批注
	 * @param {*} data
	 * @return
	 */
  addLeadComment(data) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.app.mysql.insert('comment_list', {
          ...data,
          createTime: new Date(),
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
	 * 修改领导批注
	 * @param {*} data
	 * @return
	 */
  updateLeadComment(data) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.app.mysql.update(
          'comment_list',
          {
            ...data,
          },
          {
            where: {
              taskId: data.taskId,
            },
          }
        );
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  async selectByCondition(options = {}, tableName = 'task_list') {
    const list = await this.app.mysql.select(tableName, options);
    return list;
  }

  /**
   * 导出全量的数据成excel格式
   * @param {*} data
   * @param params
   * @return
   */
  exportAsExcel(params) {
    return new Promise(async (resolve, reject) => {
      try {
        const { keyword, assistOrg, createTime, ...rest } =
		params;
        const whereStr = this.handleQueryToSqlStr(
          rest,
          assistOrg,
          createTime,
          keyword
        );
        const sqlStr = `select * from task_list ${whereStr} order by updateTime desc`;
        const list = await this.app.mysql.query(sqlStr);
        this.setData(list).then(() => {
          resolve({
            list,
          });
        });

      } catch (e) {
        reject(e);
      }
    });
  }

/**
 * 获取部门列表
 * @param {*} query 
 * @returns 
 */
  getOrgList(query) {
    return new Promise(async(resolve, reject) => {
      try {
        const sql = `select * from org_list where region = '${query.region}'`
        const result = await this.app.mysql.query(sql)
        resolve(result)
      } catch(e) {
        reject(e)
      }
    })
  }


  /**
   * 修改部门名称
   * @param {*} query 
   * @returns 
   */
  updateSection(query) {
    return new Promise(async(resolve, reject) => {
      try {
        await this.app.mysql.update(
          'org_list',
          {
            ...query
          },
          {
            where: {
              sectionId: query.sectionId,
            },
          }
        );
        resolve()
      } catch(e) {
        reject(e)
      }
    })
  }

  /**
   * 增加部门
   * @param {*} query 
   * @returns 
   */
  addSection(query) {
    return new Promise(async(resolve, reject) => {
      try {
        await this.app.mysql.insert('org_list', query);
        resolve();
      } catch(e) {
        reject(e)
      }
    })
  }

}

module.exports = TaskService;
