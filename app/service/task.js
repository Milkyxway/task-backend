const Service = require("egg").Service;
// const db = this.app.mysql.get('')
class TaskService extends Service {
	async index() {
		const result = await this.app.mysql.select("category");
		return result;
	}

	// 获取任务列表
	async getTasksByQuery(params) {
		const { pageNum, pageSize } = params;
		const [{ "COUNT(*)": total }] = await this.app.mysql.query(
			"SELECT COUNT(*) from task_list"
		);
		// const list = await this.app.mysql.query(`SELECT * from task_list`);
		const list = await this.selectByCondition({
			// where: { status, category },
			limit: +pageSize,
			offset: +pageNum * pageSize,
		});
		return {
			total,
			list,
		};
	}

	/**
	 * 增加任务
	 * @param {*} query
	 */
	async addTask(query) {
		// const Literal = this.app.mysql.literals.Literal;
		// const taskId = new Literal("INT()");
		console.log(query);
		await this.app.mysql.insert("task_list", { ...query });
	}

	/**
	 * 修改任务
	 * @param {*} query
	 */
	async updateTask(query) {
		await this.app.mysql.update("task_list", { ...query });
	}

	/**
	 * 删除任务
	 * @param {*} query
	 */
	async deleteTask(taskId) {
		await this.app.mysql.delete("task_list", { taskId });
	}

	async selectByCondition(options = {}) {
		const list = await this.app.mysql.select("task_list", options);
		return list;
	}
}

module.exports = TaskService;
