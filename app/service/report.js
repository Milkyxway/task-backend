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
		// const user = await this.app.mysql.select("user", {
		// 	where: {
		// 		username: query.username,
		// 	},
		// });
		// return new Promise((res, reject) => {
		// 	if (user) {
		// 		if (query.password === user[0].password) {
		// 			const { password, ...rest } = user[0];
		// 			res({
		// 				userInfo: { ...rest }, // 不把密码返回给前端
		// 			});
		// 		}
		// 	}
		// 	reject();
		// });
	}
}

module.exports = ReportService;
