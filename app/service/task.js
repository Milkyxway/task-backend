const Service = require("egg").Service;
const dayjs = require("dayjs");
class TaskService extends Service {
	async index() {
		const result = await this.app.mysql.select("category");
		return result;
	}

	isEmptyObj(obj) {
		for (let key in obj) {
			if (key) {
				return false;
			}
		}
		return true;
	}

	// 获取任务列表
	async getTasksByQuery(params) {
		const { pageNum, pageSize, keyword, assistOrg, createTime, ...rest } =
			params;
		let notEmptyParams = {};
		let whereStr = "";
		Object.keys(rest).map((i) => {
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
			whereStr = commonSql("assistOrg", assistOrg);
		}
		if (createTime) {
			whereStr = commonSql("createTime", createTime);
		}
		if (keyword) {
			whereStr = commonSql("taskContent", keyword);
		}

		let list = await this.app.mysql.query(
			`select * from task_list ${whereStr} order by updateTime desc limit ${
				pageNum * pageSize
			},${pageSize}`
		);

		const [{ "COUNT(*)": total }] = await this.app.mysql.query(
			`SELECT COUNT(*) from task_list ${whereStr}`
		);
		return this.setData(list).then((res) => {
			return {
				total,
				list,
			};
		});
	}

	setData = (list) => {
		return new Promise((resolve, reject) => {
			let count = 0;
			if (list.length) {
				list.map(async (i) => {
					const children = await this.getChildTasks(i.taskId);
					i.children = children;
					count === list.length - 1 && resolve();
					count++;
				});
			} else {
				resolve();
			}
		});
	};

	getChildTasks = (parentId) => {
		return new Promise(async (resolve, reject) => {
			const childTasks = this.selectByCondition(
				{ where: { parentId } },
				"subtask_list"
			);
			resolve(childTasks);
		});
	};

	/**
	 * 增加任务
	 * @param {*} query
	 */
	async addTask(query) {
		await this.app.mysql.insert("task_list", {
			...query,
			status: 1,
			createTime: new Date(),
			updateTime: new Date(),
		});
	}

	/**
	 * 获取任务详情
	 * @param {*} taskId
	 */
	async detail(query) {
		const detail = await this.app.mysql.select("task_list", {
			where: query,
		});

		return new Promise(async (resolve, reject) => {
			if (detail.length) {
				this.setData(detail).then((res) => {
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
		await this.app.mysql.update("task_list", query, {
			where: {
				taskId: query.taskId,
			},
		});
	}

	/**
	 * 删除任务
	 * @param {*} query
	 */
	async deleteTask(query) {
		await this.app.mysql.delete("task_list", { taskId: query.taskId });
		if (query.children) {
			await this.app.mysql.delete("subtask_list", {
				where: { parentId: query.taskId },
			});
		}
	}

	/**
	 * 子任务置为完成
	 * @param {*} query
	 */
	async subTaskSetFinish(query) {
		// 操作的是子任务 每一条子任务修改状态 所有子任务都完成后把父任务置为完成
		await this.app.mysql.update(
			"subtask_list",
			{ status: 4 },
			{ where: { subtaskId: query.subtaskId } }
		);

		const allSubTasks = await this.selectByCondition(
			{ where: { parentId: query.parentId } },
			"subtask_list"
		);

		const allFinishSubTask = await this.selectByCondition(
			{ where: { status: 4, parentId: query.parentId } },
			"subtask_list"
		);
		if (allFinishSubTask.length === allSubTasks.length) {
			this.updateTaskStatus(query.parentId, 4);
		}
	}

	/**
	 * 父任务置为完成
	 * @param {*} query
	 */
	async setMainTaskFinish(query) {
		await this.updateTaskStatus(query.taskId, 4);
		if (query.children.length) {
			query.children.map(async (i) => {
				await this.app.mysql.update(
					"subtask_list",
					{
						status: 4,
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
	 * 设置任务状态为已延期
	 */
	setTaskDelay() {
		const list = this.selectByCondition({ where: { status: 3 } });
		const delayTask = list.filter((i) => i.finishTime < new Date());
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
	}

	async updateTaskStatus(taskId, status) {
		await this.app.mysql.update(
			"task_list",
			{ status, updateTime: new Date() },
			{ where: { taskId } }
		);
	}

	/**
	 * 任务申诉 状态置为 待调整
	 * @param {*} query
	 */
	async appeal(query) {
		this.updateTaskStatus(query.taskId, 2);
	}

	/**
	 * 查询跟我相关的任务
	 * @param {*} query
	 * @returns
	 */
	async queryMyTask(query) {
		const { orgnizationId, pageNum, pageSize } = query;
		let sqlList = `SELECT * from task_list where leadOrg = ${
			query.orgnizationId
		} or assistOrg like '%${
			query.orgnizationId
		}%' order by updateTime desc limit ${pageNum * pageSize},${pageSize}`;
		let sqlTotal = `SELECT COUNT(*) from task_list where leadOrg = ${orgnizationId} or assistOrg like '%${orgnizationId}%'`;

		const list = await this.app.mysql.query(sqlList);
		const [{ "COUNT(*)": total }] = await this.app.mysql.query(sqlTotal);

		return this.setData(list).then((res) => {
			return {
				total,
				list,
			};
		});
	}

	async addChildTask(query) {
		const { list, taskId } = query;
		const last = list.length - 1;
		await this.app.mysql.insert("subtask_list", list);
		await this.app.mysql.update(
			"task_list",
			{
				updateTime: new Date(),
				status: 3,
				finishTime: list[last].finishTime,
			},
			{ where: { taskId } }
		);
		// this.updateTaskStatus(query.taskId, 3); // 任务拆分即进入进行中
	}

	async updateSubTask(query) {
		let count = 0;
		const { taskId, list } = query;
		list.map(async (i) => {
			await this.app.mysql.update("subtask_list", i, {
				where: { subtaskId: i.subtaskId },
			});
			count++;
			if (count === list.length - 1) {
				this.updateTaskStatus(taskId, 3);
			}
		});
	}

	async selectByCondition(options = {}, tableName = "task_list") {
		const list = await this.app.mysql.select(tableName, options);
		return list;
	}
}

module.exports = TaskService;
