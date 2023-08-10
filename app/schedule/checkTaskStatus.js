"use strict";

const Subscription = require("egg").Subscription;
const dayjs = require("dayjs");

class logTime extends Subscription {
	static get schedule() {
		return {
			cron: "0 0 16 * * ?",
			// interval: "30s",
			type: "worker",
		};
	}

	async subscribe() {
		const list = await this.app.mysql.select("subtask_list", {
			where: { status: 3 },
		});
		const delayTask = list.filter((i) => i.finishTime < dayjs(Date().now));
		if (delayTask.length) {
			let delayTimes = 1;
			delayTask.map(async (i) => {
				if (i.delayTimes !== null) {
					delayTimes = i.delayTimes + 1;
				}
				await this.app.mysql.update(
					"subtask_list",
					{ status: 5, delayTimes, updateTime: new Date() },
					{ where: { subtaskId: i.subtaskId } }
				);
				await this.app.mysql.update(
					"task_list",
					{ status: 5, updateTime: new Date() },
					{ where: { taskId: i.parentId } }
				);
			});
		}

		const sql = `select * from task_list where status = 3 and resolveType = null`;
		const result = await this.app.mysql.query(sql);
		const delayMainTask = result.filter(
			(i) => i.finishTime < dayjs(Date().now)
		);
		if (delayMainTask.length) {
			let delayTimes = 1;
			delayMainTask.map(async (i) => {
				if (delayTimes !== null) {
					delayTimes = i.delayTimes + 1;
				}
				await this.app.mysql.update(
					"task_list",
					{ status: 5, delayTimes, updateTime: new Date() },
					{ where: { taskId: i.taskId } }
				);
			});
		}
	}
}

module.exports = logTime;
