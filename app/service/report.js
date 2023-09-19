const Service = require("egg").Service;

class ReportService extends Service {
	// async index() {
	//   const result = await this.app.mysql.select('category')
	//   return result
	// }
	/**
	 * 登录接口
	 * @param {*} query
	 */
	async getReportList(query) {
		const { pageNum, pageSize, reportType, keyword } = query;
		return new Promise(async (res, reject) => {
			try {
				let whereStr = `where reportType = ${reportType}`;
				if (keyword) {
					whereStr = `${whereStr} and reportName like '%${keyword}%'`;
				}
				const sql = `select * from report_list ${whereStr} limit ${
					pageNum * pageSize
				},${pageSize}`;
				const list = await this.app.mysql.query(sql);
				const sqlTotal = `SELECT COUNT(*) from report_list ${whereStr}`;
				const [{ "COUNT(*)": total }] = await this.app.mysql.query(sqlTotal);
				res({
					list,
					total,
				});
			} catch (e) {
				reject(e);
			}
		});
	}
}

module.exports = ReportService;
