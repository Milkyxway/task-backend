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
}

module.exports = ChartsService;
