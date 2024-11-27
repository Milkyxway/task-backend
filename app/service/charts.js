const Service = require('egg').Service;

class ChartsService extends Service {
  getPieCharts(query) {
    const sqlStr = `select count(${query.type}) as value , ${query.type} as name from task_list where taskRegion = '${query.region}' group by ${query.type}`;
    return new Promise(async (resolve, reject) => {
      try {
        const list = await this.app.mysql.query(sqlStr);
        resolve(list);
      } catch (e) {
        reject(e);
      }
    });
  }

  getSectionTaskSort(query) {
    const sqlStr = `select leadOrg as name, count(leadOrg) as value from task_list where taskRegion = '${query.region}' group by leadOrg order by count(leadOrg) desc`;
    return new Promise(async (resolve, reject) => {
      try {
        const list = await this.app.mysql.query(sqlStr);
        resolve(list);
      } catch (e) {
        reject(e);
      }
    });
  }
  async getFinishProcess(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const statusTotal = await this.app.mysql.query(
          `select count(*) as statusTotal from task_list where status = ${query.status} and taskRegion = '${query.region}'`
        );
        const total = await this.app.mysql.query(
          `select count(*) as total from task_list where taskRegion = '${query.region}'`
        );
        resolve({
          statusTotal: statusTotal[0].statusTotal,
          total: total[0].total,
        });
      } catch (e) {
        reject(e);
      }
    });

    // console.log(statusTotal, total);
  }

  async getFinishRate(query) {
    return new Promise(async(resolve, reject) => {
      try {
        const sql = `select total.leadOrg,wc.完成数/total.总数 as rate, total.总数 as total from (select leadOrg, count(taskId) 总数 from task_list where taskRegion = '${query.region}' and leadOrg <> 0 group by leadOrg)total
left join
(select leadOrg, count(distinct taskId) 完成数 from task_list where status = 4 and taskRegion = '${query.region}' and leadOrg <> 0 group by leadOrg)wc 
on total.leadOrg = wc.leadOrg order by rate desc`
        const result = await this.app.mysql.query(sql)
        resolve(result)
      }catch(e) {
        reject(e)
      }
    })
  }
  
  statusProportion(query) {
		return new Promise(async (resolve, reject) => {
			try {
				const finishCount = await this.app.mysql.query(
					`select  count(distinct taskId) as value  from task_list where status in (4,6) and taskRegion = '${query.region}'`
				);
				const delayCount = await this.app.mysql.query(
					`select  count(distinct taskId) as value  from task_list where status in (5,7) and taskRegion = '${query.region}'`
				);
				const processCount = await this.app.mysql.query(
					`select  count(distinct taskId) as value  from task_list where status in (3) and taskRegion = '${query.region}'`
				);
				const totalCount = await this.app.mysql.query(
					`select  count(distinct taskId) as value  from task_list where taskRegion = '${query.region}'`
				);
				resolve({
					finishCount,
					delayCount,
					processCount,
					totalCount,
				});
			} catch (e) {
				reject(e);
			}
		});
	}
	
newTaskinMonth(query) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await this.app.mysql.query(
					`select * from task_list where taskRegion = '${query.region}' order by createTime desc limit 5`
				);
				resolve(result);
			} catch (e) {
				reject(e);
			}
		});
	}
	getDelayTasks(query) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await this.app.mysql
					.query(`select t.leadOrg, count(distinct s.parentId) as count from task_list t, subtask_list s
					where t.taskId = s.parentId and s.delayTimes is not null and t.taskRegion = '${query.region}' group by t.leadOrg`);
				resolve(result);
			} catch (e) {
				reject(e);
			}
		});
	}
}

module.exports = ChartsService;
