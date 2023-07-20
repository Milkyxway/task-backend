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
		console.log("16:00到了");
		const list = await this.app.mysql.select("subtask_list", {
			where: { status: 3 },
		});
		const delayTask = list.filter((i) => i.finishTime < dayjs(Date().now));

		if (delayTask.length) {
			console.log(delayTask);
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
	}
}

module.exports = logTime;
