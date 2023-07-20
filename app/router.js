"use strict";

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
	const { router, controller } = app;
	router.get("/", controller.home.index);

	/**
	 * 任务列表增删改查
	 */
	router.post("/api/task/list", controller.task.query);
	router.post("/api/task/add", controller.task.add);
	router.delete("/api/task/delete", controller.task.delete);
	router.put("/api/task/update", controller.task.update);
	router.put("/api/task/finish", controller.task.setFinish);
	router.post("/api/task/detail", controller.task.detail);
	router.post("/api/task/appeal", controller.task.appeal);
	router.post("/api/task/mine", controller.task.myTask);
	router.post("/api/subtask/add", controller.task.addChildTask);
	router.post("/api/subtask/update", controller.task.updateSubTask);

	router.post("/api/login", controller.role.login);
	router.post("/api/modifypwd", controller.role.modifypwd);
};
