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
			delayTask.map(async (i) => {
				await this.app.mysql.update(
					"subtask_list",
					{ status: 5 },
					{ where: { subtaskId: i.subtaskId } }
				);
				await this.app.mysql.update(
					"task_list",
					{ status: 5 },
					{ where: { taskId: i.parentId } }
				);
			});
		}

		const result = await this.app.mysql.select("task_list", {
			where: { status: 3 },
		});
		const delayMainTask = result.filter(
			(i) => i.finishTime < dayjs(Date().now)
		);
		if (delayMainTask.length) {
			delayMainTask.map(async (i) => {
				await this.app.mysql.update(
					"task_list",
					{ status: 5 },
					{ where: { taskId: i.taskId } }
				);
			});
		}
	}
}

module.exports = logTime;
