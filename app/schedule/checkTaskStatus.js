'use strict';

const Subscription = require('egg').Subscription;
const dayjs = require('dayjs');

class logTime extends Subscription {
  static get schedule() {
    return {
      // cron: "0 0 17 * * ?",
			 interval: '30s',
      type: 'worker',
    };
  }

  async subscribe() {
    const statusWeightMap = {
      1: -1, // 待确认权重5
      2: 0, // 待调整
      3: 3, // 进行中
      4: 7, // 已完成
      5: 1, // 已延期
      6: 6, // 已提交
      7: 2, // 延期后再进行
    };
    const list = await this.app.mysql.query(`select * from subtask_list where status in (3, 7)`);
    const delayTask = list.filter(i => dayjs(i.finishTime).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD'));
    if (delayTask.length) {
      let delayTimes = 1;
      delayTask.map(async i => {
        if (i.delayTimes !== null) {
          delayTimes = i.delayTimes + 1;
        }
        await this.app.mysql.update(
          'subtask_list',
          { status: 5, delayTimes, updateTime: new Date() },
          { where: { subtaskId: i.subtaskId } }
        );
        await this.app.mysql.update(
          'task_list',
          {
            status: 5,
            updateTime: new Date(),
            statusWeight: statusWeightMap[5],
          },
          { where: { taskId: i.parentId } }
        );
      });
    }

    const sql = 'select * from task_list where status in (3,7) and resolveType is null';
    const result = await this.app.mysql.query(sql);
    const delayMainTask = result.filter(
      i => dayjs(i.finishTime).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD')
    );
    if (delayMainTask.length) {
      let delayTimes = 1;
      delayMainTask.map(async i => {
        if (i.delayTimes !== null) {
          delayTimes = i.delayTimes + 1;
        }
        await this.app.mysql.update(
          'task_list',
          {
            status: 5,
            delayTimes,
            updateTime: new Date(),
            statusWeight: statusWeightMap[5],
          },
          { where: { taskId: i.taskId } }
        );
      });
    }
  }


}

module.exports = logTime;
